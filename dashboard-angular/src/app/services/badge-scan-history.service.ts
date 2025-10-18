import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BadgeScanRecord {
  id: string;
  qrCode: string;
  action: 'scan' | 'check-out';
  timestamp: Date;
  visitorName?: string;
  employeeName?: string;
  departmentName?: string;
  visitId?: string;
  badgeId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BadgeScanHistoryService {
  private scansSubject = new BehaviorSubject<BadgeScanRecord[]>([]);
  public scans$ = this.scansSubject.asObservable();

  private readonly STORAGE_KEY = 'badgeScanHistory';
  private readonly MAX_RECORDS = 50; // Garder les 50 derniers scans

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Ajouter un nouveau scan à l'historique
   */
  addScan(scanData: Omit<BadgeScanRecord, 'id' | 'timestamp'>): void {
    const newScan: BadgeScanRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      ...scanData
    };

    const currentScans = this.scansSubject.value;
    const updatedScans = [newScan, ...currentScans].slice(0, this.MAX_RECORDS);
    
    this.scansSubject.next(updatedScans);
    this.saveToStorage(updatedScans);
  }

  /**
   * Obtenir tous les scans
   */
  getAllScans(): BadgeScanRecord[] {
    return this.scansSubject.value;
  }

  /**
   * Obtenir les scans d'aujourd'hui
   */
  getTodayScans(): BadgeScanRecord[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.scansSubject.value.filter(scan => 
      scan.timestamp >= today
    );
  }

  /**
   * Obtenir les scans des dernières 24h
   */
  getRecentScans(hours: number = 24): BadgeScanRecord[] {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    return this.scansSubject.value.filter(scan => 
      scan.timestamp >= cutoffTime
    );
  }

  /**
   * Nettoyer l'historique (garder seulement les scans d'aujourd'hui)
   */
  cleanHistory(): void {
    const todayScans = this.getTodayScans();
    this.scansSubject.next(todayScans);
    this.saveToStorage(todayScans);
  }

  /**
   * Vider complètement l'historique
   */
  clearHistory(): void {
    this.scansSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Obtenir les statistiques des scans
   */
  getScanStats(): {
    totalToday: number;
    totalRecent: number;
    scansByAction: { [key: string]: number };
    lastScanTime?: Date;
  } {
    const todayScans = this.getTodayScans();
    const recentScans = this.getRecentScans(24);
    
    const scansByAction = todayScans.reduce((acc, scan) => {
      acc[scan.action] = (acc[scan.action] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalToday: todayScans.length,
      totalRecent: recentScans.length,
      scansByAction,
      lastScanTime: todayScans.length > 0 ? todayScans[0].timestamp : undefined
    };
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedScans = JSON.parse(stored).map((scan: any) => ({
          ...scan,
          timestamp: new Date(scan.timestamp)
        }));
        this.scansSubject.next(parsedScans);
      }
    } catch (error) {
      console.error('Error loading scan history from storage:', error);
      this.scansSubject.next([]);
    }
  }

  private saveToStorage(scans: BadgeScanRecord[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scans));
    } catch (error) {
      console.error('Error saving scan history to storage:', error);
    }
  }

  private generateId(): string {
    return 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
