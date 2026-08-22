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
  User,
  Coins,
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Mode Tag */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 font-display">
                Bendaz <span className="text-emerald-600 font-extrabold">Susu</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {userRole === 'admin' ? 'Admin Portal' : 'Collector App'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Daily Thrift & Field Banking System
            </p>
          </div>
        </div>

        {/* Center / Summary Stats Pill */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
          <div>
            Today: <strong className="text-emerald-700 font-bold">{formatMoney(totalCollectedToday)}</strong>
          </div>
          {pendingWithdrawalsCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {pendingWithdrawalsCount} Pending Payout{pendingWithdrawalsCount > 1 ? 's' : ''}
              </span>
            </>
          )}
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Curr:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-white text-slate-800 border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-emerald-600 cursor-pointer font-medium"
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Record Saver Deposit"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>

          <button
            onClick={onOpenWithdrawalModal}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Request Member Withdrawal"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>

          {userRole === 'admin' ? (
            <>
              <button
                onClick={onOpenNewMemberModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Register New Saver"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Add Saver</span>
              </button>

              <button
                onClick={onOpenNewBankerModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer hidden lg:flex"
                title="Add Field Collector"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                <span>Add Banker</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenNewMemberModal}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Register New Saver on Route"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Saver</span>
            </button>
          )}

          {/* User Profile & Logout */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200 ml-1">
            <div className="hidden sm:flex flex-col text-right px-1">
              <span className="text-xs font-bold text-slate-800 leading-none">{currentUser?.name}</span>
              <span className="text-[10px] text-slate-500 font-medium">{userRole === 'admin' ? 'Super Admin' : 'Field Banker'}</span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
