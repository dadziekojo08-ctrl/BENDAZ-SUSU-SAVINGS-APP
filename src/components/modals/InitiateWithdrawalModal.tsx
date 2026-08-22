import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Member, PaymentMethod, PayoutMode } from '../../types';
import {
  X,
  ArrowUpRight,
  User,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Coins,
  Store,
  Info,
} from 'lucide-react';

interface InitiateWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMemberId?: string;
}

export const InitiateWithdrawalModal: React.FC<InitiateWithdrawalModalProps> = ({
  isOpen,
  onClose,
  initialMemberId,
}) => {
  const {
    members,
    bankers,
    activeBankerId,
    currentUser,
    initiateWithdrawal,
    formatMoney,
    getCurrencySymbol,
  } = useSusu();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId || '');
  const [selectedBankerId, setSelectedBankerId] = useState(activeBankerId || bankers[0]?.id || '');
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('Flexible Savings Withdrawal');
  const [payoutMode, setPayoutMode] = useState<PayoutMode>('BANKER_CASH_HANDOVER');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  useEffect(() => {
    if (initialMemberId) {
      setSelectedMemberId(initialMemberId);
      const m = members.find((mem) => mem.id === initialMemberId);
      if (m) {
        setAmount(m.totalBalance);
        setSelectedBankerId(m.assignedBankerId || activeBankerId);
      }
    } else if (members.length > 0 && !selectedMemberId) {
      const firstWithBalance = members.find((m) => m.totalBalance > 0) || members[0];
      setSelectedMemberId(firstWithBalance.id);
      setAmount(firstWithBalance.totalBalance);
      setSelectedBankerId(firstWithBalance.assignedBankerId || activeBankerId);
    }
  }, [initialMemberId, isOpen, members, activeBankerId, selectedMemberId]);

  if (!isOpen) return null;

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      (m.accountNumber && m.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.locationStall.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMember = (m: Member) => {
    setSelectedMemberId(m.id);
    setAmount(m.totalBalance);
    setSelectedBankerId(m.assignedBankerId || activeBankerId);
    setSearchQuery('');
  };

  const handlePercentageClick = (pct: number) => {
    if (selectedMember) {
      const calculated = Math.round((selectedMember.totalBalance * pct) / 100);
      setAmount(calculated);
    }
  };

  const fee = 0; // Strict Business Rule: No withdrawal charges!
  const netPayout = amount || 0;
  const remainingBalance = selectedMember ? Math.max(0, selectedMember.totalBalance - (amount || 0)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedMember) {
      setError('Please select a saver / member');
      return;
    }

    if (!amount || amount <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }

    if (amount > selectedMember.totalBalance) {
      setError(`Cannot withdraw more than available savings balance of ${formatMoney(selectedMember.totalBalance)}`);
      return;
    }

    try {
      initiateWithdrawal({
        memberId: selectedMember.id,
        bankerId: selectedBankerId || activeBankerId,
        amount: Number(amount),
        reason,
        payoutMode,
        paymentMethod,
        notes,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate withdrawal');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-800 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-800 px-6 py-4 text-white flex items-center justify-between border-b border-amber-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <ArrowUpRight className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white font-display">Initiate Member Withdrawal</h2>
              <p className="text-xs text-amber-100/80">Flexible Anytime Payout • Requires Admin Approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Policy Notice Bar */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-900">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Zero Withdrawal Charges</strong> (Office fee paid on Day 1). Banker initiates request; Admin Bernard must approve before payout.
          </span>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 inline-flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Select Saver / Member</span>
            </label>

            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search member by name, stall or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none text-slate-800 font-medium"
              />
            </div>

            {searchQuery && (
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 mb-2 shadow-md">
                {filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMember(m)}
                    className="w-full text-left p-2 hover:bg-slate-50 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{m.name}</span>
                      <span className="text-slate-500 text-[11px] block">{m.locationStall}</span>
                    </div>
                    <span className="font-mono text-emerald-700 font-bold">
                      Savings: {formatMoney(m.totalBalance)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Member Preview */}
            {selectedMember && (
              <div className="p-3.5 bg-gradient-to-br from-slate-50 to-amber-50/40 rounded-2xl border border-amber-200/80 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    className="w-11 h-11 rounded-xl object-cover border border-amber-300 shadow-2xs"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      {selectedMember.name}
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        {selectedMember.accountNumber || selectedMember.id}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">{selectedMember.locationStall} • {selectedMember.phone}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                      <span className="text-slate-600 font-medium">Day {selectedMember.currentCyclePaidDays}/{selectedMember.susuCycleDays} of cycle</span>
                      <span className="text-emerald-700 font-semibold">• Office Fee: Paid ✓</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Available Balance</span>
                  <span className="text-base font-extrabold text-emerald-700 font-mono">
                    {formatMoney(selectedMember.totalBalance)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Withdrawal Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 inline-flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Amount to Withdraw ({getCurrencySymbol()})</span>
              </label>
              {selectedMember && (
                <span className="text-xs text-slate-500">
                  Available: <strong className="text-emerald-700">{formatMoney(selectedMember.totalBalance)}</strong>
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-lg">
                {getCurrencySymbol()}
              </span>
              <input
                type="number"
                min="1"
                max={selectedMember?.totalBalance || 999999}
                step="any"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xl font-extrabold font-display text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none shadow-2xs"
              />
            </div>

            {/* Quick Percentage Chips */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Quick select:</span>
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentageClick(pct)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-300 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                >
                  {pct === 100 ? 'Full Payout (100%)' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Zero Fee & Net Breakdown */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">
                  Withdrawal Charges (0% Fee Policy)
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-700">
                GH₵ 0.00 (FREE)
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Net Disbursable Amount:</span>
                <span className="text-xl font-extrabold text-amber-700 font-display">
                  {formatMoney(netPayout)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-500 block">Remaining Savings:</span>
                <span className="text-sm font-bold text-slate-700 font-mono">
                  {formatMoney(remainingBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Payout Mode & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Requested Payout Method
              </label>
              <select
                value={payoutMode}
                onChange={(e) => setPayoutMode(e.target.value as PayoutMode)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none text-slate-800"
              >
                <option value="BANKER_CASH_HANDOVER">💵 Banker Cash Handover (Post-Approval)</option>
                <option value="ADMIN_MOMO_TRANSFER">📲 Back Office MoMo Payout</option>
                <option value="VAULT_PICKUP">🏛️ Office / Vault Cash Collection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Disbursement Medium
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none text-slate-800"
              >
                <option value="CASH">Physical Cash</option>
                <option value="MTN_MOMO">MTN Mobile Money</option>
                <option value="TELECEL_CASH">Telecel Cash</option>
                <option value="AIRTELTIGO">AirtelTigo Money</option>
                <option value="BANK_TRANSFER">Bank Account Wire</option>
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Timing & Reason for Withdrawal
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none text-slate-800"
            >
              <option value="Early / Weekly Savings Withdrawal">Early / Weekly Savings Withdrawal (Within a week)</option>
              <option value="Full 31-Day Cycle Completion">Full 31-Day Cycle Completion</option>
              <option value="Business Wholesale Restock">Business Wholesale Restock</option>
              <option value="Urgent School Fees & Tuition">Urgent School Fees & Tuition</option>
              <option value="Emergency Hospital & Medical Expense">Emergency Hospital & Medical Expense</option>
              <option value="Market Stall Rent Advance">Market Stall Rent Advance</option>
              <option value="Other Personal Purpose">Other Personal Purpose</option>
            </select>
          </div>

          {/* Approval Workflow Warning */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[11px] leading-tight">
              <strong>Workflow Safeguard:</strong> This withdrawal request will be sent to Admin Bernard's Approval Queue. Banker cannot hand over cash until approval is granted.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-100" />
              <span>Submit Request for Admin Approval ({formatMoney(netPayout)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
