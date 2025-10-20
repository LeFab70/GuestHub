import SwiftUI

struct NewVisitorInfoView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @StateObject private var visitorService = VisitorService.shared
    @StateObject private var visitService = VisitService.shared
    
    @State private var nom = ""
    @State private var prenom = ""
    @State private var email = ""
    @State private var telephone = ""
    @State private var entreprise = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showSuccessMessage = false
    @State private var showRedirectMessage = false
    @State private var existingVisitor: BackendVisitor?
    
    var body: some View {
        VStack(spacing: 0) {
            HeaderView(
                title: "Visitor Information",
                subtitle: "Please enter your details",
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            
            ScrollView {
                VStack(spacing: 20) {
                    if showSuccessMessage {
                        // Message de succès
                        VStack(spacing: 16) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.green)
                            
                            Text("Information Saved")
                                .font(.title2)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                            
                            Text("Your information has been saved successfully. You can now proceed to select an employee.")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                            
                            CustomButton("Continue", style: .primary) {
                                navigationManager.navigateTo(.employeeSelection)
                            }
                            .padding(.horizontal)
                        }
                        .padding(.vertical, 40)
                    } else if showRedirectMessage {
                        // Message de redirection
                        VStack(spacing: 16) {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.blue)
                            
                            Text("Visitor Already Exists")
                                .font(.title2)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                            
                            Text("We found an existing visitor with this email or phone number. You can proceed as a frequent visitor.")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                            
                            VStack(spacing: 12) {
                                CustomButton("Continue as Frequent Visitor", style: .primary) {
                                    // Rediriger vers la vue des visiteurs fréquents
                                    navigationManager.isFrequentVisitor = true
                                    navigationManager.navigateTo(.frequentVisitorInfo)
                                }
                                
                                CustomButton("Try Different Information", style: .secondary) {
                                    // Réinitialiser le formulaire
                                    resetForm()
                                }
                            }
                            .padding(.horizontal)
                        }
                        .padding(.vertical, 40)
                    } else {
                        // Formulaire de saisie
                        VStack(spacing: 20) {
                            // Nom
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Last Name *")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                
                                TextField("Enter your last name", text: $nom)
                                    .textFieldStyle(CustomTextFieldStyle())
                                    .autocapitalization(.words)
                            }
                            
                            // Prénom
                            VStack(alignment: .leading, spacing: 8) {
                                Text("First Name *")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                
                                TextField("Enter your first name", text: $prenom)
                                    .textFieldStyle(CustomTextFieldStyle())
                                    .autocapitalization(.words)
                            }
                            
                            // Email
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Email *")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                
                                TextField("Enter your email", text: $email)
                                    .textFieldStyle(CustomTextFieldStyle())
                                    .keyboardType(.emailAddress)
                                    .autocapitalization(.none)
                            }
                            
                            // Téléphone
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Phone Number *")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                
                                TextField("Enter your phone number", text: $telephone)
                                    .textFieldStyle(CustomTextFieldStyle())
                                    .keyboardType(.phonePad)
                                    .onChange(of: telephone) { _, newValue in
                                        // Filtrer pour ne garder que les chiffres et les tirets
                                        let filtered = newValue.filter { character in
                                            character.isNumber || character == "-"
                                        }
                                        if filtered != newValue {
                                            telephone = filtered
                                        }
                                    }
                            }
                            
                            // Entreprise
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Company *")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                
                                TextField("Enter your company name", text: $entreprise)
                                    .textFieldStyle(CustomTextFieldStyle())
                                    .autocapitalization(.words)
                            }
                            
                            // Message d'erreur
                            if let errorMessage = errorMessage {
                                Text(errorMessage)
                                    .font(.subheadline)
                                    .foregroundColor(.red)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal)
                            }
                            
                            // Bouton de validation
                            CustomButton("Validate Information", style: .primary) {
                                validateAndSaveVisitor()
                            }
                            .disabled(isLoading || !isFormValid)
                            .opacity(isFormValid ? 1.0 : 0.6)
                            .padding(.horizontal)
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 20)
                    }
                }
            }
        }
        .onAppear {
            resetForm()
        }
    }
    
    private var isFormValid: Bool {
        return !nom.isEmpty && 
               !prenom.isEmpty && 
               !email.isEmpty && 
               !telephone.isEmpty && 
               !entreprise.isEmpty &&
               isValidEmail(email)
    }
    
    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
    
    private func resetForm() {
        nom = ""
        prenom = ""
        email = ""
        telephone = ""
        entreprise = ""
        errorMessage = nil
        showSuccessMessage = false
        showRedirectMessage = false
        existingVisitor = nil
    }
    
    private func validateAndSaveVisitor() {
        guard isFormValid else {
            errorMessage = "Please fill in all required fields correctly."
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // Vérifier si le visiteur existe déjà
        visitorService.checkExistingVisitor(email: email, phone: telephone) { [self] result in
            DispatchQueue.main.async {
                isLoading = false
                
                switch result {
                case .success(let existingVisitor):
                    if let visitor = existingVisitor {
                        // Visiteur existe déjà
                        self.existingVisitor = visitor
                        showRedirectMessage = true
                    } else {
                        // Visiteur n'existe pas, créer un nouveau
                        createNewVisitor()
                    }
                case .failure(let error):
                    errorMessage = "Error checking visitor: \(error.localizedDescription)"
                }
            }
        }
    }
    
    private func createNewVisitor() {
        isLoading = true
        
        visitorService.createVisitor(
            nom: nom,
            prenom: prenom,
            email: email,
            telephone: telephone,
            entreprise: entreprise
        ) { [self] result in
            DispatchQueue.main.async {
                isLoading = false
                
                switch result {
                case .success(let visitor):
                    // Visiteur créé avec succès
                    visitorService.currentVisitor = visitor
                    showSuccessMessage = true
                case .failure(let error):
                    // Si conflit (visiteur existe), proposer redirection vers visiteur fréquent
                    let lowerDesc = error.localizedDescription.lowercased()
                    if lowerDesc.contains("409") || lowerDesc.contains("conflict") || lowerDesc.contains("exists") || lowerDesc.contains("existe") {
                        self.existingVisitor = nil
                        showRedirectMessage = true
                        errorMessage = nil
                    } else {
                        errorMessage = "Error creating visitor: \(error.localizedDescription)"
                    }
                }
            }
        }
    }
}

#Preview {
    NewVisitorInfoView()
        .environmentObject(NavigationManager())
}
