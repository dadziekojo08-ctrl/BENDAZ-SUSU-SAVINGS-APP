-- ==============================================================================
-- BENDAZ SUSU ENTERPRISE SCHEMA (Supabase PostgreSQL)
-- Run this SQL in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Click Run
-- ==============================================================================

-- 1. BANKERS TABLE
CREATE TABLE IF NOT EXISTS bankers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    avatar TEXT,
    route_id TEXT,
    route_name TEXT,
    zone TEXT,
    daily_target NUMERIC DEFAULT 0,
    collected_today NUMERIC DEFAULT 0,
    withdrawn_today NUMERIC DEFAULT 0,
    assigned_member_count INT DEFAULT 0,
    commission_rate NUMERIC DEFAULT 3.3,
    commission_model TEXT DEFAULT 'ONE_DAY_CONTRIBUTION',
    status TEXT DEFAULT 'active',
    joined_date TEXT,
    last_active TEXT,
    notes TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ROUTES TABLE
CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    zone TEXT,
    description TEXT,
    banker_id TEXT,
    banker_name TEXT,
    total_members INT DEFAULT 0,
    daily_estimated_target NUMERIC DEFAULT 0,
    stops_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MEMBERS (SAVERS) TABLE
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    assigned_banker_id TEXT,
    assigned_banker_name TEXT,
    route_id TEXT,
    route_name TEXT,
    location_stall TEXT,
    daily_target NUMERIC DEFAULT 0,
    total_balance NUMERIC DEFAULT 0,
    office_fee_paid NUMERIC DEFAULT 0,
    total_savings_all_time NUMERIC DEFAULT 0,
    total_withdrawn_all_time NUMERIC DEFAULT 0,
    susu_cycle_days INT DEFAULT 31,
    current_cycle_paid_days INT DEFAULT 0,
    savings_goal JSONB,
    status TEXT DEFAULT 'active',
    joined_date TEXT,
    last_payment_date TEXT,
    visited_today BOOLEAN DEFAULT FALSE,
    deposited_today BOOLEAN DEFAULT FALSE,
    today_deposit_amount NUMERIC DEFAULT 0,
    stamps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    receipt_number TEXT NOT NULL,
    type TEXT NOT NULL,
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    member_phone TEXT,
    banker_id TEXT NOT NULL,
    banker_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    fee NUMERIC DEFAULT 0,
    net_amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    susu_day_number INT,
    is_first_deposit_office_fee BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'COMPLETED',
    withdrawal_reason TEXT,
    payout_mode TEXT,
    initiated_by_role TEXT,
    approved_by TEXT,
    approval_date TEXT,
    disbursed_by TEXT,
    disbursement_date TEXT,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RECONCILIATIONS TABLE
CREATE TABLE IF NOT EXISTS reconciliations (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    banker_id TEXT NOT NULL,
    banker_name TEXT NOT NULL,
    total_collected NUMERIC DEFAULT 0,
    total_disbursed NUMERIC DEFAULT 0,
    net_cash_due NUMERIC DEFAULT 0,
    cash_received_by_admin NUMERIC DEFAULT 0,
    discrepancy NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'SETTLED',
    verified_by TEXT,
    settlement_time TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    action TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    performer_role TEXT NOT NULL,
    target_id TEXT,
    target_name TEXT,
    severity TEXT DEFAULT 'info',
    amount NUMERIC,
    receipt_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and allow public API access
ALTER TABLE bankers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read/write for all client operations
CREATE POLICY "Allow all read on bankers" ON bankers FOR SELECT USING (true);
CREATE POLICY "Allow all insert on bankers" ON bankers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on bankers" ON bankers FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on bankers" ON bankers FOR DELETE USING (true);

CREATE POLICY "Allow all read on routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Allow all insert on routes" ON routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on routes" ON routes FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on routes" ON routes FOR DELETE USING (true);

CREATE POLICY "Allow all read on members" ON members FOR SELECT USING (true);
CREATE POLICY "Allow all insert on members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on members" ON members FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on members" ON members FOR DELETE USING (true);

CREATE POLICY "Allow all read on transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow all insert on transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on transactions" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on transactions" ON transactions FOR DELETE USING (true);

CREATE POLICY "Allow all read on reconciliations" ON reconciliations FOR SELECT USING (true);
CREATE POLICY "Allow all insert on reconciliations" ON reconciliations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on reconciliations" ON reconciliations FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on reconciliations" ON reconciliations FOR DELETE USING (true);

CREATE POLICY "Allow all read on audit_logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow all insert on audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on audit_logs" ON audit_logs FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on audit_logs" ON audit_logs FOR DELETE USING (true);
