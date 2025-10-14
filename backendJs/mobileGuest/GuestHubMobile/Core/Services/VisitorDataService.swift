import Foundation

struct Visitor: Identifiable, Codable, Hashable {
    var id = UUID()
    var firstName: String
    var lastName: String
    var email: String?
    var phone: String?
    var company: String?
    var isBlacklisted: Bool = false
    var createdAt: Date = Date()
}

struct Visit: Identifiable, Codable, Hashable {
    var id = UUID()
    var visitorId: UUID
    var employeeId: UUID
    var startDate: Date
    var endDate: Date?
    var purpose: String
    var status: VisitStatus
    var qrCode: String?
    var createdAt: Date = Date()
}

enum VisitStatus: String, CaseIterable, Codable {
    case scheduled = "PLANIFIEE"
    case inProgress = "EN_COURS"
    case completed = "TERMINEE"
    case cancelled = "ANNULEE"
    
    var displayName: String {
        switch self {
        case .scheduled:
            return "Planifiée"
        case .inProgress:
            return "En cours"
        case .completed:
            return "Terminée"
        case .cancelled:
            return "Annulée"
        }
    }
}

class VisitorDataService: ObservableObject {
    @Published var visitors: [Visitor] = []
    @Published var visits: [Visit] = []
    
    init() {
        loadSampleData()
    }
    
    func addVisitor(_ visitor: Visitor) {
        visitors.append(visitor)
    }
    
    func addVisit(_ visit: Visit) {
        visits.append(visit)
    }
    
    func updateVisit(_ visit: Visit) {
        if let index = visits.firstIndex(where: { $0.id == visit.id }) {
            visits[index] = visit
        }
    }
    
    func getVisitsForVisitor(_ visitorId: UUID) -> [Visit] {
        return visits.filter { $0.visitorId == visitorId }
    }
    
    private func loadSampleData() {
        // Données d'exemple pour le développement
        let sampleVisitor = Visitor(
            firstName: "Jean",
            lastName: "Dupont",
            email: "jean.dupont@example.com",
            phone: "+33123456789",
            company: "TechCorp"
        )
        visitors.append(sampleVisitor)
    }
}
