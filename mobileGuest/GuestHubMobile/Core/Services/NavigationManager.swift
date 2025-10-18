import Foundation
import SwiftUI

enum AppLanguage {
    case fr
    case en
}

enum AppView {
    case languageSelection
    case visitorOptions
    case frequentVisitorInfo
    case newVisitorInfo
    case scheduledVisitsList
    case scheduledVisitConfirmation
    case visitCreated
    case employeeSelection
    case visitPurpose
    case visitConfirmation
    case confirmation
    // Existing (kept for future use)
    case welcome
    case visitScheduling
    case qrCodeDisplay
    case visitStatus
    case checkOut
}

class NavigationManager: ObservableObject {
    @Published var currentView: AppView = .languageSelection
    @Published var language: AppLanguage = .fr
    @Published var isFrequentVisitor: Bool? = nil
    @Published var frequentContact: String = ""
    @Published var selectedEmployeeName: String? = nil

    func navigateTo(_ view: AppView) {
        withAnimation(.easeInOut(duration: 0.3)) {
            currentView = view
        }
    }

    func setLanguage(_ lang: AppLanguage) {
        language = lang
    }

    func resetFlow() {
        isFrequentVisitor = nil
        frequentContact = ""
        selectedEmployeeName = nil
        currentView = .languageSelection
    }

    func goBack() {
        switch currentView {
        case .languageSelection:
            break
        case .visitorOptions:
            navigateTo(.languageSelection)
        case .frequentVisitorInfo:
            navigateTo(.visitorOptions)
        case .newVisitorInfo:
            navigateTo(.visitorOptions)
        case .scheduledVisitsList:
            navigateTo(.frequentVisitorInfo)
        case .scheduledVisitConfirmation:
            navigateTo(.scheduledVisitsList)
        case .visitCreated:
            navigateTo(.visitorOptions)
        case .employeeSelection:
            navigateTo(.frequentVisitorInfo)
        case .visitPurpose:
            navigateTo(.employeeSelection)
        case .visitConfirmation:
            navigateTo(.visitPurpose)
        case .confirmation:
            navigateTo(.employeeSelection)
        case .welcome:
            break
        case .visitScheduling:
            navigateTo(.confirmation)
        case .qrCodeDisplay:
            navigateTo(.visitScheduling)
        case .visitStatus:
            navigateTo(.qrCodeDisplay)
        case .checkOut:
            navigateTo(.visitStatus)
        }
    }

    // Simple localization
    func tr(_ key: String) -> String {
        let fr: [String: String] = [
            "choose_language": "Choisissez votre langue",
            "french": "Français",
            "english": "Anglais",
            "continue": "Continuer",
            "back": "Retour",
            "visitor_flow_title": "Bienvenue",
            "visitor_flow_sub": "Veuillez sélectionner une option",
        "frequent_visitor": "Je viens souvent",
        "new_visitor": "Nouveau visiteur",
            "enter_contact": "Entrez votre email ou téléphone",
            "employee_select_title": "Choix de l'employé",
            "employee_select_sub": "Qui venez-vous visiter ?",
            "validate": "Valider",
            "thank_you": "Merci pour votre temps",
            "go_to_reception": "Veuillez vous diriger vers la réception pour votre badge"
        ]
        let en: [String: String] = [
            "choose_language": "Choose your language",
            "french": "French",
            "english": "English",
            "continue": "Continue",
            "back": "Back",
            "visitor_flow_title": "Welcome",
            "visitor_flow_sub": "Please select an option",
        "frequent_visitor": "I visit often",
        "new_visitor": "New visitor",
            "enter_contact": "Enter your email or phone",
            "employee_select_title": "Employee selection",
            "employee_select_sub": "Who are you visiting?",
            "validate": "Validate",
            "thank_you": "Thank you for your time",
            "go_to_reception": "Please go to the receptionist to get your badge"
        ]
        switch language {
        case .fr: return fr[key] ?? key
        case .en: return en[key] ?? key
        }
    }
}
