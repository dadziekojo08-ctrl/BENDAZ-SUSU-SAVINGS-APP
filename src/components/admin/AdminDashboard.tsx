import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Banker, Member, Transaction, Route, TransactionStatus } from '../../types';
import { WithdrawalStatusBadge, TransactionTypeBadge } from '../common/StatusBadge';
import { AuditLog } from './AuditLog';
import {
  ShieldCheck,
  Users,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Plus,
  Radio,
  FileSpreadsheet,
  Printer,
  Scale,
  MapPin,
  Target,
  ExternalLink,
  ChevronRight,
  Eye,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  Check,
  CheckCheck,
  X,
  User,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenDeposit: (memberId?: string) => void;
  onOpenWithdrawal: (memberId?: string) => void;
  onOpenNewMember: () => void;
  onOpenNewBanker: () => void;
  onOpenReconcile: (bankerId?: string) => void;
  onSelectMember: (member: Member) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenNewMember,
  onOpenNewBanker,
  onOpenReconcile,
  onSelectMember,
}) => {
  const {
    bankers,
    members,
    transactions,
    routes,
    reconciliations,
    auditLogs,
    totalCollectedToday,
    totalWithdrawnToday,
    totalActiveBankers,
    totalMembersCount,
    pendingWithdrawalsCount,
    totalSystemSavings,
    formatMoney,
    getCurrencySymbol,
    approveWithdrawal,
    rejectWithdrawal,
    disburseWithdrawal,
    setActiveReceipt,
    printReceipt,
  } = useSusu();

  const [activeTab, setActiveTab] = useState<'monitor' | 'bankers' | 'withdrawals' | 'members' | 'ledger' | 'routes' | 'audit'>('monitor');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState('ALL');
  const [selectedBankerFilter, setSelectedBankerFilter] = useState('ALL');
  const [selectedMemberStatusFilter, setSelectedMemberStatusFilter] = useState<'ALL' | 'PAID_TODAY' | 'PENDING' | 'CYCLE_COMPLETED' | 'IN_PROGRESS'>('ALL');
  const [memberSortBy, setMemberSortBy] = useState<'name_asc' | 'name_desc' | 'balance_desc' | 'balance_asc' | 'cycle_desc'>('name_asc');
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'DISBURSED' | 'REJECTED'>('ALL');
  const [withdrawalSearchQuery, setWithdrawalSearchQuery] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'PENDING' | 'DISBURSED'>('ALL');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [rejectionModalTx, setRejectionModalTx] = useState<Transaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const netVaultCashInHand = Math.max(0, totalCollectedToday - totalWithdrawnToday);

  // Withdrawal requests & stats
  const allWithdrawalRequests = transactions.filter((t) => t.type === 'WITHDRAWAL');
  const pendingWithdrawalRequests = allWithdrawalRequests.filter((t) => t.status === 'PENDING_APPROVAL');
  const approvedWithdrawalRequests = allWithdrawalRequests.filter((t) => t.status === 'APPROVED');
  const disbursedWithdrawalRequests = allWithdrawalRequests.filter((t) => t.status === 'DISBURSED' || t.status === 'COMPLETED');
  const rejectedWithdrawalRequests = allWithdrawalRequests.filter((t) => t.status === 'REJECTED');

  const totalDisbursedAmount = disbursedWithdrawalRequests.reduce((sum, t) => sum + (t.netAmount || t.amount), 0);
  const totalPendingAmount = pendingWithdrawalRequests.reduce((sum, t) => sum + (t.netAmount || t.amount), 0);

  // Pending withdrawals alias for backwards compatibility
  const pendingWithdrawals = pendingWithdrawalRequests;

  const filteredWithdrawalRequests = allWithdrawalRequests.filter((t) => {
    const matchesFilter =
      withdrawalStatusFilter === 'ALL'
        ? true
        : withdrawalStatusFilter === 'DISBURSED'
        ? t.status === 'DISBURSED' || t.status === 'COMPLETED'
        : t.status === withdrawalStatusFilter;

    const query = withdrawalSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.memberName.toLowerCase().includes(query) ||
      (t.memberPhone && t.memberPhone.includes(query)) ||
      t.receiptNumber.toLowerCase().includes(query) ||
      (t.bankerName && t.bankerName.toLowerCase().includes(query)) ||
      (t.withdrawalReason && t.withdrawalReason.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  // Filtered transactions for Ledger
  const filteredLedgerTransactions = transactions.filter((t) => {
    const matchesType =
      ledgerTypeFilter === 'ALL'
        ? true
        : ledgerTypeFilter === 'DEPOSIT'
        ? t.type === 'DEPOSIT'
        : ledgerTypeFilter === 'WITHDRAWAL'
        ? t.type === 'WITHDRAWAL'
        : ledgerTypeFilter === 'PENDING'
        ? t.status === 'PENDING_APPROVAL'
        : ledgerTypeFilter === 'DISBURSED'
        ? t.status === 'DISBURSED' || t.status === 'COMPLETED'
        : true;

    const query = ledgerSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.receiptNumber.toLowerCase().includes(query) ||
      t.memberName.toLowerCase().includes(query) ||
      (t.memberPhone && t.memberPhone.includes(query)) ||
      (t.bankerName && t.bankerName.toLowerCase().includes(query)) ||
      t.paymentMethod.toLowerCase().includes(query);

    return matchesType && matchesSearch;
  });

  // Filtered members
  const filteredMembers = members
    .filter((m) => {
      const query = memberSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.phone.includes(query) ||
        m.locationStall.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query) ||
        (m.assignedBankerName && m.assignedBankerName.toLowerCase().includes(query)) ||
        (m.routeName && m.routeName.toLowerCase().includes(query));

      const matchesRoute = selectedRouteFilter === 'ALL' || m.routeId === selectedRouteFilter;
      const matchesBanker = selectedBankerFilter === 'ALL' || m.assignedBankerId === selectedBankerFilter;
      const matchesStatus =
        selectedMemberStatusFilter === 'ALL'
          ? true
          : selectedMemberStatusFilter === 'PAID_TODAY'
          ? m.depositedToday
          : selectedMemberStatusFilter === 'PENDING'
          ? !m.depositedToday
          : selectedMemberStatusFilter === 'CYCLE_COMPLETED'
          ? m.currentCyclePaidDays >= m.susuCycleDays
          : selectedMemberStatusFilter === 'IN_PROGRESS'
          ? m.currentCyclePaidDays < m.susuCycleDays
          : true;

      return matchesSearch && matchesRoute && matchesBanker && matchesStatus;
    })
    .sort((a, b) => {
      if (memberSortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (memberSortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (memberSortBy === 'balance_desc') return b.totalBalance - a.totalBalance;
      if (memberSortBy === 'balance_asc') return a.totalBalance - b.totalBalance;
      if (memberSortBy === 'cycle_desc') return (b.currentCyclePaidDays / b.susuCycleDays) - (a.currentCyclePaidDays / a.susuCycleDays);
      return 0;
    });

  const handleConfirmReject = () => {
    if (rejectionModalTx && rejectionReason.trim()) {
      rejectWithdrawal(rejectionModalTx.id, rejectionReason.trim());
      setRejectionModalTx(null);
      setRejectionReason('');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Receipt #', 'Date/Time', 'Type', 'Member Name', 'Member Phone', 'Banker Name', 'Amount', 'Fee', 'Net', 'Payment Method', 'Status'];
    const rows = transactions.map((t) => [
      t.receiptNumber,
      new Date(t.timestamp).toISOString(),
      t.type,
      `"${t.memberName}"`,
      t.memberPhone,
      `"${t.bankerName}"`,
      t.amount,
      t.fee,
      t.netAmount,
      t.paymentMethod,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bendaz_susu_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Welcome & KPI Metrics Strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8E9775] animate-ping"></span>
            <h1 className="font-serif-brand font-bold text-2xl text-[#3A3D2C] tracking-tight">
              Admin HQ Executive Dashboard
            </h1>
          </div>
          <p className="text-xs text-[#7A7A65] mt-0.5">
            Real-time daily Susu thrift collection monitor, mobile banker fleet & member treasury.
          </p>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewBanker}
            className="bg-[#5A5A40] hover:bg-[#4A4D3A] text-[#F9F8F4] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#D8D5C8]" />
            <span>Create Banker</span>
          </button>

          <button
            onClick={onOpenNewMember}
            className="bg-[#8E9775] hover:bg-[#7D8665] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#EAE7DC]" />
            <span>Onboard Saver</span>
          </button>

          <button
            onClick={() => onOpenReconcile()}
            className="bg-[#C27D50] hover:bg-[#B06F45] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>End-of-Day Settle</span>
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Collected Today */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE7DC] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A8A70] uppercase tracking-wider">
              Today's Inflow Collected
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#8E9775]/20 text-[#5A5E46] flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#3A3D2C] font-display">
              {formatMoney(totalCollectedToday)}
            </div>
            <div className="flex items-center justify-between text-xs text-[#7A7A65] mt-1">
              <span>Total Gross Deposits Today</span>
              <span className="font-bold text-[#5A5E46]">{bankers.length} Bankers Active</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Disbursed Withdrawals & Net Vault Cash */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE7DC] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A8A70] uppercase tracking-wider">
              Net Vault Cash in Hand
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EAE7DC] text-[#4A4D3A] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#4A4D3A] font-display">
              {formatMoney(netVaultCashInHand)}
            </div>
            <div className="text-xs text-[#7A7A65] mt-1 flex items-center justify-between">
              <span>Withdrawn Today: {formatMoney(totalWithdrawnToday)}</span>
              <span className="text-[#8E9775] font-medium">Float Balanced</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total Scheme Savings Pool */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE7DC] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A8A70] uppercase tracking-wider">
              Total Susu Scheme Balance
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#D4A359]/20 text-[#8F6522] flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#5A4522] font-display">
              {formatMoney(totalSystemSavings)}
            </div>
            <div className="text-xs text-[#7A7A65] mt-1 flex items-center justify-between">
              <span>{totalMembersCount} Registered Savers</span>
              <span className="font-semibold text-[#8F6522]">31-Day Cycles</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Active Bankers & Pending Payouts */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE7DC] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A8A70] uppercase tracking-wider">
              Banker Fleet Status
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#D8D5C8]/40 text-[#4A4A40] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-[#3A3D2C] font-display">
                {totalActiveBankers}
              </span>
              <span className="text-xs text-[#5A5E46] font-bold px-2 py-0.5 rounded-full bg-[#8E9775]/20 border border-[#8E9775]/30">
                All on Route
              </span>
            </div>
            <div className="text-xs text-[#7A7A65] mt-1 flex items-center justify-between">
              <span>{routes.length} Active Market Lines</span>
              {pendingWithdrawalsCount > 0 ? (
                <span className="font-bold text-[#C27D50]">{pendingWithdrawalsCount} Payouts Pending</span>
              ) : (
                <span className="text-[#8A8A70]">0 Payout Requests</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl border border-[#EAE7DC] shadow-sm overflow-hidden">
        <div className="px-6 border-b border-[#EAE7DC] flex flex-wrap items-center justify-between gap-4 bg-[#F9F8F4]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-6">
            {[
              { id: 'monitor', label: 'Live Bankers Fleet Monitor', icon: Radio, count: totalActiveBankers },
              { id: 'bankers', label: 'Banker Accounts & Routes', icon: Users, count: bankers.length },
              { id: 'withdrawals', label: 'Withdrawal Approvals', icon: Clock, count: pendingWithdrawalsCount, alert: pendingWithdrawalsCount > 0 },
              { id: 'members', label: 'All Members Directory', icon: Coins, count: members.length },
              { id: 'ledger', label: 'Daily Transaction Ledger', icon: FileSpreadsheet, count: transactions.length },
              { id: 'routes', label: 'Market Routes & Zones', icon: MapPin, count: routes.length },
              { id: 'audit', label: 'Audit Trail & Operations', icon: ShieldCheck, count: auditLogs.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                    isActive
                      ? 'border-[#5A5A40] text-[#3A3D2C]'
                      : 'border-transparent text-[#7A7A65] hover:text-[#3A3D2C] hover:border-[#D8D5C8]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#5A5A40]' : 'text-[#8A8A70]'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        tab.alert
                          ? 'bg-[#C27D50] text-white animate-pulse'
                          : isActive
                          ? 'bg-[#8E9775]/25 text-[#4A4D3A]'
                          : 'bg-[#EAE7DC] text-[#7A7A65]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="py-2 flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 rounded-lg border border-[#D8D5C8] bg-white hover:bg-[#F9F8F4] text-[#4A4A40] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export Transactions to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#8E9775]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6">
          {/* TAB 1: LIVE BANKER FLEET MONITOR */}
          {activeTab === 'monitor' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-serif-brand font-bold text-lg text-[#3A3D2C]">
                    Real-Time Mobile Bankers Collection Monitor
                  </h3>
                  <p className="text-xs text-[#7A7A65]">
                    Live tracking of collections, stops completed, and cash in hand per field agent.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8E9775]/15 text-[#5A5E46] border border-[#8E9775]/30 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#8E9775] animate-pulse"></span>
                    Live Syncing Active
                  </span>
                </div>
              </div>

              {/* Grid of Banker Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankers.map((banker) => {
                  const pct = banker.dailyTarget > 0 ? Math.min(100, Math.round((banker.collectedToday / banker.dailyTarget) * 100)) : 0;
                  const netCash = Math.max(0, banker.collectedToday - banker.withdrawnToday);
                  const isReconciled = banker.status === 'reconciled';

                  return (
                    <div
                      key={banker.id}
                      className="bg-[#F9F8F4] rounded-2xl border border-[#EAE7DC] p-5 hover:border-[#8E9775]/50 transition-all hover:shadow-sm space-y-4"
                    >
                      {/* Banker Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={banker.avatar}
                            alt={banker.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-[#8E9775]/40 shadow-sm"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#3A3D2C]">{banker.name}</h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EAE7DC] text-[#5A5A40]">
                                {banker.id}
                              </span>
                            </div>
                            <p className="text-xs text-[#7A7A65] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#8E9775]" />
                              <span>{banker.routeName}</span>
                            </p>
                            <span className="text-[11px] text-[#8A8A70]">{banker.phone}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isReconciled
                                ? 'bg-[#5A5A40]/15 text-[#4A4D3A]'
                                : 'bg-[#8E9775]/20 text-[#4A5038] border border-[#8E9775]/30'
                            }`}
                          >
                            {isReconciled ? '✓ Shift Reconciled' : '● On Field Route'}
                          </span>
                          <span className="text-[10px] text-[#8A8A70] block mt-1">{banker.lastActive}</span>
                        </div>
                      </div>

                      {/* Collection Progress */}
                      <div className="bg-white p-3.5 rounded-xl border border-[#EAE7DC] space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#7A7A65] font-medium">Daily Collection Target:</span>
                          <span className="font-bold text-[#3A3D2C] font-display">
                            {formatMoney(banker.collectedToday)} / <span className="text-[#A8A598]">{formatMoney(banker.dailyTarget)}</span>
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#EAE7DC] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 100 ? 'bg-[#8E9775]' : 'bg-[#5A5A40]'
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-[11px] text-[#7A7A65] pt-1">
                          <span>{pct}% of Target Collected</span>
                          <span>{banker.assignedMemberCount} Assigned Savers</span>
                        </div>
                      </div>

                      {/* Cash Breakdown Strip */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white p-2 rounded-lg border border-[#EAE7DC]">
                          <span className="text-[10px] text-[#8A8A70] uppercase font-semibold block">Collected</span>
                          <span className="font-bold text-[#5A5E46] font-mono">
                            {formatMoney(banker.collectedToday)}
                          </span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-[#EAE7DC]">
                          <span className="text-[10px] text-[#8A8A70] uppercase font-semibold block">Disbursed</span>
                          <span className="font-bold text-[#C27D50] font-mono">
                            {formatMoney(banker.withdrawnToday)}
                          </span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-[#EAE7DC]">
                          <span className="text-[10px] text-[#8A8A70] uppercase font-semibold block">Cash in Bag</span>
                          <span className="font-bold text-[#3A3D2C] font-mono">
                            {formatMoney(netCash)}
                          </span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EAE7DC]">
                        <button
                          onClick={() => onOpenDeposit()}
                          className="flex-1 py-1.5 rounded-lg border border-[#D8D5C8] hover:bg-white text-[#4A4A40] text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5 text-[#8E9775]" />
                          <span>Record Deposit</span>
                        </button>

                        <button
                          onClick={() => onOpenReconcile(banker.id)}
                          className="flex-1 py-1.5 rounded-lg bg-[#5A5A40] hover:bg-[#4A4D3A] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Scale className="w-3.5 h-3.5 text-[#D4A359]" />
                          <span>Reconcile EOD Cash</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Real-time Audit Activity Widget in Monitor Tab */}
              <div className="pt-2">
                <AuditLog compact maxCompactItems={5} onViewAll={() => setActiveTab('audit')} />
              </div>
            </div>
          )}

          {/* TAB 2: BANKER ACCOUNTS MANAGER */}
          {activeTab === 'bankers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-serif-brand font-bold text-lg text-[#3A3D2C]">
                    Registered Mobile Bankers & Field Collectors
                  </h3>
                  <p className="text-xs text-[#7A7A65]">
                    Create banker accounts, assign market routes, and configure commission rates.
                  </p>
                </div>
                <button
                  onClick={onOpenNewBanker}
                  className="bg-[#5A5A40] hover:bg-[#4A4D3A] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Onboard New Banker</span>
                </button>
              </div>

              {/* Bankers Table */}
              <div className="overflow-x-auto border border-[#EAE7DC] rounded-xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9F8F4] text-[#7A7A65] font-bold border-b border-[#EAE7DC] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Banker / Agent</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Assigned Route</th>
                      <th className="py-3 px-4">Commission Model</th>
                      <th className="py-3 px-4">Savers Count</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE7DC]">
                    {bankers.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F9F8F4] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img src={b.avatar} alt={b.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <span className="font-bold text-[#3A3D2C] block">{b.name}</span>
                              <span className="font-mono text-[10px] text-[#8A8A70]">{b.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#4A4A40] block">{b.phone}</span>
                          <span className="text-[10px] text-[#8A8A70]">{b.email}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#3A3D2C] block">{b.routeName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#EAE7DC] text-[#4A4A40] font-semibold text-[10px]">
                            {b.commissionModel === 'ONE_DAY_CONTRIBUTION' ? '1 Day Susu Fee' : `${b.commissionRate}%`}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#4A4A40]">
                          {b.assignedMemberCount} Savers
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8E9775]/20 text-[#4A5038] border border-[#8E9775]/30">
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onOpenReconcile(b.id)}
                            className="text-xs text-[#C27D50] font-bold hover:underline cursor-pointer"
                          >
                            Reconcile Shift
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: WITHDRAWAL APPROVALS & PROCESSING LOGS */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-5">
              {/* Header with Title & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-serif-brand font-bold text-xl text-[#3A3D2C]">
                    Member Withdrawal Request Logs & Processing Center
                  </h3>
                  <p className="text-xs text-[#7A7A65] mt-0.5">
                    Live approval queue, status badges, and payout disbursement vouchers.
                  </p>
                </div>
                <button
                  onClick={() => onOpenWithdrawal()}
                  className="bg-[#C27D50] hover:bg-[#B06F45] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Initiate New Payout Request</span>
                </button>
              </div>

              {/* Status Summary KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => setWithdrawalStatusFilter('ALL')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    withdrawalStatusFilter === 'ALL'
                      ? 'bg-white border-[#5A5A40] shadow-sm ring-2 ring-[#5A5A40]/10'
                      : 'bg-[#F9F8F4] border-[#EAE7DC] hover:border-[#D8D5C8]'
                  }`}
                >
                  <span className="text-[10px] font-bold text-[#7A7A65] uppercase tracking-wider block">
                    All Payout Logs
                  </span>
                  <div className="text-xl font-extrabold text-[#383B2B] font-display mt-0.5">
                    {allWithdrawalRequests.length}
                  </div>
                  <span className="text-[11px] text-[#8A8A70]">Total historical requests</span>
                </div>

                <div
                  onClick={() => setWithdrawalStatusFilter('PENDING_APPROVAL')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    withdrawalStatusFilter === 'PENDING_APPROVAL'
                      ? 'bg-[#FFF7ED] border-[#FDBA74] shadow-sm ring-2 ring-[#FDBA74]/30'
                      : 'bg-[#FFF7ED]/50 border-[#FED7AA] hover:border-[#FDBA74]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#C2410C] uppercase tracking-wider block">
                      ⏳ Pending Approval
                    </span>
                    {pendingWithdrawalRequests.length > 0 && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA580C] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EA580C]"></span>
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-extrabold text-[#C2410C] font-display mt-0.5">
                    {pendingWithdrawalRequests.length}
                  </div>
                  <span className="text-[11px] text-[#9A3412] font-semibold font-mono">
                    {formatMoney(totalPendingAmount)} awaiting review
                  </span>
                </div>

                <div
                  onClick={() => setWithdrawalStatusFilter('APPROVED')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    withdrawalStatusFilter === 'APPROVED'
                      ? 'bg-[#EFF6FF] border-[#93C5FD] shadow-sm ring-2 ring-[#93C5FD]/30'
                      : 'bg-[#EFF6FF]/50 border-[#BFDBFE] hover:border-[#93C5FD]'
                  }`}
                >
                  <span className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-wider block">
                    🔵 Approved (Ready)
                  </span>
                  <div className="text-xl font-extrabold text-[#1D4ED8] font-display mt-0.5">
                    {approvedWithdrawalRequests.length}
                  </div>
                  <span className="text-[11px] text-[#1E40AF]">Ready for cash handover</span>
                </div>

                <div
                  onClick={() => setWithdrawalStatusFilter('DISBURSED')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    withdrawalStatusFilter === 'DISBURSED'
                      ? 'bg-[#ECFDF5] border-[#6EE7B7] shadow-sm ring-2 ring-[#6EE7B7]/30'
                      : 'bg-[#ECFDF5]/50 border-[#A7F3D0] hover:border-[#6EE7B7]'
                  }`}
                >
                  <span className="text-[10px] font-bold text-[#047857] uppercase tracking-wider block">
                    🟢 Paid & Disbursed
                  </span>
                  <div className="text-xl font-extrabold text-[#047857] font-display mt-0.5">
                    {disbursedWithdrawalRequests.length}
                  </div>
                  <span className="text-[11px] text-[#065F46] font-semibold font-mono">
                    {formatMoney(totalDisbursedAmount)} total paid
                  </span>
                </div>
              </div>

              {/* Status Filter Chips & Search Bar */}
              <div className="bg-[#F9F8F4] p-3.5 rounded-2xl border border-[#EAE7DC] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setWithdrawalStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      withdrawalStatusFilter === 'ALL'
                        ? 'bg-[#383B2B] text-white shadow-xs'
                        : 'bg-white text-[#6A6A55] border border-[#D8D5C8] hover:text-[#383B2B]'
                    }`}
                  >
                    All Logs ({allWithdrawalRequests.length})
                  </button>

                  <button
                    onClick={() => setWithdrawalStatusFilter('PENDING_APPROVAL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      withdrawalStatusFilter === 'PENDING_APPROVAL'
                        ? 'bg-[#EA580C] text-white shadow-xs'
                        : 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] hover:bg-[#FFEDD5]'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Pending ({pendingWithdrawalRequests.length})</span>
                  </button>

                  <button
                    onClick={() => setWithdrawalStatusFilter('APPROVED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      withdrawalStatusFilter === 'APPROVED'
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD] hover:bg-[#DBEAFE]'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Approved ({approvedWithdrawalRequests.length})</span>
                  </button>

                  <button
                    onClick={() => setWithdrawalStatusFilter('DISBURSED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      withdrawalStatusFilter === 'DISBURSED'
                        ? 'bg-[#059669] text-white shadow-xs'
                        : 'bg-[#ECFDF5] text-[#047857] border border-[#6EE7B7] hover:bg-[#D1FAE5]'
                    }`}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Paid ({disbursedWithdrawalRequests.length})</span>
                  </button>

                  {rejectedWithdrawalRequests.length > 0 && (
                    <button
                      onClick={() => setWithdrawalStatusFilter('REJECTED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        withdrawalStatusFilter === 'REJECTED'
                          ? 'bg-[#DC2626] text-white shadow-xs'
                          : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5] hover:bg-[#FEE2E2]'
                      }`}
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Rejected ({rejectedWithdrawalRequests.length})</span>
                    </button>
                  )}
                </div>

                {/* Search Input */}
                <div className="relative md:w-72">
                  <Search className="w-4 h-4 text-[#8A8A70] absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by saver, phone, receipt ref..."
                    value={withdrawalSearchQuery}
                    onChange={(e) => setWithdrawalSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
                  />
                </div>
              </div>

              {/* Withdrawal Request Cards List */}
              {filteredWithdrawalRequests.length === 0 ? (
                <div className="p-10 text-center bg-[#F9F8F4] rounded-3xl border border-dashed border-[#D8D5C8]">
                  <CheckCircle2 className="w-10 h-10 text-[#8E9775] mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-[#3A3D2C]">No Withdrawal Records Found</h4>
                  <p className="text-xs text-[#7A7A65] mt-1">
                    No savings payout requests matching current filter criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredWithdrawalRequests.map((tx) => {
                    const member = members.find((m) => m.id === tx.memberId);
                    const isPending = tx.status === 'PENDING_APPROVAL';
                    const isApproved = tx.status === 'APPROVED';
                    const isPaid = tx.status === 'DISBURSED' || tx.status === 'COMPLETED';
                    const isRejected = tx.status === 'REJECTED';

                    return (
                      <div
                        key={tx.id}
                        className={`p-4 sm:p-5 rounded-2xl transition-all border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                          isPending
                            ? 'bg-white border-[#FDBA74] shadow-sm ring-1 ring-[#FDBA74]/40'
                            : isApproved
                            ? 'bg-white border-[#93C5FD] ring-1 ring-[#93C5FD]/40'
                            : isPaid
                            ? 'bg-white border-[#A7F3D0]'
                            : 'bg-white border-[#FCA5A5]'
                        }`}
                      >
                        {/* Member & Details Column */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <img
                            src={
                              member?.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                tx.memberName
                              )}`
                            }
                            alt={tx.memberName}
                            className="w-12 h-12 rounded-2xl object-cover border border-[#D8D5C8] shadow-xs shrink-0"
                          />

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-sm sm:text-base text-[#383B2B]">
                                {tx.memberName}
                              </h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EAE7DC] text-[#5A5A40] font-semibold">
                                {tx.memberId}
                              </span>

                              {/* VISUAL STATUS BADGE (PENDING / APPROVED / PAID / REJECTED) */}
                              <WithdrawalStatusBadge
                                status={tx.status}
                                size="sm"
                                showSubtext={false}
                                approvedBy={tx.approvedBy}
                                disbursedBy={tx.disbursedBy}
                                rejectionReason={tx.rejectionReason}
                              />
                            </div>

                            <p className="text-xs text-[#6A6A55] flex flex-wrap items-center gap-1.5">
                              <span>Ref: <strong className="font-mono text-[#383B2B]">{tx.receiptNumber}</strong></span>
                              <span className="text-[#D8D5C8]">•</span>
                              <span>Initiated by: <strong>{tx.bankerName}</strong></span>
                              <span className="text-[#D8D5C8]">•</span>
                              <span>
                                {new Date(tx.timestamp).toLocaleString('en-GB', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </span>
                            </p>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A5A40] pt-0.5">
                              <span className="bg-[#F9F8F4] px-2 py-0.5 rounded-md border border-[#EAE7DC] text-[11px]">
                                Purpose: <strong>{tx.withdrawalReason || 'Savings Payout'}</strong>
                              </span>
                              <span className="bg-[#F9F8F4] px-2 py-0.5 rounded-md border border-[#EAE7DC] text-[11px]">
                                Method: <strong>{tx.paymentMethod.replace(/_/g, ' ')}</strong>
                              </span>
                              {tx.payoutMode && (
                                <span className="bg-[#F9F8F4] px-2 py-0.5 rounded-md border border-[#EAE7DC] text-[11px]">
                                  Mode: <strong>{tx.payoutMode.replace(/_/g, ' ')}</strong>
                                </span>
                              )}
                            </div>

                            {isRejected && tx.rejectionReason && (
                              <div className="text-[11px] text-[#B91C1C] bg-[#FEF2F2] p-1.5 rounded-lg border border-[#FCA5A5] mt-1">
                                <strong>Rejection Reason:</strong> {tx.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Amount & Action Buttons Column */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#EAE7DC]">
                          {/* Financial Callout */}
                          <div className="text-left md:text-right sm:pr-2">
                            <span className="text-[10px] uppercase font-bold text-[#7A7A65] block">
                              Net Payout Amount
                            </span>
                            <div className="text-xl font-extrabold text-[#383B2B] font-serif-brand">
                              {formatMoney(tx.netAmount)}
                            </div>
                            <span className="text-[10px] text-[#8E9775] font-bold block font-mono">
                              GH₵ 0.00 Fee (FREE)
                            </span>
                          </div>

                          {/* Contextual Action Buttons based on Status */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Pending State Actions */}
                            {isPending && (
                              <>
                                <button
                                  onClick={() => setRejectionModalTx(tx)}
                                  className="px-3 py-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#FEE2E2] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Decline this payout request"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>

                                <button
                                  onClick={() => approveWithdrawal(tx.id)}
                                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                                  title="Authorize this withdrawal request"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Approve Payout</span>
                                </button>
                              </>
                            )}

                            {/* Approved State Actions */}
                            {isApproved && (
                              <button
                                onClick={() => disburseWithdrawal(tx.id)}
                                className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                                title="Confirm physical cash handed over or MoMo transfer executed"
                              >
                                <CheckCheck className="w-4 h-4" />
                                <span>Mark Paid & Disbursed</span>
                              </button>
                            )}

                            {/* View Voucher / Slip for all */}
                            <button
                              onClick={() => setActiveReceipt(tx)}
                              className="px-2.5 py-2 rounded-xl border border-[#D8D5C8] bg-[#F9F8F4] hover:bg-[#EAE7DC] text-[#4A4A40] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="View Official Disbursement Voucher Slip"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#6A6A55]" />
                              <span className="hidden sm:inline">Voucher</span>
                            </button>

                            <button
                              onClick={() => printReceipt(tx)}
                              className="p-2 rounded-xl border border-[#D8D5C8] bg-[#F9F8F4] hover:bg-[#EAE7DC] text-[#4A4A40] text-xs font-semibold transition-colors cursor-pointer"
                              title="Print Physical Receipt Slip"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#6A6A55]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ALL MEMBERS DIRECTORY */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-serif-brand font-bold text-lg text-[#3A3D2C]">
                    Master Saver / Member Directory
                  </h3>
                  <p className="text-xs text-[#7A7A65]">
                    Search savers, filter by mobile banker or payment status, and inspect 31-day passbooks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenNewMember}
                    className="bg-[#8E9775] hover:bg-[#7D8665] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Onboard Saver</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Search Bar & Filter Dropdowns Bar */}
              <div className="bg-[#F9F8F4] p-3.5 rounded-2xl border border-[#EAE7DC] space-y-3">
                {/* Search Row */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8A8A70] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by saver name, stall location, phone, ID, or collector..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40] shadow-2xs font-medium"
                  />
                  {memberSearch && (
                    <button
                      onClick={() => setMemberSearch('')}
                      className="absolute right-3 top-3 text-[#8A8A70] hover:text-[#383B2B] p-0.5 rounded-full hover:bg-[#EAE7DC] transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter & Sort Dropdowns Row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Banker Filter Dropdown */}
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-[#D8D5C8] text-xs shadow-2xs">
                    <User className="w-3.5 h-3.5 text-[#6A6A55]" />
                    <span className="text-[11px] font-bold text-[#7A7A65] uppercase">Banker:</span>
                    <select
                      value={selectedBankerFilter}
                      onChange={(e) => setSelectedBankerFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-[#3A3D2C] focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="ALL">All Bankers ({members.length})</option>
                      {bankers.map((b) => {
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
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-[#D8D5C8] text-xs shadow-2xs">
                    <Filter className="w-3.5 h-3.5 text-[#6A6A55]" />
                    <span className="text-[11px] font-bold text-[#7A7A65] uppercase">Status:</span>
                    <select
                      value={selectedMemberStatusFilter}
                      onChange={(e) => setSelectedMemberStatusFilter(e.target.value as any)}
                      className="bg-transparent text-xs font-semibold text-[#3A3D2C] focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="ALL">All Statuses ({members.length})</option>
                      <option value="PAID_TODAY">
                        ✓ Paid Today ({members.filter((m) => m.depositedToday).length})
                      </option>
                      <option value="PENDING">
                        ⏳ Pending Collection ({members.filter((m) => !m.depositedToday).length})
                      </option>
                      <option value="CYCLE_COMPLETED">
                        🏁 31-Day Cycle Done ({members.filter((m) => m.currentCyclePaidDays >= m.susuCycleDays).length})
                      </option>
                      <option value="IN_PROGRESS">
                        🔄 In Progress ({members.filter((m) => m.currentCyclePaidDays < m.susuCycleDays).length})
                      </option>
                    </select>
                  </div>

                  {/* Route Filter Dropdown */}
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-[#D8D5C8] text-xs shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-[#6A6A55]" />
                    <span className="text-[11px] font-bold text-[#7A7A65] uppercase">Route:</span>
                    <select
                      value={selectedRouteFilter}
                      onChange={(e) => setSelectedRouteFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-[#3A3D2C] focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="ALL">All Routes ({routes.length})</option>
                      {routes.map((r) => {
                        const count = members.filter((m) => m.routeId === r.id).length;
                        return (
                          <option key={r.id} value={r.id}>
                            {r.name} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-[#D8D5C8] text-xs shadow-2xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#6A6A55]" />
                    <span className="text-[11px] font-bold text-[#7A7A65] uppercase">Sort:</span>
                    <select
                      value={memberSortBy}
                      onChange={(e) => setMemberSortBy(e.target.value as any)}
                      className="bg-transparent text-xs font-semibold text-[#3A3D2C] focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="name_asc">Name (A → Z)</option>
                      <option value="name_desc">Name (Z → A)</option>
                      <option value="balance_desc">Highest Balance</option>
                      <option value="balance_asc">Lowest Balance</option>
                      <option value="cycle_desc">Passbook Progress</option>
                    </select>
                  </div>

                  {/* Clear Filters Button (shown when any filter is non-default) */}
                  {(memberSearch || selectedBankerFilter !== 'ALL' || selectedMemberStatusFilter !== 'ALL' || selectedRouteFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setMemberSearch('');
                        setSelectedBankerFilter('ALL');
                        setSelectedMemberStatusFilter('ALL');
                        setSelectedRouteFilter('ALL');
                        setMemberSortBy('name_asc');
                      }}
                      className="text-xs font-bold text-[#C27D50] hover:text-[#9A5025] flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-[#C27D50]/10 transition-colors cursor-pointer ml-auto"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>

                {/* Filter Result Counter Bar */}
                <div className="flex items-center justify-between text-[11px] text-[#7A7A65] pt-1 border-t border-[#EAE7DC]/80">
                  <span>
                    Showing <strong className="text-[#383B2B]">{filteredMembers.length}</strong> of{' '}
                    <strong className="text-[#383B2B]">{members.length}</strong> registered savers
                  </span>
                  {selectedBankerFilter !== 'ALL' && (
                    <span className="bg-[#8E9775]/20 text-[#383B2B] px-2 py-0.5 rounded-md font-semibold text-[10px]">
                      Collector: {bankers.find((b) => b.id === selectedBankerFilter)?.name || selectedBankerFilter}
                    </span>
                  )}
                </div>
              </div>

              {/* Members Table / Empty State */}
              {filteredMembers.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-[#EAE7DC] text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F9F8F4] text-[#8A8A70] flex items-center justify-center mx-auto border border-[#EAE7DC]">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#383B2B]">No Savers Found</h4>
                    <p className="text-xs text-[#7A7A65] max-w-sm mx-auto mt-1">
                      No registered members matched your search query or selected filter criteria.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setMemberSearch('');
                        setSelectedBankerFilter('ALL');
                        setSelectedMemberStatusFilter('ALL');
                        setSelectedRouteFilter('ALL');
                      }}
                      className="px-3.5 py-2 bg-[#F4F1EA] hover:bg-[#EAE7DC] text-[#4A4A40] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={onOpenNewMember}
                      className="px-3.5 py-2 bg-[#8E9775] hover:bg-[#7D8665] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Onboard New Saver
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#EAE7DC] rounded-xl bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9F8F4] text-[#7A7A65] font-bold border-b border-[#EAE7DC] uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Saver / Member</th>
                        <th className="py-3 px-4">Location / Stall</th>
                        <th className="py-3 px-4">Assigned Banker</th>
                        <th className="py-3 px-4">Daily Pledge</th>
                        <th className="py-3 px-4">Current Balance</th>
                        <th className="py-3 px-4">31-Day Cycle</th>
                        <th className="py-3 px-4">Today Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE7DC]">
                      {filteredMembers.map((m) => {
                        const cyclePct = Math.round((m.currentCyclePaidDays / m.susuCycleDays) * 100);
                        return (
                          <tr
                            key={m.id}
                            className="hover:bg-[#F9F8F4] transition-colors cursor-pointer"
                            onClick={() => onSelectMember(m)}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                                <div>
                                  <span className="font-bold text-[#3A3D2C] block">{m.name}</span>
                                  <span className="font-mono text-[10px] text-[#8A8A70]">{m.id} • {m.phone}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[#4A4A40] font-medium">{m.locationStall}</td>
                            <td className="py-3 px-4 text-[#6A6A55] font-medium">{m.assignedBankerName}</td>
                            <td className="py-3 px-4 font-mono font-bold text-[#3A3D2C]">
                              {formatMoney(m.dailyTarget)}/day
                            </td>
                            <td className="py-3 px-4 font-mono font-extrabold text-[#5A5E46]">
                              {formatMoney(m.totalBalance)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#4A4A40] text-[11px]">
                                  {m.currentCyclePaidDays}/{m.susuCycleDays}d
                                </span>
                                <div className="w-16 bg-[#EAE7DC] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#8E9775] h-full rounded-full"
                                    style={{ width: `${cyclePct}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {m.depositedToday ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8E9775]/20 text-[#4A5038] border border-[#8E9775]/30">
                                  ✓ Paid Today
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE7DC] text-[#7A7A65]">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onOpenDeposit(m.id)}
                                  className="px-2 py-1 bg-[#8E9775]/15 hover:bg-[#8E9775]/25 text-[#4A5038] rounded font-bold text-[11px] cursor-pointer"
                                >
                                  Deposit
                                </button>
                                <button
                                  onClick={() => onOpenWithdrawal(m.id)}
                                  className="px-2 py-1 bg-[#C27D50]/15 hover:bg-[#C27D50]/25 text-[#9A5025] rounded font-bold text-[11px] cursor-pointer"
                                >
                                  Withdraw
                                </button>
                                <button
                                  onClick={() => onSelectMember(m)}
                                  className="p-1 hover:bg-[#EAE7DC] rounded text-[#7A7A65] cursor-pointer"
                                  title="View Passbook"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TRANSACTION LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-serif-brand font-bold text-lg text-[#3A3D2C]">
                    Live Susu Transaction Ledger & Audit Trail
                  </h3>
                  <p className="text-xs text-[#7A7A65]">
                    Comprehensive audit trail of all contributions, payouts, and collections.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="bg-[#5A5A40] hover:bg-[#4A4D3A] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#D8D5C8]" />
                    <span>Export CSV ({filteredLedgerTransactions.length})</span>
                  </button>
                </div>
              </div>

              {/* Ledger Filters & Search */}
              <div className="bg-[#F9F8F4] p-3 rounded-2xl border border-[#EAE7DC] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setLedgerTypeFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ledgerTypeFilter === 'ALL'
                        ? 'bg-[#383B2B] text-white'
                        : 'bg-white text-[#6A6A55] border border-[#D8D5C8]'
                    }`}
                  >
                    All ({transactions.length})
                  </button>
                  <button
                    onClick={() => setLedgerTypeFilter('DEPOSIT')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ledgerTypeFilter === 'DEPOSIT'
                        ? 'bg-[#15803D] text-white'
                        : 'bg-white text-[#15803D] border border-[#BBF7D0]'
                    }`}
                  >
                    Deposits ({transactions.filter((t) => t.type === 'DEPOSIT').length})
                  </button>
                  <button
                    onClick={() => setLedgerTypeFilter('WITHDRAWAL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ledgerTypeFilter === 'WITHDRAWAL'
                        ? 'bg-[#C27D50] text-white'
                        : 'bg-white text-[#C27D50] border border-[#FED7AA]'
                    }`}
                  >
                    Withdrawals ({transactions.filter((t) => t.type === 'WITHDRAWAL').length})
                  </button>
                  <button
                    onClick={() => setLedgerTypeFilter('PENDING')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ledgerTypeFilter === 'PENDING'
                        ? 'bg-[#EA580C] text-white'
                        : 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74]'
                    }`}
                  >
                    Pending Approvals ({pendingWithdrawalRequests.length})
                  </button>
                </div>

                <div className="relative sm:w-64">
                  <Search className="w-4 h-4 text-[#8A8A70] absolute left-3 top-2" />
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={ledgerSearchQuery}
                    onChange={(e) => setLedgerSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
                  />
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto border border-[#EAE7DC] rounded-xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9F8F4] text-[#7A7A65] font-bold border-b border-[#EAE7DC] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Receipt Ref</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Saver / Member</th>
                      <th className="py-3 px-4">Collector Banker</th>
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE7DC]">
                    {filteredLedgerTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-[#8A8A70]">
                          No transactions found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLedgerTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#F9F8F4] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#3A3D2C]">{tx.receiptNumber}</td>
                          <td className="py-3 px-4 text-[#7A7A65]">
                            {new Date(tx.timestamp).toLocaleString('en-GB', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <TransactionTypeBadge
                              type={tx.type}
                              isOfficeFee={tx.isFirstDepositOfficeFee}
                              size="sm"
                            />
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#3A3D2C]">{tx.memberName}</td>
                          <td className="py-3 px-4 text-[#6A6A55] font-medium">{tx.bankerName}</td>
                          <td className="py-3 px-4 text-[#8A8A70] uppercase text-[10px]">
                            {tx.paymentMethod.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#3A3D2C]">
                            <span className={tx.type === 'DEPOSIT' ? 'text-[#15803D]' : 'text-[#C27D50]'}>
                              {tx.type === 'DEPOSIT' ? '+' : '-'}
                              {formatMoney(tx.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <WithdrawalStatusBadge
                              status={tx.status}
                              size="sm"
                              showSubtext={false}
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setActiveReceipt(tx)}
                                className="p-1.5 text-[#6A6A55] hover:bg-[#EAE7DC] rounded-lg cursor-pointer"
                                title="View Receipt Voucher"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => printReceipt(tx)}
                                className="p-1.5 text-[#6A6A55] hover:bg-[#EAE7DC] rounded-lg cursor-pointer"
                                title="Print Receipt Slip"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ROUTES & ZONES */}
          {activeTab === 'routes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-serif-brand font-bold text-lg text-[#3A3D2C]">
                    Market Routes & Territory Lines
                  </h3>
                  <p className="text-xs text-[#7A7A65]">
                    Collection zones, estimated daily target volumes, and assigned bankers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map((route) => {
                  const assignedBanker = bankers.find((b) => b.id === route.bankerId);
                  const routeMembers = members.filter((m) => m.routeId === route.id);
                  const routeTotalSavings = routeMembers.reduce((sum, m) => sum + m.totalBalance, 0);

                  return (
                    <div
                      key={route.id}
                      className="bg-[#F9F8F4] p-5 rounded-2xl border border-[#EAE7DC] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-[#8E9775]/20 text-[#5A5E46] flex items-center justify-center">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#3A3D2C]">{route.name}</h4>
                            <span className="text-[11px] text-[#5A5E46] font-semibold">{route.zone}</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#EAE7DC] text-[#4A4A40]">
                          {route.id}
                        </span>
                      </div>

                      <p className="text-xs text-[#6A6A55]">{route.description}</p>

                      <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[#EAE7DC] text-center text-xs">
                        <div>
                          <span className="text-[10px] text-[#8A8A70] uppercase font-semibold block">Banker</span>
                          <span className="font-bold text-[#3A3D2C]">{assignedBanker?.name || 'Unassigned'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8A8A70] uppercase font-semibold block">Stops / Savers</span>
                          <span className="font-bold text-[#3A3D2C]">{routeMembers.length} Savers</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8A8A70] uppercase font-semibold block">Daily Target</span>
                          <span className="font-bold text-[#5A5E46] font-mono">
                            {formatMoney(route.dailyEstimatedTarget)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs text-[#7A7A65]">
                        <span>Total Route Savings: <strong className="text-[#3A3D2C]">{formatMoney(routeTotalSavings)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: COMPLIANCE & AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <AuditLog />
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal Dialog */}
      {rejectionModalTx && (
        <div className="fixed inset-0 z-50 bg-[#383B2B]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F9F8F4] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#EAE7DC] space-y-4">
            <h3 className="font-serif-brand font-bold text-base text-[#3A3D2C]">Reject Withdrawal Request</h3>
            <p className="text-xs text-[#7A7A65]">
              Please enter the official reason for rejecting {rejectionModalTx.memberName}'s withdrawal of {formatMoney(rejectionModalTx.amount)}. Funds will be refunded to member balance.
            </p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Identity verification pending or signature mismatch..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#C27D50] focus:outline-none text-[#4A4A40]"
            ></textarea>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectionModalTx(null)}
                className="px-3 py-2 rounded-lg border border-[#D8D5C8] text-[#4A4A40] text-xs font-semibold hover:bg-[#EAE7DC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-[#C27D50] hover:bg-[#B06F45] text-white text-xs font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
