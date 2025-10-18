import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuditLog } from '../../models/user.model';
import { ToastService } from '../../services/toast.service';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'RECEPTIONNISTE';
  isActive: boolean;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Logs d'Audit</h2>
        <div class="flex space-x-2">
          <button 
            (click)="previewReport()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <span class="material-icons text-sm mr-2">visibility</span>
            Aperçu
          </button>
          <button 
            (click)="printReport()"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <span class="material-icons text-sm mr-2">print</span>
            Imprimer
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Recherche</label>
            <input [(ngModel)]="searchTerm" (input)="filterLogs()" 
                   placeholder="Action, utilisateur..." 
                   class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Utilisateur</label>
            <select [(ngModel)]="selectedUser" (change)="filterLogs()" 
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Tous les utilisateurs</option>
              <option *ngFor="let user of users" [value]="user.id">
                {{ user.prenom }} {{ user.nom }} ({{ user.email }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Date début</label>
            <input [(ngModel)]="dateFrom" (change)="filterLogs()" type="date"
                   class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
          </div>
          <div class="flex items-end">
            <button (click)="clearFilters()" 
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Effacer
            </button>
          </div>
        </div>
      </div>

      <!-- Tableau des logs -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Heure</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Entité</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let log of filteredLogs">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ log.dateHeure | date:'dd/MM/yyyy HH:mm:ss' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ log.user?.prenom }} {{ log.user?.nom }} ({{ log.user?.email }})
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getActionClass(log.action)" 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.entityId }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ log.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Total Logs</h3>
          <p class="text-2xl font-bold text-gray-900">{{ logs.length }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Aujourd'hui</h3>
          <p class="text-2xl font-bold text-blue-600">{{ getTodayCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Créations</h3>
          <p class="text-2xl font-bold text-green-600">{{ getActionCount('Création') }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Modifications</h3>
          <p class="text-2xl font-bold text-yellow-600">{{ getActionCount('Modification') }}</p>
        </div>
      </div>
    </div>
  `
})

export class AuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  users: User[] = [];
  searchTerm = '';
  selectedUser = '';
  dateFrom = '';

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadLogs();
  }

  loadUsers() {
    this.apiService.getUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users = response.data.map((user: any) => ({
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            isActive: user.isActive
          }));
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadLogs() {
    this.apiService.getAuditLogs().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.logs) {
          this.logs = response.data.logs.map((log: any) => ({
            id: log.id,
            dateHeure: new Date(log.dateHeure),
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            userId: log.userId,
            user: log.user ? {
              id: log.user.id,
              nom: log.user.nom,
              prenom: log.user.prenom,
              email: log.user.email,
              role: log.user.role
            } : null,
            details: log.details
          }));
          this.filterLogs();
        } else {
          this.toastService.error('Erreur', response.message || 'Erreur lors du chargement des logs');
        }
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.toastService.error('Erreur', 'Erreur lors du chargement des logs d\'audit');
      }
    });
  }

  filterLogs() {
    // Appliquer les filtres locaux sans recharger les données
    this.filteredLogs = this.logs.filter(log => {
      const matchesSearch = !this.searchTerm || 
        log.action.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.user?.login?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesUser = !this.selectedUser || (log.userId && log.userId.toString() === this.selectedUser);
      
      const matchesDate = !this.dateFrom || 
        new Date(log.dateHeure) >= new Date(this.dateFrom);
      
      return matchesSearch && matchesUser && matchesDate;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedUser = '';
    this.dateFrom = '';
    this.filterLogs();
  }

  previewReport() {
    try {
      // Ouvrir une nouvelle fenêtre avec l'aperçu du rapport
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(this.generateReportHTML());
        printWindow.document.close();
        this.toastService.success('Aperçu généré', 'L\'aperçu du rapport a été ouvert dans une nouvelle fenêtre');
      } else {
        this.toastService.error('Erreur', 'Impossible d\'ouvrir la fenêtre d\'aperçu. Vérifiez que les popups sont autorisés.');
      }
    } catch (error) {
      this.toastService.error('Erreur', 'Une erreur est survenue lors de la génération de l\'aperçu');
    }
  }

  printReport() {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(this.generateReportHTML());
        printWindow.document.close();
        printWindow.print();
        this.toastService.success('Impression lancée', 'Le rapport est en cours d\'impression');
      } else {
        this.toastService.error('Erreur', 'Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez que les popups sont autorisés.');
      }
    } catch (error) {
      this.toastService.error('Erreur', 'Une erreur est survenue lors de l\'impression');
    }
  }

  private generateReportHTML(): string {
    const filteredLogs = this.filteredLogs;
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport d'Audit - GuestHub</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #1e40af; margin-bottom: 10px; }
          .header p { color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport d'Audit - GuestHub</h1>
          <p>Généré le ${currentDate}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Entité</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogs.map(log => `
              <tr>
                <td>${new Date(log.dateHeure).toLocaleString('fr-FR')}</td>
                <td>${log.userId}</td>
                <td>${log.action}</td>
                <td>${log.entityType}</td>
                <td>${log.details}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          © 2025 GuestHub - Développé par Fabrice Corporation
        </div>
      </body>
      </html>
    `;
  }

  getActionClass(action: string): string {
    if (action.includes('Création') || action.includes('Créer')) {
      return 'bg-green-100 text-green-800';
    } else if (action.includes('Modification') || action.includes('Modifier')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (action.includes('Suppression') || action.includes('Supprimer')) {
      return 'bg-red-100 text-red-800';
    } else if (action.includes('Connexion') || action.includes('Login')) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }

  getTodayCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.logs.filter(log => new Date(log.dateHeure) >= today).length;
  }

  getActionCount(actionType: string): number {
    return this.logs.filter(log => log.action.includes(actionType)).length;
  }
}
