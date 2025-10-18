import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { DashboardUpdateService } from '../../services/dashboard-update.service';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full">
      <div class="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
      <div class="text-center mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Scanner QR Code Badge</h3>
        <p class="text-gray-600">Scannez le QR code du badge du visiteur pour le check-in/check-out</p>
      </div>

      <!-- Zone de scan -->
      <div class="relative mb-6">
        <div class="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-gradient-to-br from-blue-50 to-blue-100">
          <div class="mb-4">
            <span class="material-icons text-6xl text-blue-500">qr_code_scanner</span>
          </div>
          <p class="text-gray-600 mb-4">Positionnez le QR code dans la zone de scan</p>
          <button 
            (click)="startScanning()"
            [disabled]="isScanning"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="material-icons text-sm mr-2">camera_alt</span>
            {{ isScanning ? 'Scan en cours...' : 'Démarrer le scan' }}
          </button>
        </div>
      </div>

      <!-- Zone de saisie manuelle -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ou saisissez manuellement le code QR :
        </label>
        <div class="flex space-x-2">
          <input 
            [(ngModel)]="manualQrCode"
            placeholder="Entrez le code QR du badge"
            class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <button 
            (click)="processQrCode(manualQrCode)"
            [disabled]="!manualQrCode"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="material-icons text-sm">search</span>
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span class="text-sm text-blue-700">Scan en cours...</span>
        </div>
      </div>

      <!-- Error state -->
      <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <span class="material-icons text-red-600 mr-2">error</span>
          <div>
            <h4 class="text-sm font-medium text-red-800">Erreur de scan</h4>
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Résultats du scan -->
      <div *ngIf="scanResult && scannedBadge" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <span class="material-icons text-green-600 mr-2">check_circle</span>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-green-800">Badge scanné avec succès</h4>
            <p class="text-sm text-green-700">Code QR: {{ scanResult }}</p>
            <div *ngIf="scannedBadge.visite" class="mt-2 text-xs text-green-600">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p><strong>Visiteur:</strong> {{ scannedBadge.visite.visiteur?.prenom }} {{ scannedBadge.visite.visiteur?.nom }}</p>
                  <p><strong>Email:</strong> {{ scannedBadge.visite.visiteur?.email }}</p>
                  <p><strong>Entreprise:</strong> {{ scannedBadge.visite.visiteur?.entreprise }}</p>
                </div>
                <div>
                  <p><strong>Employé:</strong> {{ scannedBadge.visite.employe?.prenom }} {{ scannedBadge.visite.employe?.nom }}</p>
                  <p><strong>Département:</strong> {{ scannedBadge.visite.employe?.department?.nom }}</p>
                  <p><strong>Date visite:</strong> {{ scannedBadge.visite.dateDebut | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>
              <div class="mt-2 pt-2 border-t border-green-200">
                <p><strong>Statut badge:</strong> {{ getBadgeStatusLabel(scannedBadge.status) }}</p>
                <p><strong>Statut visite:</strong> {{ getVisitStatusLabel(scannedBadge.visite.statut) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions après scan -->
      <div *ngIf="scanResult && scannedBadge" class="flex space-x-4">
        <button 
          (click)="checkOut()"
          [disabled]="isLoading || scannedBadge.status !== 'PRINTED'"
          class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-icons text-sm mr-2" *ngIf="!isLoading">logout</span>
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" *ngIf="isLoading"></div>
          Terminer la visite (Check-out)
        </button>
        <button 
          (click)="clearScan()"
          [disabled]="isLoading"
          class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-icons text-sm">clear</span>
        </button>
      </div>
      </div>
    </div>
  `,
})
export class QrScannerComponent implements OnInit, OnDestroy {
  isScanning = false;
  manualQrCode = '';
  scanResult = '';
  isLoading = false;
  errorMessage = '';
  scannedBadge: any = null;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private dashboardUpdateService: DashboardUpdateService
  ) {}

  ngOnInit() {
    // Initialisation du composant
  }

  ngOnDestroy() {
    // Le service gère déjà la sauvegarde
  }


  startScanning() {
    this.isScanning = true;
    this.errorMessage = '';
    
    // TODO: Implémenter l'intégration avec un vrai scanner QR
    // Note: Dans un vrai scanner, ceci utiliserait une API de scan QR
    // Pour l'instant, on affiche un message d'information
    setTimeout(() => {
      this.errorMessage = 'Scanner QR non disponible. Veuillez utiliser la saisie manuelle.';
      this.isScanning = false;
    }, 1000);
  }

  processQrCode(qrCode: string) {
    if (!qrCode) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.scanResult = qrCode;
    this.manualQrCode = '';
    
    // Scanner le badge via l'API backend
    this.apiService.scanBadge(qrCode).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.scannedBadge = response.data;
          
          // L'enregistrement du scan est maintenant géré côté serveur
          
          this.toastService.success('Badge scanné', 'Le badge a été scanné avec succès');
          // Déclencher la mise à jour des dashboards
          this.dashboardUpdateService.triggerDashboardUpdate();
        } else {
          this.errorMessage = response.message || 'Badge non trouvé';
          this.toastService.error('Erreur', this.errorMessage);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error scanning badge:', error);
        this.errorMessage = 'Erreur lors du scan du badge';
        this.toastService.error('Erreur', this.errorMessage);
        this.isLoading = false;
      }
    });
  }


  checkOut() {
    if (this.scannedBadge) {
      this.isLoading = true;
      
      // Appeler l'API pour terminer la visite
      this.apiService.returnBadge(this.scannedBadge.id).subscribe({
        next: (response) => {
          if (response.success) {
            // L'enregistrement du check-out est maintenant géré côté serveur
            
            this.toastService.success('Visite terminée', `La visite de ${this.scannedBadge.visite.visiteur.prenom} ${this.scannedBadge.visite.visiteur.nom} a été terminée avec succès`);
            // Déclencher la mise à jour des dashboards
            this.dashboardUpdateService.triggerDashboardUpdate();
            this.clearScan();
          } else {
            this.toastService.error('Erreur', response.message || 'Erreur lors de la terminaison de la visite');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error during checkout:', error);
          this.toastService.error('Erreur', 'Erreur lors de la terminaison de la visite');
          this.isLoading = false;
        }
      });
    }
  }

  clearScan() {
    this.scanResult = '';
    this.manualQrCode = '';
    this.scannedBadge = null;
    this.errorMessage = '';
  }


  getBadgeStatusLabel(status: string): string {
    switch (status) {
      case 'GENERATED':
        return 'Généré';
      case 'PRINTED':
        return 'Imprimé';
      case 'CLOSED':
        return 'Fermé';
      default:
        return status;
    }
  }

  getVisitStatusLabel(status: string): string {
    switch (status) {
      case 'PLANIFIEE':
        return 'Planifiée';
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINEE':
        return 'Terminée';
      case 'EXPIREE':
        return 'Expirée';
      case 'ANNULEE':
        return 'Annulée';
      default:
        return status;
    }
  }
}
