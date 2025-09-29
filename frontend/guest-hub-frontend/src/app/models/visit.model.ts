export enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface Visit {
  id?: number;
  visitDate: Date;
  expectedDuration?: number;
  actualDuration?: number;
  visitStatus: VisitStatus;
  purpose?: string;
  notes?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  guestId: number;
  guestName?: string;
  hostId: number;
  hostName?: string;
  createdById: number;
  createdByName?: string;
}

export interface VisitCreateRequest {
  visitDate: Date;
  expectedDuration?: number;
  purpose?: string;
  notes?: string;
  guestId: number;
  hostId: number;
  createdById: number;
}

export interface VisitUpdateRequest {
  visitDate?: Date;
  expectedDuration?: number;
  actualDuration?: number;
  visitStatus?: VisitStatus;
  purpose?: string;
  notes?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  guestId?: number;
  hostId?: number;
  createdById?: number;
}

export interface VisitDocument {
  id?: number;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  description?: string;
  uploadedAt?: Date;
  visitId: number;
}
