# Guest Hub - Système de Gestion des Invités

Un système complet de gestion des invités avec authentification Keycloak, interface web Angular et API Spring Boot.

## 🏗️ Architecture du Projet

```
GuestHub/
├── backend/                 # API Spring Boot avec Keycloak
├── frontend/               # Interface web Angular
└── mobileswift/           # Application mobile iOS (à développer)
```

## 🚀 Fonctionnalités

### Backend (Spring Boot)
- ✅ Authentification Keycloak
- ✅ Gestion des utilisateurs (CRUD)
- ✅ Gestion des invités (CRUD)
- ✅ Gestion des visites (CRUD)
- ✅ API REST complète
- ✅ Base de données PostgreSQL
- ✅ Sécurité OAuth2

### Frontend (Angular)
- ✅ Dashboard avec statistiques
- ✅ Gestion des invités
- ✅ Gestion des visites
- ✅ Gestion des utilisateurs
- ✅ Rapports et analytics
- ✅ Interface responsive avec Angular Material
- ✅ Données de test (fake data)

### Mobile (Swift) - À développer
- 🚧 Application iOS native
- 🚧 Synchronisation avec l'API
- 🚧 Authentification mobile
- 🚧 Fonctionnalités hors ligne

## 🛠️ Technologies Utilisées

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security**
- **Spring Data JPA**
- **Keycloak 22.0.5**
- **PostgreSQL**
- **Maven**

### Frontend
- **Angular 17**
- **TypeScript**
- **Angular Material**
- **RxJS**
- **SCSS**

### Mobile (Prévu)
- **Swift 5.0+**
- **SwiftUI**
- **Core Data**
- **Alamofire**

## 📋 Prérequis

- Java 17+
- Node.js 18+
- PostgreSQL 13+
- Keycloak 22.0.5+
- Maven 3.6+
- Angular CLI 17+

## 🚀 Installation et Démarrage

### 1. Backend (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

L'API sera disponible sur `http://localhost:8080`

### 2. Frontend (Angular)

```bash
cd frontend/guest-hub-frontend
npm install
npm start
```

L'application sera disponible sur `http://localhost:4200`

### 3. Configuration de la Base de Données

1. Créer une base de données PostgreSQL nommée `guesthub`
2. Configurer les paramètres dans `backend/src/main/resources/application.yml`

### 4. Configuration Keycloak

1. Installer et démarrer Keycloak
2. Créer un realm `guesthub`
3. Configurer les clients et utilisateurs
4. Mettre à jour la configuration dans `application.yml`

## 📊 Modèle de Données

### Entités Principales

- **User** : Utilisateurs du système (admin, réceptionniste, employé, manager)
- **Guest** : Invités externes
- **Visit** : Visites programmées
- **VisitDocument** : Documents associés aux visites

### Relations

- Un utilisateur peut être hôte de plusieurs visites
- Un invité peut avoir plusieurs visites
- Une visite appartient à un invité et un hôte
- Une visite peut avoir plusieurs documents

## 🔐 Authentification et Autorisation

- **Keycloak** pour l'authentification centralisée
- **OAuth2** avec JWT tokens
- **Rôles** : ADMIN, MANAGER, RECEPTIONIST, EMPLOYEE
- **Permissions** basées sur les rôles

## 📱 API Endpoints

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/{id}` - Modifier un utilisateur
- `DELETE /api/users/{id}` - Supprimer un utilisateur

### Invités
- `GET /api/guests` - Liste des invités
- `POST /api/guests` - Créer un invité
- `PUT /api/guests/{id}` - Modifier un invité
- `DELETE /api/guests/{id}` - Supprimer un invité

### Visites
- `GET /api/visits` - Liste des visites
- `POST /api/visits` - Créer une visite
- `PUT /api/visits/{id}` - Modifier une visite
- `PATCH /api/visits/{id}/check-in` - Check-in
- `PATCH /api/visits/{id}/check-out` - Check-out

## 🎨 Interface Utilisateur

### Dashboard
- Statistiques en temps réel
- Visites récentes
- Actions rapides

### Gestion des Invités
- Liste avec filtres et recherche
- Formulaire de création/édition
- Gestion de la liste noire

### Gestion des Visites
- Planning des visites
- Check-in/Check-out
- Suivi des statuts

### Rapports
- Statistiques détaillées
- Filtres par date et statut
- Distribution des statuts

## 🔧 Développement

### Structure du Code

#### Backend
```
src/main/java/com/guesthub/
├── entity/          # Entités JPA
├── repository/      # Repositories Spring Data
├── controller/      # Contrôleurs REST
├── service/         # Services métier
├── dto/            # Objets de transfert
└── config/         # Configuration
```

#### Frontend
```
src/app/
├── components/      # Composants Angular
├── services/        # Services Angular
├── models/          # Modèles TypeScript
└── guards/          # Guards de navigation
```

## 📈 Améliorations Futures

- [ ] Application mobile iOS native
- [ ] Notifications en temps réel
- [ ] Intégration avec des systèmes de badges
- [ ] Rapports avancés et analytics
- [ ] API GraphQL
- [ ] Tests automatisés
- [ ] Déploiement Docker
- [ ] Monitoring et logging

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 📞 Support

Pour toute question ou support, contactez l'équipe de développement.
