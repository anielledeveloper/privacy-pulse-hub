# PrivacyPulse Hub - User Guide

**Version:** 1.0.0  
**Last Updated:** 2025-09-02

## 📖 **Overview**

PrivacyPulse Hub is an anonymous Chrome extension designed for customizable pulse surveys, team collaboration, and data collection. The extension provides a user-friendly interface for evaluating various topics (happiness, coding practices, research data, etc.) with privacy-first design, anonymous participation, and standalone capabilities.

### **🔒 Two Operating Modes**

#### **Standalone Mode (Default)**
- **Data Storage**: All your evaluations are stored locally on your device
- **No Network Calls**: The extension works entirely offline
- **Personal Trends**: View your own progress over time
- **Privacy**: Your data never leaves your device
- **Zero Infrastructure**: No backend required for basic functionality

#### **External Sharing Mode (Optional)**
- **Team Insights**: Contribute to team-wide aggregate data anonymously
- **Consent Required**: Explicit permission needed before any data sharing
- **No IP Collection**: We never collect or store your IP address
- **Anonymous Participation**: Your identity is never revealed
- **Withdrawable**: You can withdraw consent anytime

## 🚀 **Getting Started**

### **Installation**
1. **Download**: Install from the Chrome Web Store
2. **Pin Extension**: Click the extension icon in your browser toolbar
3. **First Launch**: The extension will open in a new tab

### **Initial Setup**
1. **Device ID**: A unique identifier is automatically generated on your device
2. **Default Settings**: 
   - Reminder: Every Friday at 1:30 PM
   - Mode: Local-only (no external sharing)
   - Notifications: Enabled

### **Opening the Extension**
- **Click the extension icon** in your browser toolbar
- **Or use keyboard shortcut**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)

## 🔄 **Example User Flows**

### **👤 New User Flow (Standalone Mode)**

1. **First Launch**
   - Extension opens → automatic device ID generation
   - Default settings: Friday 1:30 PM reminders, standalone mode
   - Guidelines tab shows default pulse survey questions

2. **First Evaluation**
   - User rates each guideline using 0-100% sliders
   - Clicks "Submit Evaluations" → data saved locally
   - Success message → automatically switches to trends tab
   - Trends show: "No local trend data available. Submit some evaluations to see your personal trends."

3. **Subsequent Weeks**
   - Weekly reminder notification appears
   - User completes evaluations → data accumulates locally
   - Trends tab shows personal progress over time
   - All data remains on device, no external sharing
   - Extension works completely independently

### **🌐 User Enabling External Sharing**

1. **Enabling Team Insights**
   - User goes to Settings tab → checks "Send data to external API"
   - Consent modal appears with detailed privacy information
   - User reads and checks "I understand and agree" checkbox
   - Clicks "I Agree & Enable Sharing"

2. **After Consent**
   - Consent receipt appears in Settings
   - API calls now include device ID for consent validation
   - Guidelines tab fetches from team API
   - Trends tab shows team-wide data + personal data

3. **Data Sharing**
   - Evaluations sent to team backend
   - Team insights and averages available
   - Personal data remains anonymous in team context

### **🔒 User Withdrawing Consent**

1. **Withdrawal Process**
   - User goes to Settings → finds consent receipt
   - Clicks "Withdraw Consent" → confirmation dialog
   - Confirms withdrawal → external sharing immediately disabled

2. **After Withdrawal**
   - Extension automatically switches to standalone mode
   - All personal data remains accessible
   - Trends show local data only
   - No new data sent to external APIs

3. **Standalone Mode Continuation**
   - Extension works exactly as before
   - Weekly evaluations continue locally
   - Personal trends and history preserved
   - Can re-enable sharing anytime

### **📱 Multi-Device Usage**

1. **Device A (With Consent)**
   - User enables external sharing
   - Evaluations contribute to team insights
   - Team trends and data available

2. **Device B (No Consent)**
   - Extension works in standalone mode
   - Personal evaluations stored locally
   - No team data access
   - Independent from Device A

3. **Data Independence**
   - Each device maintains separate data
   - Consent status device-specific
   - No cross-device data synchronization

### **🔄 Error Handling & Fallbacks**

