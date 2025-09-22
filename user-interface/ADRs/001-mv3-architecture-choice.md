# ADR 001: Chrome Extension MV3 Architecture Choice

## Status

Accepted

## Context

We need to choose the manifest version for our Chrome Extension that provides:
- Modern Chrome extension capabilities
- Service worker support for background tasks
- Weekly alarm scheduling
- Notification management
- Storage and permissions handling
- Future compatibility and security

## Decision

We chose **Manifest V3 (MV3)** as our Chrome extension architecture.

## Consequences

### Positive

- **Future-Proof**: MV3 is the current standard and future direction
- **Service Workers**: Modern background script architecture
- **Security**: Enhanced security model with CSP
- **Performance**: Better performance and resource management
- **Chrome Web Store**: Full support and promotion
- **Modern APIs**: Access to latest Chrome extension APIs
- **Long-term Support**: Google's long-term commitment

### Negative

- **Migration Complexity**: More complex than MV2 for background scripts
- **Learning Curve**: Service worker patterns differ from background pages
- **Debugging**: More complex debugging for service workers
- **State Management**: Service workers are stateless and can be terminated
- **Browser Support**: Limited to Chrome 88+ (but covers our target audience)

### Alternatives Considered

1. **Manifest V2 (MV2)**
   - Pros: Simpler background pages, familiar patterns
   - Cons: Deprecated, limited Chrome Web Store support, security concerns

2. **Web App Approach**
   - Pros: Cross-platform, modern web standards
   - Cons: No Chrome integration, limited background capabilities

3. **Hybrid Approach**
   - Pros: Best of both worlds
   - Cons: Increased complexity, maintenance overhead

## Implementation

### Service Worker Architecture

```typescript
// background.ts - Service Worker
class BackgroundService {
  private readonly ALARM_NAME = 'weekly-reminder';
  
  constructor() {
    this.initialize();
  }
  
  private async initialize() {
    // Set up alarm when extension is installed
    await this.setupWeeklyAlarm();
    
    // Listen for alarm events
    chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
    
    // Listen for extension startup
    chrome.runtime.onStartup.addListener(() => {
      this.setupWeeklyAlarm();
    });
  }
  
  private async setupWeeklyAlarm() {
    // Calculate next Friday at configured time
    const nextFriday = this.getNextFriday();
    
    await chrome.alarms.create(this.ALARM_NAME, {
      when: nextFriday.getTime(),
      periodInMinutes: 7 * 24 * 60, // Weekly
    });
  }
}
```

### Key MV3 Features Used

1. **Service Workers**: Background script replacement
2. **Chrome Alarms API**: Weekly reminder scheduling
3. **Chrome Storage API**: Persistent data storage
4. **Chrome Notifications API**: User notifications
5. **Manifest Permissions**: Minimal required permissions

### Permission Strategy

```json
{
  "permissions": [
    "storage",      // Data persistence
    "alarms",       // Weekly reminders
    "notifications" // User notifications
  ],
  "host_permissions": [
    "http://localhost:3000/*"  // API communication
  ]
}
```

### State Management

- **Chrome Storage**: Persistent configuration and data
- **Service Worker Events**: Handle extension lifecycle
- **Alarm Persistence**: Automatic alarm restoration
- **Cache Strategy**: Guidelines fallback for offline use

## Migration Considerations

### From MV2 (if applicable)

1. **Background Scripts**: Convert to service workers
2. **Persistent Background**: Handle service worker termination
3. **Message Passing**: Update communication patterns
4. **Storage**: Migrate from chrome.storage.sync if needed

### Compatibility

- **Chrome 88+**: Full MV3 support
- **Chrome Web Store**: Automatic promotion and features
- **Enterprise**: Compatible with enterprise policies

## Testing Strategy

### Service Worker Testing

1. **Installation**: Verify alarm setup on install
2. **Alarm Events**: Test weekly reminder triggers
3. **State Persistence**: Verify storage across restarts
4. **Background Lifecycle**: Test service worker termination

### Browser Compatibility

1. **Chrome 88+**: Full functionality
2. **Chrome 90+**: Enhanced features
3. **Chrome 100+**: Latest optimizations

## References

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Chrome Alarms API](https://developer.chrome.com/docs/extensions/reference/alarms/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [MV3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/migrating/)
