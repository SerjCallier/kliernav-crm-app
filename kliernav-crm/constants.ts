import { Lead, LeadStatus, User, UserRole, UserStatus, Task, CalendarEvent, Conversation, ServiceType, Permission, Role, Service } from './types';

const today = new Date('2025-12-16T09:00:00');

const getRelativeDate = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const getRelativeISO = (days: number, time: string) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return `${d.toISOString().split('T')[0]}T${time}`;
};

export const PERMISSIONS: Permission[] = [
  { id: 'leads_read', name: 'Ver Leads', description: 'Permite visualizar leads en el sistema', module: 'leads', action: 'read' },
  { id: 'leads_create', name: 'Crear Leads', description: 'Permite dar de alta nuevos leads', module: 'leads', action: 'create' },
  { id: 'leads_update', name: 'Editar Leads', description: 'Permite modificar datos de leads', module: 'leads', action: 'update' },
  { id: 'leads_delete', name: 'Eliminar Leads', description: 'Permite borrar leads del sistema', module: 'leads', action: 'delete' },
  { id: 'leads_export', name: 'Exportar Leads', description: 'Permite descargar base de leads', module: 'leads', action: 'export' },
  
  { id: 'tasks_manage', name: 'Gestionar Tareas', description: 'Permite crear, editar y completar tareas', module: 'tasks', action: 'manage' },
  
  { id: 'users_read', name: 'Ver Usuarios', description: 'Permite ver lista de usuarios', module: 'users', action: 'read' },
  { id: 'users_manage', name: 'Gestionar Usuarios', description: 'Permite crear y editar usuarios y sus roles', module: 'users', action: 'manage' },
  
  { id: 'audit_read', name: 'Ver Audit Log', description: 'Permite ver historial de cambios', module: 'audit', action: 'read' },
  { id: 'strategy_read', name: 'Ver Estrategia', description: 'Permite ver el plan estratégico', module: 'strategy', action: 'read' },
  { id: 'strategy_manage', name: 'Gestionar Estrategia', description: 'Permite modificar el plan estratégico', module: 'strategy', action: 'manage' },
  { id: 'services_manage', name: 'Gestionar Servicios', description: 'Permite editar el catálogo de servicios y precios', module: 'services', action: 'manage' },
];

export const ROLES: Role[] = [
  {
    id: 'role_admin',
    name: 'Administrador',
    description: 'Acceso total al sistema y configuraciones',
    permissions: PERMISSIONS.map(p => p.id),
    createdAt: getRelativeISO(-30, '09:00:00'),
    updatedAt: getRelativeISO(-30, '09:00:00'),
  },
  {
    id: 'role_manager',
    name: 'Manager Operativo',
    description: 'Gestiona leads, tareas y estrategia, pero no configuración de usuarios',
    permissions: ['leads_read', 'leads_create', 'leads_update', 'leads_delete', 'leads_export', 'tasks_manage', 'strategy_read', 'strategy_manage', 'audit_read', 'services_manage'],
    createdAt: getRelativeISO(-30, '09:00:00'),
    updatedAt: getRelativeISO(-30, '09:00:00'),
  },
  {
    id: 'role_sales',
    name: 'Ejecutivo de Ventas',
    description: 'Gestiona sus propios leads y tareas asignadas',
    permissions: ['leads_read', 'leads_create', 'leads_update', 'tasks_manage'],
    createdAt: getRelativeISO(-30, '09:00:00'),
    updatedAt: getRelativeISO(-30, '09:00:00'),
  },
  {
    id: 'role_support',
    name: 'Soporte Técnico',
    description: 'Lectura de leads y gestión de tareas técnicas',
    permissions: ['leads_read', 'tasks_manage'],
    createdAt: getRelativeISO(-30, '09:00:00'),
    updatedAt: getRelativeISO(-30, '09:00:00'),
  }
];

