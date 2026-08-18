import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Banker,
  Member,
  Route,
  Transaction,
  ReconciliationRecord,
  AuditLogEntry,
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
  DEFAULT_ROUTES,
} from '../data/mockData';
import { firebaseService } from '../lib/firebaseService';
import { supabaseService } from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

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
  auditLogs: AuditLogEntry[];

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
  isCloudConnected: boolean;

  // Actions
  addBanker: (banker: Omit<Banker, 'id' | 'collectedToday' | 'withdrawnToday' | 'assignedMemberCount' | 'status' | 'joinedDate' | 'lastActive'> & { username?: string; password?: string }) => Banker;
  updateBanker: (id: string, updates: Partial<Banker>) => void;
  deleteBanker: (id: string, reassignToBankerId?: string, reason?: string) => void;
  addMember: (member: Omit<Member, 'id' | 'totalBalance' | 'officeFeePaid' | 'totalSavingsAllTime' | 'totalWithdrawnAllTime' | 'currentCyclePaidDays' | 'status' | 'joinedDate' | 'visitedToday' | 'depositedToday' | 'stamps'> & { initialDeposit?: number }) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string, reason?: string) => void;
  
  // Route / Zone Actions
  addRoute: (route: Omit<Route, 'id' | 'totalMembers'> & { id?: string }) => Route;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  clearAllRoutes: () => void;
  
  recordDeposit: (params: {
    memberId: string;
    bankerId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    dayNumber?: number;
  }) => Transaction;

  editTransaction: (
    id: string,
    updates: {
      amount?: number;
      paymentMethod?: PaymentMethod;
      timestamp?: string;
      notes?: string;
      susuDayNumber?: number;
      bankerId?: string;
      isFirstDepositOfficeFee?: boolean;
    }
  ) => boolean;

  deleteTransaction: (id: string, reason?: string) => boolean;

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

  // Audit Logs
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  clearAuditLogs: () => void;

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
    return null;
  });

  const [activeBankerId, setActiveBankerId] = useState<string>('');
  const [activeMemberId, setActiveMemberId] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(
    firebaseService.isAvailable() || isSupabaseConfigured
  );

  const [bankers, setBankers] = useState<Banker[]>(initial.bankers);
  const [members, setMembers] = useState<Member[]>(initial.members);
  const [transactions, setTransactions] = useState<Transaction[]>(initial.transactions);
  const [routes, setRoutes] = useState<Route[]>(initial.routes);
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>(initial.reconciliations);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initial.auditLogs || []);

  // Helper to add audit log entries
  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `AUDIT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    firebaseService.saveAuditLog(newLog);
    supabaseService.insertAuditLog(newLog);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    firebaseService.clearAuditLogs();
  };

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

  // Sync core data to local storage reactively on changes
  useEffect(() => {
    saveStoredData({
      bankers,
      members,
      transactions,
      routes,
      reconciliations,
      auditLogs,
    });
  }, [bankers, members, transactions, routes, reconciliations, auditLogs]);

  // Fetch data from Firestore / Supabase on startup
  const loadCloudData = useCallback(async () => {
    // 1. Try Firebase Firestore first
    if (firebaseService.isAvailable()) {
      try {
        const firestoreData = await firebaseService.fetchAllData();
        if (firestoreData) {
          setIsCloudConnected(true);
          
          if (firestoreData.members && firestoreData.members.length > 0) {
            setMembers((prev) => {
              const cloudIds = new Set(firestoreData.members.map((m) => m.id));
              const localOnly = prev.filter((m) => !cloudIds.has(m.id));
              const merged = [...firestoreData.members, ...localOnly];
              return merged;
            });
          }

          if (firestoreData.bankers && firestoreData.bankers.length > 0) {
            setBankers((prev) => {
              const cloudIds = new Set(firestoreData.bankers.map((b) => b.id));
              const localOnly = prev.filter((b) => !cloudIds.has(b.id));
              return [...firestoreData.bankers, ...localOnly];
            });
          }

          if (firestoreData.routes && firestoreData.routes.length > 0) {
            setRoutes((prev) => {
              const cloudIds = new Set(firestoreData.routes.map((r) => r.id));
              const localOnly = prev.filter((r) => !cloudIds.has(r.id));
              return [...firestoreData.routes, ...localOnly];
            });
          }

          if (firestoreData.transactions && firestoreData.transactions.length > 0) {
            setTransactions((prev) => {
              const cloudIds = new Set(firestoreData.transactions.map((t) => t.id));
              const localOnly = prev.filter((t) => !cloudIds.has(t.id));
              return [...firestoreData.transactions, ...localOnly];
            });
          }

          if (firestoreData.reconciliations && firestoreData.reconciliations.length > 0) {
            setReconciliations((prev) => {
              const cloudIds = new Set(firestoreData.reconciliations.map((rc) => rc.id));
              const localOnly = prev.filter((rc) => !cloudIds.has(rc.id));
              return [...firestoreData.reconciliations, ...localOnly];
            });
          }

          if (firestoreData.auditLogs && firestoreData.auditLogs.length > 0) {
            setAuditLogs((prev) => {
              const cloudIds = new Set(firestoreData.auditLogs.map((a) => a.id));
              const localOnly = prev.filter((a) => !cloudIds.has(a.id));
              return [...firestoreData.auditLogs, ...localOnly];
            });
          }
        }
      } catch (e) {
        console.warn('Firestore initial fetch skipped or failed:', e);
      }
    }

    // 2. Fallback or parallel Supabase
    if (isSupabaseConfigured) {
      try {
        const cloudData = await supabaseService.fetchAllData();
        if (cloudData) {
          setIsCloudConnected(true);
          if (cloudData.bankers && cloudData.bankers.length > 0) {
            setBankers((prev) => {
              const cloudIds = new Set(cloudData.bankers.map((b) => b.id));
              const localOnly = prev.filter((b) => !cloudIds.has(b.id));
              return [...cloudData.bankers, ...localOnly];
            });
          }
          if (cloudData.members && cloudData.members.length > 0) {
            setMembers((prev) => {
              const cloudIds = new Set(cloudData.members.map((m) => m.id));
              const localOnly = prev.filter((m) => !cloudIds.has(m.id));
              return [...cloudData.members, ...localOnly];
            });
          }
        }
      } catch (e) {
        console.warn('Supabase sync skipped:', e);
      }
    }
  }, []);

  useEffect(() => {
    loadCloudData();

    // Subscribe to real-time changes across Firestore and Supabase
    let unsubFirestore: (() => void) | undefined;
    if (firebaseService.isAvailable()) {
      unsubFirestore = firebaseService.subscribeToUpdates({
        onMembers: (remoteMembers) => {
          if (remoteMembers.length > 0) {
            setMembers((prev) => {
              const remoteIds = new Set(remoteMembers.map((m) => m.id));
              const localOnly = prev.filter((m) => !remoteIds.has(m.id));
              return [...remoteMembers, ...localOnly];
            });
          }
        },
        onBankers: (remoteBankers) => {
          if (remoteBankers.length > 0) {
            setBankers((prev) => {
              const remoteIds = new Set(remoteBankers.map((b) => b.id));
              const localOnly = prev.filter((b) => !remoteIds.has(b.id));
              return [...remoteBankers, ...localOnly];
            });
          }
        },
        onTransactions: (remoteTxs) => {
          if (remoteTxs.length > 0) {
            setTransactions(remoteTxs);
          }
        },
        onRoutes: (remoteRoutes) => {
          if (remoteRoutes.length > 0) {
            setRoutes(remoteRoutes);
          }
        },
        onReconciliations: (remoteRecs) => {
          if (remoteRecs.length > 0) {
            setReconciliations(remoteRecs);
          }
        },
        onAuditLogs: (remoteLogs) => {
          if (remoteLogs.length > 0) {
            setAuditLogs(remoteLogs);
          }
        },
      });
    }

    let unsubSupabase: (() => void) | undefined;
    if (isSupabaseConfigured) {
      unsubSupabase = supabaseService.subscribeToChanges(() => {
        loadCloudData();
      });
    }

    return () => {
      if (unsubFirestore) unsubFirestore();
      if (unsubSupabase) unsubSupabase();
    };
  }, [loadCloudData]);

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
          (b.username && b.username.toLowerCase() === trimmedUser) ||
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
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
  const addBanker = (data: Omit<Banker, 'id' | 'collectedToday' | 'withdrawnToday' | 'assignedMemberCount' | 'status' | 'joinedDate' | 'lastActive'> & { username?: string; password?: string }) => {
    const nextNum = bankers.length + 1;
    const newId = `BK-${String(nextNum).padStart(3, '0')}`;
    const generatedUsername = data.username?.trim().toLowerCase() || data.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
    const newBanker: Banker = {
      ...data,
      id: newId,
      username: generatedUsername,
      collectedToday: 0,
      withdrawnToday: 0,
      assignedMemberCount: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just registered',
      password: data.password?.trim() || '1234',
    };
    const updatedBankers = [newBanker, ...bankers];
    setBankers(updatedBankers);
    saveStoredData({
      bankers: updatedBankers,
      members,
      transactions,
      routes,
      reconciliations,
      auditLogs,
    });
    firebaseService.saveBanker(newBanker);
    supabaseService.upsertBanker(newBanker);

    // Audit log
    addAuditLog({
      action: 'BANKER_CREATED',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      targetType: 'banker',
      targetId: newId,
      targetName: data.name,
      description: `New mobile banker account created for ${data.name} (Username: "${generatedUsername}", ID: ${newId}) assigned to route "${data.routeName || 'Assigned Zone'}".`,
      details: {
        bankerId: newId,
        username: generatedUsername,
        name: data.name,
        phone: data.phone,
        route: data.routeName,
        zone: data.zone,
        dailyTarget: data.dailyTarget,
      },
      severity: 'info',
    });

    return newBanker;
  };

  // Update Banker
  const updateBanker = (id: string, updates: Partial<Banker>) => {
    setBankers((prev) => {
      const updatedList = prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, ...updates };
          firebaseService.saveBanker(updated);
          supabaseService.upsertBanker(updated);
          return updated;
        }
        return b;
      });
      saveStoredData({
        bankers: updatedList,
        members,
        transactions,
        routes,
        reconciliations,
        auditLogs,
      });
      return updatedList;
    });
  };

  // Delete Banker
  const deleteBanker = (id: string, reassignToBankerId?: string, reason?: string) => {
    const targetBanker = bankers.find((b) => b.id === id);
    if (!targetBanker) return;

    const replacementBanker = reassignToBankerId ? bankers.find((b) => b.id === reassignToBankerId) : null;

    // 1. Reassign any members previously assigned to this banker
    const reassignedMembers = members.map((m) => {
      if (m.assignedBankerId === id) {
        const updated = {
          ...m,
          assignedBankerId: replacementBanker ? replacementBanker.id : '',
          assignedBankerName: replacementBanker ? replacementBanker.name : 'Unassigned Collector',
        };
        firebaseService.saveMember(updated);
        supabaseService.upsertMember(updated);
        return updated;
      }
      return m;
    });
    setMembers(reassignedMembers);

    // 2. Remove banker from bankers list
    const updatedBankers = bankers
      .filter((b) => b.id !== id)
      .map((b) => {
        if (replacementBanker && b.id === replacementBanker.id) {
          const membersAssignedCount = reassignedMembers.filter((m) => m.assignedBankerId === b.id).length;
          return { ...b, assignedMemberCount: membersAssignedCount };
        }
        return b;
      });
    setBankers(updatedBankers);

    // 3. Persist to Firestore and Supabase
    firebaseService.deleteBanker(id);
    supabaseService.deleteBanker(id);

    // 4. Save to local storage
    saveStoredData({
      bankers: updatedBankers,
      members: reassignedMembers,
      transactions,
      routes,
      reconciliations,
      auditLogs,
    });

    // 5. Add Audit Log
    addAuditLog({
      action: 'BANKER_DELETED',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      targetType: 'banker',
      targetId: id,
      targetName: targetBanker.name,
      description: `Mobile Banker account "${targetBanker.name}" (@${targetBanker.username || id}) was permanently removed.${replacementBanker ? ` Assigned members reassigned to ${replacementBanker.name}.` : ' Assigned members marked as unassigned.'}${reason ? ` Reason: ${reason}` : ''}`,
      details: {
        bankerId: id,
        name: targetBanker.name,
        phone: targetBanker.phone,
        reassignedTo: replacementBanker?.name || 'Unassigned',
        reason: reason || 'Admin deletion',
      },
      severity: 'warning',
    });
  };

  // Add Route / Zone
  const addRoute = (data: Omit<Route, 'id' | 'totalMembers'> & { id?: string }) => {
    const nextNum = routes.length + 1;
    const newId = data.id || `ROUTE-${nextNum.toString().padStart(2, '0')}`;
    const newRoute: Route = {
      id: newId,
      name: data.name,
      zone: data.zone || '',
      description: data.description || '',
      bankerId: data.bankerId || '',
      bankerName: data.bankerName || 'Unassigned',
      totalMembers: 0,
      dailyEstimatedTarget: Number(data.dailyEstimatedTarget) || 0,
      stopsCount: Number(data.stopsCount) || 0,
    };

    setRoutes((prev) => {
      const updated = [...prev, newRoute];
      saveStoredData({
        bankers,
        members,
        transactions,
        routes: updated,
        reconciliations,
        auditLogs,
      });
      return updated;
    });

    firebaseService.saveRoute(newRoute);
    supabaseService.upsertRoute(newRoute);

    addAuditLog({
      action: 'ROUTE_CREATED',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      targetType: 'route',
      targetId: newId,
      targetName: newRoute.name,
      description: `Market route / zone "${newRoute.name}" created (Zone: ${newRoute.zone || 'General'}).`,
      severity: 'info',
    });

    return newRoute;
  };

  // Update Route / Zone
  const updateRoute = (id: string, updates: Partial<Route>) => {
    setRoutes((prev) => {
      const updatedList = prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          firebaseService.saveRoute(updated);
          supabaseService.upsertRoute(updated);
          return updated;
        }
        return r;
      });
      saveStoredData({
        bankers,
        members,
        transactions,
        routes: updatedList,
        reconciliations,
        auditLogs,
      });
      return updatedList;
    });
  };

  // Delete Route / Zone
  const deleteRoute = (id: string) => {
    const targetRoute = routes.find((r) => r.id === id);
    firebaseService.deleteRoute(id);
    supabaseService.deleteRoute(id);

    setRoutes((prev) => {
      const updatedList = prev.filter((r) => r.id !== id);
      saveStoredData({
        bankers,
        members,
        transactions,
        routes: updatedList,
        reconciliations,
        auditLogs,
      });
      return updatedList;
    });

    // Also update any bankers or members that were assigned to this route
    setBankers((prev) =>
      prev.map((b) => {
        if (b.routeId === id) {
          const updated = { ...b, routeId: '', routeName: 'Unassigned Route' };
          firebaseService.saveBanker(updated);
          supabaseService.upsertBanker(updated);
          return updated;
        }
        return b;
      })
    );

    setMembers((prev) =>
      prev.map((m) => {
        if (m.routeId === id) {
          const updated = { ...m, routeId: '', routeName: 'General Collection' };
          firebaseService.saveMember(updated);
          supabaseService.upsertMember(updated);
          return updated;
        }
        return m;
      })
    );

    addAuditLog({
      action: 'ROUTE_DELETED',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      targetType: 'route',
      targetId: id,
      targetName: targetRoute?.name || id,
      description: `Market zone / route "${targetRoute?.name || id}" was deleted from the system.`,
      severity: 'warning',
    });
  };

  // Clear All Routes / Zones
  const clearAllRoutes = () => {
    firebaseService.clearAllRoutes();
    supabaseService.clearAllRoutes();
    setRoutes([]);
    saveStoredData({
      bankers,
      members,
      transactions,
      routes: [],
      reconciliations,
      auditLogs,
    });
    addAuditLog({
      action: 'ROUTES_CLEARED',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      targetType: 'route',
      targetId: 'ALL',
      description: `All market zones / routes were cleared.`,
      severity: 'warning',
    });
  };

  // Add Member / Create Account
  const addMember = (data: Omit<Member, 'id' | 'totalBalance' | 'officeFeePaid' | 'totalSavingsAllTime' | 'totalWithdrawnAllTime' | 'currentCyclePaidDays' | 'status' | 'joinedDate' | 'visitedToday' | 'depositedToday' | 'stamps'> & { initialDeposit?: number; accountNumber?: string }) => {
    const nextNum = 1000 + members.length + 1;
    const newId = `MB-${nextNum}`;
    const autoAccountNumber = data.accountNumber || `SSU-${Math.floor(100000 + Math.random() * 900000)}`;
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
      accountNumber: autoAccountNumber,
      name: data.name,
      phone: data.phone,
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
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

    let updatedBankers = bankers;
    if (data.assignedBankerId) {
      updatedBankers = bankers.map((b) => {
        if (b.id === data.assignedBankerId) {
          const updatedB = {
            ...b,
            assignedMemberCount: (b.assignedMemberCount || 0) + 1,
            collectedToday: initialDeposit > 0 ? b.collectedToday + initialDeposit : b.collectedToday,
          };
          firebaseService.saveBanker(updatedB);
          supabaseService.upsertBanker(updatedB);
          return updatedB;
        }
        return b;
      });
      setBankers(updatedBankers);
    }

    let tx: Transaction | null = null;
    let updatedTransactions = transactions;
    if (initialDeposit > 0) {
      const receiptNo = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      tx = {
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
      updatedTransactions = [tx, ...transactions];
      setTransactions(updatedTransactions);
      firebaseService.saveTransaction(tx);
      supabaseService.insertTransaction(tx);
    }

    const updatedMembers = [newMember, ...members];
    setMembers(updatedMembers);
    firebaseService.saveMember(newMember);
    supabaseService.upsertMember(newMember);

    // Save immediately and synchronously to local storage
    saveStoredData({
      bankers: updatedBankers,
      members: updatedMembers,
      transactions: updatedTransactions,
      routes,
      reconciliations,
      auditLogs,
    });

    // Audit log member creation
    addAuditLog({
      action: 'MEMBER_CREATED',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      targetType: 'member',
      targetId: newId,
      targetName: data.name,
      amount: initialDeposit,
      description: `Account created for "${data.name}" (Account #${autoAccountNumber}) with daily pledge of ${formatMoney(data.dailyTarget)} on route "${data.routeName || 'Default Route'}"${initialDeposit > 0 ? ` (Initial Day 1 deposit: ${formatMoney(initialDeposit)})` : ''}.`,
      details: {
        memberId: newId,
        accountNumber: autoAccountNumber,
        phone: data.phone,
        route: data.routeName,
        locationStall: data.locationStall,
        dailyTarget: data.dailyTarget,
        assignedBanker: data.assignedBankerName,
        initialDeposit: initialDeposit,
      },
      severity: 'info',
    });

    return newMember;
  };

  // Update Member Account
  const updateMember = (id: string, updates: Partial<Member>) => {
    const existingMember = members.find((m) => m.id === id);
    if (!existingMember) return;

    let updatedBankers = bankers;

    // Handle change of assigned banker if assignedBankerId is updated
    if (updates.assignedBankerId && updates.assignedBankerId !== existingMember.assignedBankerId) {
      const oldBankerId = existingMember.assignedBankerId;
      const newBankerId = updates.assignedBankerId;
      const newBanker = bankers.find((b) => b.id === newBankerId);
      if (newBanker && !updates.assignedBankerName) {
        updates.assignedBankerName = newBanker.name;
      }

      updatedBankers = bankers.map((b) => {
        if (b.id === oldBankerId) {
          const updatedB = {
            ...b,
            assignedMemberCount: Math.max(0, (b.assignedMemberCount || 0) - 1),
          };
          firebaseService.saveBanker(updatedB);
          supabaseService.upsertBanker(updatedB);
          return updatedB;
        }
        if (b.id === newBankerId) {
          const updatedB = {
            ...b,
            assignedMemberCount: (b.assignedMemberCount || 0) + 1,
          };
          firebaseService.saveBanker(updatedB);
          supabaseService.upsertBanker(updatedB);
          return updatedB;
        }
        return b;
      });
      setBankers(updatedBankers);
    }

    // Handle route name sync if routeId changes
    if (updates.routeId && updates.routeId !== existingMember.routeId) {
      const route = routes.find((r) => r.id === updates.routeId);
      if (route && !updates.routeName) {
        updates.routeName = route.name;
      }
    }

    const updatedMember = { ...existingMember, ...updates };

    setMembers((prev) => {
      const updatedList = prev.map((m) => (m.id === id ? updatedMember : m));
      saveStoredData({
        bankers: updatedBankers,
        members: updatedList,
        transactions,
        routes,
        reconciliations,
        auditLogs,
      });
      return updatedList;
    });

    firebaseService.saveMember(updatedMember);
    supabaseService.upsertMember(updatedMember);

    // Audit log
    addAuditLog({
      action: 'MEMBER_UPDATED',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      targetType: 'member',
      targetId: id,
      targetName: updatedMember.name,
      description: `Account details updated for saver "${updatedMember.name}" (Account #${updatedMember.accountNumber || id}).`,
      details: updates,
      severity: 'info',
    });
  };

  // Delete Member Account
  const deleteMember = (id: string, reason?: string) => {
    const targetMember = members.find((m) => m.id === id);
    if (!targetMember) return;

    // 1. If assigned to a banker, decrement that banker's assignedMemberCount
    let updatedBankers = bankers;
    if (targetMember.assignedBankerId) {
      updatedBankers = bankers.map((b) => {
        if (b.id === targetMember.assignedBankerId) {
          const updatedB = {
            ...b,
            assignedMemberCount: Math.max(0, (b.assignedMemberCount || 0) - 1),
          };
          firebaseService.saveBanker(updatedB);
          supabaseService.upsertBanker(updatedB);
          return updatedB;
        }
        return b;
      });
      setBankers(updatedBankers);
    }

    // 2. Remove member from members list
    const updatedMembers = members.filter((m) => m.id !== id);
    setMembers(updatedMembers);

    // 3. Persist deletion to Firestore and Supabase
    firebaseService.deleteMember(id);
    supabaseService.deleteMember(id);

    // 4. Save to local storage
    saveStoredData({
      bankers: updatedBankers,
      members: updatedMembers,
      transactions,
      routes,
      reconciliations,
      auditLogs,
    });

    // 5. Add Audit Log
    addAuditLog({
      action: 'MEMBER_DELETED',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      targetType: 'member',
      targetId: id,
      targetName: targetMember.name,
      amount: targetMember.totalBalance,
      description: `Saver account "${targetMember.name}" (Account #${targetMember.accountNumber || id}) with savings balance of ${formatMoney(targetMember.totalBalance)} was permanently deleted from the system.${reason ? ` Reason: ${reason}` : ''}`,
      details: {
        memberId: id,
        accountNumber: targetMember.accountNumber,
        name: targetMember.name,
        phone: targetMember.phone,
        totalBalance: targetMember.totalBalance,
        totalSavingsAllTime: targetMember.totalSavingsAllTime,
        assignedBanker: targetMember.assignedBankerName,
        reason: reason || 'Admin deletion',
      },
      severity: 'warning',
    });
  };

  // Record Member Deposit
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

    const isFirstDeposit = member.currentCyclePaidDays === 0 && member.officeFeePaid === 0 && targetDay === 1;

    let balanceAddition = amount;
    let officeAddition = 0;

    if (isFirstDeposit) {
      officeAddition = amount;
      balanceAddition = 0;
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

          const updatedM: Member = {
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
          firebaseService.saveMember(updatedM);
          supabaseService.upsertMember(updatedM);
          return updatedM;
        }
        return m;
      })
    );

    // Update Banker collection metrics
    setBankers((prev) =>
      prev.map((b) => {
        if (b.id === bankerId) {
          const updatedB: Banker = {
            ...b,
            collectedToday: b.collectedToday + amount,
            status: 'on_route',
            lastActive: 'Just now',
          };
          firebaseService.saveBanker(updatedB);
          supabaseService.upsertBanker(updatedB);
          return updatedB;
        }
        return b;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);
    firebaseService.saveTransaction(newTx);
    supabaseService.insertTransaction(newTx);
    setActiveReceipt(newTx);
    triggerCelebration();

    // Audit log deposit
    addAuditLog({
      action: 'DEPOSIT_RECORDED',
      actorName: currentUser?.name || assignedBankerName || 'Field Banker',
      actorRole: currentUser?.role || 'banker',
      targetType: 'transaction',
      targetId: newTx.id,
      targetName: member.name,
      amount: amount,
      description: `Deposit of ${formatMoney(amount)} recorded for ${member.name} (${paymentMethod}) by ${assignedBankerName}${isFirstDeposit ? ' [Day 1 Office Fee Retained]' : ` [Day ${targetDay} contribution]`}.`,
      details: {
        receiptNumber: receiptNo,
        memberId: member.id,
        memberName: member.name,
        bankerId: bankerId,
        bankerName: assignedBankerName,
        amount: amount,
        paymentMethod: paymentMethod,
        dayNumber: targetDay,
        isFirstDepositOfficeFee: isFirstDeposit,
      },
      severity: 'success',
    });

    return newTx;
  };

  // Edit Transaction (Admin only - modifies deposit/withdrawal amount, method, timestamp, notes, or day)
  const editTransaction = (
    id: string,
    updates: {
      amount?: number;
      paymentMethod?: PaymentMethod;
      timestamp?: string;
      notes?: string;
      susuDayNumber?: number;
      bankerId?: string;
      isFirstDepositOfficeFee?: boolean;
    }
  ): boolean => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return false;

    const oldAmount = tx.amount;
    const newAmount = updates.amount !== undefined ? Number(updates.amount) : oldAmount;
    const amountDiff = newAmount - oldAmount;

    let updatedBankers = bankers;
    let updatedMembers = members;

    // 1. Adjust Member financial state
    if (tx.memberId) {
      updatedMembers = members.map((m) => {
        if (m.id === tx.memberId) {
          let updatedTotalBalance = m.totalBalance;
          let updatedOfficeFee = m.officeFeePaid;
          let updatedTotalSavings = m.totalSavingsAllTime;
          let updatedWithdrawn = m.totalWithdrawnAllTime;

          if (tx.type === 'DEPOSIT') {
            const isOffice = updates.isFirstDepositOfficeFee !== undefined ? updates.isFirstDepositOfficeFee : tx.isFirstDepositOfficeFee;
            if (isOffice) {
              updatedOfficeFee = Math.max(0, m.officeFeePaid + amountDiff);
            } else {
              updatedTotalBalance = Math.max(0, m.totalBalance + amountDiff);
            }
            updatedTotalSavings = Math.max(0, m.totalSavingsAllTime + amountDiff);
          } else if (tx.type === 'WITHDRAWAL') {
            if (tx.status === 'APPROVED' || tx.status === 'DISBURSED' || tx.status === 'COMPLETED') {
              updatedTotalBalance = Math.max(0, m.totalBalance - amountDiff);
              updatedWithdrawn = Math.max(0, m.totalWithdrawnAllTime + amountDiff);
            }
          }

          // Update matching stamp in member's passbook card
          const targetDayNum = updates.susuDayNumber !== undefined ? updates.susuDayNumber : tx.susuDayNumber;
          const updatedStamps = m.stamps.map((stamp) => {
            if (
              (stamp.receiptId && stamp.receiptId === tx.receiptNumber) ||
              (targetDayNum && stamp.day === targetDayNum)
            ) {
              return {
                ...stamp,
                amount: newAmount,
                date: updates.timestamp ? updates.timestamp.split('T')[0] : stamp.date,
                isOfficeFee: updates.isFirstDepositOfficeFee !== undefined ? updates.isFirstDepositOfficeFee : stamp.isOfficeFee,
              };
            }
            return stamp;
          });

          const updatedM: Member = {
            ...m,
            totalBalance: updatedTotalBalance,
            officeFeePaid: updatedOfficeFee,
            totalSavingsAllTime: updatedTotalSavings,
            totalWithdrawnAllTime: updatedWithdrawn,
            stamps: updatedStamps,
          };
          firebaseService.saveMember(updatedM);
          supabaseService.upsertMember(updatedM);
          return updatedM;
        }
        return m;
      });
      setMembers(updatedMembers);
    }

    // 2. Adjust Banker collection metrics if today
    if (tx.bankerId && amountDiff !== 0) {
      updatedBankers = bankers.map((b) => {
        if (b.id === tx.bankerId) {
          const updatedB: Banker = {
            ...b,
            collectedToday: tx.type === 'DEPOSIT' ? Math.max(0, b.collectedToday + amountDiff) : b.collectedToday,
            withdrawnToday: tx.type === 'WITHDRAWAL' ? Math.max(0, b.withdrawnToday + amountDiff) : b.withdrawnToday,
          };
          firebaseService.saveBanker(updatedB);
          supabaseService.upsertBanker(updatedB);
          return updatedB;
        }
        return b;
      });
      setBankers(updatedBankers);
    }

    // 3. Update Transaction Record
    const updatedTx: Transaction = {
      ...tx,
      amount: newAmount,
      netAmount: newAmount,
      paymentMethod: updates.paymentMethod || tx.paymentMethod,
      timestamp: updates.timestamp || tx.timestamp,
      notes: updates.notes || tx.notes,
      susuDayNumber: updates.susuDayNumber !== undefined ? updates.susuDayNumber : tx.susuDayNumber,
      isFirstDepositOfficeFee: updates.isFirstDepositOfficeFee !== undefined ? updates.isFirstDepositOfficeFee : tx.isFirstDepositOfficeFee,
      bankerId: updates.bankerId || tx.bankerId,
    };

    const updatedTransactions = transactions.map((t) => (t.id === id ? updatedTx : t));
    setTransactions(updatedTransactions);
    firebaseService.saveTransaction(updatedTx);
    supabaseService.insertTransaction(updatedTx);

    saveStoredData({
      bankers: updatedBankers,
      members: updatedMembers,
      transactions: updatedTransactions,
      routes,
      reconciliations,
      auditLogs,
    });

    addAuditLog({
      action: 'TRANSACTION_EDITED',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      targetType: 'transaction',
      targetId: tx.id,
      targetName: tx.memberName,
      amount: newAmount,
      description: `Transaction ${tx.receiptNumber} (${tx.type}) modified. ${amountDiff !== 0 ? `Amount adjusted from ${formatMoney(oldAmount)} to ${formatMoney(newAmount)}.` : 'Details updated.'}`,
      details: {
        transactionId: tx.id,
        receiptNumber: tx.receiptNumber,
        oldAmount,
        newAmount,
        updates,
      },
      severity: 'info',
    });

    return true;
  };

  // Delete Transaction / Remove Double Entry (Admin only - restores balances, stamps, & logs audit trail)
  const deleteTransaction = (id: string, reason?: string): boolean => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return false;

    let updatedBankers = bankers;
    let updatedMembers = members;

    // 1. Revert Member balances, stamps and cycle count
    if (tx.memberId) {
      updatedMembers = members.map((m) => {
        if (m.id === tx.memberId) {
          let updatedTotalBalance = m.totalBalance;
          let updatedOfficeFee = m.officeFeePaid;
          let updatedTotalSavings = m.totalSavingsAllTime;
          let updatedWithdrawn = m.totalWithdrawnAllTime;
          let updatedPaidDays = m.currentCyclePaidDays;

          if (tx.type === 'DEPOSIT') {
            if (tx.isFirstDepositOfficeFee) {
              updatedOfficeFee = Math.max(0, m.officeFeePaid - tx.amount);
            } else {
              updatedTotalBalance = Math.max(0, m.totalBalance - tx.netAmount);
            }
            updatedTotalSavings = Math.max(0, m.totalSavingsAllTime - tx.amount);
            updatedPaidDays = Math.max(0, m.currentCyclePaidDays - 1);
          } else if (tx.type === 'WITHDRAWAL') {
            if (tx.status === 'APPROVED' || tx.status === 'DISBURSED' || tx.status === 'COMPLETED') {
              updatedTotalBalance = m.totalBalance + tx.amount;
              updatedWithdrawn = Math.max(0, m.totalWithdrawnAllTime - tx.amount);
            }
          }

          // Clear stamp if matching receipt number or day number
          const targetDayNum = tx.susuDayNumber;
          const updatedStamps = m.stamps.map((stamp) => {
            if (
              (stamp.receiptId && stamp.receiptId === tx.receiptNumber) ||
              (targetDayNum && stamp.day === targetDayNum)
            ) {
              return {
                day: stamp.day,
                verified: false,
                amount: undefined,
                date: undefined,
                receiptId: undefined,
                bankerName: undefined,
                isOfficeFee: undefined,
              };
            }
            return stamp;
          });

          // Check if status needs to revert from cycle_ready
          const newStatus = updatedPaidDays < m.susuCycleDays && m.status === 'cycle_ready' ? 'active' : m.status;

          const updatedM: Member = {
            ...m,
            totalBalance: updatedTotalBalance,
            officeFeePaid: updatedOfficeFee,
            totalSavingsAllTime: updatedTotalSavings,
            totalWithdrawnAllTime: updatedWithdrawn,
            currentCyclePaidDays: updatedPaidDays,
            status: newStatus,
            stamps: updatedStamps,
          };
          firebaseService.saveMember(updatedM);
          supabaseService.upsertMember(updatedM);
          return updatedM;
        }
        return m;
      });
      setMembers(updatedMembers);
    }

    // 2. Revert Banker daily totals
    if (tx.bankerId) {
      updatedBankers = bankers.map((b) => {
        if (b.id === tx.bankerId) {
          const updatedB: Banker = {
            ...b,
            collectedToday: tx.type === 'DEPOSIT' ? Math.max(0, b.collectedToday - tx.amount) : b.collectedToday,
            withdrawnToday: tx.type === 'WITHDRAWAL' ? Math.max(0, b.withdrawnToday - tx.amount) : b.withdrawnToday,
          };
          firebaseService.saveBanker(updatedB);
          supabaseService.upsertBanker(updatedB);
          return updatedB;
        }
        return b;
      });
      setBankers(updatedBankers);
    }

    // 3. Remove transaction from ledger
    const updatedTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTransactions);
    firebaseService.deleteTransaction(id);
    supabaseService.deleteTransaction(id);

    saveStoredData({
      bankers: updatedBankers,
      members: updatedMembers,
      transactions: updatedTransactions,
      routes,
      reconciliations,
      auditLogs,
    });

    addAuditLog({
      action: 'TRANSACTION_DELETED',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      targetType: 'transaction',
      targetId: tx.id,
      targetName: tx.memberName,
      amount: tx.amount,
      description: `Double entry / transaction ${tx.receiptNumber} (${tx.type} of ${formatMoney(tx.amount)}) was deleted and reversed.${reason ? ` Reason: ${reason}` : ''}`,
      details: {
        transactionId: tx.id,
        receiptNumber: tx.receiptNumber,
        memberName: tx.memberName,
        amount: tx.amount,
        type: tx.type,
        reason: reason || 'Double deposit entry removed by Admin',
      },
      severity: 'warning',
    });

    return true;
  };

  // Initiate Member Withdrawal
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
    const fee = 0;
    const netAmount = amount;

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

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const newBal = Math.max(0, m.totalBalance - amount);
          const updatedM: Member = {
            ...m,
            totalBalance: newBal,
            totalWithdrawnAllTime: m.totalWithdrawnAllTime + amount,
          };
          firebaseService.saveMember(updatedM);
          supabaseService.upsertMember(updatedM);
          return updatedM;
        }
        return m;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);
    firebaseService.saveTransaction(newTx);
    supabaseService.insertTransaction(newTx);
    setActiveReceipt(newTx);

    // Audit log withdrawal request
    addAuditLog({
      action: 'WITHDRAWAL_REQUESTED',
      actorName: currentUser?.name || assignedBankerName || 'Field Banker',
      actorRole: isInitiatedByAdmin ? 'admin' : 'banker',
      targetType: 'transaction',
      targetId: newTx.id,
      targetName: member.name,
      amount: amount,
      description: `Withdrawal request of ${formatMoney(amount)} initiated for ${member.name} (Reason: "${reason}", Payout: ${payoutMode.replace(/_/g, ' ')}). Awaiting admin approval.`,
      details: {
        receiptNumber: receiptNo,
        memberId: member.id,
        memberName: member.name,
        amount: amount,
        reason: reason,
        payoutMode: payoutMode,
        paymentMethod: paymentMethod,
      },
      severity: 'warning',
    });

    return newTx;
  };

  // Admin Approve Withdrawal
  const approveWithdrawal = (transactionId: string, approvedBy = 'Bernard (Super Admin)') => {
    const tx = transactions.find((t) => t.id === transactionId);

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const updatedTx: Transaction = {
            ...t,
            status: 'APPROVED',
            approvedBy: approvedBy,
            approvalDate: new Date().toISOString(),
          };
          firebaseService.saveTransaction(updatedTx);
          supabaseService.insertTransaction(updatedTx);
          return updatedTx;
        }
        return t;
      })
    );
    triggerCelebration();

    addAuditLog({
      action: 'WITHDRAWAL_APPROVED',
      actorName: approvedBy,
      actorRole: 'admin',
      targetType: 'transaction',
      targetId: transactionId,
      targetName: tx?.memberName || 'Member',
      amount: tx?.amount,
      description: `Withdrawal request of ${formatMoney(tx?.amount || 0)} for ${tx?.memberName || 'Member'} approved by ${approvedBy}. Ready for cash/MoMo disbursement.`,
      details: {
        transactionId,
        receiptNumber: tx?.receiptNumber,
        memberName: tx?.memberName,
        amount: tx?.amount,
        payoutMode: tx?.payoutMode,
      },
      severity: 'success',
    });
  };

  // Admin Reject Withdrawal
  const rejectWithdrawal = (transactionId: string, reason: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === tx.memberId) {
          const updatedM: Member = {
            ...m,
            totalBalance: m.totalBalance + tx.amount,
            totalWithdrawnAllTime: Math.max(0, m.totalWithdrawnAllTime - tx.amount),
          };
          firebaseService.saveMember(updatedM);
          supabaseService.upsertMember(updatedM);
          return updatedM;
        }
        return m;
      })
    );

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const updatedTx: Transaction = {
            ...t,
            status: 'REJECTED',
            rejectionReason: reason,
          };
          firebaseService.saveTransaction(updatedTx);
          supabaseService.insertTransaction(updatedTx);
          return updatedTx;
        }
        return t;
      })
    );

    addAuditLog({
      action: 'WITHDRAWAL_REJECTED',
      actorName: currentUser?.name || 'Bernard (Super Admin)',
      actorRole: 'admin',
      targetType: 'transaction',
      targetId: transactionId,
      targetName: tx.memberName,
      amount: tx.amount,
      description: `Withdrawal request of ${formatMoney(tx.amount)} for ${tx.memberName} rejected. Reason: "${reason}". Savings balance refunded.`,
      details: {
        transactionId,
        receiptNumber: tx.receiptNumber,
        memberName: tx.memberName,
        amount: tx.amount,
        reason: reason,
      },
      severity: 'alert',
    });
  };

  // Disburse Withdrawal
  const disburseWithdrawal = (transactionId: string, disbursedBy?: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    const disburser = disbursedBy || currentUser?.name || 'Field Banker';

    if (tx.payoutMode === 'BANKER_CASH_HANDOVER') {
      setBankers((prev) =>
        prev.map((b) => {
          if (b.id === tx.bankerId) {
            const updatedB: Banker = {
              ...b,
              withdrawnToday: b.withdrawnToday + tx.amount,
              lastActive: 'Just now',
            };
            firebaseService.saveBanker(updatedB);
            supabaseService.upsertBanker(updatedB);
            return updatedB;
          }
          return b;
        })
      );
    }

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const updatedTx: Transaction = {
            ...t,
            status: 'DISBURSED',
            disbursedBy: disburser,
            disbursementDate: new Date().toISOString(),
          };
          firebaseService.saveTransaction(updatedTx);
          supabaseService.insertTransaction(updatedTx);
          return updatedTx;
        }
        return t;
      })
    );

    triggerCelebration();

    addAuditLog({
      action: 'WITHDRAWAL_DISBURSED',
      actorName: disburser,
      actorRole: currentUser?.role || 'admin',
      targetType: 'transaction',
      targetId: transactionId,
      targetName: tx.memberName,
      amount: tx.amount,
      description: `Withdrawal disbursement of ${formatMoney(tx.amount)} completed for ${tx.memberName} via ${tx.payoutMode?.replace(/_/g, ' ') || 'Cash'}.`,
      details: {
        transactionId,
        receiptNumber: tx.receiptNumber,
        memberName: tx.memberName,
        amount: tx.amount,
        disbursedBy: disburser,
        payoutMode: tx.payoutMode,
      },
      severity: 'success',
    });
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
    firebaseService.saveReconciliation(record);
    supabaseService.insertReconciliation(record);

    setBankers((prev) =>
      prev.map((b) => {
        if (b.id === bankerId) {
          const updatedB: Banker = {
            ...b,
            status: 'reconciled',
            lastActive: 'Reconciled & Shift Completed',
          };
          firebaseService.saveBanker(updatedB);
          supabaseService.upsertBanker(updatedB);
          return updatedB;
        }
        return b;
      })
    );

    triggerCelebration();

    addAuditLog({
      action: 'RECONCILIATION_SETTLED',
      actorName: 'Bernard (Super Admin)',
      actorRole: 'admin',
      targetType: 'reconciliation',
      targetId: record.id,
      targetName: banker.name,
      amount: cashReceived,
      description: `End-of-day cash reconciliation completed for ${banker.name}. Collected: ${formatMoney(banker.collectedToday)}, Cash Received: ${formatMoney(cashReceived)}, Discrepancy: ${formatMoney(discrepancy)} (${record.status}).`,
      details: {
        reconciliationId: record.id,
        bankerId: banker.id,
        bankerName: banker.name,
        collected: banker.collectedToday,
        withdrawn: banker.withdrawnToday,
        cashReceived: cashReceived,
        discrepancy: discrepancy,
        status: record.status,
      },
      severity: Math.abs(discrepancy) < 0.01 ? 'success' : 'alert',
    });

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
    setAuditLogs([]);
    firebaseService.clearAllRoutes();
    supabaseService.clearAllRoutes();
    localStorage.removeItem('bendaz_susu_app_data_v6');
    localStorage.removeItem('bendaz_susu_app_data_v5');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const clearAllData = () => {
    setBankers([]);
    setMembers([]);
    setTransactions([]);
    setRoutes([]);
    setReconciliations([]);
    setAuditLogs([]);
    firebaseService.clearAllRoutes();
    supabaseService.clearAllRoutes();
    localStorage.removeItem('bendaz_susu_app_data_v6');
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
        auditLogs,
        activeBanker,
        activeMember,
        totalCollectedToday,
        totalWithdrawnToday,
        totalActiveBankers,
        totalMembersCount,
        pendingWithdrawalsCount,
        totalSystemSavings,
        totalOfficeRevenue,
        isCloudConnected,
        addBanker,
        updateBanker,
        deleteBanker,
        addMember,
        updateMember,
        deleteMember,
        addRoute,
        updateRoute,
        deleteRoute,
        clearAllRoutes,
        recordDeposit,
        editTransaction,
        deleteTransaction,
        initiateWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        disburseWithdrawal,
        settleBankerCash,
        addAuditLog,
        clearAuditLogs,
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
