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
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-3xl max-w-lg w-full shadow-2xl border border-[#E3DFC9] overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#383B2B] px-6 py-4 text-white flex items-center justify-between border-b border-[#4A4D3A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C27D50]/25 border border-[#C27D50]/40 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-[#EAE7DC]" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-[#F9F8F4]">Initiate Member Withdrawal</h2>
              <p className="text-xs text-[#D8D5C8]">Flexible Anytime Payout • Requires Admin Approval</p>
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
        <div className="bg-[#8E9775]/15 border-b border-[#8E9775]/30 px-6 py-2.5 flex items-center gap-2 text-xs text-[#383B2B]">
          <Info className="w-4 h-4 text-[#5A5E46] shrink-0" />
          <span>
            <strong>Zero Withdrawal Charges</strong> (Office fee paid on Day 1). Banker initiates request; Admin Bernard must approve before payout.
          </span>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#C27D50]/15 border border-[#C27D50]/30 text-[#9A5025] text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C27D50] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">
              1. Select Saver / Member
            </label>

            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search member by name, stall or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              />
            </div>

            {searchQuery && (
              <div className="max-h-36 overflow-y-auto border border-[#EAE7DC] rounded-xl bg-white divide-y divide-[#EAE7DC] mb-2 shadow-inner">
                {filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMember(m)}
                    className="w-full text-left p-2 hover:bg-[#F9F8F4] text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-[#383B2B]">{m.name}</span>
                      <span className="text-[#7A7A65] text-[11px] block">{m.locationStall}</span>
                    </div>
                    <span className="font-mono text-[#5A5E46] font-bold">
                      Savings: {formatMoney(m.totalBalance)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Member Preview */}
            {selectedMember && (
              <div className="p-3.5 bg-white rounded-2xl border border-[#DCD7C2] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#D8D5C8] shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#383B2B]">{selectedMember.name}</h4>
                    <p className="text-[11px] text-[#7A7A65]">{selectedMember.locationStall} • {selectedMember.phone}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                      <span className="text-[#6A6A55]">Day {selectedMember.currentCyclePaidDays}/{selectedMember.susuCycleDays} of cycle</span>
                      <span className="text-[#8E9775] font-semibold">• Office Fee Paid: {formatMoney(selectedMember.officeFeePaid || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#7A7A65] uppercase font-bold block">Available Balance</span>
                  <span className="text-base font-extrabold text-[#5A5E46] font-mono">
                    {formatMoney(selectedMember.totalBalance)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Withdrawal Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                2. Amount to Withdraw ({getCurrencySymbol()})
              </label>
              {selectedMember && (
                <span className="text-xs text-[#7A7A65]">
                  Available: <strong className="text-[#5A5E46]">{formatMoney(selectedMember.totalBalance)}</strong>
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[#7A7A65] font-bold text-lg">
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
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xl font-bold font-serif-brand text-[#383B2B] focus:ring-2 focus:ring-[#8E9775] focus:outline-none shadow-xs"
              />
            </div>

            {/* Quick Percentage Chips */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-[#8A8A70] font-medium">Quick select:</span>
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentageClick(pct)}
                  className="px-2 py-0.5 rounded-lg bg-[#EAE7DC]/60 hover:bg-[#8E9775]/20 text-[#5A5A40] hover:text-[#383B2B] text-xs font-semibold border border-[#D8D5C8] transition-colors cursor-pointer"
                >
                  {pct === 100 ? 'Full Payout (100%)' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Zero Fee & Net Breakdown */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#DCD7C2] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#5A5E46]">
                <Coins className="w-4 h-4 text-[#8E9775]" />
                <span className="font-semibold text-[#383B2B]">
                  Withdrawal Charges (0% Fee Policy)
                </span>
              </div>
              <span className="font-mono font-bold text-[#8E9775]">
                GH₵ 0.00 (FREE)
              </span>
            </div>

            <div className="pt-2 border-t border-[#EAE7DC] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#7A7A65] block">Net Disbursable Amount:</span>
                <span className="text-lg font-extrabold text-[#5A5E46] font-serif-brand">
                  {formatMoney(netPayout)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[#7A7A65] block">Remaining Savings:</span>
                <span className="text-sm font-bold text-[#5A5A40] font-mono">
                  {formatMoney(remainingBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Payout Mode & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Requested Payout Method
              </label>
              <select
                value={payoutMode}
                onChange={(e) => setPayoutMode(e.target.value as PayoutMode)}
                className="w-full p-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
              >
                <option value="BANKER_CASH_HANDOVER">💵 Banker Cash Handover (Post-Approval)</option>
                <option value="ADMIN_MOMO_TRANSFER">📲 Back Office MoMo Payout</option>
                <option value="VAULT_PICKUP">🏛️ Office / Vault Cash Collection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Disbursement Medium
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
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
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Timing & Reason for Withdrawal
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
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
          <div className="p-3 bg-[#EFECE3] rounded-xl border border-[#DCD7C2] flex items-center gap-2.5 text-xs text-[#5A5A40]">
            <Clock className="w-4 h-4 text-[#8E9775] shrink-0" />
            <p className="text-[11px] leading-tight">
              <strong>Workflow Safeguard:</strong> This withdrawal request will be sent to Admin Bernard's Approval Queue. Banker cannot hand over cash until approval is granted.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#EAE7DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D8D5C8] text-[#5A5A40] text-xs font-bold hover:bg-[#EAE7DC]/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#383B2B] hover:bg-[#2A2B20] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#8E9775]" />
              <span>Submit Request for Admin Approval ({formatMoney(netPayout)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
