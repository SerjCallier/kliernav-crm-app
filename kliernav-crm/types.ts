export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALES = 'SALES',
  SUPPORT = 'SUPPORT',
  CLIENT = 'CLIENT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST'
}

export type ServiceType = 'Landing' | 'Ecommerce' | 'Local' | 'Automatizacion' | 'Mobile' | 'CRO' | 'CRM' | 'AppWeb' | 'Other';

export interface Service {
  id: string;
  type: ServiceType;
  name: string;
  description: string;
  basePrice: number;
  slaHours: number;
  features: string[];
  isActive: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: 'leads' | 'tasks' | 'calendar' | 'messaging' | 'strategy' | 'settings' | 'users' | 'audit' | 'services';
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'manage';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId: string;
  status: UserStatus;
  avatarUrl?: string;
  permissions?: string[]; // Specific permission overrides
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityId?: string;
  entityType?: string;
  changesBefore?: any;
  changesAfter?: any;
  timestamp: string;
  status: 'success' | 'failed';
  ip?: string;
}

export interface Lead {
  id: string;
  title: string;
  company: string;
  value: number;
  status: string;
  tags: string[];
  ownerId: string;
  lastContact: string;
  serviceType: ServiceType;
  isSameDay: boolean;
  leadSource?: 'Inbound' | 'Referral' | 'Outbound';
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  leadId?: string;
  priority: TaskPriority;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  type: 'meeting' | 'call' | 'deadline';
  leadId?: string;
  source?: 'crm' | 'google';
  description?: string;
}

export enum AIMode {
  FAST = 'fast',
  REASONING = 'reasoning',
  SEARCH = 'search'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Array<{ uri: string; title: string }>;
  isThinking?: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  leadId: string;
  messages: DirectMessage[];
  unreadCount: number;
  lastMessageAt: string;
}

export enum View {
  DASHBOARD = 'dashboard',
  PIPELINE = 'pipeline',
  LEADS_LIST = 'leads_list',
  TASKS = 'tasks',
  CALENDAR = 'calendar',
  MESSAGING = 'messaging',
  AI_CHAT = 'ai_chat',
  SETTINGS = 'settings',
  STRATEGY = 'strategy',
  USERS_ROLES = 'users_roles',
  AUDIT_LOGS = 'audit_logs',
  SERVICES = 'services'
}