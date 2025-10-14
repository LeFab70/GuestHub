import Foundation

struct AppConfig {
    static let appName = "GuestHub Mobile"
    static let version = "1.0.0"
    static let buildNumber = "1"
    
    // Configuration de l'API
    static let baseURL = "https://api.guesthub.com"
    static let apiVersion = "v1"
    
    // Configuration des couleurs
    struct Colors {
        static let primary = "Blue"
        static let secondary = "Gray"
        static let success = "Green"
        static let danger = "Red"
        static let warning = "Orange"
    }
    
    // Configuration des polices
    struct Fonts {
        static let title = "Avenir-Heavy"
        static let headline = "Avenir-Bold"
        static let body = "Avenir-Medium"
        static let caption = "Avenir-Light"
    }
    
    // Configuration des animations
    struct Animations {
        static let defaultDuration = 0.3
        static let fastDuration = 0.15
        static let slowDuration = 0.5
    }
}
