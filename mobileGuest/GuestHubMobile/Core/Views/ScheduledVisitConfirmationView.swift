import SwiftUI

struct ScheduledVisitConfirmationView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @StateObject private var visitService = VisitService.shared
    @StateObject private var visitorService = VisitorService.shared
    @StateObject private var employeeService = EmployeeService.shared
    
    @State private var isConfirmingVisit = false
    
    var body: some View {
        VStack(spacing: 0) {
            HeaderView(
                title: "Scheduled Visit",
                subtitle: "Confirm your pre-scheduled visit",
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
                    
                    // Détails de la visite planifiée
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Scheduled Visit Details")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        VStack(spacing: 8) {
                            InfoRow(label: "Purpose", value: visitService.currentVisit?.motif ?? "")
                            InfoRow(label: "Date", value: visitService.currentVisit?.dateDebut.formatted(date: .abbreviated, time: .omitted) ?? "")
                            InfoRow(label: "Time", value: visitService.currentVisit?.dateDebut.formatted(date: .omitted, time: .shortened) ?? "")
                            InfoRow(label: "Estimated Duration", value: "\(visitService.currentVisit?.dureeEstimee ?? 0) minutes")
                        }
                        .padding()
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(12)
                    }
                    
                    // Message d'information
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.green)
                        
                        Text("This visit has been pre-scheduled by an administrator. All details are fixed and cannot be modified. Please confirm to proceed to the reception for your access badge.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                    .background(Color.green.opacity(0.1))
                    .cornerRadius(12)
                }
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
            
            VStack(spacing: 12) {
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
                
                // Bouton confirmer
                CustomButton("Confirm Visit", style: .primary, isLoading: isConfirmingVisit) {
                    confirmScheduledVisit()
                }
                .padding(.horizontal)
                .disabled(isConfirmingVisit)
            }
            .padding(.bottom, 20)
        }
    }
    
    private func confirmScheduledVisit() {
        guard let visitData = visitService.currentVisit else { return }
        
        isConfirmingVisit = true
        
        // Trouver la visite correspondante dans la liste des visites planifiées
        if let scheduledVisit = visitService.scheduledVisits.first(where: { visit in
            visit.visiteurId == visitData.visiteurId &&
            visit.employeId == visitData.employeId &&
            visit.motif == visitData.motif
        }) {
            visitService.confirmScheduledVisit(scheduledVisit)
            
            // Attendre que la confirmation soit terminée
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                self.isConfirmingVisit = false
                if self.visitService.isVisitCreated {
                    self.navigationManager.navigateTo(.visitCreated)
                }
            }
        } else {
            isConfirmingVisit = false
            visitService.errorMessage = "Visite planifiée non trouvée"
        }
    }
}

#Preview {
    ScheduledVisitConfirmationView()
        .environmentObject(NavigationManager())
}
