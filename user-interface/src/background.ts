import { StorageService } from './services/storage.service';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

class BackgroundService {
  private readonly ALARM_NAME = 'weekly-reminder';
  private readonly REMINDER_TIME = '13:30'; // Default Friday reminder time

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Production logging - only log errors and critical info
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Background: Initializing background service...');
    }
    
    try {
      // Initialize storage service first
      await StorageService.initialize();
      
      // Check and request notification permissions
      await this.ensureNotificationPermissions();
      
      // Set up alarm when extension is installed or updated
      await this.setupWeeklyAlarm();
      
      // Listen for alarm events
      chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
      
      // Listen for extension startup
      chrome.runtime.onStartup.addListener(() => {
        this.setupWeeklyAlarm();
      });
      
      // Listen for extension install
      chrome.runtime.onInstalled.addListener(() => {
        this.setupWeeklyAlarm();
      });
      
      // Listen for extension icon click to open in new tab
      chrome.action.onClicked.addListener(() => {
        this.openExtensionTab();
      });

      // Listen for messages from popup
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('📨 Background: Received message:', message);
        }
        
        if (message.action === 'testNotification') {
          this.triggerTestNotification();
          sendResponse({ success: true });
          return true;
        }
        
        if (message.action === 'ping') {
          sendResponse({ status: 'ready', timestamp: Date.now() });
          return true;
        }
        
        if (message.action === 'checkAlarmStatus') {
          this.checkAlarmStatus().then(status => {
            sendResponse(status);
          });
          return true;
        }

        if (message.action === 'updateAlarm') {
          this.setupWeeklyAlarm();
          sendResponse({ success: true });
          return true;
        }
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Background: Background service initialized successfully');
      }
    } catch (error) {
      console.error('❌ Background: Failed to initialize background service:', error);
      // In production, you might want to send this to an error tracking service
    }
  }

  // Ensure notification permissions are granted
  private async ensureNotificationPermissions(): Promise<void> {
    console.log('🔐 Background: Checking notification permissions...');
    
    try {
      // Check if we have permission to show notifications
      const permission = await chrome.permissions.contains({
        permissions: ['notifications']
      });
      
      if (!permission) {
        console.log('⚠️ Background: Notification permission not granted, requesting...');
        const granted = await chrome.permissions.request({
          permissions: ['notifications']
        });
        
        if (granted) {
          console.log('✅ Background: Notification permission granted');
        } else {
          console.error('❌ Background: Notification permission denied');
          throw new Error('Notification permission denied');
        }
      } else {
        console.log('✅ Background: Notification permission already granted');
      }
    } catch (error) {
      console.error('❌ Background: Failed to ensure notification permissions:', error);
      throw error;
    }
  }

  private async setupWeeklyAlarm() {
    console.log('🔔 Background: Setting up weekly alarm...');
    
    try {
      const settings = await StorageService.getSettings();
      console.log('📋 Background: Current settings:', {
        weeklyReminder: settings.weeklyReminder,
        reminderTime: settings.reminderTime,
        reminderDay: settings.reminderDay
      });
      
      if (!settings.weeklyReminder) {
        console.log('🔕 Background: Weekly reminders disabled, clearing alarm');
        await chrome.alarms.clear(this.ALARM_NAME);
        return;
      }

      // Clear existing alarm first
      await chrome.alarms.clear(this.ALARM_NAME);
      console.log('🗑️ Background: Cleared existing alarm');

      const reminderTime = settings.reminderTime || this.REMINDER_TIME;
      const [hours, minutes] = reminderTime.split(':').map(Number);
      console.log('⏰ Background: Parsed reminder time:', { hours, minutes });
      
      // Calculate next reminder time
      const nextReminderTime = this.calculateNextReminderTime(hours, minutes, settings.reminderDay || 5);
      console.log('📅 Background: Next reminder scheduled for:', nextReminderTime.toISOString());
      
      // Create the alarm with more specific timing
      await chrome.alarms.create(this.ALARM_NAME, {
        when: nextReminderTime.getTime(),
        periodInMinutes: 7 * 24 * 60, // Weekly
      });
      
      console.log('✅ Background: Weekly alarm created successfully');
      
      // List all alarms for verification
      const allAlarms = await chrome.alarms.getAll();
      console.log('📋 Background: All current alarms:', allAlarms);
      

      
    } catch (error) {
      console.error('❌ Background: Failed to setup weekly alarm:', error);
    }
  }

  private calculateNextReminderTime(hours: number, minutes: number, reminderDay: number | 'today'): Date {
    console.log('🧮 Background: Calculating next reminder time...');
    
    // Get current time in user's local timezone
    const now = dayjs();
    console.log('🕐 Background: Current local time:', now.format('YYYY-MM-DD HH:mm:ss'));
    console.log('📅 Background: Current local day:', now.day(), '(0=Sunday, 1=Monday, ..., 6=Saturday)');
    console.log('🎯 Background: Target reminder day:', reminderDay);
    console.log('⏰ Background: Target reminder time:', `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    
    let finalTime: dayjs.Dayjs;
    
    // Handle "today" option
    if (reminderDay === 'today') {
      console.log('🎯 Background: "Today" selected, scheduling for today');
      finalTime = now.hour(hours).minute(minutes).second(0).millisecond(0);
      
      // If the time has already passed today, schedule for tomorrow
      if (now.isAfter(finalTime)) {
        console.log('⏰ Background: Time has passed today, scheduling for tomorrow');
        finalTime = now.add(1, 'day').hour(hours).minute(minutes).second(0).millisecond(0);
      }
    } else {
      // Handle regular day of week (0-6)
      const dayNumber = typeof reminderDay === 'number' ? reminderDay : parseInt(reminderDay as string);
      
      // Get the next occurrence of the reminder day
      let nextReminderDay = now.day(dayNumber);
      console.log('📅 Background: Initial next reminder day:', nextReminderDay.format('YYYY-MM-DD HH:mm:ss'));
      
      // If today is the reminder day and it's past the reminder time, schedule for next week
      if (now.day() === dayNumber && now.isAfter(now.hour(hours).minute(minutes))) {
        console.log('⏰ Background: Today is reminder day but past time, scheduling for next week');
        nextReminderDay = nextReminderDay.add(1, 'week');
        console.log('📅 Background: Adjusted to next week:', nextReminderDay.format('YYYY-MM-DD HH:mm:ss'));
      } else {
        console.log('📅 Background: Scheduling for this week or future time today');
      }
      
      // Set the specific time in local timezone
      finalTime = nextReminderDay.hour(hours).minute(minutes).second(0).millisecond(0);
    }
    
    console.log('🎯 Background: Final scheduled time (Local):', finalTime.format('YYYY-MM-DD HH:mm:ss'));
    console.log('🎯 Background: Final scheduled time (UTC):', finalTime.utc().format('YYYY-MM-DD HH:mm:ss'));
    
    // Convert to UTC for Chrome alarms (Chrome expects UTC timestamps)
    const utcTime = finalTime.utc();
    console.log('🌐 Background: Chrome alarm will be set for UTC time:', utcTime.format('YYYY-MM-DD HH:mm:ss'));
    
    return utcTime.toDate();
  }

  private async handleAlarm(alarm: chrome.alarms.Alarm) {
    console.log('🔔 Background: Alarm triggered:', alarm.name, 'at', new Date().toISOString());
    
    if (alarm.name === this.ALARM_NAME) {
      console.log('📅 Background: Processing weekly reminder alarm');
      await this.showReminderNotification();
    }
  }

  private async showReminderNotification() {
    console.log('🔔 Background: Showing reminder notification...');
    
    try {
      // Check if user has already submitted today
      const lastSubmitted = await StorageService.getLastSubmittedDate();
      const today = dayjs().format('YYYY-MM-DD');
      
      console.log('📅 Background: Last submitted date:', lastSubmitted);
      console.log('📅 Background: Today:', today);
      
      if (lastSubmitted === today) {
        console.log('✅ Background: Already submitted today, skipping reminder');
        return;
      }

      console.log('🔔 Background: User has not submitted today, creating reminder notification');
      
      const notificationId = 'guideline-reminder';
      
      const notificationResult = await chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title: 'Team Guideline Pulse',
        message: 'Time to check in on our team guidelines! Click to open the form.',
        priority: 1,
        requireInteraction: true, // Make sure notification stays visible
        silent: false, // Ensure it makes a sound
      });
      
      console.log('✅ Background: Reminder notification created successfully:', notificationResult);
      
      // Set up click listener
      chrome.notifications.onClicked.addListener((id) => {
        if (id === notificationId) {
          console.log('🖱️ Background: Reminder notification clicked');
          this.openExtensionTab();
          chrome.notifications.clear(notificationId);
        }
      });
      
    } catch (error) {
      console.error('❌ Background: Failed to show reminder notification:', error);
    }
  }



  // Test notification method
  private async triggerTestNotification() {
    console.log('🧪 Background: Triggering test notification...');
    
    try {
      // Test 1: Try with minimal icon (1x1 pixel data URL)
      console.log('🧪 Background: Test 1 - Notification with minimal icon');
      const notificationId = 'guideline-reminder-test';
      const result = await chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        title: 'Team Guideline Pulse - Test',
        message: 'Test notification! The reminder system is working correctly.',
        priority: 2, // Higher priority
        requireInteraction: true, // Require user interaction
        silent: false, // Make sure it's not silent
      });

      console.log('✅ Background: Test notification (no icon) created successfully:', result);
      console.log('🔍 Background: Notification ID:', notificationId);
      console.log('🔍 Background: Notification result:', result);

      // Test 2: Try with data URL icon (embedded image)
      console.log('🧪 Background: Test 2 - Notification with data URL icon');
      const notificationId2 = 'guideline-reminder-test-2';
      const result2 = await chrome.notifications.create(notificationId2, {
        type: 'basic',
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        title: 'Test 2 - With Data URL Icon',
        message: 'Second test notification with embedded icon',
        priority: 1,
      });

      console.log('✅ Background: Second test notification (data URL icon) created:', result2);

      // Test 3: Try with runtime URL icon (debug the path)
      console.log('🧪 Background: Test 3 - Notification with runtime URL icon');
      const iconUrl = chrome.runtime.getURL('icons/icon48.png');
      console.log('🔍 Background: Icon URL:', iconUrl);
      console.log('🔍 Background: Runtime ID:', chrome.runtime.id);
      
      const notificationId3 = 'guideline-reminder-test-3';
      const result3 = await chrome.notifications.create(notificationId3, {
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Test 3 - With Runtime URL Icon',
        message: 'Third test notification with runtime URL icon',
        priority: 1,
      });

      console.log('✅ Background: Third test notification (runtime URL icon) created:', result3);

      // Set up click listeners for all notifications
      chrome.notifications.onClicked.addListener((id) => {
        console.log('🖱️ Background: Test notification clicked:', id);
        if (id === notificationId || id === notificationId2 || id === notificationId3) {
          console.log('🔄 Background: Opening extension from notification click');
          this.openExtensionTab();
          chrome.notifications.clear(id);
          console.log('🧹 Background: Notification cleared:', id);
        }
      });

      console.log('🎯 Background: All three test notifications should now be visible');
      console.log('💡 Background: If you still don\'t see them, check Chrome notification settings');
      
    } catch (error) {
      console.error('❌ Background: Failed to create test notification:', error);
      if (error instanceof Error) {
        console.error('❌ Background: Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      } else {
        console.error('❌ Background: Unknown error type:', error);
      }
    }
  }

  // Check alarm status
  public async checkAlarmStatus() {
    try {
      const allAlarms = await chrome.alarms.getAll();
      const settings = await StorageService.getSettings();
      const now = dayjs().utc();
      const nowLocal = dayjs();
      
      return {
        alarms: allAlarms,
        settings: {
          weeklyReminder: settings.weeklyReminder,
          reminderTime: settings.reminderTime,
          reminderDay: settings.reminderDay
        },
        currentTime: {
          utc: now.format('YYYY-MM-DD HH:mm:ss'),
          local: nowLocal.format('YYYY-MM-DD HH:mm:ss')
        },
        currentDay: {
          utc: now.day(),
          local: nowLocal.day()
        },
        permissions: {
          notifications: await chrome.permissions.contains({ permissions: ['notifications'] })
        }
      };
    } catch (error) {
      console.error('❌ Background: Error checking alarm status:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private openExtensionTab() {
    console.log('🔄 Background: Opening extension in new tab');
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html'),
      active: true
    });
  }

}

// Initialize background service
const backgroundService = new BackgroundService();