1. **API Unavailable (With Consent)**
   - Extension attempts API call
   - If API fails → automatically falls back to local data
   - User sees local trends instead of error message
   - Seamless experience maintained

2. **Network Issues**
   - Extension detects connectivity problems
   - Switches to offline mode automatically
   - Local data remains fully accessible
   - Resumes API calls when connection restored

3. **Consent Validation Errors**
   - Backend validates consent before processing
   - Invalid consent → returns 401 error
   - Extension shows local data instead
   - User prompted to check consent status

### **📊 Data Lifecycle Examples**

#### **Personal Evaluation Journey**
```
Week 1: Submit → Saved locally → No trends yet
Week 2: Submit → Saved locally → 2-week trend visible
Week 3: Submit → Saved locally → 3-week trend visible
Week 4: Enable consent → Submit → Sent to API + saved locally
Week 5: Submit → Sent to API + saved locally → Team insights available
```

#### **Consent Withdrawal Journey**
```
Week 10: Withdraw consent → External sharing disabled
Week 11: Submit → Saved locally only → Team insights no longer available
Week 12: Submit → Saved locally only → Personal trends continue
Week 13: Re-enable consent → External sharing restored
Week 14: Submit → Sent to API + saved locally → Team insights restored
```

### **🎯 Best Practices for Users**

1. **Start Local**: Begin with local-only mode to understand the extension
2. **Regular Use**: Complete evaluations weekly for meaningful trends
3. **Consent Decision**: Enable external sharing only when comfortable
4. **Data Backup**: Export your data regularly
5. **Privacy Control**: Withdraw consent anytime without data loss

## ⏰ **Weekly Reminder System**

### **Default Schedule**
- **Day**: Friday (configurable)
- **Time**: 1:30 PM (configurable)
- **Frequency**: Weekly

### **Customizing Reminders**
1. **Open Settings**: Click the ⚙️ tab
2. **Reminder Day**: Choose from Sunday-Saturday or "Today"
3. **Reminder Time**: Set your preferred time (24-hour format)
4. **Enable/Disable**: Toggle weekly reminders on/off

### **"Today" Option**
- **Immediate Scheduling**: Get a reminder today at the specified time
- **Smart Logic**: If the time has passed, schedules for tomorrow
- **Testing**: Perfect for testing the notification system

### **Notification Types**
- **Desktop Notifications**: Appear even when the browser is closed
- **Sound**: Optional audio alerts
- **Interaction**: Click to open the extension

## 📝 **Completing the Form**

### **Guideline Evaluation Process**
1. **Read Guidelines**: Review each guideline carefully
2. **Rate Performance**: Use the 0-100% slider for each guideline
3. **Submit**: Click "Submit Evaluations" when complete

### **Creative Slider Features**
- **Visual Feedback**: Red → Amber → Green color progression
- **Descriptors**: 
  - 0-20%: "Rarely"
  - 21-40%: "Sometimes"
  - 41-60%: "Often"
  - 61-80%: "Usually"
  - 81-100%: "Always"
- **Micro-interactions**: Smooth animations and visual feedback
- **Accessibility**: Keyboard navigation and screen reader support

### **Submission Process**
- **Daily Limit**: One submission per day (prevents duplicates)
- **Validation**: All guidelines must be rated before submission
- **Confirmation**: Success message and automatic switch to trends view

## 📊 **Trends & Analytics**

### **Local-Only Mode Trends**
- **Personal History**: View your own evaluation history
- **Progress Tracking**: See how your ratings change over time
- **Time Periods**: Choose from 7, 30, 90, or 365 days
- **Visual Charts**: Bar charts and trend lines for easy analysis

### **External Sharing Mode Trends**
- **Team Averages**: Compare your ratings with team performance
- **Personal vs. Team**: Side-by-side comparison views
- **Historical Data**: Access to team-wide historical trends
- **Anonymous Participation**: Individual responses remain completely anonymous

### **Data Export**
- **JSON Format**: Download your complete evaluation history
- **Backup**: Keep a copy of your data for external analysis

## 🔒 **Privacy & Consent Management**

### **What We Collect (Standalone Mode)**
- **Pulse Survey Responses**: Your 0-100% ratings
- **Submission Dates**: When you completed evaluations
- **Settings**: Your preferences and configurations
- **Device ID**: Random UUID for local storage management

