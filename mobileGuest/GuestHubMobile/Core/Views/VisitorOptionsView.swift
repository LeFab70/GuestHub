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
                CustomButton(navigationManager.tr("new_visitor"), style: .secondary) {
                    navigationManager.isFrequentVisitor = false
                    navigationManager.navigateTo(.newVisitorInfo)
                }
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .navigationBarHidden(true)
    }
}


