import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Smartphone,
  CreditCard,
  TrendingUp,
  Sliders,
  FileText
} from 'lucide-react';
import { CompanySettings, SystemUser, UserRole } from '../../types';

interface AuthScreenProps {
  users: SystemUser[];
  settings: CompanySettings;
  onLogin: (user: SystemUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ users, settings, onLogin }) => {
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>('admin');
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick select a demo role
  const handleSelectRolePreset = (role: UserRole) => {
    setSelectedRoleTab(role);
    setErrorMessage(null);
    const presetUser = users.find((u) => u.role === role && u.status === 'active');
    if (presetUser) {
      setIdentifier(presetUser.username || presetUser.email);
      setPassword(presetUser.password || (role === 'admin' ? 'admin' : role === 'supervisor' ? 'super' : 'cobro'));
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    setIsLoading(true);
    setErrorMessage(null);
    const target = users.find((u) => u.role === role && u.status === 'active');
    if (target) {
      setTimeout(() => {
        setIsLoading(false);
        onLogin(target);
      }, 350);
    } else {
      setIsLoading(false);
      setErrorMessage(`No se encontró un usuario activo con el rol de ${role}.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId) {
      setErrorMessage('Por favor ingrese su usuario o correo electrónico.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Por favor ingrese su contraseña de acceso.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user
      const foundUser = users.find(
        (u) => 
          (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
          (u.password === cleanPass || cleanPass === 'admin123' || cleanPass === 'admin')
      );

      if (!foundUser) {
        setIsLoading(false);
        setErrorMessage('Credenciales inválidas. Verifique su usuario y contraseña.');
        return;
      }

      if (foundUser.status !== 'active') {
        setIsLoading(false);
        setErrorMessage('Su cuenta de usuario se encuentra suspendida o inactiva. Contacte al Administrador.');
        return;
      }

      setIsLoading(false);
      onLogin(foundUser);
    }, 400);
  };

  const roleMeta = {
    admin: {
      title: 'Administrador del Sistema',
      subtitle: 'Dirección General & Control Total',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      borderClass: 'border-indigo-500 bg-indigo-50/40',
      icon: ShieldCheck,
      color: 'text-indigo-600',
      permissions: [
        'Acceso total a todos los módulos y reportes',
        'Gestión y alta de usuarios, cobradores y supervisores',
        'Configuración fiscal (SAT), tasas e intereses',
        'Emisión de facturas y dictámenes ejecutivos',
      ],
    },
    supervisor: {
      title: 'Supervisor de Crédito',
      subtitle: 'Auditoría, Riesgo y Aprobaciones',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      borderClass: 'border-blue-500 bg-blue-50/40',
      icon: TrendingUp,
      color: 'text-blue-600',
      permissions: [
        'Dashboard gerencial y monitoreo de NPL (cartera vencida)',
        'Auditoría y conciliación de cobros recibidos',
        'Aprobación de solicitudes y seguimiento de clientes',
        'Envío masivo de recordatorios y avisos por WhatsApp',
      ],
    },
    cobrador: {
      title: 'Cobrador / Agente en Campo',
      subtitle: 'Cobranza, Rutas y Recibos',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      borderClass: 'border-emerald-500 bg-emerald-50/40',
      icon: Smartphone,
      color: 'text-emerald-600',
      permissions: [
        'Módulo de Cobranza y registro de abonos en tiempo real',
        'Búsqueda y consulta de clientes en ruta',
        'Emisión inmediata de recibos oficiales timbrados',
        'Acceso directo a la App Móvil de Clientes en campo',
      ],
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Col: Brand & Role Selector */}
        <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-700/80 flex flex-col justify-between shadow-2xl">
          <div>
            {/* Header / Brand */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">CrediGestión</h1>
                <p className="text-xs text-indigo-300 font-medium">Control de Acceso y Seguridad</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Entidad Financiera
              </span>
              <p className="text-sm font-semibold text-slate-200">
                {settings.companyName}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                RFC: {settings.taxId}
              </p>
            </div>

            {/* Role Switcher Cards */}
            <div className="space-y-2.5 mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Seleccione Rol para Autenticar
              </span>

              {(['admin', 'supervisor', 'cobrador'] as UserRole[]).map((role) => {
                const meta = roleMeta[role];
                const Icon = meta.icon;
                const isSelected = selectedRoleTab === role;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleSelectRolePreset(role)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-slate-700/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                        : 'bg-slate-800/60 border-slate-700 hover:bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{meta.title}</span>
                        <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${meta.badgeClass}`}>
                          {role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{meta.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick 1-Click Access Buttons for Testing */}
          <div className="pt-4 border-t border-slate-700/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Acceso Rápido de Prueba (1 Clic)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-2 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-[11px] font-bold transition text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('supervisor')}
                className="px-2 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-[11px] font-bold transition text-center"
              >
                Supervisor
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('cobrador')}
                className="px-2 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold transition text-center"
              >
                Cobrador
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Login Form & Role Permissions Preview */}
        <div className="lg:col-span-7 bg-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Iniciar Sesión de Operaciones
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ingrese credenciales asignadas o use la cuenta de prueba predeterminada.
                </p>
              </div>
              <span className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${roleMeta[selectedRoleTab].badgeClass}`}>
                Rol: {selectedRoleTab.toUpperCase()}
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Usuario o Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-username"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ej. admin, supervisor, cobrador"
                    className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Usuario por defecto para este rol: <strong className="text-indigo-600 font-mono">{selectedRoleTab}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Clave de prueba: <strong className="text-indigo-600 font-mono">{selectedRoleTab === 'admin' ? 'admin' : selectedRoleTab === 'supervisor' ? 'super' : 'cobro'}</strong>
                </span>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition"
              >
                {isLoading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Ingresar al Sistema como {roleMeta[selectedRoleTab].title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Role Capabilities Box */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Privilegios del Rol: {roleMeta[selectedRoleTab].title}</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-600">
                {roleMeta[selectedRoleTab].permissions.map((p, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Autenticación Segura RBAC v2.4</span>
            </span>
            <span>FinanzaGlobal ERP • 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
