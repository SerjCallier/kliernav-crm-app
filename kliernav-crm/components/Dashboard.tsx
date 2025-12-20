import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Lead, LeadStatus, ServiceType } from '../types';
import { Users, DollarSign, Activity, Zap, Clock, Award, TrendingUp, Filter } from 'lucide-react';
import { SERVICE_HEX } from '../constants';

interface DashboardProps {
  leads: Lead[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads }) => {
  // Calculate Stats
  const totalValue = leads.reduce((acc, lead) => acc + lead.value, 0);
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === LeadStatus.WON).length;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;
  
  // Specific Metrics
  const sameDayLeads = leads.filter(l => l.isSameDay);
  const sameDayActive = sameDayLeads.filter(l => l.status !== LeadStatus.WON && l.status !== LeadStatus.LOST).length;
  const avgTicket = totalLeads > 0 ? Math.round(totalValue / totalLeads) : 0;
  
  // Chart Data: Value by Service
  const serviceData = Object.keys(SERVICE_HEX).map(service => ({
    name: service,
    value: leads.filter(l => l.serviceType === service).length,
    amount: leads.filter(l => l.serviceType === service).reduce((acc, l) => acc + l.value, 0),
    color: SERVICE_HEX[service as ServiceType]
  })).filter(d => d.value > 0);

  // Chart Data: Lead Status (Funnel Tracking)
  const statusData = [
    { name: 'Nuevos', count: leads.filter(l => l.status === LeadStatus.NEW).length, fill: '#60a5fa' }, // Blue
    { name: 'Contactados', count: leads.filter(l => l.status === LeadStatus.CONTACTED).length, fill: '#818cf8' }, // Indigo
    { name: 'Negociación', count: leads.filter(l => l.status === LeadStatus.NEGOTIATION).length, fill: '#fbbf24' }, // Amber
    { name: 'Ganados', count: leads.filter(l => l.status === LeadStatus.WON).length, fill: '#34d399' }, // Emerald
    { name: 'Perdidos', count: leads.filter(l => l.status === LeadStatus.LOST).length, fill: '#f87171' }, // Red
  ];

  // SLA Mock Data (Simulated for Demo)
  const slaData = [
    { name: 'Lun', compliance: 100 },
    { name: 'Mar', compliance: 90 },
    { name: 'Mié', compliance: 95 },
    { name: 'Jue', compliance: 100 },
    { name: 'Vie', compliance: 85 },
    { name: 'Sáb', compliance: 100 },
    { name: 'Dom', compliance: 100 },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">KlierNav Control Center</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Operaciones en tiempo real</p>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
             Actualizado: {new Date().toLocaleTimeString()}
          </span>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pipeline Value */}
        <div className="bg-gradient-to-br from-[#0C134F] to-[#1a237e] p-4 rounded-xl shadow-lg shadow-blue-900/20 text-white flex items-center space-x-4 relative overflow-hidden">
          <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <DollarSign size={24} className="text-[#00BCD4]" />
          </div>
          <div>
            <p className="text-sm font-medium opacity-80">Pipeline Total</p>
            <p className="text-2xl font-bold">${(totalValue / 1000000).toFixed(2)}M</p>
          </div>
        </div>

        {/* SAME-DAY Active */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-l-4 border-slate-100 dark:border-slate-700 border-l-[#00BCD4] flex items-center space-x-4">
          <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 text-[#00BCD4] rounded-lg">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Activos SAME-DAY</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{sameDayActive}</p>
          </div>
        </div>

        {/* Avg Ticket */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ticket Promedio</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">${(avgTicket/1000).toFixed(0)}k</p>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">SLA (20:00hs)</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">96%</p>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Value by Service (Pie) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 min-w-0 flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Ingresos por Servicio</h3>
          <div className="flex-1 min-h-[200px] w-full relative">
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                  stroke="none"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <span className="text-xl font-bold text-slate-800 dark:text-white">${(totalValue/1000000).toFixed(1)}M</span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total</p>
                </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {serviceData.map((entry) => (
                <div key={entry.name} className="flex items-center text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                  <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
        </div>

        {/* Lead Status Pipeline (Bar Chart) - NEW */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 min-w-0 flex flex-col">
           <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
             <Activity size={18} className="text-blue-500" />
             Embudo de Seguimiento de Leads
           </h3>
           <div className="flex-1 min-h-[250px] w-full">
             <ResponsiveContainer width="99%" height="100%">
               <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#94a3b8" opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} 
                    width={80}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* SLA Trend (Line) - Full Width below */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 min-w-0">
          <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
             <Clock size={18} className="text-[#00BCD4]" />
             Cumplimiento SLA SAME-DAY (7 Días)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="99%" height="100%">
              <LineChart data={slaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
                <XAxis 
                    dataKey="name" 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                />
                <YAxis 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#00BCD4' }}
                  formatter={(value) => [`${value}%`, 'Cumplimiento']}
                />
                <Line 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="#00BCD4" 
                    strokeWidth={3} 
                    dot={{fill: '#00BCD4', r: 4}}
                    activeDot={{r: 6}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};