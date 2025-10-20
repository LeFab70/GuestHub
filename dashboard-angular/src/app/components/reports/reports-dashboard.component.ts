import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogsComponent } from './audit-logs.component';
import { VisitStatisticsComponent } from './visit-statistics.component';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, AuditLogsComponent, VisitStatisticsComponent],
  template: `
    <div class="space-y-6">
      <!-- En-tête -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <span class="material-icons text-3xl mr-3">assessment</span>
          Tableau de Bord des Rapports
        </h2>
        <p class="text-gray-600">
          Consultez les logs utilisateur et analysez les statistiques des visites
        </p>
      </div>

      <!-- Onglets -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              (click)="activeTab = 'logs'"
              [class]="activeTab === 'logs' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center">
              <span class="material-icons text-lg mr-2">history</span>
              Logs Utilisateur
            </button>
            <button
              (click)="activeTab = 'statistics'"
              [class]="activeTab === 'statistics' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center">
              <span class="material-icons text-lg mr-2">analytics</span>
              Statistiques Visites
            </button>
          </nav>
        </div>

        <!-- Contenu des onglets -->
        <div class="p-6">
          <!-- Logs Utilisateur -->
          <div *ngIf="activeTab === 'logs'" class="space-y-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                <span class="material-icons text-xl mr-2">info</span>
                Logs d'Activité Utilisateur
              </h3>
              <p class="text-blue-700 text-sm">
                Consultez l'historique des actions effectuées par les utilisateurs du système.
                Les logs incluent les connexions, modifications, créations et suppressions.
              </p>
            </div>
            <app-audit-logs></app-audit-logs>
          </div>

          <!-- Statistiques Visites -->
          <div *ngIf="activeTab === 'statistics'" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-green-900 mb-2 flex items-center">
                <span class="material-icons text-xl mr-2">info</span>
                Analyse des Visites
              </h3>
              <p class="text-green-700 text-sm">
                Analysez les données de visites selon différents critères : département, employé, statut ou date.
                Sélectionnez une période et un critère d'analyse pour générer des statistiques détaillées.
              </p>
            </div>
            <app-visit-statistics></app-visit-statistics>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsDashboardComponent implements OnInit {
  activeTab: 'logs' | 'statistics' = 'logs';

  ngOnInit() {
    // Initialisation du composant
  }
}


