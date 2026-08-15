import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  X,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankerId?: string;
}

export const ReconciliationModal: React.FC<ReconciliationModalProps> = ({
  isOpen,
  onClose,
  bankerId,
}) => {
  const { bankers, settleBankerCash, formatMoney, getCurrencySymbol } = useSusu();

  const [selectedBankerId, setSelectedBankerId] = useState(bankerId || bankers[0]?.id || '');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectedBanker = bankers.find((b) => b.id === selectedBankerId);

  const netCashDue = selectedBanker
    ? Math.max(0, selectedBanker.collectedToday - selectedBanker.withdrawnToday)
    : 0;

  useEffect(() => {
    if (bankerId) {
      setSelectedBankerId(bankerId);
    }
  }, [bankerId, isOpen]);

  useEffect(() => {
    if (selectedBanker) {
      setCashReceived(Math.max(0, selectedBanker.collectedToday - selectedBanker.withdrawnToday));
    }
  }, [selectedBankerId, selectedBanker]);

  if (!isOpen) return null;

  const discrepancy = Number(cashReceived || 0) - netCashDue;
  const isBalanced = Math.abs(discrepancy) < 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedBanker) {
      setError('Please select a banker collector');
      return;
    }

    try {
      settleBankerCash(selectedBanker.id, Number(cashReceived), notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to settle banker cash');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-2xl max-w-lg w-full shadow-2xl border border-[#EAE7DC] overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#383B2B] px-6 py-4 text-white flex items-center justify-between border-b border-[#4A4D3A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#8E9775]/20 border border-[#8E9775]/40 flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#8E9775]" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-[#F9F8F4]">End-of-Day Banker Reconciliation</h2>
              <p className="text-xs text-[#D8D5C8]">Vault physical cash settlement & shift sign-off</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#C27D50]/15 border border-[#C27D50]/30 text-[#9A5025] text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C27D50] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Banker */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Select Mobile Banker / Collector
            </label>
            <select
              value={selectedBankerId}
              onChange={(e) => setSelectedBankerId(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
            >
              {bankers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.routeName} ({b.status === 'reconciled' ? 'Already Reconciled' : 'Shift Open'})
                </option>
              ))}
            </select>
          </div>

          {/* Breakdown Ledger Card */}
          {selectedBanker && (
            <div className="bg-white p-4 rounded-xl border border-[#EAE7DC] space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#EAE7DC]">
                <span className="text-[#7A7A65] font-medium">Assigned Route:</span>
                <span className="font-bold text-[#3A3D2C]">{selectedBanker.routeName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#8E9775]/10 p-2.5 rounded-lg border border-[#8E9775]/20">
                  <span className="text-[#7A7A65] text-[11px] block flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5 text-[#5A5E46]" />
                    Total Inflow Collected
                  </span>
                  <span className="text-sm font-extrabold text-[#5A5E46] font-mono">
                    {formatMoney(selectedBanker.collectedToday)}
                  </span>
                </div>

                <div className="bg-[#C27D50]/10 p-2.5 rounded-lg border border-[#C27D50]/20">
                  <span className="text-[#7A7A65] text-[11px] block flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#C27D50]" />
                    Disbursed Payouts
                  </span>
                  <span className="text-sm font-extrabold text-[#C27D50] font-mono">
                    {formatMoney(selectedBanker.withdrawnToday)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAE7DC] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#7A7A65] uppercase font-bold block">
                    Net Physical Cash Due to Vault
                  </span>
                  <span className="text-xl font-extrabold text-[#3A3D2C] font-display">
                    {formatMoney(netCashDue)}
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAE7DC] text-[#5A5A40] font-semibold">
                  {selectedBanker.assignedMemberCount} Members
                </span>
              </div>
            </div>
          )}

          {/* Cash Received by Admin */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Physical Cash Count Received by Vault ({getCurrencySymbol()})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[#7A7A65] font-bold text-lg">
                {getCurrencySymbol()}
              </span>
              <input
                type="number"
                step="any"
                value={cashReceived}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                required
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xl font-bold font-display text-[#3A3D2C] focus:ring-2 focus:ring-[#8E9775] focus:outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Discrepancy Indicator */}
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            isBalanced
              ? 'bg-[#8E9775]/15 border-[#8E9775]/30 text-[#3A3D2C]'
              : discrepancy > 0
              ? 'bg-[#EAE7DC] border-[#D8D5C8] text-[#3A3D2C]'
              : 'bg-[#C27D50]/15 border-[#C27D50]/30 text-[#9A5025]'
          }`}>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <CheckCircle2 className="w-4 h-4 text-[#5A5E46]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#C27D50]" />
              )}
              <span className="font-semibold">
                {isBalanced
                  ? 'Physical Cash Exactly Matches Digital Ledger (100% Balanced)'
                  : discrepancy > 0
                  ? `Surplus Cash: +${formatMoney(discrepancy)}`
                  : `Cash Shortfall: ${formatMoney(discrepancy)}`}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Vault Sign-off Notes / Envelope Tag
            </label>
            <input
              type="text"
              placeholder="e.g. Verified by Head Cashier. Envelope #883."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EAE7DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D8D5C8] text-[#5A5A40] text-xs font-semibold hover:bg-[#EAE7DC]/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#383B2B] hover:bg-[#2A2B20] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#8E9775]" />
              <span>Confirm & Settle Shift ({formatMoney(cashReceived)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
