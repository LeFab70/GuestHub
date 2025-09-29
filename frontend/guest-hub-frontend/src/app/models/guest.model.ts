export enum IdType {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  OTHER = 'OTHER'
}

export interface Guest {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  company?: string;
  position?: string;
  idNumber?: string;
  idType?: IdType;
  isBlacklisted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GuestCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  company?: string;
  position?: string;
  idNumber?: string;
  idType?: IdType;
}

export interface GuestUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  company?: string;
  position?: string;
  idNumber?: string;
  idType?: IdType;
  isBlacklisted?: boolean;
}
