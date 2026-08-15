import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Lock,
  AlertCircle,
  Building2,
  Coins,
  Store,
  Users,
  ArrowRight,
} from 'lucide-react';
import { UserRole } from '../../types';
import { AppLogo } from '../common/AppLogo';

export const LoginPage: React.FC = () => {
  const { login, bankers } = useSusu();

  const [activeTab, setActiveTab] = useState<UserRole>('admin');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [selectedBankerId, setSelectedBankerId] = useState<string>(bankers[0]?.id || 'BK-001');
  const [bankerPin, setBankerPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login('admin', adminUsername, adminPassword);
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid username or password. Please check your credentials.');
      }
      setIsLoading(false);
    }, 250);
  };

  const handleBankerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login('banker', selectedBankerId, bankerPin);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please verify selected banker & PIN.');
      }
      setIsLoading(false);
    }, 250);
  };

  const selectedBanker = bankers.find((b) => b.id === selectedBankerId);

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#4A4A40] flex flex-col justify-between selection:bg-[#8E9775] selection:text-white">
      {/* Top Brand Banner */}
      <header className="border-b border-[#E3DFC9] bg-[#EFECE3] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size="lg" />
            <div>
              <h1 className="font-serif-brand font-bold text-lg text-[#383B2B] tracking-tight flex items-center gap-2">
                BENDAZ SUSU APP
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#8E9775]/25 text-[#383B2B] border border-[#8E9775]/40">
                  OFFICIAL PORTAL
                </span>
              </h1>
              <p className="text-[11px] text-[#7A7A65]">
                Daily Thrift Savings, Route Bankers & Back-Office Ledger
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#5A5A40] font-medium bg-[#E5E0CF] px-3 py-1.5 rounded-xl border border-[#D5CFB9]">
            <ShieldCheck className="w-4 h-4 text-[#6B7555]" />
            <span>Secure Role-Based Authentication</span>
          </div>
        </div>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: App Overview & Susu Principles */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8E9775]/20 text-[#383B2B] text-xs font-bold border border-[#8E9775]/35">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5E46]" />
              <span>Authentication Required</span>
            </div>
            <h2 className="font-serif-brand text-3xl sm:text-4xl font-extrabold text-[#383B2B] tracking-tight leading-tight">
              Sign In to Access Bendaz Susu Ledger
            </h2>
            <p className="text-sm text-[#6B6B55] leading-relaxed">
              Enter your authorized credentials to access the <strong>Admin HQ Dashboard</strong> or your assigned <strong>Field Banker Mobile Bag</strong>.
            </p>
          </div>

          {/* Business Rules Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-[#E3DFC9] shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-[#8E9775]/20 text-[#4A5038] flex items-center justify-center font-bold">
                <Coins className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-[#383B2B]">First Deposit for Office</h4>
              <p className="text-[11px] text-[#7A7A65] leading-normal">
                Day 1 contribution is retained for the Office. Members enjoy <strong>GH₵ 0.00 withdrawal charges</strong> on all subsequent payouts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E3DFC9] shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-[#C27D50]/20 text-[#9A5025] flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-[#383B2B]">Admin Approval Required</h4>
              <p className="text-[11px] text-[#7A7A65] leading-normal">
                Bankers initiate withdrawal requests on site. Payouts can only be handed over after Admin Bernard approves them.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E3DFC9] shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-[#383B2B]/15 text-[#383B2B] flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-[#383B2B]">No Member Portal</h4>
              <p className="text-[11px] text-[#7A7A65] leading-normal">
                All deposits are collected in person at market stalls by Bankers & recorded by Back Office staff.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E3DFC9] shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-[#D4A359]/25 text-[#7A5515] flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-[#383B2B]">Flexible Anytime Withdrawals</h4>
              <p className="text-[11px] text-[#7A7A65] leading-normal">
                Savers can withdraw weekly, for emergency restocks, or upon completing their 31-day Susu card cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl border border-[#DCD7C2] shadow-xl p-6 sm:p-8 space-y-6">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 p-1.5 bg-[#F4F1EA] rounded-2xl border border-[#E3DFC9]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setErrorMessage('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#383B2B] text-white shadow-md'
                    : 'text-[#6A6A55] hover:text-[#383B2B]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Admin / Back Office</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('banker');
                  setErrorMessage('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'banker'
                    ? 'bg-[#383B2B] text-white shadow-md'
                    : 'text-[#6A6A55] hover:text-[#383B2B]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Field Banker</span>
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3 bg-[#C27D50]/15 border border-[#C27D50]/30 rounded-xl text-xs text-[#9A5025] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#C27D50]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: ADMIN LOGIN FORM */}
            {activeTab === 'admin' ? (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A4A38] uppercase tracking-wider mb-1.5">
                    Admin Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8A8A70] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                      placeholder="Enter administrator username"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9F8F4] border border-[#D5CFB9] rounded-xl text-sm font-medium text-[#383B2B] focus:ring-2 focus:ring-[#8E9775] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4A38] uppercase tracking-wider mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A8A70] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      placeholder="Enter admin password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F9F8F4] border border-[#D5CFB9] rounded-xl text-sm font-medium text-[#383B2B] focus:ring-2 focus:ring-[#8E9775] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A8A70] hover:text-[#383B2B] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#383B2B] hover:bg-[#2C2E22] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Verifying Credentials...</span>
                    ) : (
                      <>
                        <span>Sign In to Admin HQ</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : bankers.length === 0 ? (
              <div className="py-6 px-4 bg-[#F9F8F4] rounded-2xl border border-[#D5CFB9] text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#8E9775]/20 text-[#383B2B] flex items-center justify-center mx-auto">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#383B2B]">No Field Bankers Registered</h4>
                  <p className="text-[11px] text-[#7A7A65] mt-1">
                    Log in as <strong>Admin HQ</strong> first to add field bankers, assign market routes, and configure PINs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className="px-3 py-1.5 bg-[#383B2B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#2C2E22] transition-colors cursor-pointer"
                >
                  Switch to Admin HQ Login
                </button>
              </div>
            ) : (
              /* TAB 2: FIELD BANKER LOGIN FORM */
              <form onSubmit={handleBankerSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A4A38] uppercase tracking-wider mb-1.5">
                    Select Field Banker
                  </label>
                  <select
                    value={selectedBankerId}
                    onChange={(e) => setSelectedBankerId(e.target.value)}
                    className="w-full p-2.5 bg-[#F9F8F4] border border-[#D5CFB9] rounded-xl text-xs font-semibold text-[#383B2B] focus:ring-2 focus:ring-[#8E9775] focus:outline-none"
                  >
                    {bankers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.id} • {b.zone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Banker Card Preview */}
                {selectedBanker && (
                  <div className="p-3 bg-[#8E9775]/15 rounded-xl border border-[#8E9775]/30 flex items-center gap-3">
                    <img
                      src={selectedBanker.avatar}
                      alt={selectedBanker.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#8E9775]/50 shadow-xs"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-[#383B2B]">{selectedBanker.name}</h4>
                      <p className="text-[11px] text-[#6A6A55]">
                        Route: {selectedBanker.routeName}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#4A4A38] uppercase tracking-wider mb-1.5">
                    Banker PIN / Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A8A70] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={bankerPin}
                      onChange={(e) => setBankerPin(e.target.value)}
                      required
                      placeholder="Enter security PIN / password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F9F8F4] border border-[#D5CFB9] rounded-xl text-sm font-medium text-[#383B2B] focus:ring-2 focus:ring-[#8E9775] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A8A70] hover:text-[#383B2B] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#383B2B] hover:bg-[#2C2E22] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Opening Field Banker App...</span>
                    ) : (
                      <>
                        <span>Sign In as Field Banker</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3DFC9] bg-[#EFECE3] px-6 py-4 text-center text-xs text-[#7A7A65]">
        <p>
          BENDAZ SUSU APP • Authorized Personnel Only • 256-bit Encrypted Ledger
        </p>
      </footer>
    </div>
  );
};
