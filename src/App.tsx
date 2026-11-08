import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { LoansView } from './components/LoansView';
import { ClientsView } from './components/ClientsView';
import { PaymentsView } from './components/PaymentsView';
import { NotificationsView } from './components/NotificationsView';
import { InvoicingView } from './components/InvoicingView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { UsersView } from './components/UsersView';
import { LoanSimulator } from './components/LoanSimulator';
import { MobileAppView } from './components/mobile/MobileAppView';
import { AuthScreen } from './components/auth/AuthScreen';
import { LockScreen } from './components/auth/LockScreen';
import { useInactivityDetector } from './hooks/useInactivityDetector';

import { NewLoanModal } from './components/modals/NewLoanModal';
import { NewClientModal } from './components/modals/NewClientModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { InvoiceModal } from './components/modals/InvoiceModal';
import { MonthlyReportModal } from './components/modals/MonthlyReportModal';
import { UserModal } from './components/modals/UserModal';

import { 
  AmortizationType, 
  AppBackupData,
  Client, 
  CompanySettings, 
  ElectronicInvoice, 
  Loan, 
  LoanFrequency, 
  NotificationLog, 
  Payment, 
  PaymentMethod,
  SystemUser
} from './types';
import { Storage } from './utils/storage';
import { createElectronicInvoice } from './utils/invoicing';
import { 
  PendingAlert, 
  buildNotificationMessage, 
  createNotificationEntry, 
  scanUpcomingInstallmentAlerts 
} from './utils/notifications';

