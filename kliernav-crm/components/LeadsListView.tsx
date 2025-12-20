import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types';
import { Search, MessageCircle, Edit2, Phone } from 'lucide-react';
import { KANBAN_COLUMNS, ALL_USERS } from '../constants';

interface LeadsListViewProps {
  leads: Lead[];
  onOpenChat: (leadId: string) => void;
}

export const LeadsListView: React.FC<LeadsListViewProps> = ({ leads, onOpenChat }) => {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesText = 
      lead.company.toLowerCase().includes(filterText.toLowerCase()) ||
      lead.title.toLowerCase().includes(filterText.toLowerCase()) ||
      lead.tags.some(tag => tag.toLowerCase().includes(filterText.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesText && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
        case LeadStatus.NEW: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case LeadStatus.WON: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case LeadStatus.LOST: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
  };

  const getStatusLabel = (status: string) => {
      return KANBAN_COLUMNS.find(c => c.id === status)?.title || status;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors p-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Base de Datos de Leads</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona todos tus contactos y oportunidades</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Buscar empresa, proyecto..." 
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>
            <select 
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="all">Todos los estados</option>
                {KANBAN_COLUMNS.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-750 sticky top-0 z-10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Empresa / Proyecto</th>
                        <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Responsable</th>
                        <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Estado</th>
                        <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Valor</th>
                        <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Tags</th>
                        <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Último Contacto</th>
                        <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredLeads.map((lead) => {
                        const owner = ALL_USERS[lead.ownerId];
                        return (
                        <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                            <td className="p-4">
                                <div>
                                    <div className="font-semibold text-slate-800 dark:text-slate-100">{lead.company}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{lead.title}</div>
                                </div>
                            </td>
                            <td className="p-4">
                                {owner ? (
                                    <div className="flex items-center gap-2">
                                        <img src={owner.avatarUrl} alt={owner.name} className="w-6 h-6 rounded-full bg-slate-200" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{owner.name.split(' ')[0]}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-slate-400 italic">Sin asignar</span>
                                )}
                            </td>
                            <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(lead.status)}`}>
                                    {getStatusLabel(lead.status)}
                                </span>
                            </td>
                            <td className="p-4 text-slate-700 dark:text-slate-300 font-medium text-sm">
                                ${lead.value.toLocaleString()}
                            </td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                    {lead.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] border border-slate-200 dark:border-slate-600">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                {new Date(lead.lastContact).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => onOpenChat(lead.id)}
                                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" 
                                        title="Mensaje Directo (WhatsApp)"
                                    >
                                        <MessageCircle size={18} />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                    <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors">
                                        <Phone size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )})}
                    {filteredLeads.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">
                                No se encontraron leads con los filtros actuales.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Footer / Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Mostrando {filteredLeads.length} registros</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50" disabled>Anterior</button>
                <button className="px-3 py-1 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700" disabled>Siguiente</button>
            </div>
        </div>
      </div>
    </div>
  );
};