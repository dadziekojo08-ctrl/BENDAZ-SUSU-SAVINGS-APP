import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Transaction, PaymentMethod } from '../../types';
import {
  X,
  Edit3,
  Calendar,
  CreditCard,
  User,
  Coins,
  FileText,
  AlertCircle,
  CheckCircle2,
  Receipt,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { editTransaction, formatMoney, members } = useSusu();

  const [amount, setAmount] = useState<number>(transaction?.amount || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    transaction?.paymentMethod || 'CASH'
  );
  const [susuDayNumber, setSusuDayNumber] = useState<number>(
    transaction?.susuDayNumber || 1
  );
  const [isFirstDepositOfficeFee, setIsFirstDepositOfficeFee] = useState<boolean>(
    transaction?.isFirstDepositOfficeFee || false
  );
  const [timestamp, setTimestamp] = useState<string>(
    transaction ? new Date(transaction.timestamp).toISOString().slice(0, 16) : ''
  );
  const [notes, setNotes] = useState<string>(transaction?.notes || '');
  const [error, setError] = useState('');

  // Update form whenever target transaction changes
  React.useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount);
      setPaymentMethod(transaction.paymentMethod);
      setSusuDayNumber(transaction.susuDayNumber || 1);
      setIsFirstDepositOfficeFee(transaction.isFirstDepositOfficeFee || false);
      try {
        setTimestamp(new Date(transaction.timestamp).toISOString().slice(0, 16));
      } catch {
        setTimestamp(new Date().toISOString().slice(0, 16));
      }
      setNotes(transaction.notes || '');
      setError('');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const targetMember = members.find((m) => m.id === transaction.memberId);
  const originalAmount = transaction.amount;
  const difference = (Number(amount) || 0) - originalAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    try {
      const success = editTransaction(transaction.id, {
        amount: numAmount,
        paymentMethod,
        susuDayNumber: Number(susuDayNumber),
        isFirstDepositOfficeFee,
        timestamp: new Date(timestamp).toISOString(),
        notes: notes.trim(),
      });

      if (success) {
        onClose();
      } else {
        setError('Could not update transaction. Please check details.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to edit transaction');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-3xl max-w-lg w-full shadow-2xl border border-[#E3DFC9] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#383B2B] px-6 py-4 text-white flex items-center justify-between border-b border-[#4A4D3A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#8E9775]/20 border border-[#8E9775]/40 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-[#8E9775]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-brand font-bold text-lg text-[#F9F8F4]">
                  Edit Ledger Entry
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#8E9775]/25 text-[#EAE7DC]">
                  {transaction.receiptNumber}
                </span>
              </div>
              <p className="text-xs text-[#D8D5C8]">
                Adjust deposit amount, payment channel, or correct double entries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#C27D50]/15 border border-[#C27D50]/30 text-[#9A5025] text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C27D50] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Member & Context Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#E3DFC9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAE7DC] flex items-center justify-center text-[#5A5E46] font-bold text-sm">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#383B2B]">{transaction.memberName}</p>
                <p className="text-[11px] text-[#7A7A65]">
                  Collector: {transaction.bankerName} • Current Savings: {formatMoney(targetMember?.totalBalance || 0)}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                transaction.type === 'DEPOSIT'
                  ? 'bg-[#8E9775]/20 text-[#5A5E46]'
                  : 'bg-[#C27D50]/20 text-[#C27D50]'
              }`}
            >
              {transaction.type}
            </span>
          </div>

          {/* Amount Field with live calculation preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                Transaction Amount (GH₵)
              </label>
              <span className="text-[11px] text-[#7A7A65]">
                Original: <strong className="text-[#383B2B]">{formatMoney(originalAmount)}</strong>
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-[#8A8A70]">GH₵</span>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-12 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
              />
            </div>

            {difference !== 0 && (
              <div className="mt-2 p-2.5 bg-[#EAE7DC]/60 rounded-xl border border-[#D8D5C8] flex items-center justify-between text-xs">
                <span className="text-[#5A5A40]">Adjustment to Saver's Balance:</span>
                <span
                  className={`font-mono font-bold ${
                    difference > 0 ? 'text-[#5A5E46]' : 'text-[#C27D50]'
                  }`}
                >
                  {difference > 0 ? `+${formatMoney(difference)}` : formatMoney(difference)}
                </span>
              </div>
            )}
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              >
                <option value="CASH">Physical Cash Handover</option>
                <option value="MTN_MOMO">MTN Mobile Money</option>
                <option value="TELECEL_CASH">Telecel Cash</option>
                <option value="AIRTELTIGO_MONEY">AirtelTigo Money</option>
                <option value="BANK_TRANSFER">Direct Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Recorded Date & Time
              </label>
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              />
            </div>
          </div>

          {/* Susu Day & Day 1 Fee Settings (for Deposits) */}
          {transaction.type === 'DEPOSIT' && (
            <div className="p-3 bg-white rounded-2xl border border-[#E3DFC9] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    Susu Card Day # (1 - 31)
                  </label>
                  <p className="text-[10px] text-[#7A7A65]">
                    Positions the stamp on the physical savings passbook
                  </p>
                </div>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={susuDayNumber}
                  onChange={(e) => setSusuDayNumber(parseInt(e.target.value) || 1)}
                  className="w-20 p-2 text-center bg-[#F9F8F4] border border-[#D8D5C8] rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
                />
              </div>

              <div className="pt-2 border-t border-[#EAE7DC] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#383B2B] block">
                    Day 1 Retained Office Fee
                  </span>
                  <span className="text-[10px] text-[#7A7A65]">
                    Mark if this entry is the manager's 1-day card fee
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isFirstDepositOfficeFee}
                  onChange={(e) => setIsFirstDepositOfficeFee(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8E9775] focus:ring-[#8E9775] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Notes & Audit Explanation */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Admin Correction Reason / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Corrected field typo / duplicate deposit entry"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
            />
          </div>

          {/* Actions */}
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
              className="px-6 py-2.5 rounded-xl bg-[#5A5E46] hover:bg-[#484B37] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Corrections</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
