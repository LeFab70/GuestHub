import { Request } from 'express';

// Authenticated user type
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  nom: string;
  prenom: string;
}

// User types
export interface User {
  id: string;
  login: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  isActive: boolean;
  passwordResetRequired?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  login: string;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  login?: string;
  email?: string;
  nom?: string;
  prenom?: string;
  role?: UserRole;
  isActive?: boolean;
}

// Department types
export interface Department {
  id: string;
  nom: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentRequest {
  nom: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentRequest {
  nom?: string;
  description?: string;
  isActive?: boolean;
}

// Employee types
export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  poste?: string;
  isActive: boolean;
  departmentId: string;
  department?: Department;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  poste: string;
  departmentId: string;
  isActive?: boolean;
}

export interface UpdateEmployeeRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  poste?: string;
  departmentId?: string;
  isActive?: boolean;
}

// Visitor types
export interface Visitor {
  id: string;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  entreprise?: string | null;
  estBlackliste: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVisitorRequest {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
}

export interface UpdateVisitorRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  estBlackliste?: boolean;
}

// Visit types
export interface Visite {
  id: string;
  dateDebut: Date;
  dateFin?: Date;
  motif: string;
  statut: VisitStatus;
  confirmByVisitor?: string;
  confirmedAt?: Date;
  visiteurId: string;
  visiteur?: Visitor;
  employeId: string;
  employe?: Employee;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVisiteRequest {
  dateDebut: Date;
  dateFin?: Date;
  motif: string;
  visiteurId: string;
  employeId: string;
  confirmByVisitor?: string;
}

export interface UpdateVisiteRequest {
  dateDebut?: Date;
  dateFin?: Date;
  motif?: string;
  statut?: VisitStatus;
  visiteurId?: string;
  employeId?: string;
}

// Badge types
export interface Badge {
  id: string;
  qrCode: string;
  status: BadgeStatus;
  visiteId: string;
  visite?: Visite;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBadgeRequest {
  visiteId: string;
  qrCode?: string;
  status?: BadgeStatus;
}

export interface UpdateBadgeRequest {
  qrCode?: string;
  status?: BadgeStatus;
}

// Audit Log types
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  dateHeure: Date;
  userId?: string;
  user?: User;
}

export interface CreateAuditLogRequest {
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  userId?: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'RECEPTIONNISTE' | 'USER';
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  passwordResetRequired?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types with user
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Enums - Import from Prisma
import { UserRole, VisitStatus, BadgeStatus } from '@prisma/client';

export { UserRole, VisitStatus, BadgeStatus };

// Query types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
  filter?: Record<string, any>;
  status?: 'all' | 'active' | 'inactive';
  visiteurId?: string;
  statut?: string;
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Email types
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

// QR Code types
export interface QRCodeData {
  visitId: string;
  visitorId: string;
  employeeId: string;
  timestamp: number;
}

// Statistics types
export interface DashboardStats {
  totalVisitors: number;
  totalVisits: number;
  activeVisits: number;
  totalEmployees: number;
  totalDepartments: number;
  badgesToPrint: number;
  recentVisits: Visite[];
  monthlyStats: {
    month: string;
    visits: number;
    visitors: number;
  }[];
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
