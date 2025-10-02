# 📚 GuestHub API Documentation

## 🚀 **Interface Swagger UI**

L'API dispose maintenant d'une interface web interactive complète :

**URL :** http://localhost:3000/api-docs/

### ✨ **Fonctionnalités de l'interface Swagger :**

1. **📖 Documentation Interactive** : Tous les endpoints sont documentés avec des exemples
2. **🧪 Test en Direct** : Vous pouvez tester les API directement depuis l'interface
3. **📋 Schémas de Données** : Tous les modèles de données sont définis
4. **🔐 Authentification** : Support JWT Bearer Token
5. **📱 Interface Responsive** : Fonctionne sur desktop et mobile

## 🎯 **Endpoints Disponibles**

### **🔐 Authentification** (`/api/auth`)
- `POST /register` - Enregistrer un nouvel utilisateur
- `POST /login` - Connexion utilisateur
- `POST /refresh` - Rafraîchir le token
- `GET /profile` - Profil utilisateur
- `PUT /profile` - Mettre à jour le profil
- `PATCH /change-password` - Changer le mot de passe
- `POST /logout` - Déconnexion
- `GET /verify` - Vérifier le token

### **👥 Visiteurs** (`/api/visitors`)
- `POST /` - Créer un visiteur
- `GET /` - Liste des visiteurs (avec pagination)
- `GET /search` - Rechercher des visiteurs
- `GET /:id` - Détails d'un visiteur
- `PUT /:id` - Modifier un visiteur
- `DELETE /:id` - Supprimer un visiteur
- `PATCH /:id/toggle-blacklist` - Blacklister/déblacklister

### **📅 Visites** (`/api/visits`)
- `POST /` - Créer une visite
- `GET /` - Liste des visites (avec pagination)
- `GET /active` - Visites en cours
- `GET /stats` - Statistiques des visites
- `GET /:id` - Détails d'une visite
- `PUT /:id` - Modifier une visite
- `DELETE /:id` - Supprimer une visite
- `PATCH /:id/check-in` - Check-in d'une visite
- `PATCH /:id/check-out` - Check-out d'une visite

### **🏷️ Badges** (`/api/badges`)
- `POST /` - Créer un badge
- `GET /` - Liste des badges (avec pagination)
- `GET /active` - Badges actifs
- `POST /scan` - Scanner un badge (QR)
- `GET /:id` - Détails d'un badge
- `PUT /:id` - Modifier un badge
- `DELETE /:id` - Supprimer un badge
- `PATCH /:id/activate` - Activer un badge
- `PATCH /:id/deactivate` - Désactiver un badge
- `GET /:id/qr-code` - Générer QR code

### **👨‍💼 Employés** (`/api/employees`)
- `POST /` - Créer un employé
- `GET /` - Liste des employés (avec pagination)
- `GET /search` - Rechercher des employés
- `GET /stats` - Statistiques des employés
- `GET /department/:departmentId` - Employés par département
- `GET /:id` - Détails d'un employé
- `PUT /:id` - Modifier un employé
- `DELETE /:id` - Supprimer un employé

### **🏢 Départements** (`/api/departments`)
- `POST /` - Créer un département
- `GET /` - Liste des départements (avec pagination)
- `GET /search` - Rechercher des départements
- `GET /stats` - Statistiques des départements
- `GET /with-employee-count` - Départements avec nombre d'employés
- `GET /:id` - Détails d'un département
- `PUT /:id` - Modifier un département
- `DELETE /:id` - Supprimer un département

### **⚙️ Système** (`/`)
- `GET /health` - Health check
- `GET /` - Page d'accueil

## 🔧 **Utilisation de l'Interface Swagger**

### **1. Accéder à l'interface**
Ouvrez votre navigateur et allez sur : http://localhost:3000/api-docs/

### **2. Tester une API**
1. Cliquez sur un endpoint (ex: `POST /api/auth/login`)
2. Cliquez sur "Try it out"
3. Remplissez les données dans le formulaire JSON
4. Cliquez sur "Execute"
5. Consultez la réponse

### **3. Authentification**
Pour tester les endpoints protégés :
1. Connectez-vous via `POST /api/auth/login`
2. Copiez le `accessToken` de la réponse
3. Cliquez sur le bouton "Authorize" en haut de la page
4. Entrez : `Bearer VOTRE_TOKEN_ICI`
5. Cliquez sur "Authorize"

## 📝 **Exemples de Requêtes**

### **Connexion**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@guesthub.com",
    "password": "admin123"
  }'
```

### **Créer un visiteur**
```bash
curl -X POST http://localhost:3000/api/visitors \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Doe",
    "prenom": "John",
    "email": "john.doe@example.com",
    "telephone": "+1234567890",
    "entreprise": "Example Corp"
  }'
```

### **Créer une visite**
```bash
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -d '{
    "visiteurId": "uuid-here",
    "employeId": "uuid-here",
    "dateDebut": "2025-01-15T09:00:00Z",
    "motif": "Meeting with team"
  }'
```

## 🎨 **Interface Personnalisée**

L'interface Swagger a été personnalisée avec :
- ✅ **Titre personnalisé** : "GuestHub API Documentation"
- ✅ **Barre de navigation masquée** pour un look plus propre
- ✅ **Thème cohérent** avec l'identité visuelle du projet
- ✅ **Support multilingue** (français/anglais)

## 🚀 **Prochaines Étapes**

1. **Configurer PostgreSQL** pour la production
2. **Tester l'intégration** avec le frontend Angular
3. **Ajouter l'authentification JWT** complète
4. **Déployer en production**

---

**🎉 L'API GuestHub est maintenant complètement documentée et prête à être utilisée !**
