import SwiftUI

struct FrequentVisitorInfoView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @State private var contact: String = ""
    
    var body: some View {
        VStack(spacing: 24) {
            HeaderView(
                title: navigationManager.tr("frequent_visitor"),
                subtitle: navigationManager.tr("enter_contact"),
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            
            VStack(spacing: 20) {
                CustomTextField(
                    navigationManager.tr("enter_contact"),
                    placeholder: "email@example.com / +33 6 12 34 56 78",
                    text: $contact,
                    keyboardType: .emailAddress
                )
            }
            .padding(.horizontal)
            
            VStack(spacing: 16) {
                CustomButton(navigationManager.tr("continue"), style: .primary, isEnabled: !contact.trimmingCharacters(in: .whitespaces).isEmpty) {
                    navigationManager.frequentContact = contact
                    navigationManager.navigateTo(.employeeSelection)
                }
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .navigationBarHidden(true)
    }
}


