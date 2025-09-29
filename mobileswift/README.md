# Guest Hub Mobile App (Swift)

This directory is reserved for the iOS mobile application development using Swift.

## Project Structure

The mobile app will be developed here with the following features:

### Core Features
- Guest management
- Visit scheduling and tracking
- Check-in/Check-out functionality
- User authentication
- Real-time notifications
- Offline data synchronization

### Technology Stack
- **Language**: Swift 5.0+
- **Framework**: SwiftUI
- **Architecture**: MVVM
- **Networking**: URLSession / Alamofire
- **Database**: Core Data
- **Authentication**: OAuth2 / Keycloak integration

### Planned Components
- `Models/` - Data models
- `Views/` - SwiftUI views
- `ViewModels/` - MVVM view models
- `Services/` - API services and business logic
- `Utils/` - Utility classes and extensions
- `Resources/` - Assets, strings, and configuration files

### API Integration
The mobile app will integrate with the Spring Boot backend API endpoints:
- `/api/guests` - Guest management
- `/api/visits` - Visit management
- `/api/users` - User management
- Authentication via Keycloak

### Development Status
🚧 **In Development** - This directory is prepared for future mobile app development.

## Getting Started

1. Open Xcode
2. Create a new iOS project
3. Set up the project structure as outlined above
4. Integrate with the backend API
5. Implement authentication flow
6. Develop core features

## Dependencies

The following Swift packages will be used:
- Alamofire (Networking)
- KeychainAccess (Secure storage)
- SwiftUI (UI framework)
- Combine (Reactive programming)
