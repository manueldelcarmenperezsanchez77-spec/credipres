import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { SystemUser, UserRole } from '../../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: SystemUser | null;
  onSaveUser: (user: SystemUser) => void;
  currentUserId: string;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onSaveUser,
  currentUserId,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('cobrador');
  const [branch, setBranch] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setUsername(userToEdit.username);
      setEmail(userToEdit.email);
      setPhone(userToEdit.phone || '');
      setRole(userToEdit.role);
      setBranch(userToEdit.branch || '');
      setPassword(userToEdit.password || '');
      setStatus(userToEdit.status);
    } else {
      setName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setRole('cobrador');
      setBranch('Sucursal Centro');
      setPassword('clave123');
      setStatus('active');
    }
    setError(null);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }
    if (!username.trim()) {
      setError('El nombre de usuario es obligatorio.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Ingrese un correo electrónico válido.');
      return;
    }
    if (!password.trim()) {
      setError('La contraseña de acceso no puede quedar vacía.');
      return;
    }

    // Safety check: Cannot inactivate own user if admin
    if (userToEdit && userToEdit.id === currentUserId && status === 'inactive') {
      setError('No puede inactivar su propio usuario mientras tiene la sesión activa.');
      return;
    }

    const savedUser: SystemUser = {
      id: userToEdit ? userToEdit.id : `usr_${Date.now()}`,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      branch: branch.trim() || 'Sucursal Principal',
      password: password.trim(),
      status,
      createdAt: userToEdit ? userToEdit.createdAt : new Date().toISOString().split('T')[0],
      lastLogin: userToEdit?.lastLogin,
      avatarColor: role === 'admin' ? 'indigo' : role === 'supervisor' ? 'blue' : 'emerald',
    };

    onSaveUser(savedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {userToEdit ? 'Editar Usuario del Sistema' : 'Nuevo Usuario / Colaborador'}
              </h3>
              <p className="text-xs text-slate-500">
                Asigne rol de acceso: Administrador, Supervisor o Cobrador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role selector buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Rol de Operación Asignado
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  role === 'admin'
                    ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-900 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
                }`}
              >
                <span className="block text-xs font-bold">Administrador</span>
                <span className="text-[10px] text-slate-500">Control total</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('supervisor')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  role === 'supervisor'
                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
                }`}
              >
                <span className="block text-xs font-bold">Supervisor</span>
                <span className="text-[10px] text-slate-500">Auditoría & NPL</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('cobrador')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  role === 'cobrador'
                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
                }`}
              >
                <span className="block text-xs font-bold">Cobrador</span>
                <span className="text-[10px] text-slate-500">Rutas & Pagos</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Laura González Romero"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Username and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Usuario de Acceso
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej. laura.gonzalez"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="laura@empresa.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Password and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contraseña / PIN
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Branch / Zone and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sucursal o Zona Asignada
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Ej. Sucursal Oriente, Ruta 4"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estado del Usuario
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="active">Activo (Habilitado para ingresar)</option>
                <option value="inactive">Inactivo / Bloqueado</option>
              </select>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs shadow-indigo-200 transition"
            >
              {userToEdit ? 'Guardar Cambios' : 'Registrar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
