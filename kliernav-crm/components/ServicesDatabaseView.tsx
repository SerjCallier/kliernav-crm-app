import React, { useState } from 'react';
import { 
  Box, Plus, Search, Edit2, Trash2, Clock, DollarSign, 
  CheckCircle2, XCircle, ChevronRight, Briefcase, Zap, 
  Layers, ShieldCheck, Info, Save, X, Trash, ToggleLeft, ToggleRight
} from 'lucide-react';
import { INITIAL_SERVICES, SERVICE_HEX, SERVICE_COLORS } from '../constants';
import { Service, ServiceType } from '../types';
import { useAuth } from '../AuthContext';

export const ServicesDatabaseView: React.FC = () => {
  const { checkPermission } = useAuth();
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  
  const canManage = checkPermission('services_manage');

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleServiceStatus = (id: string) => {
    if (!canManage) return;
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const handleSaveService = () => {
    if (!editingService?.name || !editingService?.type) return;

    if (editingService.id) {
      setServices(prev => prev.map(s => s.id === editingService.id ? (editingService as Service) : s));
    } else {
      const newService: Service = {
        ...(editingService as Service),
        id: `s${Date.now()}`,
        isActive: true,
        features: editingService.features || []
      };
      setServices(prev => [...prev, newService]);
    }
    setEditingService(null);
  };

  const toggleFeature = (feature: string) => {
    if (!editingService) return;
    const currentFeatures = editingService.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    setEditingService({ ...editingService, features: newFeatures });
  };

  const addCustomFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
        const val = e.currentTarget.value.trim();
        const currentFeatures = editingService?.features || [];
        if (!currentFeatures.includes(val)) {
            setEditingService({ ...editingService, features: [...currentFeatures, val] });
        }
        e.currentTarget.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors p-6 overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Box className="text-blue-600" /> Catálogo de Servicios
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Estandarización de entregas, precios y SLAs operativos</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar servicio..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {canManage && (
            <button 
              onClick={() => setEditingService({ name: '', type: 'Landing', basePrice: 0, slaHours: 24, features: [], isActive: true })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
            >
              <Plus size={18} /> Nuevo Servicio
            </button>
          )}
        </div>
      </div>

      {/* Grid of Services */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div 
              key={service.id} 
              className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col overflow-hidden border-t-4 ${!service.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`} 
              style={{ borderTopColor: service.isActive ? SERVICE_HEX[service.type] : '#94a3b8' }}
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${service.isActive ? SERVICE_COLORS[service.type] : 'bg-slate-200 text-slate-500'}`}>
                    {service.type}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canManage && (
                        <>
                          <button 
                            onClick={() => toggleServiceStatus(service.id)}
                            className={`p-1.5 rounded-lg transition-all ${service.isActive ? 'text-green-500 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-50'}`}
                            title={service.isActive ? "Desactivar" : "Activar"}
                          >
                             {service.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          </button>
                          <button 
                            onClick={() => setEditingService(service)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                          >
                              <Edit2 size={16} />
                          </button>
                        </>
                    )}
                  </div>
                </div>

                <h3 className={`text-lg font-bold mb-2 transition-colors ${service.isActive ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                    {service.name}
                    {!service.isActive && <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">Pausado</span>}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-750">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><DollarSign size={10} /> Precio Base</p>
                        <p className="font-extrabold text-slate-800 dark:text-white">${service.basePrice.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-750">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Clock size={10} /> SLA Entrega</p>
                        <p className="font-extrabold text-slate-800 dark:text-white">{service.slaHours}hs</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Layers size={10} /> Key Features</p>
                    <div className="flex flex-wrap gap-1.5">
                        {service.features.map((feature, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-medium flex items-center gap-1">
                                <ShieldCheck size={10} className={service.isActive ? "text-blue-500" : "text-slate-400"} /> {feature}
                            </span>
                        ))}
                    </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-750 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {service.isActive ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">
                            <CheckCircle2 size={12} /> Disponible
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                            <XCircle size={12} /> Fuera de Catálogo
                        </span>
                    )}
                  </div>
                  <button className={`text-xs font-bold flex items-center gap-1 hover:underline ${service.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 cursor-not-allowed'}`}>
                      Ver Plantillas <ChevronRight size={14} />
                  </button>
              </div>
            </div>
          ))}
          
          {filteredServices.length === 0 && (
             <div className="col-span-full py-20 text-center text-slate-400">
                <Box size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">No se encontraron servicios</p>
             </div>
          )}
        </div>
      </div>

      {/* Edit Service Modal */}
      {editingService && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-750">
                      <div className="flex items-center gap-3">
                        <Box size={20} className="text-blue-500" />
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white leading-none">
                                {editingService.id ? 'Editar Configuración' : 'Nuevo Servicio Digital'}
                            </h3>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Configuración Estándar</p>
                        </div>
                      </div>
                      <button onClick={() => setEditingService(null)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Nombre Comercial</label>
                              <input 
                                type="text"
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                                value={editingService.name || ''}
                                onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                placeholder="Ej: CRM Automático Sergio"
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Categoría / Tipo</label>
                              <select 
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none cursor-pointer shadow-sm"
                                value={editingService.type || 'Other'}
                                onChange={(e) => setEditingService({ ...editingService, type: e.target.value as ServiceType })}
                              >
                                <option value="Landing">Landing Page</option>
                                <option value="Ecommerce">Ecommerce</option>
                                <option value="CRM">CRM Setup & Soporte</option>
                                <option value="AppWeb">App Web / Saas</option>
                                <option value="Local">SEO Local</option>
                                <option value="Automatizacion">Automatización</option>
                                <option value="Mobile">Mobile</option>
                                <option value="CRO">CRO</option>
                                <option value="Other">Otro</option>
                              </select>
                          </div>
                      </div>

                      <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Descripción de la Solución</label>
                          <textarea 
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] shadow-sm"
                            value={editingService.description || ''}
                            onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                            placeholder="Describe qué incluye el servicio y cuál es su valor diferencial..."
                          />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Precio Base (ARS)</label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="number"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none shadow-sm"
                                    value={editingService.basePrice || 0}
                                    onChange={(e) => setEditingService({ ...editingService, basePrice: Number(e.target.value) })}
                                />
                              </div>
                          </div>
                          <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-500 uppercase ml-1">SLA Compromiso (Horas)</label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="number"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white outline-none shadow-sm"
                                    value={editingService.slaHours || 24}
                                    onChange={(e) => setEditingService({ ...editingService, slaHours: Number(e.target.value) })}
                                />
                              </div>
                          </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase ml-1 flex justify-between items-center">
                            <span>Alcance & Entregables</span>
                            <span className="text-[10px] font-normal lowercase italic text-slate-400">Enter para añadir custom</span>
                        </label>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4 shadow-inner">
                            <div className="flex flex-wrap gap-2">
                                {(editingService.features || []).map((feature, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => toggleFeature(feature)}
                                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
                                    >
                                        {feature} <X size={12} />
                                    </button>
                                ))}
                            </div>
                            <input 
                                type="text"
                                onKeyDown={addCustomFeature}
                                className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm outline-none placeholder:text-slate-400"
                                placeholder="Escribe un entregable (ej: Panel Admin)..."
                            />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-100 dark:border-slate-700">
                         <div className={`p-2 rounded-full ${editingService.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                            {editingService.isActive ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                         </div>
                         <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Estado de Visibilidad</p>
                            <p className="text-xs text-slate-500">¿Debería estar disponible para nuevos proyectos?</p>
                         </div>
                         <button 
                            onClick={() => setEditingService({...editingService, isActive: !editingService.isActive})}
                            className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${editingService.isActive ? 'bg-green-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}
                         >
                            {editingService.isActive ? 'ACTIVO' : 'PAUSADO'}
                         </button>
                      </div>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-750 flex gap-3 border-t border-slate-100 dark:border-slate-700">
                      <button 
                        onClick={() => setEditingService(null)}
                        className="flex-1 px-4 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSaveService}
                        className="flex-[2] px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={18} /> {editingService.id ? 'Guardar Cambios' : 'Publicar Servicio'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};