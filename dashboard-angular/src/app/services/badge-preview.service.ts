import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface BadgePreviewData {
  id: string;
  qrCode: string;
  visitorName: string;
  visitorCompany?: string;
  employeeName: string;
  departmentName: string;
  visitPurpose: string;
  startDate: Date;
  endDate: Date;
  status: string;
  printDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BadgePreviewService {
  private previewSubject = new BehaviorSubject<BadgePreviewData | null>(null);
  public preview$ = this.previewSubject.asObservable();

  private showPreviewSubject = new BehaviorSubject<boolean>(false);
  public showPreview$ = this.showPreviewSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Ouvre l'aperçu d'un badge par son QR Code
   */
  async openBadgePreview(qrCode: string): Promise<void> {
    try {
      // Récupérer les données du badge depuis l'API
      const badgeData = await this.getBadgeByQrCode(qrCode);
      if (badgeData) {
        this.previewSubject.next(badgeData);
        this.showPreviewSubject.next(true);
      }
    } catch (error) {
      // Erreur lors de l'ouverture de l'aperçu du badge
    }
  }

  /**
   * Ferme l'aperçu du badge
   */
  closePreview(): void {
    this.showPreviewSubject.next(false);
    this.previewSubject.next(null);
  }

  /**
   * Récupère les données d'un badge par son QR Code
   */
  private async getBadgeByQrCode(qrCode: string): Promise<BadgePreviewData | null> {
    try {
      // Récupérer tous les badges et trouver celui avec le QR Code correspondant
      const response = await this.apiService.getBadges({ page: 1, limit: 1000 }).toPromise();
      
      if (response?.success && response.data?.data) {
        const badge = response.data.data.find((b: any) => b.qrCode === qrCode);
        
        if (badge) {
          return {
            id: badge.id,
            qrCode: badge.qrCode,
            visitorName: `${badge.visite?.visiteur?.prenom || ''} ${badge.visite?.visiteur?.nom || ''}`.trim(),
            visitorCompany: badge.visite?.visiteur?.entreprise,
            employeeName: `${badge.visite?.employe?.prenom || ''} ${badge.visite?.employe?.nom || ''}`.trim(),
            departmentName: badge.visite?.employe?.department?.nom || 'Non assigné',
            visitPurpose: badge.visite?.motif || 'Visite',
            startDate: new Date(badge.visite?.dateDebut || new Date()),
            endDate: new Date(badge.visite?.dateFin || new Date()),
            status: badge.status,
            printDate: badge.dateImpression ? new Date(badge.dateImpression) : undefined
          };
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Ouvre l'aperçu avec des données de badge existantes
   */
  openPreviewWithData(badgeData: BadgePreviewData): void {
    this.previewSubject.next(badgeData);
    this.showPreviewSubject.next(true);
  }
}

