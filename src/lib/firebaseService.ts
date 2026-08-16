import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  Banker,
  Member,
  Transaction,
  Route,
  ReconciliationRecord,
  AuditLogEntry,
} from '../types';

// Helper to remove undefined properties which Firestore rejects
function sanitizeData<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = sanitizeData(value);
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map((item) =>
        item !== null && typeof item === 'object' ? sanitizeData(item) : item
      );
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

export interface FirestoreDataState {
  bankers: Banker[];
  members: Member[];
  transactions: Transaction[];
  routes: Route[];
  reconciliations: ReconciliationRecord[];
  auditLogs: AuditLogEntry[];
}

export const firebaseService = {
  isAvailable(): boolean {
    return isFirebaseConfigured && !!db;
  },

  async fetchAllData(): Promise<FirestoreDataState | null> {
    if (!this.isAvailable()) return null;
    try {
      const [
        bankersSnap,
        membersSnap,
        transactionsSnap,
        routesSnap,
        reconciliationsSnap,
        auditLogsSnap,
      ] = await Promise.all([
        getDocs(collection(db, 'bankers')),
        getDocs(collection(db, 'members')),
        getDocs(collection(db, 'transactions')),
        getDocs(collection(db, 'routes')),
        getDocs(collection(db, 'reconciliations')),
        getDocs(collection(db, 'auditLogs')),
      ]);

      const bankers: Banker[] = [];
      bankersSnap.forEach((d) => bankers.push(d.data() as Banker));

      const members: Member[] = [];
      membersSnap.forEach((d) => members.push(d.data() as Member));

      const transactions: Transaction[] = [];
      transactionsSnap.forEach((d) => transactions.push(d.data() as Transaction));
      transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const routes: Route[] = [];
      routesSnap.forEach((d) => routes.push(d.data() as Route));

      const reconciliations: ReconciliationRecord[] = [];
      reconciliationsSnap.forEach((d) => reconciliations.push(d.data() as ReconciliationRecord));

      const auditLogs: AuditLogEntry[] = [];
      auditLogsSnap.forEach((d) => auditLogs.push(d.data() as AuditLogEntry));
      auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        bankers,
        members,
        transactions,
        routes,
        reconciliations,
        auditLogs,
      };
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
      return null;
    }
  },

  // Save or update member
  async saveMember(member: Member): Promise<boolean> {
    if (!this.isAvailable() || !member?.id) return false;
    try {
      const cleanMember = sanitizeData(member);
      await setDoc(doc(db, 'members', member.id), cleanMember, { merge: true });
      return true;
    } catch (error) {
      console.error(`Error saving member ${member.id} to Firestore:`, error);
      return false;
    }
  },

  // Delete member
  async deleteMember(memberId: string): Promise<boolean> {
    if (!this.isAvailable() || !memberId) return false;
    try {
      await deleteDoc(doc(db, 'members', memberId));
      return true;
    } catch (error) {
      console.error(`Error deleting member ${memberId} from Firestore:`, error);
      return false;
    }
  },

  // Save or update banker
  async saveBanker(banker: Banker): Promise<boolean> {
    if (!this.isAvailable() || !banker?.id) return false;
    try {
      const cleanBanker = sanitizeData(banker);
      await setDoc(doc(db, 'bankers', banker.id), cleanBanker, { merge: true });
      return true;
    } catch (error) {
      console.error(`Error saving banker ${banker.id} to Firestore:`, error);
      return false;
    }
  },

  // Delete banker
  async deleteBanker(bankerId: string): Promise<boolean> {
    if (!this.isAvailable() || !bankerId) return false;
    try {
      await deleteDoc(doc(db, 'bankers', bankerId));
      return true;
    } catch (error) {
      console.error(`Error deleting banker ${bankerId} from Firestore:`, error);
      return false;
    }
  },

  // Save or update route
  async saveRoute(route: Route): Promise<boolean> {
    if (!this.isAvailable() || !route?.id) return false;
    try {
      const cleanRoute = sanitizeData(route);
      await setDoc(doc(db, 'routes', route.id), cleanRoute, { merge: true });
      return true;
    } catch (error) {
      console.error(`Error saving route ${route.id} to Firestore:`, error);
      return false;
    }
  },

  // Save transaction
  async saveTransaction(transaction: Transaction): Promise<boolean> {
    if (!this.isAvailable() || !transaction?.id) return false;
    try {
      const cleanTx = sanitizeData(transaction);
      await setDoc(doc(db, 'transactions', transaction.id), cleanTx, { merge: true });
      return true;
    } catch (error) {
      console.error(`Error saving transaction ${transaction.id} to Firestore:`, error);
      return false;
    }
  },

  // Save reconciliation
  async saveReconciliation(rec: ReconciliationRecord): Promise<boolean> {
    if (!this.isAvailable() || !rec?.id) return false;
    try {
      const cleanRec = sanitizeData(rec);
      await setDoc(doc(db, 'reconciliations', rec.id), cleanRec, { merge: true });
      return true;
    } catch (error) {
      console.error(`Error saving reconciliation ${rec.id} to Firestore:`, error);
      return false;
    }
  },

  // Save audit log
  async saveAuditLog(log: AuditLogEntry): Promise<boolean> {
    if (!this.isAvailable() || !log?.id) return false;
    try {
      const cleanLog = sanitizeData(log);
      await setDoc(doc(db, 'auditLogs', log.id), cleanLog, { merge: true });
      return true;
    } catch (error) {
      console.error(`Error saving audit log ${log.id} to Firestore:`, error);
      return false;
    }
  },

  // Clear audit logs
  async clearAuditLogs(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      const snap = await getDocs(collection(db, 'auditLogs'));
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error clearing audit logs in Firestore:', error);
      return false;
    }
  },

  // Real-time listener across collections
  subscribeToUpdates(callbacks: {
    onMembers?: (members: Member[]) => void;
    onBankers?: (bankers: Banker[]) => void;
    onTransactions?: (transactions: Transaction[]) => void;
    onRoutes?: (routes: Route[]) => void;
    onReconciliations?: (recs: ReconciliationRecord[]) => void;
    onAuditLogs?: (logs: AuditLogEntry[]) => void;
  }): () => void {
    if (!this.isAvailable()) return () => {};

    const unsubs: Unsubscribe[] = [];

    try {
      const onError = (err: any) => {
        // Log friendly status when reconnecting or offline
        if (err?.code === 'unavailable') {
          console.info('Firestore offline/reconnecting mode active.');
        } else {
          console.warn('Firestore subscription status:', err?.message || err);
        }
      };

      if (callbacks.onMembers) {
        const unsub = onSnapshot(
          collection(db, 'members'),
          (snap) => {
            const members: Member[] = [];
            snap.forEach((d) => members.push(d.data() as Member));
            callbacks.onMembers?.(members);
          },
          onError
        );
        unsubs.push(unsub);
      }

      if (callbacks.onBankers) {
        const unsub = onSnapshot(
          collection(db, 'bankers'),
          (snap) => {
            const bankers: Banker[] = [];
            snap.forEach((d) => bankers.push(d.data() as Banker));
            callbacks.onBankers?.(bankers);
          },
          onError
        );
        unsubs.push(unsub);
      }

      if (callbacks.onTransactions) {
        const unsub = onSnapshot(
          collection(db, 'transactions'),
          (snap) => {
            const txs: Transaction[] = [];
            snap.forEach((d) => txs.push(d.data() as Transaction));
            txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            callbacks.onTransactions?.(txs);
          },
          onError
        );
        unsubs.push(unsub);
      }

      if (callbacks.onRoutes) {
        const unsub = onSnapshot(
          collection(db, 'routes'),
          (snap) => {
            const routes: Route[] = [];
            snap.forEach((d) => routes.push(d.data() as Route));
            callbacks.onRoutes?.(routes);
          },
          onError
        );
        unsubs.push(unsub);
      }

      if (callbacks.onReconciliations) {
        const unsub = onSnapshot(
          collection(db, 'reconciliations'),
          (snap) => {
            const recs: ReconciliationRecord[] = [];
            snap.forEach((d) => recs.push(d.data() as ReconciliationRecord));
            callbacks.onReconciliations?.(recs);
          },
          onError
        );
        unsubs.push(unsub);
      }

      if (callbacks.onAuditLogs) {
        const unsub = onSnapshot(
          collection(db, 'auditLogs'),
          (snap) => {
            const logs: AuditLogEntry[] = [];
            snap.forEach((d) => logs.push(d.data() as AuditLogEntry));
            logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            callbacks.onAuditLogs?.(logs);
          },
          onError
        );
        unsubs.push(unsub);
      }
    } catch (e) {
      console.warn('Real-time subscription error:', e);
    }

    return () => {
      unsubs.forEach((u) => {
        try {
          u();
        } catch {
          // ignore
        }
      });
    };
  },
};
