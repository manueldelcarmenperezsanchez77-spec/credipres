import React, { useState } from 'react';
import { 
  Smartphone, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  MessageCircle, 
  FileText, 
  ChevronRight, 
  QrCode, 
  Building, 
  Maximize2, 
  Minimize2,
  ShieldCheck,
  User,
  History,
  X
} from 'lucide-react';
import { Client, CompanySettings, ElectronicInvoice, Installment, Loan, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/finance';

interface MobileAppViewProps {
  clients: Client[];
  loans: Loan[];
  payments: Payment[];
  invoices: ElectronicInvoice[];
  settings: CompanySettings;
  onPayInstallment: (loan: Loan, installmentNumber: number, method: Payment['paymentMethod']) => void;
  onViewInvoice: (invoiceId: string) => void;
}

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  clients,
  loans,
  payments,
  invoices,
  settings,
  onPayInstallment,
  onViewInvoice,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [isDeviceFrame, setIsDeviceFrame] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'history'>('home');
  const [payingInstallment, setPayingInstallment] = useState<{ loan: Loan; installment: Installment } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Payment['paymentMethod']>('stripe_card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Current client
  const client = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientLoans = loans.filter((l) => l.clientId === client?.id);
  const activeLoan = clientLoans.find((l) => l.status === 'active' || l.status === 'overdue') || clientLoans[0];
  const clientPayments = payments.filter((p) => p.clientId === client?.id);

  // Next unpaid installment
  const nextInstallment = activeLoan?.installments.find((i) => i.status !== 'paid');

  const handleExecutePayment = () => {
    if (!payingInstallment) return;
    setPaymentProcessing(true);

    setTimeout(() => {
      onPayInstallment(payingInstallment.loan, payingInstallment.installment.number, selectedPaymentMethod);
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setPayingInstallment(null);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Device Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Aplicación Móvil para Clientes (Portal de Autoservicio)
            </h2>
            <p className="text-xs text-slate-500">
              Experiencia del usuario final para consultar saldo, revisar cuotas y pagar en línea desde cualquier dispositivo.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Client switch */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">Simular como:</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.documentId})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Device Frame */}
          <button
            onClick={() => setIsDeviceFrame(!isDeviceFrame)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            {isDeviceFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isDeviceFrame ? 'Ver Pantalla Completa' : 'Ver Marco Móvil'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className={`mx-auto transition-all ${isDeviceFrame ? 'max-w-sm' : 'max-w-2xl'}`}>
        {/* Device Frame */}
        <div className={`bg-slate-900 shadow-2xl overflow-hidden transition-all ${
          isDeviceFrame ? 'rounded-[44px] p-3 border-4 border-slate-800 ring-1 ring-slate-950/20' : 'rounded-2xl border border-slate-200'
        }`}>
          {/* Mobile Screen Screen Inside */}
          <div className="bg-slate-50 rounded-[36px] overflow-hidden flex flex-col h-[750px] relative text-slate-900">
            {/* Phone Status Bar (Mock) */}
            <div className="bg-indigo-900 text-white px-6 pt-3 pb-2 flex justify-between items-center text-xs font-semibold select-none">
              <span>9:41</span>
              <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
              <div className="flex items-center space-x-1 text-[10px]">
                <span>5G</span>
                <span className="w-4 h-2 rounded bg-white inline-block ml-1" />
              </div>
            </div>

            {/* In-App Header */}
            <div className="bg-gradient-to-b from-indigo-900 to-indigo-800 text-white px-5 pt-3 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-indigo-100 border border-white/20">
                    {client?.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[11px] text-indigo-200 block leading-tight">Hola, bienvenido</span>
                    <h3 className="text-sm font-bold truncate max-w-[170px]">{client?.name}</h3>
                  </div>
                </div>

                <a
                  href={`https://wa.me/525584219900?text=${encodeURIComponent(`Hola, soy ${client?.name} y tengo una consulta sobre mi préstamo.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs hover:bg-emerald-600 transition"
                  title="Contactar soporte vía WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Body Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 -mt-3">
              {/* Tab Content: HOME */}
              {activeTab === 'home' && (
                <>
                  {/* Balance Card */}
                  {activeLoan ? (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-medium text-slate-500">Saldo Total Pendiente</span>
                          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                            {formatCurrency(activeLoan.remainingBalance, settings.currency, settings.currencyCode)}
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          activeLoan.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          activeLoan.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {activeLoan.status === 'active' ? 'Al Día' : activeLoan.status === 'overdue' ? 'En Mora' : 'Pagado'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                        <span>Préstamo: <strong className="text-slate-800 font-mono">{activeLoan.id}</strong></span>
                        <span>{activeLoan.installments.filter(i => i.status === 'paid').length} de {activeLoan.termCount} cuotas pagadas</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl text-center text-xs text-slate-500">
                      No tienes préstamos activos en este momento.
                    </div>
                  )}

                  {/* Next Due Installment Card */}
                  {nextInstallment && activeLoan ? (
                    <div className={`rounded-2xl p-4 shadow-sm border space-y-3 ${
                      nextInstallment.status === 'overdue' ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200/80'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1.5">
                          <Clock className={`w-4 h-4 ${nextInstallment.status === 'overdue' ? 'text-rose-600' : 'text-indigo-600'}`} />
                          <span className="text-xs font-bold text-slate-800">
                            Próxima Cuota #{nextInstallment.number}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          nextInstallment.status === 'overdue' ? 'bg-rose-600 text-white' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {nextInstallment.status === 'overdue' ? `Atraso ${nextInstallment.lateDays}d` : 'Por Vencer'}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-[11px] text-slate-500">Vence: {formatDate(nextInstallment.dueDate)}</span>
                          {nextInstallment.lateFee > 0 && (
                            <div className="text-[10px] text-rose-600 font-bold">
                              Incluye mora: +{formatCurrency(nextInstallment.lateFee, settings.currency, settings.currencyCode)}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-xl font-extrabold text-slate-900 font-mono">
                            {formatCurrency(nextInstallment.totalDue, settings.currency, settings.currencyCode)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setPayingInstallment({ loan: activeLoan, installment: nextInstallment })}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center space-x-2 shadow-xs transition"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pagar Cuota Ahora</span>
                      </button>
                    </div>
                  ) : null}

                  {/* Quick Action Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-left transition"
                    >
                      <Calendar className="w-5 h-5 text-indigo-600 mb-2" />
                      <span className="block text-xs font-bold text-slate-800">Ver Cronograma</span>
                      <span className="text-[10px] text-slate-400">Todas tus cuotas</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('history')}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-left transition"
                    >
                      <History className="w-5 h-5 text-emerald-600 mb-2" />
                      <span className="block text-xs font-bold text-slate-800">Recibos & Facturas</span>
                      <span className="text-[10px] text-slate-400">Descarga fiscal</span>
                    </button>
                  </div>

                  {/* Security Assurance Pill */}
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center space-x-2.5 text-xs text-indigo-900">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span className="text-[11px] leading-tight">
                      Tus pagos están protegidos con encriptación bancaria SSL 256 bits y facturación fiscal instantánea.
                    </span>
                  </div>
                </>
              )}

              {/* Tab Content: SCHEDULE */}
              {activeTab === 'schedule' && activeLoan && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-xs font-bold text-slate-900 uppercase">
                      Cronograma de Pagos ({activeLoan.termCount} Cuotas)
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">{activeLoan.id}</span>
                  </div>

                  <div className="space-y-2">
                    {activeLoan.installments.map((inst) => (
                      <div
                        key={inst.number}
                        className={`p-3 rounded-xl border bg-white flex items-center justify-between text-xs transition ${
                          inst.status === 'paid' ? 'border-emerald-200 bg-emerald-50/20' :
                          inst.status === 'overdue' ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">Cuota #{inst.number}</span>
                            <span className="text-[10px] text-slate-500">• {formatDate(inst.dueDate)}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Capital: {formatCurrency(inst.principal, settings.currency, settings.currencyCode)} • Int: {formatCurrency(inst.interest, settings.currency, settings.currencyCode)}
                            {inst.lateFee > 0 && <span className="text-rose-600 font-bold ml-1">+{formatCurrency(inst.lateFee, settings.currency, settings.currencyCode)} mora</span>}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-extrabold text-slate-900 font-mono">
                            {formatCurrency(inst.totalDue, settings.currency, settings.currencyCode)}
                          </div>
                          {inst.status === 'paid' ? (
                            <span className="text-[10px] font-bold text-emerald-700">Pagado</span>
                          ) : (
                            <button
                              onClick={() => setPayingInstallment({ loan: activeLoan, installment: inst })}
                              className="mt-1 px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]"
                            >
                              Pagar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content: HISTORY & INVOICES */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase px-1">
                    Mis Pagos y Facturas Electrónicas
                  </h4>

                  {clientPayments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                      Aún no tienes pagos registrados.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {clientPayments.map((p) => (
                        <div key={p.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-900">Cuota #{p.installmentNumbers.join(', #')}</div>
                            <span className="text-[10px] text-slate-500">{formatDate(p.paidAt)} • {p.paymentReference}</span>
                          </div>

                          <div className="text-right">
                            <div className="font-extrabold text-emerald-600 font-mono">
                              {formatCurrency(p.amount, settings.currency, settings.currencyCode)}
                            </div>
                            {p.invoiceId && (
                              <button
                                onClick={() => onViewInvoice(p.invoiceId!)}
                                className="inline-flex items-center space-x-0.5 text-[10px] text-indigo-600 font-semibold mt-0.5 hover:underline"
                              >
                                <FileText className="w-2.5 h-2.5 mr-0.5" />
                                <span>Ver Factura</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Bottom Tab Bar */}
            <div className="bg-white border-t border-slate-200 px-6 py-2.5 flex justify-around items-center">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center space-y-1 text-xs font-semibold ${
                  activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px]">Inicio</span>
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex flex-col items-center space-y-1 text-xs font-semibold ${
                  activeTab === 'schedule' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="text-[10px]">Cuotas</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center space-y-1 text-xs font-semibold ${
                  activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="text-[10px]">Facturas</span>
              </button>
            </div>

            {/* Mobile Home Bar Pill Indicator */}
            <div className="bg-white pb-1 pt-1">
              <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto" />
            </div>

            {/* Modal Inside Phone: Quick Payment Gateway */}
            {payingInstallment && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex flex-col justify-end">
                <div className="bg-white rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Pagar Cuota #{payingInstallment.installment.number}
                      </h4>
                      <p className="text-[11px] text-slate-500">Pasarela de pago instantánea</p>
                    </div>
                    <button
                      onClick={() => setPayingInstallment(null)}
                      className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {paymentSuccess ? (
                    <div className="py-8 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">¡Pago Exitoso!</h5>
                      <p className="text-xs text-slate-500">Su recibo y factura electrónica han sido emitidos.</p>
                    </div>
                  ) : (
                    <>
                      {/* Amount Details */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                        <span className="text-xs text-slate-600">Monto total a liquidar:</span>
                        <span className="text-lg font-extrabold text-emerald-600 font-mono">
                          {formatCurrency(payingInstallment.installment.totalDue, settings.currency, settings.currencyCode)}
                        </span>
                      </div>

                      {/* Payment Methods */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Seleccione Método</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedPaymentMethod('stripe_card')}
                            className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition ${
                              selectedPaymentMethod === 'stripe_card'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                                : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="text-xs truncate">Tarjeta Débito/Crédito</span>
                          </button>

                          <button
                            onClick={() => setSelectedPaymentMethod('bank_transfer')}
                            className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition ${
                              selectedPaymentMethod === 'bank_transfer'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                                : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            <Building className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="text-xs truncate">Transferencia SPEI</span>
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleExecutePayment}
                        disabled={paymentProcessing}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center space-x-2"
                      >
                        {paymentProcessing ? (
                          <span>Procesando pago seguro...</span>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Confirmar Pago de {formatCurrency(payingInstallment.installment.totalDue, settings.currency, settings.currencyCode)}</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
