import SwiftUI

struct EmployeeSelectionView: View {
    @EnvironmentObject var navigationManager: NavigationManager
    @StateObject private var employeeService = EmployeeService.shared
    @State private var searchText = ""
    @State private var selectedEmployee: BackendEmployee?
    
    var filteredEmployees: [BackendEmployee] {
        employeeService.searchEmployees(query: searchText)
    }
    
    var body: some View {
        VStack(spacing: 24) {
            HeaderView(
                title: navigationManager.tr("employee_select_title"),
                subtitle: navigationManager.tr("employee_select_sub"),
                showBackButton: true
            ) {
                navigationManager.goBack()
            }
            
            // Search Bar
            VStack(alignment: .leading, spacing: 8) {
                Text(navigationManager.tr("search_employee"))
                    .font(.headline)
                    .foregroundColor(.primary)
                
                TextField("", text: $searchText)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocapitalization(.words)
            }
            .padding(.horizontal)
            
            if employeeService.isLoading {
                VStack(spacing: 16) {
                    ProgressView()
                        .scaleEffect(1.2)
                    Text(navigationManager.tr("loading"))
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if filteredEmployees.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "person.2.slash")
                        .font(.system(size: 60))
                        .foregroundColor(.gray)
                    
                    Text("Aucun employé trouvé")
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(filteredEmployees, id: \.id) { employee in
                            EmployeeCard(
                                employee: employee,
                                isSelected: selectedEmployee?.id == employee.id
                            ) {
                                selectedEmployee = employee
                                employeeService.selectEmployee(employee)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
            
            // Error Message
            if let errorMessage = employeeService.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .padding(.horizontal)
            }
            
            // Continue Button
            CustomButton(
                navigationManager.tr("continue"),
                style: .primary,
                isEnabled: selectedEmployee != nil
            ) {
                navigationManager.navigateTo(.visitPurpose)
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .navigationBarHidden(true)
        .onAppear {
            employeeService.loadEmployees()
        }
    }
}

struct EmployeeCard: View {
    let employee: BackendEmployee
    let isSelected: Bool
    let onTap: () -> Void
    
    @StateObject private var employeeService = EmployeeService.shared
    
    var body: some View {
        Button(action: onTap) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(employeeService.getEmployeeDisplayName(employee))
                        .font(.headline)
                        .foregroundColor(.primary)
                    Text(employeeService.getDepartmentName(employee))
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.blue)
                        .font(.title2)
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Color.blue.opacity(0.1) : Color(.systemBackground))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    EmployeeSelectionView()
        .environmentObject(NavigationManager())
}


