import SwiftUI

@main
struct GuestHubApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .ignoresSafeArea(.all, edges: .all)
                .preferredColorScheme(.light)
        }
        .windowResizability(.contentSize)
    }
}

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: nil, sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        if let windowScene = scene as? UIWindowScene {
            // Configuration pour tablette en plein écran
            windowScene.sizeRestrictions?.minimumSize = CGSize(width: 1024, height: 768)
            windowScene.sizeRestrictions?.maximumSize = CGSize(width: 1024, height: 768)
            
            // Désactiver Split View et Slide Over
            windowScene.sizeRestrictions?.allowsFullScreen = true
            
            let window = UIWindow(windowScene: windowScene)
            window.rootViewController = UIHostingController(
                rootView: ContentView()
                    .ignoresSafeArea(.all, edges: .all)
                    .preferredColorScheme(.light)
            )
            self.window = window
            window.makeKeyAndVisible()
        }
    }
}
