import SwiftUI
import CoreImage.CIFilterBuiltins

struct QRCodeView: View {
    let qrCodeString: String
    let size: CGFloat
    
    init(qrCodeString: String, size: CGFloat = 200) {
        self.qrCodeString = qrCodeString
        self.size = size
    }
    
    var body: some View {
        VStack {
            if let qrCodeImage = generateQRCode(from: qrCodeString) {
                Image(uiImage: qrCodeImage)
                    .interpolation(.none)
                    .resizable()
                    .scaledToFit()
                    .frame(width: size, height: size)
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(radius: 4)
            } else {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: size, height: size)
                    .overlay(
                        Text("Erreur QR Code")
                            .foregroundColor(.gray)
                    )
            }
            
            Text("Code QR de votre visite")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.top, 8)
        }
    }
    
    private func generateQRCode(from string: String) -> UIImage? {
        let data = string.data(using: String.Encoding.ascii)
        
        guard let filter = CIFilter(name: "CIQRCodeGenerator") else { return nil }
        filter.setValue(data, forKey: "inputMessage")
        
        let transform = CGAffineTransform(scaleX: 10, y: 10)
        
        guard let output = filter.outputImage?.transformed(by: transform) else { return nil }
        
        let context = CIContext()
        guard let cgImage = context.createCGImage(output, from: output.extent) else { return nil }
        
        return UIImage(cgImage: cgImage)
    }
}

#Preview {
    QRCodeView(qrCodeString: "https://example.com/visit/12345")
        .padding()
}
