import { Banker, Member, Route, Transaction, ReconciliationRecord, AuditLogEntry } from '../types';

export const DEFAULT_ROUTES: Route[] = [
  {
    id: 'ROUTE-01',
    name: 'Makola Market Central',
    zone: 'Accra Central',
    description: 'Textile, fabric, and jewelry traders hub',
    bankerId: '',
    bankerName: 'Unassigned',
    totalMembers: 0,
    dailyEstimatedTarget: 5000,
    stopsCount: 25,
  },
  {
    id: 'ROUTE-02',
    name: 'Kaneshie Commercial Hub',
    zone: 'Accra West',
    description: 'Provisions, grains, and general merchandise zone',
    bankerId: '',
    bankerName: 'Unassigned',
    totalMembers: 0,
    dailyEstimatedTarget: 3500,
    stopsCount: 18,
  },
  {
    id: 'ROUTE-03',
    name: 'Kejetia Market North',
    zone: 'Kumasi Central',
    description: 'Wholesale footwear, cosmetics, and spice stalls',
    bankerId: '',
    bankerName: 'Unassigned',
    totalMembers: 0,
    dailyEstimatedTarget: 4000,
    stopsCount: 22,
  },
];

export const INITIAL_ROUTES: Route[] = DEFAULT_ROUTES;

export const INITIAL_BANKERS: Banker[] = [];

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_RECONCILIATIONS: ReconciliationRecord[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// Primary and legacy storage keys for reliable backward compatibility
const PRIMARY_STORAGE_KEY = 'bendaz_susu_app_data_v5';
const FALLBACK_KEYS = [
  'bendaz_susu_app_data_v5',
  'bendaz_susu_app_data_v4',
  'bendaz_susu_app_data_v3',
  'bendaz_susu_app_data_v2',
  'bendaz_susu_app_data_v1',
  'bendaz_susu_app_data',
];

export interface StoredSusuData {
  bankers: Banker[];
  members: Member[];
  transactions: Transaction[];
  routes: Route[];
  reconciliations: ReconciliationRecord[];
  auditLogs: AuditLogEntry[];
}

export const loadStoredData = (): StoredSusuData => {
  for (const key of FALLBACK_KEYS) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          (Array.isArray(parsed.members) ||
            Array.isArray(parsed.bankers) ||
            Array.isArray(parsed.transactions) ||
            Array.isArray(parsed.routes))
        ) {
          return {
            bankers: Array.isArray(parsed.bankers) ? parsed.bankers : [],
            members: Array.isArray(parsed.members) ? parsed.members : [],
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
            routes: Array.isArray(parsed.routes) && parsed.routes.length > 0 ? parsed.routes : DEFAULT_ROUTES,
            reconciliations: Array.isArray(parsed.reconciliations) ? parsed.reconciliations : [],
            auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
          };
        }
      }
    } catch (e) {
      console.warn(`Could not load from storage key ${key}:`, e);
    }
  }

  return {
    bankers: [],
    members: [],
    transactions: [],
    routes: DEFAULT_ROUTES,
    reconciliations: [],
    auditLogs: [],
  };
};

export const saveStoredData = (data: StoredSusuData): boolean => {
  try {
    const payload = JSON.stringify(data);
    localStorage.setItem(PRIMARY_STORAGE_KEY, payload);
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    return false;
  }
};


