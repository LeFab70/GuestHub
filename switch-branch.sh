#!/bin/bash

# Script pour basculer entre les branches du projet GuestHub
# Usage: ./switch-branch.sh [main|backend|frontend|mobile]

BRANCH=${1:-main}

case $BRANCH in
  main)
    echo "🔄 Switching to main branch (all components)..."
    git checkout main
    echo "✅ Main branch: Contains all 3 folders (backendJs, dashboard-angular, mobileGuest)"
    ;;
  backend)
    echo "🔄 Switching to backend branch (backendJs only)..."
    git checkout backend
    echo "✅ Backend branch: Contains only backendJs folder"
    ;;
  frontend)
    echo "🔄 Switching to frontend branch (dashboard-angular only)..."
    git checkout frontend
    echo "✅ Frontend branch: Contains only dashboard-angular folder"
    ;;
  mobile)
    echo "🔄 Switching to mobile branch (mobileGuest only)..."
    git checkout mobile
    echo "✅ Mobile branch: Contains only mobileGuest folder"
    ;;
  *)
    echo "❌ Invalid branch. Usage: $0 [main|backend|frontend|mobile]"
    echo ""
    echo "Available branches:"
    echo "  main      - All components (backendJs, dashboard-angular, mobileGuest)"
    echo "  backend   - Backend only (backendJs)"
    echo "  frontend  - Frontend only (dashboard-angular)"
    echo "  mobile    - Mobile only (mobileGuest)"
    exit 1
    ;;
esac

echo ""
echo "📁 Current directory contents:"
ls -la
