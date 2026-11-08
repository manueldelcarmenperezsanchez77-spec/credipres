import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { Client, CompanySettings, Loan, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/finance';
import { downloadLoanStatementPDF } from '../../utils/loanStatementPdf';

interface LoanStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  payments: Payment[];
  settings: CompanySettings;
  client?: Client | null;
}

export const LoanStatementModal: React.FC<LoanStatementModalProps> = ({
  isOpen,
  onClose,
  loan,
  payments,
  settings,
  client,
}) => {
  if (!isOpen || !loan) return null;

  const loanPayments = payments.filter((p) => p.loanId === loan.id);
  const totalLateFee = loan.installments.reduce((sum, i) => sum + (i.lateFee || 0), 0);
  const progressPercent = Math.min(100, Math.round((loan.paidAmount / loan.totalAmount) * 100)) || 0;

  const handleDownloadPdf = () => {
    downloadLoanStatementPDF(loan, payments, settings, client);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    if (loan.status === 'paid') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Liquidado
        </span>
      );
    }
    if (loan.status === 'overdue') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 mr-1" />
          En Mora
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
        Al Día / Activo
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Estado de Cuenta Oficial</span>
                <span className="text-xs text-slate-500 font-mono font-normal">({loan.id})</span>
              </h3>
              <p className="text-[11px] text-slate-500">Historial completo de amortizaciones y pagos aplicados</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-statement-download-pdf"
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>

            <button
              id="btn-statement-print-dialog"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-700 text-xs" id="statement-print-content">
          {/* Header Banner */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  {settings.companyName}
                </h2>
                <div className="text-slate-500 text-[11px] space-x-2 mt-0.5">
                  <span>RFC/Tax ID: <strong className="text-slate-700">{settings.taxId || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Tel: <strong className="text-slate-700">{settings.phone || 'N/A'}</strong></span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{settings.address || 'Oficina Principal de Operaciones'}</p>
              </div>
            </div>

            <div className="text-right sm:self-auto self-end bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                ESTADO DE CUENTA DE CRÉDITO
              </span>
              <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
                {loan.id}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Emisión: {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>

          {/* Client and Loan Condition Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Card */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Datos del Prestatario</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">ID: {loan.clientId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nombre Completo</span>
                  <span className="font-bold text-slate-900">{loan.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Identificación / Documento</span>
                  <span className="font-semibold text-slate-800 font-mono">{loan.clientDocumentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Teléfono</span>
                  <span className="text-slate-700">{loan.clientPhone || client?.phone || 'No registrado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Correo Electrónico</span>
                  <span className="text-slate-700 truncate block">{loan.clientEmail || client?.email || 'No registrado'}</span>
                </div>
                {client?.address && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Dirección Registrada</span>
                    <span className="text-slate-700">{client.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Loan Terms Card */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Términos del Préstamo</span>
                </h4>
                {getStatusBadge()}
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Capital Solicitado</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(loan.principal, settings.currency, settings.currencyCode)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tasa de Interés</span>
                  <span className="font-bold text-indigo-700">{loan.interestRate}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Frecuencia</span>
                  <span className="font-semibold text-slate-800 capitalize">{loan.frequency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Plazo / Cuotas</span>
                  <span className="text-slate-800 font-semibold">{loan.termCount} Cuotas</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Amortización</span>
                  <span className="text-slate-800 capitalize font-medium">{loan.amortizationType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Fecha Desembolso</span>
                  <span className="text-slate-800">{formatDate(loan.startDate)}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Avance de Pago:</span>
                  <span className="font-bold text-slate-900">{progressPercent}%</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 mr-1.5">Saldo Pendiente:</span>
                  <span className={`font-mono font-extrabold ${loan.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {formatCurrency(loan.remainingBalance, settings.currency, settings.currencyCode)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Complete Installments Schedule */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cronograma y Estado de Cuotas ({loan.installments.length} Cuotas)</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Mora configurada: {loan.lateFeeDailyRate}% diario
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center"># Cuota</th>
                    <th className="py-2.5 px-3">Vencimiento</th>
                    <th className="py-2.5 px-3 text-right">Capital</th>
                    <th className="py-2.5 px-3 text-right">Interés</th>
                    <th className="py-2.5 px-3 text-right">Mora / Recargo</th>
                    <th className="py-2.5 px-3 text-right">Total Cuota</th>
                    <th className="py-2.5 px-3 text-right">Monto Pagado</th>
                    <th className="py-2.5 px-3 text-center">Fecha de Pago</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loan.installments.map((inst) => {
                    const isPaid = inst.status === 'paid';
                    const isOverdue = inst.status === 'overdue';

                    return (
                      <tr 
                        key={inst.number} 
                        className={`hover:bg-slate-50 transition ${
                          isOverdue ? 'bg-rose-50/40' : isPaid ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-center font-bold text-slate-900">
                          #{inst.number}
                        </td>
                        <td className="py-2 px-3 font-medium">
                          {formatDate(inst.dueDate)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {formatCurrency(inst.principal, settings.currency, settings.currencyCode)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-indigo-700">
                          {formatCurrency(inst.interest, settings.currency, settings.currencyCode)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {inst.lateFee > 0 ? (
                            <span className="font-bold text-rose-600">
                              +{formatCurrency(inst.lateFee, settings.currency, settings.currencyCode)} ({inst.lateDays}d)
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(inst.totalDue, settings.currency, settings.currencyCode)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-600 font-semibold">
                          {formatCurrency(inst.paidAmount, settings.currency, settings.currencyCode)}
                        </td>
                        <td className="py-2 px-3 text-center text-[10px] text-slate-500 font-mono">
                          {inst.paidDate ? formatDate(inst.paidDate) : '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Pagada
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                              Mora {inst.lateDays}d
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                              Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Complete Payments History Log */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Historial de Pagos y Abonos Recibidos ({loanPayments.length} Pagos)</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Total recaudado: <strong className="text-emerald-600 font-mono">{formatCurrency(loan.paidAmount, settings.currency, settings.currencyCode)}</strong>
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Fecha y Hora</th>
                    <th className="py-2.5 px-3">Folio / Referencia</th>
                    <th className="py-2.5 px-3 text-center">Cuota(s)</th>
                    <th className="py-2.5 px-3 text-center">Método de Pago</th>
                    <th className="py-2.5 px-3 text-right">Abono Capital</th>
                    <th className="py-2.5 px-3 text-right">Interés</th>
                    <th className="py-2.5 px-3 text-right">Mora</th>
                    <th className="py-2.5 px-3 text-right">Monto Cobrado</th>
                    <th className="py-2.5 px-3 text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loanPayments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-slate-400 italic">
                        No se registran transacciones de pago aplicadas para este préstamo.
                      </td>
                    </tr>
                  ) : (
                    loanPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-2 px-3 font-medium">
                          {formatDate(p.paidAt)}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">
                          {p.paymentReference || p.id}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-indigo-700">
                          Cuota #{p.installmentNumbers.join(', #')}
                        </td>
                        <td className="py-2 px-3 text-center uppercase text-[10px] text-slate-600 font-medium">
                          {p.paymentMethod.replace('_', ' ')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {formatCurrency(p.principalAmount, settings.currency, settings.currencyCode)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-indigo-600">
                          {formatCurrency(p.interestAmount, settings.currency, settings.currencyCode)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {p.lateFeeAmount > 0 ? (
                            <span className="text-rose-600 font-bold">
                              {formatCurrency(p.lateFeeAmount, settings.currency, settings.currencyCode)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-extrabold text-emerald-600">
                          {formatCurrency(p.amount, settings.currency, settings.currencyCode)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Aplicado
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consolidated Financial Summary Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300">
                Liquidación y Balance General del Crédito
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span>Capital: <strong className="text-white">{formatCurrency(loan.principal, settings.currency, settings.currencyCode)}</strong></span>
                <span>•</span>
                <span>Intereses Totales: <strong className="text-white">{formatCurrency(loan.totalInterest, settings.currency, settings.currencyCode)}</strong></span>
                <span>•</span>
                <span>Moras Acumuladas: <strong className="text-amber-400">{formatCurrency(totalLateFee, settings.currency, settings.currencyCode)}</strong></span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-right">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Amortizado</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(loan.paidAmount, settings.currency, settings.currencyCode)}
                </span>
              </div>
              <div className="pl-6 border-l border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Saldo Deudor Actual</span>
                <span className={`text-base font-extrabold font-mono ${loan.remainingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatCurrency(loan.remainingBalance, settings.currency, settings.currencyCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Document Footer Disclaimer */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
            <span>
              Este estado de cuenta es emitido por {settings.companyName} para fines de control administrativo y conciliación de pagos.
            </span>
            <span className="font-mono">
              Certificación de cartera activa al {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
