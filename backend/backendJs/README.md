# GuestHub Backend API

Backend API pour le système de gestion des visiteurs GuestHub, développé avec Node.js, Express, TypeScript et PostgreSQL.

## 🚀 Fonctionnalités

- **Authentification et autorisation** avec JWT et Keycloak
- **Gestion des visiteurs** (création, modification, blacklist)
- **Gestion des visites** (planification, suivi, statuts)
- **Gestion des badges** (génération QR, impression, scan)
- **Gestion des employés et départements**
- **Système d'audit** complet
- **API REST** avec documentation Swagger
- **Sécurité avancée** (rate limiting, CORS, validation)
- **Logging** structuré avec Winston
- **Base de données** PostgreSQL avec Prisma ORM

## 🛠️ Technologies

- **Node.js** 18+
- **Express.js** - Framework web
- **TypeScript** - Langage de programmation
- **PostgreSQL** - Base de données
- **Prisma** - ORM
- **JWT** - Authentification
- **Keycloak** - Gestion des identités
- **Swagger** - Documentation API
- **Winston** - Logging
- **Jest** - Tests
- **ESLint** - Linting

## 📋 Prérequis

- Node.js 18.0.0 ou plus récent
- npm 8.0.0 ou plus récent
- PostgreSQL 12 ou plus récent
- Redis (optionnel, pour les sessions)

## 🔧 Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd backendJs
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   ```bash
   cp env.example .env
   ```
   
   Modifier le fichier `.env` avec vos configurations :
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/guesthub_db?schema=public"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
   
   # Keycloak (optionnel)
   KEYCLOAK_REALM="guesthub"
   KEYCLOAK_CLIENT_ID="guesthub-backend"
   KEYCLOAK_CLIENT_SECRET="your-keycloak-client-secret"
   KEYCLOAK_SERVER_URL="http://localhost:8080"
   ```

4. **Configuration de la base de données**
   ```bash
   # Générer le client Prisma
   npm run db:generate
   
   # Exécuter les migrations
   npm run db:migrate
   
   # Peupler la base de données (optionnel)
   npm run db:seed
   ```

## 🚀 Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📚 Documentation API

Une fois le serveur démarré, la documentation Swagger est disponible à :
- **URL** : http://localhost:3000/api-docs
- **JSON** : http://localhost:3000/api-docs/json
- **YAML** : http://localhost:3000/api-docs/yaml

## 🏗️ Structure du projet

```
src/
├── config/           # Configuration (database, logger, keycloak, swagger)
├── controllers/      # Contrôleurs API
├── database/         # Scripts de base de données (migrations, seeds)
├── middlewares/      # Middlewares (sécurité, validation, auth)
├── models/           # Modèles de données (Prisma)
├── routes/           # Routes API
├── services/         # Logique métier
├── types/            # Types TypeScript
├── utils/            # Utilitaires
├── validators/       # Validateurs de données
├── app.ts           # Configuration Express
└── server.ts        # Point d'entrée
```

## 🔐 Authentification

### JWT (Recommandé)
```bash
# Login
POST /api/auth/login
{
  "email": "admin@guesthub.com",
  "password": "admin123"
}

# Utiliser le token dans les headers
Authorization: Bearer <access_token>
```

### Keycloak (Optionnel)
Configuration Keycloak requise pour utiliser l'authentification OAuth2.

## 📊 Endpoints principaux

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Modifier le profil
- `POST /api/auth/change-password` - Changer le mot de passe

### Visiteurs
- `GET /api/visitors` - Liste des visiteurs
- `POST /api/visitors` - Créer un visiteur
- `GET /api/visitors/:id` - Détails d'un visiteur
- `PUT /api/visitors/:id` - Modifier un visiteur
- `DELETE /api/visitors/:id` - Supprimer un visiteur
- `POST /api/visitors/:id/blacklist` - Blacklister un visiteur

### Visites
- `GET /api/visits` - Liste des visites
- `POST /api/visits` - Créer une visite
- `GET /api/visits/:id` - Détails d'une visite
- `PUT /api/visits/:id` - Modifier une visite
- `POST /api/visits/:id/checkin` - Check-in
- `POST /api/visits/:id/checkout` - Check-out

### Badges
- `GET /api/badges` - Liste des badges
- `POST /api/badges` - Créer un badge
- `GET /api/badges/:id` - Détails d'un badge
- `PUT /api/badges/:id` - Modifier un badge
- `POST /api/badges/:id/print` - Imprimer un badge
- `POST /api/badges/:id/scan` - Scanner un badge

## 🧪 Tests

```bash
# Exécuter tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage
```

## 🔍 Linting

```bash
# Vérifier le code
npm run lint

# Corriger automatiquement
npm run lint:fix
```

## 📈 Monitoring

### Health Check
```bash
GET /health
```

### Logs
Les logs sont stockés dans le dossier `logs/` :
- `application-YYYY-MM-DD.log` - Logs généraux
- `error-YYYY-MM-DD.log` - Logs d'erreur
- `debug-YYYY-MM-DD.log` - Logs de debug

## 🚀 Déploiement

### Docker (Recommandé)
```bash
# Construire l'image
docker build -t guesthub-backend .

# Lancer le conteneur
docker run -p 3000:3000 --env-file .env guesthub-backend
```

### Variables d'environnement de production
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-production-secret
REDIS_URL=redis://host:6379
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Fabrice Corporation** - Développement initial

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Email : support@guesthub.com

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025
