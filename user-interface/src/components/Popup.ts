import { CreativeSlider } from './CreativeSlider';
import { ApiService } from '../services/api.service';
import { StorageService } from '../services/storage.service';
import { Guideline, Evaluation, CreateEvaluationRequest, ConsentEvidence } from '../types';
import { ConsentModal } from './ConsentModal';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export class Popup {
  private container: HTMLElement;
  private apiService!: ApiService;
  private sliders: CreativeSlider[] = [];
  private guidelines: Guideline[] = [];
  private currentTab: 'form' | 'trends' | 'settings' = 'form';
  private currentTimeInterval?: NodeJS.Timeout;
  private consentModal: ConsentModal | null = null;
  private readonly CONSENT_VERSION = '1.0.0';

  constructor(container: HTMLElement) {
    this.container = container;
    this.initialize();
  }

  private async initialize() {
    // Initialize storage service first to ensure deviceId is generated
    await StorageService.initialize();
    
    await this.setupServices();
    await this.checkSubmissionStatus();
    await this.loadGuidelines();
    this.createUI();
    this.setupEventListeners();
  }

  private async setupServices() {
    const settings = await StorageService.getSettings();
    this.apiService = new ApiService(settings.apiUrl);
  }

  private async checkSubmissionStatus() {
    const lastSubmitted = await StorageService.getLastSubmittedDate();
    const today = dayjs().format('YYYY-MM-DD');
    
    if (lastSubmitted === today) {
      // Already submitted today, show trends view
      this.currentTab = 'trends';
    }
  }

  private async loadGuidelines() {
    try {
      // Check if user has consented to external data sharing
      const consentEvidence = await StorageService.getConsentEvidence();
      if (!consentEvidence || consentEvidence.withdrawnAt) {
        // No consent, use cached or fallback guidelines
        console.log('No consent for external data sharing, using cached guidelines');
        const cached = await StorageService.getCachedGuidelines();
        if (cached) {
          this.guidelines = cached;
        } else {
          this.guidelines = await this.loadFallbackGuidelines();
        }
        return;
      }

      // Try API first
      this.guidelines = await this.apiService.getGuidelines();
      await StorageService.cacheGuidelines(this.guidelines);
    } catch (error) {
      console.log('API unavailable or consent error, using cached guidelines:', error);
      const cached = await StorageService.getCachedGuidelines();
      if (cached) {
        this.guidelines = cached;
      } else {
        // Fallback to bundled guidelines
        this.guidelines = await this.loadFallbackGuidelines();
      }
    }
  }

  private async loadFallbackGuidelines(): Promise<Guideline[]> {
    // This would load from assets/guidelines.json
    // For now, return a default set
    return [
      { id: 'g-001', text: 'We write E2E tests for critical flows.' },
      { id: 'g-002', text: 'We perform code reviews within one business day.' },
      { id: 'g-003', text: 'We keep PRs small and focused.' },
      { id: 'g-004', text: 'We document architectural decisions (ADRs).' },
      { id: 'g-005', text: 'We monitor and alert for critical paths.' },
      { id: 'g-006', text: 'We maintain accessibility in UI changes.' },
    ];
  }

  private createUI() {
    this.container.innerHTML = `
      <div class="popup-container">
        <header class="popup-header">
          <h1 class="popup-title">Team Guideline Pulse</h1>
          <div class="popup-intro">
            Every Friday after lunch, we check how closely our team lives our guidelines. 
            Slide each bar to reflect how much the guideline is applied in your day-to-day work (0–100%). 
            After submitting, you'll see today's averages and trends over time.
          </div>
          <div class="tab-navigation">
            <button class="tab-button active" data-tab="form">Form</button>
            <button class="tab-button" data-tab="trends">Trends</button>
            <button class="tab-button" data-tab="settings">⚙️</button>
          </div>
        </header>
        
        <main class="popup-content">
          <div class="tab-content" id="form-tab">
            <div class="guidelines-container"></div>
            <div class="submit-section">
              <button class="submit-button" id="submit-btn">Submit Evaluations</button>
              <div class="submit-status" id="submit-status"></div>
            </div>
          </div>
          
          <div class="tab-content hidden" id="trends-tab">
            <div class="trends-container">
              <div class="trends-header">
                <h3>Team Performance Trends</h3>
                <select id="trends-period">
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30" selected>Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>
              <div class="trends-chart" id="trends-chart"></div>
              <div class="trends-table" id="trends-table"></div>
            </div>
          </div>
          
          <div class="tab-content hidden" id="settings-tab">
            <div class="settings-container">
              <h3>Settings</h3>
              
              <!-- Reminder Settings Section -->
              <div class="config-section">
                <h3 class="section-title">⏰ Reminder Settings</h3>
                <div class="section-content">
                  <div class="setting-group">
                    <label for="reminder-day">Reminder Day:</label>
                    <div class="next-notification-display" id="next-notification-display" style="display: none;">
                      <span class="next-notification-label">Next Notification:</span>
                      <span class="next-notification-value" id="next-notification-time">Calculating...</span>
                      <span class="next-notification-zone">Local time</span>
                    </div>
                    <select id="reminder-day">
                      <option value="today">Today</option>
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                    </select>
                    <small>Choose which day of the week to receive reminders, or select "Today" for immediate scheduling</small>
                  </div>
                  
                  <div class="setting-group">
                    <label for="reminder-time">Reminder Time:</label>
                    <input type="time" id="reminder-time" value="13:30">
                  </div>
                  
                  <div class="setting-group">
                    <label>
                      <input type="checkbox" id="weekly-reminder" checked>
                      Enable weekly reminder
                    </label>
                  </div>
                </div>
              </div>

              <!-- User Experience Section -->
              <div class="config-section">
                <h3 class="section-title">🎨 User Experience</h3>
                <div class="section-content">
                  <div class="setting-group">
                    <label>
                      <input type="checkbox" id="satisfying-feedback">
                      Satisfying feedback (confetti & sound)
                    </label>
                    <small>Show confetti animation and play sound when completing evaluations</small>
                  </div>
                </div>
              </div>

              <!-- Data Sharing Section -->
              <div class="config-section">
                <h3 class="section-title">📊 Data Sharing</h3>
                <div class="section-content">
                  <div class="setting-group">
                    <label>
                      <input type="checkbox" id="developer-mode">
                      Show advanced options
                    </label>
                    <small>Enable advanced configuration options for API integration</small>
                  </div>
                  
                  <!-- Advanced options (nested inside the container) -->
                  <div class="advanced-options-container developer-only" id="advanced-options" style="display: none;">
                    <div class="setting-group" id="api-url-group">
                      <label for="api-url">API URL:</label>
                      <input type="url" id="api-url" value="http://localhost:3000">
                      <small>Custom API endpoint for data submission</small>
                    </div>
                    
                    <div class="setting-group" id="external-api-group">
                      <label>
                        <input type="checkbox" id="external-api-toggle">
                        Send data to external API (team insights)
                      </label>
                      <small>Share your evaluations with your team for aggregate insights. Requires consent.</small>
                    </div>
                  </div>
                  
                  <div class="consent-receipt" id="consent-receipt" style="display: none;">
                    <!-- Consent receipt will be populated here -->
                  </div>
                </div>
              </div>

              <!-- Developer Tools Section -->
              <div class="config-section">
                <h3 class="section-title">🛠️ Developer Tools</h3>
                <div class="section-content">
                  <div class="setting-group">
                    <label>
                      <input type="checkbox" id="developer-mode-debug">
                      Enable Developer Mode
                    </label>
                    <small>Show debugging and testing tools for developers</small>
                  </div>
                  
                  <!-- Developer Mode options (only shown when "Developer Mode" is checked) -->
                  <div class="developer-tools-container developer-debug-only" id="developer-tools" style="display: none;">
                    <div class="setting-group" id="developer-options">
                      <button class="test-notification-btn" id="test-notification-btn" type="button">
                        🔔 Test Notification
                      </button>
                      <small>Send a test notification to verify the reminder system is working</small>
                    </div>
                    
                    <div class="setting-group" id="developer-options-2">
                      <button class="check-alarm-btn" id="check-alarm-btn" type="button">
                        🔍 Check Alarm Status
                      </button>
                      <small>Check current alarm configuration and timing</small>
                    </div>
                    
                    <div class="setting-group" id="developer-options-3">
                      <button class="debug-storage-btn" id="debug-storage-btn" type="button">
                        🔍 Debug Storage
                      </button>
                      <small>Inspect local storage contents in console</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Data Management Section -->
              <div class="config-section">
                <h3 class="section-title">💾 Data Management</h3>
                <div class="section-content">
                  <div class="setting-group data-management">
                    <button class="btn btn-secondary" id="export-data-btn" type="button">
                      📤 Export Local Data
                    </button>
                    <button class="btn btn-danger" id="clear-data-btn" type="button">
                      🗑️ Clear Local Data
                    </button>
                    <small>Export your data or clear all local storage. External data cannot be cleared.</small>
                  </div>
                </div>
              </div>
              
              <button class="save-settings-btn" id="save-settings-btn">Save Settings</button>
            </div>
          </div>
        </main>
      </div>
    `;

    this.renderCurrentTab();
  }

  private renderCurrentTab() {
    // No time interval to clear since we removed current time display

    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.add('hidden');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });

    // Show current tab
    const activeTab = document.getElementById(`${this.currentTab}-tab`);
    const activeButton = document.querySelector(`[data-tab="${this.currentTab}"]`);
    
    if (activeTab) activeTab.classList.remove('hidden');
    if (activeButton) activeButton.classList.add('active');

    // Render tab content
    switch (this.currentTab) {
      case 'form':
        this.renderFormTab();
        break;
      case 'trends':
        this.renderTrendsTab();
        break;
      case 'settings':
        this.renderSettingsTab();
        break;
    }
  }

  private renderFormTab() {
    const container = document.querySelector('.guidelines-container') as HTMLElement;
    if (!container) return;

    container.innerHTML = '';
    this.sliders = [];

    this.guidelines.forEach(guideline => {
      const slider = new CreativeSlider(
        container,
        guideline,
        0,
        (value: number) => this.onSliderValueChange(guideline.id, value)
      );
      this.sliders.push(slider);
    });

    this.updateProgressHeader();
  }

  private renderTrendsTab() {
    this.loadTrendsData();
  }

  private renderSettingsTab() {
    console.log('🔄 Popup: renderSettingsTab called');
    this.loadSettings();
    
    // Use a small delay to ensure DOM is fully rendered
    setTimeout(() => {
      console.log('🧮 Popup: Calling updateNextNotificationTime after delay');
      this.updateNextNotificationTime();
    }, 100);
  }

  private updateProgressHeader() {
    const answered = this.sliders.filter(slider => slider.getValue() > 0).length;
    const total = this.sliders.length;
    
    const header = document.querySelector('.popup-header') as HTMLElement;
    if (header) {
      const progress = header.querySelector('.progress-header') as HTMLElement;
      if (progress) {
        progress.textContent = `${answered} of ${total} answered`;
      }
    }
  }

  private onSliderValueChange(guidelineId: string, value: number) {
    this.updateProgressHeader();
  }

  private setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tab = (e.target as HTMLElement).getAttribute('data-tab');
        if (tab) {
          this.currentTab = tab as any;
          this.renderCurrentTab();
        }
      });
    });

    // Submit button
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleSubmit());
    }

    // Settings save
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveSettings());
    }

    // Test notification
    const testNotificationBtn = document.getElementById('test-notification-btn');
    if (testNotificationBtn) {
      testNotificationBtn.addEventListener('click', () => this.testNotification());
    }

    // Check alarm status
    const checkAlarmBtn = document.getElementById('check-alarm-btn');
    if (checkAlarmBtn) {
      checkAlarmBtn.addEventListener('click', () => this.checkAlarmStatus());
    }

    // Debug storage
    const debugStorageBtn = document.getElementById('debug-storage-btn');
    if (debugStorageBtn) {
      debugStorageBtn.addEventListener('click', () => this.debugStorage());
    }
    
    // Developer mode toggle (Show advanced options)
    const developerModeCheckbox = document.getElementById('developer-mode');
    if (developerModeCheckbox) {
      developerModeCheckbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.toggleDeveloperOptions(target.checked);
      });
    }
    
    // Developer Mode Debug toggle (Test Notification, Debug Storage, Check Alarm Status)
    const developerModeDebugCheckbox = document.getElementById('developer-mode-debug');
    if (developerModeDebugCheckbox) {
      developerModeDebugCheckbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.toggleDeveloperDebugOptions(target.checked);
      });
    }

    // Trends period change
    const trendsPeriod = document.getElementById('trends-period');
    if (trendsPeriod) {
      trendsPeriod.addEventListener('change', () => this.loadTrendsData());
    }

    // External API toggle
    const externalApiToggle = document.getElementById('external-api-toggle');
    if (externalApiToggle) {
      externalApiToggle.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.handleExternalApiToggle(target.checked);
      });
    }

    // Export data button
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => this.exportLocalData());
    }

    // Clear data button
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => this.clearLocalData());
    }
  }

  private async handleSubmit() {
    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    const statusDiv = document.getElementById('submit-status');
    
    if (!submitBtn || !statusDiv) return;

    submitBtn.disabled = true;
    statusDiv.textContent = 'Submitting...';

    try {
      const deviceId = await StorageService.getDeviceId();
      console.log('🔧 Popup: Retrieved deviceId:', deviceId);
      
      const evaluations: Evaluation[] = this.sliders.map(slider => ({
        guidelineId: slider.guidelineId,
        percentage: slider.getValue(),
      }));

      // Check if external sharing is enabled and get consent information
      const settings = await StorageService.getSettings();
      let consentVersion: string | undefined;
      
      if (settings.sendToExternal) {
        const consentEvidence = await StorageService.getConsentEvidence();
        if (consentEvidence && !consentEvidence.withdrawnAt) {
          consentVersion = consentEvidence.consentVersion;
        } else {
          // Consent is required but not found or withdrawn
          throw new Error('Active consent required for external data sharing. Please check your settings.');
        }
      }

      // Always save evaluations locally for personal trends
      const today = dayjs().format('YYYY-MM-DD');
      await StorageService.saveLocalEvaluation(today, evaluations);
      
      if (consentVersion) {
        // Has consent - send to API
        const request: CreateEvaluationRequest = {
          deviceId,
          evaluations,
          consentVersion,
        };
        
        console.log('🔧 Popup: Sending request to API:', request);
        const result = await this.apiService.submitEvaluations(request);
        
        // Update guidelines with new averages from API
        this.guidelines = result;
      } else {
        // No consent - just use local data
        console.log('🔧 Popup: No consent, using local data only');
      }
      
      // Mark as submitted today
      await StorageService.setLastSubmittedDate(today);
      
      // Show success and switch to trends
      statusDiv.textContent = 'Submitted successfully!';
      this.currentTab = 'trends';
      this.renderCurrentTab();
      
      // Show confetti if enabled
      if (settings.satisfyingFeedback) {
        this.showConfetti();
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      statusDiv.textContent = `Error: ${errorMessage}`;
      submitBtn.disabled = false;
    }
  }

  private async loadTrendsData() {
    const periodSelect = document.getElementById('trends-period') as HTMLSelectElement;
    const days = parseInt(periodSelect?.value || '30');
    
    try {
      // Check if user has consented to external data sharing
      const consentEvidence = await StorageService.getConsentEvidence();
      if (!consentEvidence || consentEvidence.withdrawnAt) {
        // No consent - use local trends data
        console.log('🔍 Popup: No consent for external data sharing, using local trends data');
        const localTrends = await StorageService.getLocalTrendsData(days);
        console.log('🔍 Popup: Local trends data received:', {
          localTrendsCount: localTrends.length,
          localTrends
        });
        
        if (localTrends.length > 0) {
          console.log('🔍 Popup: Rendering trends chart and table');
          this.renderTrendsChart(localTrends);
          this.renderTrendsTable(localTrends);
        } else {
          console.log('🔍 Popup: No local trends data, showing message');
          const container = document.getElementById('trends-chart');
          if (container) {
            container.innerHTML = '<p>No local trend data available. Submit some evaluations to see your personal trends.</p>';
          }
        }
        return;
      }

      // Has consent - try API first
      const trends = await this.apiService.getHistory(days);
      this.renderTrendsChart(trends);
      this.renderTrendsTable(trends);
    } catch (error) {
      const container = document.getElementById('trends-chart');
      if (container) {
        if (error instanceof Error && error.message.includes('Consent required')) {
          // API consent error - fall back to local data
          console.log('API consent error, falling back to local trends data');
          const localTrends = await StorageService.getLocalTrendsData(days);
          if (localTrends.length > 0) {
            this.renderTrendsChart(localTrends);
            this.renderTrendsTable(localTrends);
          } else {
            container.innerHTML = '<p>No local trend data available. Submit some evaluations to see your personal trends.</p>';
          }
        } else {
          container.innerHTML = '<p>Unable to load trends data. Please check your connection.</p>';
        }
      }
    }
  }

  private renderTrendsChart(trends: any[]) {
    const container = document.getElementById('trends-chart');
    if (!container) return;
  }

  private renderTrendsTable(trends: any[]) {
    const container = document.getElementById('trends-table');
    if (!container) return;

    if (trends.length === 0) {
      container.innerHTML = '<p>No trend data available.</p>';
      return;
    }

    let tableHTML = '<table class="trends-table"><thead><tr><th>Guideline</th>';
    
    // Add date headers
    if (trends[0]?.data?.length > 0) {
      trends[0].data.forEach((day: any) => {
        tableHTML += `<th>${dayjs(day.date).format('MMM DD')}</th>`;
      });
    }
    
    tableHTML += '</tr></thead><tbody>';

    trends.forEach(guideline => {
      tableHTML += `<tr><td>${guideline.text}</td>`;
      guideline.data.forEach((day: any) => {
        tableHTML += `<td>${day.average.toFixed(1)}%</td>`;
      });
      tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
  }

  private async loadSettings() {
    try {
      const settings = await StorageService.getSettings();
      
      const reminderTime = document.getElementById('reminder-time') as HTMLInputElement;
      const reminderDay = document.getElementById('reminder-day') as HTMLSelectElement;
      const weeklyReminder = document.getElementById('weekly-reminder') as HTMLInputElement;
      const apiUrl = document.getElementById('api-url') as HTMLInputElement;
      const developerMode = document.getElementById('developer-mode') as HTMLInputElement;
      const developerModeDebug = document.getElementById('developer-mode-debug') as HTMLInputElement;
      const satisfyingFeedback = document.getElementById('satisfying-feedback') as HTMLInputElement;
      const externalApiToggle = document.getElementById('external-api-toggle') as HTMLInputElement;

      if (reminderTime) reminderTime.value = settings.reminderTime || '13:30';
      if (reminderDay) reminderDay.value = settings.reminderDay?.toString() || '5';
      if (weeklyReminder) weeklyReminder.checked = settings.weeklyReminder ?? true;
      if (apiUrl) apiUrl.value = settings.apiUrl || 'http://localhost:3000';
      if (developerMode) developerMode.checked = settings.developerMode ?? false;
      if (developerModeDebug) developerModeDebug.checked = settings.developerModeDebug ?? false;
      if (satisfyingFeedback) satisfyingFeedback.checked = settings.satisfyingFeedback ?? false;
      if (externalApiToggle) externalApiToggle.checked = settings.sendToExternal ?? false;
      
      // Show/hide developer options based on developer mode
      this.toggleDeveloperOptions(settings.developerMode ?? false);
      this.toggleDeveloperDebugOptions(settings.developerModeDebug ?? false);
      
      // Update consent receipt
      await this.updateConsentReceipt();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private async saveSettings() {
    try {
      const reminderTime = (document.getElementById('reminder-time') as HTMLInputElement)?.value;
      const reminderDay = (document.getElementById('reminder-day') as HTMLSelectElement)?.value;
      const weeklyReminder = (document.getElementById('weekly-reminder') as HTMLInputElement)?.checked;
      const apiUrl = (document.getElementById('api-url') as HTMLInputElement)?.value;
      const developerMode = (document.getElementById('developer-mode') as HTMLInputElement)?.checked;
      const developerModeDebug = (document.getElementById('developer-mode-debug') as HTMLInputElement)?.checked;
      const satisfyingFeedback = (document.getElementById('satisfying-feedback') as HTMLInputElement)?.checked;
      const externalApiToggle = (document.getElementById('external-api-toggle') as HTMLInputElement)?.checked;

      await StorageService.updateSettings({
        reminderDay: reminderDay === 'today' ? 'today' : parseInt(reminderDay || '5'),
        reminderTime: reminderTime || '13:30',
        weeklyReminder: weeklyReminder ?? true,
        apiUrl: apiUrl || 'http://localhost:3000',
        developerMode: developerMode ?? false,
        developerModeDebug: developerModeDebug ?? false,
        satisfyingFeedback: satisfyingFeedback ?? false,
        sendToExternal: externalApiToggle ?? false,
      });
      
      // Show/hide developer options based on new setting
      this.toggleDeveloperOptions(developerMode ?? false);
      this.toggleDeveloperDebugOptions(developerModeDebug ?? false);

      // Show success message
      const saveBtn = document.getElementById('save-settings-btn') as HTMLButtonElement;
      if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✅ Saved!';
        saveBtn.disabled = true;
        setTimeout(() => {
          saveBtn.textContent = originalText;
          saveBtn.disabled = false;
        }, 2000);
      }

      // Update alarm after settings change
      await this.updateAlarm();
      this.updateNextNotificationTime(); // Call this after saving settings
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  }

  private async updateAlarm() {
    try {
      // Send message to background script to update alarm
      await chrome.runtime.sendMessage({ action: 'updateAlarm' });
    } catch (error) {
      console.error('Failed to update alarm:', error);
    }
  }

  private async testNotification() {
    try {
      console.log('🔧 Popup: Starting test notification process');
      
      // Check if background script is available
      if (!chrome.runtime?.id) {
        throw new Error('Extension runtime not available');
      }
      
      // First, ping the background script to ensure it's ready
      console.log('🔧 Popup: Pinging background script...');
      try {
        const pingResponse = await chrome.runtime.sendMessage({ action: 'ping' });
        console.log('🔧 Popup: Ping response:', pingResponse);
      } catch (pingError) {
        console.warn('🔧 Popup: Ping failed, but continuing with notification:', pingError);
      }
      
      // Send a message to the background script to trigger a test notification
      console.log('🔧 Popup: Sending test notification message to background');
      const response = await chrome.runtime.sendMessage({ action: 'testNotification' });
      console.log('🔧 Popup: Received response from background:', response);
      
      // Show success feedback
      const testBtn = document.getElementById('test-notification-btn') as HTMLButtonElement;
      if (testBtn) {
        const originalText = testBtn.textContent;
        testBtn.textContent = '✅ Notification Sent!';
        testBtn.disabled = true;
        
        setTimeout(() => {
          testBtn.textContent = originalText;
          testBtn.disabled = false;
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      
      // Show error feedback
      const testBtn = document.getElementById('test-notification-btn') as HTMLButtonElement;
      if (testBtn) {
        const originalText = testBtn.textContent;
        testBtn.textContent = '❌ Failed';
        testBtn.disabled = false;
        
        setTimeout(() => {
          testBtn.textContent = originalText;
          testBtn.disabled = false;
        }, 3000);
      }
    }
  }



  private async checkAlarmStatus() {
    try {
      console.log('🔧 Popup: Checking alarm status...');
      const response = await chrome.runtime.sendMessage({ action: 'checkAlarmStatus' });
      console.log('🔧 Popup: Alarm status response:', response);
      
      // Display detailed status information
      let statusText = '=== ALARM STATUS ===\n\n';
      
      if (response.error) {
        statusText += `❌ Error: ${response.error}\n\n`;
      } else {
        // Alarms
        statusText += `🔔 Alarms (${response.alarms?.length || 0}):\n`;
        if (response.alarms && response.alarms.length > 0) {
          response.alarms.forEach((alarm: any) => {
            const scheduledTime = new Date(alarm.scheduledTime || alarm.when || 0);
            statusText += `  • ${alarm.name}: ${scheduledTime.toLocaleString()}\n`;
          });
        } else {
          statusText += `  • No alarms scheduled\n`;
        }
        statusText += '\n';
        
        // Settings
        statusText += `⚙️ Settings:\n`;
        statusText += `  • Weekly Reminder: ${response.settings?.weeklyReminder ? '✅ Enabled' : '❌ Disabled'}\n`;
        statusText += `  • Reminder Time: ${response.settings?.reminderTime || 'Not set'}\n`;
        statusText += `  • Reminder Day: ${response.settings?.reminderDay !== undefined ? response.settings.reminderDay : 'Not set'} (0=Sun, 1=Mon, ..., 6=Sat)\n`;
        statusText += '\n';
        
        // Current Time
        statusText += `🕐 Current Time:\n`;
        statusText += `  • UTC: ${response.currentTime?.utc || 'Unknown'}\n`;
        statusText += `  • Local: ${response.currentTime?.local || 'Unknown'}\n`;
        statusText += `  • UTC Day: ${response.currentDay?.utc !== undefined ? response.currentDay.utc : 'Unknown'} (0=Sun, 1=Mon, ..., 6=Sat)\n`;
        statusText += `  • Local Day: ${response.currentDay?.local !== undefined ? response.currentDay.local : 'Unknown'} (0=Sun, 1=Mon, ..., 6=Sat)\n`;
        statusText += '\n';
        
        // Permissions
        statusText += `🔐 Permissions:\n`;
        statusText += `  • Notifications: ${response.permissions?.notifications ? '✅ Granted' : '❌ Not Granted'}\n`;
      }
      
      alert(statusText);
    } catch (error) {
      console.error('🔧 Popup: Failed to check alarm status:', error);
      alert('Failed to check alarm status. See console for details.');
    }
  }

  private async debugStorage() {
    try {
      console.log('🔍 Popup: Debugging storage...');
      await StorageService.debugStorage();
      
      // Also test the trends data generation
      console.log('🔍 Popup: Testing trends data generation...');
      const localTrends = await StorageService.getLocalTrendsData(30);
      console.log('🔍 Popup: Generated trends data:', localTrends);
      
      this.showMessage('Storage debug info logged to console. Check developer tools.', 'info');
    } catch (error) {
      console.error('🔍 Popup: Failed to debug storage:', error);
      this.showMessage('Failed to debug storage. Check console for details.', 'error');
    }
  }

  private toggleDeveloperOptions(show: boolean) {
    // Show/hide advanced options container (API URL, External API toggle)
    const advancedOptionsContainer = document.getElementById('advanced-options');
    
    if (advancedOptionsContainer) {
      advancedOptionsContainer.style.display = show ? 'block' : 'none';
    }
  }
  
  private toggleDeveloperDebugOptions(show: boolean) {
    // Show/hide debug options container (Test Notification, Debug Storage, Check Alarm Status)
    const developerToolsContainer = document.getElementById('developer-tools');
    
    if (developerToolsContainer) {
      developerToolsContainer.style.display = show ? 'block' : 'none';
    }
  }

  private showConfetti() {
    // Simple confetti effect - in production, use a proper confetti library
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.innerHTML = '🎉';
    confetti.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 48px;
      pointer-events: none;
      z-index: 1000;
      animation: confetti-fall 2s ease-out forwards;
    `;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      document.body.removeChild(confetti);
    }, 2000);
  }

  private async updateNextNotificationTime() {
    try {
      console.log('🧮 Popup: updateNextNotificationTime called');
      const nextNotificationDisplay = document.getElementById('next-notification-display');
      const nextNotificationTime = document.getElementById('next-notification-time');
      
      console.log('🧮 Popup: Elements found:', {
        display: !!nextNotificationDisplay,
        time: !!nextNotificationTime
      });
      
      if (!nextNotificationDisplay || !nextNotificationTime) {
        console.error('🧮 Popup: Required elements not found');
        return;
      }

      const settings = await StorageService.getSettings();
      console.log('🧮 Popup: Settings loaded:', settings);
      
      if (!settings.weeklyReminder) {
        console.log('🧮 Popup: Weekly reminders disabled, hiding display');
        nextNotificationDisplay.style.display = 'none';
        return;
      }

      // Calculate next notification time
      const reminderTime = settings.reminderTime || '13:30';
      const reminderDay = settings.reminderDay || 5;
      const [hours, minutes] = reminderTime.split(':').map(Number);
      
      const now = dayjs();
      console.log('🧮 Popup: Calculating next notification time:', {
        currentDay: now.day(),
        reminderDay: reminderDay,
        currentTime: now.format('HH:mm'),
        reminderTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        currentDate: now.format('YYYY-MM-DD'),
        currentTimeFull: now.format('YYYY-MM-DD HH:mm:ss')
      });
      
      let nextNotification: dayjs.Dayjs;
      
      // Handle "today" option
      if (reminderDay === 'today') {
        console.log('🎯 Popup: "Today" selected, scheduling for today');
        nextNotification = now.hour(hours).minute(minutes).second(0).millisecond(0);
        
        // If the time has already passed today, schedule for tomorrow
        if (now.isAfter(nextNotification)) {
          console.log('⏰ Popup: Time has passed today, scheduling for tomorrow');
          nextNotification = now.add(1, 'day').hour(hours).minute(minutes).second(0).millisecond(0);
        }
      } else {
        // Handle regular day of week (0-6)
        const dayNumber = typeof reminderDay === 'number' ? reminderDay : parseInt(reminderDay as string);
        let nextReminderDay = now.day(dayNumber);
        console.log('🧮 Popup: Initial next reminder day:', nextReminderDay.format('YYYY-MM-DD HH:mm:ss'));
        
        // If today is the reminder day and it's past the time, schedule for next week
        if (now.day() === dayNumber && now.isAfter(now.hour(hours).minute(minutes))) {
          console.log('⏰ Popup: Today is reminder day but past time, scheduling for next week');
          nextReminderDay = nextReminderDay.add(1, 'week');
          console.log('🧮 Popup: Adjusted to next week:', nextReminderDay.format('YYYY-MM-DD HH:mm:ss'));
        } else {
          console.log('📅 Popup: Scheduling for this week or future time today');
        }
        
        nextNotification = nextReminderDay.hour(hours).minute(minutes).second(0).millisecond(0);
      }
      
      console.log('🎯 Popup: Next notification calculated:', {
        nextDate: nextNotification.format('YYYY-MM-DD HH:mm:ss'),
        isToday: nextNotification.isSame(now, 'day'),
        isNextWeek: nextNotification.isAfter(now, 'week'),
        daysDifference: nextNotification.diff(now, 'day')
      });
      
      // Display the next notification time
      nextNotificationTime.textContent = nextNotification.format('YYYY-MM-DD HH:mm:ss');
      nextNotificationDisplay.style.display = 'block';
      console.log('✅ Popup: Next notification time displayed successfully');
      
    } catch (error) {
      console.error('❌ Popup: Failed to update next notification time:', error);
    }
  }

  // Consent management methods
  private async handleExternalApiToggle(checked: boolean): Promise<void> {
    if (checked) {
      // User wants to enable external API sharing
      const consentEvidence = await StorageService.getConsentEvidence();
      
      if (!consentEvidence || consentEvidence.withdrawnAt) {
        // Show consent modal
        await this.showConsentModal();
      } else {
        // Consent already given, enable sharing
        await this.enableExternalSharing();
      }
    } else {
      // User wants to disable external API sharing
      await this.disableExternalSharing();
    }
  }

  private async showConsentModal(): Promise<void> {
    const consentText = `What will be shared?
Guideline evaluations: Your 0-100% ratings for each guideline
Device identifier: A random UUID generated on your device (not your IP address)
Submission timestamp: When you completed the evaluation
What will NOT be shared?
IP address: We do not collect or store your IP address
Personal information: No names, emails, or identifying details
Browsing history: We only access data you explicitly submit
How is this data used?
Team insights: Aggregate trends and averages for your team
Progress tracking: Monitor guideline adherence over time
Improvement areas: Identify which guidelines need attention
Your rights
Withdraw anytime: Turn off external sharing in Settings
Local-only mode: Continue using the extension without sharing
Data export: Download your local data anytime

I understand and agree to share my guideline evaluations with my team for aggregate insights. I acknowledge that no IP address or personal information will be collected.`;
    const consentTextHash = await this.hashString(consentText);
    
    this.consentModal = new ConsentModal({
      isVisible: false,
      consentText,
      consentVersion: this.CONSENT_VERSION,
              onAccept: (checkboxText?: string) => this.handleConsentAccepted(consentTextHash, consentText, checkboxText),
      onDecline: () => this.handleConsentDeclined()
    });
    
    this.consentModal.show();
  }

  private async handleConsentAccepted(consentTextHash: string, consentText: string, checkboxText?: string): Promise<void> {
    const deviceId = await StorageService.getDeviceId();
    
    // Create evidence string with checkbox text and styling info
    const evidence = checkboxText 
      ? `modal_checkbox_and_button_with_gradient: "${checkboxText}"`
      : 'modal_checkbox_and_button';
    
    const consentEvidence: ConsentEvidence = {
      deviceId,
      consentVersion: this.CONSENT_VERSION,
      consentTextHash,
      disclaimerText: consentText, // Send the full disclaimer text for validation
      agreedAt: new Date().toISOString(),
      evidence
    };
    
    try {
      // Send consent to API
      await this.apiService.createConsent(consentEvidence);
      
      // Save consent locally
      await StorageService.saveConsentEvidence(consentEvidence);
      await this.enableExternalSharing();
      
      // Show success message
      this.showMessage('External data sharing enabled! Your evaluations will now contribute to team insights.', 'success');
    } catch (error) {
      console.error('Failed to create consent on API:', error);
      this.showMessage('Failed to enable external sharing. Please try again.', 'error');
      
      // Reset the checkbox
      const externalApiCheckbox = document.getElementById('external-api-toggle') as HTMLInputElement;
      if (externalApiCheckbox) {
        externalApiCheckbox.checked = false;
      }
    }
  }

  private async handleConsentDeclined(): Promise<void> {
    // Reset the checkbox to unchecked
    const externalApiCheckbox = document.getElementById('external-api-toggle') as HTMLInputElement;
    if (externalApiCheckbox) {
      externalApiCheckbox.checked = false;
    }
    
    this.showMessage('External data sharing remains disabled. Your data stays local only.', 'info');
  }

  private async enableExternalSharing(): Promise<void> {
    await StorageService.updateSettings({ sendToExternal: true });
    this.updateConsentReceipt();
  }

  private async disableExternalSharing(): Promise<void> {
    try {
      // Get current consent evidence
      const consentEvidence = await StorageService.getConsentEvidence();
      
      if (consentEvidence) {
        // Notify API about consent withdrawal
        await this.apiService.withdrawConsent(consentEvidence.deviceId, consentEvidence.consentVersion);
      }
      
      // Update local settings and consent
      await StorageService.updateSettings({ sendToExternal: false });
      await StorageService.withdrawConsent();
      
      // Update the checkbox in the UI
      const externalApiCheckbox = document.getElementById('external-api-toggle') as HTMLInputElement;
      if (externalApiCheckbox) {
        externalApiCheckbox.checked = false;
      }
      
      this.updateConsentReceipt();
      
      this.showMessage('External data sharing disabled. Your data will no longer be sent to external APIs.', 'info');
    } catch (error) {
      console.error('Failed to withdraw consent on API:', error);
      // Still update local state even if API call fails
      await StorageService.updateSettings({ sendToExternal: false });
      await StorageService.withdrawConsent();
      
      // Update the checkbox in the UI even if API call fails
      const externalApiCheckbox = document.getElementById('external-api-toggle') as HTMLInputElement;
      if (externalApiCheckbox) {
        externalApiCheckbox.checked = false;
      }
      
      this.updateConsentReceipt();
      this.showMessage('External data sharing disabled locally. API notification failed.', 'warning');
    }
  }

  private async updateConsentReceipt(): Promise<void> {
    const consentEvidence = await StorageService.getConsentEvidence();
    const settings = await StorageService.getSettings();
    const consentReceipt = document.getElementById('consent-receipt');
    
    if (consentReceipt) {
      if (consentEvidence && !consentEvidence.withdrawnAt) {
        consentReceipt.style.display = 'block';
        consentReceipt.innerHTML = `
          <h4>🔒 Consent Receipt</h4>
          <div class="consent-receipt-details">
            <div class="consent-info-row">
              <span class="consent-label">Version:</span> 
              <span class="consent-value">${consentEvidence.consentVersion}</span>
            </div>
            <div class="consent-info-row">
              <span class="consent-label">Agreed:</span> 
              <span class="consent-value">${new Date(consentEvidence.agreedAt).toLocaleString()}</span>
            </div>
            <div class="consent-info-row">
              <span class="consent-label">Status:</span> 
              <span class="consent-value" style="color: #059669;">Active</span>
            </div>
            <div class="consent-info-row">
              <span class="consent-label">Consent Hash:</span> 
              <span class="consent-value consent-hash">${consentEvidence.consentTextHash}</span>
            </div>
            <div class="consent-info-row">
              <span class="consent-label">API URL:</span> 
              <span class="consent-value api-url">${settings.apiUrl || 'http://localhost:3000'}</span>
            </div>
          </div>
          <button class="consent-withdraw-btn" id="withdraw-consent-btn">
            Withdraw Consent
          </button>
        `;
        
        // Add event listener for withdraw button
        const withdrawBtn = consentReceipt.querySelector('#withdraw-consent-btn');
        if (withdrawBtn) {
          withdrawBtn.addEventListener('click', () => this.handleWithdrawConsent());
        }
      } else {
        consentReceipt.style.display = 'none';
      }
    }
  }

    private async hashString(str: string): Promise<string> {
    // Use Web Crypto API for SHA-256 hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  private showMessage(message: string, type: 'success' | 'info' | 'error' | 'warning'): void {
    // Create a temporary message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
      case 'success':
        messageEl.style.backgroundColor = '#059669';
        break;
      case 'info':
        messageEl.style.backgroundColor = '#3b82f6';
        break;
      case 'warning':
        messageEl.style.backgroundColor = '#f59e0b';
        break;
      case 'error':
        messageEl.style.backgroundColor = '#dc2626';
        break;
    }
    
    document.body.appendChild(messageEl);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentElement) {
        messageEl.remove();
      }
    }, 5000);
  }

  private async exportLocalData(): Promise<void> {
    try {
      const data = await StorageService.exportLocalData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `guideline-pulse-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showMessage('Data exported successfully!', 'success');
    } catch (error) {
      this.showMessage('Failed to export data', 'error');
    }
  }

  private async clearLocalData(): Promise<void> {
    if (confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
      try {
        await StorageService.clearLocalData();
        this.showMessage('Local data cleared successfully!', 'success');
        // Reload the page to reset everything
        window.location.reload();
      } catch (error) {
        this.showMessage('Failed to clear data', 'error');
      }
    }
  }

  private async handleWithdrawConsent(): Promise<void> {
    if (confirm('Are you sure you want to withdraw your consent? This will stop sharing data with your team.')) {
      try {
        // Use the same logic as disableExternalSharing to ensure consistency
        await this.disableExternalSharing();
        
        // Update the consent receipt UI
        await this.updateConsentReceipt();
        
        this.showMessage('Consent withdrawn successfully', 'success');
      } catch (error) {
        console.error('Failed to withdraw consent:', error);
        this.showMessage('Failed to withdraw consent', 'error');
      }
    }
  }
}
