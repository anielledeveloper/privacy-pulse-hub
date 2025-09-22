# Changelog

All notable changes to the Team Guideline Pulse Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-01

### Added
- Initial release of Team Guideline Pulse Chrome Extension
- MV3 manifest with service worker support
- Weekly Friday reminders with configurable time
- Creative gradient sliders with accessibility features
- Real-time guideline evaluation form
- Team performance averages display
- Historical trends with configurable periods
- Settings panel with customization options
- Offline support with JSON fallback
- Client-side de-duplication
- Admin override for multiple submissions
- Satisfying feedback with confetti effects
- Consent management system with SHA-256 hashing
- Privacy-first design with local-only mode
- External data sharing with explicit consent
- Consent withdrawal and management

### Technical Features
- TypeScript with strict type checking
- Webpack build system
- Chrome storage management
- Background service worker
- Chrome alarms API integration
- Responsive design with CSS Grid/Flexbox
- Accessibility compliance (ARIA, keyboard nav)
- Reduced motion support
- High contrast mode support
- Cross-platform compatibility

### UI/UX Features
- Gradient color-coded sliders (red→amber→green)
- Emoji indicators for visual feedback
- Snap zones for common values (0, 25, 50, 75, 100)
- Progress tracking with answered count
- Tabbed interface (Form, Trends, Settings)
- Modern gradient design with smooth animations
- Mobile-responsive layout
- Intuitive form controls

## [Unreleased]

### Added
- **Standalone Mode**: Extension now works independently without API backend
- **Enhanced Consent Management**: Detailed consent receipt with hash verification and API URL tracking
- **Developer Tools**: Built-in debugging capabilities (Test Notification, Debug Storage, Check Alarm Status)
- **Settings Reorganization**: Improved settings tab with logical grouping and visual hierarchy
- **Advanced Options**: Configurable API URL and external data sharing controls
- **Consent Receipt**: Professional consent tracking with cryptographic hash display
- **Visual Improvements**: Better styling for consent receipt and settings sections

### Changed
- **Settings Tab**: Reorganized into logical sections (Reminder Settings, User Experience, Data Sharing, Developer Tools, Data Management)
- **Consent Display**: Enhanced consent receipt with detailed information and better visual design
- **Developer Mode**: Separated advanced options from developer debug tools
- **UI Styling**: Improved visual hierarchy and professional appearance

### Technical Improvements
- **Consent Hash Display**: Shows SHA-256 hash of consent text for verification
- **API URL Tracking**: Displays current API endpoint in consent receipt
- **Better Organization**: Cleaner separation of user-facing and developer features
- **Enhanced Styling**: Professional card-based design for settings sections

### Planned
- Chart visualization for trends
- Export functionality for data
- Team comparison features
- Custom guideline creation
- Advanced notification options
- Dark mode theme
- Internationalization support
- Performance optimizations
- Enhanced accessibility features
