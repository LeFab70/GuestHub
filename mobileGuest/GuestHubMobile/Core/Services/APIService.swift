import Foundation
import Combine

// MARK: - API Models
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let message: String?
    let statusCode: Int
}

struct ValidationError: Codable {
    let field: String
    let message: String
    let value: String?
}

struct ValidationErrorResponse: Codable {
    let error: String
    let message: String
    let details: [ValidationError]
}

struct PaginatedResponse<T: Codable>: Codable {
    let data: [T]
    let pagination: PaginationInfo
}

struct PaginationInfo: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
}

struct ScheduledVisitsResponse: Codable {
    let visits: [BackendVisit]
    let count: Int
}

struct BackendVisitor: Codable, Identifiable {
    let id: String
    let nom: String
    let prenom: String
    let email: String
    let telephone: String
    let entreprise: String?
    let estBlackliste: Bool
    let createdAt: String
    let updatedAt: String
}

struct BackendVisitorSummary: Codable, Identifiable {
    let id: String?
    let nom: String
    let prenom: String
    let email: String
}

struct BackendEmployee: Codable, Identifiable {
    let id: String
    let nom: String
    let prenom: String
    let email: String
    let telephone: String?
    let poste: String?
    let departmentId: String?
    let department: BackendDepartment?
    let isActive: Bool
    let createdAt: String
    let updatedAt: String
}

struct BackendEmployeeSummary: Codable, Identifiable {
    let id: String?
    let nom: String
    let prenom: String
    let department: BackendDepartment?
}

struct BackendDepartment: Codable, Identifiable {
    let id: String?
    let nom: String
    let description: String?
}

struct BackendVisit: Codable, Identifiable {
    let id: String
    let visiteurId: String
    let visiteur: BackendVisitorSummary?
    let employeId: String?
    let employe: BackendEmployeeSummary?
    let badgeId: String?
    let badge: BackendBadge?
    let dateDebut: String
    let dateFin: String?
    let statut: String
    let motif: String
    let duree: Int?
    let confirmByVisitor: String?
    let confirmedAt: String?
    let createdAt: String
    let updatedAt: String
}

struct BackendBadge: Codable, Identifiable {
    let id: String?
    let visiteId: String?
    let status: String
    let qrCode: String
    let dateImpression: String?
    let printById: String?
    let createdAt: String?
    let updatedAt: String?
}

// MARK: - Request Models
struct CreateVisitorRequest: Codable {
    let nom: String
    let prenom: String
    let email: String
    let telephone: String
    let entreprise: String?
}

struct CreateVisitRequest: Codable {
    let visiteurId: String
    let employeId: String
    let dateDebut: String
    let dateFin: String?
    let motif: String
    let confirmByVisitor: String?
}

// MARK: - API Service Singleton
class APIService: ObservableObject {
    static let shared = APIService()
    
    private let baseURL = "http://localhost:3001/api"
    private let session = URLSession.shared
    private var cancellables = Set<AnyCancellable>()
    
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private init() {}
    
