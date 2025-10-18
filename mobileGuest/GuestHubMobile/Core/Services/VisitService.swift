import Foundation
import Combine

// MARK: - Visit Data Model
struct VisitData {
    let visiteurId: String
    let employeId: String
    let motif: String
    let dateDebut: Date
    let dureeEstimee: Int // en minutes
}

// MARK: - Visit Service Singleton
class VisitService: ObservableObject {
    static let shared = VisitService()
    
    @Published var currentVisit: VisitData?
    @Published var visitPurpose: String = ""
    @Published var visitStartDate: Date = Date()
    @Published var visitEndDate: Date = Date().addingTimeInterval(2 * 60 * 60) // 2 hours later
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isVisitCreated = false
    @Published var foundVisitor: BackendVisitor?
    @Published var scheduledVisits: [BackendVisit] = []
    @Published var isConfirmingVisit = false
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    
    private init() {}
    
    // MARK: - Clear Data
    func clearData() {
        currentVisit = nil
        visitPurpose = ""
        visitStartDate = Date()
        visitEndDate = Date().addingTimeInterval(2 * 60 * 60)
        isLoading = false
        errorMessage = nil
        isVisitCreated = false
    }
    
    // MARK: - Create New Visit
    // MARK: - Visitor Search Methods
    
    func searchVisitor(phone: String, completion: @escaping (Bool) -> Void) {
        print("🔍 Searching visitor by phone: \(phone)")
        apiService.searchVisitor(by: phone, email: nil)
            .sink(
                receiveCompletion: { [weak self] result in
                    DispatchQueue.main.async {
                        self?.isLoading = false
                        if case .failure(let error) = result {
                            print("❌ Visitor search failed: \(error)")
                            self?.errorMessage = "Erreur lors de la recherche: \(error.localizedDescription)"
                            completion(false)
                        }
                    }
                },
                receiveValue: { [weak self] visitors in
                    DispatchQueue.main.async {
                        print("✅ Found \(visitors.count) visitors")
                        if let visitor = visitors.first {
                            self?.foundVisitor = visitor
                            self?.errorMessage = nil
                            completion(true)
                        } else {
                            self?.errorMessage = "Aucun visiteur trouvé avec ce numéro de téléphone"
                            completion(false)
                        }
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func searchVisitor(email: String, completion: @escaping (Bool) -> Void) {
        print("🔍 Searching visitor by email: \(email)")
        apiService.searchVisitor(by: nil, email: email)
            .sink(
                receiveCompletion: { [weak self] result in
                    DispatchQueue.main.async {
                        self?.isLoading = false
                        if case .failure(let error) = result {
                            print("❌ Visitor search failed: \(error)")
                            self?.errorMessage = "Erreur lors de la recherche: \(error.localizedDescription)"
                            completion(false)
                        }
                    }
                },
                receiveValue: { [weak self] visitors in
                    DispatchQueue.main.async {
                        print("✅ Found \(visitors.count) visitors")
                        if let visitor = visitors.first {
                            self?.foundVisitor = visitor
                            self?.errorMessage = nil
                            completion(true)
                        } else {
                            self?.errorMessage = "Aucun visiteur trouvé avec cet email"
                            completion(false)
                        }
                    }
                }
            )
            .store(in: &cancellables)
    }

    func createVisit(visiteurId: String, employeId: String, motif: String, dateDebut: Date, dureeEstimee: Int, completion: @escaping (Bool) -> Void) {
        isLoading = true
        errorMessage = nil
        
        // Calculer la date de fin basée sur la durée estimée
        let dateFin = dateDebut.addingTimeInterval(TimeInterval(dureeEstimee * 60))
        
        let formatter = ISO8601DateFormatter()
        let visitRequest = CreateVisitRequest(
            visiteurId: visiteurId,
            employeId: employeId,
            dateDebut: formatter.string(from: dateDebut),
            dateFin: formatter.string(from: dateFin),
            motif: motif,
            confirmByVisitor: foundVisitor?.prenom ?? "Visiteur"
        )
        
        apiService.createVisit(visitRequest)
            .sink(
                receiveCompletion: { [weak self] result in
                    DispatchQueue.main.async {
                        self?.isLoading = false
                        if case .failure(let error) = result {
                            print("❌ Visit creation failed: \(error)")
                            
                            // Vérifier si c'est une erreur de blacklist
                            if let apiError = error as? APIError {
                                switch apiError {
                                case .serverError(let message):
                                    if message.contains("blacklisté") || message.contains("Accès refusé") {
                                        self?.errorMessage = message
                                    } else {
                                        self?.errorMessage = "Erreur serveur: \(message)"
                                    }
                                case .networkError:
                                    self?.errorMessage = "Erreur de connexion. Vérifiez votre connexion internet."
                                case .encodingError:
                                    self?.errorMessage = "Erreur d'encodage des données. Veuillez réessayer."
                                case .decodingError:
                                    self?.errorMessage = "Erreur de décodage des données. Veuillez réessayer."
                                case .invalidURL:
                                    self?.errorMessage = "URL invalide. Veuillez réessayer."
                                }
                            } else {
                                self?.errorMessage = "Erreur: \(error.localizedDescription)"
                            }
                            completion(false)
                        }
                    }
                },
                receiveValue: { [weak self] response in
                    DispatchQueue.main.async {
                        print("✅ Visit created successfully: \(response.id)")
                        self?.isVisitCreated = true
                        self?.errorMessage = nil
                        completion(true)
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Legacy Create Visit (for backward compatibility)
    func createVisit() {
        guard let visitor = VisitorService.shared.currentVisitor,
              let employee = EmployeeService.shared.selectedEmployee else {
            errorMessage = "Visiteur ou employé non sélectionné"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        let formatter = ISO8601DateFormatter()
        let request = CreateVisitRequest(
            visiteurId: visitor.id,
            employeId: employee.id,
            dateDebut: formatter.string(from: visitStartDate),
            dateFin: formatter.string(from: visitEndDate),
            motif: visitPurpose,
            confirmByVisitor: foundVisitor?.prenom ?? "Visiteur"
        )
        
        apiService.createVisit(request)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] visit in
                    // Ne pas assigner BackendVisit à VisitData
                    self?.isVisitCreated = true
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Confirm Scheduled Visit
    func confirmScheduledVisit(_ visit: BackendVisit) {
        isLoading = true
        errorMessage = nil
        
        // Utiliser le nom du visiteur trouvé ou un nom par défaut
        let visitorName = foundVisitor?.prenom ?? "Visiteur"
        
        apiService.confirmScheduledVisit(visitId: visit.id, visitorName: visitorName)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] visit in
                    // Mettre à jour la visite dans la liste des visites programmées
                    if let index = self?.scheduledVisits.firstIndex(where: { $0.id == visit.id }) {
                        self?.scheduledVisits[index] = visit
                    }
                    self?.isVisitCreated = true
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Clear Visit Data
    func clearVisitData() {
        currentVisit = nil
        visitPurpose = ""
        visitStartDate = Date()
        visitEndDate = Date().addingTimeInterval(2 * 60 * 60)
        isVisitCreated = false
        errorMessage = nil
    }
    
    // MARK: - Helper Methods
    func getVisitStatusDisplayName(_ status: String) -> String {
        switch status {
        case "PLANIFIEE":
            return "Planifiée"
        case "EN_COURS":
            return "En cours"
        case "TERMINEE":
            return "Terminée"
        case "EXPIREE":
            return "Expirée"
        case "ANNULEE":
            return "Annulée"
        default:
            return "Inconnu"
        }
    }
    
    func getVisitStatusColor(_ status: String) -> String {
        switch status {
        case "PLANIFIEE":
            return "blue"
        case "EN_COURS":
            return "green"
        case "TERMINEE":
            return "gray"
        case "EXPIREE":
            return "orange"
        case "ANNULEE":
            return "red"
        default:
            return "gray"
        }
    }
    
    func formatVisitDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return dateString }
        
        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .medium
        displayFormatter.timeStyle = .short
        displayFormatter.locale = Locale(identifier: "fr_FR")
        
        return displayFormatter.string(from: date)
    }
    
    func getVisitDuration() -> String {
        let duration = visitEndDate.timeIntervalSince(visitStartDate)
        let hours = Int(duration) / 3600
       // let minutes = Int(duration % 3600) / 60
        let minutes = Int(duration.truncatingRemainder(dividingBy: 3600) / 60)

        if hours > 0 {
            return "\(hours)h \(minutes)min"
        } else {
            return "\(minutes)min"
        }
    }
    
    // MARK: - Scheduled Visits
    func loadScheduledVisits(for visitorId: String) {
        isLoading = true
        errorMessage = nil
        
        apiService.getScheduledVisits(for: visitorId)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = "Erreur lors du chargement des visites planifiées: \(error.localizedDescription)"
                    }
                },
                receiveValue: { [weak self] visits in
                    self?.scheduledVisits = visits
                }
            )
            .store(in: &cancellables)
    }
    
    func formatVisitTime(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return "" }
        
        let displayFormatter = DateFormatter()
        displayFormatter.timeStyle = .short
        displayFormatter.locale = Locale(identifier: "en_US")
        
        return displayFormatter.string(from: date)
    }
}

