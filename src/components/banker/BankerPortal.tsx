import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Member, Transaction } from '../../types';
import {
  Wallet,
  MapPin,
  Target,
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Search,
  CheckCircle2,
  Clock,
  UserPlus,
  Store,
  Printer,
  ChevronRight,
  Sparkles,
  Phone,
  Scale,
  Calendar,
  Filter,
  User,
  X,
  ArrowUpDown,
} from 'lucide-react';

interface BankerPortalProps {
  onOpenDeposit: (memberId?: string) => void;
  onOpenWithdrawal: (memberId?: string) => void;
  onOpenNewMember: () => void;
  onOpenReconcile: (bankerId: string) => void;
  onSelectMember: (member: Member) => void;
}

export const BankerPortal: React.FC<BankerPortalProps> = ({
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenNewMember,
  onOpenReconcile,
  onSelectMember,
}) => {
  const {
    activeBanker,
    bankers,
    routes,
    members,
    transactions,
    formatMoney,
    getCurrencySymbol,
    recordDeposit,
    setActiveReceipt,
  } = useSusu();

  const [selectedBankerFilter, setSelectedBankerFilter] = useState<string>('MY_ASSIGNED');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID_TODAY' | 'CYCLE_COMPLETED' | 'IN_PROGRESS'>('ALL');
  const [sortBy, setSortBy] = useState<'stall' | 'name_asc' | 'name_desc' | 'balance_desc' | 'cycle_desc'>('stall');
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeBanker) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-3xl border border-[#DCD7C2] shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] text-[#6A6A55] flex items-center justify-center mx-auto">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif-brand font-bold text-lg text-[#383B2B]">No Field Banker Profile Available</h3>
          <p className="text-xs text-[#7A7A65] mt-1">
            Please log in with an authorized Field Banker account or create a new banker from Admin HQ.
          </p>
        </div>
      </div>
    );
  }

  // Base list of members depending on banker filter
  const baseMembers = members.filter((m) => {
    if (selectedBankerFilter === 'MY_ASSIGNED') {
      return m.assignedBankerId === activeBanker.id || m.routeId === activeBanker.routeId;
    }
    if (selectedBankerFilter === 'ALL') {
      return true;
    }
    return m.assignedBankerId === selectedBankerFilter;
  });

  const myAssignedMembers = members.filter(
    (m) => m.assignedBankerId === activeBanker.id || m.routeId === activeBanker.routeId
  );

  const pendingMembers = myAssignedMembers.filter((m) => !m.depositedToday);
  const completedMembers = myAssignedMembers.filter((m) => m.depositedToday);

  const filteredMembers = baseMembers
    .filter((m) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.locationStall.toLowerCase().includes(query) ||
        m.phone.includes(query) ||
        (m.accountNumber && m.accountNumber.toLowerCase().includes(query)) ||
        m.id.toLowerCase().includes(query) ||
        (m.assignedBankerName && m.assignedBankerName.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (selectedStatusFilter === 'PENDING') return !m.depositedToday;
      if (selectedStatusFilter === 'PAID_TODAY') return m.depositedToday;
      if (selectedStatusFilter === 'CYCLE_COMPLETED') return m.currentCyclePaidDays >= m.susuCycleDays;
      if (selectedStatusFilter === 'IN_PROGRESS') return m.currentCyclePaidDays < m.susuCycleDays;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'stall') return a.locationStall.localeCompare(b.locationStall, undefined, { numeric: true });
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'balance_desc') return b.totalBalance - a.totalBalance;
      if (sortBy === 'cycle_desc') return (b.currentCyclePaidDays / b.susuCycleDays) - (a.currentCyclePaidDays / a.susuCycleDays);
      return 0;
    });

  const netCashInBag = Math.max(0, activeBanker.collectedToday - activeBanker.withdrawnToday);

  // Quick 1-click deposit handler
  const handleQuickDeposit = (member: Member) => {
    try {
      recordDeposit({
        memberId: member.id,
        bankerId: activeBanker.id,
        amount: member.dailyTarget,
        paymentMethod: 'CASH',
        notes: `Quick 1-click cash collection at ${member.locationStall}`,
      });
    } catch (e: any) {
      alert(e.message || 'Error collecting deposit');
    }
  };

  // Recent transactions by this banker today
  const bankerTodayTransactions = transactions.filter((t) => t.bankerId === activeBanker.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banker Profile & Route Header Card */}
      <div className="bg-[#383B2B] rounded-3xl p-6 text-white shadow-xl border border-[#4A4D3A]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={activeBanker.avatar}
              alt={activeBanker.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#8E9775] shadow-md ring-4 ring-[#8E9775]/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#8E9775]/30 text-[#EAE7DC] border border-[#8E9775]/40 font-bold">
                  {activeBanker.id} • Field Banker
                </span>
                {activeBanker.status === 'reconciled' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE7DC]/20 text-[#EAE7DC] border border-[#EAE7DC]/40">
                    Shift Settled
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8E9775]/40 text-[#EAE7DC] border border-[#8E9775] animate-pulse">
                    ● Active Route
                  </span>
                )}
              </div>
              <h1 className="font-serif-brand font-bold text-2xl tracking-tight text-[#F9F8F4] mt-1">
                {activeBanker.name}
              </h1>
              <p className="text-xs text-[#D8D5C8] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#8E9775]" />
                <span>{activeBanker.routeName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenReconcile(activeBanker.id)}
              className="bg-[#C27D50] hover:bg-[#B06F45] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Settle Shift Cash</span>
            </button>

            <button
              onClick={onOpenNewMember}
              className="bg-white/10 hover:bg-white/20 text-[#F9F8F4] border border-white/20 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#8E9775]" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Collection & Float Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#4A4D3A]">
          <div className="bg-[#2E3123] p-3.5 rounded-2xl border border-[#4A4D3A]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#D8D5C8]">Today's Total Collected:</span>
            </div>
            <div className="text-xl font-extrabold text-white font-display mt-0.5">
              {formatMoney(activeBanker.collectedToday)}
            </div>
            <span className="text-[11px] text-[#8E9775] block mt-1">
              Field Cash Inflow
            </span>
          </div>

          <div className="bg-[#2E3123] p-3.5 rounded-2xl border border-[#4A4D3A]">
            <span className="text-xs text-[#D8D5C8] block">Cash in Bag (Remittance Due):</span>
            <div className="text-xl font-extrabold text-[#8E9775] font-display mt-0.5">
              {formatMoney(netCashInBag)}
            </div>
            <span className="text-[11px] text-[#A8A598] block mt-1">
              Disbursed for Payouts: {formatMoney(activeBanker.withdrawnToday)}
            </span>
          </div>

          <div className="bg-[#2E3123] p-3.5 rounded-2xl border border-[#4A4D3A]">
            <span className="text-xs text-[#D8D5C8] block">Stops Visited Today:</span>
            <div className="text-xl font-extrabold text-[#D4A359] font-display mt-0.5">
              {completedMembers.length} / {myAssignedMembers.length} Stalls
            </div>
            <span className="text-[11px] text-[#A8A598] block mt-1">
              {pendingMembers.length} stops remaining on route
            </span>
          </div>
        </div>
      </div>

      {/* Main Route Stops Card */}
      <div className="bg-white rounded-3xl border border-[#EAE7DC] shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 border-b border-[#EAE7DC] space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-[#3A3D2C]">
                Route Stops & Savers Checklist
              </h2>
              <p className="text-xs text-[#7A7A65]">
                Record daily collections, search stall locations, and filter by collector or payment status.
              </p>
            </div>
          </div>

          {/* Search Input with Clear Button */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A8A70] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search saver by name, stall number, ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-[#F9F8F4] border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40] font-medium shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#8A8A70] hover:text-[#383B2B] p-0.5 rounded-full hover:bg-[#EAE7DC] transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Banker / Scope Filter */}
            <div className="flex items-center gap-1.5 bg-[#F9F8F4] px-2.5 py-1.5 rounded-xl border border-[#D8D5C8] text-xs shadow-2xs">
              <User className="w-3.5 h-3.5 text-[#6A6A55]" />
              <span className="text-[11px] font-bold text-[#7A7A65] uppercase">Banker:</span>
              <select
                value={selectedBankerFilter}
                onChange={(e) => setSelectedBankerFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#3A3D2C] focus:outline-none cursor-pointer pr-1"
              >
                <option value="MY_ASSIGNED">My Route Savers ({myAssignedMembers.length})</option>
                <option value="ALL">All Field Bankers ({members.length})</option>
                {bankers
                  .filter((b) => b.id !== activeBanker.id)
                  .map((b) => {
                    const count = members.filter((m) => m.assignedBankerId === b.id).length;
                    return (
                      <option key={b.id} value={b.id}>
                        {b.name} ({count})
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#F9F8F4] px-2.5 py-1.5 rounded-xl border border-[#D8D5C8] text-xs shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-[#6A6A55]" />
              <span className="text-[11px] font-bold text-[#7A7A65] uppercase">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-[#3A3D2C] focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All Statuses ({baseMembers.length})</option>
                <option value="PENDING">
                  ⏳ Pending Collection ({baseMembers.filter((m) => !m.depositedToday).length})
                </option>
                <option value="PAID_TODAY">
                  ✓ Collected Today ({baseMembers.filter((m) => m.depositedToday).length})
                </option>
                <option value="CYCLE_COMPLETED">
                  🏁 31-Day Cycle Done ({baseMembers.filter((m) => m.currentCyclePaidDays >= m.susuCycleDays).length})
                </option>
                <option value="IN_PROGRESS">
                  🔄 In Progress ({baseMembers.filter((m) => m.currentCyclePaidDays < m.susuCycleDays).length})
                </option>
              </select>
            </div>

            {/* Sort Order Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#F9F8F4] px-2.5 py-1.5 rounded-xl border border-[#D8D5C8] text-xs shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#6A6A55]" />
              <span className="text-[11px] font-bold text-[#7A7A65] uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-[#3A3D2C] focus:outline-none cursor-pointer pr-1"
              >
                <option value="stall">Stall / Location</option>
                <option value="name_asc">Name (A → Z)</option>
                <option value="name_desc">Name (Z → A)</option>
                <option value="balance_desc">Highest Balance</option>
                <option value="cycle_desc">Passbook Progress</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(searchQuery || selectedBankerFilter !== 'MY_ASSIGNED' || selectedStatusFilter !== 'ALL' || sortBy !== 'stall') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBankerFilter('MY_ASSIGNED');
                  setSelectedStatusFilter('ALL');
                  setSortBy('stall');
                }}
                className="text-xs font-bold text-[#C27D50] hover:text-[#9A5025] flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-[#C27D50]/10 transition-colors cursor-pointer ml-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Filter Status Badge / Counter */}
          <div className="flex items-center justify-between text-[11px] text-[#7A7A65] pt-1 border-t border-[#EAE7DC]/80">
            <span>
              Showing <strong className="text-[#383B2B]">{filteredMembers.length}</strong> of{' '}
              <strong className="text-[#383B2B]">{baseMembers.length}</strong> savers
            </span>
            {selectedBankerFilter !== 'MY_ASSIGNED' && (
              <span className="bg-[#8E9775]/20 text-[#383B2B] px-2 py-0.5 rounded-md font-semibold text-[10px]">
                Viewing:{' '}
                {selectedBankerFilter === 'ALL'
                  ? 'All Bankers'
                  : bankers.find((b) => b.id === selectedBankerFilter)?.name || selectedBankerFilter}
              </span>
            )}
          </div>
        </div>

        {/* Member Stops List */}
        <div className="divide-y divide-[#EAE7DC] p-2">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 px-4 text-[#8A8A70] text-xs space-y-2">
              <Search className="w-6 h-6 mx-auto text-[#A8A598]" />
              <p className="font-semibold text-[#4A4A40]">No savers found matching current search or filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBankerFilter('MY_ASSIGNED');
                  setSelectedStatusFilter('ALL');
                  setSortBy('stall');
                }}
                className="px-3 py-1.5 bg-[#F4F1EA] hover:bg-[#EAE7DC] text-[#383B2B] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isPaid = member.depositedToday;
              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-1 ${
                    isPaid
                      ? 'bg-[#8E9775]/10 border border-[#8E9775]/30'
                      : 'bg-white hover:bg-[#F9F8F4] border border-[#EAE7DC] shadow-xs'
                  }`}
                >
                  {/* Member Info */}
                  <div
                    className="flex items-center gap-3.5 cursor-pointer"
                    onClick={() => onSelectMember(member)}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#D8D5C8] shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#3A3D2C]">{member.name}</h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#EAE7DC] text-[#4A5038]">
                          {member.accountNumber || member.id}
                        </span>
                        {isPaid ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8E9775]/20 text-[#4A5038] border border-[#8E9775]/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#5A5E46]" />
                            PAID TODAY
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C27D50]/20 text-[#9A5025] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C27D50]" />
                            VISIT PENDING
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#6A6A55] flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Store className="w-3 h-3 text-[#8A8A70]" />
                          <span>{member.locationStall}</span>
                        </span>
                        <span className="text-[#D8D5C8]">•</span>
                        <span>{member.phone}</span>
                        {member.assignedBankerId !== activeBanker.id && member.assignedBankerName && (
                          <>
                            <span className="text-[#D8D5C8]">•</span>
                            <span className="bg-[#EAE7DC] text-[#4A4A40] text-[10px] px-1.5 py-0.2 rounded font-semibold">
                              {member.assignedBankerName}
                            </span>
                          </>
                        )}
                      </p>

                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-[#6A6A55]">
                          Balance: <strong className="text-[#5A5E46]">{formatMoney(member.totalBalance)}</strong>
                        </span>
                        <span className="text-[#D8D5C8]">•</span>
                        <span className="text-[#6A6A55]">
                          Card: <strong>Day {member.currentCyclePaidDays}/{member.susuCycleDays}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isPaid ? (
                      <button
                        onClick={() => handleQuickDeposit(member)}
                        className="bg-[#8E9775] hover:bg-[#7D8665] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>Collect {formatMoney(member.dailyTarget)}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenDeposit(member.id)}
                        className="bg-[#8E9775]/20 hover:bg-[#8E9775]/30 text-[#4A5038] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>+ Extra Deposit</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenWithdrawal(member.id)}
                      className="bg-[#C27D50]/15 hover:bg-[#C27D50]/25 text-[#9A5025] border border-[#C27D50]/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Initiate Member Savings Withdrawal"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>

                    <button
                      onClick={() => onSelectMember(member)}
                      className="p-2 hover:bg-[#EAE7DC] rounded-xl text-[#7A7A65] cursor-pointer"
                      title="Inspect Passbook"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Banker Today Recent Transactions */}
      <div className="bg-white rounded-3xl border border-[#EAE7DC] p-5 shadow-sm space-y-3">
        <h3 className="font-serif-brand font-bold text-base text-[#3A3D2C]">
          My Collection Activity Today ({bankerTodayTransactions.length} Transactions)
        </h3>

        <div className="space-y-2">
          {bankerTodayTransactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-xl bg-[#F9F8F4] hover:bg-[#EAE7DC]/60 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                    tx.type === 'DEPOSIT'
                      ? 'bg-[#8E9775]/20 text-[#4A5038]'
                      : 'bg-[#C27D50]/20 text-[#9A5025]'
                  }`}
                >
                  {tx.type === 'DEPOSIT' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-bold text-[#3A3D2C] block">{tx.memberName}</span>
                  <span className="text-[10px] text-[#8A8A70]">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.paymentMethod.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-mono font-bold text-sm ${
                    tx.type === 'DEPOSIT' ? 'text-[#5A5E46]' : 'text-[#C27D50]'
                  }`}
                >
                  {tx.type === 'DEPOSIT' ? '+' : '-'}
                  {formatMoney(tx.amount)}
                </span>
                <button
                  onClick={() => setActiveReceipt(tx)}
                  className="p-1 hover:bg-[#EAE7DC] rounded text-[#6A6A55] cursor-pointer"
                  title="View Receipt Slip"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
