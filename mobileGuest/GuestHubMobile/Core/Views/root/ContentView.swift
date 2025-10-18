import SwiftUI

struct ContentView: View {
    @StateObject private var navigationManager = NavigationManager()
    @StateObject private var dataService = VisitorDataService()
    
    var body: some View {
        NavigationView {
            switch navigationManager.currentView {
            case .languageSelection:
                LanguageSelectionView()
            case .visitorOptions:
                VisitorOptionsView()
            case .frequentVisitorInfo:
                FrequentVisitorInfoView()
            case .newVisitorInfo:
                NewVisitorInfoView()
            case .scheduledVisitsList:
                ScheduledVisitsListView()
            case .scheduledVisitConfirmation:
                ScheduledVisitConfirmationView()
            case .visitCreated:
                VisitCreatedView()
            case .employeeSelection:
                EmployeeSelectionView()
            case .visitPurpose:
                VisitPurposeView()
            case .visitConfirmation:
                VisitConfirmationView()
            case .confirmation:
                ConfirmationView()
            case .welcome:
                WelcomeView()
            case .visitScheduling:
                VisitSchedulingView()
            case .qrCodeDisplay:
                QRCodeDisplayView()
            case .visitStatus:
                VisitStatusView()
            case .checkOut:
                CheckOutView()
            }
        }
        .environmentObject(navigationManager)
        .environmentObject(dataService)
    }
}

#Preview {
    ContentView()
}
