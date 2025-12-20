import React, { useState, useEffect } from 'react';
import { Task, Lead, TaskPriority, AIMode } from '../types';
import { CheckCircle, Circle, Calendar, Briefcase, Plus, Trash2, X, Flag, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { generateAIResponse } from '../services/geminiService';

interface TasksViewProps {
  tasks: Task[];
  leads: Lead[];
  onAddTask: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, leads, onAddTask, onToggleTask, onDeleteTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskLeadId, setNewTaskLeadId] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');

  // AI Suggestions State
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Notification State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'warning' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => {
    // Sort by priority first (High > Medium > Low) then by date
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  const completedTasks = tasks.filter(t => t.completed).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  // Check for upcoming deadlines on mount
  useEffect(() => {
    const checkDeadlines = () => {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const upcoming = tasks.filter(t => {
        if (t.completed) return false;
        // Parse date string (YYYY-MM-DD) to local date object to ensure accurate day comparison
        const parts = t.dueDate.split('-');
        const due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        // Check if due today (0) or within next 2 days (1, 2)
        return diffDays >= 0 && diffDays <= 2;
      });

      if (upcoming.length > 0) {
         showToast(`📅 Atención: Tienes ${upcoming.length} tareas que vencen pronto.`, 'warning');
      }
    };
    
    // Slight delay to allow view transition to finish before showing toast
    const timer = setTimeout(checkDeadlines, 800);
    return () => clearTimeout(timer);
  }, []);

  const fetchAISuggestions = async () => {
    if (leads.length === 0) return;
    
    setIsSuggesting(true);
    const leadsContext = JSON.stringify(leads.slice(0, 5).map(l => ({
        company: l.company,
        title: l.title,
        status: l.status,
        service: l.serviceType
    })));

    const prompt = `Basado en estos leads recientes, genera 4 sugerencias breves de tareas críticas que debería realizar hoy. Devuélvelas separadas por comas únicamente. No incluyas números ni explicaciones extra.`;
    
    try {
      const response = await generateAIResponse(prompt, AIMode.FAST, leadsContext);
      const suggestions = response.text.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 4);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching AI task suggestions:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchAISuggestions();
    }
  }, [isModalOpen]);

  const showToast = (message: string, type: 'success' | 'warning') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleSaveTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      dueDate: newTaskDate,
      completed: false,
      leadId: newTaskLeadId || undefined,
      priority: newTaskPriority
    };

    onAddTask(newTask);
    showToast('Tarea creada exitosamente', 'success');

    setNewTaskTitle('');
    setNewTaskDate(new Date().toISOString().split('T')[0]);
    setNewTaskLeadId('');
    setNewTaskPriority('medium');
    setIsModalOpen(false);
  };

  const getLeadName = (leadId?: string) => {
    if (!leadId) return null;
    return leads.find(l => l.id === leadId)?.company;
  };

  const isOverdue = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  const getPriorityBadge = (priority: TaskPriority) => {
      switch(priority) {
          case 'high':
              return (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                      <Flag size={10} fill="currentColor" /> Alta
                  </span>
              );
          case 'medium':
              return (
                  <span className="flex items-center gap-1 text-[10px] font-medium bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-800">
                      <Flag size={10} /> Media
                  </span>
              );
          case 'low':
              return (
                  <span className="flex items-center gap-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                      <Flag size={10} /> Baja
                  </span>
              );
      }
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Mis Tareas</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nueva Tarea
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Tasks */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            Pendientes <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
          </h3>
          
          <div className="space-y-3">
            {pendingTasks.length === 0 && (
                <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 text-sm">
                    No tienes tareas pendientes. ¡Buen trabajo!
                </div>
            )}
            {pendingTasks.map(task => (
              <div key={task.id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border flex items-start gap-3 group transition-all ${task.priority === 'high' ? 'border-red-200 dark:border-red-900/50 shadow-red-50 dark:shadow-none' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500'}`}>
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className="mt-1 text-slate-300 hover:text-blue-500 transition-colors"
                >
                  <Circle size={20} />
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                     <p className={`text-slate-800 dark:text-slate-100 font-medium leading-tight ${task.priority === 'high' ? 'text-slate-900 dark:text-white' : ''}`}>{task.title}</p>
                     <div className="flex-shrink-0 ml-2">
                        {getPriorityBadge(task.priority)}
                     </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) ? 'text-red-500 font-medium' : ''}`}>
                      <Calendar size={12} />
                      {new Date(task.dueDate).toLocaleDateString()} {isOverdue(task.dueDate) && '(Vencida)'}
                    </span>
                    
                    {task.leadId && (
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                        <Briefcase size={12} />
                        {getLeadName(task.leadId)}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            Completadas <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">{completedTasks.length}</span>
          </h3>
          
          <div className="space-y-3 opacity-70">
             {completedTasks.length === 0 && (
                <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 text-sm">
                    Aún no has completado tareas.
                </div>
            )}
            {completedTasks.map(task => (
              <div key={task.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className="mt-1 text-green-500"
                >
                  <CheckCircle size={20} />
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                     <p className="text-slate-500 dark:text-slate-400 line-through font-medium leading-tight">{task.title}</p>
                     <div className="opacity-50 scale-90 origin-right">
                       {getPriorityBadge(task.priority)}
                     </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {task.leadId && (
                      <span className="flex items-center gap-1">
                        <Briefcase size={12} />
                        {getLeadName(task.leadId)}
                      </span>
                    )}
                  </div>
                </div>
                 <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="text-slate-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-750">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Plus size={18} /> Nueva Tarea
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* AI Suggestions Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-purple-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sugerencias de KlierNav AI</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isSuggesting ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1">
                      <Loader2 size={12} className="animate-spin" /> Analizando leads...
                    </div>
                  ) : aiSuggestions.length > 0 ? (
                    aiSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setNewTaskTitle(suggestion)}
                        className="text-[10px] font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-lg border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No hay sugerencias disponibles</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título de la tarea</label>
                <input 
                  type="text"
                  placeholder="Ej: Enviar contrato firmado"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de vencimiento</label>
                    <input 
                    type="date"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
                    <select 
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Relacionar con Lead (Opcional)</label>
                <select 
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm shadow-sm"
                  value={newTaskLeadId}
                  onChange={(e) => setNewTaskLeadId(e.target.value)}
                >
                  <option value="">-- Ninguno --</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.company} - {lead.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveTask}
                  disabled={!newTaskTitle.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Crear Tarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      <div 
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 transform ${
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        } ${
          toast.type === 'success' 
            ? 'bg-slate-800 dark:bg-slate-700 text-white' 
            : 'bg-orange-500 text-white'
        }`}
      >
        {toast.type === 'success' ? <CheckCircle size={20} className="text-green-400" /> : <AlertTriangle size={20} />}
        <span className="font-medium text-sm">{toast.message}</span>
        <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-2 opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};