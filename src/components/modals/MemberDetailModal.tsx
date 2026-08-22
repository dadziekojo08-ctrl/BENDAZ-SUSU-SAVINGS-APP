import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Member, Transaction } from '../../types';
import { WithdrawalStatusBadge, TransactionTypeBadge } from '../common/StatusBadge';
import { EditTransactionModal } from './EditTransactionModal';
import { DeleteTransactionModal } from './DeleteTransactionModal';
import { VoidTransactionModal } from './VoidTransactionModal';
import { EditMemberModal } from './EditMemberModal';
import { DeleteMemberModal } from './DeleteMemberModal';
import {
  X,
  User,
  Phone,
  Store,
  Calendar,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Receipt,
  Stamp,
  Building2,
  Edit3,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
  onOpenDeposit: (memberId: string) => void;
  onOpenWithdrawal: (memberId: string) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
  onOpenDeposit,
  onOpenWithdrawal,
}) => {
  const { formatMoney, transactions, setActiveReceipt, userRole, members } = useSusu();
  const [activeTab, setActiveTab] = useState<'card' | 'transactions'>('card');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [voidingTransaction, setVoidingTransaction] = useState<Transaction | null>(null);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  if (!member) return null;

  const isAdmin = userRole?.toLowerCase() === 'admin';

  // Use the most up-to-date member data from context if available
  const currentMember = members.find((m) => m.id === member.id) || member;

  const memberTransactions = transactions.filter((t) => t.memberId === member.id);
  const cycleCompletionPct = Math.min(
    100,
    Math.round((member.currentCyclePaidDays / member.susuCycleDays) * 100)
  );

  const handlePrintPassbook = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white text-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header Profile */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 px-5 py-4 text-white flex flex-wrap items-center justify-between gap-3 border-b border-teal-900 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400/50 shadow-md ring-2 ring-emerald-400/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white font-display">{member.name}</h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-2xs">
                  {member.accountNumber || member.id}
                </span>
                {member.status === 'cycle_ready' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Cycle Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/80 flex items-center gap-2 mt-0.5">
                <span>{member.locationStall}</span>
                <span>•</span>
                <span>{member.phone}</span>
                <span>•</span>
                <span>Banker: {member.assignedBankerName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsEditingMember(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-xl border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Edit Saver Profile & Settings"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setIsDeletingMember(true)}
                  className="bg-rose-950/60 hover:bg-rose-900 text-rose-200 px-2.5 py-1.5 rounded-xl border border-rose-700/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete Saver Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}

            <button
              onClick={handlePrintPassbook}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl border border-white/20 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Passbook Statement"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Balance & Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border-b border-slate-200 shrink-0">
          <div className="bg-slate-50 p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Available Savings</span>
            <span className="text-base font-extrabold text-emerald-700 font-mono">
              {formatMoney(member.totalBalance)}
            </span>
          </div>

          <div className="bg-slate-50 p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Office Fee (Day 1)</span>
            <span className="text-sm font-bold text-amber-700 font-mono">
              {formatMoney(member.officeFeePaid || 0)}
            </span>
          </div>

          <div className="bg-slate-50 p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Cycle Progress</span>
            <span className="text-sm font-bold text-slate-800">
              {member.currentCyclePaidDays}/{member.susuCycleDays} Days ({cycleCompletionPct}%)
            </span>
          </div>

          <div className="bg-slate-50 p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">All-Time Saved</span>
            <span className="text-sm font-bold text-slate-700 font-mono">
              {formatMoney(member.totalSavingsAllTime)}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-2.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('card')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'card'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>31-Day Passbook Card</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'transactions'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Ledger History ({memberTransactions.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 pb-2">
            <button
              onClick={() => onOpenDeposit(member.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <ArrowDownRight className="w-3 h-3" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => onOpenWithdrawal(member.id)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50">
          {/* TAB 1: 31-Day Susu Stamp Card */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Traditional 31-Day Thrift Card</h3>
                    <p className="text-xs text-slate-500">
                      Standard Susu rules: Day 1 belongs to the Enterprise/Office, Days 2–31 are available for 100% free payout.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Pledge: {formatMoney(member.dailyTarget)} / Day
                  </span>
                </div>

                {/* Grid of 31 Days */}
                <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                  {Array.from({ length: member.susuCycleDays }).map((_, i) => {
                    const dayNum = i + 1;
                    const isPaid = dayNum <= member.currentCyclePaidDays;
                    const isOfficeFeeDay = dayNum === 1;

                    return (
                      <div
                        key={dayNum}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[52px] ${
                          isPaid
                            ? isOfficeFeeDay
                              ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-mono">D{dayNum}</span>
                        <div className="my-0.5">
                          {isPaid ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-300" />
                          )}
                        </div>
                        <span className="text-[9px] font-mono leading-none">
                          {isOfficeFeeDay ? 'Office' : isPaid ? 'Paid' : 'Due'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Transactions History */}
          {activeTab === 'transactions' && (
            <div className="space-y-2">
              {memberTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No transactions recorded yet for this saver.
                </div>
              ) : (
                memberTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'DEPOSIT'
                            ? tx.isFirstDepositOfficeFee
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {tx.type === 'DEPOSIT'
                              ? tx.isFirstDepositOfficeFee
                                ? 'Day 1 Office Fee'
                                : 'Savings Contribution'
                              : 'Withdrawal Payout'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{tx.receiptNumber}</span>
                          <WithdrawalStatusBadge status={tx.status} size="sm" showSubtext={false} />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {new Date(tx.timestamp).toLocaleString('en-GB', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })} • {tx.paymentMethod.replace(/_/g, ' ')} • Collector: {tx.bankerName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span
                          className={`font-bold font-mono text-sm ${
                            tx.type === 'DEPOSIT'
                              ? tx.isFirstDepositOfficeFee
                                ? 'text-amber-800'
                                : 'text-emerald-700'
                              : 'text-amber-800'
                          }`}
                        >
                          {tx.type === 'DEPOSIT' ? '+' : '-'}
                          {formatMoney(tx.amount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {isAdmin && tx.status !== 'VOIDED' && (
                          <>
                            <button
                              onClick={() => setVoidingTransaction(tx)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="Undo / Void Entry (Admin Override)"
                            >
                              <RotateCcw className="w-3 h-3 text-rose-600" />
                              <span>Undo / Void</span>
                            </button>
                            <button
                              onClick={() => setEditingTransaction(tx)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer transition-colors"
                              title="Edit Entry"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTransaction(tx)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer transition-colors"
                              title="Delete & Reverse Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {tx.status === 'VOIDED' && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold border border-rose-200">
                            VOIDED
                          </span>
                        )}
                        <button
                          onClick={() => setActiveReceipt(tx)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
                          title="View Official Receipt Voucher"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals for Editing, Deleting & Voiding entries */}
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
      />

      <DeleteTransactionModal
        transaction={deletingTransaction}
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
      />

      <VoidTransactionModal
        transaction={voidingTransaction}
        isOpen={Boolean(voidingTransaction)}
        onClose={() => setVoidingTransaction(null)}
      />

      {/* Modals for Editing & Deleting Member Account */}
      <EditMemberModal
        member={currentMember}
        isOpen={isEditingMember}
        onClose={() => setIsEditingMember(false)}
      />

      <DeleteMemberModal
        member={currentMember}
        isOpen={isDeletingMember}
        onClose={() => setIsDeletingMember(false)}
        onSuccess={() => {
          setIsDeletingMember(false);
          onClose();
        }}
      />
    </div>
  );
};
