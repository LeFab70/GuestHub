# GuestHub Dashboard Angular

Dashboard de gestion des visiteurs basé sur les diagrammes UML fournis.

## Fonctionnalités

### Dashboard Administrateur
- **Gestion des Employés** : CRUD complet avec assignation aux départements
- **Gestion des Départements** : Création et modification des départements
- **Gestion des Visiteurs** : CRUD avec statut (Actif/Blacklisté)
- **Gestion des Visites** : Suivi des visites avec check-in/check-out
- **Gestion des Badges** : Suivi du cycle de vie des badges
- **Logs d'Audit** : Consultation des actions système

### Dashboard Réception
- **Vue d'ensemble** : Actions rapides et statistiques
- **Gestion des Visites** : Check-in visite planifiée ou nouvelle visite
- **Gestion des Visiteurs** : Consultation et modification
- **Gestion des Badges** : Impression et validation des badges

## Architecture

### Modèles (models/)
- `user.model.ts` : Tous les modèles basés sur le diagramme UML
  - User, Employe, Visiteur, Departement
  - Visite, Badge, Role, Permission, AuditLog
  - Enums : VisiteurStatus, RoleType, BadgeEtat

### Services (services/)
- `api.service.ts` : Service centralisé pour les appels API REST

### Composants (components/)
- `employees/` : Gestion des employés
- `departments/` : Gestion des départements  
- `visitors/` : Gestion des visiteurs
- `visits/` : Gestion des visites
- `badges/` : Gestion des badges
- `reports/` : Logs d'audit et rapports

### Pages (pages/)
- `admin/` : Dashboard administrateur avec onglets
- `reception/` : Dashboard réception avec actions rapides
- `login/` : Page de connexion (démo avec sélection de rôle)

## Installation et Lancement

```bash
cd dsahBoardAngular/dsah-board-angular
npm install
npm start
```

L'application sera disponible sur `http://localhost:4200`

## Configuration Backend

Le dashboard se connecte au backend Node.js sur `http://localhost:4000`. 

Assurez-vous que le backend est configuré avec les endpoints correspondants :
- `/api/users`, `/api/employes`, `/api/visiteurs`
- `/api/departements`, `/api/visites`, `/api/badges`
- `/api/roles`, `/api/permissions`, `/api/audit-logs`

## Utilisation

1. **Connexion** : Sélectionnez le rôle (Admin ou Réceptionniste)
2. **Dashboard Admin** : Accès complet à toutes les fonctionnalités
3. **Dashboard Réception** : Focus sur les visites et badges

## Technologies

- Angular 18 (Standalone Components)
- Tailwind CSS pour le styling
- TypeScript
- HttpClient pour les appels API