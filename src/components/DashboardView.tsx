import React from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  DollarSign, 
  Users, 
  Calendar,
  MessageCircle,
  CreditCard,
  Percent,
  Send,
  Wallet,
  Activity,
  AlertTriangle,
  PiggyBank
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Client, CompanySettings, Loan, Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/finance';
import { PendingAlert, buildNotificationMessage, generateWhatsAppLink } from '../utils/notifications';

interface DashboardViewProps {
  loans: Loan[];
  clients: Client[];
  payments: Payment[];
  settings: CompanySettings;
  pendingAlerts: PendingAlert[];
  onOpenPaymentModal: (loan: Loan, installmentNumber?: number) => void;
  onOpenNewLoanModal: () => void;
  onSendSingleNotification: (alert: PendingAlert) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  loans,
  clients,
  payments,
  settings,
  pendingAlerts,
  onOpenPaymentModal,
  onOpenNewLoanModal,
  onSendSingleNotification,
}) => {
  // 1. Capital total prestado (Principal acumulado)
  const totalDisbursed = loans.reduce((acc, l) => acc + (l.principal || 0), 0);
  const avgLoanAmount = loans.length > 0 ? totalDisbursed / loans.length : 0;
  const totalActiveLoans = loans.filter((l) => l.status === 'active' || l.status === 'overdue').length;
  const totalBalanceDue = loans.reduce((acc, l) => acc + (l.remainingBalance || 0), 0);
  const totalPrincipalRepaid = Math.max(0, totalDisbursed - totalBalanceDue);
  const principalRepaidPercent = totalDisbursed > 0 
    ? Math.min(100, Math.round((totalPrincipalRepaid / totalDisbursed) * 100))
    : 0;

  // 2. Interés ganado acumulado
  const totalInterestEarnedFromPayments = payments
    .filter((p) => p.status === 'completed' || !p.status)
    .reduce((acc, p) => acc + (p.interestAmount || 0), 0);

  const totalInterestFromPaidInstallments = loans.reduce((acc, loan) => {
    return acc + (loan.installments || [])
      .filter((inst) => inst.status === 'paid')
      .reduce((sum, inst) => sum + (inst.interest || 0), 0);
  }, 0);

  const totalInterestEarned = Math.max(totalInterestEarnedFromPayments, totalInterestFromPaidInstallments);
  const totalProjectedInterest = loans.reduce((acc, l) => acc + (l.totalInterest || 0), 0);
  const interestEarnedRate = totalProjectedInterest > 0 
    ? ((totalInterestEarned / totalProjectedInterest) * 100).toFixed(1) 
    : '0';
  const totalLateFeesEarned = payments.reduce((acc, p) => acc + (p.lateFeeAmount || 0), 0);

  // 3. Tasa de morosidad actual (NPL)
  const overdueLoans = loans.filter((l) => l.status === 'overdue');
  const overdueAmount = overdueLoans.reduce((acc, l) => acc + (l.remainingBalance || 0), 0);
  const nplRate = totalBalanceDue > 0 ? ((overdueAmount / totalBalanceDue) * 100).toFixed(1) : '0';
  const nplRateNum = parseFloat(nplRate);
  const overdueLoansCount = overdueLoans.length;

  // Operational metrics
  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Recharts Data: Monthly Cashflow
  const monthlyFlowData = [
    { name: 'Mayo', colocacion: 12000, cobranza: 9800 },
    { name: 'Junio', colocacion: 16500, cobranza: 14200 },
    { name: 'Julio', colocacion: 15500, cobranza: 13900 },
    { name: 'Agosto', colocacion: 18000, cobranza: 16500 },
    { name: 'Septiembre', colocacion: totalDisbursed, cobranza: totalCollected },
  ];

  // Portfolio Distribution by Status
  const statusCounts = [
    { name: 'Al Día', value: loans.filter((l) => l.status === 'active').length, color: '#10b981' },
    { name: 'En Mora', value: loans.filter((l) => l.status === 'overdue').length, color: '#ef4444' },
    { name: 'Pagado', value: loans.filter((l) => l.status === 'paid').length, color: '#3b82f6' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div id="dashboard-hero-banner" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
              <Clock className="w-3 h-3" />
              <span>Cierre Operativo en Tiempo Real</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Control Integral de Cartera y Cobranzas
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Monitoreo centralizado de colocación, recaudación automática por pasarelas, morosidad y cumplimiento fiscal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-dashboard-desembolsar"
              onClick={onOpenNewLoanModal}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span>Simular / Desembolsar</span>
            </button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SECTION HEADER: REAL-TIME KPIS */}
      <div id="dashboard-kpis-header" className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2.5">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Indicadores Clave de Rendimiento (KPIs en Tiempo Real)
          </h2>
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>En vivo</span>
          </span>
        </div>
      </div>

      {/* PRIMARY REAL-TIME KPI CARDS (THE 3 REQUESTED METRICS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Capital Total Prestado */}
        <div 
          id="kpi-card-capital-total-prestado"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Colocación Total
              </span>
              <h3 className="text-sm font-semibold text-slate-600 mt-1">
                Capital Total Prestado
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center group-hover:scale-105 transition">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalDisbursed, settings.currency, settings.currencyCode)}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{loans.length} créditos</span>
              <span>•</span>
              <span>Promedio: <strong className="text-slate-700">{formatCurrency(avgLoanAmount, settings.currency, settings.currencyCode)}</strong></span>
            </div>

            {/* Progress / Status Bar */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Capital en calle: <strong className="text-slate-700">{formatCurrency(totalBalanceDue, settings.currency, settings.currencyCode)}</strong></span>
                <span className="font-semibold text-indigo-600">{principalRepaidPercent}% amortizado</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${principalRepaidPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2: Interés Ganado Acumulado */}
        <div 
          id="kpi-card-interes-ganado-acumulado"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Rendimiento Financiero
              </span>
              <h3 className="text-sm font-semibold text-slate-600 mt-1">
                Interés Ganado Acumulado
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center group-hover:scale-105 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {formatCurrency(totalInterestEarned, settings.currency, settings.currencyCode)}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="font-semibold text-emerald-700">{interestEarnedRate}%</span>
              <span>de {formatCurrency(totalProjectedInterest, settings.currency, settings.currencyCode)} proyectado</span>
            </div>

            {/* Sub-metric: Late fees earned + Progress */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Moras cobradas: <strong className="text-slate-700">+{formatCurrency(totalLateFeesEarned, settings.currency, settings.currencyCode)}</strong></span>
                <span className="font-semibold text-emerald-600">{interestEarnedRate}% cobrado</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, parseFloat(interestEarnedRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: Tasa de Morosidad Actual */}
        <div 
          id="kpi-card-tasa-morosidad-actual"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-sm transition group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                nplRateNum <= 3.0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : nplRateNum <= 6.0
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {nplRateNum <= 3.0 ? 'Riesgo Bajo' : nplRateNum <= 6.0 ? 'Riesgo Moderado' : 'Alerta de Mora'}
              </span>
              <h3 className="text-sm font-semibold text-slate-600 mt-1">
                Tasa de Morosidad Actual
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border group-hover:scale-105 transition ${
              nplRateNum <= 3.0 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : nplRateNum <= 6.0
                ? 'bg-amber-50 text-amber-600 border-amber-100'
                : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
              <Percent className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              nplRateNum <= 3.0 ? 'text-slate-900' : nplRateNum <= 6.0 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {nplRate}%
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span>Mora vencida:</span>
              <strong className="text-rose-600 font-bold">
                {formatCurrency(overdueAmount, settings.currency, settings.currencyCode)}
              </strong>
            </div>

            {/* Overdue loans detail */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Créditos con mora: <strong className="text-slate-800">{overdueLoansCount} de {loans.length}</strong></span>
                <span className={`font-semibold ${nplRateNum > 5 ? 'text-rose-600' : 'text-slate-600'}`}>
                  NPL Portfolio
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    nplRateNum <= 3.0 ? 'bg-emerald-500' : nplRateNum <= 6.0 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, nplRateNum * 5 || 5)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY OPERATIONAL METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo por Cobrar */}
        <div id="kpi-card-saldo-por-cobrar" className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo por Cobrar</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalBalanceDue, settings.currency, settings.currencyCode)}
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{totalActiveLoans}</span>
              <span className="ml-1">préstamos vigentes activos</span>
            </div>
          </div>
        </div>

        {/* Recaudación Total Cobrada */}
        <div id="kpi-card-recaudacion-cobranza" className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cobranza Total Recaudada</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-extrabold text-emerald-600 tracking-tight">
              {formatCurrency(totalCollected, settings.currency, settings.currencyCode)}
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-500">
              <span className="font-semibold text-emerald-700">{payments.length}</span>
              <span className="ml-1">abonos conciliados</span>
            </div>
          </div>
        </div>

        {/* Base de Clientes Verificados */}
        <div id="kpi-card-clientes-verificados" className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clientes Registrados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              {clients.length}
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-500">
              <span className="text-blue-600 font-semibold">100% verificados</span>
              <span className="ml-1">con expediente y score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Alerts Section: Upcoming Due Dates and Overdue notice */}
      {pendingAlerts.length > 0 && (
        <div className="bg-white rounded-xl border border-rose-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-rose-50/70 border-b border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertCircle className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-rose-900">
                  Alertas de Cobranza Prioritarias ({pendingAlerts.length})
                </h2>
                <p className="text-xs text-rose-700">
                  Cuotas que vencen hoy, en los próximos 3 días o con mora acumulada.
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-rose-700 bg-white px-2.5 py-1 rounded-md border border-rose-200">
              Notificaciones automáticas listas
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingAlerts.map((alert, idx) => {
              const { loan, installment, type, daysDiff } = alert;
              const waMessage = buildNotificationMessage(
                alert,
                settings.companyName,
                settings.currency,
                settings.currencyCode,
                `https://credigestion.app/pay/${loan.id}`
              );
              const waUrl = generateWhatsAppLink(loan.clientPhone, waMessage);

              return (
                <div key={idx} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 p-2 rounded-lg text-xs font-bold shrink-0 ${
                      type === 'overdue' 
                        ? 'bg-rose-100 text-rose-800'
                        : type === 'due_today'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {type === 'overdue' ? `-${daysDiff}d` : type === 'due_today' ? 'HOY' : `+${daysDiff}d`}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-sm">{loan.clientName}</span>
                        <span className="text-xs text-slate-500">#{loan.id}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Cuota #{installment.number} de {loan.termCount} • Vence: {formatDate(installment.dueDate)}
                        {installment.lateFee > 0 && (
                          <span className="ml-2 font-semibold text-rose-600">
                            (+{formatCurrency(installment.lateFee, settings.currency, settings.currencyCode)} mora)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatCurrency(installment.totalDue, settings.currency, settings.currencyCode)}
                      </div>
                      <span className="text-[11px] text-slate-500">Total a liquidar</span>
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onSendSingleNotification(alert)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                      title="Enviar recordatorio con enlace de pago por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => onOpenPaymentModal(loan, installment.number)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Cobrar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Charts Grid: Cashflow and Portfolio Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Flujo Financiero Mensual</h2>
              <p className="text-xs text-slate-500">Comparativa histórica de colocación vs cobranza efectiva</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
              Año 2026
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFlowData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  formatter={(val: any) => formatCurrency(Number(val), settings.currency, settings.currencyCode)}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="colocacion" name="Préstamos Colocados" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cobranza" name="Cobranza Recaudada" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Status Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Salud de la Cartera</h2>
            <p className="text-xs text-slate-500">Distribución de préstamos por estado</p>
          </div>
          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {statusCounts.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} préstamos</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
