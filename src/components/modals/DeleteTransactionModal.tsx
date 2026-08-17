import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Transaction } from '../../types';
import {
  X,
  Trash2,
  AlertTriangle,
  Receipt,
  User,
  Coins,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

interface DeleteTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { deleteTransaction, formatMoney, members } = useSusu();
  const [reason, setReason] = useState('Duplicate entry recorded by mistake');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !transaction) return null;

  const targetMember = members.find((m) => m.id === transaction.memberId);

  const handleDelete = () => {
    setError('');
    setIsDeleting(true);

    try {
      const success = deleteTransaction(transaction.id, reason.trim());
      if (success) {
        onClose();
      } else {
        setError('Could not delete transaction. Please verify records.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-3xl max-w-md w-full shadow-2xl border border-[#E3DFC9] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#A34E36] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-white">
                Delete & Reverse Entry
              </h2>
              <p className="text-xs text-white/80">
                Permanently remove duplicate or faulty ledger record
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#C27D50]/15 border border-[#C27D50]/30 text-[#9A5025] text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C27D50] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Warning Banner */}
          <div className="p-3.5 bg-[#C27D50]/10 border border-[#C27D50]/30 rounded-2xl flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#C27D50] shrink-0 mt-0.5" />
            <div className="text-xs text-[#7A4020]">
              <p className="font-bold">Ledger Reversal Action</p>
              <p className="mt-0.5 leading-relaxed">
                Deleting this entry will automatically revert the saver's balance and clear the corresponding passbook stamp. An audit log entry will be permanently recorded.
              </p>
            </div>
          </div>

          {/* Transaction Summary Card */}
          <div className="bg-white p-4 rounded-2xl border border-[#E3DFC9] space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE7DC]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#383B2B]">
                  {transaction.receiptNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    transaction.type === 'DEPOSIT'
                      ? 'bg-[#8E9775]/20 text-[#5A5E46]'
                      : 'bg-[#C27D50]/20 text-[#C27D50]'
                  }`}
                >
                  {transaction.type}
                </span>
              </div>
              <span className="text-sm font-bold font-mono text-[#383B2B]">
                {formatMoney(transaction.amount)}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#5A5A40]">
              <div className="flex items-center justify-between">
                <span className="text-[#8A8A70]">Account Member:</span>
                <strong className="text-[#383B2B]">{transaction.memberName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A8A70]">Current Savings:</span>
                <span className="font-mono font-bold text-[#5A5E46]">
                  {formatMoney(targetMember?.totalBalance || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A8A70]">Field Banker:</span>
                <span>{transaction.bankerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A8A70]">Recorded:</span>
                <span>
                  {new Date(transaction.timestamp).toLocaleDateString('en-GB', {
                    dateStyle: 'medium',
                  })}
                </span>
              </div>
            </div>

            {/* Impact Calculation */}
            <div className="pt-2.5 border-t border-[#EAE7DC] bg-[#F9F8F4] -mx-4 -mb-4 p-3 rounded-b-2xl">
              <p className="text-[11px] font-bold text-[#383B2B] uppercase tracking-wider mb-1">
                Financial Impact of Deletion:
              </p>
              {transaction.type === 'DEPOSIT' ? (
                <p className="text-xs text-[#C27D50] font-medium">
                  • <strong>-{formatMoney(transaction.amount)}</strong> will be deducted from {transaction.memberName}'s balance.
                  {transaction.susuDayNumber && ` Stamp for Day #${transaction.susuDayNumber} will be cleared.`}
                </p>
              ) : (
                <p className="text-xs text-[#5A5E46] font-medium">
                  • <strong>+{formatMoney(transaction.amount)}</strong> will be refunded to {transaction.memberName}'s savings balance.
                </p>
              )}
            </div>
          </div>

          {/* Reason Selection / Input */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Reason for Removal
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C27D50] focus:outline-none text-[#4A4A40] mb-2"
            >
              <option value="Duplicate double deposit recorded by mistake">
                Duplicate double deposit recorded by mistake
              </option>
              <option value="Incorrect amount entered by field collector">
                Incorrect amount entered by field collector
              </option>
              <option value="Wrong member account selected during collection">
                Wrong member account selected during collection
              </option>
              <option value="Test / Simulation deposit cleanup">
                Test / Simulation deposit cleanup
              </option>
              <option value="Other">Other reason (specify below)</option>
            </select>
            {reason === 'Other' && (
              <input
                type="text"
                placeholder="Enter specific audit remarks..."
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#C27D50] focus:outline-none text-[#4A4A40]"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EAE7DC]">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-[#D8D5C8] text-[#5A5A40] text-xs font-semibold hover:bg-[#EAE7DC]/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-[#A34E36] hover:bg-[#8A3E2A] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Confirm Delete & Reverse'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
