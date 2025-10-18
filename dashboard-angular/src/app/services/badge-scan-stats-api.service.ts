import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BadgeScanRecord {
  id: string;
  qrCode: string;
  action: 'scan' | 'check-out';
  visitorName?: string;
  employeeName?: string;
  departmentName?: string;
  visitId?: string;
  badgeId?: string;
  scannedBy?: string;
  createdAt: Date;
}

export interface ScanStats {
  totalToday: number;
  totalRecent: number;
  scansByAction: { [key: string]: number };
  lastScanTime?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BadgeScanStatsApiService {
  private baseUrl = 'http://localhost:3001/api/badge-scan-stats';

  constructor(private http: HttpClient) {}

  // Ajouter un enregistrement de scan
  addScanRecord(record: Omit<BadgeScanRecord, 'id' | 'createdAt' | 'scannedBy'>): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, record);
  }

  // Obtenir les statistiques de scan
  getScanStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`);
  }

  // Obtenir les scans récents
  getRecentScans(limit: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/recent?limit=${limit}`);
  }

  // Nettoyer les anciens enregistrements (admin seulement)
  cleanupOldRecords(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cleanup`);
  }
}
