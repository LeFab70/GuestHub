import SwiftUI

struct CustomButton: View {
    let title: String
    let action: () -> Void
    let style: ButtonStyle
    let isEnabled: Bool
    let isLoading: Bool
    
    init(
        _ title: String,
        style: ButtonStyle = .primary,
        isEnabled: Bool = true,
        isLoading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.style = style
        self.isEnabled = isEnabled
        self.isLoading = isLoading
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: style.textColor))
                        .scaleEffect(0.8)
                }
                
                Text(isLoading ? "Chargement..." : title)
                    .font(.headline)
                    .foregroundColor(style.textColor)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(style.backgroundColor)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(style.borderColor, lineWidth: 1)
            )
        }
        .disabled(!isEnabled || isLoading)
        .opacity((isEnabled && !isLoading) ? 1.0 : 0.6)
    }
}

enum ButtonStyle {
    case primary
    case secondary
    case success
    case danger
    
    var backgroundColor: Color {
        switch self {
        case .primary:
            return .blue
        case .secondary:
            return .gray
        case .success:
            return .green
        case .danger:
            return .red
        }
    }
    
    var textColor: Color {
        switch self {
        case .primary, .secondary, .success, .danger:
            return .white
        }
    }
    
    var borderColor: Color {
        switch self {
        case .primary:
            return .blue
        case .secondary:
            return .gray
        case .success:
            return .green
        case .danger:
            return .red
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        CustomButton("Bouton Principal", style: .primary) { }
        CustomButton("Bouton Secondaire", style: .secondary) { }
        CustomButton("Succès", style: .success) { }
        CustomButton("Danger", style: .danger) { }
        CustomButton("Désactivé", isEnabled: false) { }
    }
    .padding()
}
