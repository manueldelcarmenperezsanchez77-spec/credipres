import React from 'react';
import { 
  Building2, 
  Smartphone, 
  Calculator, 
  Bell, 
  CreditCard, 
  FileText, 
  Users, 
  Receipt, 
  TrendingUp, 
  Sliders, 
  PlusCircle,
  UserCheck,
  LogOut,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { CompanySettings, SystemUser } from '../types';

interface NavbarProps {
  currentView: 'admin' | 'mobile_app' | 'calculator';
  setCurrentView: (view: 'admin' | 'mobile_app' | 'calculator') => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;
  companySettings: CompanySettings;
  pendingAlertsCount: number;
  currentUser: SystemUser | null;
  onLogout: () => void;
  onSwitchUser: () => void;
  onLockScreen?: () => void;
  onOpenNewLoan: () => void;
  onOpenNewClient: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  adminTab,
  setAdminTab,
  companySettings,
  pendingAlertsCount,
  currentUser,
  onLogout,
  onSwitchUser,
  onLockScreen,
  onOpenNewLoan,
  onOpenNewClient,
}) => {
  const allAdminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, roles: ['admin', 'supervisor'] },
    { id: 'loans', label: 'Préstamos', icon: CreditCard, roles: ['admin', 'supervisor', 'cobrador'] },
    { id: 'clients', label: 'Clientes (CRM)', icon: Users, roles: ['admin', 'supervisor', 'cobrador'] },
    { id: 'payments', label: 'Cobranza & Pasarelas', icon: Receipt, roles: ['admin', 'supervisor', 'cobrador'] },
    { id: 'notifications', label: 'Alertas & WhatsApp', icon: Bell, badge: pendingAlertsCount, roles: ['admin', 'supervisor'] },
    { id: 'invoicing', label: 'Facturación Fiscal', icon: FileText, roles: ['admin'] },
    { id: 'reports', label: 'Reportes & Balance', icon: TrendingUp, roles: ['admin', 'supervisor'] },
    { id: 'users', label: 'Usuarios & Roles', icon: UserCheck, roles: ['admin'] },
    { id: 'settings', label: 'Configuración', icon: Sliders, roles: ['admin'] },
  ];

  const userRole = currentUser?.role || 'admin';
  const visibleTabs = allAdminTabs.filter((tab) => tab.roles.includes(userRole));

  const roleMeta = {
    admin: {
      label: 'Administrador',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      avatarBg: 'bg-indigo-600',
    },
    supervisor: {
      label: 'Supervisor',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      avatarBg: 'bg-blue-600',
    },
    cobrador: {
      label: 'Cobrador',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      avatarBg: 'bg-emerald-600',
    },
  };

  const currentRoleStyle = roleMeta[userRole];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">CrediGestión</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block">
                  En Producción
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                {companySettings.companyName}
              </p>
            </div>
          </div>

          {/* View Switcher: Admin ERP vs Mobile Client App vs Calculator */}
          <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              id="view-switch-admin"
              onClick={() => setCurrentView('admin')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Panel Operativo</span>
            </button>

            <button
              id="view-switch-mobile"
              onClick={() => setCurrentView('mobile_app')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'mobile_app'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>App Móvil Clientes</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Nativa
              </span>
            </button>

            <button
              id="view-switch-calculator"
              onClick={() => setCurrentView('calculator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'calculator'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-600" />
              <span>Cotizador Rápido</span>
            </button>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-2">
            {userRole !== 'cobrador' && (
              <>
                <button
                  id="btn-quick-new-client"
                  onClick={onOpenNewClient}
                  className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Nuevo Cliente</span>
                </button>

                <button
                  id="btn-quick-new-loan"
                  onClick={onOpenNewLoan}
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs shadow-indigo-200 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Otorgar Préstamo</span>
                </button>
              </>
            )}

            {/* Authenticated User Chip & Controls */}
            {currentUser && (
              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200">
                <button
                  id="btn-switch-user"
                  type="button"
                  onClick={onSwitchUser}
                  title="Cambiar usuario o rol"
                  className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition border border-slate-200/80 text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${currentRoleStyle.avatarBg} shadow-xs`}>
                    {currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[110px]">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${currentRoleStyle.badgeClass}`}>
                      {currentRoleStyle.label}
                    </span>
                  </div>
                </button>

                {onLockScreen && (
                  <button
                    id="btn-navbar-lock"
                    type="button"
                    onClick={onLockScreen}
                    title="Bloquear pantalla ahora (proteger sesión)"
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                )}

                <button
                  id="btn-logout"
                  type="button"
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View Switcher Row */}
        <div className="flex md:hidden py-2 border-t border-slate-100 gap-1 overflow-x-auto">
          <button
            onClick={() => setCurrentView('admin')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
              currentView === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Panel Operativo
          </button>
          <button
            onClick={() => setCurrentView('mobile_app')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
              currentView === 'mobile_app' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            App Móvil Clientes
          </button>
          <button
            onClick={() => setCurrentView('calculator')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
              currentView === 'calculator' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Cotizador
          </button>
        </div>

        {/* Secondary Subnavigation bar for Admin Mode */}
        {currentView === 'admin' && (
          <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
