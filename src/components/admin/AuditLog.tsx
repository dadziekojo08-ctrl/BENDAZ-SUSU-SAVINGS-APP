import React, { useState, useMemo } from 'react';
import { useSusu } from '../../context/SusuContext';
import { AuditLogEntry, AuditActionType, AuditSeverity } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Trash2,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  UserPlus,
  UserCheck,
  CheckCircle2,
  XCircle,
  Banknote,
  Scale,
  Info,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  User,
  Eye,
  X,
  Sparkles,
  Check,
  ChevronRight,
  History,
} from 'lucide-react';

interface AuditLogProps {
  compact?: boolean;
  maxCompactItems?: number;
  onViewAll?: () => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({
  compact = false,
  maxCompactItems = 6,
  onViewAll,
}) => {
  const { auditLogs, formatMoney, clearAuditLogs } = useSusu();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'MEMBER' | 'BANKER_SETTLE'>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'admin' | 'banker'>('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'ALL' | AuditSeverity>('ALL');
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<AuditLogEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Helper to format relative time
  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSec < 45) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return isoString;
    }
  };

  // Helper for action metadata (icon, label, style)
  const getActionMeta = (action: AuditActionType) => {
    switch (action) {
      case 'DEPOSIT_RECORDED':
        return {
          label: 'Deposit Recorded',
          icon: ArrowDownRight,
          badgeBg: 'bg-[#8E9775]/20 text-[#4A4D3A] border-[#8E9775]/40',
          iconColor: 'text-[#5A5E46]',
          category: 'DEPOSIT',
        };
      case 'WITHDRAWAL_REQUESTED':
        return {
          label: 'Withdrawal Requested',
          icon: ArrowUpRight,
          badgeBg: 'bg-[#D4A359]/20 text-[#8F6522] border-[#D4A359]/40',
          iconColor: 'text-[#8F6522]',
          category: 'WITHDRAWAL',
        };
      case 'WITHDRAWAL_APPROVED':
        return {
          label: 'Withdrawal Approved',
          icon: CheckCircle2,
          badgeBg: 'bg-[#8E9775]/25 text-[#383B2B] border-[#8E9775]/50',
          iconColor: 'text-[#5A5E46]',
          category: 'WITHDRAWAL',
        };
      case 'WITHDRAWAL_REJECTED':
        return {
          label: 'Withdrawal Rejected',
          icon: XCircle,
          badgeBg: 'bg-[#C27D50]/20 text-[#96471E] border-[#C27D50]/40',
          iconColor: 'text-[#96471E]',
          category: 'WITHDRAWAL',
        };
      case 'WITHDRAWAL_DISBURSED':
        return {
          label: 'Withdrawal Disbursed',
          icon: Banknote,
          badgeBg: 'bg-[#6A7B58]/20 text-[#3F4D33] border-[#6A7B58]/40',
          iconColor: 'text-[#3F4D33]',
          category: 'WITHDRAWAL',
        };
      case 'MEMBER_CREATED':
        return {
          label: 'Member Onboarded',
          icon: UserPlus,
          badgeBg: 'bg-[#EAE7DC] text-[#383B2B] border-[#D5CFB9]',
          iconColor: 'text-[#4A4D3A]',
          category: 'MEMBER',
        };
      case 'BANKER_CREATED':
        return {
          label: 'Banker Created',
          icon: UserCheck,
          badgeBg: 'bg-[#D8D5C8]/40 text-[#383B2B] border-[#C8C5B8]',
          iconColor: 'text-[#4A4D3A]',
          category: 'BANKER_SETTLE',
        };
      case 'RECONCILIATION_SETTLED':
        return {
          label: 'EOD Reconciliation',
          icon: Scale,
          badgeBg: 'bg-[#7A7A65]/20 text-[#2C2E22] border-[#7A7A65]/35',
          iconColor: 'text-[#383B2B]',
          category: 'BANKER_SETTLE',
        };
      default:
        return {
          label: action,
          icon: Info,
          badgeBg: 'bg-gray-100 text-gray-700 border-gray-200',
          iconColor: 'text-gray-600',
          category: 'OTHER',
        };
    }
  };

  // Severity styling helper
  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'success':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#8E9775]/20 text-[#383B2B] border border-[#8E9775]/30">
            Success
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#D4A359]/20 text-[#7A5418] border border-[#D4A359]/40">
            Pending / Warning
          </span>
        );
      case 'alert':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#C27D50]/20 text-[#96471E] border border-[#C27D50]/40">
            Alert
          </span>
        );
      case 'info':
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#EAE7DC] text-[#5A5A40] border border-[#D5CFB9]">
            Info
          </span>
        );
    }
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        log.description.toLowerCase().includes(query) ||
        log.actorName.toLowerCase().includes(query) ||
        (log.targetName && log.targetName.toLowerCase().includes(query)) ||
        log.targetId.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        (log.details?.receiptNumber && String(log.details.receiptNumber).toLowerCase().includes(query));

      const matchesRole =
        selectedRoleFilter === 'ALL' || log.actorRole === selectedRoleFilter;

      const matchesSeverity =
        selectedSeverityFilter === 'ALL' || log.severity === selectedSeverityFilter;

      let matchesAction = true;
      if (selectedActionFilter === 'DEPOSIT') {
        matchesAction = log.action === 'DEPOSIT_RECORDED';
      } else if (selectedActionFilter === 'WITHDRAWAL') {
        matchesAction =
          log.action === 'WITHDRAWAL_REQUESTED' ||
          log.action === 'WITHDRAWAL_APPROVED' ||
          log.action === 'WITHDRAWAL_REJECTED' ||
          log.action === 'WITHDRAWAL_DISBURSED';
      } else if (selectedActionFilter === 'MEMBER') {
        matchesAction = log.action === 'MEMBER_CREATED';
      } else if (selectedActionFilter === 'BANKER_SETTLE') {
        matchesAction =
          log.action === 'BANKER_CREATED' || log.action === 'RECONCILIATION_SETTLED';
      }

      return matchesSearch && matchesRole && matchesSeverity && matchesAction;
    });
  }, [auditLogs, searchQuery, selectedActionFilter, selectedRoleFilter, selectedSeverityFilter]);

  // Key metrics
  const totalEvents = auditLogs.length;
  const depositEvents = auditLogs.filter((l) => l.action === 'DEPOSIT_RECORDED').length;
  const withdrawalEvents = auditLogs.filter((l) =>
    ['WITHDRAWAL_REQUESTED', 'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'WITHDRAWAL_DISBURSED'].includes(l.action)
  ).length;
  const memberEvents = auditLogs.filter((l) => l.action === 'MEMBER_CREATED').length;
  const alertEvents = auditLogs.filter((l) => l.severity === 'alert' || l.severity === 'warning').length;

  // Export audit logs as CSV
  const handleExportCSV = () => {
    if (auditLogs.length === 0) return;

    const headers = [
      'Log ID',
      'Timestamp (ISO)',
      'Action Type',
      'Actor Name',
      'Actor Role',
      'Target Type',
      'Target ID',
      'Target Name',
      'Amount',
      'Severity',
      'Description',
    ];

    const rows = auditLogs.map((log) => [
      log.id,
      new Date(log.timestamp).toISOString(),
      log.action,
      `"${log.actorName}"`,
      log.actorRole,
      log.targetType,
      log.targetId,
      `"${log.targetName || ''}"`,
      log.amount || '',
      log.severity,
      `"${log.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `bendaz_susu_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compact View for Dashboard Overview Widget
  if (compact) {
    const compactList = auditLogs.slice(0, maxCompactItems);

    return (
      <div className="bg-white rounded-2xl border border-[#EAE7DC] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#383B2B] text-[#EAE7DC] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-brand font-bold text-sm text-[#3A3D2C]">
                Live Audit Activity Feed
              </h3>
              <p className="text-[11px] text-[#7A7A65]">
                Real-time log of deposits, withdrawals, and member operations
              </p>
            </div>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-[#5A5A40] hover:text-[#3A3D2C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Trail ({totalEvents})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {compactList.length === 0 ? (
          <div className="py-6 text-center text-[#8A8A70] bg-[#F9F8F4] rounded-xl border border-dashed border-[#EAE7DC] text-xs">
            <History className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-[#5A5A40]" />
            No audit records logged yet. Operations will appear here live.
          </div>
        ) : (
          <div className="divide-y divide-[#F0EDE3]">
            {compactList.map((log) => {
              const meta = getActionMeta(log.action);
              const Icon = meta.icon;
              return (
                <div key={log.id} className="py-2.5 flex items-start gap-3 text-xs">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 border ${meta.badgeBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${meta.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#383B2B] truncate">{meta.label}</span>
                      <span className="text-[10px] text-[#8A8A70] font-mono shrink-0">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-[#6A6A55] text-[11px] line-clamp-1 mt-0.5">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8A8A70]">
                      <span>By: <strong className="text-[#4A4D3A]">{log.actorName}</strong></span>
                      {log.amount !== undefined && log.amount > 0 && (
                        <span className="font-mono font-bold text-[#383B2B]">
                          {formatMoney(log.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Full Screen / Tab View
  return (
    <div className="space-y-6">
      {/* Header Banner & Overview Cards */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#383B2B] text-[#EAE7DC] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-xl text-[#3A3D2C]">
                Audit Trail & Operations Log
              </h2>
              <p className="text-xs text-[#7A7A65]">
                Immutable compliance tracking for member onboarding, daily deposits, withdrawal approvals, disbursements, and banker reconciliations.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={auditLogs.length === 0}
            className="px-3.5 py-2 rounded-xl border border-[#D5CFB9] bg-white hover:bg-[#F9F8F4] text-[#383B2B] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#8E9775]" />
            <span>Export Audit Trail (CSV)</span>
          </button>

          {auditLogs.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 rounded-xl border border-[#C27D50]/30 bg-[#C27D50]/10 hover:bg-[#C27D50]/20 text-[#96471E] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#96471E]" />
              <span>Clear Trail</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DC] shadow-2xs">
          <span className="text-[11px] font-bold text-[#8A8A70] uppercase tracking-wider block">
            Total Operations
          </span>
          <div className="text-xl font-extrabold text-[#383B2B] mt-1 font-mono">
            {totalEvents}
          </div>
          <span className="text-[10px] text-[#8E9775] font-medium">100% Captured</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DC] shadow-2xs">
          <span className="text-[11px] font-bold text-[#8A8A70] uppercase tracking-wider block">
            Deposits Logged
          </span>
          <div className="text-xl font-extrabold text-[#5A5E46] mt-1 font-mono">
            {depositEvents}
          </div>
          <span className="text-[10px] text-[#7A7A65]">Daily Inflows</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DC] shadow-2xs">
          <span className="text-[11px] font-bold text-[#8A8A70] uppercase tracking-wider block">
            Withdrawal Actions
          </span>
          <div className="text-xl font-extrabold text-[#8F6522] mt-1 font-mono">
            {withdrawalEvents}
          </div>
          <span className="text-[10px] text-[#7A7A65]">Requests & Payouts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DC] shadow-2xs">
          <span className="text-[11px] font-bold text-[#8A8A70] uppercase tracking-wider block">
            Saver Onboardings
          </span>
          <div className="text-xl font-extrabold text-[#383B2B] mt-1 font-mono">
            {memberEvents}
          </div>
          <span className="text-[10px] text-[#7A7A65]">Member Creations</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7DC] shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-[#8A8A70] uppercase tracking-wider block">
            Attention / Alerts
          </span>
          <div className="text-xl font-extrabold text-[#96471E] mt-1 font-mono">
            {alertEvents}
          </div>
          <span className="text-[10px] text-[#C27D50]">Pending & Rejections</span>
        </div>
      </div>

      {/* Search & Filter Toolbars */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE7DC] shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A8A70] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by actor, member, banker, receipt #, target ID, or note..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#F9F8F4] border border-[#D5CFB9] rounded-xl text-[#383B2B] placeholder-[#8A8A70] focus:outline-none focus:border-[#5A5A40] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A70] hover:text-[#383B2B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-[#7A7A65] mr-1 hidden sm:inline">
              Filter Action:
            </span>
            {[
              { id: 'ALL', label: 'All Operations' },
              { id: 'DEPOSIT', label: 'Deposits' },
              { id: 'WITHDRAWAL', label: 'Withdrawals' },
              { id: 'MEMBER', label: 'Members' },
              { id: 'BANKER_SETTLE', label: 'Fleet & EOD' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedActionFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedActionFilter === tab.id
                    ? 'bg-[#383B2B] text-white shadow-2xs'
                    : 'bg-[#F0EDE3] text-[#6A6A55] hover:bg-[#E4E0D1] hover:text-[#383B2B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row: Role & Severity */}
        <div className="pt-2 border-t border-[#F0EDE3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#7A7A65]">Actor:</span>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
                className="bg-[#F9F8F4] border border-[#D5CFB9] text-[#383B2B] rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:border-[#5A5A40]"
              >
                <option value="ALL">All Roles</option>
                <option value="admin">Admin Only</option>
                <option value="banker">Banker Only</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#7A7A65]">Status / Severity:</span>
              <select
                value={selectedSeverityFilter}
                onChange={(e) => setSelectedSeverityFilter(e.target.value as any)}
                className="bg-[#F9F8F4] border border-[#D5CFB9] text-[#383B2B] rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:border-[#5A5A40]"
              >
                <option value="ALL">All Severities</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning / Pending</option>
                <option value="alert">Alert / Critical</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-[#7A7A65]">
            Showing <strong className="text-[#383B2B]">{filteredLogs.length}</strong> of{' '}
            <strong className="text-[#383B2B]">{auditLogs.length}</strong> events
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#EAE7DC] shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFECE3] text-[#7A7A65] flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-serif-brand font-bold text-base text-[#383B2B]">
              No Audit Events Found
            </h3>
            <p className="text-xs text-[#7A7A65] max-w-md mx-auto">
              {searchQuery || selectedActionFilter !== 'ALL' || selectedRoleFilter !== 'ALL' || selectedSeverityFilter !== 'ALL'
                ? 'No log entries match your current search or filter criteria. Try adjusting or clearing filters.'
                : 'No critical operations have been logged in the audit trail yet. As deposits, withdrawals, and member creations occur, they will appear here.'}
            </p>
            {(searchQuery || selectedActionFilter !== 'ALL' || selectedRoleFilter !== 'ALL' || selectedSeverityFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedActionFilter('ALL');
                  setSelectedRoleFilter('ALL');
                  setSelectedSeverityFilter('ALL');
                }}
                className="mt-2 text-xs font-bold text-[#5A5A40] underline hover:text-[#383B2B] cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F9F8F4] border-b border-[#EAE7DC] text-[#7A7A65] font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Time & ID</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target / Entity</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Description & Summary</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE3]">
                {filteredLogs.map((log) => {
                  const meta = getActionMeta(log.action);
                  const Icon = meta.icon;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLogForDetail(log)}
                      className="hover:bg-[#FAF9F5] transition-colors cursor-pointer group"
                    >
                      {/* Timestamp & ID */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="font-mono font-bold text-[#383B2B] text-[11px]">
                          {formatRelativeTime(log.timestamp)}
                        </div>
                        <div className="text-[10px] text-[#8A8A70] font-mono mt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[9px] text-[#A5A58D] font-mono mt-0.5">
                          {log.id.split('-').slice(0, 2).join('-')}
                        </div>
                      </td>

                      {/* Operation Action Badge */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[11px] ${meta.badgeBg}`}>
                          <Icon className={`w-3.5 h-3.5 ${meta.iconColor}`} />
                          <span>{meta.label}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#383B2B]">{log.actorName}</span>
                        </div>
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 ${
                          log.actorRole === 'admin'
                            ? 'bg-[#383B2B] text-white'
                            : 'bg-[#D8D5C8] text-[#383B2B]'
                        }`}>
                          {log.actorRole}
                        </span>
                      </td>

                      {/* Target / Entity */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {log.targetName ? (
                          <>
                            <div className="font-bold text-[#383B2B]">{log.targetName}</div>
                            <div className="text-[10px] text-[#8A8A70] font-mono">
                              {log.targetType.toUpperCase()}: {log.targetId}
                            </div>
                          </>
                        ) : (
                          <span className="font-mono text-[#8A8A70]">{log.targetId}</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {log.amount !== undefined && log.amount > 0 ? (
                          <span className="font-mono font-bold text-[#383B2B]">
                            {formatMoney(log.amount)}
                          </span>
                        ) : (
                          <span className="text-[#A5A58D] font-mono">—</span>
                        )}
                      </td>

                      {/* Description & Narrative */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="text-[#5A5A40] text-xs leading-relaxed line-clamp-2">
                          {log.description}
                        </p>
                      </td>

                      {/* Severity / Status */}
                      <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>

                      {/* View Action */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLogForDetail(log);
                          }}
                          className="p-1.5 rounded-lg border border-[#D5CFB9] hover:bg-[#EFECE3] text-[#5A5A40] group-hover:text-[#383B2B] transition-colors cursor-pointer"
                          title="Inspect Event Payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#D5CFB9] max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#F0EDE3] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#383B2B] text-[#EAE7DC] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-brand font-bold text-base text-[#383B2B]">
                    Audit Event Inspection
                  </h3>
                  <span className="text-[11px] text-[#7A7A65] font-mono">
                    ID: {selectedLogForDetail.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="p-1.5 rounded-lg hover:bg-[#F0EDE3] text-[#7A7A65] hover:text-[#383B2B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Summary */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F9F8F4] border border-[#EAE7DC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#8A8A70] uppercase text-[10px]">Action</span>
                  <span className="font-bold text-[#383B2B]">{selectedLogForDetail.action}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#8A8A70] uppercase text-[10px]">Exact Timestamp</span>
                  <span className="font-mono text-[#383B2B]">
                    {new Date(selectedLogForDetail.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#8A8A70] uppercase text-[10px]">Actor Name</span>
                  <span className="font-bold text-[#383B2B]">
                    {selectedLogForDetail.actorName} ({selectedLogForDetail.actorRole})
                  </span>
                </div>
                {selectedLogForDetail.targetName && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#8A8A70] uppercase text-[10px]">Target Entity</span>
                    <span className="font-bold text-[#383B2B]">
                      {selectedLogForDetail.targetName} ({selectedLogForDetail.targetId})
                    </span>
                  </div>
                )}
                {selectedLogForDetail.amount !== undefined && selectedLogForDetail.amount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#8A8A70] uppercase text-[10px]">Amount</span>
                    <span className="font-mono font-extrabold text-[#383B2B]">
                      {formatMoney(selectedLogForDetail.amount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#8A8A70] uppercase text-[10px]">Severity</span>
                  <div>{getSeverityBadge(selectedLogForDetail.severity)}</div>
                </div>
              </div>

              {/* Narrative description */}
              <div>
                <label className="font-bold text-[#8A8A70] uppercase text-[10px] block mb-1">
                  Full Description
                </label>
                <div className="p-3 rounded-xl bg-[#F0EDE3] text-[#383B2B] text-xs leading-relaxed font-medium">
                  {selectedLogForDetail.description}
                </div>
              </div>

              {/* Metadata Payload */}
              {selectedLogForDetail.details && Object.keys(selectedLogForDetail.details).length > 0 && (
                <div>
                  <label className="font-bold text-[#8A8A70] uppercase text-[10px] block mb-1">
                    Structured Event Metadata
                  </label>
                  <pre className="p-3 rounded-xl bg-[#2C2E22] text-[#EAE7DC] text-[11px] font-mono overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLogForDetail.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#383B2B] hover:bg-[#2C2E22] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR CONFIRMATION MODAL */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#D5CFB9] max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C27D50]/20 text-[#96471E] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-serif-brand font-bold text-base text-[#383B2B]">
                Clear Audit Trail?
              </h3>
              <p className="text-xs text-[#7A7A65] mt-1">
                Are you sure you want to clear all {auditLogs.length} logged audit events? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl border border-[#D5CFB9] text-[#5A5A40] text-xs font-bold hover:bg-[#F9F8F4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAuditLogs();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#C27D50] hover:bg-[#A95F34] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
