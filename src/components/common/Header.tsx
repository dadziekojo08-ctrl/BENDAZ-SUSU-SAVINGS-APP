import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  Wallet,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  UserPlus,
  PlusCircle,
  PiggyBank,
  Clock,
  Radio,
  LogOut,
  User,
  ChevronDown,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { CurrencyCode, UserRole } from '../../types';
import { AppLogo } from './AppLogo';

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
    setUserRole,
    logout,
    bankers,
    activeBankerId,
    setActiveBankerId,
    currency,
    setCurrency,
    formatMoney,
    totalCollectedToday,
    pendingWithdrawalsCount,
    totalOfficeRevenue,
    resetToDemoData,
    clearAllData,
  } = useSusu();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleBankerSwitch = (bId: string) => {
    setActiveBankerId(bId);
    if (userRole === 'banker') {
      setUserRole('banker');
    }
  };

  const handleExecuteClear = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  const handleExecuteReset = () => {
    resetToDemoData();
    setShowResetConfirm(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#383B2B] border-b border-[#2C2E22] text-[#EAE7DC] shadow-lg">
        {/* Top Banner / Live Ticker */}
        <div className="bg-[#2C2E22] px-4 py-1.5 text-xs text-[#D8D5C8] flex flex-wrap items-center justify-between gap-2 border-b border-[#383B2B]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-[#8E9775]">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#8E9775]" />
              BENDAZ SUSU ACTIVE • DAILY RECORDING ACTIVE
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

            {/* Clear All Dummy Data Button */}
            <button
              onClick={() => setShowClearConfirm(true)}
              title="Clear all mock/dummy members and transaction history"
              className="text-[#D4A359] hover:text-[#F3C77D] flex items-center gap-1 text-[11px] hover:underline cursor-pointer font-medium"
            >
              <Trash2 className="w-3 h-3 text-[#D4A359]" />
              <span className="hidden sm:inline">Clear Dummy Data</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              title="Restore sample demo data for testing"
              className="text-[#B8B5A8] hover:text-white flex items-center gap-1 text-[11px] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppLogo size="md" />
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

      {/* Confirmation Modal: Clear Dummy Data */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D8D5C8] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif-brand font-bold text-xl text-[#3A3D2C]">
                Clear All Dummy Details?
              </h3>
              <p className="text-xs text-[#7A7A65] leading-relaxed">
                This will wipe out all sample example members, transaction records, and collection balances so you can start clean with live field entries.
              </p>
            </div>

            <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EAE7DC] text-xs text-[#5A5E46] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#8E9775]" />
                <span>What will happen:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[#7A7A65] pl-1">
                <li>Members list will be emptied (ready for New Savers).</li>
                <li>All deposit & withdrawal transaction histories will clear to 0.</li>
                <li>Banker accounts will remain registered with clean $0 balances.</li>
                <li>You can restore sample data at any time via "Reset Demo".</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#D8D5C8] hover:bg-[#F9F8F4] text-[#6A6A55] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteClear}
                className="flex-1 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Yes, Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset Demo Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D8D5C8] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif-brand font-bold text-xl text-[#3A3D2C]">
                Reset Demo Data?
              </h3>
              <p className="text-xs text-[#7A7A65] leading-relaxed">
                This will repopulate the database with sample market women, active 31-day passbooks, pending withdrawal requests, and field banker logs.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#D8D5C8] hover:bg-[#F9F8F4] text-[#6A6A55] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#4A4D3A] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Restore Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
