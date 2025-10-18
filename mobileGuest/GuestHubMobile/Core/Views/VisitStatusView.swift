import SwiftUI

struct VisitStatusView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @EnvironmentObject var dataService: VisitorDataService
    
    var body: some View {
        VStack(spacing: 20) {
            HeaderView(
                title: "Mes Visites",
                subtitle: "Consultez l'état de vos visites",
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            
            if dataService.visits.isEmpty {
                VStack(spacing: 20) {
                    Image(systemName: "calendar.badge.plus")
                        .font(.system(size: 60))
                        .foregroundColor(.gray)
                    
                    Text("Aucune visite enregistrée")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Text("Planifiez votre première visite")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
            } else {
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(dataService.visits) { visit in
                            VisitStatusCard(visit: visit)
                        }
                    }
                    .padding(.horizontal)
                }
            }
            
            Spacer()
            
            VStack(spacing: 16) {
                CustomButton("Nouvelle visite", style: .primary) {
                    navigationManager.navigateTo(.visitorOptions)
                }
                
                CustomButton("Accueil", style: .secondary) {
                    navigationManager.navigateTo(.welcome)
                }
            }
            .padding(.horizontal)
            
            Spacer(minLength: 50)
        }
        .navigationBarHidden(true)
    }
}

struct VisitStatusCard: View {
    let visit: Visit
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Visite du \(visit.startDate, style: .date)")
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Text("De \(visit.startDate, style: .time) à \(visit.endDate?.formatted(date: .omitted, time: .shortened) ?? "Non définie")")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                StatusBadge(status: visit.status)
            }
            
            Text(visit.purpose)
                .font(.body)
                .foregroundColor(.primary)
                .lineLimit(2)
            
            if visit.status == .inProgress {
                HStack {
                    Spacer()
                    CustomButton("Check-out", style: .success) {
                        // Action de check-out
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        )
    }
}

struct StatusBadge: View {
    let status: VisitStatus
    
    var body: some View {
        Text(status.displayName)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(statusColor)
            )
            .foregroundColor(.white)
    }
    
    private var statusColor: Color {
        switch status {
        case .scheduled:
            return .blue
        case .inProgress:
            return .green
        case .completed:
            return .gray
        case .cancelled:
            return .red
        }
    }
}

#Preview {
    VisitStatusView()
        .environmentObject(NavigationManager())
        .environmentObject(VisitorDataService())
}
