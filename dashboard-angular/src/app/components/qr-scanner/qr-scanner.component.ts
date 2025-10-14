import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

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
              <p><strong>Visiteur:</strong> {{ scannedBadge.visite.visiteur?.prenom }} {{ scannedBadge.visite.visiteur?.nom }}</p>
              <p><strong>Employé:</strong> {{ scannedBadge.visite.employe?.prenom }} {{ scannedBadge.visite.employe?.nom }}</p>
              <p><strong>État:</strong> {{ scannedBadge.etat }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions après scan -->
      <div *ngIf="scanResult && scannedBadge" class="flex space-x-4">
        <button 
          (click)="checkIn()"
          [disabled]="isLoading"
          class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-icons text-sm mr-2" *ngIf="!isLoading">login</span>
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" *ngIf="isLoading"></div>
          Check-in
        </button>
        <button 
          (click)="checkOut()"
          [disabled]="isLoading"
          class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-icons text-sm mr-2" *ngIf="!isLoading">logout</span>
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" *ngIf="isLoading"></div>
          Check-out
        </button>
        <button 
          (click)="clearScan()"
          [disabled]="isLoading"
          class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-icons text-sm">clear</span>
        </button>
      </div>

      <!-- Historique des scans récents -->
      <div class="mt-6">
        <h4 class="text-sm font-medium text-gray-900 mb-3">Scans récents</h4>
        <div class="space-y-2">
          <div *ngFor="let scan of recentScans" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <span class="material-icons text-sm text-gray-500 mr-2">qr_code</span>
              <span class="text-sm text-gray-700">{{ scan.qrCode }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">{{ scan.timestamp | date:'HH:mm' }}</span>
              <span class="px-2 py-1 text-xs rounded-full" 
                    [class]="scan.action === 'check-in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ scan.action }}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  `,
})
export class QrScannerComponent implements OnInit, OnDestroy {
  isScanning = false;
  manualQrCode = '';
  scanResult = '';
  recentScans: Array<{qrCode: string, action: string, timestamp: Date}> = [];
  isLoading = false;
  errorMessage = '';
  scannedBadge: any = null;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Charger l'historique des scans depuis le localStorage
    const saved = localStorage.getItem('recentScans');
    if (saved) {
      this.recentScans = JSON.parse(saved).map((scan: any) => ({
        ...scan,
        timestamp: new Date(scan.timestamp)
      }));
    }
  }

  ngOnDestroy() {
    // Sauvegarder l'historique
    localStorage.setItem('recentScans', JSON.stringify(this.recentScans));
  }

  startScanning() {
    this.isScanning = true;
    this.errorMessage = '';
    
    // Note: Dans un vrai scanner, ceci utiliserait une API de scan QR
    // Pour la démo, on simule un scan après 2 secondes
    setTimeout(() => {
      // Simuler un code QR scanné (en production, ceci viendrait du scanner)
      const mockQrCode = 'QR' + Math.random().toString(36).substr(2, 9).toUpperCase();
      this.processQrCode(mockQrCode);
      this.isScanning = false;
    }, 2000);
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
          this.toastService.success('Badge scanné', 'Le badge a été scanné avec succès');
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

  checkIn() {
    if (this.scannedBadge) {
      this.isLoading = true;
      // Ici, vous pourriez appeler une API pour enregistrer le check-in
      // Pour l'instant, on simule juste l'action
      setTimeout(() => {
        this.addToHistory(this.scanResult, 'check-in');
        this.toastService.success('Check-in', `Check-in effectué pour le badge: ${this.scanResult}`);
        this.clearScan();
        this.isLoading = false;
      }, 1000);
    }
  }

  checkOut() {
    if (this.scannedBadge) {
      this.isLoading = true;
      // Ici, vous pourriez appeler une API pour enregistrer le check-out
      // Pour l'instant, on simule juste l'action
      setTimeout(() => {
        this.addToHistory(this.scanResult, 'check-out');
        this.toastService.success('Check-out', `Check-out effectué pour le badge: ${this.scanResult}`);
        this.clearScan();
        this.isLoading = false;
      }, 1000);
    }
  }

  clearScan() {
    this.scanResult = '';
    this.manualQrCode = '';
    this.scannedBadge = null;
    this.errorMessage = '';
  }

  private addToHistory(qrCode: string, action: string) {
    this.recentScans.unshift({
      qrCode,
      action,
      timestamp: new Date()
    });
    
    // Garder seulement les 10 derniers scans
    if (this.recentScans.length > 10) {
      this.recentScans = this.recentScans.slice(0, 10);
    }
  }
}
