import React, { useState, useMemo } from 'react';
import { 
  Users, Shield, Plus, MoreVertical, Edit2, ShieldAlert, 
  CheckCircle, XCircle, Search, Filter, X, Save, 
  Trash2, UserPlus, ShieldCheck, Activity, Key, Mail, User as UserIcon
} from 'lucide-react';
import { ALL_USERS, ROLES, PERMISSIONS } from '../../constants';
import { User, Role, UserStatus, UserRole, Permission } from '../../types';
import { useAuth } from '../../AuthContext';

export const RolesManagement: React.FC = () => {
  const { user: authUser, checkPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  
  // Local State for simulation
  const [users, setUsers] = useState<User[]>(Object.values(ALL_USERS));
  const [roles, setRoles] = useState<Role[]>(ROLES);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [userModal, setUserModal] = useState<{ isOpen: boolean; user: Partial<User> | null }>({ isOpen: false, user: null });
  const [roleModal, setRoleModal] = useState<{ isOpen: boolean; role: Partial<Role> | null }>({ isOpen: false, role: null });

  const canManage = checkPermission('users_manage');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.roleId === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleSaveUser = () => {
    if (!userModal.user?.email || !userModal.user?.name) return;
    
    const userData = userModal.user as User;
    if (userData.id) {
      setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
    } else {
      const newUser: User = {
        ...userData,
        id: `u${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: userData.status || UserStatus.ACTIVE,
        roleId: userData.roleId || 'role_sales',
        role: roles.find(r => r.id === userData.roleId)?.name.toUpperCase() as UserRole || UserRole.SALES,
        avatarUrl: userData.avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`
      };
      setUsers(prev => [...prev, newUser]);
    }
    setUserModal({ isOpen: false, user: null });
  };

  const handleSaveRole = () => {
    if (!roleModal.role?.name) return;
    
    const roleData = roleModal.role as Role;
    if (roleData.id) {
      setRoles(prev => prev.map(r => r.id === roleData.id ? roleData : r));
    } else {
      const newRole: Role = {
        ...roleData,
        id: `role_custom_${Date.now()}`,
        permissions: roleData.permissions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRoles(prev => [...prev, newRole]);
    }
    setRoleModal({ isOpen: false, role: null });
  };

  const togglePermissionInRole = (permissionId: string) => {
    if (!roleModal.role) return;
    const currentPerms = roleModal.role.permissions || [];
    const newPerms = currentPerms.includes(permissionId)
      ? currentPerms.filter(id => id !== permissionId)
      : [...currentPerms, permissionId];
    
    setRoleModal({ ...roleModal, role: { ...roleModal.role, permissions: newPerms } });
  };

  const isPredefinedRole = (roleId: string) => 
    ['role_admin', 'role_manager', 'role_sales', 'role_support'].includes(roleId);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors p-6 overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="text-blue-600" /> Control de Accesos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configuración de seguridad y gobernanza de datos para KlierNav</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Users size={16} /> Usuarios
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'roles' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <ShieldAlert size={16} /> Roles & Permisos
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors">
        {activeTab === 'users' ? (
          <>
            {/* User Filters */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o email..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Todos los Roles</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <select 
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los Estados</option>
                <option value={UserStatus.ACTIVE}>Activos</option>
                <option value={UserStatus.INACTIVE}>Inactivos</option>
                <option value={UserStatus.SUSPENDED}>Suspendidos</option>
              </select>
              
              {canManage && (
                <button 
                  onClick={() => setUserModal({ isOpen: true, user: { roleId: 'role_sales', avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}` } })}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md ml-auto"
                >
                  <UserPlus size={16} /> Crear Usuario
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/50">
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700">Usuario</th>
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700">Rol Asignado</th>
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700">Estado</th>
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700">Última Conexión</th>
                    <th className="p-4 border-b border-slate-100 dark:border-slate-700 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatarUrl} className="w-9 h-9 rounded-full bg-slate-200 border border-slate-100 dark:border-slate-600 shadow-sm" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wide border border-blue-100 dark:border-blue-900/50">
                          {roles.find(r => r.id === u.roleId)?.name}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          {u.status === UserStatus.ACTIVE ? (
                            <><CheckCircle size={14} className="text-green-500" /> <span className="text-green-700 dark:text-green-400">Activo</span></>
                          ) : u.status === UserStatus.SUSPENDED ? (
                            <><ShieldAlert size={14} className="text-orange-500" /> <span className="text-orange-700 dark:text-orange-400">Suspendido</span></>
                          ) : (
                            <><XCircle size={14} className="text-red-500" /> <span className="text-red-700 dark:text-red-400">Inactivo</span></>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Pendiente'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setUserModal({ isOpen: true, user: u })}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                              title="Editar Usuario"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all" title="Ver Auditoría">
                                <Activity size={16} />
                            </button>
                            {canManage && u.id !== authUser.id && (
                                <button 
                                  onClick={() => setUsers(prev => prev.filter(user => user.id !== u.id))}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                  title="Eliminar Usuario"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400 dark:text-slate-500 italic">
                            No se encontraron usuarios con los criterios de búsqueda.
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar">
            {roles.map(role => (
              <div key={role.id} className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-full group hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="z-10">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Shield size={18} className={isPredefinedRole(role.id) ? "text-blue-500" : "text-purple-500"} /> 
                      {role.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{role.description}</p>
                  </div>
                  {(!isPredefinedRole(role.id) || authUser.role === UserRole.ADMIN) && (
                    <button 
                        onClick={() => setRoleModal({ isOpen: true, role: role })}
                        className="p-2 text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <Edit2 size={14} />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                          <Key size={10} /> Permisos
                      </p>
                      <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                        {role.permissions.length} total
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {role.permissions.slice(0, 10).map(pid => (
                            <span key={pid} className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded text-[9px] font-bold uppercase">
                            {PERMISSIONS.find(p => p.id === pid)?.name.split(' ')[1] || pid}
                            </span>
                        ))}
                        {role.permissions.length > 10 && (
                            <span className="px-2 py-0.5 text-slate-400 text-[9px] font-bold">+{role.permissions.length - 10}</span>
                        )}
                    </div>
                </div>

                {isPredefinedRole(role.id) && (
                    <div className="absolute -top-2 -right-2 opacity-5 pointer-events-none transform rotate-12">
                        <Shield size={80} className="text-blue-500" />
                    </div>
                )}
              </div>
            ))}
            
            {canManage && (
                <button 
                    onClick={() => setRoleModal({ isOpen: true, role: { permissions: [], name: '', description: '' } })}
                    className="p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-800 transition-all gap-2 bg-slate-50/30 group"
                >
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Plus size={24} />
                </div>
                <span className="font-bold text-sm">Crear Rol Personalizado</span>
                </button>
            )}
          </div>
        )}
      </div>

      {/* User Modal */}
      {userModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-750">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {userModal.user?.id ? <Edit2 size={18} className="text-blue-500" /> : <UserPlus size={18} className="text-blue-500" />}
                        {userModal.user?.id ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h3>
                    <button onClick={() => setUserModal({ isOpen: false, user: null })} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="relative group">
                            <img src={userModal.user?.avatarUrl} className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-700 shadow-lg" />
                            <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full border-2 border-white dark:border-slate-800 shadow-md hover:bg-blue-700 transition-all">
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nombre Completo</label>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white outline-none"
                                value={userModal.user?.name || ''}
                                onChange={(e) => setUserModal({ ...userModal, user: { ...userModal.user, name: e.target.value } })}
                                placeholder="Ej: Martin Gomez"
                            />
                          </div>
                      </div>

                      <div className="relative">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email Corporativo</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="email"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white outline-none"
                                value={userModal.user?.email || ''}
                                onChange={(e) => setUserModal({ ...userModal, user: { ...userModal.user, email: e.target.value } })}
                                placeholder="martin@kliernav.com"
                            />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Rol en el Sistema</label>
                              <select 
                                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none cursor-pointer"
                                  value={userModal.user?.roleId || ''}
                                  onChange={(e) => setUserModal({ ...userModal, user: { ...userModal.user, roleId: e.target.value } })}
                              >
                                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Estado de Cuenta</label>
                              <select 
                                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none cursor-pointer"
                                  value={userModal.user?.status || UserStatus.ACTIVE}
                                  onChange={(e) => setUserModal({ ...userModal, user: { ...userModal.user, status: e.target.value as UserStatus } })}
                              >
                                  <option value={UserStatus.ACTIVE}>Activo</option>
                                  <option value={UserStatus.INACTIVE}>Inactivo</option>
                                  <option value={UserStatus.SUSPENDED}>Suspendido</option>
                              </select>
                          </div>
                      </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-750 flex gap-3">
                    <button 
                        onClick={() => setUserModal({ isOpen: false, user: null })}
                        className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveUser}
                        disabled={!userModal.user?.name || !userModal.user?.email}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} /> Guardar
                    </button>
                </div>
              </div>
          </div>
      )}

      {/* Role Modal */}
      {roleModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-750">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ShieldAlert size={20} className="text-purple-500" />
                        {roleModal.role?.id ? 'Configurar Rol' : 'Crear Perfil Personalizado'}
                    </h3>
                    <button onClick={() => setRoleModal({ isOpen: false, role: null })} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Nombre del Perfil</label>
                            <input 
                                type="text"
                                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={roleModal.role?.name || ''}
                                disabled={isPredefinedRole(roleModal.role?.id || '')}
                                onChange={(e) => setRoleModal({ ...roleModal, role: { ...roleModal.role, name: e.target.value } })}
                                placeholder="Ej: Analista Externo"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Descripción</label>
                            <input 
                                type="text"
                                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={roleModal.role?.description || ''}
                                disabled={isPredefinedRole(roleModal.role?.id || '')}
                                onChange={(e) => setRoleModal({ ...roleModal, role: { ...roleModal.role, description: e.target.value } })}
                                placeholder="Breve explicación de las responsabilidades"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Key size={14} className="text-purple-500" /> Matriz de Permisos
                            </label>
                            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                                {roleModal.role?.permissions?.length} permisos habilitados
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                            {PERMISSIONS.map(perm => (
                                <label 
                                    key={perm.id} 
                                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                                        roleModal.role?.permissions?.includes(perm.id)
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm'
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <div className="mt-0.5">
                                      <input 
                                          type="checkbox"
                                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                          checked={roleModal.role?.permissions?.includes(perm.id) || false}
                                          onChange={() => togglePermissionInRole(perm.id)}
                                          disabled={isPredefinedRole(roleModal.role?.id || '') && authUser.role !== UserRole.ADMIN}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{perm.name}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{perm.description}</p>
                                    </div>
                                    {roleModal.role?.permissions?.includes(perm.id) && (
                                        <ShieldCheck size={14} className="ml-auto flex-shrink-0 text-blue-500" />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-750 flex gap-3 border-t border-slate-100 dark:border-slate-700">
                    <button 
                        onClick={() => setRoleModal({ isOpen: false, role: null })}
                        className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                    >
                        Cerrar
                    </button>
                    {(!isPredefinedRole(roleModal.role?.id || '') || authUser.role === UserRole.ADMIN) && (
                        <button 
                            onClick={handleSaveRole}
                            disabled={!roleModal.role?.name}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} /> Aplicar Cambios
                        </button>
                    )}
                </div>
              </div>
          </div>
      )}
    </div>
  );
};
