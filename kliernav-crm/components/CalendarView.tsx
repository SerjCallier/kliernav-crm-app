import React, { useState, useMemo } from 'react';
import { CalendarEvent, Lead } from '../types';
import { ChevronLeft, ChevronRight, Video, Phone, Clock, Plus, X, Briefcase, RefreshCw, CheckCircle, Globe } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  leads: Lead[];
  onAddEvent: (event: CalendarEvent) => void;
}

// Helper to get relative dates for demo purposes so events always show up
const getRelativeDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

// Mock Google Calendar Events (Simulation)
// In a real app, these would come from the Google Calendar API
const MOCK_GOOGLE_EVENTS: CalendarEvent[] = [
  { id: 'g-1', title: 'Dentista (GCal)', date: getRelativeDate(0), time: '08:30', type: 'meeting', source: 'google' },
  { id: 'g-2', title: 'Almuerzo familiar', date: getRelativeDate(2), time: '13:00', type: 'meeting', source: 'google' },
  { id: 'g-3', title: 'Vuelo a NY', date: getRelativeDate(5), time: '06:00', type: 'meeting', source: 'google' }
];

export const CalendarView: React.FC<CalendarViewProps> = ({ events, leads, onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  
  // Google Integration State
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventType, setNewEventType] = useState<'meeting' | 'call' | 'deadline'>('meeting');
  const [newEventLeadId, setNewEventLeadId] = useState<string>('');
  const [addToGoogleCalendar, setAddToGoogleCalendar] = useState(false);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setSelectedDay(`${currentDate.getFullYear()}-${monthStr}-${dayStr}`);
    
    // Reset form
    setNewEventTitle('');
    setNewEventTime('09:00');
    setNewEventType('meeting');
    setNewEventLeadId('');
    setAddToGoogleCalendar(isGoogleSynced); // Default to true if synced
    
    setIsModalOpen(true);
  };

  const handleSyncGoogle = () => {
      // ---------------------------------------------------------
      // REAL INTEGRATION NOTES:
      // 1. Load Google API Script (gapi)
      // 2. gapi.auth2.init({ client_id: 'YOUR_CLIENT_ID', scope: 'https://www.googleapis.com/auth/calendar' })
      // 3. gapi.auth2.getAuthInstance().signIn()
      // 4. gapi.client.calendar.events.list(...)
      // ---------------------------------------------------------
      
      setIsSyncing(true);
      setTimeout(() => {
          setIsGoogleSynced(!isGoogleSynced);
          setIsSyncing(false);
      }, 1500);
  };

  const handleSaveEvent = () => {
    if (!newEventTitle.trim() || !selectedDay) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: selectedDay,
      time: newEventTime,
      type: newEventType,
      leadId: newEventLeadId || undefined,
      source: 'crm'
    };

    onAddEvent(newEvent);

    if (addToGoogleCalendar && isGoogleSynced) {
        // Logic to push to Google Calendar API would go here
        // gapi.client.calendar.events.insert(...)
        console.log("Event synced to Google Calendar:", newEvent);
    }

    setIsModalOpen(false);
  };

  // Combine local CRM events with Google events if synced
  const allEvents = useMemo(() => {
      if (isGoogleSynced) {
          return [...events, ...MOCK_GOOGLE_EVENTS];
      }
      return events;
  }, [events, isGoogleSynced]);

  const getEventsForDay = (day: number) => {
    const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentDate.getFullYear()}-${monthStr}-${dayStr}`;
    return allEvents.filter(e => e.date === dateStr);
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="p-6 h-full overflow-y-auto relative bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Google Sync Button */}
            <button 
                onClick={handleSyncGoogle}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isGoogleSynced 
                        ? 'bg-white dark:bg-slate-800 text-green-600 border border-green-200 dark:border-green-900' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
                {isSyncing ? (
                    <RefreshCw size={16} className="animate-spin" />
                ) : isGoogleSynced ? (
                    <CheckCircle size={16} /> 
                ) : (
                    <Globe size={16} />
                )}
                {isSyncing ? 'Conectando...' : isGoogleSynced ? 'Google Calendar Sincronizado' : 'Conectar Google Calendar'}
            </button>

            <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"><ChevronLeft size={20} /></button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"><ChevronRight size={20} /></button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-4">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center font-semibold text-slate-500 dark:text-slate-400 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {blanks.map((_, i) => <div key={`blank-${i}`} className="h-32 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl" />)}
        
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div 
              key={day} 
              onClick={() => handleDayClick(day)}
              className={`min-h-[120px] p-2 border rounded-xl bg-white dark:bg-slate-800 relative hover:shadow-md transition-all cursor-pointer group ${
                isToday ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-100 dark:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                 <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {day}
                 </span>
                 <button className="text-slate-300 hover:text-blue-500 dark:text-slate-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={16} />
                 </button>
              </div>
              
              <div className="mt-2 space-y-1">
                {dayEvents.map(event => {
                  const isGoogle = event.source === 'google';
                  return (
                    <div 
                        key={event.id} 
                        className={`text-xs p-1.5 rounded-md truncate flex flex-col gap-0.5 shadow-sm border ${
                        isGoogle 
                            ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 border-blue-100 dark:border-blue-800'
                            : event.type === 'meeting' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800' 
                            : event.type === 'call' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800' 
                            : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800'
                        }`}
                    >
                        <div className="flex items-center gap-1 font-semibold">
                            {isGoogle ? <Globe size={10} /> : (
                                <>
                                    {event.type === 'meeting' && <Video size={10} />}
                                    {event.type === 'call' && <Phone size={10} />}
                                    {event.type === 'deadline' && <Clock size={10} />}
                                </>
                            )}
                            {event.time}
                        </div>
                        <span className="truncate">{event.title}</span>
                        {event.leadId && !isGoogle && (
                            <div className="flex items-center gap-1 text-[9px] opacity-80 mt-0.5">
                                <Briefcase size={8} />
                                <span className="truncate">
                                    {leads.find(l => l.id === event.leadId)?.company || 'Lead'}
                                </span>
                            </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-750">
                <h3 className="font-semibold text-slate-800 dark:text-white">Nuevo Evento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 text-sm">{selectedDay}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora</label>
                        <input 
                            type="time" 
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={newEventTime}
                            onChange={(e) => setNewEventTime(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                        <select 
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={newEventType}
                            onChange={(e) => setNewEventType(e.target.value as 'meeting' | 'call' | 'deadline')}
                        >
                            <option value="meeting">Reunión</option>
                            <option value="call">Llamada</option>
                            <option value="deadline">Entrega</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                    <input 
                        type="text" 
                        placeholder="Ej: Demo con Cliente"
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lead Asociado (Opcional)</label>
                    <select 
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        value={newEventLeadId}
                        onChange={(e) => setNewEventLeadId(e.target.value)}
                    >
                        <option value="">-- Sin asignar --</option>
                        {leads.map(lead => (
                            <option key={lead.id} value={lead.id}>
                                {lead.company} - {lead.title}
                            </option>
                        ))}
                    </select>
                </div>
                
                {isGoogleSynced && (
                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="gcal-check"
                            checked={addToGoogleCalendar}
                            onChange={(e) => setAddToGoogleCalendar(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                        />
                        <label htmlFor="gcal-check" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none flex items-center gap-1">
                            Añadir a Google Calendar <Globe size={12} className="text-slate-400" />
                        </label>
                    </div>
                )}

                <div className="pt-4 flex gap-3">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveEvent}
                        disabled={!newEventTitle.trim()}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Guardar Evento
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};