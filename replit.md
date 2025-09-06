# T'chiche Game - Party Game PWA

## Overview
T'chiche is a French progressive web application (PWA) designed for adult party games. It's a truth-or-dare style game with escalating challenge levels, perfect for spicing up social gatherings.

## Project Architecture
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript
- **Type**: Progressive Web App (PWA)
- **Language**: French
- **Theme**: Neon purple/pink aesthetic
- **Server**: Python 3.11 HTTP server

## Key Features
- 4 progressive difficulty levels (Phase 1-4)
- Truth and dare challenges
- Custom challenge creation
- Player management system
- PWA capabilities with offline support
- Service worker for caching

## Recent Changes (September 06, 2025)
- Successfully imported from GitHub
- Set up Python HTTP server on port 5000
- Updated manifest.json to use local icon files
- Configured Replit workflow for development
- Set up autoscale deployment configuration
- Added cache control headers to prevent development caching issues

## Technical Setup
- **Development Server**: Python `http.server` on port 5000
- **Host Configuration**: 0.0.0.0 (allows Replit proxy access)
- **Cache Headers**: Disabled for development (`no-cache, no-store, must-revalidate`)
- **Deployment**: Configured for autoscale deployment target

## File Structure
```
├── index.html          # Main application HTML
├── script.js           # Game logic and interactions
├── data.js            # Challenge database
├── styles.css         # Embedded in HTML
├── manifest.json      # PWA manifest
├── service-worker.js  # PWA service worker
├── icon-192.png       # PWA icon
├── icon-512.png       # PWA icon
└── server.py          # HTTP server for Replit
```

## Current State
✅ Fully functional and ready for use
✅ Replit environment properly configured
✅ Deployment settings configured
✅ All features working as expected

## User Preferences
- Project successfully migrated to Replit environment
- Maintains original French language and adult party game content
- Progressive difficulty levels preserved