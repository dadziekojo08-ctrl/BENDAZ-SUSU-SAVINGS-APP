import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Transaction } from '../../types';
import {
  X,
  Printer,
  CheckCircle2,
  Building2,
  QrCode,
  Calendar,
  User,
  ShieldCheck,
  Smartphone,
  Stamp,
  Copy,
  Check,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Share2,
} from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { formatMoney, members } = useSusu();
  const [copied, setCopied] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  if (!transaction) return null;

  const member = members.find((m) => m.id === transaction.memberId);
  const isDeposit = transaction.type === 'DEPOSIT';

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(transaction.receiptNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
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
      <div className="relative bg-white text-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Bar */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between text-white shrink-0 ${
            isDeposit ? 'bg-emerald-700' : 'bg-amber-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              {isDeposit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white">
                {isDeposit
                  ? transaction.isFirstDepositOfficeFee
                    ? 'Official Day 1 Office Deposit Slip'
                    : 'Official Savings Deposit Slip'
                  : 'Official Withdrawal Voucher'}
              </h3>
              <p className="text-[11px] text-white/80 font-mono">Ref: {transaction.receiptNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors text-white cursor-pointer"
            title="Close Receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-4 sm:p-5 flex-1 bg-slate-50">
          <div
            id="printable-receipt"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden"
          >
            {/* Watermark */}
            <div className="absolute right-3 bottom-8 opacity-[0.04] pointer-events-none rotate-12 flex flex-col items-center">
              <div className="border-4 border-slate-900 rounded-full p-8 text-center">
                <span className="font-extrabold text-3xl tracking-widest uppercase">BENDAZ SUSU</span>
                <p className="text-xs font-bold">OFFICIAL RECEIPT</p>
              </div>
            </div>

            {/* Receipt Brand Header */}
            <div className="text-center pb-3.5 border-b border-dashed border-slate-300">
              <div className="inline-flex items-center justify-center gap-1.5 font-bold text-lg text-slate-900 tracking-tight">
                <span className="text-emerald-700 font-extrabold font-display">BENDAZ SUSU</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Daily Micro-Savings & Field Collector Network</p>
              <p className="text-[11px] text-slate-400">Ghana Susu Enterprise • Central Treasury</p>

              <div className="mt-2.5 inline-block">
                {isDeposit ? (
                  transaction.isFirstDepositOfficeFee ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      ★ DAY 1 OFFICE DEPOSIT RETAINED
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ✓ SAVINGS CONTRIBUTION CONFIRMED
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    ✓ WITHDRAWAL DISBURSED & SETTLED
                  </span>
                )}
              </div>
            </div>

            {/* Amount Section */}
            <div className="py-3.5 text-center border-b border-dashed border-slate-300 bg-slate-50/70 -mx-5 px-5 my-2">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                {isDeposit ? 'Amount Collected' : 'Disbursed Amount'}
              </span>
              <div
                className={`text-3xl font-extrabold tracking-tight mt-0.5 ${
                  isDeposit ? 'text-emerald-700' : 'text-amber-800'
                }`}
              >
                {formatMoney(transaction.amount)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {isDeposit && transaction.isFirstDepositOfficeFee ? (
                  <span className="text-amber-700 font-medium">
                    Day 1 fee retained for office administration • Unlocks 0% withdrawal fees
                  </span>
                ) : (
                  <span className="text-slate-600">
                    Withdrawal Fee: <strong className="text-emerald-700">GH₵ 0.00 (FREE)</strong> • Net Payout: <strong className="text-slate-900">{formatMoney(transaction.netAmount || transaction.amount)}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Details Table / Grid */}
            <div className="py-2.5 space-y-2 text-xs border-b border-dashed border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Receipt Ref:</span>
                <span className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                  {transaction.receiptNumber}
                  <button
                    onClick={handleCopyRef}
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
                    title="Copy Reference"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-medium text-slate-700">
                  {new Date(transaction.timestamp).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Saver / Member:</span>
                <span className="font-bold text-slate-900">{transaction.memberName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Susu Account #:</span>
                <span className="font-mono font-bold text-slate-800">
                  {member?.accountNumber || transaction.memberId}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="font-mono text-slate-700">{transaction.memberPhone}</span>
              </div>

              {member?.locationStall && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Market Stall / Store:</span>
                  <span className="font-medium text-slate-700 text-right">{member.locationStall}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Field Banker:</span>
                <span className="font-semibold text-slate-800">{transaction.bankerName}</span>
              </div>

              {member?.routeName && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Market Route:</span>
                  <span className="text-slate-700">{member.routeName}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-bold text-slate-800 uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                  {transaction.paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>

              {transaction.susuDayNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Savings Cycle Stamp:</span>
                  <span className="font-bold text-emerald-700">
                    Day #{transaction.susuDayNumber} of 31 Days
                  </span>
                </div>
              )}

              {transaction.approvedBy && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Admin Approval:</span>
                  <span className="font-semibold text-emerald-700">{transaction.approvedBy}</span>
                </div>
              )}

              {member && (
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 mt-1">
                  <span className="font-medium text-slate-700">Current Savings Balance:</span>
                  <span className="font-bold text-emerald-700 text-sm font-mono">
                    {formatMoney(member.totalBalance)}
                  </span>
                </div>
              )}
            </div>

            {/* Note & Official Verification */}
            <div className="pt-3 pb-1 text-center text-[11px] text-slate-500">
              <p>Contribution recorded securely in Bendaz Central Ledger.</p>
              <p className="mt-0.5 text-slate-400 font-mono text-[10px]">Thank you for saving with Bendaz Susu!</p>
            </div>

            {/* Barcode / Audit Stamp */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <QrCode className="w-5 h-5 text-slate-700" />
                <span>BENDAZ AUDIT HASH</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold block">
                  Official Verified
                </span>
                <span className="text-[9px] text-slate-400 font-mono">#2026-GH-SUSU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-3.5 bg-white flex items-center justify-between gap-2 border-t border-slate-200 shrink-0">
          <button
            onClick={handleSendSms}
            className={`flex-1 px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              smsSent
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{smsSent ? 'SMS Sent ✓' : 'Send SMS'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
