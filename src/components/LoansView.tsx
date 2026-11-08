import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Calendar, 
  ArrowRight,
  Eye,
  FileText,
  FileDown,
  Download,
  Printer
} from 'lucide-react';
import { Client, CompanySettings, Loan, Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/finance';
import { LoanStatementModal } from './modals/LoanStatementModal';
import { downloadLoanStatementPDF } from '../utils/loanStatementPdf';

interface LoansViewProps {
  loans: Loan[];
  payments?: Payment[];
  clients?: Client[];
  settings: CompanySettings;
  onOpenNewLoan: () => void;
  onOpenPaymentModal: (loan: Loan, installmentNumber?: number) => void;
  onViewInvoice?: (invoiceId: string) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  loans,
  payments = [],
  clients = [],
  settings,
  onOpenNewLoan,
  onOpenPaymentModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue' | 'paid'>('all');
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(loans[0]?.id || null);
  const [selectedLoanForStatement, setSelectedLoanForStatement] = useState<Loan | null>(null);

  const handleOpenStatementModal = (loan: Loan) => {
    setSelectedLoanForStatement(loan);
  };

  const handleDirectDownloadPDF = (loan: Loan, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const client = clients.find((c) => c.id === loan.clientId) || null;
    downloadLoanStatementPDF(loan, payments, settings, client);
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.clientDocumentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Loan['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Al Día
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            En Mora
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Liquidado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getFrequencyLabel = (freq: Loan['frequency']) => {
    switch (freq) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'biweekly': return 'Quincenal';
      case 'monthly': return 'Mensual';
      default: return freq;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Cartera de Préstamos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de amortizaciones, desembolsos, cronogramas de pago y cálculo de moras automáticas.
          </p>
        </div>

        <button
          id="btn-create-loan"
          onClick={onOpenNewLoan}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
        >
          <CreditCard className="w-4 h-4" />
          <span>Otorgar Nuevo Préstamo</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, folio # o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium">Estado:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({loans.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Al Día
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            En Mora
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'paid'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Liquidados
          </button>
        </div>
      </div>

      {/* Loans List with Expandable Amortization Schedules */}
      <div className="space-y-4">
        {filteredLoans.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No se encontraron préstamos con ese criterio</p>
            <p className="text-xs text-slate-400 mt-1">Pruebe ajustando los filtros o cree un nuevo crédito.</p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const isExpanded = expandedLoanId === loan.id;
            const progressPercent = Math.min(100, Math.round((loan.paidAmount / loan.totalAmount) * 100)) || 0;

            return (
              <div
                key={loan.id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden transition"
              >
                {/* Loan Main Header Card */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {loan.id.split('-')[2] || 'LON'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-extrabold text-slate-900 text-base">{loan.clientName}</span>
                        {getStatusBadge(loan.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span>Folio: <strong className="text-slate-700">{loan.id}</strong></span>
                        <span>•</span>
                        <span>Doc: <strong className="text-slate-700">{loan.clientDocumentId}</strong></span>
                        <span>•</span>
                        <span>Frecuencia: <strong className="text-slate-700">{getFrequencyLabel(loan.frequency)}</strong></span>
                        <span>•</span>
                        <span>Sistema: <strong className="text-slate-700 capitalize">{loan.amortizationType}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Capital Original</span>
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatCurrency(loan.principal, settings.currency, settings.currencyCode)}
                      </div>
                      <span className="text-[10px] text-slate-500">Tasa: {loan.interestRate}%</span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saldo Pendiente</span>
                      <div className={`text-sm font-extrabold ${loan.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(loan.remainingBalance, settings.currency, settings.currencyCode)}
                      </div>
                      <span className="text-[10px] text-slate-500">Total: {formatCurrency(loan.totalAmount, settings.currency, settings.currencyCode)}</span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>Progreso</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end lg:self-center">
                    <button
                      id={`btn-card-statement-${loan.id}`}
                      type="button"
                      onClick={() => handleOpenStatementModal(loan)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 transition"
                      title="Ver y Exportar Estado de Cuenta del préstamo"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden sm:inline">Estado de Cuenta</span>
                    </button>

                    {loan.status !== 'paid' && (
                      <button
                        onClick={() => onOpenPaymentModal(loan)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Abonar / Liquidar</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                    >
                      <span>{isExpanded ? 'Ocultar Cronograma' : 'Ver Cronograma'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Amortization Table & Detail Accordion Content */}
                {isExpanded && (() => {
                  const loanPayments = payments.filter((p) => p.loanId === loan.id);

                  return (
                    <div className="border-t border-slate-200 bg-slate-50/60 p-4 sm:p-6 space-y-4">
                      {/* Detail Section Header with Export Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                            <span>Tabla de Amortización Oficial ({loan.installments.length} Cuotas)</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Mora diaria: <strong className="text-slate-700">{loan.lateFeeDailyRate}%</strong> • Saldo pendiente: <strong className={loan.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}>{formatCurrency(loan.remainingBalance, settings.currency, settings.currencyCode)}</strong>
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            id={`btn-export-statement-${loan.id}`}
                            type="button"
                            onClick={() => handleOpenStatementModal(loan)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs transition"
                            title="Generar y Exportar Estado de Cuenta Oficial en PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>Exportar Estado de Cuenta</span>
                          </button>

                          <button
                            id={`btn-direct-download-pdf-${loan.id}`}
                            type="button"
                            onClick={(e) => handleDirectDownloadPDF(loan, e)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                            title="Descargar archivo PDF directamente a su equipo"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="hidden sm:inline">Descargar PDF</span>
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-xs">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3"># Cuota</th>
                              <th className="py-2.5 px-3">Vencimiento</th>
                              <th className="py-2.5 px-3 text-right">Capital</th>
                              <th className="py-2.5 px-3 text-right">Interés</th>
                              <th className="py-2.5 px-3 text-right">Mora / Recargo</th>
                              <th className="py-2.5 px-3 text-right">Total Cuota</th>
                              <th className="py-2.5 px-3 text-right">Pagado</th>
                              <th className="py-2.5 px-3 text-center">Estado</th>
                              <th className="py-2.5 px-3 text-center">Acción</th>
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
                                  <td className="py-2.5 px-3 font-bold text-slate-900">
                                    #{inst.number}
                                  </td>
                                  <td className="py-2.5 px-3 font-medium">
                                    {formatDate(inst.dueDate)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono">
                                    {formatCurrency(inst.principal, settings.currency, settings.currencyCode)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-indigo-600">
                                    {formatCurrency(inst.interest, settings.currency, settings.currencyCode)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono">
                                    {inst.lateFee > 0 ? (
                                      <span className="font-bold text-rose-600">
                                        +{formatCurrency(inst.lateFee, settings.currency, settings.currencyCode)} ({inst.lateDays}d)
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 font-mono">
                                    {formatCurrency(inst.totalDue, settings.currency, settings.currencyCode)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-semibold">
                                    {formatCurrency(inst.paidAmount, settings.currency, settings.currencyCode)}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {isPaid ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        Pagada
                                      </span>
                                    ) : isOverdue ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                        Atraso {inst.lateDays}d
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                        Pendiente
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {!isPaid ? (
                                      <button
                                        onClick={() => onOpenPaymentModal(loan, inst.number)}
                                        className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition"
                                      >
                                        Cobrar
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-emerald-700 font-semibold">
                                        {inst.paidDate ? formatDate(inst.paidDate) : 'Completada'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Historial de Pagos Realizados en Detalle */}
                      {loanPayments.length > 0 && (
                        <div className="space-y-2 mt-4 pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Historial de Pagos Aplicados ({loanPayments.length} pagos)</span>
                            </h5>
                            <span className="text-xs text-slate-500">
                              Total amortizado: <strong className="text-emerald-700 font-mono">{formatCurrency(loan.paidAmount, settings.currency, settings.currencyCode)}</strong>
                            </span>
                          </div>

                          <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-xs">
                            <table className="w-full text-left text-xs text-slate-600">
                              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                                <tr>
                                  <th className="py-2 px-3">Fecha y Hora</th>
                                  <th className="py-2 px-3">Folio / Referencia</th>
                                  <th className="py-2 px-3 text-center">Cuota(s)</th>
                                  <th className="py-2 px-3 text-center">Método</th>
                                  <th className="py-2 px-3 text-right">Capital</th>
                                  <th className="py-2 px-3 text-right">Interés</th>
                                  <th className="py-2 px-3 text-right">Mora</th>
                                  <th className="py-2 px-3 text-right">Total Cobrado</th>
                                  <th className="py-2 px-3 text-center">Estatus</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {loanPayments.map((p) => (
                                  <tr key={p.id} className="hover:bg-slate-50 transition">
                                    <td className="py-2 px-3 font-medium">{formatDate(p.paidAt)}</td>
                                    <td className="py-2 px-3 font-mono font-semibold text-slate-800">{p.paymentReference || p.id}</td>
                                    <td className="py-2 px-3 text-center font-bold text-indigo-700">Cuota #{p.installmentNumbers.join(', #')}</td>
                                    <td className="py-2 px-3 text-center uppercase text-[10px]">{p.paymentMethod.replace('_', ' ')}</td>
                                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(p.principalAmount, settings.currency, settings.currencyCode)}</td>
                                    <td className="py-2 px-3 text-right font-mono text-indigo-600">{formatCurrency(p.interestAmount, settings.currency, settings.currencyCode)}</td>
                                    <td className="py-2 px-3 text-right font-mono">
                                      {p.lateFeeAmount > 0 ? (
                                        <span className="text-rose-600 font-bold">{formatCurrency(p.lateFeeAmount, settings.currency, settings.currencyCode)}</span>
                                      ) : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                                      {formatCurrency(p.amount, settings.currency, settings.currencyCode)}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        Aplicado
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })
        )}
      </div>

      {/* Loan Statement Modal for Preview, Direct PDF Download and Printing */}
      {selectedLoanForStatement && (
        <LoanStatementModal
          isOpen={Boolean(selectedLoanForStatement)}
          onClose={() => setSelectedLoanForStatement(null)}
          loan={selectedLoanForStatement}
          payments={payments}
          settings={settings}
          client={clients.find((c) => c.id === selectedLoanForStatement.clientId) || null}
        />
      )}
    </div>
  );
};
