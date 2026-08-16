import { supabase, isSupabaseConfigured } from './supabase';
import {
  Banker,
  Member,
  Route,
  Transaction,
  ReconciliationRecord,
  AuditLogEntry,
} from '../types';

export const supabaseService = {
  // Fetch All Initial State
  async fetchAllData() {
    if (!isSupabaseConfigured) return null;

    try {
      const [
        { data: bankersData, error: bErr },
        { data: routesData, error: rErr },
        { data: membersData, error: mErr },
        { data: txData, error: tErr },
        { data: reconData, error: rcErr },
        { data: auditData, error: aErr },
      ] = await Promise.all([
        supabase.from('bankers').select('*'),
        supabase.from('routes').select('*'),
        supabase.from('members').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('reconciliations').select('*').order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }),
      ]);

      if (bErr || rErr || mErr || tErr || rcErr || aErr) {
        console.warn('Supabase fetch notice (tables may need to be initialized with SQL script):', {
          bErr, rErr, mErr, tErr, rcErr, aErr
        });
        return null;
      }

      const bankers: Banker[] = (bankersData || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        phone: b.phone || '',
        email: b.email || '',
        avatar: b.avatar || '',
        routeId: b.route_id || '',
        routeName: b.route_name || '',
        zone: b.zone || '',
        dailyTarget: Number(b.daily_target) || 0,
        collectedToday: Number(b.collected_today) || 0,
        withdrawnToday: Number(b.withdrawn_today) || 0,
        assignedMemberCount: Number(b.assigned_member_count) || 0,
        commissionRate: Number(b.commission_rate) || 3.3,
        commissionModel: b.commission_model || 'ONE_DAY_CONTRIBUTION',
        status: b.status || 'active',
        joinedDate: b.joined_date || '',
        lastActive: b.last_active || '',
        notes: b.notes || '',
        password: b.password || '',
      }));

      const routes: Route[] = (routesData || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        zone: r.zone || '',
        description: r.description || '',
        bankerId: r.banker_id || '',
        bankerName: r.banker_name || '',
        totalMembers: Number(r.total_members) || 0,
        dailyEstimatedTarget: Number(r.daily_estimated_target) || 0,
        stopsCount: Number(r.stops_count) || 0,
      }));

      const members: Member[] = (membersData || []).map((m: any) => ({
        id: m.id,
        accountNumber: m.account_number || m.accountNumber || m.id,
        name: m.name,
        phone: m.phone || '',
        avatar: m.avatar || '',
        assignedBankerId: m.assigned_banker_id || '',
        assignedBankerName: m.assigned_banker_name || '',
        routeId: m.route_id || '',
        routeName: m.route_name || '',
        locationStall: m.location_stall || '',
        dailyTarget: Number(m.daily_target) || 0,
        totalBalance: Number(m.total_balance) || 0,
        officeFeePaid: Number(m.office_fee_paid) || 0,
        totalSavingsAllTime: Number(m.total_savings_all_time) || 0,
        totalWithdrawnAllTime: Number(m.total_withdrawn_all_time) || 0,
        susuCycleDays: Number(m.susu_cycle_days) || 31,
        currentCyclePaidDays: Number(m.current_cycle_paid_days) || 0,
        savingsGoal: m.savings_goal || undefined,
        status: m.status || 'active',
        joinedDate: m.joined_date || '',
        lastPaymentDate: m.last_payment_date || undefined,
        visitedToday: Boolean(m.visited_today),
        depositedToday: Boolean(m.deposited_today),
        todayDepositAmount: Number(m.today_deposit_amount) || 0,
        stamps: Array.isArray(m.stamps) ? m.stamps : [],
      }));

      const transactions: Transaction[] = (txData || []).map((t: any) => ({
        id: t.id,
        receiptNumber: t.receipt_number,
        type: t.type,
        memberId: t.member_id,
        memberName: t.member_name,
        memberPhone: t.member_phone || '',
        bankerId: t.banker_id,
        bankerName: t.banker_name,
        amount: Number(t.amount) || 0,
        fee: Number(t.fee) || 0,
        netAmount: Number(t.net_amount) || 0,
        paymentMethod: t.payment_method,
        timestamp: t.timestamp,
        susuDayNumber: t.susu_day_number || undefined,
        isFirstDepositOfficeFee: Boolean(t.is_first_deposit_office_fee),
        status: t.status || 'COMPLETED',
        withdrawalReason: t.withdrawal_reason || undefined,
        payoutMode: t.payout_mode || undefined,
        initiatedByRole: t.initiated_by_role || undefined,
        approvedBy: t.approved_by || undefined,
        approvalDate: t.approval_date || undefined,
        disbursedBy: t.disbursed_by || undefined,
        disbursementDate: t.disbursement_date || undefined,
        rejectionReason: t.rejection_reason || undefined,
        notes: t.notes || '',
      }));

      const reconciliations: ReconciliationRecord[] = (reconData || []).map((rc: any) => ({
        id: rc.id,
        date: rc.date,
        bankerId: rc.banker_id,
        bankerName: rc.banker_name,
        totalCollected: Number(rc.total_collected) || 0,
        totalDisbursed: Number(rc.total_disbursed) || 0,
        netCashDue: Number(rc.net_cash_due) || 0,
        cashReceivedByAdmin: Number(rc.cash_received_by_admin) || 0,
        discrepancy: Number(rc.discrepancy) || 0,
        status: rc.status || 'SETTLED',
        verifiedBy: rc.verified_by,
        settlementTime: rc.settlement_time,
        notes: rc.notes || '',
      }));

      const auditLogs: AuditLogEntry[] = (auditData || []).map((a: any) => ({
        id: a.id,
        timestamp: a.timestamp,
        action: a.action,
        actorName: a.actor_name || 'System',
        actorRole: a.actor_role || 'admin',
        targetType: a.target_type || 'member',
        targetId: a.target_id || '',
        targetName: a.target_name || undefined,
        description: a.description || '',
        details: a.details || undefined,
        severity: a.severity || 'info',
        amount: a.amount !== null && a.amount !== undefined ? Number(a.amount) : undefined,
      }));

      return {
        bankers,
        routes,
        members,
        transactions,
        reconciliations,
        auditLogs,
      };
    } catch (e) {
      console.error('Supabase fetch error:', e);
      return null;
    }
  },

  // Save Member
  async upsertMember(member: Member) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('members').upsert({
        id: member.id,
        account_number: member.accountNumber || member.id,
        name: member.name,
        phone: member.phone,
        avatar: member.avatar,
        assigned_banker_id: member.assignedBankerId,
        assigned_banker_name: member.assignedBankerName,
        route_id: member.routeId,
        route_name: member.routeName,
        location_stall: member.locationStall,
        daily_target: member.dailyTarget,
        total_balance: member.totalBalance,
        office_fee_paid: member.officeFeePaid,
        total_savings_all_time: member.totalSavingsAllTime,
        total_withdrawn_all_time: member.totalWithdrawnAllTime,
        susu_cycle_days: member.susuCycleDays,
        current_cycle_paid_days: member.currentCyclePaidDays,
        savings_goal: member.savingsGoal,
        status: member.status,
        joined_date: member.joinedDate,
        last_payment_date: member.lastPaymentDate,
        visited_today: member.visitedToday,
        deposited_today: member.depositedToday,
        today_deposit_amount: member.todayDepositAmount,
        stamps: member.stamps,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Supabase upsert member error:', e);
    }
  },

  // Save Banker
  async upsertBanker(banker: Banker) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('bankers').upsert({
        id: banker.id,
        name: banker.name,
        phone: banker.phone,
        email: banker.email,
        avatar: banker.avatar,
        route_id: banker.routeId,
        route_name: banker.routeName,
        zone: banker.zone,
        daily_target: banker.dailyTarget,
        collected_today: banker.collectedToday,
        withdrawn_today: banker.withdrawnToday,
        assigned_member_count: banker.assignedMemberCount,
        commission_rate: banker.commissionRate,
        commission_model: banker.commissionModel,
        status: banker.status,
        joined_date: banker.joinedDate,
        last_active: banker.lastActive,
        notes: banker.notes,
        password: banker.password,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Supabase upsert banker error:', e);
    }
  },

  // Save Route
  async upsertRoute(route: Route) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('routes').upsert({
        id: route.id,
        name: route.name,
        zone: route.zone,
        description: route.description,
        banker_id: route.bankerId,
        banker_name: route.bankerName,
        total_members: route.totalMembers,
        daily_estimated_target: route.dailyEstimatedTarget,
        stops_count: route.stopsCount,
      });
    } catch (e) {
      console.error('Supabase upsert route error:', e);
    }
  },

  // Insert Transaction
  async insertTransaction(tx: Transaction) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('transactions').upsert({
        id: tx.id,
        receipt_number: tx.receiptNumber,
        type: tx.type,
        member_id: tx.memberId,
        member_name: tx.memberName,
        member_phone: tx.memberPhone,
        banker_id: tx.bankerId,
        banker_name: tx.bankerName,
        amount: tx.amount,
        fee: tx.fee,
        net_amount: tx.netAmount,
        payment_method: tx.paymentMethod,
        timestamp: tx.timestamp,
        susu_day_number: tx.susuDayNumber,
        is_first_deposit_office_fee: tx.isFirstDepositOfficeFee,
        status: tx.status,
        withdrawal_reason: tx.withdrawalReason,
        payout_mode: tx.payoutMode,
        initiated_by_role: tx.initiatedByRole,
        approved_by: tx.approvedBy,
        approval_date: tx.approvalDate,
        disbursed_by: tx.disbursedBy,
        disbursement_date: tx.disbursementDate,
        rejection_reason: tx.rejectionReason,
        notes: tx.notes,
      });
    } catch (e) {
      console.error('Supabase insert transaction error:', e);
    }
  },

  // Insert Reconciliation
  async insertReconciliation(rc: ReconciliationRecord) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('reconciliations').upsert({
        id: rc.id,
        date: rc.date,
        banker_id: rc.bankerId,
        banker_name: rc.bankerName,
        total_collected: rc.totalCollected,
        total_disbursed: rc.totalDisbursed,
        net_cash_due: rc.netCashDue,
        cash_received_by_admin: rc.cashReceivedByAdmin,
        discrepancy: rc.discrepancy,
        status: rc.status,
        verified_by: rc.verifiedBy,
        settlement_time: rc.settlementTime,
        notes: rc.notes,
      });
    } catch (e) {
      console.error('Supabase insert reconciliation error:', e);
    }
  },

  // Insert Audit Log
  async insertAuditLog(log: AuditLogEntry) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('audit_logs').upsert({
        id: log.id,
        timestamp: log.timestamp,
        action: log.action,
        actor_name: log.actorName,
        actor_role: log.actorRole,
        target_type: log.targetType,
        target_id: log.targetId,
        target_name: log.targetName,
        description: log.description,
        details: log.details,
        severity: log.severity,
        amount: log.amount,
      });
    } catch (e) {
      console.error('Supabase insert audit log error:', e);
    }
  },

  // Subscribe to real-time updates
  subscribeToChanges(onUpdate: () => void) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
