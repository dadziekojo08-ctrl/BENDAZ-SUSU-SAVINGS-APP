import { Banker, Member, Route, Transaction, ReconciliationRecord } from '../types';

export const INITIAL_ROUTES: Route[] = [];

export const INITIAL_BANKERS: Banker[] = [];

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_RECONCILIATIONS: ReconciliationRecord[] = [];

// Local storage key helper
const STORAGE_KEY = 'bendaz_susu_app_data_v5';

export const loadStoredData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        bankers: parsed.bankers || [],
        members: parsed.members || [],
        transactions: parsed.transactions || [],
        routes: parsed.routes || [],
        reconciliations: parsed.reconciliations || [],
      };
    }
  } catch (e) {
    console.error('Failed to load from storage', e);
  }
  return {
    bankers: [],
    members: [],
    transactions: [],
    routes: [],
    reconciliations: [],
  };
};

export const saveStoredData = (data: {
  bankers: Banker[];
  members: Member[];
  transactions: Transaction[];
  routes: Route[];
  reconciliations: ReconciliationRecord[];
}) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage', e);
  }
};
