import SwiftUI

struct FrequentVisitorInfoView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @StateObject private var visitorService = VisitorService.shared
    @State private var contact: String = ""
    @State private var isSearching = false
    
    var body: some View {
        VStack(spacing: 24) {
            HeaderView(
                title: navigationManager.tr("frequent_visitor"),
                subtitle: navigationManager.tr("enter_contact"),
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            .onAppear {
                // Réinitialiser les données quand on arrive sur cette vue
                visitorService.clearData()
                contact = ""
                isSearching = false
            }
            
            if visitorService.isLoading {
                VStack(spacing: 16) {
                    ProgressView()
                        .scaleEffect(1.2)
                    Text(navigationManager.tr("loading"))
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if visitorService.isVisitorFound() {
                // Afficher les données du visiteur trouvé
                VStack(spacing: 20) {
                    VStack(spacing: 16) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.blue)
                        
                        Text("Visitor Found")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                    }
                    
                    VStack(spacing: 12) {
                        HStack {
                            InfoRow(label: "Name", value: "\(visitorService.currentVisitor?.prenom ?? "") \(visitorService.currentVisitor?.nom ?? "")")
                            
                            if visitorService.currentVisitor?.estBlackliste == true {
                                Text("BLACKLISTED")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.red)
                                    .cornerRadius(6)
                            }
                        }
                        
                        InfoRow(label: "Email", value: visitorService.currentVisitor?.email ?? "")
                        InfoRow(label: "Phone", value: visitorService.currentVisitor?.telephone ?? "")
                        InfoRow(label: "Company", value: visitorService.currentVisitor?.entreprise ?? "")
                        
                        // Message spécial pour les visiteurs blacklistés
                        if visitorService.currentVisitor?.estBlackliste == true {
                            VStack(spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.red)
                                    .font(.title2)
                                
                                Text("Access Denied")
                                    .font(.headline)
                                    .foregroundColor(.red)
                                
                                Text("You are blacklisted. Please contact the company representatives for more information.")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                            }
                            .padding()
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(12)
                        }
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
                    .padding(.horizontal)
                    
                    if visitorService.currentVisitor?.estBlackliste != true {
                        VStack(spacing: 12) {
                            CustomButton("View Scheduled Visits", style: .primary) {
                                navigationManager.navigateTo(.scheduledVisitsList)
                            }
                            
                            CustomButton("New Visit", style: .secondary) {
                                navigationManager.navigateTo(.employeeSelection)
                            }
                        }
                        .padding(.horizontal)
                    } else {
                        CustomButton("Back", style: .secondary) {
                            navigationManager.goBack()
                        }
                        .padding(.horizontal)
                    }
                }
            } else if visitorService.errorMessage != nil && !visitorService.isLoading {
                // Afficher message si visiteur non trouvé
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.orange)
                    
                    Text("Visitor Not Found")
                        .font(.headline)
                        .foregroundColor(.orange)
                    
                    Text("No visitor found with this contact. Please check your information or contact the administrator.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding()
                .background(Color.orange.opacity(0.1))
                .cornerRadius(12)
                .padding(.horizontal)
            } else {
                // Formulaire de recherche
                VStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Enter Your Contact")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        CustomTextField(
                            "Contact",
                            placeholder: "Email or phone",
                            text: $contact,
                            keyboardType: .emailAddress
                        )
                    }
                    .padding(.horizontal)
                    
                    VStack(spacing: 12) {
                        CustomButton(
                            "Continue",
                            style: .primary,
                            isEnabled: !contact.trimmingCharacters(in: .whitespaces).isEmpty && !isSearching,
                            isLoading: isSearching
                        ) {
                            searchVisitor()
                        }
                        
                    }
                    .padding(.horizontal)
                }
            }
            
            Spacer()
        }
        .navigationBarHidden(true)
    }
    
    private func searchVisitor() {
        print("🔍 searchVisitor() called with contact: '\(contact)'")
        isSearching = true
        
        // Déterminer si c'est un email ou un téléphone
        if contact.contains("@") {
            print("📧 Detected email, calling searchVisitor(email:)")
            visitorService.searchVisitor(email: contact)
        } else {
            print("📱 Detected phone, calling searchVisitor(phone:)")
            visitorService.searchVisitor(phone: contact)
        }
        
        // Timeout de sécurité après 10 secondes
        DispatchQueue.main.asyncAfter(deadline: .now() + 10.0) {
            if self.isSearching {
                print("⏰ Search timeout reached")
                self.isSearching = false
            }
        }
    }
}



