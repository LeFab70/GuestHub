import SwiftUI

struct ConfirmationView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 72))
                .foregroundColor(.green)
            
            Text(navigationManager.tr("thank_you"))
                .font(.title2)
                .fontWeight(.semibold)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Text(navigationManager.tr("go_to_reception"))
                .font(.headline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Spacer()
            
            CustomButton(navigationManager.tr("back"), style: .secondary) {
                navigationManager.resetFlow()
            }
            .padding(.horizontal)
            
            Spacer(minLength: 40)
        }
        .navigationBarHidden(true)
    }
}


