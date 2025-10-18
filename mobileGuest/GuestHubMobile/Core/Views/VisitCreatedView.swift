import SwiftUI

struct VisitCreatedView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @StateObject private var visitService = VisitService.shared
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            // Icône de succès
            VStack(spacing: 20) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.green)
                
                Text("Visite créée avec succès !")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.center)
            }
            
            // Message d'instruction
            VStack(spacing: 16) {
                Text("Votre visite a été enregistrée et un badge a été généré.")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                
                VStack(spacing: 12) {
                    HStack {
                        Image(systemName: "location.fill")
                            .foregroundColor(.blue)
                        Text("Rendez-vous à la réception")
                            .font(.subheadline)
                            .foregroundColor(.primary)
                    }
                    
                    HStack {
                        Image(systemName: "creditcard.fill")
                            .foregroundColor(.blue)
                        Text("Récupérez votre badge d'accès")
                            .font(.subheadline)
                            .foregroundColor(.primary)
                    }
                    
                    HStack {
                        Image(systemName: "clock.fill")
                            .foregroundColor(.blue)
                        Text("Le badge sera prêt à l'impression")
                            .font(.subheadline)
                            .foregroundColor(.primary)
                    }
                }
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(12)
            }
            .padding(.horizontal)
            
            Spacer()
            
            // Boutons d'action
            VStack(spacing: 12) {
                CustomButton("Créer une autre visite", style: .secondary) {
                    // Réinitialiser et retourner au début
                    visitService.clearData()
                    navigationManager.navigateTo(.visitorOptions)
                }
                .padding(.horizontal)
                
                CustomButton("Terminer", style: .primary) {
                    // Réinitialiser et retourner au menu principal
                    visitService.clearData()
                    navigationManager.navigateTo(.welcome)
                }
                .padding(.horizontal)
            }
        }
        .padding()
    }
    
}

#Preview {
    VisitCreatedView()
        .environmentObject(NavigationManager())
}