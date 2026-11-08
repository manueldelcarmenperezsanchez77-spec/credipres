import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  CreditCard, 
  CheckCircle2, 
  ExternalLink, 
  Printer, 
  DollarSign, 
  QrCode, 
  FileText,
  Building,
  ShieldCheck
} from 'lucide-react';
import { CompanySettings, Loan, Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/finance';

interface PaymentsViewProps {
  payments: Payment[];
  loans: Loan[];
  settings: CompanySettings;
  onOpenPaymentModal: (loan?: Loan) => void;
  onViewReceipt: (payment: Payment) => void;
  onViewInvoice: (invoiceId?: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  loans,
  settings,
  onOpenPaymentModal,
  onViewReceipt,
  onViewInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paymentReference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'all' ? true : p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const getMethodBadge = (method: Payment['paymentMethod']) => {
    switch (method) {
      case 'stripe_card':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CreditCard className="w-3 h-3 mr-1" />
            Tarjeta (Stripe Gateway)
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Building className="w-3 h-3 mr-1" />
            Transferencia SPEI
          </span>
        );
      case 'payment_link':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ExternalLink className="w-3 h-3 mr-1" />
            Link de Pago Web
          </span>
        );
      case 'qr_instant':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <QrCode className="w-3 h-3 mr-1" />
            Cobro QR Dinámico
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
            <DollarSign className="w-3 h-3 mr-1" />
            Efectivo en Caja
          </span>
        );
    }
  };

  const totalCollectedAmount = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Caja, Cobranzas y Pasarelas de Pago
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de abonos, conciliación en línea mediante pasarela de pago y emisión de comprobantes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenPaymentModal()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Cobro / Abrir Pasarela</span>
          </button>
        </div>
      </div>

      {/* Gateway Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">Pasarela Stripe / Tarjetas</span>
              <p className="text-[11px] text-emerald-600 font-medium">Activa • 3D Secure 2.0</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Conectada
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">Transferencias SPEI / Bancos</span>
              <p className="text-[11px] text-blue-600 font-medium">Conciliación Automática</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
            24/7 En Vivo
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">Links de Pago WhatsApp</span>
              <p className="text-[11px] text-slate-500 font-medium">Cobro sin contacto</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Habilitado
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, folio de préstamo o referencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium">Método:</span>
          <button
            onClick={() => setMethodFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              methodFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({payments.length})
          </button>
          <button
            onClick={() => setMethodFilter('stripe_card')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              methodFilter === 'stripe_card'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            Tarjeta
          </button>
          <button
            onClick={() => setMethodFilter('bank_transfer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              methodFilter === 'bank_transfer'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            SPEI
          </button>
          <button
            onClick={() => setMethodFilter('payment_link')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              methodFilter === 'payment_link'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Link Web
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Referencia / Folio</th>
                <th className="py-3 px-4">Cliente & Préstamo</th>
                <th className="py-3 px-4">Cuota(s)</th>
                <th className="py-3 px-4">Método de Cobro</th>
                <th className="py-3 px-4 text-right">Monto Liquidado</th>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4 text-center">Factura Fiscal</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron pagos registrados con ese filtro.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {payment.paymentReference}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{payment.clientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Préstamo: {payment.loanId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                        Cuota #{payment.installmentNumbers.join(', #')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getMethodBadge(payment.paymentMethod)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-extrabold text-sm text-emerald-600 font-mono">
                        {formatCurrency(payment.amount, settings.currency, settings.currencyCode)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Cap: {formatCurrency(payment.principalAmount, settings.currency, settings.currencyCode)} • Int: {formatCurrency(payment.interestAmount, settings.currency, settings.currencyCode)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(payment.paidAt)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {payment.invoiceId ? (
                        <button
                          onClick={() => onViewInvoice(payment.invoiceId)}
                          className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Ver Factura</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">No timbrada</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onViewReceipt(payment)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Recibo</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
