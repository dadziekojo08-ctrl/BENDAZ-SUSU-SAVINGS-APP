import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Member, PaymentMethod } from '../../types';
import {
  X,
  Coins,
  ArrowDownRight,
  User,
  Search,
  CheckCircle2,
  Calendar,
  Smartphone,
  Wallet,
  Building2,
  Receipt,
  Sparkles,
  Info,
} from 'lucide-react';

interface RecordDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMemberId?: string;
}

export const RecordDepositModal: React.FC<RecordDepositModalProps> = ({
  isOpen,
  onClose,
  initialMemberId,
}) => {
  const {
    members,
    bankers,
    activeBankerId,
    currentUser,
    recordDeposit,
    formatMoney,
    getCurrencySymbol,
  } = useSusu();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId || '');
  const [selectedBankerId, setSelectedBankerId] = useState(activeBankerId || bankers[0]?.id || '');
  const [amount, setAmount] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState('');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialMemberId) {
      setSelectedMemberId(initialMemberId);
      const m = members.find((mem) => mem.id === initialMemberId);
      if (m) {
        setAmount(m.dailyTarget || 50);
        setSelectedBankerId(m.assignedBankerId || activeBankerId);
        setSelectedDayNumber(Math.min(m.currentCyclePaidDays + 1, m.susuCycleDays));
      }
    } else if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
      setAmount(members[0].dailyTarget || 50);
      setSelectedBankerId(members[0].assignedBankerId || activeBankerId);
      setSelectedDayNumber(Math.min(members[0].currentCyclePaidDays + 1, members[0].susuCycleDays));
    }
  }, [initialMemberId, isOpen, members, activeBankerId, selectedMemberId]);

  if (!isOpen) return null;

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const isFirstDeposit = selectedMember ? (selectedMember.currentCyclePaidDays === 0 && selectedMember.officeFeePaid === 0) : false;

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.locationStall.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMember = (m: Member) => {
    setSelectedMemberId(m.id);
    setAmount(m.dailyTarget || 50);
    setSelectedBankerId(m.assignedBankerId || activeBankerId);
    setSelectedDayNumber(Math.min(m.currentCyclePaidDays + 1, m.susuCycleDays));
    setSearchQuery('');
  };

  const handleQuickAddAmount = (addValue: number) => {
    setAmount((prev) => Math.max(0, (Number(prev) || 0) + addValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedMemberId) {
      setError('Please select a member to credit');
      return;
    }

    if (!amount || amount <= 0) {
      setError('Please enter a valid deposit amount greater than zero');
      return;
    }

    try {
      recordDeposit({
        memberId: selectedMemberId,
        bankerId: selectedBankerId || activeBankerId,
        amount: Number(amount),
        paymentMethod,
        notes,
        dayNumber: selectedDayNumber,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record deposit');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-3xl max-w-lg w-full shadow-2xl border border-[#E3DFC9] overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#383B2B] px-6 py-4 text-white flex items-center justify-between border-b border-[#4A4D3A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#8E9775]/25 border border-[#8E9775]/40 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-[#EAE7DC]" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-[#F9F8F4]">Record Member Contribution</h2>
              <p className="text-xs text-[#D8D5C8]">Input by Field Banker / Back Office Staff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* First Deposit Notice if Day 1 */}
        {isFirstDeposit && (
          <div className="bg-[#8E9775]/15 border-b border-[#8E9775]/30 px-6 py-2.5 flex items-center gap-2 text-xs text-[#383B2B]">
            <Info className="w-4 h-4 text-[#5A5E46] shrink-0" />
            <span>
              <strong>First Deposit Rule:</strong> This Day 1 contribution is retained for the Office. All future withdrawals will have <strong>GH₵0 fees</strong>.
            </span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#C27D50]/15 border border-[#C27D50]/30 text-[#9A5025] text-xs rounded-xl flex items-center gap-2">
              <X className="w-4 h-4 text-[#C27D50] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Member Selection / Search */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">
              1. Select Saver / Member
            </label>
            
            {/* Search input if changing */}
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, stall #, phone or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              />
            </div>

            {/* Filtered members list dropdown if searching */}
            {searchQuery && (
              <div className="max-h-40 overflow-y-auto border border-[#EAE7DC] rounded-xl bg-white divide-y divide-[#EAE7DC] mb-3 shadow-inner">
                {filteredMembers.length === 0 ? (
                  <div className="p-3 text-xs text-[#7A7A65] text-center">No member matches found</div>
                ) : (
                  filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMember(m)}
                      className="w-full text-left p-2.5 hover:bg-[#F9F8F4] text-xs flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-semibold text-[#383B2B]">{m.name}</span>
                        <span className="text-[#7A7A65] text-[11px] block">{m.locationStall} • {m.phone}</span>
                      </div>
                      <span className="font-mono text-[#5A5E46] font-bold">{formatMoney(m.dailyTarget)}/day</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Active Selected Member Card */}
            {selectedMember && (
              <div className="p-3.5 bg-white rounded-2xl border border-[#DCD7C2] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#D8D5C8] shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#383B2B] flex items-center gap-1.5">
                      {selectedMember.name}
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EAE7DC] text-[#5A5A40]">
                        {selectedMember.id}
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#7A7A65]">{selectedMember.locationStall}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="text-[#5A5E46] font-semibold">
                        Savings: {formatMoney(selectedMember.totalBalance)}
                      </span>
                      <span className="text-[#B8B5A8]">•</span>
                      <span className="text-[#7A7A65] font-medium">
                        Pledged: {formatMoney(selectedMember.dailyTarget)}/day
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-[#F9F8F4] px-2.5 py-1 rounded-xl border border-[#D8D5C8] text-center shadow-xs">
                    <span className="text-[10px] text-[#7A7A65] uppercase font-bold block">Stamp Day</span>
                    <span className="text-sm font-extrabold text-[#5A5E46]">
                      #{selectedMember.currentCyclePaidDays + 1}
                      <span className="text-[#8A8A70] text-xs font-normal">/{selectedMember.susuCycleDays}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Amount Section */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                2. Deposit Amount ({getCurrencySymbol()})
              </label>
              {selectedMember && (
                <button
                  type="button"
                  onClick={() => setAmount(selectedMember.dailyTarget)}
                  className="text-xs text-[#6B7555] font-semibold hover:underline cursor-pointer"
                >
                  Reset to Target ({formatMoney(selectedMember.dailyTarget)})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[#7A7A65] font-bold text-lg">
                {getCurrencySymbol()}
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xl font-bold font-serif-brand text-[#383B2B] focus:ring-2 focus:ring-[#8E9775] focus:outline-none shadow-xs"
              />
            </div>

            {/* Quick Denomination Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-[#8A8A70] font-medium">Quick add:</span>
              {[10, 20, 50, 100, 200].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-[#EAE7DC]/60 hover:bg-[#8E9775]/20 hover:text-[#383B2B] text-[#5A5A40] text-xs font-bold transition-colors border border-[#D8D5C8] cursor-pointer"
                >
                  +{getCurrencySymbol()}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">
              3. Cash In-Hand / Collection Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CASH', label: 'Cash In-Hand', icon: Wallet },
                { id: 'MTN_MOMO', label: 'MTN MoMo', icon: Smartphone },
                { id: 'TELECEL_CASH', label: 'Telecel Cash', icon: Smartphone },
                { id: 'AIRTELTIGO', label: 'AirtelTigo', icon: Smartphone },
                { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2 },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#8E9775] bg-[#8E9775]/20 text-[#383B2B] ring-2 ring-[#8E9775]/30'
                        : 'border-[#D8D5C8] bg-white text-[#5A5A40] hover:bg-[#F9F8F4]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#5A5E46]' : 'text-[#8A8A70]'}`} />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Banker in Charge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Collecting Banker
              </label>
              <select
                value={selectedBankerId}
                onChange={(e) => setSelectedBankerId(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
              >
                {bankers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.zone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Susu Day Stamp
              </label>
              <input
                type="number"
                min="1"
                max={selectedMember?.susuCycleDays || 31}
                value={selectedDayNumber || ''}
                onChange={(e) => setSelectedDayNumber(Number(e.target.value))}
                placeholder={`Auto Day (1-${selectedMember?.susuCycleDays || 31})`}
                className="w-full p-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Collector Notes / Transaction Reference (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid in cash at Makola stall 24"
              className="w-full p-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
            />
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
              <span>Confirm & Stamp Deposit ({formatMoney(amount)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
