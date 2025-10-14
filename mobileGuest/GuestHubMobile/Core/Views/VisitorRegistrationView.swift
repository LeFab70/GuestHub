import SwiftUI

struct VisitorRegistrationView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @EnvironmentObject var dataService: VisitorDataService
    
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var company = ""
    @State private var isBlacklisted = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                HeaderView(
                    title: "Informations Visiteur",
                    subtitle: "Renseignez vos informations personnelles",
                    showBackButton: true
                ) {
                    navigationManager.goBack()
                }
                
                VStack(spacing: 20) {
                    CustomTextField("Prénom *", placeholder: "Votre prénom", text: $firstName)
                    CustomTextField("Nom *", placeholder: "Votre nom", text: $lastName)
                    CustomTextField("Email", placeholder: "email@example.com", text: $email, keyboardType: .emailAddress)
                    CustomTextField("Téléphone", placeholder: "+33123456789", text: $phone, keyboardType: .phonePad)
                    CustomTextField("Entreprise", placeholder: "Nom de votre entreprise", text: $company)
                    
                    Toggle("Visiteur blacklisté", isOn: $isBlacklisted)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemGray6))
                        )
                }
                .padding(.horizontal)
                
                VStack(spacing: 16) {
                    CustomButton("Continuer", style: .primary, isEnabled: !firstName.isEmpty && !lastName.isEmpty) {
                        registerVisitor()
                    }
                    
                    CustomButton("Annuler", style: .secondary) {
                        navigationManager.goBack()
                    }
                }
                .padding(.horizontal)
                
                Spacer(minLength: 50)
            }
        }
        .navigationBarHidden(true)
    }
    
    private func registerVisitor() {
        let visitor = Visitor(
            firstName: firstName,
            lastName: lastName,
            email: email.isEmpty ? nil : email,
            phone: phone.isEmpty ? nil : phone,
            company: company.isEmpty ? nil : company,
            isBlacklisted: isBlacklisted
        )
        
        dataService.addVisitor(visitor)
        navigationManager.navigateTo(.visitScheduling)
    }
}

#Preview {
    VisitorRegistrationView()
        .environmentObject(NavigationManager())
        .environmentObject(VisitorDataService())
}
