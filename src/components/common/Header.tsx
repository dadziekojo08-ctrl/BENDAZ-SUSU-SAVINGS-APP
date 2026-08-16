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
      <header className="sticky top-0 z-40 bg-[#383B2B] border-b border-[#2C2E22] text-[#EAE7DC] shadow-lg">
        {/* Top Banner / Live Ticker */}
        <div className="bg-[#2C2E22] px-4 py-1.5 text-xs text-[#D8D5C8] flex flex-wrap items-center justify-between gap-2 border-b border-[#383B2B]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-[#8E9775]">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#8E9775]" />
              BENDAZ SUSU LIVE • SUPABASE POSTGRESQL CONNECTED
            </span>
            <span className="hidden sm:inline text-[#525642]">|</span>
            <span className="hidden sm:inline text-[#D8D5C8]">
              Today's Collections: <strong className="text-[#8E9775] font-semibold">{formatMoney(totalCollectedToday)}</strong>
            </span>
            <span className="hidden md:inline text-[#525642]">|</span>
            <span className="hidden md:inline text-[#D8D5C8]">
              Office Day 1 Revenue: <strong className="text-[#D4A359] font-semibold">{formatMoney(totalOfficeRevenue)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {pendingWithdrawalsCount > 0 && (
              <span className="bg-[#C27D50]/25 text-[#EAE7DC] border border-[#C27D50]/40 px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C27D50]" />
                {pendingWithdrawalsCount} Pending Approval{pendingWithdrawalsCount > 1 ? 's' : ''}
              </span>
            )}

            <div className="flex items-center gap-1.5 text-[#C8C5B8] text-xs">
              <span>Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-[#383B2B] text-[#EAE7DC] border border-[#525642] rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-[#8E9775] cursor-pointer"
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
              <div className="w-10 h-10 rounded-2xl bg-[#2C2E22] border border-[#4A4D3A] flex items-center justify-center font-serif-brand font-bold text-xl text-[#EAE7DC] shadow-md">
                B
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-brand font-bold text-2xl tracking-tight text-[#F9F8F4]">
                    BENDAZ <span className="font-light text-[#8E9775]">SUSU</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8E9775]/25 text-[#EAE7DC] border border-[#8E9775]/40">
                    {userRole === 'admin' ? 'ADMIN HQ' : 'BANKER FIELD APP'}
                  </span>
                </div>
                <p className="text-xs text-[#C8C5B8] hidden sm:block">
                  Daily Micro-Savings & Field Banker Ledger System
                </p>
              </div>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Authenticated User Badge */}
            <div className="bg-[#2C2E22] px-3 py-1.5 rounded-2xl border border-[#4A4D3A] flex items-center gap-2.5">
              {currentUser?.role === 'admin' ? (
                <>
                  <div className="w-7 h-7 rounded-xl bg-[#383B2B] text-[#8E9775] flex items-center justify-center font-bold text-xs border border-[#525642]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F9F8F4] flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      <span className="text-[9px] uppercase tracking-wider bg-[#8E9775]/25 text-[#EAE7DC] border border-[#8E9775]/40 px-1.5 py-0.2 rounded font-mono">
                        ADMIN HQ
                      </span>
                    </div>
                    <div className="text-[10px] text-[#A8A598]">Central Back-Office</div>
                  </div>
                </>
              ) : (
                <>
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-xl object-cover border border-[#525642]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-[#8E9775] text-white flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-[#F9F8F4] flex items-center gap-1.5">
                      <span>{currentUser?.name}</span>
                      <span className="text-[9px] uppercase tracking-wider bg-[#8E9775]/25 text-[#EAE7DC] border border-[#8E9775]/40 px-1.5 py-0.2 rounded font-mono">
                        {currentUser?.bankerId || 'COLLECTOR'}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#A8A598]">Field Mobile App</div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDepositModal}
                className="bg-[#8E9775] hover:bg-[#7D8665] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Record Deposit</span>
              </button>

              <button
                onClick={onOpenWithdrawalModal}
                className="bg-[#C27D50] hover:bg-[#B06F45] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Initiate Payout</span>
              </button>

              {userRole === 'admin' && (
                <button
                  onClick={onOpenNewBankerModal}
                  className="bg-[#2C2E22] hover:bg-[#383B2B] text-[#EAE7DC] border border-[#4A4D3A] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#8E9775]" />
                  <span className="hidden sm:inline">Add Banker</span>
                </button>
              )}

              <button
                onClick={onOpenNewMemberModal}
                className="bg-[#2C2E22] hover:bg-[#383B2B] text-[#EAE7DC] border border-[#4A4D3A] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#8E9775]" />
                <span className="hidden sm:inline">New Saver</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log out to Switch Account"
                className="bg-[#2C2E22] hover:bg-[#B04545] text-[#D8D5C8] hover:text-white border border-[#4A4D3A] px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
