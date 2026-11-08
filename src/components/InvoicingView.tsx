import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  Printer, 
  Building2, 
  Code,
  FileSpreadsheet
} from 'lucide-react';
import { CompanySettings, ElectronicInvoice } from '../types';
import { formatCurrency, formatDate } from '../utils/finance';
import { generateInvoiceXml } from '../utils/invoicing';

interface InvoicingViewProps {
  invoices: ElectronicInvoice[];
  settings: CompanySettings;
  onViewInvoice: (invoice: ElectronicInvoice) => void;
}

export const InvoicingView: React.FC<InvoicingViewProps> = ({
  invoices,
  settings,
  onViewInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter((inv) => {
    return (
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.fiscalUuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientDocumentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDownloadXml = (invoice: ElectronicInvoice) => {
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

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalTaxCollected = invoices.reduce((acc, inv) => acc + inv.taxAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Facturación Electrónica y Cumplimiento Fiscal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Emisión de comprobantes fiscales digitales timbrados (CFDI / DTE), desglose de IVA sobre intereses y XML reglamentario.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
            PAC Certificado / SAT Activo
          </span>
        </div>
      </div>

      {/* Fiscal Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Facturas Timbradas</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{invoices.length} Comprobantes</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% validadas ante el fisco</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Facturado</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {formatCurrency(totalInvoiced, settings.currency, settings.currencyCode)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Capital devuelto + Intereses recaudados</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">IVA Trasladado (16%)</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">
            {formatCurrency(totalTaxCollected, settings.currency, settings.currencyCode)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Impuesto generado por intereses</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por folio fiscal, cliente o RFC/DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-500">
          Mostrando {filteredInvoices.length} comprobantes fiscales
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Folio & UUID Fiscal</th>
                <th className="py-3 px-4">Receptor / Cliente</th>
                <th className="py-3 px-4 text-right">Intereses (Base)</th>
                <th className="py-3 px-4 text-right">IVA (16%)</th>
                <th className="py-3 px-4 text-right">Capital Exento</th>
                <th className="py-3 px-4 text-right">Total Factura</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Descargas & Vista</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron facturas fiscales con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-mono">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs" title={inv.fiscalUuid}>
                        UUID: {inv.fiscalUuid}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inv.clientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">RFC/DNI: {inv.clientDocumentId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      {formatCurrency(inv.subtotal, settings.currency, settings.currencyCode)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-indigo-600 font-semibold">
                      {formatCurrency(inv.taxAmount, settings.currency, settings.currencyCode)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {formatCurrency(inv.exemptAmount, settings.currency, settings.currencyCode)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900">
                      {formatCurrency(inv.total, settings.currency, settings.currencyCode)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Timbrado
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-700 transition"
                          title="Visualizar Comprobante Oficial"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownloadXml(inv)}
                          className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700 transition"
                          title="Descargar XML CFDI 4.0 Fiscal"
                        >
                          <Code className="w-4 h-4" />
                        </button>
                      </div>
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
