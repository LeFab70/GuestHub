# 🚀 GuestHub Backend - Guide de Configuration

## ✅ Structure Créée

Le backend Node.js a été créé avec succès avec la structure suivante :

```
backendJs/
├── src/
│   ├── config/           # Configuration (database, logger, env)
│   ├── controllers/      # Contrôleurs API (auth)
│   ├── database/         # Scripts de base de données (seed)
│   ├── middlewares/      # Middlewares de sécurité
│   ├── routes/           # Routes API (auth)
│   ├── services/         # Services métier (auth, visitor)
│   ├── types/            # Types TypeScript
│   ├── utils/            # Utilitaires
│   ├── validators/       # Validateurs de données
│   ├── app.ts           # Configuration Express
│   └── server.ts        # Point d'entrée
├── prisma/
│   └── schema.prisma    # Schéma de base de données
├── package.json         # Dépendances et scripts
├── tsconfig.json        # Configuration TypeScript
├── env.example          # Variables d'environnement
└── test-server.js       # Serveur de test simple
```

## 🛠️ Technologies Intégrées

### ✅ Dépendances Principales
- **Express.js** - Framework web
- **TypeScript** - Langage de programmation
- **Prisma** - ORM pour PostgreSQL
- **JWT** - Authentification
- **bcryptjs** - Hachage des mots de passe
- **Winston** - Logging
- **Helmet** - Sécurité
- **CORS** - Gestion des origines croisées
- **Express Rate Limit** - Limitation de débit
- **Express Validator** - Validation des données

### ✅ Fonctionnalités Implémentées
- **Authentification JWT** complète
- **Sécurité avancée** (rate limiting, CORS, validation)
- **Logging structuré** avec Winston
- **Validation des données** avec Express Validator
- **Types TypeScript** complets
- **Schéma Prisma** pour PostgreSQL
- **API REST** avec documentation

## 🚀 Démarrage Rapide

### 1. Installation des Dépendances
```bash
cd backendJs
npm install
```

### 2. Configuration de l'Environnement
```bash
cp env.example .env
# Modifier le fichier .env avec vos configurations
```

### 3. Compilation TypeScript
```bash
npm run build
```

### 4. Test du Serveur (sans base de données)
```bash
node test-server.js
```

### 5. Test des Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@guesthub.com","password":"admin123"}'
```

## 📊 Endpoints Disponibles

### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/refresh` - Rafraîchir le token
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Modifier le profil
- `POST /api/auth/change-password` - Changer le mot de passe
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/verify` - Vérifier le token

### Système
- `GET /` - Page d'accueil de l'API
- `GET /health` - Health check
- `GET /api-docs` - Documentation API

## 🗄️ Configuration Base de Données

### Schéma Prisma Créé
Le schéma Prisma inclut toutes les entités du diagramme UML :
- **User** - Utilisateurs du système
- **Department** - Départements
- **Employee** - Employés
- **Visitor** - Visiteurs
- **Visite** - Visites
- **Badge** - Badges QR
- **AuditLog** - Logs d'audit

### Commandes Prisma
```bash
# Générer le client Prisma
npm run db:generate

# Exécuter les migrations
npm run db:migrate

# Peupler la base de données
npm run db:seed

# Interface Prisma Studio
npm run db:studio
```

## 🔐 Sécurité Implémentée

### Middlewares de Sécurité
- **Helmet** - Headers de sécurité
- **CORS** - Gestion des origines croisées
- **Rate Limiting** - Limitation de débit
- **Request Size Limiting** - Limitation de taille
- **Input Sanitization** - Nettoyage des entrées
- **JWT Authentication** - Authentification par token

### Validation des Données
- **Express Validator** - Validation des requêtes
- **TypeScript** - Vérification des types
- **Prisma** - Validation au niveau base de données

## 📝 Logging et Monitoring

### Winston Logger
- **Logs structurés** en JSON
- **Rotation quotidienne** des fichiers
- **Niveaux de log** (error, warn, info, debug)
- **Logs d'audit** pour les actions utilisateur

### Health Check
- **Endpoint `/health`** pour monitoring
- **Vérification base de données**
- **Métriques système** (uptime, mémoire)

## 🧪 Tests et Développement

### Scripts Disponibles
```bash
npm run dev          # Développement avec nodemon
npm run build        # Compilation TypeScript
npm start           # Démarrage production
npm test            # Exécution des tests
npm run lint        # Vérification du code
npm run lint:fix    # Correction automatique
```

### Serveur de Test
Le fichier `test-server.js` permet de tester l'API sans base de données :
- **Endpoints simplifiés** pour les tests
- **Authentification mock** pour le développement
- **Pas de dépendance** à PostgreSQL

## 🔄 Prochaines Étapes

### Pour Compléter le Backend
1. **Configurer PostgreSQL** et exécuter les migrations
2. **Créer les contrôleurs** pour toutes les entités
3. **Implémenter les services** complets
4. **Ajouter les tests** unitaires et d'intégration
5. **Configurer Keycloak** pour l'authentification avancée
6. **Ajouter Swagger** pour la documentation API

### Intégration Frontend
1. **Configurer CORS** pour l'Angular frontend
2. **Implémenter l'authentification** côté frontend
3. **Créer les services Angular** pour les appels API
4. **Tester l'intégration** complète

## 📞 Support

Le backend est maintenant prêt pour le développement ! 

**Points clés :**
- ✅ Structure complète créée
- ✅ TypeScript configuré et compilant
- ✅ Sécurité implémentée
- ✅ API de base fonctionnelle
- ✅ Documentation complète

**Pour continuer :**
1. Configurer PostgreSQL
2. Exécuter les migrations Prisma
3. Tester avec le frontend Angular
4. Développer les fonctionnalités métier

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025  
**Statut** : ✅ Prêt pour le développement