### **What We Collect (External Mode)**
- **Pulse Survey Responses**: Your 0-100% ratings
- **Device ID**: Random UUID (not your IP address)
- **Submission Timestamp**: When you completed the evaluation
- **Consent Evidence**: Proof of your agreement to share

### **What We NEVER Collect**
- **IP Addresses**: We do not collect or store your IP address
- **Personal Information**: No names, emails, or identifying details
- **Browsing History**: We only access data you explicitly submit
- **Location Data**: No geographic information is collected
- **Identity Data**: Your participation is completely anonymous

### **Consent Process**
1. **Toggle External Sharing**: Check "Send data to external API" in Settings
2. **Consent Modal**: Review what will be shared and what won't
3. **Explicit Agreement**: Check "I understand and agree" checkbox
4. **Activation**: Click "I Agree & Enable Sharing"

### **Consent Receipt**
- **Version**: Current consent agreement version
- **Agreement Date**: When you gave consent
- **Status**: Active or withdrawn
- **Consent Hash**: SHA-256 cryptographic hash for verification
- **API URL**: Current backend endpoint for data sharing
- **Withdrawal**: Option to withdraw consent anytime

### **Withdrawing Consent**
1. **Settings Tab**: Open the ⚙️ tab
2. **Consent Receipt**: Find the consent information section
3. **Withdraw Button**: Click "Withdraw Consent"
4. **Confirmation**: External sharing is immediately disabled

## ⚙️ **Settings & Configuration**

The Settings tab is organized into logical sections for better usability:

### **📅 Reminder Settings**
- **Day Selection**: Choose reminder day (Sunday-Saturday or Today)
- **Time Selection**: Set reminder time (24-hour format)
- **Enable Weekly Reminder**: Toggle weekly reminders on/off

### **🎨 User Experience**
- **Satisfying Feedback**: Enable confetti and sound effects for submissions

### **📡 Data Sharing**
- **Show Advanced Options**: Reveal API configuration options
- **API URL**: Configure your team's backend endpoint (when advanced options enabled)
- **Send Data to External API**: Enable/disable team data sharing (when advanced options enabled)
- **Consent Management**: View and manage consent status with detailed receipt

### **🛠️ Developer Tools**
- **Developer Mode**: Show advanced debugging and testing options
- **Test Notification**: Send test notifications for verification (when developer mode enabled)
- **Debug Storage**: View and manage local storage data (when developer mode enabled)
- **Check Alarm Status**: Check current alarm configuration (when developer mode enabled)

### **💾 Data Management**
- **Export Local Data**: Download your complete evaluation history as JSON
- **Clear All Data**: Remove all local data and reset extension (requires confirmation)

## 🛠️ **Troubleshooting & FAQ**

### **Common Issues**

#### **Notifications Not Appearing**
- **Check Permissions**: Ensure notifications are allowed in Chrome
- **Browser Settings**: Verify Chrome notification settings
- **Extension Status**: Check if the extension is enabled
- **Time Settings**: Verify reminder day and time configuration

#### **Form Won't Submit**
- **Daily Limit**: You can only submit once per day
- **Validation**: Ensure all guidelines are rated (0-100%)
- **Extension Status**: Check if the extension is working properly

#### **Data Not Syncing**
- **Network Connection**: Verify internet connectivity
- **API Configuration**: Check API URL in developer settings
- **Consent Status**: Ensure external sharing is enabled
- **Server Status**: Verify your team's backend is running

### **Frequently Asked Questions**

#### **Q: Can I use the extension offline?**
A: Yes! The extension works entirely offline in standalone mode. All data is stored locally on your device with zero infrastructure requirements.

#### **Q: What happens if I withdraw consent?**
A: External sharing is immediately disabled. Your data stays local, and no new data is sent to external APIs.

#### **Q: Can I export my data?**
A: Yes! Use the "Export Local Data" button in Settings to download your complete evaluation history as JSON.

#### **Q: How do I change my reminder schedule?**
A: Go to Settings → Reminder Day/Time to customize when you receive notifications.

#### **Q: Is my data secure?**
A: Yes! We never collect IP addresses, your participation is completely anonymous, and all data is stored securely using Chrome's built-in security.

