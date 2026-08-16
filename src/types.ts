export type UserRole = 'admin' | 'banker';

export type CurrencyCode = 'GHS' | 'USD' | 'NGN' | 'KES';

export interface AuthUser {
  role: UserRole;
  username: string;
  name: string;
  bankerId?: string;
  avatar?: string;
  phone?: string;
}

export interface SusuStamp {
  day: number;
  date?: string;
  amount?: number;
  receiptId?: string;
  bankerName?: string;
  verified: boolean;
  isOfficeFee?: boolean; // Day 1 deposit retained for Office
}

export interface Banker {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  routeId: string;
  routeName: string;
  zone: string;
  dailyTarget: number;
  collectedToday: number;
  withdrawnToday: number;
  assignedMemberCount: number;
  commissionRate: number; // e.g. 3.3% or 1 day standard Susu contribution
  commissionModel: 'ONE_DAY_CONTRIBUTION' | 'PERCENTAGE' | 'FLAT_FEE';
  status: 'active' | 'on_route' | 'reconciled' | 'inactive';
  joinedDate: string;
  lastActive: string;
  notes?: string;
  password?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  assignedBankerId: string;
  assignedBankerName: string;
  routeId: string;
  routeName: string;
  locationStall: string;
  dailyTarget: number;
  totalBalance: number; // Available Withdrawable Balance (excluding Office Fee)
  officeFeePaid: number; // 1st deposit retained by Office (GH₵0 fee on future withdrawals)
  totalSavingsAllTime: number; // Total gross deposits ever made
  totalWithdrawnAllTime: number;
  susuCycleDays: number; // standard is 31
  currentCyclePaidDays: number;
  savingsGoal?: {
    title: string;
    target: number;
    deadline: string;
  };
  status: 'active' | 'dormant' | 'cycle_ready';
  joinedDate: string;
  lastPaymentDate?: string;
  visitedToday: boolean;
  depositedToday: boolean;
  todayDepositAmount?: number;
  stamps: SusuStamp[];
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'OFFICE_FEE_ALLOCATION';
export type PaymentMethod = 'CASH' | 'MTN_MOMO' | 'TELECEL_CASH' | 'AIRTELTIGO' | 'BANK_TRANSFER';
export type TransactionStatus = 'COMPLETED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
export type PayoutMode = 'BANKER_CASH_HANDOVER' | 'ADMIN_MOMO_TRANSFER' | 'VAULT_OFFICE_PICKUP';

export interface Transaction {
  id: string;
  receiptNumber: string;
  type: TransactionType;
  memberId: string;
  memberName: string;
  memberPhone: string;
  bankerId: string;
  bankerName: string;
  amount: number;
  fee: number; // Always 0 for member withdrawals per policy
  netAmount: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
  susuDayNumber?: number;
  isFirstDepositOfficeFee?: boolean;
  status: TransactionStatus;
  withdrawalReason?: string;
  payoutMode?: PayoutMode;
  initiatedByRole?: 'banker' | 'admin';
  approvedBy?: string;
  approvalDate?: string;
  disbursedBy?: string;
  disbursementDate?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface Route {
  id: string;
  name: string;
  zone: string;
  description: string;
  bankerId: string;
  bankerName: string;
  totalMembers: number;
  dailyEstimatedTarget: number;
  stopsCount: number;
}

export interface ReconciliationRecord {
  id: string;
  date: string;
  bankerId: string;
  bankerName: string;
  totalCollected: number;
  totalDisbursed: number;
  netCashDue: number;
  cashReceivedByAdmin: number;
  discrepancy: number;
  status: 'SETTLED' | 'PENDING' | 'DISCREPANCY';
  verifiedBy: string;
  settlementTime: string;
  notes?: string;
}

export type AuditActionType =
  | 'MEMBER_CREATED'
  | 'DEPOSIT_RECORDED'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'WITHDRAWAL_DISBURSED'
  | 'BANKER_CREATED'
  | 'RECONCILIATION_SETTLED';

export type AuditSeverity = 'info' | 'success' | 'warning' | 'alert';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditActionType;
  actorName: string;
  actorRole: 'admin' | 'banker' | 'system';
  targetType: 'member' | 'banker' | 'transaction' | 'reconciliation';
  targetId: string;
  targetName?: string;
  amount?: number;
  description: string;
  details?: Record<string, any>;
  severity: AuditSeverity;
}
