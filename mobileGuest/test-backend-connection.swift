#!/usr/bin/env swift

import Foundation

// Test script to verify backend connection
let baseURL = "http://localhost:3001/api"

func testEndpoint(_ endpoint: String) {
    guard let url = URL(string: "\(baseURL)\(endpoint)") else {
        print("❌ Invalid URL: \(endpoint)")
        return
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let semaphore = DispatchSemaphore(value: 0)
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        defer { semaphore.signal() }
        
        if let error = error {
            print("❌ \(endpoint): \(error.localizedDescription)")
            return
        }
        
        if let httpResponse = response as? HTTPURLResponse {
            if httpResponse.statusCode == 200 {
                print("✅ \(endpoint): OK (200)")
            } else {
                print("⚠️  \(endpoint): Status \(httpResponse.statusCode)")
            }
        }
    }.resume()
    
    semaphore.wait()
}

print("🔍 Testing backend connection...")
print("Base URL: \(baseURL)")
print()

// Test endpoints
testEndpoint("/visitors")
testEndpoint("/employees")
testEndpoint("/visits")
testEndpoint("/departments")
testEndpoint("/badges")

print()
print("✅ Backend connection test completed!")


