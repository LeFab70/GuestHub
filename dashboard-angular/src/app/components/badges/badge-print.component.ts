import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BadgeData {
  id: string;
  visitorName: string;
  visitorPhoto?: string;
  startDate: Date;
  endDate: Date;
  employeeName: string;
  departmentName: string;
  qrCode: string;
  visitPurpose?: string;
}

@Component({
  selector: 'app-badge-print',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
      <div class="text-center mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Impression de Badge</h3>
        <p class="text-gray-600">Aperçu et impression du badge du visiteur</p>
      </div>

      <!-- Aperçu du badge -->
      <div class="mb-8">
        <h4 class="text-lg font-medium text-gray-900 mb-4">Aperçu du badge</h4>
        <div class="flex justify-center">
          <div class="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg" style="width: 300px; height: 200px;">
            <!-- En-tête du badge -->
            <div class="text-center mb-4">
              <h2 class="text-lg font-bold text-blue-600">GUESTHUB</h2>
              <p class="text-xs text-gray-600">Badge Visiteur</p>
            </div>

            <!-- Contenu du badge -->
            <div class="flex items-start space-x-3">
              <!-- Photo -->
              <div class="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                <span *ngIf="!badgeData.visitorPhoto" class="material-icons text-gray-400 text-sm">person</span>
                <img *ngIf="badgeData.visitorPhoto" [src]="badgeData.visitorPhoto" class="w-full h-full object-cover rounded">
              </div>

              <!-- Informations -->
              <div class="flex-1 text-xs">
                <p class="font-semibold text-gray-900">{{ badgeData.visitorName || 'Nom du visiteur' }}</p>
                <p class="text-gray-600">{{ badgeData.visitPurpose || 'Motif de la visite' }}</p>
                <p class="text-gray-500">Arrivée: {{ formatDateTime(badgeData.startDate) }}</p>
                <p class="text-gray-500">Sortie: {{ formatDateTime(badgeData.endDate) }}</p>
                <p class="text-gray-500">Durée: {{ calculateDuration() }}</p>
                <p class="text-gray-500">{{ badgeData.employeeName || 'Employé' }} - {{ badgeData.departmentName || 'Département' }}</p>
              </div>
            </div>

            <!-- QR Code -->
            <div class="text-center mt-3">
              <div class="inline-block bg-gray-100 p-2 rounded">
                <span class="material-icons text-2xl text-gray-600">qr_code</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ badgeData.qrCode }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center space-x-4">
        <button 
          (click)="previewBadge()"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <span class="material-icons text-sm mr-2">visibility</span>
          Aperçu
        </button>
        <button 
          (click)="printBadge()"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          <span class="material-icons text-sm mr-2">print</span>
          Imprimer
        </button>
      </div>
    </div>
  `,
})
export class BadgePrintComponent implements OnInit {
  @Input() badgeData: BadgeData = {
    id: '',
    visitorName: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 heures par défaut
    employeeName: '',
    departmentName: '',
    qrCode: '',
    visitPurpose: ''
  };

  ngOnInit() {
    // Le composant reçoit les données via @Input
  }

  formatDateTime(date: Date): string {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  calculateDuration(): string {
    const diffMs = this.badgeData.endDate.getTime() - this.badgeData.startDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    } else {
      return `${diffMinutes}min`;
    }
  }

  previewBadge() {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(this.generateBadgeHTML());
      printWindow.document.close();
    }
  }

  printBadge() {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(this.generateBadgeHTML());
      printWindow.document.close();
      printWindow.print();
    }
  }

  private generateBadgeHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Badge Visiteur - GuestHub</title>
        <style>
          @page { 
            size: 300px 200px; 
            margin: 0; 
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 10px; 
            width: 280px; 
            height: 180px; 
            border: 2px solid #1e40af;
            border-radius: 8px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 10px; 
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .header h2 { 
            color: #1e40af; 
            margin: 0; 
            font-size: 16px; 
            font-weight: bold;
          }
          .header p { 
            color: #6b7280; 
            margin: 2px 0 0 0; 
            font-size: 10px; 
          }
          .content { 
            display: flex; 
            align-items: flex-start; 
            gap: 8px; 
            margin-bottom: 10px; 
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
            flex-shrink: 0;
          }
          .info { 
            flex: 1; 
            font-size: 9px; 
            line-height: 1.2; 
          }
          .info p { 
            margin: 1px 0; 
          }
          .visitor-name { 
            font-weight: bold; 
            color: #111827; 
            font-size: 10px; 
          }
          .qr-section { 
            text-align: center; 
            margin-top: 8px; 
            padding-top: 8px; 
            border-top: 1px solid #e5e7eb; 
          }
          .qr-code { 
            display: inline-block; 
            background: #f3f4f6; 
            padding: 4px; 
            border-radius: 4px; 
            margin-bottom: 4px; 
          }
          .qr-text { 
            font-size: 8px; 
            color: #6b7280; 
            font-family: monospace; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>GUESTHUB</h2>
          <p>Badge Visiteur</p>
        </div>
        
        <div class="content">
          <div class="photo">
            ${this.badgeData.visitorPhoto ? 
              `<img src="${this.badgeData.visitorPhoto}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 3px;">` : 
              '👤'
            }
          </div>
          <div class="info">
            <p class="visitor-name">${this.badgeData.visitorName || 'Nom du visiteur'}</p>
            <p>${this.badgeData.visitPurpose || 'Motif de la visite'}</p>
            <p>Arrivée: ${this.formatDateTime(this.badgeData.startDate)}</p>
            <p>Sortie: ${this.formatDateTime(this.badgeData.endDate)}</p>
            <p>Durée: ${this.calculateDuration()}</p>
            <p>${this.badgeData.employeeName || 'Employé'} - ${this.badgeData.departmentName || 'Département'}</p>
          </div>
        </div>
        
        <div class="qr-section">
          <div class="qr-code">QR</div>
          <div class="qr-text">${this.badgeData.qrCode}</div>
        </div>
      </body>
      </html>
    `;
  }
}
