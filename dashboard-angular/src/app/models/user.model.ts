export interface User {
  id: string;
  login: string;
  motDePasse: string;
  email: string;
  actif: boolean;
  nom?: string;
  prenom?: string;
  role?: 'ADMIN' | 'RECEPTIONNISTE';
  isActive?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}

export interface Employe extends User {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  poste?: string;
  departmentId?: string;
  department?: Departement;
  isActive: boolean;
}

export interface Visiteur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  entreprise?: string;
  estBlackliste: boolean;
  status: VisiteurStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Departement {
  id: string;
  nom: string;
  description: string;
}

export interface Visite {
  id: string;
  visiteurId: string;
  visiteur?: Visiteur;
  employeId?: string;
  employe?: Employe;
  badgeId?: string;
  badge?: Badge;
  dateDebut: Date;
  dateFin?: Date;
  statut: string;
  motif: string;
  duree?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  visiteId: string;
  status: BadgeStatus;
  qrCode: string;
  dateImpression?: Date;
  printById?: string;
  createdAt: Date;
  updatedAt: Date;
  visite?: Visite;
}

export interface Role {
  id: number;
  nom: RoleType;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  nom: string;
  description: string;
  actif: boolean;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  dateHeure: Date;
  details: string;
  entityType: string;
  entityId: string;
}

export enum VisiteurStatus {
  ACTIF = 'ACTIF',
  BLACKLISTED = 'BLACKLISTED'
}

export enum RoleType {
  ADMIN = 'ADMIN',
  RECEPTIONNISTE = 'RECEPTIONNISTE'
}

export enum BadgeStatus {
  GENERATED = 'GENERATED',
  PRINTED = 'PRINTED',
  CLOSED = 'CLOSED'
}
