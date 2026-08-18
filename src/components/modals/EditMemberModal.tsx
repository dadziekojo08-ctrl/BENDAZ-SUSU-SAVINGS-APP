import React, { useState, useEffect } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Member } from '../../types';
import {
  X,
  User,
  Phone,
  Store,
  Coins,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Hash,
  RefreshCw,
  Target,
  Shield,
  Calendar,
  Save,
} from 'lucide-react';

interface EditMemberModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({ member, isOpen, onClose }) => {
  const { updateMember, bankers, routes, formatMoney, getCurrencySymbol } = useSusu();

  const [accountNumber, setAccountNumber] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationStall, setLocationStall] = useState('');
  const [dailyTarget, setDailyTarget] = useState(50);
  const [assignedBankerId, setAssignedBankerId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [susuCycleDays, setSusuCycleDays] = useState(31);
  const [status, setStatus] = useState<'active' | 'dormant' | 'cycle_ready'>('active');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setAccountNumber(member.accountNumber || member.id);
      setName(member.name || '');
      setPhone(member.phone || '');
      setLocationStall(member.locationStall || '');
      setDailyTarget(member.dailyTarget || 50);
      setAssignedBankerId(member.assignedBankerId || '');
      setRouteId(member.routeId || '');
      setSusuCycleDays(member.susuCycleDays || 31);
      setStatus(member.status || 'active');
      setGoalTitle(member.savingsGoal?.title || '');
      setGoalTarget(member.savingsGoal?.target || '');
      setError('');
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleRegenerateAccount = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setAccountNumber(`SSU-${randomNum}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter saver / member full name');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a contact phone number');
      return;
    }
    if (!locationStall.trim()) {
      setError('Please enter market stall or store location');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Account number cannot be blank');
      return;
    }
    if (dailyTarget <= 0) {
      setError('Daily contribution pledge must be greater than 0');
      return;
    }

    const selectedBanker = bankers.find((b) => b.id === assignedBankerId);
    const selectedRoute = routes.find((r) => r.id === routeId);

    setIsSubmitting(true);
    try {
      updateMember(member.id, {
        accountNumber: accountNumber.trim(),
        name: name.trim(),
        phone: phone.trim(),
        locationStall: locationStall.trim(),
        dailyTarget: Number(dailyTarget),
        assignedBankerId: assignedBankerId,
        assignedBankerName: selectedBanker ? selectedBanker.name : member.assignedBankerName,
        routeId: routeId,
        routeName: selectedRoute ? selectedRoute.name : selectedBanker?.routeName || member.routeName || 'General Collection',
        susuCycleDays: Number(susuCycleDays) || 31,
        status: status,
        savingsGoal: goalTitle.trim() && Number(goalTarget) > 0
          ? {
              title: goalTitle.trim(),
              target: Number(goalTarget),
              deadline: member.savingsGoal?.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            }
          : undefined,
      });

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to update account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-3xl max-w-xl w-full shadow-2xl border border-[#EAE7DC] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#383B2B] px-6 py-4.5 text-white flex items-center justify-between border-b border-[#4A4D3A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8E9775]/25 border border-[#8E9775]/40 flex items-center justify-center">
              <User className="w-5 h-5 text-[#8E9775]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-brand font-bold text-lg text-[#F9F8F4]">Edit Saver Account</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#8E9775]/30 text-[#EAE7DC]">
                  {member.id}
                </span>
              </div>
              <p className="text-xs text-[#D8D5C8]">Update personal profile, daily pledge, route & assigned banker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Balance & Stats Info Bar */}
        <div className="bg-[#EAE7DC]/70 px-6 py-2.5 border-b border-[#D8D5C8] flex flex-wrap items-center justify-between text-xs text-[#5A5A40] gap-2">
          <div>
            <span>Current Savings Balance: </span>
            <strong className="font-mono text-[#5A5E46] font-bold text-sm">
              {formatMoney(member.totalBalance)}
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <span>Passbook Progress: </span>
            <strong className="text-[#383B2B]">
              {member.currentCyclePaidDays}/{member.susuCycleDays} Days
            </strong>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-[#C27D50]/15 border border-[#C27D50]/30 text-[#9A5025] text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C27D50] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Number Box */}
          <div className="bg-white p-3.5 rounded-xl border border-[#8E9775]/40 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#8E9775]/20 text-[#383B2B] flex items-center justify-center font-bold">
                <Hash className="w-4 h-4 text-[#5A5E46]" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A65] block">
                  Susu Account Number
                </span>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="font-mono font-extrabold text-sm text-[#383B2B] bg-transparent border-b border-dashed border-[#8E9775] focus:outline-none focus:border-[#5A5E46] py-0.5 w-44"
                  placeholder="e.g. SSU-100234"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleRegenerateAccount}
              className="p-1.5 hover:bg-[#F4F1EA] rounded-lg text-[#7A7A65] hover:text-[#383B2B] transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Generate new account number"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Regenerate</span>
            </button>
          </div>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Saver Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B] font-semibold"
                  placeholder="e.g. Auntie Comfort Mensah"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B] font-mono"
                  placeholder="e.g. 024 123 4567"
                  required
                />
              </div>
            </div>
          </div>

          {/* Market Location & Account Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Market Stall / Location *
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
                <input
                  type="text"
                  value={locationStall}
                  onChange={(e) => setLocationStall(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
                  placeholder="e.g. Kejetia Market Block B, Stall 42"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B] font-semibold cursor-pointer"
              >
                <option value="active">Active (Collecting Daily)</option>
                <option value="dormant">Dormant / Inactive</option>
                <option value="cycle_ready">Cycle Ready (Payout Eligible)</option>
              </select>
            </div>
          </div>

          {/* Assigned Mobile Banker & Collection Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Assigned Mobile Banker
              </label>
              <select
                value={assignedBankerId}
                onChange={(e) => setAssignedBankerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B] font-semibold cursor-pointer"
              >
                <option value="">-- Select Field Banker --</option>
                {bankers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.routeName || b.zone || 'Field Agent'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Market Zone / Route
              </label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B] font-semibold cursor-pointer"
              >
                <option value="">-- Select Market Route --</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.zone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Daily Contribution Pledge & Cycle Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Daily Pledge Target ({getCurrencySymbol()}) *
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-mono font-bold text-[#383B2B] focus:ring-2 focus:ring-[#8E9775] focus:outline-none"
                  required
                />
              </div>
              <p className="text-[10px] text-[#7A7A65] mt-1">
                Standard Susu daily contribution amount for passbook stamps.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Cycle Duration (Days)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
                <input
                  type="number"
                  min="10"
                  max="365"
                  value={susuCycleDays}
                  onChange={(e) => setSusuCycleDays(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-mono font-bold text-[#383B2B] focus:ring-2 focus:ring-[#8E9775] focus:outline-none"
                  required
                />
              </div>
              <p className="text-[10px] text-[#7A7A65] mt-1">
                Standard Susu cycle is 31 days per passbook card.
              </p>
            </div>
          </div>

          {/* Optional Savings Goal */}
          <div className="p-3.5 bg-white rounded-xl border border-[#EAE7DC] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A5E46]">
              <Target className="w-4 h-4 text-[#8E9775]" />
              <span>Savings Goal / Target (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Goal Title (e.g. Christmas Shop Stock)"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="px-3 py-1.5 bg-[#F9F8F4] border border-[#D8D5C8] rounded-lg text-xs focus:ring-1 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
              />
              <input
                type="number"
                placeholder={`Target Amount (${getCurrencySymbol()})`}
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value === '' ? '' : Number(e.target.value))}
                className="px-3 py-1.5 bg-[#F9F8F4] border border-[#D8D5C8] rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE7DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#7A7A65] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#8E9775] hover:bg-[#7A8362] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Account Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
