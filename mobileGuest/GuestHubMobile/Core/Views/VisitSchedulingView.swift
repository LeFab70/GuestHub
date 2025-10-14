import SwiftUI

struct VisitSchedulingView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @EnvironmentObject var dataService: VisitorDataService
    
    @State private var selectedDate = Date()
    @State private var startTime = Date()
    @State private var endTime = Calendar.current.date(byAdding: .hour, value: 2, to: Date()) ?? Date()
    @State private var purpose = ""
    @State private var selectedEmployee = ""
    
    let employees = [
        "Marie Dubois - RH",
        "Pierre Martin - IT",
        "Sophie Bernard - Marketing",
        "Jean Durand - Direction"
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                HeaderView(
                    title: "Planification Visite",
                    subtitle: "Définissez les détails de votre visite",
                    showBackButton: true
                ) {
                    navigationManager.goBack()
                }
                
                VStack(spacing: 20) {
                    // Date de visite
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Date de visite *")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        DatePicker("", selection: $selectedDate, displayedComponents: .date)
                            .datePickerStyle(CompactDatePickerStyle())
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color(.systemGray6))
                            )
                    }
                    
                    // Heure de début
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Heure de début *")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        DatePicker("", selection: $startTime, displayedComponents: .hourAndMinute)
                            .datePickerStyle(CompactDatePickerStyle())
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color(.systemGray6))
                            )
                    }
                    
                    // Heure de fin
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Heure de fin estimée")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        DatePicker("", selection: $endTime, displayedComponents: .hourAndMinute)
                            .datePickerStyle(CompactDatePickerStyle())
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color(.systemGray6))
                            )
                    }
                    
                    // Motif de la visite
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Motif de la visite *")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        TextField("Décrivez le motif de votre visite", text: $purpose, axis: .vertical)
                            .textFieldStyle(CustomTextFieldStyle())
                            .lineLimit(3...6)
                    }
                    
                    // Employé à visiter
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Personne à visiter")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        Picker("Employé", selection: $selectedEmployee) {
                            Text("Sélectionnez un employé").tag("")
                            ForEach(employees, id: \.self) { employee in
                                Text(employee).tag(employee)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemGray6))
                        )
                    }
                }
                .padding(.horizontal)
                
                VStack(spacing: 16) {
                    CustomButton("Générer QR Code", style: .primary, isEnabled: !purpose.isEmpty) {
                        scheduleVisit()
                    }
                    
                    CustomButton("Retour", style: .secondary) {
                        navigationManager.goBack()
                    }
                }
                .padding(.horizontal)
                
                Spacer(minLength: 50)
            }
        }
        .navigationBarHidden(true)
    }
    
    private func scheduleVisit() {
        let visit = Visit(
            visitorId: dataService.visitors.last?.id ?? UUID(),
            employeeId: UUID(), // En réalité, récupérer l'ID de l'employé sélectionné
            startDate: combineDateAndTime(selectedDate, startTime),
            endDate: combineDateAndTime(selectedDate, endTime),
            purpose: purpose,
            status: .scheduled,
            qrCode: generateQRCode()
        )
        
        dataService.addVisit(visit)
        navigationManager.navigateTo(.qrCodeDisplay)
    }
    
    private func combineDateAndTime(_ date: Date, _ time: Date) -> Date {
        let calendar = Calendar.current
        let dateComponents = calendar.dateComponents([.year, .month, .day], from: date)
        let timeComponents = calendar.dateComponents([.hour, .minute], from: time)
        
        var combinedComponents = DateComponents()
        combinedComponents.year = dateComponents.year
        combinedComponents.month = dateComponents.month
        combinedComponents.day = dateComponents.day
        combinedComponents.hour = timeComponents.hour
        combinedComponents.minute = timeComponents.minute
        
        return calendar.date(from: combinedComponents) ?? date
    }
    
    private func generateQRCode() -> String {
        let visitId = UUID().uuidString
        return "https://guesthub.com/visit/\(visitId)"
    }
}

#Preview {
    VisitSchedulingView()
        .environmentObject(NavigationManager())
        .environmentObject(VisitorDataService())
}
