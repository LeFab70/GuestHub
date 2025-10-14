# 🔐 Instructions de Connexion - GuestHub

## Comptes de Démonstration

### 👨‍💼 Administrateur
- **Email:** `admin@guesthub.com`
- **Mot de passe:** `admin123`
- **Accès:** Gestion complète (employés, départements, visiteurs, visites, badges, rapports)

### 👩‍💼 Réceptionniste
- **Email:** `reception@guesthub.com`
- **Mot de passe:** `reception123`
- **Accès:** Gestion des visites, visiteurs et badges

## 🚀 Comment se connecter

1. **Démarrez l'application** avec `npm start`
2. **Accédez à** `http://localhost:4200`
3. **Choisissez votre type de compte** (Administrateur ou Réceptionniste)
4. **Saisissez vos identifiants** dans le formulaire de connexion
5. **Cliquez sur "Se connecter"**

## ✨ Fonctionnalités

### 🔑 Authentification
- Formulaire de connexion avec email et mot de passe
- Validation des identifiants
- Gestion des erreurs de connexion
- Option "Se souvenir de moi"

### 👤 Gestion du Profil
- Modification des informations personnelles
- Changement de mot de passe
- Informations de session
- Accessible via le menu "Mon Profil"

### 🎯 Navigation
- Menu latéral avec navigation par rôles
- Protection des routes selon les permissions
- Déconnexion sécurisée
- Interface responsive

### 📊 Dashboards
- **Admin:** Vue d'ensemble, Employés, Départements, Visiteurs, Visites, Badges, Rapports, Profil
- **Réceptionniste:** Vue d'ensemble, Visites, Visiteurs, Badges, Profil

## 🛠️ Développement

### Démarrer l'application
```bash
npm start
```

### Compiler l'application
```bash
npm run build
```

### Ports utilisés
- **Frontend:** `http://localhost:4200`
- **Backend:** `http://localhost:4000` (si démarré)

## 🔧 Configuration

L'application utilise un système d'authentification simulé pour la démonstration. En production, elle se connecterait à un vrai service d'authentification comme Keycloak.

### Variables d'environnement
- `KEYCLOAK_REALM`: Realm Keycloak
- `KEYCLOAK_AUTH_SERVER_URL`: URL du serveur Keycloak
- `KEYCLOAK_CLIENT_ID`: ID du client Keycloak
