import React from 'react';
import { useSusu } from '../../context/SusuContext';
import { Transaction } from '../../types';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  Building2,
  QrCode,
  Calendar,
  User,
  ShieldCheck,
  Smartphone,
  Stamp,
  Copy,
  Coins,
} from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { formatMoney, members } = useSusu();

  if (!transaction) return null;

  const member = members.find((m) => m.id === transaction.memberId);
  const isDeposit = transaction.type === 'DEPOSIT';

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(transaction.receiptNumber);
    alert(`Copied receipt number: ${transaction.receiptNumber}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-[#F9F8F4] text-[#4A4A40] rounded-3xl max-w-md w-full shadow-2xl border border-[#E3DFC9] overflow-hidden my-6">
        {/* Modal Header */}
        <div className={`p-4 text-white flex items-center justify-between border-b border-[#4A4D3A] ${
          isDeposit ? 'bg-[#383B2B]' : 'bg-[#7A4B28]'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Stamp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-serif-brand font-bold text-sm text-[#F9F8F4]">
                {isDeposit
                  ? transaction.isFirstDepositOfficeFee
                    ? 'Official Day 1 Office Retained Deposit Slip'
                    : 'Official Susu Contribution Slip'
                  : 'Susu Withdrawal Disbursement Voucher'}
              </h3>
              <p className="text-[11px] text-[#D8D5C8]">Ref: {transaction.receiptNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt" className="p-6 bg-[#F9F8F4] border-b border-[#EAE7DC]">
          <div className="bg-white p-5 rounded-2xl border border-[#DCD7C2] shadow-xs relative overflow-hidden font-sans">
            {/* Watermark Stamp */}
            <div className="absolute right-2 bottom-6 opacity-10 pointer-events-none rotate-12 flex flex-col items-center">
              <div className="border-4 border-[#8E9775] rounded-full p-6 text-center">
                <span className="font-extrabold text-2xl tracking-widest text-[#383B2B] uppercase">
                  BENDAZ SUSU
                </span>
                <p className="text-xs font-bold text-[#5A5E46]">VERIFIED OFFICIAL</p>
              </div>
            </div>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-dashed border-[#D8D5C8]">
              <div className="inline-flex items-center justify-center gap-1.5 font-serif-brand font-extrabold text-lg text-[#383B2B]">
                <span>BENDAZ SUSU APP</span>
              </div>
              <p className="text-[11px] text-[#7A7A65] font-medium">Daily Thrift & Micro-Savings Network</p>
              <p className="text-[10px] text-[#8A8A70]">Registered Susu Enterprise • Admin: Bernard</p>
              
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#8E9775]/20 text-[#383B2B] border border-[#8E9775]/35">
                {isDeposit
                  ? transaction.isFirstDepositOfficeFee
                    ? '★ DAY 1 OFFICE DEPOSIT RETAINED'
                    : '✓ SAVINGS CONTRIBUTION STAMPED'
                  : '✓ WITHDRAWAL APPROVED & PROCESSED'}
              </div>
            </div>

            {/* Amount Callout */}
            <div className="py-4 text-center border-b border-dashed border-[#D8D5C8]">
              <span className="text-xs text-[#7A7A65] uppercase tracking-wider font-semibold">
                {isDeposit ? 'Amount Collected' : 'Disbursed Savings'}
              </span>
              <div className="text-3xl font-extrabold text-[#383B2B] font-serif-brand mt-0.5">
                {formatMoney(transaction.amount)}
              </div>
              <div className="text-[11px] text-[#7A7A65] mt-1">
                {isDeposit && transaction.isFirstDepositOfficeFee ? (
                  <span className="text-[#C27D50] font-semibold">
                    First deposit retained for Office • Unlocks GH₵0.00 withdrawal charges
                  </span>
                ) : (
                  <span>
                    Withdrawal Fee: <strong className="text-[#5A5E46]">GH₵ 0.00 (FREE)</strong> • Net: <strong className="text-[#383B2B]">{formatMoney(transaction.netAmount)}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="py-3 space-y-2 text-xs border-b border-dashed border-[#D8D5C8]">
              <div className="flex justify-between">
                <span className="text-[#7A7A65]">Receipt Ref:</span>
                <span className="font-mono font-bold text-[#383B2B] flex items-center gap-1">
                  {transaction.receiptNumber}
                  <button onClick={handleCopyRef} className="text-[#8A8A70] hover:text-[#4A4A40] cursor-pointer">
                    <Copy className="w-3 h-3" />
                  </button>
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A7A65]">Date & Time:</span>
                <span className="font-medium text-[#4A4A40]">
                  {new Date(transaction.timestamp).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A7A65]">Saver / Member:</span>
                <span className="font-semibold text-[#383B2B]">{transaction.memberName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A7A65]">Susu Account #:</span>
                <span className="text-[#383B2B] font-mono font-bold">{member?.accountNumber || transaction.memberId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A7A65]">Contact Phone:</span>
                <span className="text-[#5A5A40] font-mono">{transaction.memberPhone}</span>
              </div>

              {member?.locationStall && (
                <div className="flex justify-between">
                  <span className="text-[#7A7A65]">Stall / Location:</span>
                  <span className="text-[#5A5A40] text-right">{member.locationStall}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#7A7A65]">Field Collector:</span>
                <span className="font-medium text-[#5A5E46]">{transaction.bankerName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7A7A65]">Payment Channel:</span>
                <span className="font-bold text-[#4A4A40] uppercase px-1.5 py-0.5 rounded bg-[#EAE7DC]/60 border border-[#D8D5C8] text-[10px]">
                  {transaction.paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>

              {transaction.susuDayNumber && (
                <div className="flex justify-between">
                  <span className="text-[#7A7A65]">Cycle Day Stamp:</span>
                  <span className="font-bold text-[#6B7555]">
                    Day #{transaction.susuDayNumber} of 31 Days
                  </span>
                </div>
              )}

              {transaction.approvedBy && (
                <div className="flex justify-between">
                  <span className="text-[#7A7A65]">Admin Approval:</span>
                  <span className="font-bold text-[#5A5E46]">{transaction.approvedBy}</span>
                </div>
              )}

              {member && (
                <div className="flex justify-between pt-1 border-t border-[#EAE7DC]">
                  <span className="text-[#5A5A40] font-medium">Available Savings Balance:</span>
                  <span className="font-bold text-[#5A5E46] text-sm font-mono">
                    {formatMoney(member.totalBalance)}
                  </span>
                </div>
              )}
            </div>

            {/* Note / SMS notification notice */}
            <div className="pt-3 pb-2 text-center text-[10px] text-[#7A7A65]">
              <p>Contribution recorded into Bendaz Central Ledger.</p>
              <p className="mt-0.5 text-[#8A8A70] font-mono">Thank you for saving with Bendaz Susu!</p>
            </div>

            {/* Barcode & Security stamp */}
            <div className="mt-2 pt-2 border-t border-[#EAE7DC] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-[#8A8A70] font-mono">
                <QrCode className="w-6 h-6 text-[#5A5A40]" />
                <span>BENDAZ AUDIT HASH</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-[#5A5E46] font-bold block">
                  Bendaz Official Stamp
                </span>
                <span className="text-[8px] text-[#8A8A70]">SECURE #2026-GH-SUSU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white flex items-center justify-between gap-3 border-t border-[#EAE7DC]">
          <button
            onClick={() => {
              alert(`SMS Receipt dispatch simulated for ${transaction.memberPhone}`);
            }}
            className="flex-1 px-3 py-2 rounded-xl border border-[#D8D5C8] text-[#5A5A40] hover:bg-[#F9F8F4] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#8E9775]" />
            <span>Send SMS</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 px-3 py-2 rounded-xl bg-[#383B2B] hover:bg-[#2A2B20] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#EAE7DC] hover:bg-[#D8D5C8] text-[#4A4A40] text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
