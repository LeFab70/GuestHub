import SwiftUI

struct LanguageSelectionView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            Text(navigationManager.tr("choose_language"))
                .font(.title)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            VStack(spacing: 12) {
                CustomButton(navigationManager.tr("french"), style: .primary) {
                    navigationManager.setLanguage(.fr)
                    navigationManager.navigateTo(.visitorOptions)
                }
                
                CustomButton(navigationManager.tr("english"), style: .secondary) {
                    navigationManager.setLanguage(.en)
                    navigationManager.navigateTo(.visitorOptions)
                }
            }
            .padding(.horizontal)
            
            Spacer()
        }
    }
}


