import { 
  Client, 
  CompanySettings, 
  ElectronicInvoice, 
  Loan, 
  NotificationLog, 
  Payment, 
  SystemUser 
} from '../types';
import { calculateAmortizationSchedule } from '../utils/finance';

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr_admin',
    name: 'Lic. Roberto Garza Valenzuela',
    username: 'admin',
    email: 'admin@credigestion.com',
    role: 'admin',
    password: 'admin',
    phone: '+52 55 9812 3401',
    branch: 'Sede Central Corporativa',
    status: 'active',
    createdAt: '2025-01-01',
    lastLogin: '2026-09-20T19:30:00Z',
    avatarColor: 'indigo',
  },
  {
    id: 'usr_supervisor',
    name: 'Ing. Carlos Santillán Prado',
    username: 'supervisor',
    email: 'supervisor@credigestion.com',
    role: 'supervisor',
    password: 'super',
    phone: '+52 55 4421 8892',
    branch: 'Zona Norte - Operaciones',
    status: 'active',
    createdAt: '2025-03-15',
    lastLogin: '2026-09-20T18:15:00Z',
    avatarColor: 'blue',
  },
  {
    id: 'usr_cobrador',
    name: 'Javier Morales Espinoza',
    username: 'cobrador',
    email: 'cobrador@credigestion.com',
    role: 'cobrador',
    password: 'cobro',
    phone: '+52 55 3319 7710',
    branch: 'Ruta Sur - Cobranza Domiciliaria',
    status: 'active',
    createdAt: '2025-06-01',
    lastLogin: '2026-09-20T17:45:00Z',
    avatarColor: 'emerald',
  },
];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'FinanzaGlobal Préstamos S.A. de C.V.',
  taxId: 'FGL-240101-9A3',
  address: 'Av. Reforma 450, Piso 12, Ciudad Financiera',
  phone: '+52 55 8421 9900',
  email: 'contacto@finanzaglobal.com',
  currency: '$',
  currencyCode: 'USD',
  defaultAnnualRate: 24,
  defaultLateFeeRate: 0.5,
  defaultAmortization: 'french',
  fiscalRegime: '601 - General de Ley Personas Morales',
  stripeEnabled: true,
  stripePublishableKey: 'pk_test_51MzSAMPLEKEYLoanPaymentGateway994829',
  whatsappAutomationEnabled: true,
  emailAlertsEnabled: true,
  autoInvoicing: true,
  inactivityTimeoutMinutes: 3,
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_01',
    name: 'Carlos Mendoza Silva',
    documentId: 'INE-382910482',
    email: 'carlos.mendoza@email.com',
    phone: '+525512345678',
    address: 'Calle Los Sauces 142, Col. Del Valle',
    occupation: 'Ingeniero de Software Senior',
    monthlyIncome: 3800,
    creditScore: 780,
    status: 'active',
    registrationDate: '2025-11-10',
    notes: 'Excelente historial de pago en préstamos anteriores.',
  },
  {
    id: 'cli_02',
    name: 'Mariana Valenzuela Ríos',
    documentId: 'INE-918237461',
    email: 'mariana.valenzuela@email.com',
    phone: '+525587654321',
    address: 'Blvd. Jacarandas 512, Fracc. Palmas',
    occupation: 'Empresaria / Comercio Textil',
    monthlyIncome: 2600,
    creditScore: 720,
    status: 'active',
    registrationDate: '2026-01-15',
    notes: 'Negocio propio con flujo constante de caja.',
  },
  {
    id: 'cli_03',
    name: 'Roberto Gómez Estrada',
    documentId: 'INE-481920381',
    email: 'roberto.gomez@email.com',
    phone: '+525565432198',
    address: 'Av. Insurgentes Sur 980, Benito Juárez',
    occupation: 'Contador Público Independiente',
    monthlyIncome: 1900,
    creditScore: 640,
    status: 'active',
    registrationDate: '2026-02-01',
    notes: 'Presentó retraso de 4 días en su última cuota.',
  },
  {
    id: 'cli_04',
    name: 'Sofía Navarro Morales',
    documentId: 'INE-129384756',
    email: 'sofia.navarro@email.com',
    phone: '+525534567890',
    address: 'Calle Primavera 23, Roma Norte',
    occupation: 'Diseñadora Gráfica Freelance',
    monthlyIncome: 1600,
    creditScore: 690,
    status: 'active',
    registrationDate: '2026-02-18',
    notes: 'Primer crédito con nosotros para adquisición de equipo.',
  },
];

