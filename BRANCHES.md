# 🌿 Structure des Branches - GuestHub

Ce dépôt est organisé en 4 branches principales, chacune contenant des composants spécifiques du projet GuestHub.

## 📋 Vue d'ensemble des branches

| Branche | Contenu | Description |
|---------|---------|-------------|
| `main` | Tous les composants | Branche principale avec les 3 dossiers |
| `backend` | `backendJs/` uniquement | API Node.js/Express avec TypeScript |
| `frontend` | `dashboard-angular/` uniquement | Interface web Angular |
| `mobile` | `mobileGuest/` uniquement | Application mobile iOS Swift |

## 🔄 Comment basculer entre les branches

### Méthode 1: Script automatique (recommandé)
```bash
# Basculer vers la branche main (tous les composants)
./switch-branch.sh main

# Basculer vers la branche backend
./switch-branch.sh backend

# Basculer vers la branche frontend
./switch-branch.sh frontend

# Basculer vers la branche mobile
./switch-branch.sh mobile
```

### Méthode 2: Commandes Git manuelles
```bash
# Voir toutes les branches
git branch -a

# Basculer vers une branche
git checkout main
git checkout backend
git checkout frontend
git checkout mobile
```

## 🏗️ Structure détaillée

### Branche `main`
```
GuestHub/
├── backendJs/              # API Node.js/Express
├── dashboard-angular/      # Interface web Angular
├── mobileGuest/           # Application mobile iOS
├── README.md              # Documentation principale
├── .gitignore            # Fichiers à ignorer
└── switch-branch.sh      # Script de basculement
```

### Branche `backend`
```
GuestHub/
├── backendJs/              # API Node.js/Express uniquement
├── README.md              # Documentation principale
├── .gitignore            # Fichiers à ignorer
└── switch-branch.sh      # Script de basculement
```

### Branche `frontend`
```
GuestHub/
├── dashboard-angular/      # Interface web Angular uniquement
├── README.md              # Documentation principale
├── .gitignore            # Fichiers à ignorer
└── switch-branch.sh      # Script de basculement
```

### Branche `mobile`
```
GuestHub/
├── mobileGuest/           # Application mobile iOS uniquement
├── README.md              # Documentation principale
├── .gitignore            # Fichiers à ignorer
└── switch-branch.sh      # Script de basculement
```

## 🚀 Workflow de développement

### Pour travailler sur le backend
```bash
./switch-branch.sh backend
cd backendJs
npm install
npm run dev
```

### Pour travailler sur le frontend
```bash
./switch-branch.sh frontend
cd dashboard-angular
npm install
ng serve
```

### Pour travailler sur le mobile
```bash
./switch-branch.sh mobile
cd mobileGuest
# Ouvrir GuestHubMobile.xcodeproj dans Xcode
```

### Pour voir l'ensemble du projet
```bash
./switch-branch.sh main
# Tous les dossiers sont visibles
```

## 📝 Règles de commit

- **Branche `main`** : Commits pour les changements globaux (README, scripts, etc.)
- **Branche `backend`** : Commits pour les modifications de l'API
- **Branche `frontend`** : Commits pour les modifications de l'interface web
- **Branche `mobile`** : Commits pour les modifications de l'application mobile

## 🔄 Synchronisation avec GitHub

Toutes les branches sont synchronisées avec le dépôt distant :
- `origin/main` → Branche principale
- `origin/backend` → Branche backend
- `origin/frontend` → Branche frontend
- `origin/mobile` → Branche mobile

## ⚠️ Notes importantes

1. **Ne jamais** modifier directement les fichiers dans une branche spécialisée qui appartiennent à un autre composant
2. **Toujours** basculer vers la bonne branche avant de commencer le développement
3. **Utiliser** le script `switch-branch.sh` pour éviter les erreurs
4. **Commiter** régulièrement sur la branche appropriée

## 🆘 Dépannage

### Si vous êtes sur la mauvaise branche
```bash
# Voir la branche actuelle
git branch

# Basculer vers la bonne branche
./switch-branch.sh [nom-de-la-branche]
```

### Si des fichiers sont manquants
```bash
# Vérifier que vous êtes sur la bonne branche
git branch

# Si nécessaire, basculer vers main pour voir tous les fichiers
./switch-branch.sh main
```

### Pour créer une nouvelle branche de fonctionnalité
```bash
# Basculer vers la branche de base (ex: backend)
./switch-branch.sh backend

# Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# Développer...
# Commiter...
# Pousser vers GitHub
git push -u origin feature/nouvelle-fonctionnalite
```
