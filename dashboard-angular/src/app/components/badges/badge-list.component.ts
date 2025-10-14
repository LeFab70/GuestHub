import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Badge, BadgeEtat, Visite } from '../../models/user.model';
import { BadgePrintComponent, BadgeData } from './badge-print.component';

@Component({
  selector: 'app-badge-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgePrintComponent],
  template: `
    <div class="w-full space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Badges à Imprimer</h2>
        <div class="text-sm text-gray-600">
          {{ getBadgeCount(BadgeEtat.GENERE) + getBadgeCount(BadgeEtat.EN_ATTENTE_VALIDATION) }} badges en attente d'impression
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Recherche</label>
            <input [(ngModel)]="searchTerm" (input)="filterBadges()" 
                   placeholder="QR Code, visiteur..." 
                   class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">État</label>
            <select [(ngModel)]="etatFilter" (change)="filterBadges()" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Tous</option>
              <option value="GENERE">Généré</option>
              <option value="EN_ATTENTE_VALIDATION">En attente</option>
              <option value="IMPRIME">Imprimé</option>
              <option value="VALIDE">Valide</option>
              <option value="RENDU">Rendu</option>
              <option value="AUTO_EXPIRE">Auto-expiré</option>
              <option value="SCANNE">Scanné</option>
            </select>
          </div>
          <div class="flex items-end">
            <button (click)="clearFilters()" 
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Effacer
            </button>
          </div>
        </div>
      </div>

      <!-- Tableau des badges -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visiteur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Émission</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let badge of filteredBadges">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ badge.qrCode }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Visiteur ID: {{ badge.visiteId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ badge.dateEmission | date:'dd/MM/yyyy HH:mm' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getEtatClass(badge.etat)" 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ badge.etat }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button (click)="printBadge(badge)" 
                        class="text-blue-600 hover:text-blue-900 mr-2">
                  <span class="material-icons text-sm">print</span>
                </button>
                <button (click)="updateBadgeState(badge, BadgeEtat.IMPRIME)" 
                        *ngIf="badge.etat === BadgeEtat.GENERE || badge.etat === BadgeEtat.EN_ATTENTE_VALIDATION"
                        class="text-blue-600 hover:text-blue-900">Marquer Imprimé</button>
                <button (click)="updateBadgeState(badge, BadgeEtat.VALIDE)" 
                        *ngIf="badge.etat === BadgeEtat.IMPRIME"
                        class="text-green-600 hover:text-green-900">Valider</button>
                <button (click)="updateBadgeState(badge, BadgeEtat.RENDU)" 
                        *ngIf="badge.etat === BadgeEtat.VALIDE"
                        class="text-gray-600 hover:text-gray-900">Rendu</button>
                <button (click)="updateBadgeState(badge, BadgeEtat.SCANNE)" 
                        *ngIf="badge.etat === BadgeEtat.RENDU"
                        class="text-purple-600 hover:text-purple-900">Scanner</button>
                <button (click)="updateBadgeState(badge, BadgeEtat.AUTO_EXPIRE)" 
                        *ngIf="badge.etat === BadgeEtat.VALIDE"
                        class="text-red-600 hover:text-red-900">Expirer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Statistiques des badges -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Total Badges</h3>
          <p class="text-2xl font-bold text-gray-900">{{ badges.length }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">En cours</h3>
          <p class="text-2xl font-bold text-blue-600">{{ getBadgeCount(BadgeEtat.VALIDE) }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Rendus</h3>
          <p class="text-2xl font-bold text-green-600">{{ getBadgeCount(BadgeEtat.RENDU) }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Expirés</h3>
          <p class="text-2xl font-bold text-red-600">{{ getBadgeCount(BadgeEtat.AUTO_EXPIRE) }}</p>
        </div>
      </div>

      <!-- Modal d'impression -->
      <div *ngIf="showPrintModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Impression de Badge</h3>
              <button 
                (click)="showPrintModal = false"
                class="text-gray-400 hover:text-gray-600">
                <span class="material-icons">close</span>
              </button>
            </div>
            <app-badge-print [badgeData]="selectedBadgeData"></app-badge-print>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BadgeListComponent implements OnInit {
  badges: Badge[] = [];
  filteredBadges: Badge[] = [];
  searchTerm = '';
  etatFilter = '';
  BadgeEtat = BadgeEtat;
  showPrintModal = false;
  selectedBadgeData: BadgeData = {
    id: '',
    visitorName: '',
    startDate: new Date(),
    endDate: new Date(),
    employeeName: '',
    departmentName: '',
    qrCode: '',
    visitPurpose: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadBadges();
  }

  loadBadges() {
    this.apiService.getBadges().subscribe({
      next: (data) => {
        this.badges = data;
        this.filterBadges();
      },
      error: (error) => console.error('Erreur lors du chargement des badges:', error)
    });
  }

  filterBadges() {
    this.filteredBadges = this.badges.filter(badge => {
      const matchesSearch = !this.searchTerm || 
        badge.qrCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        badge.visiteId.toString().includes(this.searchTerm);
      
      const matchesEtat = !this.etatFilter || badge.etat === this.etatFilter;
      
      // Par défaut, ne montrer que les badges non imprimés
      const isNotPrinted = badge.etat === BadgeEtat.GENERE || badge.etat === BadgeEtat.EN_ATTENTE_VALIDATION;
      
      return matchesSearch && matchesEtat && isNotPrinted;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.etatFilter = '';
    this.filterBadges();
  }

  getEtatClass(etat: BadgeEtat): string {
    switch (etat) {
      case BadgeEtat.GENERE: return 'bg-gray-100 text-gray-800';
      case BadgeEtat.EN_ATTENTE_VALIDATION: return 'bg-yellow-100 text-yellow-800';
      case BadgeEtat.IMPRIME: return 'bg-blue-100 text-blue-800';
      case BadgeEtat.VALIDE: return 'bg-green-100 text-green-800';
      case BadgeEtat.RENDU: return 'bg-gray-100 text-gray-800';
      case BadgeEtat.AUTO_EXPIRE: return 'bg-red-100 text-red-800';
      case BadgeEtat.SCANNE: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getBadgeCount(etat: BadgeEtat): number {
    return this.badges.filter(badge => badge.etat === etat).length;
  }

  updateBadgeState(badge: Badge, newEtat: BadgeEtat) {
    this.apiService.updateBadge(badge.id, { etat: newEtat }).subscribe({
      next: () => this.loadBadges(),
      error: (error) => console.error('Erreur lors de la mise à jour du badge:', error)
    });
  }

  printBadge(badge: Badge) {
    // Pré-remplir les données du badge pour l'impression
    this.selectedBadgeData = {
      id: badge.id.toString(),
      visitorName: 'Visiteur ' + badge.id, // En attendant les vraies données du serveur
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 heures par défaut
      employeeName: 'Employé',
      departmentName: 'Département',
      qrCode: badge.qrCode || 'QR' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      visitPurpose: 'Visite'
    };
    this.showPrintModal = true;
  }
}
