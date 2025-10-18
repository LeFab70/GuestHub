import SwiftUI

struct QRCodeDisplayView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @EnvironmentObject var dataService: VisitorDataService
    
    private var lastVisit: Visit? {
        dataService.visits.last
    }
    
    var body: some View {
        VStack(spacing: 30) {
            HeaderView(
                title: "Votre QR Code",
                subtitle: "Présentez ce code à l'accueil",
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            
            if let visit = lastVisit, let qrCode = visit.qrCode {
                VStack(spacing: 20) {
                    QRCodeView(qrCodeString: qrCode, size: 250)
                    
                    VStack(spacing: 12) {
                        Text("Détails de la visite")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("Date:")
                                    .fontWeight(.medium)
                                Spacer()
                                Text(visit.startDate, style: .date)
                            }
                            
                            HStack {
                                Text("Heure:")
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
                            
                            HStack {
                                Text("Statut:")
                                    .fontWeight(.medium)
                                Spacer()
                                Text(visit.status.displayName)
                                    .foregroundColor(statusColor(visit.status))
                            }
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemGray6))
                        )
                    }
                }
                .padding(.horizontal)
            } else {
                VStack(spacing: 20) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 60))
                        .foregroundColor(.orange)
                    
                    Text("Aucun QR Code disponible")
                        .font(.headline)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            VStack(spacing: 16) {
                CustomButton("Voir le statut", style: .primary) {
                    navigationManager.navigateTo(.visitStatus)
                }
                
                CustomButton("Nouvelle visite", style: .secondary) {
                    navigationManager.navigateTo(.visitorOptions)
                }
            }
            .padding(.horizontal)
            
            Spacer(minLength: 50)
        }
        .navigationBarHidden(true)
    }
    
    private func statusColor(_ status: VisitStatus) -> Color {
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
    QRCodeDisplayView()
        .environmentObject(NavigationManager())
        .environmentObject(VisitorDataService())
}