export const ALL_USERS: Record<string, User> = {
  'u1': {
    id: 'u1',
    name: 'Sergio Callier',
    email: 'sergio@kliernav.com',
    role: UserRole.ADMIN,
    roleId: 'role_admin',
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=sergio',
    lastLogin: getRelativeISO(0, '08:30:00'),
    createdAt: getRelativeISO(-365, '09:00:00')
  },
  'u2': {
    id: 'u2',
    name: 'Ventas 1',
    email: 'ventas1@kliernav.com',
    role: UserRole.SALES,
    roleId: 'role_sales',
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=v1',
    lastLogin: getRelativeISO(0, '09:15:00'),
    createdAt: getRelativeISO(-120, '09:00:00')
  },
  'u3': {
    id: 'u3',
    name: 'UX/UI 1',
    email: 'uxui1@kliernav.com',
    role: UserRole.MANAGER,
    roleId: 'role_manager',
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=ux1',
    lastLogin: getRelativeISO(-1, '18:00:00'),
    createdAt: getRelativeISO(-200, '09:00:00')
  },
  'u4': {
    id: 'u4',
    name: 'Support 1',
    email: 'support1@kliernav.com',
    role: UserRole.SUPPORT,
    roleId: 'role_support',
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=s1',
    lastLogin: getRelativeISO(0, '09:00:00'),
    createdAt: getRelativeISO(-60, '09:00:00')
  },
  'u5': {
    id: 'u5',
    name: 'DEV 1',
    email: 'dev1@kliernav.com',
    role: UserRole.SUPPORT,
    roleId: 'role_support',
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=d1',
    lastLogin: getRelativeISO(-2, '10:00:00'),
    createdAt: getRelativeISO(-90, '09:00:00')
  }
};

export const CURRENT_USER: User = ALL_USERS['u1'];

export const INITIAL_LEADS: Lead[] = [
  { id: 'l1', title: 'E-commerce Express + MercadoPago', company: 'TechStore Argentina', value: 980000, status: LeadStatus.NEGOTIATION, tags: ['E-commerce', 'High Ticket', 'SLA 24h'], ownerId: 'u1', lastContact: getRelativeDate(0), serviceType: 'Ecommerce', isSameDay: true, leadSource: 'Inbound' },
  { id: 'l2', title: 'Pack Domina tu Barrio (SEO Local)', company: 'Consultor Inmobiliario López', value: 380000, status: LeadStatus.CONTACTED, tags: ['Recurrente', 'Local'], ownerId: 'u2', lastContact: getRelativeDate(-1), serviceType: 'Local', isSameDay: false, leadSource: 'Referral' },
  { id: 'l3', title: 'Landing Page SAME-DAY', company: 'Startup Fitness YA', value: 261000, status: LeadStatus.WON, tags: ['Flash', 'MVP'], ownerId: 'u1', lastContact: getRelativeDate(-2), serviceType: 'Landing', isSameDay: true, leadSource: 'Outbound' },
  { id: 'l4', title: 'Automatización Flujo de Leads', company: 'Agencia Marketing Total', value: 410000, status: LeadStatus.WON, tags: ['Automation', 'B2B'], ownerId: 'u3', lastContact: getRelativeDate(-5), serviceType: 'Automatizacion', isSameDay: false, leadSource: 'Referral' },
  { id: 'l5', title: 'App Móvil Catálogo', company: 'Distribuidora del Norte', value: 1200000, status: LeadStatus.LOST, tags: ['Mobile', 'Long Term'], ownerId: 'u3', lastContact: getRelativeDate(-10), serviceType: 'Mobile', isSameDay: false, leadSource: 'Inbound' },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    type: 'Landing',
    name: 'Landing Page SAME-DAY',
    description: 'Diseño y desarrollo de landing page de alta conversión con entrega en 24-48 horas.',
    basePrice: 180000,
    slaHours: 24,
    isActive: true,
    features: ['Diseño Responsivo', 'Copywriting Persuasivo', 'Integración de Formularios', 'Hosting 1 año']
  },
  {
    id: 's2',
    type: 'Ecommerce',
    name: 'E-commerce Express',
    description: 'Tienda online completa con pasarelas de pago integradas en menos de 72 horas.',
    basePrice: 980000,
    slaHours: 72,
    isActive: true,
    features: ['Catálogo autogestionable', 'MercadoPago/PayPal', 'Cálculo de envíos', 'Panel de control']
  },
  {
    id: 's7',
    type: 'CRM',
    name: 'CRM Pro Setup & Soporte',
    description: 'Implementación estratégica de CRM, migración de datos y soporte operativo mensual.',
    basePrice: 450000,
    slaHours: 120,
    isActive: true,
    features: ['Configuración de Pipelines', 'Automatización de Tareas', 'Capacitación de Equipo', 'Soporte 24/7']
  },
  {
    id: 's8',
    type: 'AppWeb',
    name: 'App Web de Gestión / Saas',
    description: 'Desarrollo de aplicaciones web personalizadas para optimizar procesos internos específicos.',
    basePrice: 1500000,
    slaHours: 720,
    isActive: true,
    features: ['Arquitectura Escalable', 'Base de Datos Cloud', 'API First', 'Dashboard Admin']
  },
  {
    id: 's4',
    type: 'Automatizacion',
    name: 'Automatización de Leads',
    description: 'Workflows inteligentes para capturar, calificar y nutrir leads automáticamente.',
    basePrice: 410000,
    slaHours: 48,
    isActive: true,
    features: ['WhatsApp Automático', 'Sync CRM', 'Email Marketing', 'Chatbots IA']
  },
  {
    id: 's3',
    type: 'Local',
    name: 'SEO Local & GBP',
    description: 'Optimización de Google Business Profile y posicionamiento local para negocios físicos.',
    basePrice: 180000,
    slaHours: 120,
    isActive: true,
    features: ['Optimización GBP', 'Gestión de Reseñas', 'Keywords Locales', 'Reporte Mensual']
  }
];

