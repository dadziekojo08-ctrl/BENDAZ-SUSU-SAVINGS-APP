import React from 'react';
import { TransactionStatus, TransactionType } from '../../types';
import { Clock, CheckCircle2, ShieldCheck, XCircle, Check, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface WithdrawalStatusBadgeProps {
  status: TransactionStatus;
  size?: 'sm' | 'md' | 'lg';
  showSubtext?: boolean;
  approvedBy?: string;
  disbursedBy?: string;
  rejectionReason?: string;
  className?: string;
}

export const WithdrawalStatusBadge: React.FC<WithdrawalStatusBadgeProps> = ({
  status,
  size = 'md',
  showSubtext = false,
  approvedBy,
  disbursedBy,
  rejectionReason,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2 font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  switch (status) {
    case 'PENDING_APPROVAL':
      return (
        <div className={`inline-flex flex-col ${className}`}>
          <span
            className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] shadow-xs ${sizeClasses}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA580C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EA580C]"></span>
            </span>
            <Clock className={`${iconSizes} text-[#EA580C]`} />
            <span>Pending Approval</span>
          </span>
          {showSubtext && (
            <span className="text-[10px] text-[#9A3412] mt-0.5 font-medium pl-1">
              Awaiting Admin Authorization
            </span>
          )}
        </div>
      );

    case 'APPROVED':
      return (
        <div className={`inline-flex flex-col ${className}`}>
          <span
            className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD] shadow-xs ${sizeClasses}`}
          >
            <CheckCircle2 className={`${iconSizes} text-[#2563EB]`} />
            <span>Approved (Ready to Pay)</span>
          </span>
          {showSubtext && approvedBy && (
            <span className="text-[10px] text-[#1E40AF] mt-0.5 font-medium pl-1">
              Authorized by {approvedBy}
            </span>
          )}
        </div>
      );

    case 'DISBURSED':
      return (
        <div className={`inline-flex flex-col ${className}`}>
          <span
            className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#047857] border border-[#6EE7B7] shadow-xs ${sizeClasses}`}
          >
            <ShieldCheck className={`${iconSizes} text-[#059669]`} />
            <span>Paid & Disbursed</span>
          </span>
          {showSubtext && disbursedBy && (
            <span className="text-[10px] text-[#065F46] mt-0.5 font-medium pl-1">
              Disbursed by {disbursedBy}
            </span>
          )}
        </div>
      );

    case 'REJECTED':
      return (
        <div className={`inline-flex flex-col ${className}`}>
          <span
            className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5] shadow-xs ${sizeClasses}`}
          >
            <XCircle className={`${iconSizes} text-[#DC2626]`} />
            <span>Rejected</span>
          </span>
          {showSubtext && rejectionReason && (
            <span className="text-[10px] text-[#991B1B] mt-0.5 font-medium pl-1 truncate max-w-xs">
              Reason: {rejectionReason}
            </span>
          )}
        </div>
      );

    case 'COMPLETED':
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC] shadow-xs ${sizeClasses} ${className}`}
        >
          <Check className={`${iconSizes} text-[#16A34A]`} />
          <span>Completed</span>
        </span>
      );
  }
};

interface TransactionTypeBadgeProps {
  type: TransactionType;
  isFirstDepositOfficeFee?: boolean;
  size?: 'sm' | 'md';
}

export const TransactionTypeBadge: React.FC<TransactionTypeBadgeProps> = ({
  type,
  isFirstDepositOfficeFee,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  if (isFirstDepositOfficeFee) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] ${sizeClasses}`}
      >
        <ArrowDownRight className="w-3 h-3 text-[#B45309]" />
        <span>Day 1 Office Fee</span>
      </span>
    );
  }

  if (type === 'DEPOSIT') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] ${sizeClasses}`}
      >
        <ArrowDownRight className="w-3 h-3 text-[#15803D]" />
        <span>Deposit</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3] ${sizeClasses}`}
    >
      <ArrowUpRight className="w-3 h-3 text-[#BE123C]" />
      <span>Withdrawal</span>
    </span>
  );
};
