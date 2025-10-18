import SwiftUI

struct ScheduledVisitsListView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @StateObject private var visitService = VisitService.shared
    @StateObject private var visitorService = VisitorService.shared
    @StateObject private var employeeService = EmployeeService.shared
    
    var body: some View {
        VStack(spacing: 0) {
            HeaderView(
                title: "Scheduled Visits",
                subtitle: "Select a pre-scheduled visit",
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            
            ScrollView {
                VStack(spacing: 16) {
                    if visitService.scheduledVisits.isEmpty {
                        // Aucune visite planifiée
                        VStack(spacing: 20) {
                            Image(systemName: "calendar.badge.clock")
                                .font(.system(size: 60))
                                .foregroundColor(.gray)
                            
                            Text("No Scheduled Visits")
                                .font(.title2)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                            
                            Text("You don't have any pre-scheduled visits. Please contact the administrator to schedule a visit.")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        .padding(.vertical, 40)
                    } else {
                        // Liste des visites planifiées
                        ForEach(visitService.scheduledVisits, id: \.id) { visit in
                            ScheduledVisitCard(visit: visit) {
                                selectScheduledVisit(visit)
                            }
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
        }
        .onAppear {
            loadScheduledVisits()
        }
    }
    
    private func loadScheduledVisits() {
        guard let visitorId = visitorService.currentVisitor?.id else { return }
        visitService.loadScheduledVisits(for: visitorId)
    }
    
    private func selectScheduledVisit(_ visit: BackendVisit) {
        // Préparer les données de la visite pour la confirmation
        guard let employeId = visit.employeId else {
            print("❌ Erreur: employeId manquant pour la visite \(visit.id)")
            return
        }
        
        // Convertir la date string en Date
        let dateFormatter = ISO8601DateFormatter()
        let dateDebut = dateFormatter.date(from: visit.dateDebut) ?? Date()
        
        visitService.currentVisit = VisitData(
            visiteurId: visit.visiteurId,
            employeId: employeId,
            motif: visit.motif,
            dateDebut: dateDebut,
            dureeEstimee: visit.duree ?? 60 // Utiliser duree au lieu de dureeEstimee, avec une valeur par défaut
        )
        
        // Définir l'employé sélectionné si disponible
        if let employe = visit.employe {
            employeeService.selectEmployeeFromSummary(employe)
        }
        
        // Naviguer vers la confirmation
        navigationManager.navigateTo(.scheduledVisitConfirmation)
    }
}

struct ScheduledVisitCard: View {
    let visit: BackendVisit
    let onTap: () -> Void
    @StateObject private var visitService = VisitService.shared
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                // En-tête avec date et heure
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(formatVisitDate(visit.dateDebut))
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        Text(formatVisitTime(visit.dateDebut))
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                // Détails de la visite
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Purpose:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(visit.motif)
                            .font(.caption)
                            .foregroundColor(.primary)
                    }
                    
                    HStack {
                        Text("Duration:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(visit.duree ?? 60) minutes")
                            .font(.caption)
                            .foregroundColor(.primary)
                    }
                }
                
                // Statut
                HStack {
                    Spacer()
                    
                    if let confirmByVisitor = visit.confirmByVisitor, !confirmByVisitor.isEmpty {
                        Text("Confirmed")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.green)
                            .cornerRadius(8)
                    } else {
                        Text("Pending Confirmation")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.orange)
                            .cornerRadius(8)
                    }
                }
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    // MARK: - Helper Methods
    private func formatVisitDate(_ dateString: String) -> String {
        let dateFormatter = ISO8601DateFormatter()
        guard let date = dateFormatter.date(from: dateString) else {
            return "Date invalide"
        }
        
        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .medium
        return displayFormatter.string(from: date)
    }
    
    private func formatVisitTime(_ dateString: String) -> String {
        let dateFormatter = ISO8601DateFormatter()
        guard let date = dateFormatter.date(from: dateString) else {
            return "Heure invalide"
        }
        
        let displayFormatter = DateFormatter()
        displayFormatter.timeStyle = .short
        return displayFormatter.string(from: date)
    }
}

#Preview {
    ScheduledVisitsListView()
        .environmentObject(NavigationManager())
}
