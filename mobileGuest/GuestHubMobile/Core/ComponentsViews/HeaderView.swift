import SwiftUI

struct HeaderView: View {
    let title: String
    let subtitle: String?
    let showBackButton: Bool
    let onBackTapped: (() -> Void)?
    
    init(
        title: String,
        subtitle: String? = nil,
        showBackButton: Bool = false,
        onBackTapped: (() -> Void)? = nil
    ) {
        self.title = title
        self.subtitle = subtitle
        self.showBackButton = showBackButton
        self.onBackTapped = onBackTapped
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                if showBackButton {
                    Button(action: {
                        onBackTapped?()
                    }) {
                        Image(systemName: "chevron.left")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                }
                
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.horizontal)
        .padding(.top)
    }
}

#Preview {
    VStack {
        HeaderView(
            title: "Bienvenue",
            subtitle: "Gestion des visites",
            showBackButton: true
        ) {
            print("Back tapped")
        }
        
        Spacer()
    }
}
