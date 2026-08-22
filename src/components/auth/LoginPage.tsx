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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Brand Banner */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur px-6 py-4 sticky top-0 z-10 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md border border-emerald-400/40">
              B
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2 font-display">
                BENDAZ SUSU APP
                <span className="text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OFFICIAL PORTAL
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Daily Thrift Savings, Route Bankers & Back-Office Ledger
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Role-Based Authentication</span>
          </div>
        </div>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: App Overview & Susu Principles */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Authentication Required</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
              Sign In to Access Bendaz Susu Ledger
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enter your authorized credentials to access the <strong className="text-slate-800">Admin HQ Dashboard</strong> or your assigned <strong className="text-slate-800">Field Banker Mobile Bag</strong>.
            </p>
          </div>

          {/* Business Rules Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5 hover:border-emerald-200 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Coins className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">First Deposit for Office</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Day 1 contribution is retained for the Office. Members enjoy <strong className="text-emerald-700">GH₵ 0.00 withdrawal charges</strong> on all subsequent payouts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5 hover:border-amber-200 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Admin Approval Required</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Bankers initiate withdrawal requests on site. Payouts can only be handed over after Admin Bernard approves them.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5 hover:border-blue-200 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">No Member Portal</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                All deposits are collected in person at market stalls by Bankers & recorded by Back Office staff.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5 hover:border-purple-200 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Flexible Anytime Withdrawals</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Savers can withdraw weekly, for emergency restocks, or upon completing their 31-day Susu card cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setErrorMessage('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Field Banker</span>
              </button>
            </div>

            {/* Quick Demo Helper Pills */}
            <div className="p-3 bg-gradient-to-r from-slate-50 to-emerald-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="text-amber-500 font-bold">✨</span>
                <span className="text-[11px] font-semibold">Quick Demo Login:</span>
              </div>
              {activeTab === 'admin' ? (
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername('bernard');
                    setAdminPassword('bendaz');
                  }}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Auto-fill Bernard / bendaz
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (bankers.length > 0) {
                      setSelectedBankerId(bankers[0].id);
                    }
                    setBankerPin('1234');
                  }}
                  className="px-2.5 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border border-cyan-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Auto-fill Banker / 1234
                </button>
              )}
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: ADMIN LOGIN FORM */}
            {activeTab === 'admin' ? (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                      placeholder="Enter administrator username (e.g. bernard)"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      placeholder="Enter admin password (e.g. bendaz)"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
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
              <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">No Field Bankers Registered</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Log in as <strong>Admin HQ</strong> first to add field bankers, assign market routes, and configure PINs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Switch to Admin HQ Login
                </button>
              </div>
            ) : (
              /* TAB 2: FIELD BANKER LOGIN FORM */
              <form onSubmit={handleBankerSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Field Banker
                  </label>
                  <select
                    value={selectedBankerId}
                    onChange={(e) => setSelectedBankerId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none"
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
                  <div className="p-3 bg-cyan-50/70 rounded-2xl border border-cyan-200 flex items-center gap-3">
                    <img
                      src={selectedBanker.avatar}
                      alt={selectedBanker.name}
                      className="w-10 h-10 rounded-xl object-cover border border-cyan-300 shadow-2xs"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{selectedBanker.name}</h4>
                      <p className="text-[11px] text-slate-600">
                        Route: {selectedBanker.routeName} ({selectedBanker.zone})
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Banker PIN / Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={bankerPin}
                      onChange={(e) => setBankerPin(e.target.value)}
                      required
                      placeholder="Enter security PIN / password (default: 1234)"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
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
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        <p>
          BENDAZ SUSU APP • Authorized Personnel Only • 256-bit Encrypted Ledger
        </p>
      </footer>
    </div>
  );
};
