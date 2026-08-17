import React, { useState } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Banker } from '../../types';
import {
  X,
  UserCheck,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Shield,
  Activity,
} from 'lucide-react';

interface EditBankerModalProps {
  banker: Banker | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditBankerModal: React.FC<EditBankerModalProps> = ({ banker, isOpen, onClose }) => {
  const { updateBanker, routes, addAuditLog, currentUser } = useSusu();

  const [name, setName] = useState(banker?.name || '');
  const [username, setUsername] = useState(banker?.username || banker?.name?.toLowerCase().replace(/\s+/g, '.') || '');
  const [password, setPassword] = useState(banker?.password || '1234');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState(banker?.phone || '');
  const [email, setEmail] = useState(banker?.email || '');
  const [routeId, setRouteId] = useState(banker?.routeId || '');
  const [commissionRate, setCommissionRate] = useState(banker?.commissionRate || 3.3);
  const [commissionModel, setCommissionModel] = useState<'ONE_DAY_CONTRIBUTION' | 'PERCENTAGE' | 'FLAT_FEE'>(
    banker?.commissionModel || 'ONE_DAY_CONTRIBUTION'
  );
  const [status, setStatus] = useState<'active' | 'on_route' | 'reconciled' | 'inactive'>(
    banker?.status || 'active'
  );
  const [notes, setNotes] = useState(banker?.notes || '');
  const [error, setError] = useState('');

  // Update local state when banker changes
  React.useEffect(() => {
    if (banker) {
      setName(banker.name);
      setUsername(banker.username || banker.id.toLowerCase());
      setPassword(banker.password || '1234');
      setPhone(banker.phone);
      setEmail(banker.email);
      setRouteId(banker.routeId);
      setCommissionRate(banker.commissionRate || 3.3);
      setCommissionModel(banker.commissionModel || 'ONE_DAY_CONTRIBUTION');
      setStatus(banker.status);
      setNotes(banker.notes || '');
    }
  }, [banker]);

  if (!isOpen || !banker) return null;

  const handleGeneratePassword = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPassword(randomPin);
    setShowPassword(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter the banker collector full name');
      return;
    }
    if (!username.trim()) {
      setError('Please provide a unique username for the banker');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a login password or PIN');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    const selectedRoute = routes.find((r) => r.id === routeId);

    try {
      updateBanker(banker.id, {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim(),
        phone: phone.trim(),
        email: email.trim(),
        routeId: routeId,
        routeName: selectedRoute ? selectedRoute.name : routeId ? banker.routeName : 'General Collection',
        commissionRate: Number(commissionRate),
        commissionModel: commissionModel,
        status: status,
        notes: notes.trim(),
      });

      addAuditLog({
        action: 'BANKER_UPDATED',
        actorName: currentUser?.name || 'Administrator',
        actorRole: currentUser?.role || 'admin',
        targetType: 'banker',
        targetId: banker.id,
        targetName: name.trim(),
        description: `Banker profile & credentials updated for ${name.trim()} (Username: @${username.trim().toLowerCase()}).`,
        details: {
          bankerId: banker.id,
          username: username.trim().toLowerCase(),
          route: selectedRoute?.name || 'General Collection',
          status,
        },
        severity: 'info',
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update banker account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2B20]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F8F4] text-[#4A4A40] rounded-3xl max-w-lg w-full shadow-2xl border border-[#E3DFC9] overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#383B2B] px-6 py-4 text-white flex items-center justify-between border-b border-[#4A4D3A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#8E9775]/20 border border-[#8E9775]/40 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-[#8E9775]" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-lg text-[#F9F8F4]">Edit Banker & Credentials</h2>
              <p className="text-xs text-[#D8D5C8]">Manage {banker.name} ({banker.id})</p>
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

          {/* Credentials Section */}
          <div className="bg-[#EAE7DC]/40 p-3.5 rounded-2xl border border-[#D8D5C8] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#383B2B]">
                <KeyRound className="w-3.5 h-3.5 text-[#5A5E46]" />
                <span>Field Banker Login Credentials</span>
              </div>
              <span className="text-[10px] text-[#7A7A65] bg-white px-2 py-0.5 rounded-md border border-[#D8D5C8]">
                Terminal Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="text-[#8A8A70] absolute left-3 top-2 text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="seth.tagoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider">
                    Password / PIN
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[10px] text-[#5A5E46] hover:text-[#383B2B] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    Reset PIN
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#8A8A70] absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="e.g. 1234"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-9 py-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#383B2B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-[#8A8A70] hover:text-[#383B2B] p-0.5 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#7A7A65]">
              Banker can authenticate via username <strong>@{username || 'username'}</strong> or Banker ID <strong>{banker.id}</strong>.
            </p>
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

          {/* Route & Status */}
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
                <option value="">General Collection (No Route)</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.zone ? `(${r.zone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 bg-white border border-[#D8D5C8] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#8E9775] focus:outline-none text-[#4A4A40]"
              >
                <option value="active">Active (On Duty)</option>
                <option value="on_route">On Route Collecting</option>
                <option value="reconciled">Reconciled / Shift Closed</option>
                <option value="inactive">Inactive / Suspended</option>
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
              className="px-6 py-2.5 rounded-xl bg-[#5A5E46] hover:bg-[#484B37] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
