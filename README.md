# GuestHub - Système de Gestion des Invités

Un système complet de gestion des invités avec authentification, interface web Angular et application mobile iOS.

## 🏗️ Architecture du Projet

```
GuestHub/
├── backendJs/              # API Node.js/Express avec TypeScript
├── dashboard-angular/      # Interface web Angular
└── mobileGuest/           # Application mobile iOS Swift
```

## 🚀 Fonctionnalités

### Backend (Node.js/Express)

* ✅ Authentification JWT
* ✅ Gestion des utilisateurs (CRUD)
* ✅ Gestion des employés (CRUD)
* ✅ Gestion des départements (CRUD)
* ✅ Gestion des invités (CRUD)
* ✅ Gestion des visites (CRUD)
* ✅ API REST complète
* ✅ Base de données PostgreSQL avec Prisma
* ✅ Audit logging
* ✅ Rate limiting
* ✅ Documentation Swagger

### Frontend (Angular)

* ✅ Dashboard avec statistiques
* ✅ Gestion des employés
* ✅ Gestion des départements
* ✅ Gestion des utilisateurs
* ✅ Gestion des invités
* ✅ Gestion des visites
* ✅ Rapports et analytics
* ✅ Interface responsive avec Tailwind CSS
* ✅ Authentification JWT

### Mobile (Swift) - En développement

* 🚧 Application iOS native
* 🚧 Synchronisation avec l'API
* 🚧 Authentification mobile
* 🚧 Fonctionnalités hors ligne

## 🛠️ Technologies Utilisées

### Backend

* **Node.js 18+**
* **Express.js**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL**
* **JWT Authentication**
* **Swagger Documentation**

### Frontend

* **Angular 17**
* **TypeScript**
* **Tailwind CSS**
* **RxJS**
* **Angular Material**

### Mobile (Prévu)

* **Swift 5.0+**
* **SwiftUI**
* **Core Data**

## 📋 Prérequis

* Node.js 18+
* PostgreSQL 13+
* Angular CLI 17+
* Xcode 14+ (pour le mobile)

## 🚀 Installation et Démarrage

### 1. Backend (Node.js/Express)

```bash
cd backendJs
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```

L'API sera disponible sur `http://localhost:3000`

### 2. Frontend (Angular)

```bash
cd dashboard-angular
npm install
ng serve
```

L'application sera disponible sur `http://localhost:4200`

### 3. Mobile (iOS)

```bash
cd mobileGuest
# Ouvrir GuestHubMobile.xcodeproj dans Xcode
# Compiler et exécuter sur simulateur ou appareil
```

## 📊 Modèle de Données

### Entités Principales

* **User** : Utilisateurs du système (admin, réceptionniste, employé)
* **Employee** : Employés de l'entreprise
* **Department** : Départements de l'entreprise
* **Visitor** : Invités externes
* **Visit** : Visites programmées
* **Badge** : Badges d'accès

## 🔐 Authentification et Autorisation

* **JWT** pour l'authentification
* **Rôles** : ADMIN, RECEPTIONNISTE, USER
* **Permissions** basées sur les rôles

## 📱 API Endpoints

### Authentification

* `POST /api/auth/login` - Connexion
* `POST /api/auth/register` - Inscription
* `POST /api/auth/forgot-password` - Mot de passe oublié
* `POST /api/auth/change-password` - Changer le mot de passe

### Employés

* `GET /api/employees` - Liste des employés
* `POST /api/employees` - Créer un employé
* `PUT /api/employees/{id}` - Modifier un employé
* `PATCH /api/employees/{id}/deactivate` - Désactiver un employé
* `PATCH /api/employees/{id}/activate` - Activer un employé
* `DELETE /api/employees/{id}` - Supprimer un employé

### Départements

* `GET /api/departments` - Liste des départements
* `POST /api/departments` - Créer un département
* `PUT /api/departments/{id}` - Modifier un département
* `DELETE /api/departments/{id}` - Supprimer un département

## 🎨 Interface Utilisateur

### Dashboard

* Statistiques en temps réel
* Employés actifs
* Visites récentes
* Actions rapides

### Gestion des Employés

* Liste avec filtres et recherche
* Formulaire de création/édition
* Activation/Désactivation
* Filtrage par statut

### Gestion des Départements

* Liste avec actions rapides
* Formulaire de création/édition
* Gestion des employés par département

## 🔧 Développement

### Structure du Code

#### Backend

```
backendJs/src/
├── controllers/     # Contrôleurs Express
├── services/        # Services métier
├── routes/          # Routes API
├── middlewares/     # Middlewares
├── types/           # Types TypeScript
└── validators/      # Validateurs
```

#### Frontend

```
dashboard-angular/src/app/
├── components/      # Composants Angular
├── services/        # Services Angular
├── pages/           # Pages
└── guards/          # Guards de navigation
```

## 📈 Améliorations Futures

* Application mobile iOS native
* Notifications en temps réel
* Intégration avec des systèmes de badges
* Rapports avancés et analytics
* Tests automatisés
* Déploiement Docker
* Monitoring et logging

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question ou support, contactez l'équipe de développement.