#### **Q: Can I use this on multiple devices?**
A: Each device generates its own unique identifier. For team insights, you'll need to enable external sharing on each device. Each device operates independently in standalone mode.

## 📱 **Data Management**

### **Local Data Storage**
- **Chrome Storage**: Uses Chrome's secure local storage API
- **Data Types**: Settings, evaluations, guidelines, consent information
- **Persistence**: Data remains until extension uninstallation

### **Data Export**
- **Format**: JSON file with complete evaluation history
- **Filename**: `guideline-pulse-data-YYYY-MM-DD.json`
- **Contents**: All local data including settings and evaluations

### **Data Clearing**
- **Complete Reset**: Remove all local data and settings
- **Confirmation**: Requires explicit confirmation before clearing
- **Irreversible**: Cleared data cannot be recovered
- **Extension Restart**: Automatically reloads after clearing

### **Backup Recommendations**
- **Regular Exports**: Export data monthly for backup
- **Multiple Locations**: Store backups in different locations
- **Version Control**: Keep track of exported data versions

## 🔧 **Advanced Features**

### **Developer Mode**
- **Advanced Settings**: Access to technical configuration options
- **API Testing**: Test notification and alarm systems
- **Debug Information**: View system status and configuration
- **Storage Management**: Debug and manage local storage data
- **Alarm Status**: Check current alarm configuration

### **API Integration**
- **Custom Endpoints**: Configure your team's backend API
- **Authentication**: Support for API keys and authentication
- **Data Formats**: Standardized JSON data exchange

### **Performance Optimization**
- **Efficient Storage**: Optimized data storage and retrieval
- **Background Processing**: Minimal impact on browser performance
- **Memory Management**: Efficient memory usage and cleanup

## 📚 **Changelog**

### **Version 1.0.0** - 2025-01-02
- **Initial Release**: Core functionality and standalone mode
- **Standalone Mode**: Extension works independently without API backend
- **Consent Management**: Comprehensive consent system with SHA-256 hashing
- **Privacy Controls**: Standalone and external sharing modes with explicit consent
- **Data Validation**: Backend validation of consent text and hash matching
- **User Interface**: Modern, accessible design with organized settings
- **Notification System**: Configurable weekly reminders
- **Data Export**: Complete data export functionality
- **Developer Tools**: Built-in debugging and testing capabilities
- **Enhanced Consent Receipt**: Detailed consent tracking with hash verification and API URL display

## 📄 **Third-Party Licenses**

This extension uses the following third-party libraries:

- **dayjs**: Date manipulation library (MIT License)
- **uuid**: UUID generation (MIT License)
- **Chrome Extensions API**: Google Chrome browser APIs

For complete license information, see `THIRD_PARTY_LICENSES.md`.

## 🆘 **Support & Contact**

### **Getting Help**
1. **User Guide**: This document contains most answers
2. **Settings**: Check configuration in the ⚙️ tab
3. **Developer Options**: Enable developer mode for advanced troubleshooting

### **Contact Information**
- **GitHub**: [http://localhost:3000](http://localhost:3000)
- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: Additional resources available in the repository

### **Privacy Concerns**
- **Data Questions**: Review our Privacy Policy
- **Consent Issues**: Check consent status in Settings
- **Withdrawal**: Use the withdraw consent option in Settings

## 🎯 **Best Practices**

### **For Users**
- **Regular Evaluations**: Complete evaluations weekly for best insights
- **Honest Ratings**: Provide accurate assessments for meaningful trends
- **Data Backup**: Export your data regularly
- **Privacy Awareness**: Understand what data is shared and when
- **Standalone Usage**: Start with standalone mode to understand the extension
- **Developer Tools**: Use developer mode for troubleshooting and testing

### **For Teams**
- **Pulse Survey Review**: Regularly review and update team pulse survey questions
- **Data Analysis**: Use aggregate data to identify improvement areas
- **Privacy Respect**: Never attempt to identify individual responses
- **Consent Management**: Ensure all team members understand consent
- **API Configuration**: Set up backend for team collaboration features

---

**Thank you for using PrivacyPulse Hub!** 🎉

This extension is designed with privacy and user control at its core. Whether you choose to use it in standalone mode or contribute to team insights, your data security and privacy are our top priorities.

*For the latest updates and support, visit our GitHub repository.*
