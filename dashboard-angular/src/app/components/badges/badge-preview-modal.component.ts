import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgePreviewService, BadgePreviewData } from '../../services/badge-preview.service';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-badge-preview-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="showPreview" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Aperçu du Badge</h3>
            <button 
              (click)="closePreview()"
              class="text-gray-400 hover:text-gray-600">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div *ngIf="badgeData" class="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg">
            <!-- En-tête du badge -->
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-2">BADGE VISITEUR</h2>
              <div class="w-16 h-1 bg-blue-600 mx-auto"></div>
            </div>
            
            <!-- Informations du visiteur -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label class="text-sm font-medium text-gray-600">Visiteur</label>
                <p class="text-lg font-semibold text-gray-800">
                  {{ badgeData.visitorName }}
                </p>
                <p class="text-sm text-gray-600" *ngIf="badgeData.visitorCompany">
                  {{ badgeData.visitorCompany }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Employé</label>
                <p class="text-lg font-semibold text-gray-800">
                  {{ badgeData.employeeName }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Département</label>
                <p class="text-lg font-semibold text-gray-800">{{ badgeData.departmentName }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Motif</label>
                <p class="text-lg font-semibold text-gray-800">{{ badgeData.visitPurpose }}</p>
              </div>
            </div>
            
            <!-- QR Code -->
            <div class="text-center mb-6">
              <div class="inline-block p-4 bg-gray-100 rounded-lg">
                <div class="text-2xl font-mono font-bold text-gray-800 mb-2">{{ badgeData.qrCode }}</div>
                <div class="w-32 h-32 bg-white border-2 border-gray-300 mx-auto flex items-center justify-center">
                  <span class="text-xs text-gray-500">QR CODE</span>
                </div>
              </div>
            </div>
            
            <!-- Dates -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label class="text-sm font-medium text-gray-600">Date de début</label>
                <p class="text-lg font-semibold text-gray-800">
                  {{ badgeData.startDate | date:'dd/MM/yyyy HH:mm' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Date de fin</label>
                <p class="text-lg font-semibold text-gray-800">
                  {{ badgeData.endDate | date:'dd/MM/yyyy HH:mm' }}
                </p>
              </div>
            </div>

            <!-- Statut -->
            <div class="mb-6">
              <label class="text-sm font-medium text-gray-600">Statut du badge</label>
              <div class="mt-1">
                <span [class]="getStatusClass(badgeData.status)" 
                      class="px-3 py-1 inline-flex text-sm font-semibold rounded-full">
                  {{ getStatusLabel(badgeData.status) }}
                </span>
              </div>
            </div>
            
            <!-- Instructions -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 class="font-semibold text-yellow-800 mb-2">Instructions :</h4>
              <ul class="text-sm text-yellow-700 space-y-1">
                <li>• Portez ce badge visiblement pendant votre visite</li>
                <li>• Rendez-le à la réception en partant</li>
                <li>• Ne le prêtez à personne d'autre</li>
              </ul>
            </div>
          </div>
          
          <!-- Boutons d'action -->
          <div class="flex justify-end space-x-3 mt-6">
            <button 
              (click)="closePreview()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
              Fermer
            </button>
            <button 
              *ngIf="badgeData && badgeData.status === 'GENERATED'"
              (click)="printBadge()"
              [disabled]="isPrinting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50">
              <span *ngIf="isPrinting" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ isPrinting ? 'Impression...' : 'Imprimer le Badge' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BadgePreviewModalComponent implements OnInit, OnDestroy {
  private badgePreviewService = inject(BadgePreviewService);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);

  @Input() showPreview = false;
  @Output() previewClosed = new EventEmitter<void>();
  @Output() badgePrinted = new EventEmitter<string>();

  badgeData: BadgePreviewData | null = null;
  isPrinting = false;
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Écouter les changements d'aperçu
    this.subscriptions.push(
      this.badgePreviewService.preview$.subscribe(data => {
        this.badgeData = data;
      })
    );

    this.subscriptions.push(
      this.badgePreviewService.showPreview$.subscribe(show => {
        this.showPreview = show;
        if (!show) {
          this.previewClosed.emit();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  closePreview() {
    this.badgePreviewService.closePreview();
  }

  async printBadge() {
    if (!this.badgeData) return;

    this.isPrinting = true;
    try {
      // Ouvrir l'aperçu avant impression dans une nouvelle fenêtre
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(this.generateBadgeHTML());
        printWindow.document.close();
        
        // Attendre que l'utilisateur confirme l'impression
        printWindow.onbeforeunload = () => {
          // Une fois l'impression terminée, marquer le badge comme imprimé
          this.markBadgeAsPrinted();
        };
        
        // Lancer l'impression
        printWindow.print();
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression du badge:', error);
      alert('Erreur lors de l\'impression du badge. Veuillez réessayer.');
    } finally {
      this.isPrinting = false;
    }
  }

  private async markBadgeAsPrinted() {
    try {
      const response = await this.apiService.printBadge(this.badgeData!.id).toPromise();
      if (response?.success) {
        // Supprimer les notifications liées à ce badge
        this.notificationService.removeNotificationsForBadge(this.badgeData!.qrCode);
        
        // Émettre l'événement de badge imprimé
        this.badgePrinted.emit(this.badgeData!.qrCode);
        
        // Badge imprimé avec succès
        
        // Fermer l'aperçu après un délai
        setTimeout(() => {
          this.closePreview();
          // Optionnel: déclencher un rafraîchissement des données
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du badge:', error);
    }
  }

  private generateBadgeHTML(): string {
    if (!this.badgeData) return '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Badge Visiteur - ${this.badgeData.visitorName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
          }
          .badge {
            width: 300px;
            height: 200px;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 15px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
          }
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin: 0;
          }
          .header p {
            font-size: 10px;
            color: #666;
            margin: 2px 0;
          }
          .content {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
          }
          .photo {
            width: 40px;
            height: 40px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #9ca3af;
          }
          .info {
            flex: 1;
            font-size: 9px;
          }
          .info p {
            margin: 2px 0;
            font-weight: 500;
          }
          .info .label {
            font-weight: 600;
            color: #374151;
          }
          .qr-section {
            text-align: center;
            margin-top: 10px;
          }
          .qr-code {
            width: 60px;
            height: 60px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            margin: 0 auto 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #6b7280;
          }
          .qr-text {
            font-size: 8px;
            color: #6b7280;
            font-family: monospace;
          }
          .instructions {
            margin-top: 10px;
            padding: 8px;
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 4px;
            font-size: 8px;
            color: #92400e;
          }
          .instructions h4 {
            margin: 0 0 4px 0;
            font-size: 9px;
            font-weight: bold;
          }
          .instructions ul {
            margin: 0;
            padding-left: 12px;
          }
          .instructions li {
            margin: 1px 0;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .badge { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="badge">
          <div class="header">
            <h1>GUESTHUB</h1>
            <p>Badge Visiteur</p>
          </div>
          
          <div class="content">
            <div class="photo">👤</div>
            <div class="info">
              <p><span class="label">Visiteur:</span> ${this.badgeData.visitorName}</p>
              <p><span class="label">Entreprise:</span> ${this.badgeData.visitorCompany || 'N/A'}</p>
              <p><span class="label">Employé:</span> ${this.badgeData.employeeName}</p>
              <p><span class="label">Département:</span> ${this.badgeData.departmentName}</p>
              <p><span class="label">Motif:</span> ${this.badgeData.visitPurpose}</p>
              <p><span class="label">Début:</span> ${new Date(this.badgeData.startDate).toLocaleString('fr-FR')}</p>
              <p><span class="label">Fin:</span> ${new Date(this.badgeData.endDate).toLocaleString('fr-FR')}</p>
            </div>
          </div>
          
          <div class="qr-section">
            <div class="qr-code">QR</div>
            <div class="qr-text">${this.badgeData.qrCode}</div>
          </div>
          
          <div class="instructions">
            <h4>Instructions:</h4>
            <ul>
              <li>Portez ce badge visiblement pendant votre visite</li>
              <li>Rendez-le à la réception en partant</li>
              <li>Ne le prêtez à personne d'autre</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'GENERATED': return 'bg-yellow-100 text-yellow-800';
      case 'PRINTED': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'GENERATED': return 'Généré';
      case 'PRINTED': return 'Imprimé';
      case 'CLOSED': return 'Fermé';
      default: return status;
    }
  }
}