export function getInitialLoans(): Loan[] {
  const schedule1 = calculateAmortizationSchedule(5000, 2.5, 6, 'monthly', 'french', '2026-07-15');
  schedule1.installments[0].status = 'paid';
  schedule1.installments[0].paidAmount = schedule1.installments[0].totalDue;
  schedule1.installments[0].remainingAmount = 0;
  schedule1.installments[0].paidDate = '2026-08-14';

  schedule1.installments[1].status = 'paid';
  schedule1.installments[1].paidAmount = schedule1.installments[1].totalDue;
  schedule1.installments[1].remainingAmount = 0;
  schedule1.installments[1].paidDate = '2026-09-13';
  schedule1.installments[2].dueDate = '2026-09-23';

  const loan1Paid = schedule1.installments[0].totalDue + schedule1.installments[1].totalDue;

  const loan1: Loan = {
    id: 'LON-2026-001',
    clientId: 'cli_01',
    clientName: 'Carlos Mendoza Silva',
    clientPhone: '+525512345678',
    clientEmail: 'carlos.mendoza@email.com',
    clientDocumentId: 'INE-382910482',
    principal: 5000,
    interestRate: 2.5,
    termCount: 6,
    frequency: 'monthly',
    amortizationType: 'french',
    startDate: '2026-07-15',
    status: 'active',
    totalInterest: schedule1.totalInterest,
    totalAmount: schedule1.totalAmount,
    paidAmount: Number(loan1Paid.toFixed(2)),
    remainingBalance: Number((schedule1.totalAmount - loan1Paid).toFixed(2)),
    lateFeeDailyRate: 0.5,
    installments: schedule1.installments,
    disbursedDate: '2026-07-15',
    purpose: 'Consolidación de deudas y mejoras en el hogar',
  };

  const schedule2 = calculateAmortizationSchedule(2500, 3.0, 4, 'monthly', 'french', '2026-07-01');
  schedule2.installments[0].status = 'paid';
  schedule2.installments[0].paidAmount = schedule2.installments[0].totalDue;
  schedule2.installments[0].remainingAmount = 0;
  schedule2.installments[0].paidDate = '2026-07-31';

  schedule2.installments[1].dueDate = '2026-09-15';
  schedule2.installments[1].status = 'overdue';
  schedule2.installments[1].lateDays = 5;
  const lateFee2 = Number((schedule2.installments[1].totalDue * 0.005 * 5).toFixed(2));
  schedule2.installments[1].lateFee = lateFee2;
  schedule2.installments[1].totalDue = Number((schedule2.installments[1].remainingAmount + lateFee2).toFixed(2));

  const loan2: Loan = {
    id: 'LON-2026-002',
    clientId: 'cli_03',
    clientName: 'Roberto Gómez Estrada',
    clientPhone: '+525565432198',
    clientEmail: 'roberto.gomez@email.com',
    clientDocumentId: 'INE-481920381',
    principal: 2500,
    interestRate: 3.0,
    termCount: 4,
    frequency: 'monthly',
    amortizationType: 'french',
    startDate: '2026-07-01',
    status: 'overdue',
    totalInterest: schedule2.totalInterest,
    totalAmount: schedule2.totalAmount + lateFee2,
    paidAmount: schedule2.installments[0].totalDue,
    remainingBalance: Number((schedule2.totalAmount + lateFee2 - schedule2.installments[0].totalDue).toFixed(2)),
    lateFeeDailyRate: 0.5,
    installments: schedule2.installments,
    disbursedDate: '2026-07-01',
    purpose: 'Capital de trabajo para despacho contable',
  };

  const schedule3 = calculateAmortizationSchedule(8000, 1.8, 8, 'biweekly', 'german', '2026-08-10');
  schedule3.installments[0].status = 'paid';
  schedule3.installments[0].paidAmount = schedule3.installments[0].totalDue;
  schedule3.installments[0].remainingAmount = 0;
  schedule3.installments[0].paidDate = '2026-08-25';

  schedule3.installments[1].status = 'paid';
  schedule3.installments[1].paidAmount = schedule3.installments[1].totalDue;
  schedule3.installments[1].remainingAmount = 0;
  schedule3.installments[1].paidDate = '2026-09-09';
  schedule3.installments[2].dueDate = '2026-09-20';

  const loan3Paid = schedule3.installments[0].totalDue + schedule3.installments[1].totalDue;

  const loan3: Loan = {
    id: 'LON-2026-003',
    clientId: 'cli_02',
    clientName: 'Mariana Valenzuela Ríos',
    clientPhone: '+525587654321',
    clientEmail: 'mariana.valenzuela@email.com',
    clientDocumentId: 'INE-918237461',
    principal: 8000,
    interestRate: 1.8,
    termCount: 8,
    frequency: 'biweekly',
    amortizationType: 'german',
    startDate: '2026-08-10',
    status: 'active',
    totalInterest: schedule3.totalInterest,
    totalAmount: schedule3.totalAmount,
    paidAmount: Number(loan3Paid.toFixed(2)),
    remainingBalance: Number((schedule3.totalAmount - loan3Paid).toFixed(2)),
    lateFeeDailyRate: 0.5,
    installments: schedule3.installments,
    disbursedDate: '2026-08-10',
    purpose: 'Inventario de temporada navideña y textiles',
  };

  return [loan1, loan2, loan3];
}

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_01',
    loanId: 'LON-2026-001',
    clientId: 'cli_01',
    clientName: 'Carlos Mendoza Silva',
    installmentNumbers: [1],
    amount: 907.59,
    principalAmount: 782.59,
    interestAmount: 125.00,
    lateFeeAmount: 0,
    paymentMethod: 'stripe_card',
    paymentReference: 'ch_3N8eB7LkdIwHuV1K0Zq',
    paidAt: '2026-08-14T14:30:00Z',
    status: 'completed',
    invoiceId: 'inv_01',
  },
  {
    id: 'pay_02',
    loanId: 'LON-2026-001',
    clientId: 'cli_01',
    clientName: 'Carlos Mendoza Silva',
    installmentNumbers: [2],
    amount: 907.59,
    principalAmount: 802.15,
    interestAmount: 105.44,
    lateFeeAmount: 0,
    paymentMethod: 'bank_transfer',
    paymentReference: 'SPEI-8492049182',
    paidAt: '2026-09-13T10:15:00Z',
    status: 'completed',
    invoiceId: 'inv_02',
  },
  {
    id: 'pay_03',
    loanId: 'LON-2026-003',
    clientId: 'cli_02',
    clientName: 'Mariana Valenzuela Ríos',
    installmentNumbers: [1],
    amount: 1144.00,
    principalAmount: 1000.00,
    interestAmount: 144.00,
    lateFeeAmount: 0,
    paymentMethod: 'payment_link',
    paymentReference: 'PLINK-99382-MVR',
    paidAt: '2026-08-25T17:45:00Z',
    status: 'completed',
    invoiceId: 'inv_03',
  },
];

