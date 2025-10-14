import SwiftUI

@main
struct GuestHubMobileApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        NavigationStack {
            LanguageSelectionView()
        }
    }
}

struct LanguageSelectionView: View {
    var body: some View {
        VStack(spacing: 16) {
            Text("Choisir langue").font(.title2).bold()
            HStack {
                Button("Français") {}
                Button("English") {}
            }
            NavigationLink("Continuer", destination: BlacklistCheckView())
                .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct BlacklistCheckView: View {
    @State private var isBlacklisted = false
    var body: some View {
        VStack(spacing: 16) {
            Toggle("Visiteur status = BLACKLISTED ?", isOn: $isBlacklisted)
            if isBlacklisted {
                Text("Refuser accès").foregroundStyle(.red)
            } else {
                NavigationLink("Visite planifiée ?", destination: PlannedVisitView())
            }
        }
        .padding()
    }
}

struct PlannedVisitView: View {
    @State private var planned = true
    var body: some View {
        VStack(spacing: 16) {
            Toggle("Visite planifiée par Admin ?", isOn: $planned)
            if planned {
                NavigationLink("Entrer info minimale", destination: BadgeFlowView())
            } else {
                NavigationLink("Saisir informations complètes", destination: NewVisitView())
            }
        }
        .padding()
    }
}

struct NewVisitView: View {
    var body: some View {
        Form {
            Section("Informations visiteur") {
                TextField("Nom", text: .constant(""))
                TextField("Prénom", text: .constant(""))
                TextField("Téléphone", text: .constant(""))
            }
        }
        .navigationTitle("Nouvelle visite")
        .toolbar {
            NavigationLink("Continuer", destination: BadgeFlowView())
        }
    }
}

enum BadgeState: String, CaseIterable { case genere, en_attente_validation, imprime, valide, rendu, auto_expire, scanne }

struct BadgeFlowView: View {
    @State private var state: BadgeState = .genere
    var body: some View {
        VStack(spacing: 12) {
            Text("Badge: \(state.rawValue.uppercased())").bold()
            HStack { Button("Imprimer") { state = .imprime }; Button("Valider") { state = .valide } }
            HStack { Button("Rendu") { state = .rendu }; Button("Auto-expiré") { state = .auto_expire } }
            NavigationLink("Scanner sortie", destination: CheckoutView())
                .buttonStyle(.borderedProminent)
        }
        .padding()
        .navigationTitle("Badge")
    }
}

struct CheckoutView: View {
    var body: some View {
        VStack(spacing: 16) {
            Text("Check-out visite").font(.title3).bold()
            Text("Sortie enregistrée")
        }
        .padding()
    }
}