export default function App() {
  // Primary persistent state
  const [clients, setClients] = useState<Client[]>(() => Storage.getClients());
  const [loans, setLoans] = useState<Loan[]>(() => Storage.getLoans());
  const [payments, setPayments] = useState<Payment[]>(() => Storage.getPayments());
  const [invoices, setInvoices] = useState<ElectronicInvoice[]>(() => Storage.getInvoices());
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => Storage.getNotifications());
  const [settings, setSettings] = useState<CompanySettings>(() => Storage.getSettings());
  const [users, setUsers] = useState<SystemUser[]>(() => Storage.getUsers());

  // Current authenticated user (RBAC gate)
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => Storage.getCurrentUser());

  // Screen lock state (inactivity lock)
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(() => {
    return sessionStorage.getItem('credigestion_screen_locked') === 'true';
  });

  // Synchronize lock state with sessionStorage
  useEffect(() => {
    if (isScreenLocked) {
      sessionStorage.setItem('credigestion_screen_locked', 'true');
    } else {
      sessionStorage.removeItem('credigestion_screen_locked');
    }
  }, [isScreenLocked]);

  // Inactivity detector: Automatically lock the system after inactivity timeout
  const { resetTimer: resetInactivityTimer } = useInactivityDetector({
    enabled: Boolean(currentUser) && !isScreenLocked,
    timeoutMinutes: settings.inactivityTimeoutMinutes ?? 3,
    onTimeout: () => {
      setIsScreenLocked(true);
    },
  });

  // Navigation state
  const [currentView, setCurrentView] = useState<'admin' | 'mobile_app' | 'calculator'>('admin');
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Modals state
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isMonthlyReportModalOpen, setIsMonthlyReportModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<SystemUser | null>(null);

  // Selected item contexts
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Loan | null>(null);
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<number | undefined>(undefined);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Payment | null>(null);
  const [activeViewingInvoice, setActiveViewingInvoice] = useState<ElectronicInvoice | null>(null);
  const [preselectedClientForLoan, setPreselectedClientForLoan] = useState<Client | null>(null);
  const [initialSimulationData, setInitialSimulationData] = useState<{
    principal: number;
    interestRate: number;
    termCount: number;
    frequency: LoanFrequency;
    amortizationType: AmortizationType;
  } | null>(null);

  // Pending alerts scanner
  const pendingAlerts = scanUpcomingInstallmentAlerts(loans);

  // Synchronize state with storage
  useEffect(() => {
    Storage.saveClients(clients);
  }, [clients]);

  useEffect(() => {
    Storage.saveLoans(loans);
  }, [loans]);

  useEffect(() => {
    Storage.savePayments(payments);
  }, [payments]);

  useEffect(() => {
    Storage.saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    Storage.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    Storage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    Storage.saveUsers(users);
  }, [users]);

  // Enforce role-based access to tabs
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'cobrador') {
      const allowed = ['payments', 'clients', 'loans'];
      if (!allowed.includes(adminTab)) {
        setAdminTab('payments');
      }
    } else if (currentUser.role === 'supervisor') {
      const disallowed = ['invoicing', 'settings', 'users'];
      if (disallowed.includes(adminTab)) {
        setAdminTab('dashboard');
      }
    }
  }, [currentUser, adminTab]);

  // Authentication & User Management Actions
  const handleLogin = (user: SystemUser) => {
    const updatedUser: SystemUser = { ...user, lastLogin: new Date().toISOString() };
    setCurrentUser(updatedUser);
    Storage.saveCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    if (user.role === 'cobrador') {
      setAdminTab('payments');
    } else {
      setAdminTab('dashboard');
    }
  };

  const handleLogout = () => {
    setIsScreenLocked(false);
    sessionStorage.removeItem('credigestion_screen_locked');
    Storage.logoutUser();
    setCurrentUser(null);
  };

  const handleSwitchUser = () => {
    setIsScreenLocked(false);
    sessionStorage.removeItem('credigestion_screen_locked');
    Storage.logoutUser();
    setCurrentUser(null);
  };

  const handleLockScreen = () => {
    setIsScreenLocked(true);
  };

  const handleUnlockScreen = () => {
    setIsScreenLocked(false);
    resetInactivityTimer();
  };

  const handleSwitchAccountFromLock = () => {
    setIsScreenLocked(false);
    sessionStorage.removeItem('credigestion_screen_locked');
    Storage.logoutUser();
    setCurrentUser(null);
  };

  const handleSaveUser = (user: SystemUser) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev.map((u) => (u.id === user.id ? user : u));
      }
      return [user, ...prev];
    });

    if (currentUser && currentUser.id === user.id) {
      setCurrentUser(user);
      Storage.saveCurrentUser(user);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            status: u.status === 'active' ? 'inactive' : 'active',
          };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser && currentUser.id === userId) {
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Actions
  const handleCreateLoan = (newLoan: Loan) => {
    setLoans((prev) => [newLoan, ...prev]);
  };

  const handleCreateClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleProcessPayment = ({
    loan,
    installmentNumbers,
    amount,
    principalAmount,
    interestAmount,
    lateFeeAmount,
    paymentMethod,
    paymentReference,
    generateInvoice,
  }: {
    loan: Loan;
    installmentNumbers: number[];
    amount: number;
    principalAmount: number;
    interestAmount: number;
    lateFeeAmount: number;
    paymentMethod: PaymentMethod;
    paymentReference: string;
    generateInvoice: boolean;
  }) => {
    const paymentId = 'pay_' + Date.now().toString(36);
    const paidAt = new Date().toISOString();

    let createdInvoiceId: string | undefined = undefined;

    // 1. Process Electronic Invoice if requested
    if (generateInvoice) {
      const tempPayment: Payment = {
        id: paymentId,
        loanId: loan.id,
        clientId: loan.clientId,
        clientName: loan.clientName,
        installmentNumbers,
        amount,
        principalAmount,
        interestAmount,
        lateFeeAmount,
        paymentMethod,
        paymentReference,
        paidAt,
        status: 'completed',
      };
      const newInvoice = createElectronicInvoice(
        tempPayment,
        settings,
        loan.clientDocumentId,
        loan.clientEmail
      );
      createdInvoiceId = newInvoice.id;
      setInvoices((prev) => [newInvoice, ...prev]);
    }

    // 2. Register Payment
    const newPayment: Payment = {
      id: paymentId,
      loanId: loan.id,
      clientId: loan.clientId,
      clientName: loan.clientName,
      installmentNumbers,
      amount,
      principalAmount,
      interestAmount,
      lateFeeAmount,
      paymentMethod,
      paymentReference,
      paidAt,
      status: 'completed',
      invoiceId: createdInvoiceId,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // 3. Update Loan Installments and Balances
    setLoans((prevLoans) =>
      prevLoans.map((l) => {
        if (l.id !== loan.id) return l;

        const updatedInstallments = l.installments.map((inst) => {
          if (installmentNumbers.includes(inst.number)) {
            return {
              ...inst,
              status: 'paid' as const,
              paidAmount: inst.totalDue,
              remainingAmount: 0,
              paidDate: paidAt.split('T')[0],
              invoiceId: createdInvoiceId,
              paymentReference,
            };
          }
          return inst;
        });

        const allPaid = updatedInstallments.every((i) => i.status === 'paid');
        const hasOverdue = updatedInstallments.some((i) => i.status === 'overdue');
        const newStatus = allPaid ? 'paid' : hasOverdue ? 'overdue' : 'active';
        const newPaidAmount = l.paidAmount + amount;
        const newRemainingBalance = Math.max(0, Number((l.remainingBalance - amount).toFixed(2)));

        return {
          ...l,
          installments: updatedInstallments,
          paidAmount: Number(newPaidAmount.toFixed(2)),
          remainingBalance: newRemainingBalance,
          status: newStatus,
        };
      })
    );

    // 4. Log confirmation notification
    const receiptNotif: NotificationLog = {
      id: 'notif_' + Date.now().toString(36),
      loanId: loan.id,
      clientName: loan.clientName,
      clientPhone: loan.clientPhone,
      clientEmail: loan.clientEmail,
      type: 'payment_receipt',
      channel: paymentMethod === 'stripe_card' ? 'email' : 'whatsapp',
      message: `Comprobante de pago confirmado por ${amount}. Cuota #${installmentNumbers.join(', #')} liquidada con éxito.`,
      status: 'sent',
      timestamp: paidAt,
    };
    setNotifications((prev) => [receiptNotif, ...prev]);

    // 5. Open receipt modal for visual feedback
    setActiveReceiptPayment(newPayment);
    setIsReceiptModalOpen(true);
  };

  // Payment directly from mobile client app
  const handlePayFromMobileApp = (
    loan: Loan,
    installmentNumber: number,
    method: PaymentMethod
  ) => {
    const inst = loan.installments.find((i) => i.number === installmentNumber);
    if (!inst) return;

    handleProcessPayment({
      loan,
      installmentNumbers: [installmentNumber],
      amount: inst.totalDue,
      principalAmount: inst.principal,
      interestAmount: inst.interest,
      lateFeeAmount: inst.lateFee,
      paymentMethod: method,
      paymentReference: `MOB-${Date.now().toString(36).toUpperCase()}`,
      generateInvoice: true,
    });
  };

  // Mass notifications trigger
  const handleTriggerBatchNotifications = () => {
    const newLogs: NotificationLog[] = [];

    pendingAlerts.forEach((alert) => {
      const msg = buildNotificationMessage(
        alert,
        settings.companyName,
        settings.currency,
        settings.currencyCode,
        `https://credigestion.app/pay/${alert.loan.id}`
      );
      const entry = createNotificationEntry(
        alert.loan,
        alert.installment.number,
        alert.type === 'overdue' ? 'overdue_notice' : alert.type === 'due_today' ? 'reminder_due_today' : 'reminder_due_3days',
        'whatsapp',
        msg,
        `https://credigestion.app/pay/${alert.loan.id}`
      );
      newLogs.push(entry);
    });

    setNotifications((prev) => [...newLogs, ...prev]);
  };

  // Single notification
  const handleSendSingleNotification = (alert: PendingAlert) => {
    const msg = buildNotificationMessage(
      alert,
      settings.companyName,
      settings.currency,
      settings.currencyCode,
      `https://credigestion.app/pay/${alert.loan.id}`
    );
    const entry = createNotificationEntry(
      alert.loan,
      alert.installment.number,
      alert.type === 'overdue' ? 'overdue_notice' : alert.type === 'due_today' ? 'reminder_due_today' : 'reminder_due_3days',
      'whatsapp',
      msg,
      `https://credigestion.app/pay/${alert.loan.id}`
    );
    setNotifications((prev) => [entry, ...prev]);
  };

  const handleOpenPaymentForLoan = (loan?: Loan, installmentNumber?: number) => {
    setSelectedLoanForPayment(loan || null);
    setSelectedInstallmentNumber(installmentNumber);
    setIsPaymentModalOpen(true);
  };

  const handleViewInvoiceById = (invoiceId?: string) => {
    if (!invoiceId) return;
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      setActiveViewingInvoice(inv);
      setIsInvoiceModalOpen(true);
    }
  };

  const handleSelectClientForLoan = (client: Client) => {
    setPreselectedClientForLoan(client);
    setIsNewLoanModalOpen(true);
  };

  const handleProceedFromSimulator = (data: {
    principal: number;
    interestRate: number;
    termCount: number;
    frequency: LoanFrequency;
    amortizationType: AmortizationType;
  }) => {
    setInitialSimulationData(data);
    setIsNewLoanModalOpen(true);
  };

  const handleResetAllData = () => {
    Storage.resetAllData();
    setClients(Storage.getClients());
    setLoans(Storage.getLoans());
    setPayments(Storage.getPayments());
    setInvoices(Storage.getInvoices());
    setNotifications(Storage.getNotifications());
    setSettings(Storage.getSettings());
  };

  const handleRestoreBackup = (backup: AppBackupData) => {
    Storage.restoreAllData(backup);
    setClients(backup.data.clients);
    setLoans(backup.data.loans);
    setPayments(backup.data.payments);
    setInvoices(backup.data.invoices);
    setNotifications(backup.data.notifications);
    setSettings(backup.data.settings);
    if (backup.data.users && Array.isArray(backup.data.users)) {
      setUsers(backup.data.users);
    }
  };

  // Authentication Gate: Require user login before opening the application
  if (!currentUser) {
    return (
      <AuthScreen
        users={users}
        settings={settings}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navbar with Mode Switcher & User Profile */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        companySettings={settings}
        pendingAlertsCount={pendingAlerts.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onLockScreen={handleLockScreen}
        onOpenNewLoan={() => {
          setPreselectedClientForLoan(null);
          setInitialSimulationData(null);
          setIsNewLoanModalOpen(true);
        }}
        onOpenNewClient={() => setIsNewClientModalOpen(true)}
      />

      {/* Main View Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: ADMIN ERP */}
        {currentView === 'admin' && (
          <>
            {adminTab === 'dashboard' && (
              <DashboardView
                loans={loans}
                clients={clients}
                payments={payments}
                settings={settings}
                pendingAlerts={pendingAlerts}
                onOpenPaymentModal={handleOpenPaymentForLoan}
                onOpenNewLoanModal={() => setIsNewLoanModalOpen(true)}
                onSendSingleNotification={handleSendSingleNotification}
              />
            )}

            {adminTab === 'loans' && (
              <LoansView
                loans={loans}
                payments={payments}
                clients={clients}
                settings={settings}
                onOpenNewLoan={() => setIsNewLoanModalOpen(true)}
                onOpenPaymentModal={handleOpenPaymentForLoan}
                onViewInvoice={handleViewInvoiceById}
              />
            )}

            {adminTab === 'clients' && (
              <ClientsView
                clients={clients}
                loans={loans}
                settings={settings}
                onOpenNewClient={() => setIsNewClientModalOpen(true)}
                onSelectClientForLoan={handleSelectClientForLoan}
              />
            )}

            {adminTab === 'payments' && (
              <PaymentsView
                payments={payments}
                loans={loans}
                settings={settings}
                onOpenPaymentModal={handleOpenPaymentForLoan}
                onViewReceipt={(p) => {
                  setActiveReceiptPayment(p);
                  setIsReceiptModalOpen(true);
                }}
                onViewInvoice={handleViewInvoiceById}
              />
            )}

            {adminTab === 'notifications' && (
              <NotificationsView
                notifications={notifications}
                pendingAlerts={pendingAlerts}
                settings={settings}
                loans={loans}
                onTriggerBatchNotifications={handleTriggerBatchNotifications}
                onSendSingleNotification={handleSendSingleNotification}
              />
            )}

            {adminTab === 'invoicing' && (
              <InvoicingView
                invoices={invoices}
                settings={settings}
                onViewInvoice={(inv) => {
                  setActiveViewingInvoice(inv);
                  setIsInvoiceModalOpen(true);
                }}
              />
            )}

            {adminTab === 'reports' && (
              <ReportsView
                loans={loans}
                payments={payments}
                clients={clients}
                settings={settings}
                onOpenMonthlyReportModal={() => setIsMonthlyReportModalOpen(true)}
              />
            )}

            {adminTab === 'users' && (
              <UsersView
                users={users}
                currentUser={currentUser}
                onOpenNewUserModal={() => {
                  setUserToEdit(null);
                  setIsUserModalOpen(true);
                }}
                onEditUser={(u) => {
                  setUserToEdit(u);
                  setIsUserModalOpen(true);
                }}
                onToggleUserStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {adminTab === 'settings' && (
              <SettingsView
                settings={settings}
                onSaveSettings={setSettings}
                onResetData={handleResetAllData}
                clients={clients}
                loans={loans}
                payments={payments}
                invoices={invoices}
                notifications={notifications}
                onRestoreBackup={handleRestoreBackup}
                onManualLock={handleLockScreen}
              />
            )}
          </>
        )}

        {/* VIEW 2: CLIENT MOBILE APPLICATION */}
        {currentView === 'mobile_app' && (
          <MobileAppView
            clients={clients}
            loans={loans}
            payments={payments}
            invoices={invoices}
            settings={settings}
            onPayInstallment={handlePayFromMobileApp}
            onViewInvoice={handleViewInvoiceById}
          />
        )}

        {/* VIEW 3: QUICK LOAN SIMULATOR */}
        {currentView === 'calculator' && (
          <LoanSimulator
            settings={settings}
            onProceedToCreateLoan={handleProceedFromSimulator}
          />
        )}
      </main>

      {/* Global Modals */}
      <NewLoanModal
        isOpen={isNewLoanModalOpen}
        onClose={() => setIsNewLoanModalOpen(false)}
        clients={clients}
        settings={settings}
        preselectedClient={preselectedClientForLoan}
        initialSimulationData={initialSimulationData}
        onCreateLoan={handleCreateLoan}
      />

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        settings={settings}
        onCreateClient={handleCreateClient}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        loans={loans}
        settings={settings}
        preselectedLoan={selectedLoanForPayment}
        preselectedInstallmentNumber={selectedInstallmentNumber}
        onProcessPayment={handleProcessPayment}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={activeReceiptPayment}
        settings={settings}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={activeViewingInvoice}
        settings={settings}
      />

      <MonthlyReportModal
        isOpen={isMonthlyReportModalOpen}
        onClose={() => setIsMonthlyReportModalOpen(false)}
        loans={loans}
        payments={payments}
        clients={clients}
        settings={settings}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
        currentUserId={currentUser.id}
        onSaveUser={handleSaveUser}
      />

      {/* Inactivity Security Lock Screen */}
      {isScreenLocked && currentUser && (
        <LockScreen
          currentUser={currentUser}
          settings={settings}
          onUnlock={handleUnlockScreen}
          onSwitchAccount={handleSwitchAccountFromLock}
        />
      )}
    </div>
  );
}
