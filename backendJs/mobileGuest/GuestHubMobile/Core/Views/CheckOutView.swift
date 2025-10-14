import SwiftUI

struct CheckOutView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @EnvironmentObject var dataService: VisitorDataService
    
    @State private var selectedVisit: Visit?
    @State private var checkoutTime = Date()
    @State private var notes = ""
    
    private var activeVisits: [Visit] {
        dataService.visits.filter { $0.status == .inProgress }
    }
    
    var body: some View {
        VStack(spacing: 20) {
            HeaderView(
                title: "Check-out",
                subtitle: "Finalisez votre visite",
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            
            if activeVisits.isEmpty {
                VStack(spacing: 20) {
                    Image(systemName: "checkmark.circle")
                        .font(.system(size: 60))
                        .foregroundColor(.green)
                    
                    Text("Aucune visite en cours")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Text("Toutes vos visites sont terminées")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
            } else {
                ScrollView {
                    VStack(spacing: 20) {
                        // Sélection de la visite
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Visite à finaliser")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            Picker("Visite", selection: $selectedVisit) {
                                Text("Sélectionnez une visite").tag(nil as Visit?)
                                ForEach(activeVisits) { visit in
                                    Text("Visite du \(visit.startDate, style: .date) - \(visit.purpose)")
                                        .tag(visit as Visit?)
                                }
                            }
                            .pickerStyle(MenuPickerStyle())
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color(.systemGray6))
                            )
                        }
                        
                        if let visit = selectedVisit {
                            // Détails de la visite
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Détails de la visite")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text("Début:")
                                            .fontWeight(.medium)
                                        Spacer()
                                        Text(visit.startDate, style: .date)
                                    }
                                    
                                    HStack {
                                        Text("Heure début:")
                                            .fontWeight(.medium)
                                        Spacer()
                                        Text(visit.startDate, style: .time)
                                    }
                                    
                                    HStack {
                                        Text("Motif:")
                                            .fontWeight(.medium)
                                        Spacer()
                                        Text(visit.purpose)
                                            .multilineTextAlignment(.trailing)
                                    }
                                }
                                .padding()
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color(.systemGray6))
                                )
                            }
                            
                            // Heure de check-out
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Heure de check-out")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                
                                DatePicker("", selection: $checkoutTime, displayedComponents: .hourAndMinute)
                                    .datePickerStyle(CompactDatePickerStyle())
                                    .padding()
                                    .background(
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(Color(.systemGray6))
                                    )
                            }
                            
                            // Notes optionnelles
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Notes (optionnel)")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                
                                TextField("Commentaires sur la visite...", text: $notes, axis: .vertical)
                                    .textFieldStyle(CustomTextFieldStyle())
                                    .lineLimit(3...6)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
            
            Spacer()
            
            if !activeVisits.isEmpty {
                VStack(spacing: 16) {
                    CustomButton("Finaliser la visite", style: .success, isEnabled: selectedVisit != nil) {
                        performCheckout()
                    }
                    
                    CustomButton("Annuler", style: .secondary) {
                        navigationManager.goBack()
                    }
                }
                .padding(.horizontal)
            } else {
                CustomButton("Retour", style: .secondary) {
                    navigationManager.goBack()
                }
                .padding(.horizontal)
            }
            
            Spacer(minLength: 50)
        }
        .navigationBarHidden(true)
    }
    
    private func performCheckout() {
        guard let visit = selectedVisit else { return }
        
        var updatedVisit = visit
        updatedVisit.status = .completed
        updatedVisit.endDate = checkoutTime
        
        dataService.updateVisit(updatedVisit)
        
        // Retour à la vue des statuts
        navigationManager.navigateTo(.visitStatus)
    }
}

#Preview {
    CheckOutView()
        .environmentObject(NavigationManager())
        .environmentObject(VisitorDataService())
}
