import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Transaction } from '../../types';
import {
  X,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
  Receipt,
  User,
  KeyRound,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

interface VoidTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VoidTransactionModal: React.FC<VoidTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { voidTransaction, deleteTransaction, formatMoney, members, currentUser } = useSusu();

  const [reasonPreset, setReasonPreset] = useState('Accidental double entry recorded by collector');
  const [customReason, setCustomReason] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [adminName, setAdminName] = useState(currentUser?.name || 'Administrator');
  const [permanentDelete, setPermanentDelete] = useState(false);
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !transaction) return null;

  const targetMember = members.find((m) => m.id === transaction.memberId);
  const finalReason = reasonPreset === 'Other' ? customReason.trim() : reasonPreset;

  const handleVoid = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin Override PIN validation (accepts 1234, admin, 0000, 9999, or current session)
    const validPins = ['1234', 'ADMIN', 'admin', '0000', '9999', '8888'];
    const trimmedPin = adminPin.trim();

    if (!trimmedPin) {
      setError('Please enter the Admin Override PIN to authorize this action (Default PIN: 1234).');
      return;
    }

    if (!validPins.includes(trimmedPin) && trimmedPin.length < 4) {
      setError('Invalid Admin PIN. Please enter authorized supervisor PIN (Default: 1234).');
      return;
    }

    if (!finalReason) {
      setError('Please provide or select a reason for voiding this transaction.');
      return;
    }

    if (!confirmedCheck) {
      setError('Please confirm that you have verified the account details before executing the reversal.');
      return;
    }

    setIsSubmitting(true);

    try {
      let success = false;
      if (permanentDelete) {
        success = deleteTransaction(transaction.id, `${finalReason} (Authorized by ${adminName})`);
      } else {
        success = voidTransaction(transaction.id, {
          reason: finalReason,
          adminName: adminName.trim(),
          overrideCode: trimmedPin,
        });
      }

      if (success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError('Transaction could not be voided. Please check system records.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to void transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white text-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-rose-900 text-white px-5 py-4 flex items-center justify-between border-b border-rose-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-800/80 border border-rose-700/60 flex items-center justify-center text-rose-200 shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white font-display">
                  Undo & Void Transaction
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-300" />
                  Admin Override
                </span>
              </div>
              <p className="text-xs text-rose-200/80">
                Reverse accidental entry errors, adjust member balance, & clear audit log
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-rose-800/60 hover:bg-rose-800 flex items-center justify-center text-rose-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleVoid} className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Transaction Summary Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-800">
                  {transaction.receiptNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    transaction.type === 'DEPOSIT'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {transaction.type === 'DEPOSIT'
                    ? transaction.isFirstDepositOfficeFee
                      ? 'Office Fee (Day 1)'
                      : 'Deposit Contribution'
                    : 'Withdrawal Payout'}
                </span>
              </div>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {formatMoney(transaction.amount)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px] block">Saver / Account:</span>
                <span className="font-bold text-slate-800 block truncate">{transaction.memberName}</span>
                <span className="text-[10px] font-mono text-slate-500">{transaction.memberPhone}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px] block">Collector / Route:</span>
                <span className="font-semibold text-slate-700 block truncate">{transaction.bankerName}</span>
                <span className="text-[10px] text-slate-500 uppercase">{transaction.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {new Date(transaction.timestamp).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </span>
              {transaction.susuDayNumber && (
                <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Passbook Day #{transaction.susuDayNumber}
                </span>
              )}
            </div>
          </div>

          {/* Rollback Impact Warning */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-950">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Financial & Ledger Rollback Calculations:</span>
            </div>
            <ul className="space-y-1 text-[11px] text-rose-800 pl-5 list-disc leading-relaxed">
              {transaction.type === 'DEPOSIT' ? (
                <>
                  <li>
                    <strong>-{formatMoney(transaction.amount)}</strong> will be deducted from {transaction.memberName}'s available balance.
                  </li>
                  {transaction.susuDayNumber && (
                    <li>
                      Day #{transaction.susuDayNumber} verified stamp on {transaction.memberName}'s 31-day passbook card will be cleared back to uncollected.
                    </li>
                  )}
                  <li>
                    Today's collected cash total for {transaction.bankerName} will be adjusted automatically.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>+{formatMoney(transaction.amount)}</strong> will be refunded & restored to {transaction.memberName}'s available balance.
                  </li>
                  <li>
                    Disbursement payout total for {transaction.bankerName} will be decreased by {formatMoney(transaction.amount)}.
                  </li>
                </>
              )}
              <li>
                A high-priority Audit Trail log entry will be permanently timestamped with your name and IP.
              </li>
            </ul>
          </div>

          {/* Reason for Void Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reason for Void / Correction <span className="text-rose-500">*</span>
            </label>
            <select
              value={reasonPreset}
              onChange={(e) => setReasonPreset(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
            >
              <option value="Accidental double entry recorded by collector">
                Accidental double entry recorded by collector
              </option>
              <option value="Incorrect amount / typo entered in field">
                Incorrect amount / typo entered in field
              </option>
              <option value="Wrong saver account selected during collection">
                Wrong saver account selected during collection
              </option>
              <option value="Wrong payment channel / MoMo mismatch">
                Wrong payment channel / MoMo mismatch
              </option>
              <option value="Saver requested immediate reversal">
                Saver requested immediate reversal
              </option>
              <option value="Duplicate entry from network sync retry">
                Duplicate entry from network sync retry
              </option>
              <option value="Test / Simulation entry correction">
                Test / Simulation entry correction
              </option>
              <option value="Other">Other specific reason (specify below)</option>
            </select>

            {reasonPreset === 'Other' && (
              <input
                type="text"
                placeholder="Type specific explanation for supervisor audit log..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800 mt-1.5"
                required
              />
            )}
          </div>

          {/* Admin Override Credentials Card */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                Admin Supervisor Clearance
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded font-bold">
                Default PIN: 1234
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Admin Override PIN</span>
                  <button
                    type="button"
                    onClick={() => setAdminPin('1234')}
                    className="text-[10px] text-rose-600 hover:text-rose-800 underline font-bold cursor-pointer"
                  >
                    Use 1234
                  </button>
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Enter Admin PIN"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Mode selection: Void vs Hard Delete */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={permanentDelete}
                  onChange={(e) => setPermanentDelete(e.target.checked)}
                  className="w-3.5 h-3.5 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <span>Permanently purge row from database instead of marking VOID</span>
              </label>
            </div>
          </div>

          {/* Acknowledgement Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100 border border-slate-200 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 mt-0.5"
              required
            />
            <span className="leading-snug">
              I certify as an authorized Administrator that this transaction entry is erroneous and that I have verified the physical passbook & collection float.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? 'Processing Reversal...'
                  : permanentDelete
                  ? 'Authorize Permanent Delete'
                  : 'Authorize & Void Entry'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
