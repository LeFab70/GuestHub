import SwiftUI

struct VisitPurposeView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @StateObject private var employeeService = EmployeeService.shared
    @StateObject private var visitorService = VisitorService.shared
    @StateObject private var visitService = VisitService.shared
    
    @State private var visitMotif: String = ""
    @State private var estimatedDuration: Int = 30 // en minutes
    @State private var selectedDate: Date = Date()
    
    let durationOptions = [15, 30, 45, 60, 90, 120, 180, 240] // en minutes
    
    var body: some View {
        VStack(spacing: 0) {
            HeaderView(
                title: "Visit Details",
                subtitle: "Enter your visit information",
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
                    
                    // Motif de la visite
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Visit Purpose")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        CustomTextField(
                            "Purpose",
                            placeholder: "Enter the purpose of your visit",
                            text: $visitMotif,
                            keyboardType: .default
                        )
                    }
                    
                    // Date de la visite (non modifiable)
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Visit Date")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        HStack {
                            Image(systemName: "calendar")
                                .foregroundColor(.blue)
                            Text(selectedDate, style: .date)
                                .foregroundColor(.secondary)
                            Spacer()
                        }
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                    }
                    
                    // Durée estimée
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Estimated Duration")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 12) {
                            ForEach(durationOptions, id: \.self) { duration in
                                Button(action: {
                                    estimatedDuration = duration
                                }) {
                                    Text("\(duration) min")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                        .foregroundColor(estimatedDuration == duration ? .white : .blue)
                                        .frame(maxWidth: .infinity, minHeight: 44)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 10)
                                        .background(estimatedDuration == duration ? Color.blue : Color.blue.opacity(0.1))
                                        .cornerRadius(20)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
            
            // Bouton continuer
            VStack {
                CustomButton("Continue", style: .primary) {
                    if !visitMotif.isEmpty {
                        // Sauvegarder les données temporairement
                        visitService.currentVisit = VisitData(
                            visiteurId: visitorService.currentVisitor?.id ?? "",
                            employeId: employeeService.selectedEmployee?.id ?? "",
                            motif: visitMotif,
                            dateDebut: selectedDate,
                            dureeEstimee: estimatedDuration
                        )
                        navigationManager.navigateTo(.visitConfirmation)
                    }
                }
                .padding(.horizontal)
                .disabled(visitMotif.isEmpty)
            }
            .padding(.bottom, 20)
        }
        .onAppear {
            // Initialiser la date à aujourd'hui
            selectedDate = Date()
        }
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label + ":")
                .font(.subheadline)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .foregroundColor(.primary)
        }
    }
}

#Preview {
    VisitPurposeView()
        .environmentObject(NavigationManager())
}