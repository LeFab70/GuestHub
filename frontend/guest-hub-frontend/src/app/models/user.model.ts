export enum UserRole {
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER'
}

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  userRole: UserRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  userRole: UserRole;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  userRole?: UserRole;
  isActive?: boolean;
}
