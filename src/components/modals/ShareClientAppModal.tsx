import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Share2, 
  MessageCircle, 
  Mail, 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import QRCode from 'qrcode';
import { Client, CompanySettings, Loan } from '../../types';

interface ShareClientAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  initialClientId?: string;
  settings: CompanySettings;
  loans?: Loan[];
  onOpenMobilePreview?: (clientId: string) => void;
}

export const ShareClientAppModal: React.FC<ShareClientAppModalProps> = ({
  isOpen,
  onClose,
  clients,
  initialClientId,
  settings,
  loans = [],
  onOpenMobilePreview,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || clients[0]?.id || ''
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'qrcode' | 'guide'>('share');
  const [sentSuccessChannel, setSentSuccessChannel] = useState<string | null>(null);

  // Sync selected client if initialClientId changes
  useEffect(() => {
    if (initialClientId) {
      setSelectedClientId(initialClientId);
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [initialClientId, clients]);

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientLoans = loans.filter((l) => l.clientId === currentClient?.id);
  const activeLoan = clientLoans.find((l) => l.status === 'active' || l.status === 'overdue') || clientLoans[0];

  // Generate the direct client portal link
  const clientAppUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?portal=cliente&clientId=${currentClient?.id || ''}`
    : `https://credigestion.app/?portal=cliente&clientId=${currentClient?.id || ''}`;

  // Generate QR Code dynamically
  useEffect(() => {
    if (!isOpen || !clientAppUrl) return;

    QRCode.toDataURL(
      clientAppUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#1e1b4b', // deep indigo
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setQrCodeDataUrl(url);
        } else {
          console.error('Error generating QR code:', err);
        }
      }
    );
  }, [isOpen, clientAppUrl]);

  if (!isOpen || !currentClient) return null;

  // Personalized WhatsApp message
  const whatsappMessage = `Hola ${currentClient.name}, te saludamos de ${settings.companyName}. ` +
    `Te compartimos el enlace para ingresar y descargar la aplicación móvil de clientes donde podrás consultar tu saldo, ver tu cronograma de cuotas, pagar en línea de forma segura y descargar tus comprobantes fiscales:\n\n` +
    `👉 Ingresa a tu App Móvil aquí:\n${clientAppUrl}\n\n` +
    `💡 Puedes instalarla directamente en la pantalla de inicio de tu celular (Android o iPhone). Cualquier duda estamos a tu disposición.`;

  const cleanPhone = (currentClient.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  // SMS link
  const smsBody = `Hola ${currentClient.name}, ingresa a tu App Móvil de ${settings.companyName} para ver tus préstamos y pagar en línea: ${clientAppUrl}`;
  const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(smsBody)}`;

  // Email link
  const emailSubject = `Enlace de Acceso a tu Aplicación Móvil - ${settings.companyName}`;
  const emailBody = `Estimado(a) ${currentClient.name},\n\nLe enviamos el acceso directo a su aplicación móvil de ${settings.companyName}.\n\nDesde su celular o computadora podrá:\n- Consultar su saldo actual y cuotas pendientes\n- Realizar pagos seguros con tarjeta o SPEI\n- Descargar recibos y facturas fiscales al instante\n- Mantenerse sincronizado en línea\n\nAcceda a su portal aquí:\n${clientAppUrl}\n\nAtentamente,\n${settings.companyName}\n${settings.phone}`;
  const emailUrl = `mailto:${currentClient.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(clientAppUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `app-cliente-${currentClient.name.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleActionClick = (channel: string) => {
    setSentSuccessChannel(channel);
    setTimeout(() => setSentSuccessChannel(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-emerald-100 bg-white/10 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3 text-amber-300 mr-1" />
                Portal de Autoservicio
              </span>
              <h3 className="text-xl font-extrabold text-white">
                Enviar Enlace de App al Cliente
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Envía el acceso directo con sincronización en línea para que el cliente consulte sus cuotas y pague desde su celular.
              </p>
            </div>
          </div>
        </div>

        {/* Client Selector & Navigation Tabs */}
        <div className="px-6 pt-5 pb-3 bg-slate-50 border-b border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700">Cliente Destinatario:</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.phone} ({c.documentId})
                </option>
              ))}
            </select>
          </div>

          {/* Tab buttons */}
          <div className="flex space-x-1 p-1 bg-slate-200/70 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('share')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                activeTab === 'share'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar por Canales</span>
            </button>

            <button
              onClick={() => setActiveTab('qrcode')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                activeTab === 'qrcode'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Escanear Código QR</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                activeTab === 'guide'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Guía de Instalación</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {sentSuccessChannel && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                ¡Enlace enviado con éxito a través de <strong>{sentSuccessChannel}</strong>!
              </span>
            </div>
          )}

          {/* TAB 1: SEND VIA CHANNELS */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              {/* Copy Direct Link Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Enlace Web Directo de la App:</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Sincronización en Vivo
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={clientAppUrl}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-white rounded-xl border border-slate-300 text-slate-600 truncate focus:outline-hidden"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Al abrir este enlace en su teléfono, {currentClient.name} accederá directamente a su cuenta sin requerir usuario interno.
                </p>
              </div>

              {/* Action Buttons: WhatsApp, SMS, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleActionClick('WhatsApp')}
                  className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 flex flex-col items-center justify-center space-y-1.5 transition text-center shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold">Enviar por WhatsApp</span>
                  <span className="text-[10px] text-emerald-700 font-medium">{currentClient.phone}</span>
                </a>

                {/* SMS */}
                <a
                  href={smsUrl}
                  onClick={() => handleActionClick('SMS')}
                  className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-900 flex flex-col items-center justify-center space-y-1.5 transition text-center shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold">Enviar por SMS</span>
                  <span className="text-[10px] text-blue-700 font-medium">Mensaje de Texto</span>
                </a>

                {/* Email */}
                <a
                  href={emailUrl}
                  onClick={() => handleActionClick('Correo')}
                  className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-purple-900 flex flex-col items-center justify-center space-y-1.5 transition text-center shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold">Enviar por Correo</span>
                  <span className="text-[10px] text-purple-700 font-medium truncate max-w-[120px]">{currentClient.email}</span>
                </a>
              </div>

              {/* Simulation / Direct Test */}
              <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Probar experiencia del cliente</h5>
                    <p className="text-[11px] text-slate-500">Abre el portal en una pestaña nueva o en el simulador</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {onOpenMobilePreview && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenMobilePreview(currentClient.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition"
                    >
                      Ver en Simulador
                    </button>
                  )}
                  <a
                    href={clientAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>Abrir Enlace</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QR CODE SCANNER */}
          {activeTab === 'qrcode' && (
            <div className="text-center space-y-4">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`Código QR para ${currentClient.name}`}
                    className="w-52 h-52 mx-auto rounded-xl shadow-md border-4 border-white bg-white"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Escanea para Abrir la App en el Celular
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Pídele al cliente que apunte con la cámara de su teléfono móvil a este código para ingresar a su cuenta al instante.
                </p>
              </div>

              <div className="flex justify-center items-center space-x-3 pt-2">
                <button
                  onClick={handleDownloadQr}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Imagen QR</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: INSTALLATION GUIDE (PWA) */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 p-4 rounded-2xl border border-indigo-100 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-900">Aplicación Web Progresiva (PWA)</h5>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    No requiere descargas pesadas desde Play Store ni App Store. Funciona en cualquier teléfono inteligente y se sincroniza en línea en tiempo real con la base de datos central.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Android Chrome */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                      🤖
                    </span>
                    <span>En Android (Google Chrome)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                    <li>Abrir el enlace recibido en Chrome.</li>
                    <li>Tocar los <strong>tres puntos (⋮)</strong> en la esquina superior derecha.</li>
                    <li>Seleccionar <strong>"Agregar a la pantalla principal"</strong> o <strong>"Instalar App"</strong>.</li>
                    <li>Aparecerá el ícono de CrediGestión en las aplicaciones del teléfono.</li>
                  </ol>
                </div>

                {/* iPhone Safari */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs">
                      🍏
                    </span>
                    <span>En iPhone (Safari iOS)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                    <li>Abrir el enlace en el navegador Safari.</li>
                    <li>Tocar el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba).</li>
                    <li>Desplazarse y tocar <strong>"Agregar al inicio"</strong>.</li>
                    <li>Tocar <strong>"Agregar"</strong> en la esquina superior.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Real-time synchronization footnote */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sincronización en línea activa para usuarios móviles</span>
            </span>
            <span>CrediGestión Cloud Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
