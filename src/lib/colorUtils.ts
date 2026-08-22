// Colorful theme utilities for Bendaz Susu App

export interface AvatarColor {
  bg: string;
  text: string;
  gradient: string;
  border: string;
  lightBg: string;
}

const AVATAR_PALETTES: AvatarColor[] = [
  {
    bg: 'bg-emerald-600',
    text: 'text-emerald-700',
    gradient: 'from-emerald-500 to-teal-700',
    border: 'border-emerald-200',
    lightBg: 'bg-emerald-50',
  },
  {
    bg: 'bg-indigo-600',
    text: 'text-indigo-700',
    gradient: 'from-indigo-500 to-blue-700',
    border: 'border-indigo-200',
    lightBg: 'bg-indigo-50',
  },
  {
    bg: 'bg-amber-600',
    text: 'text-amber-800',
    gradient: 'from-amber-400 to-orange-600',
    border: 'border-amber-200',
    lightBg: 'bg-amber-50',
  },
  {
    bg: 'bg-purple-600',
    text: 'text-purple-700',
    gradient: 'from-purple-500 to-indigo-700',
    border: 'border-purple-200',
    lightBg: 'bg-purple-50',
  },
  {
    bg: 'bg-rose-600',
    text: 'text-rose-700',
    gradient: 'from-rose-500 to-pink-600',
    border: 'border-rose-200',
    lightBg: 'bg-rose-50',
  },
  {
    bg: 'bg-cyan-600',
    text: 'text-cyan-800',
    gradient: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-200',
    lightBg: 'bg-cyan-50',
  },
  {
    bg: 'bg-teal-600',
    text: 'text-teal-800',
    gradient: 'from-teal-400 to-emerald-600',
    border: 'border-teal-200',
    lightBg: 'bg-teal-50',
  },
  {
    bg: 'bg-violet-600',
    text: 'text-violet-700',
    gradient: 'from-violet-500 to-purple-700',
    border: 'border-violet-200',
    lightBg: 'bg-violet-50',
  },
];

export function getAvatarColor(seed: string): AvatarColor {
  if (!seed) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export function getPaymentMethodBadge(method: string): { label: string; badgeClass: string; iconClass: string } {
  switch (method) {
    case 'MTN_MOMO':
      return {
        label: 'MTN MoMo',
        badgeClass: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
        iconClass: 'text-amber-600',
      };
    case 'TELECEL_CASH':
      return {
        label: 'Telecel Cash',
        badgeClass: 'bg-rose-100 text-rose-950 border border-rose-300 font-bold',
        iconClass: 'text-rose-600',
      };
    case 'AIRTELTIGO':
      return {
        label: 'AirtelTigo',
        badgeClass: 'bg-blue-100 text-blue-950 border border-blue-300 font-bold',
        iconClass: 'text-blue-600',
      };
    case 'BANK_TRANSFER':
      return {
        label: 'Bank Transfer',
        badgeClass: 'bg-purple-100 text-purple-950 border border-purple-300 font-bold',
        iconClass: 'text-purple-600',
      };
    case 'CASH':
    default:
      return {
        label: 'Cash (Physical)',
        badgeClass: 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold',
        iconClass: 'text-emerald-600',
      };
  }
}
