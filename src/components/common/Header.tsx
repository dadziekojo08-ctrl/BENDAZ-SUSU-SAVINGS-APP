import React from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
  UserPlus,
  PlusCircle,
  Clock,
  LogOut,
  Sparkles,
  Coins,
  Wallet,
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
  } = useSusu();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-xs">
      {/* Top Colorful Brand Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-400 via-rose-500 to-indigo-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Mode Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-emerald-500/20 border border-emerald-300/30">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-display">
                Bendaz <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Susu</span>
              </span>
              <span
                className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs ${
                  userRole === 'admin'
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200'
                    : 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-800 border border-indigo-200'
                }`}
              >
                {userRole === 'admin' ? 'HQ Admin' : 'Field Collector'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Daily Thrift & Field Banking System • Ghana
            </p>
          </div>
        </div>

        {/* Center / Summary Stats Pill */}
        <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-slate-50 to-emerald-50/40 px-3.5 py-1.5 rounded-2xl border border-slate-200/90 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 font-medium">Today's Float:</span>
            <strong className="text-emerald-700 font-extrabold font-mono text-sm">
              {formatMoney(totalCollectedToday)}
            </strong>
          </div>

          {pendingWithdrawalsCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-100/80 border border-amber-300/60 text-amber-900 font-bold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{pendingWithdrawalsCount} Payout{pendingWithdrawalsCount > 1 ? 's' : ''} Pending</span>
              </div>
            </>
          )}

          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium">Curr:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-white text-slate-800 border border-slate-300 rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer shadow-2xs"
            >
              <option value="GHS">GH₵ (Cedi)</option>
              <option value="USD">$ (USD)</option>
              <option value="NGN">₦ (Naira)</option>
              <option value="KES">KSh</option>
            </select>
          </div>
        </div>

        {/* Quick Actions & User Bar */}
        <div className="flex items-center gap-2">
          {/* Main Action Buttons */}
          <button
            onClick={onOpenDepositModal}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            title="Record Saver Deposit"
          >
            <ArrowDownRight className="w-4 h-4 text-emerald-100" />
            <span>Deposit</span>
          </button>

          <button
            onClick={onOpenWithdrawalModal}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            title="Request Member Withdrawal"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-100" />
            <span>Withdraw</span>
          </button>

          {userRole === 'admin' ? (
            <>
              <button
                onClick={onOpenNewMemberModal}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 border border-blue-200/80 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs"
                title="Register New Saver"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Add Saver</span>
              </button>

              <button
                onClick={onOpenNewBankerModal}
                className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-900 border border-purple-200/80 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs hidden lg:flex"
                title="Add Field Collector"
              >
                <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                <span>Add Banker</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenNewMemberModal}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 border border-blue-200/80 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs"
              title="Register New Saver on Route"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Add Saver</span>
            </button>
          )}

          {/* User Profile & Logout */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 ml-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>

            <div className="hidden sm:flex flex-col text-left px-0.5">
              <span className="text-xs font-bold text-slate-800 leading-none truncate max-w-[100px]">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                {userRole === 'admin' ? 'Super Admin' : 'Field Banker'}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer ml-0.5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
