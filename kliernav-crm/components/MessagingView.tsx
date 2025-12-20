
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lead, Conversation, DirectMessage, ServiceType, View } from '../types';
import { INITIAL_CONVERSATIONS, MESSAGE_TEMPLATES, KANBAN_COLUMNS } from '../constants';
import { 
  Search, Send, MoreVertical, Paperclip, Check, CheckCheck, 
  MessageCircle, RefreshCw, Zap, Sparkles, BrainCircuit, 
  Info, Loader2, Link2, Unlink, Wifi, WifiOff, Settings, 
  CheckSquare, ExternalLink, Calendar, UserPlus, Trash2, ChevronDown
} from 'lucide-react';
import { generateReplySuggestion } from '../services/geminiService';

interface MessagingViewProps {
  leads: Lead[];
  initialLeadId?: string | null;
  onUpdateLead?: (lead: Lead) => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({ leads, initialLeadId, onUpdateLead }) => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeadId || null);
  const [inputText, setInputText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dropdown states
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);

  // WhatsApp Integration Simulation State
  const [isConnected, setIsConnected] = useState(true);
  const [connectionStep, setConnectionStep] = useState<'idle' | 'linking' | 'fetching'>('idle');

  // AI State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(true);

  // Tracking tasks inside chat
  const [completedFollowUps, setCompletedFollowUps] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialLeadId) {
        setSelectedLeadId(initialLeadId);
        setConversations(prev => {
            if (prev.some(c => c.leadId === initialLeadId)) {
                return prev.map(c => c.leadId === initialLeadId ? { ...c, unreadCount: 0 } : c);
            }
            const newConv: Conversation = {
                leadId: initialLeadId,
                messages: [],
                unreadCount: 0,
                lastMessageAt: new Date().toISOString()
            };
            return [newConv, ...prev];
        });
    }
  }, [initialLeadId]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedLeadId, conversations]);

  const activeConversation = conversations.find(c => c.leadId === selectedLeadId);
  const activeLead = leads.find(l => l.id === selectedLeadId);

  // Filtered Conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const lead = leads.find(l => l.id === conv.leadId);
      if (!lead) return false;
      const contentMatch = conv.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()));
      return lead.company.toLowerCase().includes(searchQuery.toLowerCase()) || contentMatch;
    });
  }, [conversations, searchQuery, leads]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedLeadId) return;

    const newMessage: DirectMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        text: inputText,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };

    setConversations(prev => prev.map(c => {
        if (c.leadId === selectedLeadId) {
            return {
                ...c,
                messages: [...c.messages, newMessage],
                lastMessageAt: newMessage.timestamp
            };
        }
        return c;
    }));

    setInputText('');
    
    // Simulate WhatsApp Cloud API status updates
    setTimeout(() => {
        setConversations(prev => prev.map(c => {
            if (c.leadId === selectedLeadId) {
                return {
                    ...c,
                    messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m)
                };
            }
            return c;
        }));
    }, 1200);

    setTimeout(() => {
        setConversations(prev => prev.map(c => {
            if (c.leadId === selectedLeadId) {
                return {
                    ...c,
                    messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m)
                };
            }
            return c;
        }));
    }, 2500);
  };

  const handleMagicReply = async () => {
      if (!selectedLeadId || !activeConversation || isGeneratingAI) return;
      
      setIsGeneratingAI(true);
      const historyText = activeConversation.messages.slice(-5).map(m => `${m.senderId}: ${m.text}`).join('\n');
      const leadContext = `Empresa: ${activeLead?.company}, Servicio: ${activeLead?.serviceType}, Valor: ${activeLead?.value}`;
      
      try {
          const suggestion = await generateReplySuggestion(historyText, leadContext);
          if (suggestion) setInputText(suggestion);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingAI(false);
      }
  };

  const handleToggleWhatsApp = () => {
    if (isConnected) {
        if (confirm("¿Seguro que deseas desconectar la API de WhatsApp? Los mensajes dejarán de sincronizarse.")) {
            setIsConnected(false);
            setConnectionStep('idle');
        }
        return;
    }
    setIsSyncing(true);
    setConnectionStep('linking');
    setTimeout(() => {
        setConnectionStep('fetching');
        setTimeout(() => {
            setIsConnected(true);
            setIsSyncing(false);
            setConnectionStep('idle');
        }, 1000);
    }, 1000);
  };

  const handleStatusChange = (newStatus: string) => {
    if (activeLead && onUpdateLead) {
        onUpdateLead({ ...activeLead, status: newStatus });
        setChatMenuOpen(false);
        // Simulate notification
        alert(`Lead movido a: ${KANBAN_COLUMNS.find(c => c.id === newStatus)?.title}`);
    }
  };

  const toggleFollowUp = (task: string) => {
    setCompletedFollowUps(prev => 
        prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
    );
  };

  const formatTime = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentTemplates = activeLead ? MESSAGE_TEMPLATES[activeLead.serviceType] || MESSAGE_TEMPLATES['Other'] : [];

  return (
    <div className="flex h-full bg-[#0b141a] overflow-hidden text-slate-200">
      
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-[#111b21] border-r border-slate-700/50 flex flex-col flex-shrink-0">
        <div className="p-4 bg-[#202c33] flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h2 className="font-bold text-white flex items-center gap-2">
                      <MessageCircle className="text-[#25D366]" size={20} /> WhatsApp CRM
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#25D366] animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {isSyncing ? 'Sincronizando...' : isConnected ? 'Conexión Activa' : 'Desconectado'}
                      </span>
                  </div>
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setSidebarMenuOpen(!sidebarMenuOpen)}
                        className={`p-1.5 rounded-full transition-colors ${sidebarMenuOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                    >
                        <MoreVertical size={18} />
                    </button>
                    {sidebarMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-[#233138] rounded-lg shadow-xl border border-slate-700 z-50 animate-fade-in overflow-hidden">
                            <button className="w-full text-left px-4 py-3 text-xs hover:bg-[#111b21] flex items-center gap-3 border-b border-slate-700/50">
                                <CheckSquare size={14} /> Marcar todo como leído
                            </button>
                            <button onClick={() => { setIsSyncing(true); setSidebarMenuOpen(false); setTimeout(() => setIsSyncing(false), 2000); }} className="w-full text-left px-4 py-3 text-xs hover:bg-[#111b21] flex items-center gap-3 border-b border-slate-700/50">
                                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> Forzar Sincronización
                            </button>
                            <button className="w-full text-left px-4 py-3 text-xs hover:bg-[#111b21] flex items-center gap-3">
                                <Settings size={14} /> Configuración de Webhook
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <button 
                onClick={handleToggleWhatsApp}
                disabled={isSyncing}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border border-transparent ${
                    isSyncing ? 'bg-slate-700 text-slate-400 cursor-wait' :
                    isConnected ? 'bg-transparent text-red-400 border-red-900/30 hover:bg-red-900/20' :
                    'bg-[#25D366] hover:bg-[#128C7E] text-[#111b21]'
                }`}
            >
                {isSyncing ? <RefreshCw className="animate-spin" size={14} /> : 
                 isConnected ? <Unlink size={14} /> : <Link2 size={14} />}
                {isSyncing ? 'Conectando...' : isConnected ? 'Desconectar API' : 'Conectar WhatsApp'}
            </button>
        </div>

        <div className="p-3 bg-[#111b21]">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={14} />
                <input 
                    type="text" 
                    placeholder="Buscar chat o número..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#202c33] border-none rounded-lg text-xs focus:ring-1 focus:ring-[#25D366] outline-none text-slate-200 placeholder:text-slate-500"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#111b21]">
            {!isConnected && !isSyncing && (
                <div className="p-12 text-center">
                    <WifiOff size={40} className="mx-auto text-slate-700 mb-3" />
                    <p className="text-xs text-slate-500 font-medium">Conecta la API para visualizar conversaciones</p>
                </div>
            )}
            
            {(isConnected || isSyncing) && filteredConversations.map(conv => {
                const lead = leads.find(l => l.id === conv.leadId);
                const lastMsg = conv.messages[conv.messages.length - 1];
                if (!lead) return null;
                return (
                    <div 
                        key={conv.leadId}
                        onClick={() => setSelectedLeadId(conv.leadId)}
                        className={`p-3 flex gap-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-slate-800/30 ${selectedLeadId === conv.leadId ? 'bg-[#2a3942]' : ''}`}
                    >
                        <div className="relative flex-shrink-0">
                             <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold overflow-hidden shadow-md">
                                {lead.company.substring(0,2).toUpperCase()}
                             </div>
                             <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#25D366] border-2 border-[#111b21] rounded-full flex items-center justify-center">
                                <MessageCircle size={8} className="text-[#111b21] fill-current" />
                             </div>
                             {conv.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 bg-[#25D366] text-[#111b21] text-[10px] font-bold rounded-full border-2 border-[#111b21] items-center justify-center">
                                    {conv.unreadCount}
                                </span>
                             )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className={`font-semibold truncate text-sm ${conv.unreadCount > 0 ? 'text-white' : 'text-slate-200'}`}>
                                    {lead.company}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-medium">{lastMsg ? formatTime(lastMsg.timestamp) : ''}</span>
                            </div>
                            <p className="text-xs truncate text-slate-500 flex items-center gap-1">
                                {lastMsg?.senderId === 'me' && <CheckCheck size={12} className={lastMsg.status === 'read' ? 'text-[#53bdeb]' : 'text-slate-500'} />}
                                {lastMsg ? lastMsg.text : 'Escribiendo...'}
                            </p>
                        </div>
                    </div>
                );
            })}
            {filteredConversations.length === 0 && searchQuery && (
                <div className="p-8 text-center text-slate-600 text-xs">No se encontraron resultados</div>
            )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b141a] relative">
        {activeConversation && activeLead && isConnected ? (
            <div className="flex h-full">
                {/* Chat Column */}
                <div className="flex-1 flex flex-col">
                    <div className="h-16 bg-[#202c33] border-b border-slate-700/30 px-4 flex items-center justify-between z-10 shadow-sm">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                                 {activeLead.company.substring(0,2).toUpperCase()}
                             </div>
                             <div className="min-w-0">
                                 <h3 className="font-bold text-white truncate text-sm flex items-center gap-2">
                                     {activeLead.company} 
                                     <div className="w-2 h-2 bg-[#25D366] rounded-full" />
                                 </h3>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                                    {activeLead.serviceType}
                                 </p>
                             </div>
                        </div>
                        <div className="flex gap-4 text-slate-400 items-center">
                             <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-[#25D366] rounded-full text-[9px] font-extrabold border border-green-500/20 uppercase tracking-tighter">
                                 <Wifi size={10} /> En Línea
                             </span>
                             <button onClick={() => setAiAnalysisOpen(!aiAnalysisOpen)} className={`p-2 rounded-lg transition-all ${aiAnalysisOpen ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10' : 'hover:bg-slate-700'}`} title="Panel Inteligente">
                                <BrainCircuit size={20} />
                             </button>
                             <div className="relative">
                                <button 
                                    onClick={() => setChatMenuOpen(!chatMenuOpen)}
                                    className={`p-2 rounded-full transition-colors ${chatMenuOpen ? 'bg-slate-700 text-white' : 'hover:bg-slate-700'}`}
                                >
                                    <MoreVertical size={20} />
                                </button>
                                {chatMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-[#233138] rounded-xl shadow-2xl border border-slate-700 z-50 animate-slide-in-top overflow-hidden">
                                        <div className="p-3 border-b border-slate-700 bg-[#111b21]/50">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Gestionar Lead</p>
                                            <div className="space-y-1">
                                                {KANBAN_COLUMNS.map(col => (
                                                    <button 
                                                        key={col.id}
                                                        onClick={() => handleStatusChange(col.id)}
                                                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${activeLead.status === col.id ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-700 text-slate-300'}`}
                                                    >
                                                        {col.title}
                                                        {activeLead.status === col.id && <Check size={14} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="w-full text-left px-4 py-3 text-xs hover:bg-slate-700 flex items-center gap-3 border-b border-slate-700/50">
                                            <UserPlus size={14} /> Asignar a otro Ejecutivo
                                        </button>
                                        <button className="w-full text-left px-4 py-3 text-xs hover:bg-slate-700 flex items-center gap-3 border-b border-slate-700/50">
                                            <Calendar size={14} /> Agendar Zoom de Cierre
                                        </button>
                                        <button className="w-full text-left px-4 py-3 text-xs hover:bg-red-500/20 text-red-400 flex items-center gap-3 transition-colors">
                                            <Trash2 size={14} /> Archivar Conversación
                                        </button>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>

                    <div 
                        className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar relative bg-[#0b141a]"
                        ref={scrollRef}
                    >
                        {/* Background Pattern Overlay */}
                        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }} />

                        <div className="flex justify-center mb-8 sticky top-0 z-10">
                            <span className="px-4 py-1.5 bg-[#182229] backdrop-blur-md rounded-lg text-[9px] text-[#8696a0] font-bold uppercase tracking-widest border border-slate-800/50 shadow-sm">
                                Los mensajes están cifrados de extremo a extremo
                            </span>
                        </div>

                        {activeConversation.messages.map(msg => {
                            const isMe = msg.senderId === 'me';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in relative z-10`}>
                                    <div className={`max-w-[85%] sm:max-w-[70%] p-2 px-3 rounded-lg shadow-md text-sm relative ${isMe ? 'bg-[#005c4b] text-slate-100 rounded-tr-none' : 'bg-[#202c33] text-slate-100 rounded-tl-none'}`}>
                                        <p className="mb-1 leading-relaxed">{msg.text}</p>
                                        <div className="flex justify-end items-center gap-1.5 text-[9px] opacity-60">
                                            <span>{formatTime(msg.timestamp)}</span>
                                            {isMe && (
                                                <span className="flex items-center">
                                                    {msg.status === 'sent' && <Check size={11} />}
                                                    {msg.status === 'delivered' && <CheckCheck size={11} />}
                                                    {msg.status === 'read' && <CheckCheck size={11} className="text-[#53bdeb]" />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Input Area */}
                    <div className="bg-[#202c33] p-4 shadow-inner">
                        <div className="flex items-center gap-3 mb-4">
                            <button 
                                onClick={() => setShowTemplates(!showTemplates)}
                                className={`text-[10px] px-4 py-1.5 rounded-full border flex items-center gap-2 transition-all font-bold uppercase tracking-widest ${showTemplates ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-[#2a3942] text-slate-400 border-slate-700 hover:bg-[#374248]'}`}
                            >
                                <Zap size={14} className={showTemplates ? 'fill-current' : ''} /> Plantillas
                            </button>
                            <button 
                                onClick={handleMagicReply}
                                disabled={isGeneratingAI}
                                className="text-[10px] px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 flex items-center gap-2 hover:bg-purple-500/20 transition-all disabled:opacity-50 font-bold uppercase tracking-widest shadow-lg shadow-purple-500/5"
                            >
                                {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                                Respuesta Mágica (AI)
                            </button>
                        </div>
                        
                        {showTemplates && (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 animate-slide-in-top">
                                {currentTemplates.map((tpl, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => { setInputText(tpl); setShowTemplates(false); }}
                                        className="flex-shrink-0 text-[10px] bg-[#2a3942] border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-300 hover:bg-[#374248] hover:text-white transition-all max-w-[200px] truncate font-semibold shadow-sm"
                                    >
                                        {tpl}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <button className="text-[#8696a0] hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700">
                                <Paperclip size={22} />
                            </button>
                            <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Escribe un mensaje por WhatsApp..." 
                                    className="w-full bg-[#2a3942] border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#25D366] text-sm text-white placeholder:text-slate-500 transition-all shadow-inner"
                                />
                            </div>
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputText.trim()}
                                className={`p-3 rounded-full transition-all shadow-xl ${inputText.trim() ? 'bg-[#00a884] text-white hover:bg-[#06cf9c] transform active:scale-95' : 'bg-[#2a3942] text-slate-500 cursor-not-allowed'}`}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Insight Sidebar (Improved) */}
                {aiAnalysisOpen && (
                    <div className="w-72 bg-[#111b21] border-l border-slate-700/50 flex flex-col flex-shrink-0 animate-slide-in-right shadow-2xl relative z-20">
                        <div className="p-5 border-b border-slate-700/30 flex items-center justify-between bg-[#202c33]/30">
                            <h3 className="font-bold text-white flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
                                <BrainCircuit className="text-purple-400" size={16} /> WhatsApp Insight
                            </h3>
                            <button onClick={() => setAiAnalysisOpen(false)} className="text-slate-500 hover:text-white">
                                <ChevronDown className="rotate-[-90deg]" size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-8 overflow-y-auto custom-scrollbar">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-widest"><Info size={12} /> Datos del Contacto</h4>
                                <div className="p-4 bg-[#202c33] rounded-2xl border border-slate-700/40 space-y-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#00a884]/20 text-[#25D366] flex items-center justify-center font-bold border border-[#00a884]/30">
                                            {activeLead.company.substring(0,1)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white leading-tight truncate">{activeLead.company}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 font-mono">ID: 54911-3442...</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg font-black uppercase border border-blue-500/20">{activeLead.status}</span>
                                        <span className="text-[9px] bg-[#25D366]/10 text-[#25D366] px-2 py-1 rounded-lg font-black uppercase border border-[#25D366]/20">${activeLead.value.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-4 flex items-center gap-2 tracking-widest">
                                    <Zap size={12} className="fill-current" /> Tip para el Cierre
                                </h4>
                                <div className="p-5 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl border border-purple-500/20 shadow-inner relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Sparkles size={40} className="text-purple-400" />
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-relaxed italic font-medium relative z-10">
                                        "Este cliente suele responder rápido por las mañanas. Evita mensajes largos; prefiere audios breves o enlaces directos a la demo para agilizar el flujo."
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Acciones Sugeridas</h4>
                                <ul className="space-y-3">
                                    {[
                                        "Solicitar comprobante de transferencia",
                                        "Compartir enlace de Zoom para Mañana",
                                        "Enviar PDF de catálogo de servicios"
                                    ].map(task => (
                                        <li 
                                            key={task}
                                            onClick={() => toggleFollowUp(task)}
                                            className="flex items-start gap-3 cursor-pointer group"
                                        >
                                            <div className={`mt-0.5 w-4 h-4 rounded border transition-colors flex items-center justify-center ${completedFollowUps.includes(task) ? 'bg-[#25D366] border-[#25D366]' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                                {completedFollowUps.includes(task) && <Check size={10} className="text-[#111b21] font-bold" />}
                                            </div>
                                            <span className={`text-xs transition-colors ${completedFollowUps.includes(task) ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>
                                                {task}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="pt-6">
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#202c33] hover:bg-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-700/50 transition-all text-slate-400 hover:text-white">
                                    <ExternalLink size={12} /> Ver historial completo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8 text-center bg-[#0b141a]">
                <div className="w-32 h-32 bg-[#202c33] rounded-full flex items-center justify-center mb-8 shadow-2xl relative border border-slate-800/50">
                    <MessageCircle size={64} className={isConnected ? "text-[#25D366] opacity-30" : "text-slate-700"} />
                    {!isConnected && <div className="absolute inset-0 flex items-center justify-center rotate-12"><Zap size={32} className="text-slate-800" /></div>}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Centro de Mensajería Unificado</h3>
                <p className="max-w-xs text-sm leading-relaxed text-[#8696a0]">
                    {!isConnected 
                      ? 'Vincula tu cuenta de WhatsApp para empezar a recibir leads en tiempo real y automatizar tus ventas con KlierNav AI.' 
                      : 'Selecciona una conversación del panel izquierdo para comenzar a gestionar tus leads.'}
                </p>
                {!isConnected && (
                    <button 
                        onClick={handleToggleWhatsApp}
                        className="mt-8 px-8 py-3 bg-[#00a884] hover:bg-[#06cf9c] text-[#111b21] rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        Vincular Cuenta WhatsApp
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
