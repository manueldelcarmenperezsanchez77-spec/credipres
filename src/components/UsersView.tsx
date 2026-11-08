import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  Building2, 
  Mail, 
  Phone, 
  Key, 
  Sliders, 
  FileText, 
  CreditCard,
  Receipt,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { SystemUser, UserRole } from '../types';

interface UsersViewProps {
  users: SystemUser[];
  currentUser: SystemUser;
  onOpenNewUserModal: () => void;
  onEditUser: (user: SystemUser) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onOpenNewUserModal,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.branch && u.branch.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const adminsCount = users.filter((u) => u.role === 'admin').length;
  const supervisorsCount = users.filter((u) => u.role === 'supervisor').length;
  const cobradoresCount = users.filter((u) => u.role === 'cobrador').length;
  const activeCount = users.filter((u) => u.status === 'active').length;

  const roleStyles = {
    admin: {
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      label: 'Administrador',
      icon: ShieldCheck,
      iconColor: 'text-indigo-600',
      avatarBg: 'bg-indigo-600',
    },
    supervisor: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Supervisor',
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      avatarBg: 'bg-blue-600',
    },
    cobrador: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Cobrador',
      icon: Smartphone,
      iconColor: 'text-emerald-600',
      avatarBg: 'bg-emerald-600',
    },
  };

  const handleDeleteClick = (user: SystemUser) => {
    if (user.id === currentUser.id) {
      alert('No puede eliminar su propio usuario activo.');
      return;
    }
    if (user.role === 'admin' && adminsCount <= 1) {
      alert('No se puede eliminar el único Administrador del sistema.');
      return;
    }
    setDeleteConfirmId(user.id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteUser(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Módulo de Usuarios & Seguridad RBAC
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {users.length} Registrados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de cuentas con roles de Administración, Supervisión de cartera y Cobranza en campo.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-new-user"
            onClick={onOpenNewUserModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs shadow-indigo-200 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Usuarios</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{users.length}</span>
            <span className="text-xs text-emerald-600 font-bold">{activeCount} activos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cuentas registradas en base</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-indigo-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Administración</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-indigo-950">{adminsCount}</span>
            <span className="text-xs text-indigo-600 font-semibold">Acceso total</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gestión general y fiscal</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Supervisión</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-blue-950">{supervisorsCount}</span>
            <span className="text-xs text-blue-600 font-semibold">Auditoría & NPL</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Monitoreo de cartera y mora</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Cobradores</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-950">{cobradoresCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">Ruta y Ventanilla</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gestión de cobro y recibos</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, usuario, correo, sucursal..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <span className="px-2 text-slate-500 text-[11px] font-bold">Rol:</span>
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                roleFilter === 'admin' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin ({adminsCount})
            </button>
            <button
              onClick={() => setRoleFilter('supervisor')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                roleFilter === 'supervisor' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Supervisor ({supervisorsCount})
            </button>
            <button
              onClick={() => setRoleFilter('cobrador')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                roleFilter === 'cobrador' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cobrador ({cobradoresCount})
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <span className="px-2 text-slate-500 text-[11px] font-bold">Estado:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'inactive' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inactivos
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Usuario & Nombre</th>
                <th className="py-3.5 px-4">Rol Asignado</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Sucursal / Zona</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Último Acceso</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron usuarios con los criterios de búsqueda especificados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const style = roleStyles[user.role];
                  const RoleIcon = style.icon;
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs ${style.avatarBg}`}
                          >
                            {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900">{user.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                                  Tú (Sesión actual)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          <span>{style.label}</span>
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center space-x-1.5 text-slate-700">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-1.5 text-slate-500 font-mono">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800">{user.branch || 'Sede Central'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            user.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Inactivo</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Last login */}
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">
                        {user.lastLogin ? (
                          new Date(user.lastLogin).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          <span className="text-slate-400 italic">Nunca</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onEditUser(user)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition"
                            title="Editar usuario"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onToggleUserStatus(user.id)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg transition disabled:opacity-30 ${
                              user.status === 'active'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'active' ? 'Suspender cuenta' : 'Activar cuenta'}
                          >
                            {user.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleDeleteClick(user)}
                            disabled={isCurrent}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-30"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">¿Eliminar este usuario?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Esta acción revocará de inmediato todas las credenciales de acceso para este usuario.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs"
              >
                Sí, Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RBAC Matrix & Role Capabilities */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Matriz de Permisos por Rol en el Sistema (RBAC)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Definición de privilegios operativos entre los perfiles de Administración, Supervisión y Cobranza.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-2.5 px-3">Módulo / Capacidad</th>
                <th className="py-2.5 px-3 text-center text-indigo-700">Administrador</th>
                <th className="py-2.5 px-3 text-center text-blue-700">Supervisor</th>
                <th className="py-2.5 px-3 text-center text-emerald-700">Cobrador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">Dashboard & Indicadores de Cartera</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="py-2 px-3 text-center text-slate-400">Sólo pagos propios</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">Otorgar & Aprobar Préstamos</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Aprobación</td>
                <td className="py-2 px-3 text-center text-slate-400">Solo consulta</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">Clientes & CRM de Solicitudes</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ruta asignada</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">Cobranza, Stripe & Recibos Inmediatos</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Conciliación</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Registro directo</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">Notificaciones & WhatsApp Masivo</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Envío masivo</td>
                <td className="py-2 px-3 text-center text-slate-400">Recordatorio manual</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">Facturación Electrónica SAT</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Emisión & Cancelación</td>
                <td className="py-2 px-3 text-center text-slate-400">Solo consulta</td>
                <td className="py-2 px-3 text-center text-slate-400">Sin acceso</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">Reportes Ejecutivos & Versión para Imprimir PDF</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Completo</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Auditoría</td>
                <td className="py-2 px-3 text-center text-slate-400">Sin acceso</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">Configuración Fiscal & Parámetros Globales</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="py-2 px-3 text-center text-slate-400">Sin acceso</td>
                <td className="py-2 px-3 text-center text-slate-400">Sin acceso</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-800">Gestión de Usuarios & Control de Roles</td>
                <td className="py-2 px-3 text-center text-indigo-600 font-bold">✓ Exclusivo Admin</td>
                <td className="py-2 px-3 text-center text-slate-400">Sin acceso</td>
                <td className="py-2 px-3 text-center text-slate-400">Sin acceso</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
