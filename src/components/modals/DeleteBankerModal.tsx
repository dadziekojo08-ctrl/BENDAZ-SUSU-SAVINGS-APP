import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Banker } from '../../types';
import {
  Trash2,
  AlertTriangle,
  X,
  UserCheck,
  Users,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface DeleteBankerModalProps {
  banker: Banker | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteBankerModal: React.FC<DeleteBankerModalProps> = ({
  banker,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { deleteBanker, bankers, members, formatMoney } = useSusu();
  const [reassignToBankerId, setReassignToBankerId] = useState('');
  const [reason, setReason] = useState('Resigned / Left Employment');
  const [customReason, setCustomReason] = useState('');
  const [confirmNameInput, setConfirmNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !banker) return null;

  const assignedMembers = members.filter((m) => m.assignedBankerId === banker.id);
  const otherBankers = bankers.filter((b) => b.id !== banker.id);
  const hasCashToday = (banker.collectedToday || 0) > (banker.withdrawnToday || 0);
  const netCash = Math.max(0, (banker.collectedToday || 0) - (banker.withdrawnToday || 0));

  const finalReason = reason === 'Other' ? customReason.trim() : reason;

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (reason === 'Other' && !customReason.trim()) {
      setError('Please provide a specific reason for removing this banker');
      return;
    }

    if (confirmNameInput.trim().toLowerCase() !== banker.name.trim().toLowerCase()) {
      setError(`Please type "${banker.name}" exactly to confirm deletion`);
      return;
    }

    setIsSubmitting(true);
    try {
      deleteBanker(banker.id, reassignToBankerId || undefined, finalReason);
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to delete banker');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-3xl max-w-lg w-full shadow-2xl border border-[#FCA5A5]/60 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#B91C1C] px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-white">Delete Banker Account</h2>
              <p className="text-xs text-red-100">Permanent mobile collector deletion & saver reassignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overview */}
        <div className="p-6 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EAE7DC] shadow-xs flex items-center gap-3.5">
            <img
              src={banker.avatar}
              alt={banker.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#D8D5C8]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#383B2B]">{banker.name}</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE7DC] text-[#5A5A40]">
                  @{banker.username || banker.id}
                </span>
              </div>
              <p className="text-xs text-[#6A6A55] mt-0.5">
                Route: <strong>{banker.routeName || 'Field Collector'}</strong> • Phone: {banker.phone}
              </p>
              <p className="text-xs text-[#5A5E46] font-semibold mt-0.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{assignedMembers.length} active saver{assignedMembers.length === 1 ? '' : 's'} assigned</span>
              </p>
            </div>
          </div>

          {/* Cash Warning */}
          {hasCashToday && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs flex items-center gap-2 text-[#991B1B]">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>
                <strong>Warning:</strong> This banker has <strong>{formatMoney(netCash)}</strong> in today's unreconciled cash. Ensure physical cash has been remitted to office vault before deleting.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleDelete} className="space-y-3.5">
            {/* Reassignment Selector */}
            {assignedMembers.length > 0 && (
              <div className="bg-white p-3.5 rounded-xl border border-[#EAE7DC] space-y-1.5">
                <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Reassign {assignedMembers.length} Savers To:
                </label>
                <select
                  value={reassignToBankerId}
                  onChange={(e) => setReassignToBankerId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F8F4] border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B] font-semibold cursor-pointer"
                >
                  <option value="">-- Leave as Unassigned Collector --</option>
                  {otherBankers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.routeName || b.zone || 'Field Agent'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#7A7A65]">
                  Select an active banker to take over this route's savers immediately.
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Reason for Banker Deletion *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#B91C1C] focus:outline-none text-[#383B2B] font-semibold cursor-pointer"
              >
                <option value="Resigned / Left Employment">Resigned / Left Employment</option>
                <option value="Route Restructuring">Route Restructuring / Consolidation</option>
                <option value="Disciplinary Termination">Disciplinary Termination</option>
                <option value="Duplicate Account">Duplicate Account</option>
                <option value="Other">Other reason (specify)...</option>
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

            {/* Confirm Banker Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#7F1D1D]">
                Type banker name <span className="font-mono underline text-[#B91C1C]">"{banker.name}"</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmNameInput}
                onChange={(e) => setConfirmNameInput(e.target.value)}
                placeholder={banker.name}
                className="w-full px-3 py-2 bg-white border border-[#FCA5A5] rounded-xl text-xs font-mono font-bold text-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C] focus:outline-none"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE7DC]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#7A7A65] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
              >
                Cancel / Keep Banker
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Deleting Banker...' : 'Permanently Delete Banker'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
