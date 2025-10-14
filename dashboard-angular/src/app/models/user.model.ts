export interface User {
  id: string;
  login: string;
  motDePasse: string;
  email: string;
  actif: boolean;
  nom?: string;
  prenom?: string;
  role?: 'ADMIN' | 'RECEPTIONNISTE' | 'USER';
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

export interface Visiteur extends User {
  nom: string;
  prenom: string;
  telephone: string;
  status: VisiteurStatus;
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
  dateEntree: Date;
  dateSortie?: Date;
  status: string;
  motif: string;
  duree?: number;
}

export interface Badge {
  id: string;
  visiteId: string;
  dateEmission: Date;
  etat: BadgeEtat;
  qrCode: string;
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

export enum BadgeEtat {
  GENERE = 'GENERE',
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  IMPRIME = 'IMPRIME',
  VALIDE = 'VALIDE',
  RENDU = 'RENDU',
  AUTO_EXPIRE = 'AUTO_EXPIRE',
  SCANNE = 'SCANNE'
}
