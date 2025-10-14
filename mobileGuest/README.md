# GuestHub Mobile - Application iOS

Application mobile SwiftUI pour la gestion des visites dans le système GuestHub.

## Structure du Projet

```
mobileGuest/
├── App/                          # Point d'entrée de l'application
│   └── GuestHubApp.swift        # Fichier principal de l'app
├── Views/                        # Configuration et vues principales
│   └── AppConfig.swift          # Configuration de l'application
├── Core/                        # Logique métier et composants
│   ├── Services/                # Services et gestion des données
│   │   ├── NavigationManager.swift
│   │   └── VisitorDataService.swift
│   ├── Views/                   # Vues de l'application
│   │   ├── root/
│   │   │   └── ContentView.swift
│   │   ├── WelcomeView.swift
│   │   ├── VisitorRegistrationView.swift
│   │   ├── VisitSchedulingView.swift
│   │   ├── QRCodeDisplayView.swift
│   │   ├── VisitStatusView.swift
│   │   └── CheckOutView.swift
│   └── ComponentsViews/         # Composants réutilisables
│       ├── CustomButton.swift
│       ├── CustomTextField.swift
│       ├── QRCodeView.swift
│       └── HeaderView.swift
```

## Fonctionnalités

### 🏠 **Vue d'accueil (WelcomeView)**
- Interface d'accueil avec logo et titre
- Boutons pour nouvelle visite et consultation des visites
- Design moderne avec dégradé

### 👤 **Enregistrement visiteur (VisitorRegistrationView)**
- Formulaire de saisie des informations personnelles
- Champs : prénom, nom, email, téléphone, entreprise
- Toggle pour visiteur blacklisté
- Validation des champs obligatoires

### 📅 **Planification visite (VisitSchedulingView)**
- Sélection de la date et des heures
- Saisie du motif de la visite
- Choix de la personne à visiter
- Génération automatique du QR code

### 📱 **Affichage QR Code (QRCodeDisplayView)**
- Affichage du QR code généré
- Détails de la visite
- Navigation vers le statut ou nouvelle visite

### 📊 **Statut des visites (VisitStatusView)**
- Liste des visites avec statuts
- Cartes d'information pour chaque visite
- Actions contextuelles (check-out si en cours)

### ✅ **Check-out (CheckOutView)**
- Finalisation des visites en cours
- Sélection de l'heure de sortie
- Notes optionnelles
- Mise à jour du statut

## Composants Réutilisables

### CustomButton
- Boutons stylisés avec différents styles (primary, secondary, success, danger)
- Support des états désactivés
- Animations fluides

### CustomTextField
- Champs de texte personnalisés
- Support des différents types de clavier
- Champs sécurisés pour les mots de passe
- Validation visuelle

### QRCodeView
- Génération et affichage de QR codes
- Taille personnalisable
- Gestion d'erreur si génération échoue

### HeaderView
- En-tête standardisé pour toutes les vues
- Support du bouton retour
- Titre et sous-titre configurables

## Services

### NavigationManager
- Gestion de la navigation entre les vues
- État centralisé de l'application
- Animations de transition

### VisitorDataService
- Gestion des données des visiteurs et visites
- Modèles de données (Visitor, Visit, VisitStatus)
- Données d'exemple pour le développement

## Technologies Utilisées

- **SwiftUI** : Framework UI d'Apple
- **Combine** : Gestion des flux de données
- **CoreImage** : Génération des QR codes
- **Foundation** : Types de base et utilitaires

## Configuration

L'application utilise `AppConfig.swift` pour centraliser :
- Configuration de l'API
- Couleurs et thèmes
- Polices
- Durées d'animation

## Installation

1. Ouvrir le projet dans Xcode
2. Sélectionner un simulateur iOS
3. Compiler et exécuter (⌘+R)

## Architecture

L'application suit une architecture MVVM (Model-View-ViewModel) :
- **Model** : Visitor, Visit, VisitStatus
- **View** : Toutes les vues SwiftUI
- **ViewModel** : NavigationManager, VisitorDataService

## Navigation

Le flux de navigation suit le parcours utilisateur :
1. Accueil → Enregistrement visiteur
2. Enregistrement → Planification visite
3. Planification → Affichage QR code
4. QR code → Statut des visites
5. Statut → Check-out (si visite en cours)

## Personnalisation

- Modifier `AppConfig.swift` pour changer les couleurs et polices
- Ajouter de nouveaux composants dans `Core/ComponentsViews/`
- Étendre les services dans `Core/Services/`
- Créer de nouvelles vues dans `Core/Views/`


