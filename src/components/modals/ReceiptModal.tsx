import React from 'react';
import { X, Printer, CheckCircle2, Building2, Download, ShieldCheck } from 'lucide-react';
import { CompanySettings, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/finance';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  settings: CompanySettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  settings,
}) => {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Action Header (hidden in print) */}
        <div className="no-print px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Comprobante de Pago Liquidado</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Recibo</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt Area */}
        <div className="p-8 space-y-6 text-xs text-slate-700" id="printable-receipt">
          {/* Company Branding */}
          <div className="text-center border-b border-slate-200 pb-5 space-y-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 font-extrabold text-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
              {settings.companyName}
            </h2>
            <p className="text-[11px] text-slate-500">RFC/ID Fiscal: {settings.taxId}</p>
            <p className="text-[10px] text-slate-400">{settings.address} • Tel: {settings.phone}</p>
          </div>

          {/* Receipt Info */}
          <div className="space-y-1.5 border-b border-slate-100 pb-4">
            <div className="flex justify-between font-bold text-slate-900">
              <span>RECIBO DE CAJA:</span>
              <span className="font-mono">{payment.paymentReference}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Fecha de Liquidación:</span>
              <span>{formatDate(payment.paidAt)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Préstamo Relacionado:</span>
              <span className="font-mono font-semibold">{payment.loanId}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cliente:</span>
              <span className="font-semibold text-slate-900">{payment.clientName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cuota(s) Cubierta(s):</span>
              <span className="font-bold text-indigo-700">Cuota #{payment.installmentNumbers.join(', #')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Método de Pago:</span>
              <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Amortización a Capital:</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatCurrency(payment.principalAmount, settings.currency, settings.currencyCode)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Intereses Financieros:</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatCurrency(payment.interestAmount, settings.currency, settings.currencyCode)}
              </span>
            </div>
            {payment.lateFeeAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Recargos por Cobranza / Mora:</span>
                <span className="font-mono">
                  +{formatCurrency(payment.lateFeeAmount, settings.currency, settings.currencyCode)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>TOTAL PAGADO:</span>
              <span className="font-mono text-emerald-600 text-base">
                {formatCurrency(payment.amount, settings.currency, settings.currencyCode)}
              </span>
            </div>
          </div>

          {/* Footer & Security Stamp */}
          <div className="text-center pt-2 space-y-2">
            <div className="flex items-center justify-center space-x-1 text-[11px] text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transacción Procesada y Conciliada con Éxito</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Sello Digital: 8F2A-99B1-401C-E729 • Conservar este comprobante para aclaraciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
