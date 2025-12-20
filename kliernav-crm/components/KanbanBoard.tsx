
import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, ServiceType, User } from '../types';
import { KANBAN_COLUMNS, CURRENT_USER, SERVICE_COLORS, ALL_USERS, SERVICE_HEX } from '../constants';
import { DollarSign, Calendar, Sparkles, Plus, Trash2, Edit2, Search, User as UserIcon, MessageCircle, AlertCircle, X, Clock, Tag, Briefcase, Zap, Filter, Save, History, CheckCircle } from 'lucide-react';
import { analyzeLeadWithAI } from '../services/geminiService';
import { useAuth } from '../AuthContext';
import { canEditLead } from '../services/permissionService';

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
}

interface Column {
  id: string;
  title: string;
}

interface AIAnalysisResult {
  nextSteps: string;
  winProbability: number;
  contactTone: string;
}

// Fixed missing CRM and AppWeb properties to satisfy Record<ServiceType, number>
const SERVICE_BASE_PRICES: Record<ServiceType, number> = {
  Landing: 180000,
  Ecommerce: 980000,
  Local: 180000,
  Automatizacion: 410000,
  Mobile: 1200000,
  CRO: 180000,
  CRM: 450000,
  AppWeb: 1500000,
  Other: 0
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onUpdateLead }) => {
  const { user: authUser } = useAuth();
  const [columns, setColumns] = useState<Column[]>(KANBAN_COLUMNS);
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  
  const [filterText, setFilterText] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(5000000);
  const [sameDayFilter, setSameDayFilter] = useState(false);
  
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{[key: string]: AIAnalysisResult | null}>({});
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [tempColTitle, setTempColTitle] = useState('');
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesText = 
        lead.title.toLowerCase().includes(filterText.toLowerCase()) ||
        lead.company.toLowerCase().includes(filterText.toLowerCase()) ||
        lead.tags.some(tag => tag.toLowerCase().includes(filterText.toLowerCase()));
      
      const matchesOwner = ownerFilter === 'all' || lead.ownerId === ownerFilter;
      const matchesService = serviceFilter === 'all' || lead.serviceType === serviceFilter;
      const matchesBudget = lead.value >= minBudget && lead.value <= maxBudget;
      const matchesSameDay = !sameDayFilter || lead.isSameDay;

      return matchesText && matchesOwner && matchesService && matchesBudget && matchesSameDay;
    });
  }, [leads, filterText, ownerFilter, serviceFilter, minBudget, maxBudget, sameDayFilter]);

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    const newId = newColumnName.toUpperCase().replace(/\s+/g, '_');
    setColumns([...columns, { id: newId, title: newColumnName }]);
    setNewColumnName('');
  };

  const handleDeleteColumn = (colId: string) => {
    const hasLeads = leads.some(l => l.status === colId);
    if (hasLeads) {
      alert("No puedes eliminar una columna que contiene tarjetas. Mueve las tarjetas primero.");
      return;
    }
    setColumns(columns.filter(c => c.id !== colId));
  };

  const startEditingColumn = (col: Column) => {
    setEditingColumnId(col.id);
    setTempColTitle(col.title);
  };

  const saveColumnTitle = () => {
    if (editingColumnId && tempColTitle.trim()) {
      setColumns(columns.map(c => c.id === editingColumnId ? { ...c, title: tempColTitle } : c));
      setEditingColumnId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedLeadId) {
      const lead = leads.find(l => l.id === draggedLeadId);
      if (lead && lead.status !== status) {
        onUpdateLead({ ...lead, status });
      }
      setDraggedLeadId(null);
    }
  };

  const handleAIAnalysis = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation(); 
    if (analyzingId) return; 
    
    setAnalyzingId(lead.id);
    setAiAnalysis(prev => ({...prev, [lead.id]: null})); 
    
    const context = `
      Empresa: ${lead.company}
      Proyecto: ${lead.title}
      Valor: $${lead.value}
      Status: ${lead.status}
      Tipo Servicio: ${lead.serviceType}
      Same Day: ${lead.isSameDay ? 'SI' : 'NO'}
      Tags: ${lead.tags.join(', ')}
    `;
    
    const resultJson = await analyzeLeadWithAI(context);
    
    if (resultJson) {
      try {
         const cleanJson = resultJson.replace(/```json/g, '').replace(/```/g, '').trim();
         const parsed: AIAnalysisResult = JSON.parse(cleanJson);
         setAiAnalysis(prev => ({...prev, [lead.id]: parsed}));
      } catch(e) {
         console.error("Failed to parse AI response", e);
      }
    }
    setAnalyzingId(null);
  };

  const startEditingLead = (lead: Lead) => {
    if (!canEditLead(authUser, lead)) {
      alert("No tienes permisos para editar este lead.");
      return;
    }
    setEditForm(lead);
    setIsEditingLead(true);
  };

  const handleSaveLeadEdit = () => {
    if (editForm.id) {
      onUpdateLead(editForm as Lead);
      setSelectedLead(editForm as Lead);
      setIsEditingLead(false);
    }
  };

  const handleServiceChange = (service: ServiceType) => {
    const updatedForm = { ...editForm, serviceType: service };
    if (!editForm.value || editForm.value === 0 || editForm.value === SERVICE_BASE_PRICES[editForm.serviceType || 'Other']) {
        updatedForm.value = SERVICE_BASE_PRICES[service];
    }
    setEditForm(updatedForm);
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 75) return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    if (prob >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
      
      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4 p-6 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm z-20">
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por empresa o proyecto..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          <div className="relative">
             <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none">
                <Briefcase size={14} />
             </div>
             <select 
                className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-colors"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
             >
                <option value="all">Servicios: Todos</option>
                {Object.keys(SERVICE_HEX).map(srv => (
                    <option key={srv} value={srv}>{srv}</option>
                ))}
             </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors">
             <DollarSign size={14} className="text-slate-500" />
             <div className="flex items-center gap-1">
               <input 
                  type="number" 
                  step="50000"
                  className="w-20 bg-transparent border-none focus:outline-none text-sm text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400"
                  value={minBudget}
                  onChange={(e) => setMinBudget(Number(e.target.value))}
                  placeholder="Min"
               />
               <span className="text-slate-400 text-[10px] font-bold">A</span>
               <input 
                  type="number" 
                  step="50000"
                  className="w-24 bg-transparent border-none focus:outline-none text-sm text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  placeholder="Max"
               />
             </div>
          </div>

          <div className="relative">
             <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none">
                <UserIcon size={14} />
             </div>
             <select 
                className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-colors"
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
             >
                <option value="all">Resp: Todos</option>
                {Object.values(ALL_USERS).map(user => (
                  <option key={user.id} value={user.id}>{user.name.split(' ')[0]}</option>
                ))}
             </select>
          </div>

          <button 
            onClick={() => setSameDayFilter(!sameDayFilter)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${sameDayFilter ? 'bg-[#00BCD4] text-white border-[#00BCD4] shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <Zap size={14} className={sameDayFilter ? 'fill-current' : ''} />
            SAME-DAY
          </button>

          <div className="flex-1" />

          <button 
            onClick={() => setIsEditingBoard(!isEditingBoard)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isEditingBoard 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'
            }`}
          >
            {isEditingBoard ? <CheckCircle size={16} /> : <Edit2 size={16} />}
            {isEditingBoard ? 'Guardar Tablero' : 'Personalizar Tablero'}
          </button>
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-x-auto p-6 pt-4 bg-slate-50/30 dark:bg-slate-900/30">
        <div className="flex space-x-4 h-full items-start">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 bg-slate-100/60 dark:bg-slate-800/40 rounded-xl flex flex-col max-h-full transition-all border border-slate-200 dark:border-slate-700/50 overflow-hidden ${
                draggedLeadId ? 'ring-2 ring-blue-500 ring-opacity-20 bg-blue-50/10 dark:bg-blue-900/5' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="p-4 font-semibold text-slate-700 dark:text-slate-200 sticky top-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-t-xl z-10 border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex justify-between items-center">
                  {isEditingBoard && editingColumnId === column.id ? (
                    <div className="flex items-center gap-1 w-full">
                      <input 
                        autoFocus
                        value={tempColTitle}
                        onChange={(e) => setTempColTitle(e.target.value)}
                        className="w-full text-sm px-2 py-1 rounded border border-blue-400 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        onKeyDown={(e) => e.key === 'Enter' && saveColumnTitle()}
                      />
                      <button onClick={saveColumnTitle} className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 p-1 rounded"><Plus size={14} className="rotate-45" /></button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 truncate">
                      {column.title}
                      <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {filteredLeads.filter(l => l.status === column.id).length}
                      </span>
                    </span>
                  )}
                  
                  {isEditingBoard && editingColumnId !== column.id && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditingColumn(column)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDeleteColumn(column.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar min-h-[500px]">
                {filteredLeads
                  .filter((lead) => lead.status === column.id)
                  .map((lead) => {
                    const analysis = aiAnalysis[lead.id];
                    const isAnalyzing = analyzingId === lead.id;
                    const owner = ALL_USERS[lead.ownerId];

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => { setSelectedLead(lead); setIsEditingLead(false); }}
                        className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group relative animate-fade-in ${lead.isSameDay ? 'border-l-4 border-l-[#00BCD4] border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${SERVICE_COLORS[lead.serviceType] || SERVICE_COLORS['Other']}`}>
                            {lead.serviceType}
                          </span>
                          {lead.isSameDay && (
                            <span className="text-[10px] font-extrabold text-[#00BCD4] flex items-center gap-0.5 bg-[#00BCD4]/10 px-1.5 py-0.5 rounded" title="SLA 24h">
                                <Zap size={10} fill="currentColor" /> SAME-DAY
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-0.5 truncate">{lead.company}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">{lead.title}</p>
                        
                        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-100">
                            <DollarSign size={12} className="text-green-500" />
                            {(lead.value / 1000).toFixed(0)}k
                          </div>
                          
                          {owner && (
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 pl-1 pr-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-600">
                                <img src={owner.avatarUrl} alt={owner.name} className="w-4 h-4 rounded-full shadow-sm" />
                                <span className="text-[10px] text-slate-600 dark:text-slate-300 truncate max-w-[60px] font-medium">{owner.name.split(' ')[0]}</span>
                            </div>
                          )}
                        </div>

                        <button 
                            onClick={(e) => handleAIAnalysis(e, lead)}
                            disabled={isAnalyzing}
                            className={`absolute bottom-3 right-3 p-1.5 rounded-full text-purple-400 bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all z-10 ${isAnalyzing ? 'opacity-0' : ''}`}
                            title="Analizar con KlierNav AI"
                        >
                            <Sparkles size={14} />
                        </button>
                      </div>
                    );
                  })}
                  
                  {filteredLeads.filter(l => l.status === column.id).length === 0 && (
                     <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-[10px] gap-2">
                        <Filter size={16} opacity={0.3} />
                        <span>Sin resultados</span>
                     </div>
                  )}
              </div>
            </div>
          ))}

          {isEditingBoard && (
            <div className="flex-shrink-0 w-72 h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center p-4 bg-white/30 dark:bg-slate-800/20 backdrop-blur-sm">
              <input 
                type="text" 
                placeholder="Nombre de la etapa..."
                className="w-full mb-3 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
              />
              <button 
                onClick={handleAddColumn}
                disabled={!newColumnName.trim()}
                className="flex items-center gap-1 text-sm bg-blue-600 text-white font-bold disabled:opacity-50 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Plus size={16} /> Crear Etapa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 transition-all scale-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-750">
               <div className="flex-1">
                  {isEditingLead ? (
                      <div className="space-y-3">
                        <input 
                            className="text-xl font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1 rounded w-full text-slate-800 dark:text-white"
                            value={editForm.company}
                            onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                            placeholder="Nombre de Empresa"
                        />
                         <input 
                            className="text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1 rounded w-full text-slate-600 dark:text-slate-300"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            placeholder="Título del Proyecto"
                        />
                      </div>
                  ) : (
                      <>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedLead.company}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{selectedLead.title}</p>
                      </>
                  )}
               </div>
               <div className="flex items-center gap-2">
                 {!isEditingLead ? (
                    <button 
                        onClick={() => startEditingLead(selectedLead)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition-all"
                    >
                        <Edit2 size={20} />
                    </button>
                 ) : (
                    <button 
                        onClick={handleSaveLeadEdit}
                        className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-full transition-all shadow-md"
                    >
                        <Save size={20} />
                    </button>
                 )}
                 <button 
                  onClick={() => { setSelectedLead(null); setIsEditingLead(false); }}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                 >
                   <X size={24} />
                 </button>
               </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
               
               {/* Key Details Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                     <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-bold"><DollarSign size={10} /> Presupuesto</p>
                     {isEditingLead ? (
                         <div className="flex items-center bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 px-2">
                            <span className="text-slate-400 text-xs">$</span>
                            <input 
                                type="number"
                                className="w-full p-1 bg-transparent text-slate-800 dark:text-white font-bold focus:outline-none"
                                value={editForm.value}
                                onChange={(e) => setEditForm({...editForm, value: Number(e.target.value)})}
                            />
                         </div>
                     ) : (
                        <p className="font-extrabold text-xl text-slate-800 dark:text-white">${selectedLead.value.toLocaleString()}</p>
                     )}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                     <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-bold"><UserIcon size={10} /> Responsable</p>
                     {isEditingLead ? (
                         <select 
                            className="w-full p-1 bg-white dark:bg-slate-700 text-xs rounded border border-slate-200 dark:border-slate-600"
                            value={editForm.ownerId}
                            onChange={(e) => setEditForm({...editForm, ownerId: e.target.value})}
                         >
                            {Object.values(ALL_USERS).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                         </select>
                     ) : (
                        <div className="flex items-center gap-2">
                            <img src={ALL_USERS[selectedLead.ownerId]?.avatarUrl} className="w-7 h-7 rounded-full border border-white dark:border-slate-600 shadow-sm" />
                            <p className="font-bold text-slate-800 dark:text-white truncate text-xs">{ALL_USERS[selectedLead.ownerId]?.name}</p>
                        </div>
                     )}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                     <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-bold"><Calendar size={10} /> Último Contacto</p>
                     <p className="font-bold text-slate-800 dark:text-white text-xs">{new Date(selectedLead.lastContact).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                   <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                     <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-bold"><Briefcase size={10} /> Estado Actual</p>
                     <span className="inline-block px-3 py-1 rounded-lg text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                        {columns.find(c => c.id === selectedLead.status)?.title || selectedLead.status}
                     </span>
                  </div>
               </div>

               {/* Services & AI Insights Section */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Tag size={16} className="text-slate-300" /> Clasificación del Servicio
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                {isEditingLead ? (
                                    <select 
                                        className="p-1.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-xs font-bold w-full"
                                        value={editForm.serviceType}
                                        onChange={(e) => handleServiceChange(e.target.value as ServiceType)}
                                    >
                                        {Object.keys(SERVICE_HEX).map(srv => <option key={srv} value={srv}>{srv}</option>)}
                                    </select>
                                ) : (
                                    <span className={`text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider ${SERVICE_COLORS[selectedLead.serviceType]}`}>
                                        {selectedLead.serviceType}
                                    </span>
                                )}
                                
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-[#00BCD4] focus:ring-[#00BCD4]"
                                        checked={isEditingLead ? editForm.isSameDay : selectedLead.isSameDay}
                                        onChange={(e) => isEditingLead && setEditForm({...editForm, isSameDay: e.target.checked})}
                                        disabled={!isEditingLead}
                                    />
                                    <span className={`text-xs font-bold ${isEditingLead ? (editForm.isSameDay ? 'text-[#00BCD4]' : 'text-slate-400') : (selectedLead.isSameDay ? 'text-[#00BCD4]' : 'text-slate-400')} flex items-center gap-1`}>
                                        <Zap size={12} fill={((isEditingLead ? editForm.isSameDay : selectedLead.isSameDay) ? "currentColor" : "none")} /> 
                                        ENTREGA SAME-DAY
                                    </span>
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(isEditingLead ? editForm.tags : selectedLead.tags)?.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-600 shadow-sm uppercase tracking-wide">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>

                  {aiAnalysis[selectedLead.id] && (
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-800/40 shadow-sm">
                          <h3 className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-5 flex items-center gap-2 uppercase tracking-widest">
                              <Sparkles size={16} className="text-purple-500" /> KlierNav AI Analysis
                          </h3>
                          <div className="space-y-5">
                              <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">Win Probability:</span>
                                  <div className="flex items-center gap-2">
                                     <div className="w-24 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-purple-500 transition-all duration-1000" 
                                            style={{ width: `${aiAnalysis[selectedLead.id]?.winProbability}%` }} 
                                        />
                                     </div>
                                     <span className="font-extrabold text-sm text-purple-700 dark:text-purple-400">{aiAnalysis[selectedLead.id]?.winProbability}%</span>
                                  </div>
                              </div>
                               <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">Suggested Tone:</span>
                                  <span className="font-extrabold text-[10px] bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-400 uppercase tracking-tighter">
                                    {aiAnalysis[selectedLead.id]?.contactTone}
                                  </span>
                              </div>
                              <div className="mt-2 pt-4 border-t border-purple-100 dark:border-purple-800/20">
                                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                                    <AlertCircle size={14} className="inline mr-2 text-purple-400" />
                                    "{aiAnalysis[selectedLead.id]?.nextSteps}"
                                  </p>
                              </div>
                          </div>
                      </div>
                  )}
               </div>

               {/* Activity History Log */}
               <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                      <History size={16} className="text-slate-300" /> Historial de Actividad
                  </h3>
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-10 pl-10 py-2">
                      <div className="relative">
                          <div className="absolute -left-[51px] w-6 h-6 rounded-full bg-blue-600 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center">
                             <CheckCircle size={10} className="text-white" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Hoy, 10:23 AM</p>
                          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                             <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                <span className="font-bold text-slate-900 dark:text-white">{authUser.name}</span> actualizó el estado a 
                                <span className="font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg mx-2 uppercase text-[10px] border border-blue-100 dark:border-blue-900/50"> 
                                   {columns.find(c => c.id === selectedLead.status)?.title || selectedLead.status}
                                </span>
                             </p>
                          </div>
                      </div>

                      <div className="relative">
                          <div className="absolute -left-[51px] w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
                             <MessageCircle size={10} className="text-slate-500 dark:text-slate-300" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Ayer, 16:45 PM</p>
                          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                             <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                "El cliente solicita presupuesto detallado para integración con MercadoPago. Se enviará propuesta comercial el lunes."
                             </p>
                          </div>
                      </div>

                      <div className="relative">
                          <div className="absolute -left-[51px] w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
                             <Plus size={10} className="text-slate-500 dark:text-slate-300" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">{new Date(selectedLead.lastContact).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
                          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                             <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Lead creado automáticamente desde el sitio web de <span className="font-bold">KlierNav Innovations</span>.
                             </p>
                          </div>
                      </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function CheckSquareIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}
