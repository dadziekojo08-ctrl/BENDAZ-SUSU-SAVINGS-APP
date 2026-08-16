import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Member, Transaction } from '../../types';
import { WithdrawalStatusBadge, TransactionTypeBadge } from '../common/StatusBadge';
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
  const { formatMoney, transactions, setActiveReceipt } = useSusu();
  const [activeTab, setActiveTab] = useState<'card' | 'transactions'>('card');

  if (!member) return null;

  const memberTransactions = transactions.filter((t) => t.memberId === member.id);
  const cycleCompletionPct = Math.min(
    100,
    Math.round((member.currentCyclePaidDays / member.susuCycleDays) * 100)
  );

  const handlePrintPassbook = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E3DFC9] overflow-hidden my-6">
        {/* Header Profile */}
        <div className="bg-[#383B2B] px-6 py-5 text-white flex flex-wrap items-center justify-between gap-4 border-b border-[#4A4D3A]">
          <div className="flex items-center gap-3.5">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#8E9775]/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-brand font-bold text-xl text-[#F9F8F4]">{member.name}</h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[#8E9775]/25 text-[#EAE7DC] border border-[#8E9775]/40">
                  {member.accountNumber || member.id}
                </span>
                {member.status === 'cycle_ready' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#C27D50]/25 text-[#EAE7DC] border border-[#C27D50]/40">
                    Cycle Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-[#D8D5C8] flex items-center gap-2 mt-0.5">
                <span>{member.locationStall}</span>
                <span className="text-[#8A8A70]">•</span>
                <span>{member.phone}</span>
              </p>
              <p className="text-[11px] text-[#A8B294] mt-0.5">
                Field Banker: <strong>{member.assignedBankerName}</strong> ({member.routeName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPassbook}
              className="bg-white/10 hover:bg-white/20 text-[#F9F8F4] p-2 rounded-xl border border-white/20 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Passbook Statement"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Passbook</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Balance & Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E3DFC9] border-b border-[#E3DFC9]">
          <div className="bg-[#F9F8F4] p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-[#7A7A65] block">Available Savings</span>
            <span className="text-lg font-extrabold text-[#5A5E46] font-serif-brand">
              {formatMoney(member.totalBalance)}
            </span>
          </div>

          <div className="bg-[#F9F8F4] p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-[#7A7A65] block">Office Fee (Day 1)</span>
            <span className="text-sm font-bold text-[#C27D50] font-mono">
              {formatMoney(member.officeFeePaid || 0)}
            </span>
          </div>

          <div className="bg-[#F9F8F4] p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-[#7A7A65] block">Cycle Progress</span>
            <span className="text-base font-bold text-[#383B2B]">
              {member.currentCyclePaidDays}/{member.susuCycleDays} Days ({cycleCompletionPct}%)
            </span>
          </div>

          <div className="bg-[#F9F8F4] p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-[#7A7A65] block">All-Time Saved</span>
            <span className="text-base font-bold text-[#5A5A40]">
              {formatMoney(member.totalSavingsAllTime)}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-[#E3DFC9] flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('card')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'card'
                  ? 'border-[#8E9775] text-[#383B2B]'
                  : 'border-transparent text-[#7A7A65] hover:text-[#383B2B]'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>31-Day Susu Stamp Card</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'transactions'
                  ? 'border-[#8E9775] text-[#383B2B]'
                  : 'border-transparent text-[#7A7A65] hover:text-[#383B2B]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Transaction Ledger ({memberTransactions.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={() => onOpenDeposit(member.id)}
              className="bg-[#8E9775] hover:bg-[#7D8665] text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <ArrowDownRight className="w-3 h-3" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => onOpenWithdrawal(member.id)}
              className="bg-[#C27D50] hover:bg-[#B06F45] text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* TAB 1: 31-Day Susu Stamp Card */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#7A7A65]">
                <span className="font-semibold text-[#383B2B]">Physical Passbook Equivalent</span>
                <span className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-[#C27D50] font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C27D50]"></span> Day 1 Office Fee
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#5A5E46] font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8E9775]"></span> Savings Stamped
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#8A8A70]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EAE7DC]"></span> Pending
                  </span>
                </span>
              </div>

              {/* 31-Day Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {member.stamps.map((stamp) => (
                  <div
                    key={stamp.day}
                    className={`relative p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      stamp.day === 1 && stamp.verified
                        ? 'bg-[#C27D50]/15 border-[#C27D50]/40 text-[#9A5025] shadow-xs'
                        : stamp.verified
                        ? 'bg-[#8E9775]/15 border-[#8E9775]/40 text-[#383B2B] shadow-xs'
                        : 'bg-white border-[#E3DFC9] text-[#8A8A70]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="text-[9px] font-bold text-[#8A8A70] uppercase">
                        D{stamp.day}
                      </span>
                      {stamp.day === 1 && (
                        <span className="text-[8px] font-bold px-1 rounded bg-[#C27D50]/20 text-[#9A5025]">
                          Office
                        </span>
                      )}
                    </div>

                    {stamp.verified ? (
                      <div className="my-1 flex flex-col items-center">
                        <div
                          className={`w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[9px] shadow-xs ${
                            stamp.day === 1 ? 'bg-[#C27D50]' : 'bg-[#8E9775]'
                          }`}
                        >
                          ✓
                        </div>
                        <span className="text-[10px] font-bold font-mono text-[#383B2B] mt-0.5">
                          {formatMoney(stamp.amount || member.dailyTarget)}
                        </span>
                        {stamp.date && (
                          <span className="text-[8px] text-[#7A7A65] font-sans">
                            {new Date(stamp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="my-2 text-[#C8C5B8] text-xs font-semibold">
                        ○
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Card Footer Summary */}
              <div className="p-3.5 bg-white rounded-2xl border border-[#DCD7C2] text-xs flex items-center justify-between text-[#383B2B]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8E9775]" />
                  <span>
                    <strong>{member.currentCyclePaidDays}</strong> of {member.susuCycleDays} days paid. (Day 1 for Office; remaining {member.currentCyclePaidDays > 1 ? member.currentCyclePaidDays - 1 : 0} days with {formatMoney(member.totalBalance)} available for flexible withdrawal).
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Transactions History */}
          {activeTab === 'transactions' && (
            <div className="space-y-2">
              {memberTransactions.length === 0 ? (
                <div className="text-center py-8 text-[#8A8A70] text-xs">
                  No transactions recorded yet for this saver.
                </div>
              ) : (
                memberTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl border border-[#E3DFC9] bg-white hover:bg-[#F9F8F4] transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'DEPOSIT'
                            ? tx.isFirstDepositOfficeFee
                              ? 'bg-[#C27D50]/20 text-[#C27D50]'
                              : 'bg-[#8E9775]/20 text-[#5A5E46]'
                            : 'bg-[#C27D50]/20 text-[#C27D50]'
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
                          <span className="font-bold text-[#383B2B]">
                            {tx.type === 'DEPOSIT'
                              ? tx.isFirstDepositOfficeFee
                                ? 'Day 1 Office Fee'
                                : 'Daily Savings Contribution'
                              : 'Savings Withdrawal'}
                          </span>
                          <span className="text-[10px] font-mono text-[#8A8A70]">{tx.receiptNumber}</span>
                          <WithdrawalStatusBadge status={tx.status} size="sm" showSubtext={false} />
                        </div>
                        <p className="text-[11px] text-[#7A7A65]">
                          {new Date(tx.timestamp).toLocaleString('en-GB', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })} • Via {tx.paymentMethod.replace(/_/g, ' ')} • Collector: {tx.bankerName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE7DC]">
                      <div className="text-right">
                        <span
                          className={`font-bold font-mono text-sm ${
                            tx.type === 'DEPOSIT'
                              ? tx.isFirstDepositOfficeFee
                                ? 'text-[#C27D50]'
                                : 'text-[#5A5E46]'
                              : 'text-[#C27D50]'
                          }`}
                        >
                          {tx.type === 'DEPOSIT' ? '+' : '-'}
                          {formatMoney(tx.amount)}
                        </span>
                      </div>

                      <button
                        onClick={() => setActiveReceipt(tx)}
                        className="p-1.5 hover:bg-[#EAE7DC] rounded-lg text-[#5A5A40] cursor-pointer"
                        title="View Official Receipt Voucher"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
