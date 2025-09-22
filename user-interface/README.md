# PrivacyPulse Hub Chrome Extension

A Chrome Extension (MV3) for customizable pulse surveys, team collaboration, and data collection. Features creative gradient sliders, real-time analytics, standalone mode, and privacy-first design.

## Features

- **🔄 Standalone Mode**: Works independently without API backend
- **💾 Local Storage**: All data stored locally for complete privacy
- **🔒 Privacy-First**: Data protection focused with full consent management
- **📊 Real-time Analytics**: See team performance immediately after submission
- **🎨 Customizable**: Fully customizable guidelines and questions
- **Weekly Reminders**: Every Friday at 13:30 (configurable)
- **Creative Sliders**: 0-100% gradient sliders with accessibility features
- **Trend Analysis**: Historical data with charts and tables
- **Consent Receipt**: Detailed consent tracking with hash verification
- **Developer Tools**: Built-in debugging and testing capabilities
- **Offline Support**: JSON fallback when API is unavailable
- **De-duplication**: Prevents duplicate submissions per day
- **Accessibility**: ARIA support, keyboard navigation, reduced motion

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Chrome browser
- Team Guideline Pulse API running

### Development Setup

1. **Install dependencies**
   ```bash
   cd user-interface
   pnpm install
   ```

2. **Build extension**
   ```bash
   pnpm run build:dev
   ```

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

4. **Test the extension**
   - Click the extension icon in your toolbar
   - Fill out the guideline evaluation form
   - Submit and view team averages

### Production Build

```bash
pnpm run build:prod
```

The `dist/` folder contains the production-ready extension.

## Architecture

### Components

- **Popup**: Main UI with tabs for form, trends, and settings
- **CreativeSlider**: Accessible gradient slider component
- **Background Service**: Manages weekly alarms and notifications
- **Storage Service**: Chrome storage management
- **API Service**: Communication with backend

### Data Flow

1. **Extension loads** → Fetches guidelines from API
2. **User interacts** → Sliders update in real-time
3. **Form submission** → POST to API with evaluations
4. **Success** → View today's team averages
5. **Weekly reminder** → Background service triggers notification

## Configuration

### Settings Panel

- **Reminder Time**: Configure Friday reminder time (HH:MM)
- **Weekly Reminder**: Enable/disable automatic reminders
- **API URL**: Backend API endpoint
- **Admin Override**: Allow multiple submissions per day
- **Satisfying Feedback**: Enable confetti and sound effects

### Environment Variables

```bash
# Optional: API key for enhanced security
EXTENSION_API_KEY=your-api-key
```

## Usage

### Daily Workflow

1. **Friday reminder** appears at configured time
2. **Click notification** to open evaluation form
3. **Slide each guideline** to 0-100% based on adherence
4. **Submit form** to see team averages
5. **View trends** to track performance over time

### Slider Controls

- **Mouse/Touch**: Drag slider to desired value
- **Keyboard**: Arrow keys for ±1, Shift+Arrow for ±10
- **Snap zones**: Automatic snapping to 0, 25, 50, 75, 100
- **Visual feedback**: Color-coded gradient with emoji indicators

### Accessibility Features

- **ARIA labels**: Screen reader support
- **Keyboard navigation**: Full keyboard accessibility
- **High contrast**: Respects system contrast preferences
- **Reduced motion**: Respects motion preferences
- **Color blind support**: Multiple encoding methods

## Development

### Scripts

```bash
pnpm run build        # Production build
pnpm run build:dev    # Development build
pnpm run watch        # Watch mode for development
pnpm run lint         # Run ESLint
pnpm run type-check   # TypeScript type checking
```

### Project Structure

```
src/
├── components/        # UI components
│   ├── CreativeSlider.ts
│   └── Popup.ts
├── services/         # Business logic
│   ├── ApiService.ts
│   └── StorageService.ts
├── styles/           # CSS styles
│   └── popup.css
├── types/            # TypeScript definitions
│   └── index.ts
├── background.ts     # Service worker
└── popup.ts         # Main entry point
```

### Building

The extension uses Webpack to bundle:

- **popup.js**: Main popup interface
- **background.js**: Service worker
- **popup.html**: Popup HTML template
- **manifest.json**: Extension manifest
- **assets/**: Static assets and fallback data

## Testing

### Manual Testing

1. **Load extension** in Chrome
2. **Test form submission** with API running
3. **Test offline mode** by stopping API
4. **Verify notifications** and alarms
5. **Check accessibility** with screen readers

### Automated Testing

```bash
pnpm run test        # Run Jest tests
pnpm run test:watch  # Watch mode
```

## Deployment

### Chrome Web Store

1. **Build production version**
   ```bash
   pnpm run build:prod
   ```

2. **Create ZIP archive** of `dist/` folder
3. **Upload to Chrome Web Store** developer dashboard
4. **Submit for review**

### Private Distribution

1. **Build extension**
2. **Distribute `dist/` folder** to team members
3. **Load unpacked** in Chrome
4. **Update manifest** with your API endpoint

## Troubleshooting

### Common Issues

**Extension won't load**
- Check Chrome console for errors
- Verify manifest.json syntax
- Ensure all required files are present

**API connection fails**
- Verify API is running at configured URL
- Check CORS settings on backend
- Test API endpoint directly

**Reminders not working**
- Check notification permissions
- Verify alarm scheduling in background
- Check Chrome extension permissions

**Storage issues**
- Clear extension storage in Chrome
- Check storage quota limits
- Verify storage permissions

### Debug Mode

Enable debug logging:

1. **Open extension popup**
2. **Right-click and inspect**
3. **Check console for logs**
4. **Use Chrome DevTools** for debugging

## Contributing

1. **Follow existing patterns** for components and services
2. **Add accessibility features** for new UI elements
3. **Test with screen readers** and keyboard navigation
4. **Update documentation** for new features
5. **Ensure TypeScript types** are properly defined

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review Chrome extension documentation
3. Check API backend status
4. Review browser console for errors