export const KANBAN_COLUMNS = [
  { id: LeadStatus.NEW, title: 'Nuevos (Inbound)' },
  { id: LeadStatus.CONTACTED, title: 'Contactados / Demo' },
  { id: LeadStatus.NEGOTIATION, title: 'Presupuesto Enviado' },
  { id: LeadStatus.WON, title: 'Ganados (A Producción)' },
  { id: LeadStatus.LOST, title: 'Perdidos / Standby' }
];

export const SERVICE_COLORS: Record<ServiceType, string> = {
  Landing: 'bg-[#00BCD4] text-white', 
  Ecommerce: 'bg-[#4CAF50] text-white', 
  Local: 'bg-[#FF9800] text-white', 
  Automatizacion: 'bg-[#9C27B0] text-white', 
  Mobile: 'bg-[#E91E63] text-white', 
  CRO: 'bg-[#FF5722] text-white', 
  CRM: 'bg-[#3F51B5] text-white', 
  AppWeb: 'bg-[#2196F3] text-white', 
  Other: 'bg-slate-500 text-white'
};

export const SERVICE_HEX: Record<ServiceType, string> = {
  Landing: '#00BCD4', 
  Ecommerce: '#4CAF50', 
  Local: '#FF9800', 
  Automatizacion: '#9C27B0', 
  Mobile: '#E91E63', 
  CRO: '#FF5722', 
  CRM: '#3F51B5', 
  AppWeb: '#2196F3', 
  Other: '#64748b'
};

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'SLA: Kickoff TechStore (09:30)', dueDate: getRelativeDate(0), completed: true, leadId: 'l1', priority: 'high' },
  { id: 't2', title: 'SLA: Wireframe TechStore (12:00)', dueDate: getRelativeDate(0), completed: false, leadId: 'l1', priority: 'high' },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Kickoff TechStore', date: getRelativeDate(0), time: '09:30', type: 'meeting', leadId: 'l1' },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    leadId: 'l1', unreadCount: 2, lastMessageAt: getRelativeISO(0, '10:30:00'),
    messages: [
      { id: 'm1', senderId: 'me', text: '¡Hola! Recibimos tu solicitud para E-commerce Express.', timestamp: getRelativeISO(-1, '09:00:00'), status: 'read' },
    ]
  }
];

export const MESSAGE_TEMPLATES: Record<ServiceType, string[]> = {
  Landing: ["Validemos tu idea en 48h con una landing profesional de alta conversión.", "El paquete Landing SAME-DAY incluye diseño, copy y dominio. Entrega mañana a las 20hs."],
  Ecommerce: ["Comienza a vender online con integración Mercado Pago en menos de 2 días.", "¿Tienes tu catálogo listo?"],
  Local: ["Aparece primero en Google Maps.", "Optimizamos tu perfil de GBP."],
  Automatizacion: ["Deja de perder leads. Automatizamos tu WhatsApp.", "Implementamos un bot de cualificación."],
  Mobile: ["Lleva tu catálogo al bolsillo de tus clientes.", "Desarrollo de MVP móvil ágil."],
  CRO: ["Aumentamos la tasa de conversión.", "Auditoría CRO express."],
  CRM: ["Optimiza tu proceso de ventas con una estructura CRM robusta.", "Te ayudamos a migrar tus datos y automatizar tu embudo."],
  AppWeb: ["Desarrollamos soluciones a medida para tu operativa.", "Llevamos tu lógica de negocio a una App Web escalable."],
  Other: ["Hola, ¿en qué podemos ayudarte?", "Gracias por contactar."]
};