import React, { useState, useMemo } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  X,
  User,
  Phone,
  Store,
  Coins,
  CheckCircle2,
  AlertCircle,
  PiggyBank,
  Hash,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBankerId?: string;
}

export const CreateMemberModal: React.FC<CreateMemberModalProps> = ({
  isOpen,
  onClose,
  defaultBankerId,
}) => {
  const { addMember, bankers, routes, getCurrencySymbol, activeBankerId, members } = useSusu();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationStall, setLocationStall] = useState('');
  const [initialDeposit, setInitialDeposit] = useState(50);
  const [assignedBankerId, setAssignedBankerId] = useState(defaultBankerId || activeBankerId || bankers[0]?.id || '');
  const [routeId, setRouteId] = useState(routes[0]?.id || '');
  const [error, setError] = useState('');
  const [accountSeed, setAccountSeed] = useState(() => Math.floor(100000 + Math.random() * 900000));

  // Automatically generated Susu Account Number
  const generatedAccountNumber = useMemo(() => {
    return `SSU-${accountSeed}`;
  }, [accountSeed]);

  const handleRegenerateAccount = () => {
    setAccountSeed(Math.floor(100000 + Math.random() * 900000));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter saver / member name');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter contact phone number');
      return;
    }
    if (!locationStall.trim()) {
      setError('Please enter market stall or store location');
      return;
    }

    const banker = bankers.find((b) => b.id === assignedBankerId);
    const route = routes.find((r) => r.id === routeId);

    try {
      addMember({
        accountNumber: generatedAccountNumber,
        name: name.trim(),
        phone: phone.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
        assignedBankerId: assignedBankerId,
        assignedBankerName: banker?.name || 'Assigned Collector',
        routeId: routeId,
        routeName: route?.name || banker?.routeName || 'Market Route',
        locationStall: locationStall.trim(),
        dailyTarget: Number(initialDeposit) || 0,
        susuCycleDays: 31,
        initialDeposit: Number(initialDeposit) || 0,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-2xl max-w-lg w-full shadow-2xl border border-[#EAE7DC] overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#383B2B] px-6 py-4 text-white flex items-center justify-between border-b border-[#4A4D3A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#8E9775]/20 border border-[#8E9775]/40 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-[#8E9775]" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-[#F9F8F4]">Create Account</h2>
              <p className="text-xs text-[#D8D5C8]">Generate Susu account & issue 31-day passbook</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#C27D50]/15 border border-[#C27D50]/30 text-[#9A5025] text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C27D50] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Auto-Generated Susu Account Number Box */}
          <div className="bg-white p-3.5 rounded-xl border border-[#8E9775]/40 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#8E9775]/20 text-[#383B2B] flex items-center justify-center font-bold">
                <Hash className="w-4 h-4 text-[#5A5E46]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A65] flex items-center gap-1">
                  <span>Auto-Generated Susu Account #</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#8E9775]/25 text-[#383B2B] text-[9px] font-mono font-bold">
                    Official
                  </span>
                </span>
                <div className="text-base font-extrabold font-mono text-[#383B2B] tracking-wide">
                  {generatedAccountNumber}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRegenerateAccount}
              className="p-1.5 hover:bg-[#F4F1EA] rounded-lg text-[#7A7A65] hover:text-[#383B2B] transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Generate new account number"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Member Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Saver Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Auntie Comfort"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Mobile Number (SMS Receipt)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="+233 24 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
                />
              </div>
            </div>
          </div>

          {/* Stall Location */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Market Stall / Shop Location
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Stall C-18, Provisions Line, Makola"
                value={locationStall}
                onChange={(e) => setLocationStall(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              />
            </div>
          </div>

          {/* Initial Deposit */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Day 1 Initial Contribution ({getCurrencySymbol()})
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
              <input
                type="number"
                min="0"
                step="5"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-bold font-display focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              />
            </div>
            <p className="text-[11px] text-[#7A7A65] mt-1">
              *First daily contribution is retained for the Office per Susu standard rules. Subsequent deposits form the withdrawable savings balance.
            </p>
          </div>

          {/* Assigned Banker & Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Assigned Mobile Banker
              </label>
              <select
                value={assignedBankerId}
                onChange={(e) => setAssignedBankerId(e.target.value)}
                className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              >
                {bankers.length === 0 ? (
                  <option value="">No bankers available</option>
                ) : (
                  bankers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Route / Collection Line
              </label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              >
                <option value="">General Collection (No Route)</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.zone ? `(${r.zone})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EAE7DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D8D5C8] text-[#5A5A40] text-xs font-semibold hover:bg-[#EAE7DC]/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#8E9775] hover:bg-[#7D8665] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
