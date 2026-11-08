export type LoanFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type AmortizationType = 'french' | 'german' | 'fixed';
export type LoanStatus = 'active' | 'paid' | 'overdue' | 'in_default' | 'pending_approval';
export type InstallmentStatus = 'pending' | 'paid' | 'partial' | 'overdue';
export type PaymentMethod = 'stripe_card' | 'bank_transfer' | 'cash' | 'payment_link' | 'qr_instant';
export type NotificationChannel = 'whatsapp' | 'sms' | 'email';
export type NotificationType = 'reminder_due_3days' | 'reminder_due_today' | 'overdue_notice' | 'payment_receipt' | 'loan_approved';

export interface Client {
  id: string;
  name: string;
  documentId: string; // DNI, CURP, RUT, INE
  email: string;
  phone: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
  creditScore: number; // 300 - 850
  status: 'active' | 'blacklisted' | 'pending';
  registrationDate: string;
  notes?: string;
}

export interface Installment {
  number: number;
  dueDate: string;
  principal: number;
  interest: number;
  fee: number;
  totalDue: number;
  paidAmount: number;
  remainingAmount: number;
  status: InstallmentStatus;
  paidDate?: string;
  lateDays: number;
  lateFee: number;
  invoiceId?: string;
  paymentReference?: string;
}

export interface Loan {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientDocumentId: string;
  principal: number;
  interestRate: number; // Porcentaje según período o mensual
  termCount: number; // Número de cuotas
  frequency: LoanFrequency;
  amortizationType: AmortizationType;
  startDate: string;
  status: LoanStatus;
  totalInterest: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  lateFeeDailyRate: number; // % diario sobre cuota vencida
  installments: Installment[];
  disbursedDate?: string;
  purpose?: string;
}

export interface Payment {
  id: string;
  loanId: string;
  clientId: string;
  clientName: string;
  installmentNumbers: number[];
  amount: number;
  principalAmount: number;
  interestAmount: number;
  lateFeeAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paidAt: string;
  status: 'completed' | 'pending' | 'failed';
  gatewayFee?: number;
  invoiceId?: string;
  notes?: string;
}

export interface NotificationLog {
  id: string;
  loanId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  type: NotificationType;
  channel: NotificationChannel;
  message: string;
  status: 'sent' | 'scheduled' | 'failed';
  timestamp: string;
  paymentLink?: string;
}

export interface ElectronicInvoice {
  id: string;
  invoiceNumber: string; // ej. FAC-2026-0012
  fiscalUuid: string; // UUID simulado SAT/DIAN/SII
  loanId: string;
  paymentId: string;
  clientName: string;
  clientDocumentId: string;
  clientEmail: string;
  subtotal: number; // Base gravable de intereses y comisiones
  taxAmount: number; // IVA (ej. 16%)
  exemptAmount: number; // Capital no sujeto a IVA
  total: number;
  issuedAt: string;
  status: 'timbrado' | 'anulado';
  concept: string;
  paymentMethodDesc: string;
}

export interface CompanySettings {
  companyName: string;
  taxId: string; // RFC, CIF, RUC
  address: string;
  phone: string;
  email: string;
  currency: string; // '$' o 'USD', 'MXN', 'EUR', 'COP'
  currencyCode: string;
  defaultAnnualRate: number;
  defaultLateFeeRate: number; // % diario
  defaultAmortization: AmortizationType;
  fiscalRegime: string;
  stripeEnabled: boolean;
  stripePublishableKey: string;
  whatsappAutomationEnabled: boolean;
  emailAlertsEnabled: boolean;
  autoInvoicing: boolean;
  inactivityTimeoutMinutes?: number; // minutos de inactividad antes de bloquear (0 = desactivado)
}

export type UserRole = 'admin' | 'supervisor' | 'cobrador';

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  password?: string;
  phone?: string;
  branch?: string; // Sucursal / Zona de Cobro
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  avatarColor?: string;
}

export interface AppBackupSummary {
  clientsCount: number;
  loansCount: number;
  paymentsCount: number;
  invoicesCount: number;
  notificationsCount: number;
  usersCount?: number;
  activeLoansCount: number;
  overdueLoansCount: number;
  totalDisbursed: number;
  totalCollected: number;
  totalOutstandingBalance: number;
}

export interface AppBackupData {
  version: string;
  app: string;
  exportedAt: string;
  summary: AppBackupSummary;
  data: {
    clients: Client[];
    loans: Loan[];
    payments: Payment[];
    invoices: ElectronicInvoice[];
    notifications: NotificationLog[];
    settings: CompanySettings;
    users?: SystemUser[];
  };
}