    // MARK: - Generic API Call with APIResponse wrapper
    private func makeRequestWithAPIResponse<T: Codable>(
        endpoint: String,
        method: HTTPMethod = .GET,
        body: Data? = nil,
        responseType: T.Type
    ) -> AnyPublisher<T, Error> {
        
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            print("❌ Invalid URL: \(baseURL)\(endpoint)")
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        print("🌐 Making request to: \(url.absoluteString)")
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let body = body {
            request.httpBody = body
        }
        
        return session.dataTaskPublisher(for: request)
            .map { data, response in
                print("📡 Response received: \(response)")
                if let httpResponse = response as? HTTPURLResponse {
                    print("📊 Status code: \(httpResponse.statusCode)")
                }
                
                // Debug: Afficher le contenu de la réponse
                if let jsonString = String(data: data, encoding: .utf8) {
                    print("📋 Raw response: \(jsonString)")
                }
                
                return (data, response)
            }
            .tryMap { data, response in
                if let httpResponse = response as? HTTPURLResponse {
                    // Gérer les erreurs de validation (400)
                    if httpResponse.statusCode == 400 {
                        do {
                            let validationError = try JSONDecoder().decode(ValidationErrorResponse.self, from: data)
                            let errorMessage = validationError.details.map { "\($0.field): \($0.message)" }.joined(separator: "; ")
                            throw APIError.serverError("Validation failed: \(errorMessage)")
                        } catch {
                            throw APIError.serverError("Validation failed")
                        }
                    }
                    
                    // Gérer les autres erreurs HTTP
                    if httpResponse.statusCode >= 400 {
                        let errorMessage = String(data: data, encoding: .utf8) ?? "HTTP Error \(httpResponse.statusCode)"
                        throw APIError.serverError(errorMessage)
                    }
                }
                
                // Décoder la réponse normale
                let apiResponse = try JSONDecoder().decode(APIResponse<T>.self, from: data)
                print("📋 API Response: success=\(apiResponse.success), message=\(apiResponse.message ?? "nil")")
                
                if apiResponse.success, let data = apiResponse.data {
                    print("✅ Data extracted successfully")
                    return data
                } else {
                    print("❌ API Error: \(apiResponse.message ?? "Unknown error")")
                    throw APIError.serverError(apiResponse.message ?? "Unknown error")
                }
            }
            .mapError { error in
                if error is APIError {
                    return error
                } else {
                    print("❌ Decoding error: \(error)")
                    return APIError.decodingError
                }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Generic API Call
    private func makeRequest<T: Codable>(
        endpoint: String,
        method: HTTPMethod = .GET,
        body: Data? = nil,
        responseType: T.Type
    ) -> AnyPublisher<T, Error> {
        
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            print("❌ Invalid URL: \(baseURL)\(endpoint)")
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        print("🌐 Making request to: \(url.absoluteString)")
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let body = body {
            request.httpBody = body
        }
        
        return session.dataTaskPublisher(for: request)
            .map { data, response in
                print("📡 Response received: \(response)")
                if let httpResponse = response as? HTTPURLResponse {
                    print("📊 Status code: \(httpResponse.statusCode)")
                }
                return data
            }
            .decode(type: APIResponse<T>.self, decoder: JSONDecoder())
            .tryMap { response in
                print("📋 API Response: success=\(response.success), message=\(response.message ?? "nil")")
                if response.success, let data = response.data {
                    return data
                } else {
                    throw APIError.serverError(response.message ?? "Unknown error")
                }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Visitor Operations
    func searchVisitor(by phone: String? = nil, email: String? = nil) -> AnyPublisher<[BackendVisitor], Error> {
        let endpoint = "/visitors/public/search"
        var queryItems: [URLQueryItem] = []
        
        // Use the search parameter that the backend expects
        if let phone = phone {
            queryItems.append(URLQueryItem(name: "search", value: phone))
        } else if let email = email {
            queryItems.append(URLQueryItem(name: "search", value: email))
        }
        
        // Build the full URL with query parameters
        var components = URLComponents(string: "\(baseURL)\(endpoint)")
        components?.queryItems = queryItems
        
        guard let url = components?.url else {
            print("❌ Failed to build URL with components: \(components?.description ?? "nil")")
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        print("🔍 Search URL: \(url.absoluteString)")
        print("🔍 Query items: \(queryItems)")
        
        // Use the full URL directly instead of going through makeRequest
        var request = URLRequest(url: url)
        request.cachePolicy = .reloadIgnoringLocalCacheData
        request.setValue("no-cache", forHTTPHeaderField: "Cache-Control")
        
        return session.dataTaskPublisher(for: request)
            .map { data, response in
                print("📡 Response received: \(response)")
                if let httpResponse = response as? HTTPURLResponse {
                    print("📊 Status code: \(httpResponse.statusCode)")
                }
                return data
            }
            .tryMap { data in
                // Debug: Afficher les données brutes reçues
                if let jsonString = String(data: data, encoding: .utf8) {
                    print("📄 Raw JSON received: \(jsonString)")
                } else {
                    print("❌ Could not convert data to string")
                }
                
                // D'abord, décoder la réponse complète
                do {
                    let fullResponse = try JSONDecoder().decode(APIResponse<PaginatedResponse<BackendVisitor>>.self, from: data)
                    print("📋 API Response: success=\(fullResponse.success), message=\(fullResponse.message ?? "nil")")
                    
                    if fullResponse.success, let responseData = fullResponse.data {
                        print("✅ Found \(responseData.data.count) visitors")
                        return responseData.data
                    } else {
                        print("❌ API Error: \(fullResponse.message ?? "Unknown error")")
                        throw APIError.serverError(fullResponse.message ?? "Unknown error")
                    }
                } catch {
                    print("❌ JSON Decoding Error: \(error)")
                    print("❌ Error details: \(error.localizedDescription)")
                    
                    // Essayer de décoder manuellement pour debug
                    if let jsonString = String(data: data, encoding: .utf8) {
                        print("🔍 Trying manual JSON parsing...")
                        do {
                            if let jsonData = jsonString.data(using: .utf8),
                               let jsonObject = try JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {
                                print("📋 Manual parsing successful: \(jsonObject)")
                            }
                        } catch {
                            print("❌ Manual parsing also failed: \(error)")
                        }
                    }
                    
                    throw error
                }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func createVisitor(_ visitor: CreateVisitorRequest) -> AnyPublisher<BackendVisitor, Error> {
        guard let body = try? JSONEncoder().encode(visitor) else {
            return Fail(error: APIError.encodingError)
                .eraseToAnyPublisher()
        }
        
        return makeRequest(
            endpoint: "/visitors/public",
            method: .POST,
            body: body,
            responseType: BackendVisitor.self
        )
    }
    
    // MARK: - Employee Operations
    func getEmployees() -> AnyPublisher<[BackendEmployee], Error> {
        return makeRequest(
            endpoint: "/employees",
            responseType: PaginatedResponse<BackendEmployee>.self
        )
        .map { $0.data }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Visit Operations
    func getScheduledVisits(for visitorId: String) -> AnyPublisher<[BackendVisit], Error> {
        return makeRequestWithAPIResponse(
            endpoint: "/visits/scheduled/\(visitorId)",
            method: .GET,
            responseType: ScheduledVisitsResponse.self
        )
        .map { response in
            return response.visits
        }
        .eraseToAnyPublisher()
    }
    
    func confirmVisit(visitId: String, visitorName: String) -> AnyPublisher<APIResponse<BackendVisit>, Error> {
        let bodyData = try? JSONSerialization.data(withJSONObject: ["visitorName": visitorName])
        return makeRequestWithAPIResponse(
            endpoint: "/visits/\(visitId)/confirm",
            method: .PATCH,
            body: bodyData,
            responseType: APIResponse<BackendVisit>.self
        )
    }
    
    func createVisit(_ visit: CreateVisitRequest) -> AnyPublisher<BackendVisit, Error> {
        guard let body = try? JSONEncoder().encode(visit) else {
            return Fail(error: APIError.encodingError)
                .eraseToAnyPublisher()
        }
        
        return makeRequestWithAPIResponse(
            endpoint: "/visits/public",
            method: .POST,
            body: body,
            responseType: BackendVisit.self
        )
    }
    
    func confirmScheduledVisit(visitId: String, visitorName: String) -> AnyPublisher<BackendVisit, Error> {
        let bodyData = try? JSONSerialization.data(withJSONObject: ["visitorName": visitorName])
        return makeRequestWithAPIResponse(
            endpoint: "/visits/\(visitId)/confirm",
            method: .PATCH,
            body: bodyData,
            responseType: BackendVisit.self
        )
        .map { response in
            return response
        }
        .eraseToAnyPublisher()
    }
}

// MARK: - Supporting Types
enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case PATCH = "PATCH"
    case DELETE = "DELETE"
}

enum APIError: Error, LocalizedError {
    case invalidURL
    case encodingError
    case decodingError
    case serverError(String)
    case networkError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .encodingError:
            return "Failed to encode request"
        case .decodingError:
            return "Failed to decode response"
        case .serverError(let message):
            return message
        case .networkError(let error):
            return error.localizedDescription
        }
    }
}
