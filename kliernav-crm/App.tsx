import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Kanban, Calendar as CalendarIcon, MessageCircle, Settings, Menu, UserCircle, CheckSquare, Moon, Sun, List, Sparkles, Target, History, Shield, Box } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { TasksView } from './components/TasksView';
import { AIAssistant } from './components/AIAssistant';
import { LeadsListView } from './components/LeadsListView';
import { MessagingView } from './components/MessagingView';
import { StrategicView } from './components/StrategicView';
import { RolesManagement } from './components/ConfigurationView/RolesManagement';
import { AuditLogView } from './components/AuditLogView';
import { ServicesDatabaseView } from './components/ServicesDatabaseView';
import { Logo } from './components/Logo';
import { INITIAL_LEADS, INITIAL_EVENTS, INITIAL_TASKS } from './constants';
import { Lead, CalendarEvent, Task, View, UserRole } from './types';
import { useAuth } from './AuthContext';
import { canAccessModule } from './services/permissionService';

interface NavItemProps {
  view: View;
  currentView: View;
  setCurrentView: (v: View) => void;
  icon: React.ElementType;
  label: string;
  isSidebarOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ view, currentView, setCurrentView, icon: Icon, label, isSidebarOpen }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        currentView === view
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={20} />
      {isSidebarOpen && <span className="whitespace-nowrap">{label}</span>}
    </button>
);

function App() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedChatLeadId, setSelectedChatLeadId] = useState<string | null>(null);
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents(prev => [...prev, newEvent]);
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleOpenChat = (leadId: string) => {
    setSelectedChatLeadId(leadId);
    setCurrentView(View.MESSAGING);
  };

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard leads={leads} />;
      case View.PIPELINE:
        return <KanbanBoard leads={leads} onUpdateLead={handleUpdateLead} />;
      case View.LEADS_LIST:
        return <LeadsListView leads={leads} onOpenChat={handleOpenChat} />;
      case View.TASKS:
        return (
          <TasksView 
            tasks={tasks} 
            leads={leads} 
            onAddTask={handleAddTask} 
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case View.CALENDAR:
        return <CalendarView events={events} leads={leads} onAddEvent={handleAddEvent} />;
      case View.STRATEGY:
        return <StrategicView />;
      case View.SERVICES:
        return <ServicesDatabaseView />;
      case View.MESSAGING:
        return <MessagingView leads={leads} initialLeadId={selectedChatLeadId} />;
      case View.AI_CHAT:
        return <div className="h-full p-6"><AIAssistant leads={leads} /></div>;
      case View.USERS_ROLES:
        return <RolesManagement />;
      case View.AUDIT_LOGS:
        return <AuditLogView />;
      case View.SETTINGS:
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Configuración de Perfil</h2>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-2xl transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-400 dark:text-slate-500">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={40} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{user.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full mt-1 inline-block font-bold">
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre Completo</label>
                   <input 
                    type="text" 
                    defaultValue={user.name} 
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                   <input 
                    type="email" 
                    defaultValue={user.email} 
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400" 
                    disabled 
                   />
                 </div>
                 <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-4 w-fit transition-colors font-bold shadow-md">Guardar Cambios</button>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard leads={leads} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 shadow-sm z-20`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 h-16 transition-colors">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 flex-shrink-0">
               <Logo className="w-full h-full" />
            </div>
            {isSidebarOpen && <span className="font-bold text-lg text-slate-800 dark:text-white whitespace-nowrap">KlierNav CRM</span>}
          </div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-500 transition-colors">
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Dashboard" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
          {canAccessModule(user, 'strategy') && (
            <NavItem view={View.STRATEGY} icon={Target} label="Estrategia" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
          )}
          <NavItem view={View.LEADS_LIST} icon={List} label="Base de Leads" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
          <NavItem view={View.SERVICES} icon={Box} label="Catálogo Servicios" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
          <NavItem view={View.PIPELINE} icon={Kanban} label="Pipeline" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
          <NavItem view={View.MESSAGING} icon={MessageCircle} label="Chat con Leads" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
          <NavItem view={View.TASKS} icon={CheckSquare} label="Tareas" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
          <NavItem view={View.CALENDAR} icon={CalendarIcon} label="Agenda" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
          
          <div className="pt-4 pb-2 px-4">
             {isSidebarOpen ? <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Tools</p> : <div className="h-px bg-slate-100 dark:bg-slate-700" />}
          </div>
          
          {canAccessModule(user, 'users') && (
            <NavItem view={View.USERS_ROLES} icon={Shield} label="Usuarios & Roles" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
          )}
          {canAccessModule(user, 'audit') && (
            <NavItem view={View.AUDIT_LOGS} icon={History} label="Audit Logs" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
          )}
          <NavItem view={View.AI_CHAT} icon={Sparkles} label="Asistente AI" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
        </nav>

        <div className="p-3 border-t border-slate-100 dark:border-slate-700 space-y-1">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            {isSidebarOpen && <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>}
          </button>
          <NavItem view={View.SETTINGS} icon={Settings} label="Configuración" currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shadow-sm z-10 transition-colors">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
            {currentView === View.DASHBOARD && 'Resumen Ejecutivo'}
            {currentView === View.STRATEGY && 'Planificación Estratégica'}
            {currentView === View.LEADS_LIST && 'Directorio de Leads'}
            {currentView === View.SERVICES && 'Catálogo de Servicios Digitales'}
            {currentView === View.PIPELINE && 'Gestión de Oportunidades'}
            {currentView === View.MESSAGING && 'Chat & WhatsApp con Leads'}
            {currentView === View.TASKS && 'Gestión de Tareas'}
            {currentView === View.CALENDAR && 'Agenda y Eventos'}
            {currentView === View.AI_CHAT && 'Centro de Inteligencia'}
            {currentView === View.USERS_ROLES && 'Control de Accesos'}
            {currentView === View.AUDIT_LOGS && 'Registro de Actividad'}
            {currentView === View.SETTINGS && 'Preferencias'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-800 dark:text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm">
                <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;