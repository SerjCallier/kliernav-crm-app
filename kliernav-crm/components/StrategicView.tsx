import React, { useState } from 'react';
import { Target, Lightbulb, Calendar, ArrowRight, CheckCircle, Circle, Archive, Plus, RefreshCw, Trash2, Clock, Infinity, Layers, Zap, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

// Local types for this component
interface StrategyItem {
  id: string;
  text: string;
  completed: boolean;
  week: 'idea_bank' | 'current_week' | 'next_week';
  createdAt: string;
  completedAt?: string;
  stageId?: string; // Link to Perpetual Cycle Stage
}

interface Niche {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface PerpetualStage {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  services: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

const PERPETUAL_STAGES: PerpetualStage[] = [
  { 
    id: 'stage_1', 
    title: '1. Impacto & Validación', 
    subtitle: 'Entrada SAME-DAY (Cashflow)', 
    icon: Zap,
    services: ['Landing Page', 'CRO Boost', 'MVP Mobile'],
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200'
  },
  { 
    id: 'stage_2', 
    title: '2. Infraestructura Venta', 
    subtitle: 'Conversión Transaccional', 
    icon:  DollarSignIcon, // Defined below to avoid conflict
    services: ['E-commerce Express', 'Integración MercadoPago'],
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  { 
    id: 'stage_3', 
    title: '3. Motor Perpetuo', 
    subtitle: 'Tráfico & Visibilidad Recurrente', 
    icon: GlobeIcon,
    services: ['SEO Local (GBP)', 'Ads Management', 'Reseñas'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  { 
    id: 'stage_4', 
    title: '4. Automatización LTV', 
    subtitle: 'Retención & Reactivación', 
    icon: Infinity,
    services: ['Flujos WhatsApp', 'Email Marketing', 'Bots IA'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

// Helper Icons
function DollarSignIcon(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
function GlobeIcon(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }

const MOCK_NICHES: Niche[] = [
  { id: 'landing', name: 'Landing & Presencia', description: 'Soluciones SAME-DAY', color: 'bg-cyan-500' },
  { id: 'ecommerce', name: 'E-commerce & Pagos', description: 'Tiendas Express', color: 'bg-green-500' },
  { id: 'local', name: 'Visibilidad Local', description: 'SEO & Google Maps', color: 'bg-orange-500' },
  { id: 'automation', name: 'Automatización', description: 'Workflows & Bots', color: 'bg-purple-500' },
  { id: 'mobile', name: 'Mobile & Apps', description: 'Desarrollo Nativo', color: 'bg-pink-500' }
];

// Helper for dynamic dates
const getRelDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
};

const INITIAL_STRATEGIES: Record<string, StrategyItem[]> = {
  landing: [
    { id: '1', text: 'Crear plantilla "Abogados Express" para SAME-DAY', completed: false, week: 'current_week', createdAt: getRelDate(-1), stageId: 'stage_1' },
    { id: '2', text: 'Testear copy para anuncios "Landing en 24h"', completed: true, week: 'current_week', createdAt: getRelDate(-2), completedAt: getRelDate(0), stageId: 'stage_1' },
  ],
  ecommerce: [
    { id: '3', text: 'Armar checklist de migración Tienda Nube -> WooCommerce', completed: false, week: 'next_week', createdAt: getRelDate(0), stageId: 'stage_2' },
    { id: '4', text: 'Buscar partner logístico para referir clientes', completed: false, week: 'idea_bank', createdAt: getRelDate(-5), stageId: 'stage_2' },
  ],
  local: [
    { id: '5', text: 'Automatizar reporte mensual de GBP', completed: false, week: 'current_week', createdAt: getRelDate(-1), stageId: 'stage_3' },
    { id: 'up1', text: 'Crear oferta: "Tu Landing necesita Tráfico" (Upsell Stage 1->3)', completed: false, week: 'idea_bank', createdAt: getRelDate(-2), stageId: 'stage_3' }
  ],
  automation: [
    { id: '6', text: 'Diseñar flujo para recuperación de carritos por WhatsApp', completed: false, week: 'current_week', createdAt: getRelDate(-3), stageId: 'stage_4' }
  ]
};

export const StrategicView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'execution' | 'cycle'>('cycle'); // Default to Cycle to show new feature
  const [activeNicheId, setActiveNicheId] = useState<string>('landing');
  const [strategies, setStrategies] = useState<Record<string, StrategyItem[]>>(INITIAL_STRATEGIES);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Fix: Explicitly cast the flattened values of strategies to StrategyItem[] to avoid "unknown" type errors
  const allStrategies: StrategyItem[] = (Object.values(strategies) as StrategyItem[][]).flat();

  const currentStrategies = strategies[activeNicheId] || [];

  const handleAddIdea = (stageId?: string) => {
    if (!newIdeaText.trim()) return;
    
    // If adding from Cycle view with a specific stage, default to a niche map or general
    const nicheToUse = stageId ? mapStageToNiche(stageId) : activeNicheId;

    const newItem: StrategyItem = {
      id: Date.now().toString(),
      text: newIdeaText,
      completed: false,
      week: 'idea_bank',
      createdAt: new Date().toISOString(),
      stageId: stageId
    };

    setStrategies(prev => ({
      ...prev,
      [nicheToUse]: [...(prev[nicheToUse] || []), newItem]
    }));
    setNewIdeaText('');
  };

  const mapStageToNiche = (stageId: string) => {
      switch(stageId) {
          case 'stage_1': return 'landing';
          case 'stage_2': return 'ecommerce';
          case 'stage_3': return 'local';
          case 'stage_4': return 'automation';
          default: return 'landing';
      }
  };

  const moveStrategy = (itemId: string, targetWeek: StrategyItem['week']) => {
    // Need to find which niche holds this item
    let nicheFound = activeNicheId;
    // Iterate to find correct niche if we are in 'all' mode (though currently we edit per niche)
    // Simplified: uses activeNicheId for Execution View logic
    
    setStrategies(prev => ({
      ...prev,
      [activeNicheId]: prev[activeNicheId].map(item => 
        item.id === itemId ? { ...item, week: targetWeek } : item
      )
    }));
  };

  const toggleComplete = (itemId: string, nicheIdOverride?: string) => {
    const targetNiche = nicheIdOverride || activeNicheId;
    setStrategies(prev => ({
      ...prev,
      [targetNiche]: prev[targetNiche].map(item => 
        item.id === itemId ? { 
          ...item, 
          completed: !item.completed,
          completedAt: !item.completed ? new Date().toISOString() : undefined
        } : item
      )
    }));
  };

  const deleteStrategy = (itemId: string, nicheIdOverride?: string) => {
      const targetNiche = nicheIdOverride || activeNicheId;
      setStrategies(prev => ({
          ...prev,
          [targetNiche]: prev[targetNiche].filter(item => item.id !== itemId)
      }));
  };

  const handleWeeklyReview = () => {
    if (confirm('¿Mover todas las tareas pendientes de "Semana Actual" a "Semana Próxima"?')) {
       setStrategies(prev => ({
        ...prev,
        [activeNicheId]: prev[activeNicheId].map(item => {
            if (item.week === 'current_week' && !item.completed) {
                return { ...item, week: 'next_week' };
            }
            return item;
        })
      }));
    }
  };

  const renderStrategyCard = (item: StrategyItem, showControls = true, nicheOverride?: string) => (
    <div key={item.id} className={`p-3 bg-white dark:bg-slate-800 rounded-lg border shadow-sm flex items-start gap-3 group transition-all ${item.completed ? 'opacity-60 border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'}`}>
      <button onClick={() => toggleComplete(item.id, nicheOverride)} className={`mt-0.5 flex-shrink-0 ${item.completed ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}>
        {item.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
          {item.text}
        </p>
        <span className="text-[10px] text-slate-400 mt-1 block">
            {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </div>

      {showControls && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.week === 'idea_bank' && (
                <button onClick={() => moveStrategy(item.id, 'current_week')} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="Mover a Semana Actual">
                    <ArrowRight size={14} />
                </button>
            )}
            {(item.week === 'current_week' && !item.completed) && (
                <button onClick={() => moveStrategy(item.id, 'next_week')} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded" title="Posponer">
                    <Clock size={14} />
                </button>
            )}
            <button onClick={() => deleteStrategy(item.id, nicheOverride)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                <Trash2 size={14} />
            </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      
      {/* Header Tabs */}
      <div className="px-6 pt-6 pb-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Target className="text-blue-600 dark:text-blue-400" /> Plan Estratégico
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {viewMode === 'cycle' ? 'Diseño de Ecosistema "Marketing Perpetuo"' : 'Ejecución Semanal por Nichos'}
                </p>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                <button
                    onClick={() => setViewMode('cycle')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'cycle' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <Infinity size={16} /> Esquema Perpetuo
                </button>
                <button
                    onClick={() => setViewMode('execution')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'execution' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <Layers size={16} /> Ejecución Semanal
                </button>
            </div>
        </div>

        {viewMode === 'execution' && (
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {MOCK_NICHES.map(niche => (
                <button
                key={niche.id}
                onClick={() => setActiveNicheId(niche.id)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex flex-col items-start ${
                    activeNicheId === niche.id 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                >
                <span>{niche.name}</span>
                <span className="text-[10px] font-normal opacity-70 mt-0.5">{niche.description}</span>
                </button>
            ))}
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-6">
        
        {/* VIEW MODE: CYCLE (PERPETUAL MARKETING) */}
        {viewMode === 'cycle' && (
             <div className="h-full overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {PERPETUAL_STAGES.map((stage) => {
                        // Fix: Explicitly use the correctly typed allStrategies list and cast s to StrategyItem if needed
                        const stageItems = (allStrategies as StrategyItem[]).filter(s => s.stageId === stage.id || (!s.stageId && mapStageToNiche(stage.id) === Object.keys(strategies).find(key => strategies[key].includes(s))));
                        
                        return (
                            <div key={stage.id} className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                {/* Stage Header */}
                                <div className={`p-4 border-b ${stage.borderColor} ${stage.bgColor} dark:bg-slate-750`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`font-bold ${stage.color} flex items-center gap-2`}>
                                            <stage.icon size={20} />
                                            {stage.title}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-3">{stage.subtitle}</p>
                                    
                                    <div className="flex flex-wrap gap-1">
                                        {stage.services.map(srv => (
                                            <span key={srv} className="px-2 py-0.5 bg-white/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] border border-slate-200/50 dark:border-slate-600">
                                                {srv}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Strategies List */}
                                <div className="flex-1 p-3 bg-slate-50/50 dark:bg-slate-800/50 space-y-3 overflow-y-auto min-h-[300px]">
                                    {/* Add New Quick Idea */}
                                    <div className="relative group">
                                         <input 
                                            type="text" 
                                            placeholder="Nueva estrategia..." 
                                            className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    setNewIdeaText(e.currentTarget.value);
                                                    handleAddIdea(stage.id);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                            onChange={(e) => setNewIdeaText(e.target.value)}
                                        />
                                        <div className="absolute right-2 top-2 text-slate-400">
                                            <Plus size={16} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {/* Fix: item is now correctly inferred/cast as StrategyItem */}
                                        {stageItems.map(item => renderStrategyCard(item as StrategyItem, false, mapStageToNiche(stage.id)))}
                                        {stageItems.length === 0 && (
                                            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs italic">
                                                Sin estrategias definidas para esta etapa.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Connector (Visual only for now) */}
                                <div className="p-2 bg-slate-100 dark:bg-slate-750 text-center border-t border-slate-200 dark:border-slate-700">
                                     <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 uppercase tracking-wider font-semibold">
                                        Siguiente Etapa <ArrowUpRight size={10} />
                                     </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <Infinity size={20} /> Filosofía del Marketing Perpetuo
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed max-w-4xl">
                        En KlierNav, no vendemos servicios aislados. Construimos ecosistemas. Un cliente entra por una 
                        <strong> Landing SAME-DAY</strong> (Etapa 1), se monetiza con <strong>E-commerce</strong> (Etapa 2), 
                        se nutre con tráfico constante vía <strong>SEO Local</strong> (Etapa 3) y se retiene indefinidamente con 
                        <strong> Automatización</strong> (Etapa 4). Este tablero te ayuda a visualizar y conectar esos puntos.
                    </p>
                </div>
             </div>
        )}

        {/* VIEW MODE: EXECUTION (WEEKLY) */}
        {viewMode === 'execution' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* Left Column: Idea Bank */}
            <div className="lg:col-span-4 flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <Lightbulb size={18} className="text-yellow-500" /> Banco de Ideas
                    </h3>
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-500">
                        {currentStrategies.filter(s => s.week === 'idea_bank').length}
                    </span>
                </div>
                
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Nueva idea estratégica..." 
                            className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                            value={newIdeaText}
                            onChange={(e) => setNewIdeaText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddIdea()}
                        />
                        <button 
                            onClick={() => handleAddIdea()}
                            className="absolute right-1.5 top-1.5 p-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {currentStrategies.filter(s => s.week === 'idea_bank' && !s.completed).map((item) => renderStrategyCard(item))}
                    {currentStrategies.filter(s => s.week === 'idea_bank').length === 0 && (
                        <div className="text-center p-8 text-slate-400 dark:text-slate-500 text-sm italic">
                            Sin ideas guardadas. ¡Empieza a escribir!
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Calendar / Execution */}
            <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
                
                {/* Current Week */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Calendar size={18} className="text-blue-600" /> Semana Actual
                        </h3>
                        <button 
                            onClick={handleWeeklyReview}
                            className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1 rounded-full shadow-sm"
                            title="Mover pendientes a la próxima semana"
                        >
                            <RefreshCw size={12} /> Revisión Semanal
                        </button>
                    </div>
                    <div className="p-4 space-y-3 min-h-[150px]">
                        {currentStrategies.filter(s => s.week === 'current_week' && !s.completed).length === 0 && (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
                                Arrastra ideas aquí o añade tareas para esta semana.
                            </div>
                        )}
                        {currentStrategies.filter(s => s.week === 'current_week' && !s.completed).map((item) => renderStrategyCard(item))}
                    </div>
                </div>

                {/* Next Week */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col opacity-90">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <ArrowRight size={18} className="text-slate-400" /> Próxima Semana
                        </h3>
                    </div>
                    <div className="p-4 space-y-3 min-h-[100px]">
                        {currentStrategies.filter(s => s.week === 'next_week' && !s.completed).map((item) => renderStrategyCard(item))}
                        {currentStrategies.filter(s => s.week === 'next_week' && !s.completed).length === 0 && (
                            <div className="text-xs text-slate-400 dark:text-slate-600 italic">
                                Planificación vacía.
                            </div>
                        )}
                    </div>
                </div>

                {/* History (Completed) Toggle */}
                <div className="flex justify-end">
                     <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors border ${showHistory ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border-slate-300 dark:border-slate-500' : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        <Archive size={16} /> {showHistory ? 'Ocultar Historial' : 'Ver Completadas'}
                    </button>
                </div>

                {/* History (Completed) */}
                {showHistory && (
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-3 text-sm uppercase tracking-wider">Historial Completado</h3>
                        <div className="space-y-2">
                            {currentStrategies.filter(s => s.completed).length === 0 && (
                                <p className="text-sm text-slate-400">No hay tareas completadas aún.</p>
                            )}
                            {currentStrategies.filter(s => s.completed).map((item) => renderStrategyCard(item))}
                        </div>
                    </div>
                )}

            </div>
            </div>
        )}
      </div>
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
