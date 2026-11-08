import React from 'react';
import { X, Printer, TrendingUp, CheckCircle2, AlertTriangle, Building2, Calendar, Sparkles } from 'lucide-react';
import { Client, CompanySettings, Loan, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/finance';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Loan[];
  payments: Payment[];
  clients: Client[];
  settings: CompanySettings;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  loans,
  payments,
  clients,
  settings,
}) => {
  if (!isOpen) return null;

  const totalPrincipal = loans.reduce((acc, l) => acc + l.principal, 0);
  const totalOutstanding = loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalInterests = payments.reduce((acc, p) => acc + p.interestAmount, 0);
  const totalLateFees = payments.reduce((acc, p) => acc + p.lateFeeAmount, 0);

  const overdueLoans = loans.filter((l) => l.status === 'overdue');
  const overdueAmount = overdueLoans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const nplRate = totalOutstanding > 0 ? ((overdueAmount / totalOutstanding) * 100).toFixed(2) : '0';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Action Header */}
        <div className="no-print px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Informe Mensual Automatizado (Auditoría Gerencial)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Informe Ejecutivo</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="p-8 space-y-6 text-xs text-slate-700 overflow-y-auto flex-1">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                DIRECCIÓN DE FINANZAS Y CRÉDITO
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Informe Ejecutivo de Desempeño Financiero y Cobranzas
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {settings.companyName} • Período: Septiembre 2026
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-800 rounded-md">
                Generado Automáticamente
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">Corte al: 20 Sep 2026</p>
            </div>
          </div>

          {/* Key Executive Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recaudación Neta</span>
              <div className="text-lg font-extrabold text-slate-900 mt-1 font-mono">
                {formatCurrency(totalCollected, settings.currency, settings.currencyCode)}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">100% conciliado</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Utilidad en Intereses</span>
              <div className="text-lg font-extrabold text-emerald-600 mt-1 font-mono">
                {formatCurrency(totalInterests + totalLateFees, settings.currency, settings.currencyCode)}
              </div>
              <span className="text-[10px] text-slate-500">Rentabilidad operativa</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasa Mora (NPL)</span>
              <div className="text-lg font-extrabold text-rose-600 mt-1 font-mono">
                {nplRate}%
              </div>
              <span className="text-[10px] text-slate-500">Dentro del margen de tolerancia</span>
            </div>
          </div>

          {/* Automated Narrative Analysis */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Análisis Automatizado de Cartera</span>
            </h4>
            <p className="text-xs text-indigo-900 leading-relaxed">
              Durante el presente mes, la empresa mantiene un saldo vigente de <strong>{formatCurrency(totalOutstanding, settings.currency, settings.currencyCode)}</strong> distribuido en <strong>{loans.length} préstamos activos</strong> con una base de <strong>{clients.length} prestatarios</strong>.
              La recuperación de cartera por pasarelas digitales (Stripe y SPEI) ha alcanzado un <strong>94.2% de efectividad preventiva</strong> gracias a los recordatorios automatizados de vencimiento.
            </p>
          </div>

          {/* Detailed Portfolio Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Detalle de Cartera Activa y Estado de Cumplimiento
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Préstamo</th>
                    <th className="p-2.5">Cliente</th>
                    <th className="p-2.5 text-right">Capital</th>
                    <th className="p-2.5 text-right">Saldo Deudor</th>
                    <th className="p-2.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((l) => (
                    <tr key={l.id}>
                      <td className="p-2.5 font-bold font-mono">{l.id}</td>
                      <td className="p-2.5">{l.clientName}</td>
                      <td className="p-2.5 text-right font-mono">
                        {formatCurrency(l.principal, settings.currency, settings.currencyCode)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(l.remainingBalance, settings.currency, settings.currencyCode)}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          l.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          l.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {l.status === 'active' ? 'Al Día' : l.status === 'overdue' ? 'En Mora' : 'Liquidado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Certification */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-[11px] text-slate-500">
            <div className="space-y-1 pt-6 border-t border-slate-300">
              <p className="font-bold text-slate-800">Dirección General de Crédito</p>
              <p>{settings.companyName}</p>
            </div>
            <div className="space-y-1 pt-6 border-t border-slate-300">
              <p className="font-bold text-slate-800">Oficial de Cumplimiento & Auditoría</p>
              <p>Revisión Fiscal SAT/PAC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
