import React, { useState } from 'react';
import { SusuProvider, useSusu } from './context/SusuContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BankerPortal } from './components/banker/BankerPortal';
import { RecordDepositModal } from './components/modals/RecordDepositModal';
import { InitiateWithdrawalModal } from './components/modals/InitiateWithdrawalModal';
import { CreateBankerModal } from './components/modals/CreateBankerModal';
import { CreateMemberModal } from './components/modals/CreateMemberModal';
import { ReconciliationModal } from './components/modals/ReconciliationModal';
import { MemberDetailModal } from './components/modals/MemberDetailModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { Member } from './types';
import { PiggyBank, ShieldCheck, Heart } from 'lucide-react';

function AppContent() {
  const { currentUser, userRole, activeReceipt, setActiveReceipt } = useSusu();

  // Modal States
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositMemberId, setDepositMemberId] = useState<string | undefined>(undefined);

  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalMemberId, setWithdrawalMemberId] = useState<string | undefined>(undefined);

  const [newMemberModalOpen, setNewMemberModalOpen] = useState(false);
  const [newBankerModalOpen, setNewBankerModalOpen] = useState(false);

  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [reconcileBankerId, setReconcileBankerId] = useState<string | undefined>(undefined);

  const [selectedDetailMember, setSelectedDetailMember] = useState<Member | null>(null);

  // Helper openers
  const handleOpenDeposit = (memberId?: string) => {
    setDepositMemberId(memberId);
    setDepositModalOpen(true);
  };

  const handleOpenWithdrawal = (memberId?: string) => {
    setWithdrawalMemberId(memberId);
    setWithdrawalModalOpen(true);
  };

  const handleOpenReconcile = (bankerId?: string) => {
    setReconcileBankerId(bankerId);
    setReconcileModalOpen(true);
  };

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        onOpenDepositModal={() => handleOpenDeposit()}
        onOpenWithdrawalModal={() => handleOpenWithdrawal()}
        onOpenNewMemberModal={() => setNewMemberModalOpen(true)}
        onOpenNewBankerModal={() => setNewBankerModalOpen(true)}
      />

      {/* Main View Portals */}
      <main className="flex-1 pb-16">
        {userRole === 'admin' ? (
          <AdminDashboard
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdrawal={handleOpenWithdrawal}
            onOpenNewMember={() => setNewMemberModalOpen(true)}
            onOpenNewBanker={() => setNewBankerModalOpen(true)}
            onOpenReconcile={handleOpenReconcile}
            onSelectMember={(m) => setSelectedDetailMember(m)}
          />
        ) : (
          <BankerPortal
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdrawal={handleOpenWithdrawal}
            onOpenNewMember={() => setNewMemberModalOpen(true)}
            onOpenReconcile={handleOpenReconcile}
            onSelectMember={(m) => setSelectedDetailMember(m)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0F172A] border-t border-slate-800 text-slate-400 py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-xs">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif-brand font-bold text-white tracking-tight">
              BENDAZ SUSU APP
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-300">Ghana Daily Thrift & Field Banker Collection System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Secure Field Ledger & Central Office Controls
            </span>
            <span>•</span>
            <span>Admin: Bernard</span>
          </div>
        </div>
      </footer>

      {/* All Modal Dialogs */}
      <RecordDepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        initialMemberId={depositMemberId}
      />

      <InitiateWithdrawalModal
        isOpen={withdrawalModalOpen}
        onClose={() => setWithdrawalModalOpen(false)}
        initialMemberId={withdrawalMemberId}
      />

      <CreateBankerModal
        isOpen={newBankerModalOpen}
        onClose={() => setNewBankerModalOpen(false)}
      />

      <CreateMemberModal
        isOpen={newMemberModalOpen}
        onClose={() => setNewMemberModalOpen(false)}
      />

      <ReconciliationModal
        isOpen={reconcileModalOpen}
        onClose={() => setReconcileModalOpen(false)}
        bankerId={reconcileBankerId}
      />

      <MemberDetailModal
        member={selectedDetailMember}
        onClose={() => setSelectedDetailMember(null)}
        onOpenDeposit={handleOpenDeposit}
        onOpenWithdrawal={handleOpenWithdrawal}
      />

      <ReceiptModal
        transaction={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SusuProvider>
      <AppContent />
    </SusuProvider>
  );
}
