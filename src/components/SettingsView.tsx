import React, { useState, useRef } from 'react';
import { 
  Save, 
  Building2, 
  CreditCard, 
  Percent, 
  RotateCcw,
  CheckCircle2,
  Download,
  Upload,
  Database,
  FileJson,
  ShieldCheck,
  AlertCircle,
  Eye,
  X,
  Copy,
  Check,
  Calendar,
  Users,
  Receipt,
  FileCheck2,
  Lock,
  Clock
} from 'lucide-react';
import { 
  AppBackupData, 
  Client, 
  CompanySettings, 
  ElectronicInvoice, 
  Loan, 
  NotificationLog, 
  Payment 
} from '../types';
import { Storage } from '../utils/storage';
import { syncManager } from '../utils/syncManager';
import { SyncStatusBadge } from './common/SyncStatusBadge';

interface SettingsViewProps {
  settings: CompanySettings;
  onSaveSettings: (newSettings: CompanySettings) => void;
  onResetData: () => void;
  clients?: Client[];
  loans?: Loan[];
  payments?: Payment[];
  invoices?: ElectronicInvoice[];
  notifications?: NotificationLog[];
  onRestoreBackup?: (backup: AppBackupData) => void;
  onManualLock?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  clients = [],
  loans = [],
  payments = [],
  invoices = [],
  notifications = [],
  onRestoreBackup,
  onManualLock,
}) => {
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Backup & Export States
  const [lastExportTime, setLastExportTime] = useState<string | null>(() => {
    return localStorage.getItem('credigestion_last_backup_timestamp');
  });
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<AppBackupData | null>(null);
  const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);
  const [previewJsonString, setPreviewJsonString] = useState<string>('');
  const [copiedJson, setCopiedJson] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Compile current snapshot
  const getLiveBackup = (): AppBackupData => {
    return Storage.exportAllData({
      clients: clients.length > 0 ? clients : undefined,
      loans: loans.length > 0 ? loans : undefined,
      payments: payments.length > 0 ? payments : undefined,
      invoices: invoices.length > 0 ? invoices : undefined,
      notifications: notifications.length > 0 ? notifications : undefined,
      settings: formData,
    });
  };

  // 1. Export & Download JSON
  const handleDownloadBackup = () => {
    setIsExporting(true);
    try {
      const backup = getLiveBackup();
      Storage.downloadBackupFile(backup);

      const nowStr = new Date().toLocaleString();
      setLastExportTime(nowStr);
      localStorage.setItem('credigestion_last_backup_timestamp', nowStr);
      
      setExportSuccessMessage(
        `¡Respaldo descargado exitosamente! Se exportaron ${backup.summary.clientsCount} clientes, ${backup.summary.loansCount} préstamos, ${backup.summary.paymentsCount} pagos y ${backup.summary.invoicesCount} facturas.`
      );
      setTimeout(() => setExportSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Error al exportar respaldo:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Open Raw JSON Preview Modal
  const handleOpenJsonPreview = () => {
    const backup = getLiveBackup();
    setPreviewJsonString(JSON.stringify(backup, null, 2));
    setIsJsonViewerOpen(true);
  };

  // 3. Copy JSON payload to clipboard
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(previewJsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    } catch (err) {
      console.error('Error al copiar JSON:', err);
    }
  };

  // 4. Handle JSON File Selection for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportErrorMessage(null);
    setImportSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const validation = Storage.validateBackupData(parsed);

        if (!validation.isValid || !validation.backup) {
          setImportErrorMessage(validation.error || 'El archivo seleccionado no cumple con la estructura requerida.');
          return;
        }

        // Prompt confirmation with loaded payload
        setPendingRestore(validation.backup);
      } catch {
        setImportErrorMessage('Error al leer el archivo JSON. Verifique que no esté dañado.');
      }
    };
    reader.onerror = () => {
      setImportErrorMessage('No se pudo leer el archivo seleccionado.');
    };
    reader.readAsText(file);

    // Reset input so re-selecting same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 5. Execute restore after user confirmation
  const handleConfirmRestore = () => {
    if (!pendingRestore) return;

    try {
      if (onRestoreBackup) {
        onRestoreBackup(pendingRestore);
      } else {
        Storage.restoreAllData(pendingRestore);
      }

      setFormData(pendingRestore.data.settings);
      setImportSuccessMessage(
        `¡Restauración exitosa! Se han importado ${pendingRestore.summary.clientsCount} clientes y ${pendingRestore.summary.loansCount} préstamos.`
      );
      setTimeout(() => setImportSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Error en restauración:', err);
      setImportErrorMessage('Hubo un error inesperado al restaurar los datos.');
    } finally {
      setPendingRestore(null);
    }
  };

  const liveBackupData = getLiveBackup();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Configuración del Sistema de Préstamos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ajuste de políticas crediticias, tasas de interés, moras, pasarelas de pago, datos fiscales y respaldo integral de datos.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
            ¡Cambios guardados con éxito!
          </span>
        )}
      </div>

      {/* CENTRAL ONLINE DATABASE & REAL-TIME STATUS CARD */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Base de Datos Central en Línea (Conexión Multidispositivo)
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  Activa en Tiempo Real
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Toda la información financiera, créditos, abonos de clientes y cobradores se sincroniza centralmente en la nube.
              </p>
            </div>
          </div>

          <SyncStatusBadge />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Motor de Datos</span>
            <span className="font-extrabold text-slate-900 mt-0.5 block">Servidor Central Express</span>
            <span className="text-[10px] text-slate-500">Persistencia segura en disco JSON</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Transmisión en Vivo</span>
            <span className="font-extrabold text-emerald-600 mt-0.5 block">Server-Sent Events (SSE)</span>
            <span className="text-[10px] text-slate-500">Actualizaciones instantáneas a móviles</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Endpoints de Red</span>
            <span className="font-mono text-indigo-600 font-bold mt-0.5 block truncate">/api/database & /api/events</span>
            <span className="text-[10px] text-slate-500">Acceso REST + Event Streaming</span>
          </div>
        </div>
      </div>

      {/* BACKUP & DATA SECURITY SECTION (PROMINENT CARDS) */}
      <div className="bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30 p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Respaldo y Exportación de Datos Financieros
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  JSON Seguro
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Descargue una copia de seguridad íntegra de toda la información contable, préstamos, clientes y comprobantes fiscales.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleOpenJsonPreview}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 rounded-xl transition"
              title="Ver estructura JSON en pantalla"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver JSON</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadBackup}
              disabled={isExporting}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generando...' : 'Descargar Respaldo JSON'}</span>
            </button>
          </div>
        </div>

        {/* Live Manifest Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Clientes Registrados</span>
              <Users className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <p className="text-base font-extrabold text-slate-900">
              {liveBackupData.summary.clientsCount}
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Préstamos en Base</span>
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-base font-extrabold text-slate-900">
              {liveBackupData.summary.loansCount}
              <span className="text-[10px] text-slate-400 font-normal ml-1.5">
                ({liveBackupData.summary.activeLoansCount} activos)
              </span>
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Pagos y Facturas</span>
              <Receipt className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-base font-extrabold text-slate-900">
              {liveBackupData.summary.paymentsCount} / {liveBackupData.summary.invoicesCount}
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Saldo por Cobrar</span>
              <FileCheck2 className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-base font-extrabold text-slate-900">
              {formData.currency}
              {liveBackupData.summary.totalOutstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Status / Feedback Alerts */}
        {exportSuccessMessage && (
          <div className="flex items-start space-x-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{exportSuccessMessage}</div>
          </div>
        )}

        {importSuccessMessage && (
          <div className="flex items-start space-x-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{importSuccessMessage}</div>
          </div>
        )}

        {importErrorMessage && (
          <div className="flex items-start space-x-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{importErrorMessage}</div>
          </div>
        )}

        {/* Bottom bar of backup card: Last backup info and Import capability */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Última exportación generada:{' '}
              <strong className="text-slate-700">
                {lastExportTime ? lastExportTime : 'Aún no realizada en esta sesión'}
              </strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-medium hover:bg-slate-50 transition text-xs shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Importar / Restaurar Respaldo</span>
            </button>
          </div>
        </div>
      </div>

      {/* RESTORE CONFIRMATION DIALOG */}
      {pendingRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5 text-amber-600">
                <AlertCircle className="w-6 h-6" />
                <h4 className="text-base font-bold text-slate-900">
                  Confirmar Restauración de Datos
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPendingRestore(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Está a punto de cargar un archivo de respaldo con fecha{' '}
              <strong className="text-slate-900">
                {new Date(pendingRestore.exportedAt).toLocaleString()}
              </strong>
              . Esta acción sustituirá los registros actuales por los contenidos en el respaldo.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Clientes a restaurar:</span>
                <span className="font-bold">{pendingRestore.summary.clientsCount}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Préstamos a restaurar:</span>
                <span className="font-bold">{pendingRestore.summary.loansCount}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Pagos registrados:</span>
                <span className="font-bold">{pendingRestore.summary.paymentsCount}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Facturas electrónicas:</span>
                <span className="font-bold">{pendingRestore.summary.invoicesCount}</span>
              </div>
              <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-2 font-semibold">
                <span>Saldo por cobrar en respaldo:</span>
                <span className="text-indigo-700 font-bold">
                  {pendingRestore.data.settings.currency}
                  {pendingRestore.summary.totalOutstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingRestore(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
              >
                <Check className="w-4 h-4" />
                <span>Sobrescribir y Restaurar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON PREVIEW MODAL */}
      {isJsonViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <FileJson className="w-5 h-5 text-indigo-600" />
                <span>Estructura del Respaldo JSON Financiero</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsJsonViewerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-950 text-slate-200 font-mono text-[11px] rounded-b-2xl">
              <pre className="whitespace-pre-wrap">{previewJsonString}</pre>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Identity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Datos Fiscales e Identidad Corporativa</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre o Razón Social</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Identificador Fiscal (RFC / CIF / RUC)</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Corporativo / Soporte</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Oficial de Contacto</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección Fiscal Completa</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Financial & Loan Policies */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Políticas de Crédito, Tasas y Recargos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Símbolo de Moneda</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Código ISO Moneda</label>
              <input
                type="text"
                value={formData.currencyCode}
                onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tasa de Interés Referencial (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.defaultAnnualRate}
                onChange={(e) => setFormData({ ...formData, defaultAnnualRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mora Diaria sobre Saldo Vencido (%)</label>
              <input
                type="number"
                step="0.05"
                value={formData.defaultLateFeeRate}
                onChange={(e) => setFormData({ ...formData, defaultLateFeeRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sistema de Amortización Predeterminado</label>
              <select
                value={formData.defaultAmortization}
                onChange={(e) => setFormData({ ...formData, defaultAmortization: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="french">Francés (Cuota fija periódica constante)</option>
                <option value="german">Alemán (Capital constante, cuotas decrecientes)</option>
                <option value="fixed">Interés Fijo / Simple (Microcréditos)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Gateways & Notifications */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Pasarelas de Pago y Automatizaciones</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800">Pasarela Stripe & Tarjetas en Línea</span>
                <p className="text-[11px] text-slate-500">Permite cobrar con tarjeta de crédito o débito a los clientes</p>
              </div>
              <input
                type="checkbox"
                checked={formData.stripeEnabled}
                onChange={(e) => setFormData({ ...formData, stripeEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800">Disparo de Recordatorios por WhatsApp</span>
                <p className="text-[11px] text-slate-500">Genera enlaces directos con mensaje dinámico y link de pago</p>
              </div>
              <input
                type="checkbox"
                checked={formData.whatsappAutomationEnabled}
                onChange={(e) => setFormData({ ...formData, whatsappAutomationEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800">Timbrado Fiscal Automático</span>
                <p className="text-[11px] text-slate-500">Genera factura electrónica CFDI al liquidar cada cuota</p>
              </div>
              <input
                type="checkbox"
                checked={formData.autoInvoicing}
                onChange={(e) => setFormData({ ...formData, autoInvoicing: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Inactivity Security & Session Lock Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Seguridad de Sesión y Bloqueo por Inactividad</span>
            </div>
            {onManualLock && (
              <button
                type="button"
                id="btn-settings-test-lock"
                onClick={onManualLock}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition"
              >
                <Lock className="w-3.5 h-3.5 mr-1" />
                <span>Bloquear Pantalla Ahora</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiempo de Inactividad para Bloquear la Pantalla
              </label>
              <select
                id="setting-inactivity-timeout"
                value={formData.inactivityTimeoutMinutes ?? 3}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inactivityTimeoutMinutes: parseInt(e.target.value, 10),
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              >
                <option value={1}>1 minuto (Modo Prueba Rápida / Máxima Seguridad)</option>
                <option value={2}>2 minutos</option>
                <option value={3}>3 minutos (Recomendado)</option>
                <option value={5}>5 minutos</option>
                <option value={10}>10 minutos</option>
                <option value={15}>15 minutos</option>
                <option value={0}>Desactivado (Solo bloqueo manual)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Al transcurrir este lapso sin movimientos de mouse o pulsaciones, la pantalla se bloqueará automáticamente solicitando la contraseña del rol asignado.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong className="block font-semibold">Protección de Datos en Operaciones</strong>
                <span>
                  Protege los datos financieros de clientes y préstamos contra accesos no autorizados si el operador deja desatendido su equipo o caja de cobro.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onResetData}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Datos de Demostración</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};

