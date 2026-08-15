import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import {
  X,
  UserPlus,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CreateBankerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBankerModal: React.FC<CreateBankerModalProps> = ({ isOpen, onClose }) => {
  const { addBanker, routes } = useSusu();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [routeId, setRouteId] = useState(routes[0]?.id || 'RT-01');
  const [commissionRate, setCommissionRate] = useState(3.3);
  const [commissionModel, setCommissionModel] = useState<'ONE_DAY_CONTRIBUTION' | 'PERCENTAGE'>('ONE_DAY_CONTRIBUTION');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter the banker collector full name');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    const selectedRoute = routes.find((r) => r.id === routeId);

    try {
      addBanker({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@bendaz.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        routeId: routeId,
        routeName: selectedRoute?.name || 'General Market Route',
        zone: '',
        dailyTarget: 0,
        commissionRate: Number(commissionRate),
        commissionModel: commissionModel,
        notes: notes || 'Registered mobile banker collector',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create banker account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-2xl max-w-lg w-full shadow-2xl border border-[#EAE7DC] overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#383B2B] px-6 py-4 text-white flex items-center justify-between border-b border-[#4A4D3A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#8E9775]/20 border border-[#8E9775]/40 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#8E9775]" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-[#F9F8F4]">Create Banker Account</h2>
              <p className="text-xs text-[#D8D5C8]">Onboard mobile Susu collection agent & assign route</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#C27D50]/15 border border-[#C27D50]/30 text-[#9A5025] text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C27D50] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Personal Info */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Seth Mensah Tagoe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Phone Number (MoMo / WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="+233 24 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A8A70] absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="banker@bendaz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
                />
              </div>
            </div>
          </div>

          {/* Route Assignment & Commission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Assigned Route Line
              </label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Commission Structure
              </label>
              <select
                value={commissionModel}
                onChange={(e) => setCommissionModel(e.target.value as any)}
                className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              >
                <option value="ONE_DAY_CONTRIBUTION">1-Day Susu Card Fee (Standard)</option>
                <option value="PERCENTAGE">Fixed 3.3% Commission</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
              Field Collector Notes / Guarantor Info
            </label>
            <input
              type="text"
              placeholder="e.g. Assigned to Market Association Block C"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
            />
          </div>

          {/* Actions */}
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
              <span>Create Banker Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
