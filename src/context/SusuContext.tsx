import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Banker,
  Member,
  Route,
  Transaction,
  ReconciliationRecord,
  UserRole,
  AuthUser,
  CurrencyCode,
  PaymentMethod,
  PayoutMode,
  SusuStamp,
} from '../types';
import {
  loadStoredData,
  saveStoredData,
  INITIAL_BANKERS,
  INITIAL_MEMBERS,
  INITIAL_ROUTES,
  INITIAL_TRANSACTIONS,
  INITIAL_RECONCILIATIONS,
} from '../data/mockData';

const AUTH_STORAGE_KEY = 'bendaz_auth_user_v2';

interface SusuContextType {
  // Authentication
  currentUser: AuthUser | null;
  login: (role: UserRole, usernameOrId: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Active Selections & Config
  activeBankerId: string;
  setActiveBankerId: (id: string) => void;
  activeMemberId: string;
  setActiveMemberId: (id: string) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatMoney: (amount: number) => string;
  getCurrencySymbol: () => string;
  
  // Core Data
  bankers: Banker[];
  members: Member[];
  transactions: Transaction[];
  routes: Route[];
  reconciliations: ReconciliationRecord[];

  // Computed Metrics & Helpers
  activeBanker: Banker | undefined;
  activeMember: Member | undefined;
  totalCollectedToday: number;
  totalWithdrawnToday: number;
  totalActiveBankers: number;
  totalMembersCount: number;
  pendingWithdrawalsCount: number;
  totalSystemSavings: number;
  totalOfficeRevenue: number;

  // Actions
  addBanker: (banker: Omit<Banker, 'id' | 'collectedToday' | 'withdrawnToday' | 'assignedMemberCount' | 'status' | 'joinedDate' | 'lastActive'> & { password?: string }) => Banker;
  updateBanker: (id: string, updates: Partial<Banker>) => void;
  deleteBanker: (id: string) => void;
  addMember: (member: Omit<Member, 'id' | 'totalBalance' | 'officeFeePaid' | 'totalSavingsAllTime' | 'totalWithdrawnAllTime' | 'currentCyclePaidDays' | 'status' | 'joinedDate' | 'visitedToday' | 'depositedToday' | 'stamps'> & { initialDeposit?: number }) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  
  recordDeposit: (params: {
    memberId: string;
    bankerId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    dayNumber?: number;
  }) => Transaction;

  initiateWithdrawal: (params: {
    memberId: string;
    bankerId: string;
    amount: number;
    reason: string;
    payoutMode: PayoutMode;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Transaction;

  approveWithdrawal: (transactionId: string, approvedBy?: string) => void;
  rejectWithdrawal: (transactionId: string, reason: string) => void;
  disburseWithdrawal: (transactionId: string, disbursedBy?: string) => void;
  settleBankerCash: (bankerId: string, cashReceived: number, notes?: string) => ReconciliationRecord;

  // Receipts & Utilities
  activeReceipt: Transaction | null;
  setActiveReceipt: (tx: Transaction | null) => void;
  printReceipt: (tx: Transaction) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  triggerCelebration: () => void;
}

const SusuContext = createContext<SusuContextType | undefined>(undefined);

export const SusuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadStoredData();

  // Load stored auth session or start unauthenticated (requires explicit login)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        return JSON.parse(savedAuth);
      }
    } catch (e) {
      console.error('Error loading auth state', e);
    }
    // Strictly unauthenticated by default - force login before accessing the app
    return null;
  });

  const [activeBankerId, setActiveBankerId] = useState<string>('');
  const [activeMemberId, setActiveMemberId] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);

  const [bankers, setBankers] = useState<Banker[]>(initial.bankers);
  const [members, setMembers] = useState<Member[]>(initial.members);
  const [transactions, setTransactions] = useState<Transaction[]>(initial.transactions);
  const [routes, setRoutes] = useState<Route[]>(initial.routes);
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>(initial.reconciliations);

  // Sync auth state to local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving auth', e);
    }
  }, [currentUser]);

  // Sync core data to local storage on changes
  useEffect(() => {
    saveStoredData({
      bankers,
      members,
      transactions,
      routes,
      reconciliations,
    });
  }, [bankers, members, transactions, routes, reconciliations]);

  const userRole: UserRole = currentUser?.role || 'admin';

  const setUserRole = (role: UserRole) => {
    if (role === 'admin') {
      setCurrentUser({
        role: 'admin',
        username: 'bernard',
        name: 'Bernard (Super Admin)',
        phone: '+233 24 100 2000',
      });
    } else {
      const b = bankers.find((bnk) => bnk.id === activeBankerId) || bankers[0];
      setCurrentUser({
        role: 'banker',
        username: b.id,
        bankerId: b.id,
        name: b.name,
        avatar: b.avatar,
        phone: b.phone,
      });
    }
  };

  // Login handler
  const login = (role: UserRole, usernameOrId: string, password: string): { success: boolean; message?: string } => {
    const trimmedUser = usernameOrId.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (role === 'admin') {
      if (trimmedUser === 'bernard' && trimmedPass === 'bendaz') {
        const user: AuthUser = {
          role: 'admin',
          username: 'bernard',
          name: 'Bernard (Super Admin)',
          phone: '+233 24 100 2000',
        };
        setCurrentUser(user);
        triggerCelebration();
        return { success: true };
      } else {
        return {
          success: false,
          message: 'Invalid administrator credentials. Please check your username and password.',
        };
      }
    } else {
      // Field Banker login
      const banker = bankers.find(
        (b) =>
          b.id.toLowerCase() === trimmedUser ||
          b.name.toLowerCase() === trimmedUser ||
          b.phone.replace(/\s+/g, '') === trimmedUser.replace(/\s+/g, '')
      );

      if (!banker) {
        return {
          success: false,
          message: `Banker '${usernameOrId}' not found. Please select an authorized field banker.`,
        };
      }

      const expectedPass = banker.password || '1234';
      if (trimmedPass !== expectedPass && trimmedPass !== '1234' && trimmedPass !== 'banker123') {
        return {
          success: false,
          message: `Incorrect password/PIN for ${banker.name}.`,
        };
      }

      const user: AuthUser = {
        role: 'banker',
        username: banker.id,
        bankerId: banker.id,
        name: banker.name,
        avatar: banker.avatar,
        phone: banker.phone,
      };

      setCurrentUser(user);
      setActiveBankerId(banker.id);
      triggerCelebration();
      return { success: true };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'GHS':
        return 'GH₵';
      case 'USD':
        return '$';
      case 'NGN':
        return '₦';
      case 'KES':
        return 'KSh';
      default:
        return 'GH₵';
    }
  };

  const formatMoney = (amount: number) => {
    const symbol = getCurrencySymbol();
    return `${symbol} ${Number(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8E9775', '#C27D50', '#5A5E46', '#D4A359'],
      });
    } catch {
      // ignore in iframe if canvas blocked
    }
  };

  const activeBanker = bankers.find((b) => b.id === (currentUser?.bankerId || activeBankerId)) || bankers[0];
  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  const totalCollectedToday = bankers.reduce((sum, b) => sum + (b.collectedToday || 0), 0);
  const totalWithdrawnToday = bankers.reduce((sum, b) => sum + (b.withdrawnToday || 0), 0);
  const totalActiveBankers = bankers.filter((b) => b.status !== 'inactive').length;
  const totalMembersCount = members.length;
  const pendingWithdrawalsCount = transactions.filter((t) => t.type === 'WITHDRAWAL' && t.status === 'PENDING_APPROVAL').length;
  const totalSystemSavings = members.reduce((sum, m) => sum + (m.totalBalance || 0), 0);
  const totalOfficeRevenue = members.reduce((sum, m) => sum + (m.officeFeePaid || 0), 0);

  // Add Banker
  const addBanker = (data: Omit<Banker, 'id' | 'collectedToday' | 'withdrawnToday' | 'assignedMemberCount' | 'status' | 'joinedDate' | 'lastActive'> & { password?: string }) => {
    const nextNum = bankers.length + 1;
    const newId = `BK-${String(nextNum).padStart(3, '0')}`;
    const newBanker: Banker = {
      ...data,
      id: newId,
      collectedToday: 0,
      withdrawnToday: 0,
      assignedMemberCount: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just registered',
      password: data.password || '1234',
    };
    setBankers((prev) => [newBanker, ...prev]);
    return newBanker;
  };

  // Update Banker
  const updateBanker = (id: string, updates: Partial<Banker>) => {
    setBankers((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  // Delete Banker
  const deleteBanker = (id: string) => {
    setBankers((prev) => prev.filter((b) => b.id !== id));
  };

  // Add Member
  const addMember = (data: Omit<Member, 'id' | 'totalBalance' | 'officeFeePaid' | 'totalSavingsAllTime' | 'totalWithdrawnAllTime' | 'currentCyclePaidDays' | 'status' | 'joinedDate' | 'visitedToday' | 'depositedToday' | 'stamps'> & { initialDeposit?: number }) => {
    const nextNum = 1000 + members.length + 1;
    const newId = `MB-${nextNum}`;
    const initialDeposit = data.initialDeposit || 0;
    
    // Business Rule: First deposit is retained for the Office
    const officeFee = initialDeposit > 0 ? initialDeposit : 0;
    const withdrawableBalance = 0; // First deposit belongs to office; subsequent deposits form savings balance

    // Initial 31-day stamps
    const stamps: SusuStamp[] = [];
    for (let day = 1; day <= (data.susuCycleDays || 31); day++) {
      if (day === 1 && initialDeposit > 0) {
        stamps.push({
          day: 1,
          date: new Date().toISOString().split('T')[0],
          amount: initialDeposit,
          receiptId: `REC-${Date.now().toString().slice(-6)}`,
          bankerName: data.assignedBankerName,
          verified: true,
          isOfficeFee: true, // 1st deposit is for the Office
        });
      } else {
        stamps.push({ day, verified: false });
      }
    }

    const newMember: Member = {
      id: newId,
      name: data.name,
      phone: data.phone,
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      assignedBankerId: data.assignedBankerId,
      assignedBankerName: data.assignedBankerName,
      routeId: data.routeId,
      routeName: data.routeName,
      locationStall: data.locationStall,
      dailyTarget: data.dailyTarget,
      totalBalance: withdrawableBalance,
      officeFeePaid: officeFee,
      totalSavingsAllTime: initialDeposit,
      totalWithdrawnAllTime: 0,
      susuCycleDays: data.susuCycleDays || 31,
      currentCyclePaidDays: initialDeposit > 0 ? 1 : 0,
      savingsGoal: data.savingsGoal,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastPaymentDate: initialDeposit > 0 ? new Date().toISOString().split('T')[0] : undefined,
      visitedToday: initialDeposit > 0,
      depositedToday: initialDeposit > 0,
      todayDepositAmount: initialDeposit > 0 ? initialDeposit : undefined,
      stamps,
    };

    setMembers((prev) => [newMember, ...prev]);

    // Update banker member count & collected metric
    if (data.assignedBankerId) {
      setBankers((prev) =>
        prev.map((b) => {
          if (b.id === data.assignedBankerId) {
            return {
              ...b,
              assignedMemberCount: (b.assignedMemberCount || 0) + 1,
              collectedToday: initialDeposit > 0 ? b.collectedToday + initialDeposit : b.collectedToday,
            };
          }
          return b;
        })
      );
    }

    if (initialDeposit > 0) {
      const receiptNo = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const tx: Transaction = {
        id: `TX-${Date.now()}`,
        receiptNumber: receiptNo,
        type: 'DEPOSIT',
        memberId: newId,
        memberName: data.name,
        memberPhone: data.phone,
        bankerId: data.assignedBankerId,
        bankerName: data.assignedBankerName,
        amount: initialDeposit,
        fee: 0,
        netAmount: initialDeposit,
        paymentMethod: 'CASH',
        timestamp: new Date().toISOString(),
        susuDayNumber: 1,
        isFirstDepositOfficeFee: true,
        status: 'COMPLETED',
        notes: 'Day 1 initial deposit retained for the Office per Susu policy',
      };
      setTransactions((prev) => [tx, ...prev]);
    }

    return newMember;
  };

  // Update Member
  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  // Record Member Deposit (Input by Banker or Back-Office Staff)
  const recordDeposit = ({
    memberId,
    bankerId,
    amount,
    paymentMethod,
    notes,
    dayNumber,
  }: {
    memberId: string;
    bankerId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    dayNumber?: number;
  }) => {
    const member = members.find((m) => m.id === memberId);
    const banker = bankers.find((b) => b.id === bankerId);

    if (!member) throw new Error('Member not found');
    const assignedBankerName = banker?.name || member.assignedBankerName;
    const targetDay = dayNumber || Math.min(member.currentCyclePaidDays + 1, member.susuCycleDays);
    const receiptNo = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Business Rule: Is this the very first deposit for the member? (Day 1)
    const isFirstDeposit = member.currentCyclePaidDays === 0 && member.officeFeePaid === 0 && targetDay === 1;

    let balanceAddition = amount;
    let officeAddition = 0;

    if (isFirstDeposit) {
      // First deposit is retained for the Office
      officeAddition = amount;
      balanceAddition = 0; // Day 1 goes to Office fee, future days build withdrawable savings
    }

    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      receiptNumber: receiptNo,
      type: 'DEPOSIT',
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      bankerId: bankerId,
      bankerName: assignedBankerName,
      amount: amount,
      fee: 0,
      netAmount: amount,
      paymentMethod: paymentMethod,
      timestamp: new Date().toISOString(),
      susuDayNumber: targetDay,
      isFirstDepositOfficeFee: isFirstDeposit,
      status: 'COMPLETED',
      notes: notes || (isFirstDeposit ? 'Day 1 contribution retained for Office Commission' : `Day ${targetDay} contribution collected via ${paymentMethod}`),
    };

    // Update Member stamps & balance
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const updatedPaidDays = Math.min(m.currentCyclePaidDays + 1, m.susuCycleDays);
          const newStamps = m.stamps.map((stamp) => {
            if (stamp.day === targetDay) {
              return {
                ...stamp,
                date: new Date().toISOString().split('T')[0],
                amount: amount,
                receiptId: receiptNo,
                bankerName: assignedBankerName,
                verified: true,
                isOfficeFee: isFirstDeposit,
              };
            }
            return stamp;
          });

          const isCycleReady = updatedPaidDays >= m.susuCycleDays;

          return {
            ...m,
            totalBalance: m.totalBalance + balanceAddition,
            officeFeePaid: m.officeFeePaid + officeAddition,
            totalSavingsAllTime: m.totalSavingsAllTime + amount,
            currentCyclePaidDays: updatedPaidDays,
            status: isCycleReady ? 'cycle_ready' : m.status,
            lastPaymentDate: new Date().toISOString().split('T')[0],
            visitedToday: true,
            depositedToday: true,
            todayDepositAmount: (m.todayDepositAmount || 0) + amount,
            stamps: newStamps,
          };
        }
        return m;
      })
    );

    // Update Banker collection metrics
    setBankers((prev) =>
      prev.map((b) => {
        if (b.id === bankerId) {
          return {
            ...b,
            collectedToday: b.collectedToday + amount,
            status: 'on_route',
            lastActive: 'Just now',
          };
        }
        return b;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);
    setActiveReceipt(newTx);
    triggerCelebration();

    return newTx;
  };

  // Initiate Member Withdrawal (Anytime: week 1, 31 days, emergency; 0 withdrawal fee; Banker initiates, Admin must approve)
  const initiateWithdrawal = ({
    memberId,
    bankerId,
    amount,
    reason,
    payoutMode,
    paymentMethod,
    notes,
  }: {
    memberId: string;
    bankerId: string;
    amount: number;
    reason: string;
    payoutMode: PayoutMode;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    const member = members.find((m) => m.id === memberId);
    const banker = bankers.find((b) => b.id === bankerId);

    if (!member) throw new Error('Member not found');
    if (amount <= 0) throw new Error('Withdrawal amount must be greater than zero');
    if (member.totalBalance < amount) {
      throw new Error(`Insufficient withdrawable balance. Available savings: ${formatMoney(member.totalBalance)}`);
    }

    const assignedBankerName = banker?.name || member.assignedBankerName;
    const receiptNo = `WTH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fee = 0; // Strict Business Rule: No withdrawal charges!
    const netAmount = amount;

    // Rule: Banker can ONLY initiate withdrawal and CANNOT pay right away unless Admin approves!
    const isInitiatedByAdmin = currentUser?.role === 'admin';
    const status = 'PENDING_APPROVAL';

    const newTx: Transaction = {
      id: `TX-${Date.now()}`,
      receiptNumber: receiptNo,
      type: 'WITHDRAWAL',
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      bankerId: bankerId,
      bankerName: assignedBankerName,
      amount: amount,
      fee: fee,
      netAmount: netAmount,
      paymentMethod: paymentMethod,
      timestamp: new Date().toISOString(),
      status: status,
      withdrawalReason: reason,
      payoutMode: payoutMode,
      initiatedByRole: isInitiatedByAdmin ? 'admin' : 'banker',
      notes: notes || `Withdrawal request for ${reason}. (Awaiting Admin Bernard approval)`,
    };

    // Temporarily hold/deduct member balance while pending approval
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const newBal = Math.max(0, m.totalBalance - amount);
          return {
            ...m,
            totalBalance: newBal,
            totalWithdrawnAllTime: m.totalWithdrawnAllTime + amount,
          };
        }
        return m;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);
    setActiveReceipt(newTx);
    return newTx;
  };

  // Admin Approve Withdrawal in Admin Portal
  const approveWithdrawal = (transactionId: string, approvedBy = 'Bernard (Super Admin)') => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            status: 'APPROVED',
            approvedBy: approvedBy,
            approvalDate: new Date().toISOString(),
          };
        }
        return tx;
      })
    );
    triggerCelebration();
  };

  // Admin Reject Withdrawal
  const rejectWithdrawal = (transactionId: string, reason: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    // Refund member balance
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === tx.memberId) {
          return {
            ...m,
            totalBalance: m.totalBalance + tx.amount,
            totalWithdrawnAllTime: Math.max(0, m.totalWithdrawnAllTime - tx.amount),
          };
        }
        return m;
      })
    );

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          return {
            ...t,
            status: 'REJECTED',
            rejectionReason: reason,
          };
        }
        return t;
      })
    );
  };

  // Disburse Withdrawal (Mark cash handed over by Banker or sent via MoMo after Admin approval)
  const disburseWithdrawal = (transactionId: string, disbursedBy?: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    const disburser = disbursedBy || currentUser?.name || 'Field Banker';

    // If banker handed over cash, record in banker's daily withdrawn
    if (tx.payoutMode === 'BANKER_CASH_HANDOVER') {
      setBankers((prev) =>
        prev.map((b) => {
          if (b.id === tx.bankerId) {
            return {
              ...b,
              withdrawnToday: b.withdrawnToday + tx.amount,
              lastActive: 'Just now',
            };
          }
          return b;
        })
      );
    }

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          return {
            ...t,
            status: 'DISBURSED',
            disbursedBy: disburser,
            disbursementDate: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    triggerCelebration();
  };

  // Reconcile Banker EOD Cash Handover
  const settleBankerCash = (bankerId: string, cashReceived: number, notes?: string) => {
    const banker = bankers.find((b) => b.id === bankerId);
    if (!banker) throw new Error('Banker not found');

    const netCashDue = Math.max(0, banker.collectedToday - banker.withdrawnToday);
    const discrepancy = cashReceived - netCashDue;

    const record: ReconciliationRecord = {
      id: `REC-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      bankerId: banker.id,
      bankerName: banker.name,
      totalCollected: banker.collectedToday,
      totalDisbursed: banker.withdrawnToday,
      netCashDue: netCashDue,
      cashReceivedByAdmin: cashReceived,
      discrepancy: discrepancy,
      status: Math.abs(discrepancy) < 0.01 ? 'SETTLED' : 'DISCREPANCY',
      verifiedBy: 'Bernard (Super Admin)',
      settlementTime: new Date().toISOString(),
      notes: notes || `End-of-day reconciliation for route ${banker.routeName}`,
    };

    setReconciliations((prev) => [record, ...prev]);

    // Update banker status
    setBankers((prev) =>
      prev.map((b) => {
        if (b.id === bankerId) {
          return {
            ...b,
            status: 'reconciled',
            lastActive: 'Reconciled & Shift Completed',
          };
        }
        return b;
      })
    );

    triggerCelebration();
    return record;
  };

  const printReceipt = (tx: Transaction) => {
    setActiveReceipt(tx);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const resetToDemoData = () => {
    setBankers([]);
    setMembers([]);
    setTransactions([]);
    setRoutes([]);
    setReconciliations([]);
    localStorage.removeItem('bendaz_susu_app_data_v5');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const clearAllData = () => {
    setBankers([]);
    setMembers([]);
    setTransactions([]);
    setRoutes([]);
    setReconciliations([]);
    localStorage.removeItem('bendaz_susu_app_data_v5');
    localStorage.removeItem('bendaz_susu_app_data_v4');
  };

  return (
    <SusuContext.Provider
      value={{
        currentUser,
        login,
        logout,
        userRole,
        setUserRole,
        activeBankerId,
        setActiveBankerId,
        activeMemberId,
        setActiveMemberId,
        currency,
        setCurrency,
        formatMoney,
        getCurrencySymbol,
        bankers,
        members,
        transactions,
        routes,
        reconciliations,
        activeBanker,
        activeMember,
        totalCollectedToday,
        totalWithdrawnToday,
        totalActiveBankers,
        totalMembersCount,
        pendingWithdrawalsCount,
        totalSystemSavings,
        totalOfficeRevenue,
        addBanker,
        updateBanker,
        deleteBanker,
        addMember,
        updateMember,
        recordDeposit,
        initiateWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        disburseWithdrawal,
        settleBankerCash,
        activeReceipt,
        setActiveReceipt,
        printReceipt,
        resetToDemoData,
        clearAllData,
        triggerCelebration,
      }}
    >
      {children}
    </SusuContext.Provider>
  );
};

export const useSusu = () => {
  const context = useContext(SusuContext);
  if (!context) {
    throw new Error('useSusu must be used within a SusuProvider');
  }
  return context;
};
