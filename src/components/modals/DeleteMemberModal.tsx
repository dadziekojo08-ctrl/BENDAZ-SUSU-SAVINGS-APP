import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Member } from '../../types';
import {
  Trash2,
  AlertTriangle,
  X,
  User,
  Coins,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface DeleteMemberModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  member,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { deleteMember, formatMoney } = useSusu();
  const [reason, setReason] = useState('Account closed at member request');
  const [customReason, setCustomReason] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [confirmNameInput, setConfirmNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !member) return null;

  const hasRemainingBalance = (member.totalBalance || 0) > 0;
  const requiresNameConfirmation = hasRemainingBalance || member.totalBalance > 500;

  const finalReason = reason === 'Other' ? customReason.trim() : reason;

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (reason === 'Other' && !customReason.trim()) {
      setError('Please provide a specific reason for deleting this account');
      return;
    }

    if (hasRemainingBalance && !confirmCheckbox) {
      setError('Please check the confirmation box acknowledging remaining funds');
      return;
    }

    if (requiresNameConfirmation && confirmNameInput.trim().toLowerCase() !== member.name.trim().toLowerCase()) {
      setError(`Please type "${member.name}" exactly to confirm permanent account deletion`);
      return;
    }

    setIsSubmitting(true);
    try {
      deleteMember(member.id, finalReason);
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-3xl max-w-lg w-full shadow-2xl border border-[#FCA5A5]/60 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Banner */}
        <div className="bg-[#B91C1C] px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-white">Delete Saver Account</h2>
              <p className="text-xs text-red-100">Permanent administrator account deletion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Member Profile Overview Card */}
        <div className="p-6 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EAE7DC] shadow-xs flex items-center gap-3.5">
            <img
              src={
                member.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`
              }
              alt={member.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#D8D5C8]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#383B2B]">{member.name}</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE7DC] text-[#5A5A40]">
                  {member.accountNumber || member.id}
                </span>
              </div>
              <p className="text-xs text-[#6A6A55] mt-0.5 flex flex-wrap items-center gap-1.5">
                <span>{member.phone}</span>
                <span>•</span>
                <span>{member.locationStall}</span>
                <span>•</span>
                <span>Route: {member.routeName || 'General'}</span>
              </p>
              <p className="text-xs text-[#8A8A70] mt-0.5">
                Assigned Banker: <strong>{member.assignedBankerName || 'Unassigned'}</strong>
              </p>
            </div>
          </div>

          {/* Warning / Alert Callout */}
          {hasRemainingBalance ? (
            <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#991B1B] font-bold">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>Active Account Balance Warning</span>
              </div>
              <p className="text-[#B91C1C]">
                This member currently has an outstanding savings balance of{' '}
                <strong className="font-mono text-sm underline">{formatMoney(member.totalBalance)}</strong>.
              </p>
              <p className="text-[11px] text-[#7F1D1D]">
                Deleting this account will permanently remove their passbook record and ledger history. Ensure all physical cash has been paid out or refunded to the member before deleting.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs flex items-center gap-2 text-[#92400E]">
              <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
              <span>
                Zero savings balance on record. Deleting will remove member profile from active routes.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={handleDelete} className="space-y-3.5 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Reason for Account Deletion *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#B91C1C] focus:outline-none text-[#383B2B] font-semibold cursor-pointer"
              >
                <option value="Account closed at member request">Account closed at member request (Full Payout Completed)</option>
                <option value="Saver relocated / stopped trading at market">Saver relocated / stopped trading at market</option>
                <option value="Duplicate account created in error">Duplicate account created in error</option>
                <option value="Test demo data removal">Test demo data removal</option>
                <option value="Other">Other reason (specify below)...</option>
              </select>
            </div>

            {reason === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] mb-1">
                  Specify Deletion Reason *
                </label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter audit trail explanation..."
                  className="w-full px-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#B91C1C] focus:outline-none text-[#383B2B]"
                  required
                />
              </div>
            )}

            {/* If has balance: Checkbox confirmation */}
            {hasRemainingBalance && (
              <label className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-[#FCA5A5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#B91C1C] focus:ring-[#B91C1C] cursor-pointer"
                />
                <span className="text-xs text-[#7F1D1D] font-medium leading-tight">
                  I confirm that the savings balance of <strong>{formatMoney(member.totalBalance)}</strong> has been settled or authorized for removal by administrative oversight.
                </span>
              </label>
            )}

            {/* Type name to confirm for safety */}
            {requiresNameConfirmation && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#7F1D1D]">
                  Type saver's name <span className="font-mono underline text-[#B91C1C]">"{member.name}"</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmNameInput}
                  onChange={(e) => setConfirmNameInput(e.target.value)}
                  placeholder={member.name}
                  className="w-full px-3 py-2 bg-white border border-[#FCA5A5] rounded-xl text-xs font-mono font-bold text-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C] focus:outline-none"
                  required
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE7DC]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#7A7A65] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
              >
                Cancel / Keep Account
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Deleting Account...' : 'Permanently Delete Saver'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
