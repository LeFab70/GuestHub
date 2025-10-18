import SwiftUI

struct VisitConfirmationView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @StateObject private var employeeService = EmployeeService.shared
    @StateObject private var visitorService = VisitorService.shared
    @StateObject private var visitService = VisitService.shared
    
    @State private var isCreatingVisit = false
    
    var body: some View {
        VStack(spacing: 0) {
            HeaderView(
                title: "Confirmation",
                subtitle: "Check your visit details",
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            
            ScrollView {
                VStack(spacing: 20) {
                    // Informations du visiteur
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Visitor")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        VStack(spacing: 8) {
                            InfoRow(label: "Name", value: visitorService.getVisitorDisplayName())
                            InfoRow(label: "Email", value: visitorService.currentVisitor?.email ?? "")
                            InfoRow(label: "Company", value: visitorService.currentVisitor?.entreprise ?? "")
                        }
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)
                    }
                    
                    // Informations de l'employé
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Person to Visit")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        VStack(spacing: 8) {
                            InfoRow(label: "Name", value: employeeService.getEmployeeDisplayName())
                            InfoRow(label: "Department", value: employeeService.getDepartmentName())
                        }
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                    }
                    
                    // Détails de la visite
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Visit Details")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        VStack(spacing: 8) {
                            InfoRow(label: "Purpose", value: visitService.currentVisit?.motif ?? "")
                            InfoRow(label: "Date", value: visitService.currentVisit?.dateDebut.formatted(date: .abbreviated, time: .omitted) ?? "")
                            InfoRow(label: "Estimated Duration", value: "\(visitService.currentVisit?.dureeEstimee ?? 0) minutes")
                        }
                        .padding()
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(12)
                    }
                    
                    // Message d'information
                    VStack(spacing: 12) {
                        Image(systemName: "info.circle.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.blue)
                        
                        Text("After confirmation, you will need to go to the reception to get your access badge.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                }
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
            
            VStack(spacing: 12) {
                // Bouton modifier
                // Affichage des erreurs
                if let errorMessage = visitService.errorMessage {
                    VStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.red)
                            .font(.title2)
                        
                        Text("Error")
                            .font(.headline)
                            .foregroundColor(.red)
                        
                        Text(errorMessage)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .padding()
                    .background(Color.red.opacity(0.1))
                    .cornerRadius(12)
                    .padding(.horizontal)
                }
                
                CustomButton("Modify", style: .secondary) {
                    navigationManager.goBack()
                }
                .padding(.horizontal)
                
                // Bouton confirmer
                CustomButton("Confirm Visit", style: .primary, isLoading: isCreatingVisit) {
                    createVisit()
                }
                .padding(.horizontal)
                .disabled(isCreatingVisit)
            }
            .padding(.bottom, 20)
        }
    }
    
    private func createVisit() {
        guard let visitData = visitService.currentVisit else { return }
        
        isCreatingVisit = true
        
        visitService.createVisit(
            visiteurId: visitData.visiteurId,
            employeId: visitData.employeId,
            motif: visitData.motif,
            dateDebut: visitData.dateDebut,
            dureeEstimee: visitData.dureeEstimee
        ) { success in
            DispatchQueue.main.async {
                isCreatingVisit = false
                if success {
                    navigationManager.navigateTo(.visitCreated)
                }
            }
        }
    }
}

#Preview {
    VisitConfirmationView()
        .environmentObject(NavigationManager())
}