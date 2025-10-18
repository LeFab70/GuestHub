import Foundation
import Combine

// MARK: - Employee Service Singleton
class EmployeeService: ObservableObject {
    static let shared = EmployeeService()
    
    @Published var employees: [BackendEmployee] = []
    @Published var selectedEmployee: BackendEmployee?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    
    private init() {
        loadEmployees()
    }
    
    // MARK: - Load Employees
    func loadEmployees() {
        isLoading = true
        errorMessage = nil
        
        apiService.getEmployees()
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] employees in
                    self?.employees = employees.filter { $0.isActive }
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Select Employee
    func selectEmployee(_ employee: BackendEmployee) {
        selectedEmployee = employee
    }
    
    func selectEmployeeFromSummary(_ employeeSummary: BackendEmployeeSummary) {
        // Créer un BackendEmployee temporaire à partir du résumé
        let employee = BackendEmployee(
            id: employeeSummary.id ?? "",
            nom: employeeSummary.nom,
            prenom: employeeSummary.prenom,
            email: "", // Pas disponible dans le résumé
            telephone: nil,
            poste: nil,
            departmentId: nil,
            department: employeeSummary.department,
            isActive: true,
            createdAt: "",
            updatedAt: ""
        )
        selectedEmployee = employee
    }
    
    // MARK: - Clear Selection
    func clearSelection() {
        selectedEmployee = nil
    }
    
    // MARK: - Helper Methods
    func getEmployeeDisplayName(_ employee: BackendEmployee) -> String {
        return "\(employee.prenom) \(employee.nom)"
    }
    
    func getDepartmentName(_ employee: BackendEmployee) -> String {
        return employee.department?.nom ?? "Non assigné"
    }
    
    // MARK: - Convenience Methods (using selectedEmployee)
    func getEmployeeDisplayName() -> String {
        guard let employee = selectedEmployee else { return "Non sélectionné" }
        return getEmployeeDisplayName(employee)
    }
    
    func getDepartmentName() -> String {
        guard let employee = selectedEmployee else { return "Non assigné" }
        return getDepartmentName(employee)
    }
    
    func getEmployeeFullInfo(_ employee: BackendEmployee) -> String {
        let name = getEmployeeDisplayName(employee)
        let department = getDepartmentName(employee)
        return "\(name) - \(department)"
    }
    
    func searchEmployees(query: String) -> [BackendEmployee] {
        if query.isEmpty {
            return employees
        }
        
        return employees.filter { employee in
            let name = getEmployeeDisplayName(employee).lowercased()
            let department = getDepartmentName(employee).lowercased()
            let query = query.lowercased()
            
            return name.contains(query) || department.contains(query)
        }
    }
}
