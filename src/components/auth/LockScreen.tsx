import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  LogOut, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { CompanySettings, SystemUser } from '../../types';

interface LockScreenProps {
  currentUser: SystemUser;
  settings: CompanySettings;
  onUnlock: () => void;
  onSwitchAccount: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  currentUser,
  settings,
  onUnlock,
  onSwitchAccount,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lockedAt, setLockedAt] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setLockedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  const roleMeta = {
    admin: {
      label: 'Administrador',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      avatarBg: 'bg-indigo-600',
      description: 'Acceso total y control de módulos',
    },
    supervisor: {
      label: 'Supervisor',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      avatarBg: 'bg-blue-600',
      description: 'Supervisión de créditos y cobranzas',
    },
    cobrador: {
      label: 'Cobrador',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      avatarBg: 'bg-emerald-600',
      description: 'Gestión de pagos y cobranza en campo',
    },
  };

  const roleConfig = roleMeta[currentUser.role] || roleMeta.admin;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check credentials against the assigned user
    const expectedPassword = currentUser.password || 'admin123';

    // Allow user password or standard demo password matching role
    const isValid = 
      password === expectedPassword || 
      (currentUser.role === 'admin' && (password === 'admin123' || password === 'admin')) ||
      (currentUser.role === 'supervisor' && (password === 'super123' || password === 'super')) ||
      (currentUser.role === 'cobrador' && (password === 'cobra123' || password === 'cobro'));

    if (!isValid) {
      setErrorMessage('Contraseña incorrecta para el usuario asignado.');
      return;
    }

    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top security header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center space-x-1.5">
                <span>Sesión Bloqueada</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              </h2>
              <p className="text-[11px] text-slate-400">Inactividad detectada • {settings.companyName}</p>
            </div>
          </div>

          <div className="flex items-center text-slate-400 text-xs font-mono space-x-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{lockedAt}</span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-6">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold ${roleConfig.avatarBg} shadow-md shadow-slate-200 shrink-0`}>
              {currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-1">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {currentUser.name}
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${roleConfig.badgeClass}`}>
                  {roleConfig.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
              {currentUser.branch && (
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentUser.branch}</p>
              )}
            </div>
          </div>

          {/* Prompt */}
          <div className="mb-5">
            <p className="text-xs font-medium text-slate-600">
              Ingresa tu contraseña para reanudar el sistema con tu rol asignado de <strong className="text-slate-800">{roleConfig.label}</strong>:
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraseña de Acceso
              </label>
              <div className="relative">
                <input
                  id="lock-password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={`Contraseña de ${currentUser.name.split(' ')[0]}...`}
                  className={`w-full pl-3.5 pr-10 py-2.5 text-sm bg-white rounded-xl border ${
                    errorMessage 
                      ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                  } focus:outline-hidden focus:ring-4 transition text-slate-900`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMessage && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center space-x-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </p>
              )}
            </div>

            <button
              id="btn-unlock-submit"
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-sm shadow-indigo-200"
            >
              <Unlock className="w-4 h-4" />
              <span>Desbloquear y Continuar</span>
            </button>
          </form>

          {/* Secondary actions */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              id="btn-lock-switch-account"
              type="button"
              onClick={onSwitchAccount}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Cerrar sesión o ingresar con otro rol</span>
            </button>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protección de datos y sesión activa bajo rol <strong>{roleConfig.label}</strong></span>
        </div>
      </div>
    </div>
  );
};