export const INITIAL_INVOICES: ElectronicInvoice[] = [
  {
    id: 'inv_01',
    invoiceNumber: 'FE-2026-1042',
    fiscalUuid: 'E83F1A29-84BC-4E12-8921-938210492810',
    loanId: 'LON-2026-001',
    paymentId: 'pay_01',
    clientName: 'Carlos Mendoza Silva',
    clientDocumentId: 'INE-382910482',
    clientEmail: 'carlos.mendoza@email.com',
    subtotal: 107.76,
    taxAmount: 17.24,
    exemptAmount: 782.59,
    total: 907.59,
    issuedAt: '2026-08-14T14:31:00Z',
    status: 'timbrado',
    concept: 'Comprobante Fiscal Digital por Cuota #1 - Préstamo LON-2026-001',
    paymentMethodDesc: 'Tarjeta Bancaria (En Línea)',
  },
  {
    id: 'inv_02',
    invoiceNumber: 'FE-2026-1043',
    fiscalUuid: 'B912C841-47D1-4903-82F3-C34901847192',
    loanId: 'LON-2026-001',
    paymentId: 'pay_02',
    clientName: 'Carlos Mendoza Silva',
    clientDocumentId: 'INE-382910482',
    clientEmail: 'carlos.mendoza@email.com',
    subtotal: 90.90,
    taxAmount: 14.54,
    exemptAmount: 802.15,
    total: 907.59,
    issuedAt: '2026-09-13T10:16:00Z',
    status: 'timbrado',
    concept: 'Comprobante Fiscal Digital por Cuota #2 - Préstamo LON-2026-001',
    paymentMethodDesc: 'Transferencia Electrónica SPEI',
  },
  {
    id: 'inv_03',
    invoiceNumber: 'FE-2026-1044',
    fiscalUuid: '71A4901B-328C-49F1-8012-004928174829',
    loanId: 'LON-2026-003',
    paymentId: 'pay_03',
    clientName: 'Mariana Valenzuela Ríos',
    clientDocumentId: 'INE-918237461',
    clientEmail: 'mariana.valenzuela@email.com',
    subtotal: 124.14,
    taxAmount: 19.86,
    exemptAmount: 1000.00,
    total: 1144.00,
    issuedAt: '2026-08-25T17:46:00Z',
    status: 'timbrado',
    concept: 'Comprobante Fiscal Digital por Cuota #1 - Préstamo LON-2026-003',
    paymentMethodDesc: 'Pasarela Web Link',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif_01',
    loanId: 'LON-2026-001',
    clientName: 'Carlos Mendoza Silva',
    clientPhone: '+525512345678',
    clientEmail: 'carlos.mendoza@email.com',
    type: 'payment_receipt',
    channel: 'whatsapp',
    message: '¡Gracias por su pago de $907.59 para la cuota #2! Su recibo y factura digital han sido generados.',
    status: 'sent',
    timestamp: '2026-09-13T10:17:00Z',
  },
  {
    id: 'notif_02',
    loanId: 'LON-2026-002',
    clientName: 'Roberto Gómez Estrada',
    clientPhone: '+525565432198',
    clientEmail: 'roberto.gomez@email.com',
    type: 'overdue_notice',
    channel: 'whatsapp',
    message: 'AVISO DE COBRANZA: Estimado(a) Roberto Gómez Estrada, su cuota #2 presenta un atraso de 5 días. Por favor regularice su situación.',
    status: 'sent',
    timestamp: '2026-09-19T09:00:00Z',
  },
];

export function getFullSeedDatabase() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    clients: INITIAL_CLIENTS,
    loans: getInitialLoans(),
    payments: INITIAL_PAYMENTS,
    invoices: INITIAL_INVOICES,
    notifications: INITIAL_NOTIFICATIONS,
    settings: INITIAL_COMPANY_SETTINGS,
    users: INITIAL_USERS,
  };
}
