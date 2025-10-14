import SwiftUI

struct EmployeeSelectionView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @EnvironmentObject var dataService: VisitorDataService
    
    @State private var selectedEmployee: String = ""
    
    private let employees = [
        "Marie Dubois - RH",
        "Pierre Martin - IT",
        "Sophie Bernard - Marketing",
        "Jean Durand - Direction"
    ]
    
    var body: some View {
        VStack(spacing: 24) {
            HeaderView(
                title: navigationManager.tr("employee_select_title"),
                subtitle: navigationManager.tr("employee_select_sub"),
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            
            VStack(alignment: .leading, spacing: 12) {
                Picker("Employee", selection: $selectedEmployee) {
                    Text("-").tag("")
                    ForEach(employees, id: \.self) { emp in
                        Text(emp).tag(emp)
                    }
                }
                .pickerStyle(MenuPickerStyle())
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(.systemGray6))
                )
            }
            .padding(.horizontal)
            
            VStack(spacing: 16) {
                CustomButton(navigationManager.tr("validate"), style: .primary, isEnabled: !selectedEmployee.isEmpty) {
                    navigationManager.selectedEmployeeName = selectedEmployee
                    navigationManager.navigateTo(.confirmation)
                }
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .navigationBarHidden(true)
    }
}


