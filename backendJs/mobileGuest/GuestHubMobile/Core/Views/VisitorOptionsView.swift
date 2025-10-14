import SwiftUI

struct VisitorOptionsView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    
    var body: some View {
        VStack(spacing: 24) {
            HeaderView(
                title: navigationManager.tr("visitor_flow_title"),
                subtitle: navigationManager.tr("visitor_flow_sub"),
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            
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
        .navigationBarHidden(true)
    }
}


