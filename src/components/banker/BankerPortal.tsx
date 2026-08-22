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
    recordDeposit,
    setActiveReceipt,
  } = useSusu();

  const [selectedBankerFilter, setSelectedBankerFilter] = useState<string>('MY_ASSIGNED');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID_TODAY' | 'CYCLE_COMPLETED' | 'IN_PROGRESS'>('ALL');
  const [sortBy, setSortBy] = useState<'stall' | 'name_asc' | 'name_desc' | 'balance_desc' | 'cycle_desc'>('stall');
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeBanker) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800 font-display">No Field Banker Profile Available</h3>
          <p className="text-xs text-slate-500 mt-1">
            Please sign in with an authorized Field Banker account or create a new banker in Admin HQ.
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
        notes: `Quick collection at ${member.locationStall}`,
      });
    } catch (e: any) {
      console.error(e);
    }
  };

  // Recent transactions by this banker today
  const bankerTodayTransactions = transactions.filter((t) => t.bankerId === activeBanker.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banker Profile & Route Header Card */}
      <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={activeBanker.avatar}
              alt={activeBanker.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-bold">
                  {activeBanker.id} • Field Collector
                </span>
                {activeBanker.status === 'reconciled' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    Shift Settled
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                    ● Active Route
                  </span>
                )}
              </div>
              <h1 className="font-bold text-xl sm:text-2xl tracking-tight text-white mt-1 font-display">
                {activeBanker.name}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeBanker.routeName || 'Market Collection Route'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenReconcile(activeBanker.id)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Settle Shift Cash</span>
            </button>

            <button
              onClick={onOpenNewMember}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Saver</span>
            </button>
          </div>
        </div>

        {/* Collection & Float Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 block">Today's Collections:</span>
            <div className="text-xl font-extrabold text-white font-display mt-0.5">
              {formatMoney(activeBanker.collectedToday)}
            </div>
            <span className="text-[11px] text-emerald-400 block mt-0.5">
              Gross field inflow
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 block">Cash in Bag (Remit Due):</span>
            <div className="text-xl font-extrabold text-emerald-400 font-display mt-0.5">
              {formatMoney(netCashInBag)}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Disbursed: {formatMoney(activeBanker.withdrawnToday)}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 block">Stops Visited Today:</span>
            <div className="text-xl font-extrabold text-amber-400 font-display mt-0.5">
              {completedMembers.length} / {myAssignedMembers.length} Stalls
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {pendingMembers.length} stops remaining
            </span>
          </div>
        </div>
      </div>

      {/* Main Route Stops Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3 bg-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h2 className="font-bold text-base text-slate-900 font-display">
              Route Savers Checklist
            </h2>
            <p className="text-xs text-slate-500">
              Record daily deposits, search stalls, and track collection progress.
            </p>
          </div>

          {/* Search Input with Clear Button */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by saver name, stall number, account #, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-full transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Banker / Scope Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs shadow-2xs">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Scope:</span>
              <select
                value={selectedBankerFilter}
                onChange={(e) => setSelectedBankerFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="MY_ASSIGNED">My Route Savers ({myAssignedMembers.length})</option>
                <option value="ALL">All Savers ({members.length})</option>
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
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All Statuses ({baseMembers.length})</option>
                <option value="PENDING">
                  Pending Collection ({baseMembers.filter((m) => !m.depositedToday).length})
                </option>
                <option value="PAID_TODAY">
                  ✓ Paid Today ({baseMembers.filter((m) => m.depositedToday).length})
                </option>
                <option value="CYCLE_COMPLETED">
                  Cycle Completed ({baseMembers.filter((m) => m.currentCyclePaidDays >= m.susuCycleDays).length})
                </option>
                <option value="IN_PROGRESS">
                  In Progress ({baseMembers.filter((m) => m.currentCyclePaidDays < m.susuCycleDays).length})
                </option>
              </select>
            </div>

            {/* Sort Order Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="stall">Stall Location</option>
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
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-amber-50 transition-colors cursor-pointer ml-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Member Stops List */}
        <div className="divide-y divide-slate-100 p-2">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 text-xs space-y-2">
              <Search className="w-6 h-6 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No savers found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBankerFilter('MY_ASSIGNED');
                  setSelectedStatusFilter('ALL');
                  setSortBy('stall');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isPaid = member.depositedToday;
              return (
                <div
                  key={member.id}
                  className={`p-3 sm:p-4 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 my-1 ${
                    isPaid
                      ? 'bg-emerald-50/60 border border-emerald-200'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {/* Member Info */}
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onSelectMember(member)}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{member.name}</h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {member.accountNumber || member.id}
                        </span>
                        {isPaid ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            PAID TODAY
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            DUE
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Store className="w-3 h-3 text-slate-400" />
                          <span>{member.locationStall}</span>
                        </span>
                        <span>•</span>
                        <span>{member.phone}</span>
                      </p>

                      <div className="flex items-center gap-3 mt-0.5 text-xs">
                        <span className="text-slate-600">
                          Balance: <strong className="text-emerald-700">{formatMoney(member.totalBalance)}</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">
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
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>Collect {formatMoney(member.dailyTarget)}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenDeposit(member.id)}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>+ Extra</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenWithdrawal(member.id)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Request Member Withdrawal"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Payout</span>
                    </button>

                    <button
                      onClick={() => onSelectMember(member)}
                      className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer"
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-800 font-display">
          My Activity Today ({bankerTodayTransactions.length} Transactions)
        </h3>

        <div className="space-y-2">
          {bankerTodayTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No transactions recorded yet today.</p>
          ) : (
            bankerTodayTransactions.slice(0, 6).map((tx) => (
              <div
                key={tx.id}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                      tx.type === 'DEPOSIT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">{tx.memberName}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.paymentMethod.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-mono font-bold text-xs ${
                      tx.type === 'DEPOSIT' ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' ? '+' : '-'}
                    {formatMoney(tx.amount)}
                  </span>
                  <button
                    onClick={() => setActiveReceipt(tx)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                    title="View Receipt Slip"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
