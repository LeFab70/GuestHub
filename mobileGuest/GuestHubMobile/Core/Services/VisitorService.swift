import Foundation
import Combine

// MARK: - Visitor Service Singleton
class VisitorService: ObservableObject {
    static let shared = VisitorService()
    
    @Published var currentVisitor: BackendVisitor?
    @Published var scheduledVisits: [BackendVisit] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    
    private init() {}
    
    // MARK: - Search Visitor
    func searchVisitor(phone: String? = nil, email: String? = nil) {
        print("🔍 Searching visitor with phone: \(phone ?? "nil"), email: \(email ?? "nil")")
        isLoading = true
        errorMessage = nil
        
        apiService.searchVisitor(by: phone, email: email)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        print("❌ Search failed: \(error.localizedDescription)")
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] visitors in
                    print("✅ Search completed. Found \(visitors.count) visitors")
                    if let visitor = visitors.first {
                        print("👤 Visitor found: \(visitor.prenom) \(visitor.nom) (\(visitor.email))")
                        self?.currentVisitor = visitor
                        self?.errorMessage = nil
                        self?.loadScheduledVisits(for: visitor.id)
                    } else {
                        print("❌ No visitor found")
                        self?.currentVisitor = nil
                        self?.scheduledVisits = []
                        self?.errorMessage = "Aucun visiteur trouvé avec ce contact. Veuillez vérifier vos informations."
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Create New Visitor
    func createVisitor(
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        company: String?
    ) {
        isLoading = true
        errorMessage = nil
        
        let request = CreateVisitorRequest(
            nom: lastName,
            prenom: firstName,
            email: email,
            telephone: phone,
            entreprise: company
        )
        
        apiService.createVisitor(request)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] visitor in
                    self?.currentVisitor = visitor
                    self?.scheduledVisits = []
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Create New Visitor (New Method)
    func createVisitor(
        nom: String,
        prenom: String,
        email: String,
        telephone: String,
        entreprise: String,
        completion: @escaping (Result<BackendVisitor, Error>) -> Void
    ) {
        let request = CreateVisitorRequest(
            nom: nom,
            prenom: prenom,
            email: email,
            telephone: telephone,
            entreprise: entreprise
        )
        
        apiService.createVisitor(request)
            .sink(
                receiveCompletion: { result in
                    if case .failure(let error) = result {
                        completion(.failure(error))
                    }
                },
                receiveValue: { visitor in
                    completion(.success(visitor))
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Check Existing Visitor
    func checkExistingVisitor(
        email: String,
        phone: String,
        completion: @escaping (Result<BackendVisitor?, Error>) -> Void
    ) {
        apiService.searchVisitor(by: phone, email: email)
            .sink(
                receiveCompletion: { result in
                    if case .failure(let error) = result {
                        completion(.failure(error))
                    }
                },
                receiveValue: { visitors in
                    completion(.success(visitors.first))
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Load Scheduled Visits
    private func loadScheduledVisits(for visitorId: String) {
        apiService.getScheduledVisits(for: visitorId)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] visits in
                    self?.scheduledVisits = visits
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Confirm Scheduled Visit
    func confirmScheduledVisit(visitId: String, visitorName: String) {
        isLoading = true
        errorMessage = nil
        
        apiService.confirmScheduledVisit(visitId: visitId, visitorName: visitorName)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] visit in
                    // Update the visit in scheduled visits
                    if let index = self?.scheduledVisits.firstIndex(where: { $0.id == visitId }) {
                        self?.scheduledVisits[index] = visit
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Clear Data
    func clearData() {
        currentVisitor = nil
        scheduledVisits = []
        errorMessage = nil
    }
    
    // MARK: - Helper Methods
    func isVisitorFound() -> Bool {
        return currentVisitor != nil
    }
    
    func hasScheduledVisits() -> Bool {
        return !scheduledVisits.isEmpty
    }
    
    func getVisitorDisplayName() -> String {
        guard let visitor = currentVisitor else { return "" }
        return "\(visitor.prenom) \(visitor.nom)"
    }
}
