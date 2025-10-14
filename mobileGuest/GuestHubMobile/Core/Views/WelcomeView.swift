import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            VStack(spacing: 16) {
                Image(systemName: "globe")
                    .font(.system(size: 80))
                    .foregroundColor(.blue)
                
                Text("GuestHub")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text(navigationManager.tr("visitor_flow_sub"))
                    .font(.headline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            Spacer()
            
            VStack(spacing: 16) {
                CustomButton(navigationManager.tr("frequent_visitor"), style: .primary) {
                    navigationManager.isFrequentVisitor = true
                    navigationManager.navigateTo(.frequentVisitorInfo)
                }
                CustomButton(navigationManager.tr("preregistered_visit"), style: .secondary) {
                    navigationManager.isFrequentVisitor = false
                    navigationManager.navigateTo(.employeeSelection)
                }
                CustomButton(navigationManager.tr("new_visit"), style: .secondary) {
                    navigationManager.isFrequentVisitor = false
                    navigationManager.navigateTo(.employeeSelection)
                }
            }
            .padding(.horizontal)
            
            Spacer()
        }
    }
}

#Preview {
    WelcomeView()
        .environmentObject(NavigationManager())
}
