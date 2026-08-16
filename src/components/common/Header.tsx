import React from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
  UserPlus,
  PlusCircle,
  Clock,
  Radio,
  LogOut,
  User,
} from 'lucide-react';
import { CurrencyCode } from '../../types';

interface HeaderProps {
  onOpenDepositModal: () => void;
  onOpenWithdrawalModal: () => void;
  onOpenNewMemberModal: () => void;
  onOpenNewBankerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDepositModal,
  onOpenWithdrawalModal,
  onOpenNewMemberModal,
  onOpenNewBankerModal,
}) => {
  const {
    currentUser,
    userRole,
    logout,
    currency,
    setCurrency,
    formatMoney,
    totalCollectedToday,
    pendingWithdrawalsCount,
    totalOfficeRevenue,
  } = useSusu();

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 text-slate-100 shadow-lg">
        {/* Top Banner / Live Ticker */}
        <div className="bg-[#020617] px-4 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              BENDAZ SUSU LIVE • FIRESTORE CLOUD DATABASE CONNECTED
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:inline text-slate-300">
              Today's Collections: <strong className="text-emerald-400 font-semibold">{formatMoney(totalCollectedToday)}</strong>
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:inline text-slate-300">
              Office Day 1 Revenue: <strong className="text-amber-400 font-semibold">{formatMoney(totalOfficeRevenue)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {pendingWithdrawalsCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                {pendingWithdrawalsCount} Pending Approval{pendingWithdrawalsCount > 1 ? 's' : ''}
              </span>
            )}

            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
              <span>Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-slate-900 text-white border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="GHS">GH₵ (Ghana Cedi)</option>
                <option value="USD">$ (USD)</option>
                <option value="NGN">₦ (Naira)</option>
                <option value="KES">KSh (Kenyan Shilling)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md border border-emerald-400/40">
                B
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-2xl tracking-tight text-white font-display">
                    BENDAZ <span className="font-light text-emerald-400">SUSU</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {userRole === 'admin' ? 'ADMIN HQ' : 'BANKER FIELD APP'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Daily Micro-Savings & Field Banker Ledger System
                </p>
              </div>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Authenticated User Badge */}
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-2xl border border-slate-700 flex items-center gap-2.5">
              {currentUser?.role === 'admin' ? (
                <>
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/40">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                        ADMIN HQ
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Central Back-Office</div>
                  </div>
                </>
              ) : (
                <>
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-xl object-cover border border-slate-600"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{currentUser?.name}</span>
                      <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                        {currentUser?.bankerId || 'COLLECTOR'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Field Mobile App</div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDepositModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/20 transition-transform active:scale-95 cursor-pointer"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Record Deposit</span>
              </button>

              <button
                onClick={onOpenWithdrawalModal}
                className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/20 transition-transform active:scale-95 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Initiate Payout</span>
              </button>

              {userRole === 'admin' && (
                <button
                  onClick={onOpenNewBankerModal}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Add Banker</span>
                </button>
              )}

              <button
                onClick={onOpenNewMemberModal}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Create Account</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log out to Switch Account"
                className="bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
