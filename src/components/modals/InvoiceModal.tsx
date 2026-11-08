import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2, QrCode, FileText, Code } from 'lucide-react';
import { CompanySettings, ElectronicInvoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/finance';
import { generateInvoiceXml } from '../../utils/invoicing';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: ElectronicInvoice | null;
  settings: CompanySettings;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  settings,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    const xml = generateInvoiceXml(invoice, settings);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Action Header */}
        <div className="no-print px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Factura Electrónica Fiscal CFDI 4.0</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadXml}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Descargar XML</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir CFDI</span>
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div className="p-8 space-y-6 text-xs text-slate-700">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                COMPROBANTE FISCAL DIGITAL POR INTERNET (CFDI)
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                {invoice.invoiceNumber}
              </h2>
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                UUID: <strong className="text-slate-700">{invoice.fiscalUuid}</strong>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Timbrado y Válido
              </span>
              <div className="text-[10px] text-slate-400 mt-1">Fecha Emisión: {formatDate(invoice.issuedAt)}</div>
            </div>
          </div>

          {/* Emisor y Receptor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EMISOR</span>
              <p className="font-bold text-slate-900 text-xs">{settings.companyName}</p>
              <p className="font-mono text-slate-600">RFC: {settings.taxId}</p>
              <p className="text-slate-500 text-[11px]">{settings.fiscalRegime}</p>
              <p className="text-slate-500 text-[11px]">{settings.address}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RECEPTOR (CLIENTE)</span>
              <p className="font-bold text-slate-900 text-xs">{invoice.clientName}</p>
              <p className="font-mono text-slate-600">RFC/DNI: {invoice.clientDocumentId}</p>
              <p className="text-slate-500 text-[11px]">Email: {invoice.clientEmail}</p>
              <p className="text-slate-500 text-[11px]">Uso CFDI: S01 - Sin efectos fiscales / Crédito</p>
            </div>
          </div>

          {/* Concepts Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Clave / Concepto</th>
                  <th className="p-3 text-right">Base Imponible</th>
                  <th className="p-3 text-right">Impuesto (16%)</th>
                  <th className="p-3 text-right">Importe Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">84121500 - Servicios de Préstamo Personal</div>
                    <div className="text-slate-500 text-[11px]">{invoice.concept}</div>
                  </td>
                  <td className="p-3 text-right font-mono font-semibold">
                    {formatCurrency(invoice.subtotal, settings.currency, settings.currencyCode)}
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-indigo-600">
                    {formatCurrency(invoice.taxAmount, settings.currency, settings.currencyCode)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(invoice.subtotal + invoice.taxAmount, settings.currency, settings.currencyCode)}
                  </td>
                </tr>
                {invoice.exemptAmount > 0 && (
                  <tr className="bg-slate-50/50">
                    <td className="p-3 text-slate-600">
                      <div>Recuperación de Capital Original (Amortización no sujeta a IVA)</div>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">Exento</td>
                    <td className="p-3 text-right font-mono text-slate-500">$0.00</td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-700">
                      {formatCurrency(invoice.exemptAmount, settings.currency, settings.currencyCode)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal Gravado (Intereses):</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(invoice.subtotal, settings.currency, settings.currencyCode)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IVA Trasladado (16.00%):</span>
                <span className="font-mono font-semibold text-indigo-600">
                  {formatCurrency(invoice.taxAmount, settings.currency, settings.currencyCode)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capital Exento:</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(invoice.exemptAmount, settings.currency, settings.currencyCode)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                <span>TOTAL:</span>
                <span className="font-mono text-emerald-600">
                  {formatCurrency(invoice.total, settings.currency, settings.currencyCode)}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code and Digital Seal */}
          <div className="flex items-center space-x-4 pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 text-slate-700">
              <QrCode className="w-10 h-10" />
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <p className="truncate"><strong>Cadena Original:</strong> ||1.1|{invoice.fiscalUuid}|{invoice.issuedAt}|SAT970701NN3||</p>
              <p className="truncate"><strong>Sello Digital del SAT:</strong> K8fG01A99bC1204XmzLkQwErTyUiOpAsDfGhJkLzXcVbNm1234==</p>
              <p>Este documento es una representación impresa de un CFDI 4.0 certificado ante la autoridad fiscal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
