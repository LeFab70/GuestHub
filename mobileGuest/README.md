# GuestHub Mobile App

Application mobile iOS pour la gestion des visites, connectée au backend Node.js.

## Architecture

### Services Singleton

L'application utilise des services singleton pour gérer les données et la communication avec le backend :

#### 1. **APIService** (`Core/Services/APIService.swift`)
- Service principal pour la communication avec le backend
- Gère les appels HTTP vers `http://localhost:3001/api`
- Modèles de données correspondant au backend
- Gestion des erreurs et des réponses

#### 2. **VisitorService** (`Core/Services/VisitorService.swift`)
- Gestion des visiteurs
- Recherche de visiteurs existants par email/téléphone
- Création de nouveaux visiteurs
- Gestion des visites planifiées

#### 3. **EmployeeService** (`Core/Services/EmployeeService.swift`)
- Gestion des employés
- Chargement de la liste des employés actifs
- Recherche et sélection d'employés
- Affichage des départements

#### 4. **VisitService** (`Core/Services/VisitService.swift`)
- Gestion des visites
- Création de nouvelles visites
- Confirmation des visites planifiées
- Gestion des statuts et durées

### Flux de Navigation

#### 1. **Visiteur Fréquent**
1. Sélection de la langue
2. "Je viens souvent" → Saisie email/téléphone
3. Recherche du visiteur dans la base
4. Si trouvé :
   - Visites planifiées → Confirmation
   - Pas de visites → Création nouvelle visite
5. Si non trouvé → Création nouveau profil

#### 2. **Visite Pré-enregistrée**
1. Sélection de la langue
2. "Visite pré-enregistrée" → Saisie email/téléphone
3. Recherche du visiteur
4. Affichage des visites planifiées
5. Confirmation de la visite

#### 3. **Nouveau Visiteur**
1. Sélection de la langue
2. "Nouvelle visite" → Inscription
3. Saisie des informations personnelles
4. Sélection de l'employé
5. Saisie du motif de visite
6. Confirmation et création

### Vues Principales

- **LanguageSelectionView** : Choix de la langue
- **VisitorOptionsView** : Options de visite
- **FrequentVisitorInfoView** : Recherche visiteur fréquent
- **VisitorRegistrationView** : Inscription nouveau visiteur
- **ScheduledVisitsListView** : Liste des visites planifiées
- **EmployeeSelectionView** : Sélection de l'employé
- **VisitPurposeView** : Saisie du motif de visite
- **VisitConfirmationView** : Confirmation avant création
- **VisitCreatedView** : Succès et instructions

### Intégration Backend

#### Endpoints Utilisés

- `GET /visitors` : Liste des visiteurs
- `POST /visitors` : Création d'un visiteur
- `GET /employees` : Liste des employés
- `GET /visits` : Liste des visites
- `POST /visits` : Création d'une visite
- `PATCH /visits/:id/check-in` : Confirmation d'une visite

#### Modèles de Données

Les modèles correspondent exactement à ceux du backend :
- `BackendVisitor` : Visiteur
- `BackendEmployee` : Employé
- `BackendVisit` : Visite
- `BackendBadge` : Badge
- `BackendDepartment` : Département

### Workflow de Visite

1. **Création/Recherche du visiteur**
2. **Sélection de l'employé à visiter**
3. **Saisie du motif et de la durée**
4. **Confirmation des informations**
5. **Création de la visite** → Badge généré en attente d'impression
6. **Instructions pour aller à la réception**

### Synchronisation Dashboard

Quand une visite est créée :
- Le badge est généré avec le statut `GENERATED`
- Les informations sont mises à jour sur le dashboard réceptionniste
- Le compteur "Badges à imprimer" est incrémenté
- La visite apparaît dans la liste des visites récentes

### Test de Connexion

Utilisez le script `test-backend-connection.swift` pour vérifier la connexion :

```bash
swift test-backend-connection.swift
```

### Prérequis

- Backend Node.js en cours d'exécution sur `http://localhost:3001`
- Base de données PostgreSQL avec les données de test
- Xcode pour compiler l'application iOS

### Configuration

L'URL du backend est configurée dans `APIService.swift` :
```swift
private let baseURL = "http://localhost:3001/api"
```

Modifiez cette URL selon votre configuration de déploiement.