import React, { useState } from 'react';
// Added missing 'X' import
import { History, Search, Download, Clock, User, ArrowRight, CheckCircle, AlertTriangle, Filter, Eye, X } from 'lucide-react';
import { AuditLog } from '../types';

const INITIAL_LOGS: AuditLog[] = [
  { id: '1', userId: 'u1', userName: 'Sergio Callier', action: 'CREATE_LEAD', module: 'leads', entityId: 'l11', entityType: 'Lead', timestamp: new Date().toISOString(), status: 'success' },
  { id: '2', userId: 'u2', userName: 'Ventas 1', action: 'UPDATE_LEAD', module: 'leads', entityId: 'l2', entityType: 'Lead', changesBefore: { status: 'NEW' }, changesAfter: { status: 'CONTACTED' }, timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'success' },
  { id: '3', userId: 'u1', userName: 'Sergio Callier', action: 'DELETE_TASK', module: 'tasks', entityId: 't5', entityType: 'Task', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'success' },
  { id: '4', userId: 'u3', userName: 'UX/UI 1', action: 'LOGIN_FAILED', module: 'auth', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'failed' },
  { id: '5', userId: 'u4', userName: 'Support 1', action: 'UPDATE_LEAD', module: 'leads', entityId: 'l1', changesBefore: { value: 900000 }, changesAfter: { value: 980000 }, timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'success' },
];

export const AuditLogView: React.FC = () => {
  const [logs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(l => 
    l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <History className="text-purple-500" /> Registro de Actividad
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Auditoría completa de cambios en el CRM</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filtrar actividad..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
              <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                <th className="p-4 border-b border-slate-100 dark:border-slate-700">Usuario</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-700">Acción</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-700">Módulo</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-700">Fecha / Hora</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-700">Estado</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-700 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm">
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                         <User size={12} className="text-slate-400" /> 
                      </div>
                      {log.userName}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Clock size={12} />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    {log.status === 'success' ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold">
                            <CheckCircle size={14} /> Éxito
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold">
                            <AlertTriangle size={14} /> Fallo
                        </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-750">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <History size={20} className="text-purple-500" /> Detalles del Evento
                  </h3>
                  <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-red-500 p-1 rounded-full transition-colors">
                      <X size={24} />
                  </button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Usuario</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedLog.userName}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Módulo</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedLog.module.toUpperCase()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ID Entidad</p>
                        <p className="text-xs font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded inline-block text-slate-600 dark:text-slate-400">{selectedLog.entityId || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha & Hora</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                    </div>
                 </div>

                 {selectedLog.changesBefore && selectedLog.changesAfter && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Comparativa de Cambios</p>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                                <p className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase mb-1">Valor Anterior</p>
                                <pre className="text-xs font-mono text-red-700 dark:text-red-300">{JSON.stringify(selectedLog.changesBefore, null, 2)}</pre>
                            </div>
                            <div className="flex justify-center py-1">
                                <ArrowRight size={20} className="text-slate-300 rotate-90" />
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                                <p className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase mb-1">Valor Nuevo</p>
                                <pre className="text-xs font-mono text-green-700 dark:text-green-300">{JSON.stringify(selectedLog.changesAfter, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                 )}
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-750 text-right">
                  <button onClick={() => setSelectedLog(null)} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-all">
                      Entendido
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};