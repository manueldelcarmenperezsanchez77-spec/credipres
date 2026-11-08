import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  CreditCard, 
  ChevronRight,
  X,
  UserCheck,
  Hash,
  AlertCircle,
  Filter,
  Smartphone,
  Share2
} from 'lucide-react';
import { Client, CompanySettings, Loan } from '../types';
import { formatCurrency, formatDate } from '../utils/finance';
import { ShareClientAppModal } from './modals/ShareClientAppModal';

interface ClientsViewProps {
  clients: Client[];
  loans: Loan[];
  settings: CompanySettings;
  onOpenNewClient: () => void;
  onSelectClientForLoan: (client: Client) => void;
}

type SearchFieldFilter = 'all' | 'name' | 'documentId' | 'phone';

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const getDigitsOnly = (text: string) => text.replace(/\D/g, '');

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  loans,
  settings,
  onOpenNewClient,
  onSelectClientForLoan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState<SearchFieldFilter>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);
  const [sharingClient, setSharingClient] = useState<Client | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global search filtering with multi-attribute real-time matching
  const { filteredClients, matchDetails } = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      return { 
        filteredClients: clients, 
        matchDetails: new Map<string, 'name' | 'documentId' | 'phone' | 'email'>() 
      };
    }

    const normQuery = normalizeText(trimmed);
    const digitsQuery = getDigitsOnly(trimmed);
    const details = new Map<string, 'name' | 'documentId' | 'phone' | 'email'>();

    const results = clients.filter((client) => {
      const normName = normalizeText(client.name);
      const normDoc = normalizeText(client.documentId);
      const docDigits = getDigitsOnly(client.documentId);
      const phoneDigits = getDigitsOnly(client.phone);
      const normPhone = normalizeText(client.phone);
      const normEmail = normalizeText(client.email);

      const matchName = normName.includes(normQuery);
      const matchDoc = normDoc.includes(normQuery) || (digitsQuery.length >= 2 && docDigits.includes(digitsQuery));
      const matchPhone = normPhone.includes(normQuery) || (digitsQuery.length >= 2 && phoneDigits.includes(digitsQuery));
      const matchEmail = normEmail.includes(normQuery);

      if (fieldFilter === 'name') {
        if (matchName) {
          details.set(client.id, 'name');
          return true;
        }
        return false;
      }

      if (fieldFilter === 'documentId') {
        if (matchDoc) {
          details.set(client.id, 'documentId');
          return true;
        }
        return false;
      }

      if (fieldFilter === 'phone') {
        if (matchPhone) {
          details.set(client.id, 'phone');
          return true;
        }
        return false;
      }

      // 'all' mode: check all three primary targets (plus email)
      if (matchName) {
        details.set(client.id, 'name');
        return true;
      }
      if (matchDoc) {
        details.set(client.id, 'documentId');
        return true;
      }
      if (matchPhone) {
        details.set(client.id, 'phone');
        return true;
      }
      if (matchEmail) {
        details.set(client.id, 'email');
        return true;
      }

      return false;
    });

    return { filteredClients: results, matchDetails: details };
  }, [clients, searchTerm, fieldFilter]);

  // Keep selected client in sync when results change
  useEffect(() => {
    if (filteredClients.length > 0) {
      if (!selectedClient || !filteredClients.some((c) => c.id === selectedClient.id)) {
        setSelectedClient(filteredClients[0]);
      }
    } else {
      setSelectedClient(null);
    }
  }, [filteredClients, selectedClient]);

  // Keyboard shortcut (Escape to clear, / or Ctrl+K to focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const getScoreBadge = (score: number) => {
    if (score >= 750) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          Score {score} (Excelente)
        </span>
      );
    } else if (score >= 650) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
          Score {score} (Bueno)
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          Score {score} (Riesgo Medio)
        </span>
      );
    }
  };

  const clientLoans = selectedClient ? loans.filter((l) => l.clientId === selectedClient.id) : [];
  const clientTotalBorrowed = clientLoans.reduce((acc, l) => acc + l.principal, 0);
  const clientTotalPaid = clientLoans.reduce((acc, l) => acc + l.paidAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión Integral de Clientes (CRM Financiero)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Expedientes de prestatarios, scoring crediticio, capacidad de pago e historial de créditos.
          </p>
        </div>

        <button
          id="btn-register-new-client"
          onClick={onOpenNewClient}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* GLOBAL SEARCH BAR COMPONENT */}
      <div 
        id="clients-global-search-container"
        className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs transition-all duration-200"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className={`w-5 h-5 transition-colors ${searchTerm ? 'text-indigo-600' : 'text-slate-400'}`} />
            </div>
            <input
              id="clients-global-search-input"
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Búsqueda global: Ingrese nombre completo, cédula/DNI nacional o número de teléfono..."
              className="w-full pl-11 pr-10 py-3 text-sm bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            />
            {searchTerm && (
              <button
                id="btn-clear-client-search"
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition"
                title="Limpiar búsqueda (Esc)"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </div>
              </button>
            )}
          </div>

          {/* Quick Scope Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline-flex items-center">
              <Filter className="w-3 h-3 mr-1" />
              Filtrar por:
            </span>

            <button
              id="btn-filter-field-all"
              type="button"
              onClick={() => setFieldFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                fieldFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              Todos los campos
            </button>

            <button
              id="btn-filter-field-name"
              type="button"
              onClick={() => setFieldFilter('name')}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                fieldFilter === 'name'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Nombre</span>
            </button>

            <button
              id="btn-filter-field-documentId"
              type="button"
              onClick={() => setFieldFilter('documentId')}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                fieldFilter === 'documentId'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              <Hash className="w-3 h-3" />
              <span>Cédula / DNI</span>
            </button>

            <button
              id="btn-filter-field-phone"
              type="button"
              onClick={() => setFieldFilter('phone')}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                fieldFilter === 'phone'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              <Phone className="w-3 h-3" />
              <span>Teléfono</span>
            </button>
          </div>
        </div>

        {/* Search Feedback & Results Counter Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div id="clients-search-results-counter" className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">
              {filteredClients.length} de {clients.length}
            </span>
            <span>clientes encontrados en tiempo real</span>

            {searchTerm && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                Filtro activo: &ldquo;{searchTerm}&rdquo;
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="hidden sm:inline">
              Presione <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600 font-mono">Ctrl+K</kbd> para buscar
            </span>
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-indigo-600 hover:text-indigo-800 font-medium underline transition"
              >
                Restablecer vista
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Client List & Client Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client List with Matches */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-[650px]">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Directorio de Prestatarios</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md">
              {filteredClients.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No se encontraron clientes</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Ningún registro coincide con &ldquo;{searchTerm}&rdquo; en nombre, cédula o teléfono.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                >
                  <span>Limpiar búsqueda</span>
                </button>
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                const hasOverdue = loans.some((l) => l.clientId === client.id && l.status === 'overdue');
                const matchedType = matchDetails.get(client.id);

                return (
                  <div
                    key={client.id}
                    id={`client-list-item-${client.id}`}
                    onClick={() => setSelectedClient(client)}
                    className={`p-4 cursor-pointer transition flex items-center justify-between ${
                      isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm truncate">{client.name}</span>
                        {hasOverdue && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Tiene cuota atrasada" />
                        )}
                      </div>

                      {/* Client identifiers */}
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        <strong className="text-slate-700">{client.documentId}</strong> • {client.phone}
                      </p>

                      {/* Active Match Badge */}
                      {searchTerm && matchedType && (
                        <div className="mt-1 flex items-center">
                          <span className="inline-flex items-center text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded">
                            Coincidencia en:{' '}
                            {matchedType === 'name' && 'Nombre'}
                            {matchedType === 'documentId' && 'Cédula / DNI'}
                            {matchedType === 'phone' && 'Teléfono'}
                            {matchedType === 'email' && 'Correo'}
                          </span>
                        </div>
                      )}

                      <div className="mt-1.5 flex items-center space-x-2">
                        {getScoreBadge(client.creditScore)}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Columns: Detailed Client File */}
        {selectedClient ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Overview Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-indigo-100">
                    {selectedClient.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-slate-900">{selectedClient.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Verificado
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Doc. Oficial: <strong className="text-slate-700">{selectedClient.documentId}</strong> • Cliente desde {formatDate(selectedClient.registrationDate)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="btn-client-share-app"
                    type="button"
                    onClick={() => setSharingClient(selectedClient)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-xs transition"
                    title="Enviar enlace para acceder y descargar la app del cliente por WhatsApp, SMS o QR"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Enviar App Móvil</span>
                  </button>

                  <button
                    id="btn-client-new-loan"
                    onClick={() => onSelectClientForLoan(selectedClient)}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold shadow-xs transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Nuevo Préstamo</span>
                  </button>
                </div>
              </div>

              {/* Personal and Financial Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Teléfono Móvil</span>
                  </span>
                  <p className="text-xs font-semibold text-slate-800">{selectedClient.phone}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Correo Electrónico</span>
                  </span>
                  <p className="text-xs font-semibold text-slate-800 truncate">{selectedClient.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Ocupación / Ingreso</span>
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedClient.occupation} ({formatCurrency(selectedClient.monthlyIncome, settings.currency, settings.currencyCode)}/mes)
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Dirección Registrada</span>
                  </span>
                  <p className="text-xs font-semibold text-slate-800">{selectedClient.address}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Calificación de Riesgo</span>
                  </span>
                  <div className="pt-0.5">{getScoreBadge(selectedClient.creditScore)}</div>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                  <strong className="text-slate-700">Notas del Oficial de Crédito:</strong> {selectedClient.notes}
                </div>
              )}
            </div>

            {/* Loan History of this Client */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Historial de Préstamos Otorgados</h4>
                  <p className="text-xs text-slate-500">
                    Total prestado histórico: {formatCurrency(clientTotalBorrowed, settings.currency, settings.currencyCode)} • Total amortizado: {formatCurrency(clientTotalPaid, settings.currency, settings.currencyCode)}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                  {clientLoans.length} Contratos
                </span>
              </div>

              {clientLoans.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  Este cliente aún no tiene préstamos activos. Otórguele uno con el botón superior.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-indigo-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">{loan.id}</span>
                          <span className="text-xs text-slate-500">• {formatDate(loan.startDate)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            loan.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            loan.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {loan.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Monto: {formatCurrency(loan.principal, settings.currency, settings.currencyCode)} • {loan.termCount} cuotas • Saldo: {formatCurrency(loan.remainingBalance, settings.currency, settings.currencyCode)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800">
                          {loan.installments.filter((i) => i.status === 'paid').length} de {loan.termCount} cuotas pagadas
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            {filteredClients.length === 0 ? (
              <div className="space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">No hay cliente seleccionado</p>
                <p className="text-xs text-slate-400">Ajuste o limpie los términos de búsqueda para seleccionar un prestatario.</p>
              </div>
            ) : (
              'Seleccione un cliente de la lista para ver su expediente crediticio.'
            )}
          </div>
        )}
      </div>

      {/* Share Client App Modal */}
      {sharingClient && (
        <ShareClientAppModal
          isOpen={Boolean(sharingClient)}
          onClose={() => setSharingClient(null)}
          clients={clients}
          initialClientId={sharingClient.id}
          settings={settings}
          loans={loans}
        />
      )}
    </div>
  );
};
