import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  MessageCircle, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Play, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { CompanySettings, Loan, NotificationLog } from '../types';
import { formatDate } from '../utils/finance';
import { PendingAlert, buildNotificationMessage, generateWhatsAppLink } from '../utils/notifications';

interface NotificationsViewProps {
  notifications: NotificationLog[];
  pendingAlerts: PendingAlert[];
  settings: CompanySettings;
  loans: Loan[];
  onTriggerBatchNotifications: () => void;
  onSendSingleNotification: (alert: PendingAlert) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  pendingAlerts,
  settings,
  loans,
  onTriggerBatchNotifications,
  onSendSingleNotification,
}) => {
  const [filterChannel, setFilterChannel] = useState<'all' | 'whatsapp' | 'sms' | 'email'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredLogs = notifications.filter((n) => {
    return filterChannel === 'all' ? true : n.channel === filterChannel;
  });

  const handleRunBatch = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onTriggerBatchNotifications();
      setIsProcessing(false);
    }, 800);
  };

  const getChannelBadge = (channel: NotificationLog['channel']) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <MessageCircle className="w-3 h-3 mr-1 text-emerald-600" />
            WhatsApp
          </span>
        );
      case 'sms':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Smartphone className="w-3 h-3 mr-1 text-blue-600" />
            SMS Gateway
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Mail className="w-3 h-3 mr-1 text-purple-600" />
            Correo SMTP
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sistema de Notificaciones Automáticas para Vencimientos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Recordatorios inteligentes vía WhatsApp, SMS y correo electrónico para prevenir y cobrar carteras en mora.
          </p>
        </div>

        <button
          onClick={handleRunBatch}
          disabled={isProcessing || pendingAlerts.length === 0}
          className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition ${
            pendingAlerts.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white active:bg-emerald-800'
          }`}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Disparando Alertas...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Ejecutar Envío Masivo ({pendingAlerts.length} pendientes)</span>
            </>
          )}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Alertas en Cola</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{pendingAlerts.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Vencimientos en 3 días, hoy y en mora</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Mensajes Enviados</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{notifications.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Bitácora histórica con confirmación</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Automatización</span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600">Activa</div>
          <p className="text-[11px] text-slate-500 mt-1">Disparo programado a las 09:00 hrs diariamente</p>
        </div>
      </div>

      {/* Pending Reminders Scanner Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Escáner en Vivo de Vencimientos y Enlaces de Pago
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {pendingAlerts.length} cuotas requieren atención inmediata
          </span>
        </div>

        {pendingAlerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Excelente: No hay vencimientos pendientes de notificación en este momento.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingAlerts.map((alert, idx) => {
              const { loan, installment, type, daysDiff } = alert;
              const payUrl = `https://credigestion.app/pay/${loan.id}`;
              const message = buildNotificationMessage(
                alert,
                settings.companyName,
                settings.currency,
                settings.currencyCode,
                payUrl
              );
              const waLink = generateWhatsAppLink(loan.clientPhone, message);

              return (
                <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{loan.clientName}</span>
                      <span className="text-xs text-slate-500">({loan.clientPhone})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        type === 'overdue' ? 'bg-rose-100 text-rose-800' :
                        type === 'due_today' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {type === 'overdue' ? `Atraso ${daysDiff} días` : type === 'due_today' ? 'Vence Hoy' : `Vence en ${daysDiff} días`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 font-mono">
                      "{message}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onSendSingleNotification(alert)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Enviar WhatsApp</span>
                    </a>

                    <button
                      onClick={() => onSendSingleNotification(alert)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Registrar Envío</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900">
            Bitácora de Notificaciones Despachadas
          </h3>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFilterChannel('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                filterChannel === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilterChannel('whatsapp')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                filterChannel === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setFilterChannel('sms')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                filterChannel === 'sms' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              SMS
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Destinatario</th>
                <th className="py-2.5 px-4">Canal</th>
                <th className="py-2.5 px-4">Mensaje / Contenido</th>
                <th className="py-2.5 px-4">Fecha & Hora</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>{log.clientName}</div>
                    <div className="text-[11px] text-slate-400">{log.clientPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    {getChannelBadge(log.channel)}
                  </td>
                  <td className="py-3 px-4 max-w-md truncate text-slate-700 font-mono text-[11px]">
                    {log.message}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center text-emerald-700 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Entregado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
