import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Search, Brain, Zap, ExternalLink, UserCircle, Sparkles, Lightbulb } from 'lucide-react';
import { AIMode, ChatMessage, Lead } from '../types';
import { generateAIResponse } from '../services/geminiService';

interface AIAssistantProps {
  leads: Lead[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ leads }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hola Sergio, soy KlierNav. ¿En qué puedo ayudarte hoy? Puedo analizar tus leads, redactar propuestas SAME-DAY o investigar nichos.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AIMode>(AIMode.FAST);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Prepare context
    const leadsContext = JSON.stringify(leads.map(l => ({
        company: l.company,
        title: l.title,
        value: l.value,
        status: l.status,
        service: l.serviceType,
        isSameDay: l.isSameDay
    })), null, 2);

    const response = await generateAIResponse(userMessage.text, mode, leadsContext);

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.text,
      sources: response.sources
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Dynamic suggestions based on active mode
  const getSuggestions = () => {
    switch (mode) {
        case AIMode.SEARCH:
            return [
                "Investigar competencia de TechStore",
                "Tendencias E-commerce en Argentina 2025",
                "Mejores prácticas SEO local",
                "Herramientas nuevas de automatización WhatsApp"
            ];
        case AIMode.REASONING:
            return [
                "Estrategia de upsell para clientes Landing",
                "Analizar rentabilidad servicio SAME-DAY",
                "Plan para reducir SLA en E-commerce",
                "Optimizar proceso de ventas inbound"
            ];
        case AIMode.FAST:
        default:
            return [
                "Redactar propuesta Landing SAME-DAY",
                "Resumir leads pendientes",
                "Calcular presupuesto E-commerce",
                "Email de seguimiento Inmobiliaria"
            ];
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex-none p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex justify-between items-center z-10 transition-colors">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg text-purple-600 dark:text-purple-400">
             <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white leading-tight">KlierNav AI</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Powered by Gemini 2.5</p>
          </div>
        </div>
        
        {/* Mode Selector */}
        <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
            <button 
                onClick={() => setMode(AIMode.FAST)}
                className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-xs ${
                  mode === AIMode.FAST 
                  ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white font-medium' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Modo Rápido (Gemini Flash)"
            >
                <Zap size={14} /> <span className="hidden sm:inline">Rápido</span>
            </button>
            <button 
                onClick={() => setMode(AIMode.SEARCH)}
                className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-xs ${
                  mode === AIMode.SEARCH 
                  ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white font-medium' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Modo Búsqueda (Google Search Grounding)"
            >
                <Search size={14} /> <span className="hidden sm:inline">Búsqueda</span>
            </button>
            <button 
                onClick={() => setMode(AIMode.REASONING)}
                className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-xs ${
                  mode === AIMode.REASONING 
                  ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white font-medium' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Modo Razonamiento (Thinking Config)"
            >
                <Brain size={14} /> <span className="hidden sm:inline">Razonar</span>
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex w-full gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mt-1">
                  <Sparkles size={16} />
                </div>
              )}

              {/* Message Content Container */}
              <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[75%]`}>
                
                {/* Text Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm shadow-sm leading-relaxed break-words ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                      {msg.text}
                  </div>
                </div>

                {/* Sources / Metadata Section (Only for Model) */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm text-xs mt-1">
                      <p className="font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                          <Search size={12} /> 
                          Fuentes consultadas
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                          {msg.sources.map((source, idx) => (
                              <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors truncate"
                              >
                                  <ExternalLink size={12} className="flex-shrink-0" /> 
                                  <span className="truncate">{source.title || source.uri}</span>
                              </a>
                          ))}
                      </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 mt-1">
                  <UserCircle size={20} />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex w-full gap-4 justify-start">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mt-1">
                  <Bot size={16} />
             </div>
             <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-600 flex items-center gap-2">
                <span className="text-xs text-slate-400 dark:text-slate-300 font-medium mr-1">KlierNav está pensando</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150" />
                </div>
            </div>
          </div>
        )}
        
        {/* Invisible element to auto-scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 z-10 flex flex-col gap-3 transition-colors">
        
        {/* Main Input */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
                mode === AIMode.SEARCH ? "Pregunta sobre empresas, noticias recientes..." :
                mode === AIMode.REASONING ? "Solicita un plan de acción detallado..." :
                "Escribe un mensaje..."
            }
            className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 text-slate-800 dark:text-white placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              input.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </div>

        {/* Quick Actions / Suggestions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 scroll-smooth no-scrollbar">
           <div className="flex-shrink-0 text-slate-400 pl-2" title="Sugerencias rápidas">
              <Lightbulb size={14} />
           </div>
           {getSuggestions().map((suggestion, idx) => (
             <button
               key={idx}
               onClick={() => setInput(suggestion)}
               className="flex-shrink-0 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-800 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
             >
               {suggestion}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};