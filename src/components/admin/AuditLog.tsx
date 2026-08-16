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
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconColor: 'text-emerald-600',
          category: 'DEPOSIT',
        };
      case 'WITHDRAWAL_REQUESTED':
        return {
          label: 'Withdrawal Requested',
          icon: ArrowUpRight,
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          iconColor: 'text-amber-600',
          category: 'WITHDRAWAL',
        };
      case 'WITHDRAWAL_APPROVED':
        return {
          label: 'Withdrawal Approved',
          icon: CheckCircle2,
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          iconColor: 'text-blue-600',
          category: 'WITHDRAWAL',
        };
      case 'WITHDRAWAL_REJECTED':
        return {
          label: 'Withdrawal Rejected',
          icon: XCircle,
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          iconColor: 'text-rose-600',
          category: 'WITHDRAWAL',
        };
      case 'WITHDRAWAL_DISBURSED':
        return {
          label: 'Withdrawal Disbursed',
          icon: Banknote,
          badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
          iconColor: 'text-teal-600',
          category: 'WITHDRAWAL',
        };
      case 'MEMBER_CREATED':
        return {
          label: 'Saver Account Created',
          icon: UserPlus,
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
          iconColor: 'text-purple-600',
          category: 'MEMBER',
        };
      case 'BANKER_CREATED':
        return {
          label: 'Banker Created',
          icon: UserCheck,
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          iconColor: 'text-indigo-600',
          category: 'BANKER_SETTLE',
        };
      case 'RECONCILIATION_SETTLED':
        return {
          label: 'EOD Reconciliation',
          icon: Scale,
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          iconColor: 'text-slate-700',
          category: 'BANKER_SETTLE',
        };
      default:
        return {
          label: action,
          icon: Info,
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          iconColor: 'text-slate-600',
          category: 'OTHER',
        };
    }
  };

  // Severity styling helper
  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'success':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Success
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            Pending / Warning
          </span>
        );
      case 'alert':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            Alert
          </span>
        );
      case 'info':
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
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
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Live Audit Activity Feed
              </h3>
              <p className="text-[11px] text-slate-500">
                Real-time log of deposits, withdrawals, and member operations
              </p>
            </div>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Trail ({totalEvents})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {compactList.length === 0 ? (
          <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
            <History className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
            No audit records logged yet. Operations will appear here live.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
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
                      <span className="font-bold text-slate-900 truncate">{meta.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-1 mt-0.5">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>By: <strong className="text-slate-700">{log.actorName}</strong></span>
                      {log.amount !== undefined && log.amount > 0 && (
                        <span className="font-mono font-bold text-slate-900">
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
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900 font-display">
                Audit Trail & Operations Log
              </h2>
              <p className="text-xs text-slate-500">
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
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Audit Trail (CSV)</span>
          </button>

          {auditLogs.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear Trail</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Operations
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {totalEvents}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">100% Captured</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Deposits Logged
          </span>
          <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">
            {depositEvents}
          </div>
          <span className="text-[10px] text-slate-500">Daily Inflows</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Withdrawal Actions
          </span>
          <div className="text-xl font-extrabold text-amber-600 mt-1 font-mono">
            {withdrawalEvents}
          </div>
          <span className="text-[10px] text-slate-500">Requests & Payouts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Saver Accounts
          </span>
          <div className="text-xl font-extrabold text-purple-600 mt-1 font-mono">
            {memberEvents}
          </div>
          <span className="text-[10px] text-slate-500">Account Creations</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Attention / Alerts
          </span>
          <div className="text-xl font-extrabold text-rose-600 mt-1 font-mono">
            {alertEvents}
          </div>
          <span className="text-[10px] text-rose-600">Pending & Rejections</span>
        </div>
      </div>

      {/* Search & Filter Toolbars */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by actor, member, banker, receipt #, target ID, or note..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">
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
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row: Role & Severity */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500">Actor:</span>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Roles</option>
                <option value="admin">Admin Only</option>
                <option value="banker">Banker Only</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500">Status / Severity:</span>
              <select
                value={selectedSeverityFilter}
                onChange={(e) => setSelectedSeverityFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Severities</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning / Pending</option>
                <option value="alert">Alert / Critical</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Showing <strong className="text-slate-900">{filteredLogs.length}</strong> of{' '}
            <strong className="text-slate-900">{auditLogs.length}</strong> events
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 font-display">
              No Audit Events Found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
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
                className="mt-2 text-xs font-bold text-emerald-600 underline hover:text-emerald-700 cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
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
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const meta = getActionMeta(log.action);
                  const Icon = meta.icon;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLogForDetail(log)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp & ID */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-[11px]">
                          {formatRelativeTime(log.timestamp)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
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
                          <span className="font-bold text-slate-900">{log.actorName}</span>
                        </div>
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 ${
                          log.actorRole === 'admin'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {log.actorRole}
                        </span>
                      </td>

                      {/* Target / Entity */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {log.targetName ? (
                          <>
                            <div className="font-bold text-slate-900">{log.targetName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {log.targetType.toUpperCase()}: {log.targetId}
                            </div>
                          </>
                        ) : (
                          <span className="font-mono text-slate-400">{log.targetId}</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {log.amount !== undefined && log.amount > 0 ? (
                          <span className="font-mono font-bold text-slate-900">
                            {formatMoney(log.amount)}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )}
                      </td>

                      {/* Description & Narrative */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
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
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 group-hover:text-slate-900 transition-colors cursor-pointer"
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
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-display">
                    Audit Event Inspection
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedLogForDetail.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Summary */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Action</span>
                  <span className="font-bold text-slate-900">{selectedLogForDetail.action}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Exact Timestamp</span>
                  <span className="font-mono text-slate-800">
                    {new Date(selectedLogForDetail.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Actor Name</span>
                  <span className="font-bold text-slate-900">
                    {selectedLogForDetail.actorName} ({selectedLogForDetail.actorRole})
                  </span>
                </div>
                {selectedLogForDetail.targetName && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Target Entity</span>
                    <span className="font-bold text-slate-900">
                      {selectedLogForDetail.targetName} ({selectedLogForDetail.targetId})
                    </span>
                  </div>
                )}
                {selectedLogForDetail.amount !== undefined && selectedLogForDetail.amount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Amount</span>
                    <span className="font-mono font-extrabold text-emerald-600">
                      {formatMoney(selectedLogForDetail.amount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Severity</span>
                  <div>{getSeverityBadge(selectedLogForDetail.severity)}</div>
                </div>
              </div>

              {/* Narrative description */}
              <div>
                <label className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                  Full Description
                </label>
                <div className="p-3 rounded-xl bg-slate-100 text-slate-800 text-xs leading-relaxed font-medium">
                  {selectedLogForDetail.description}
                </div>
              </div>

              {/* Metadata Payload */}
              {selectedLogForDetail.details && Object.keys(selectedLogForDetail.details).length > 0 && (
                <div>
                  <label className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                    Structured Event Metadata
                  </label>
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLogForDetail.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
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
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900 font-display">
                Clear Audit Trail?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to clear all {auditLogs.length} logged audit events? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAuditLogs();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
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
