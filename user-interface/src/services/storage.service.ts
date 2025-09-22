import { StorageData, Settings, Guideline, ConsentEvidence, Evaluation, GuidelineHistory } from '../types';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export class StorageService {
  private static readonly STORAGE_KEY = 'guidelinePulseData';

  static async initialize(): Promise<StorageData> {
    const data = await this.getData();
    
    if (!data.deviceId) {
      data.deviceId = uuidv4();
      await this.saveData(data);
      console.log('🔧 StorageService: Generated new deviceId:', data.deviceId);
    } else {
      console.log('🔧 StorageService: Using existing deviceId:', data.deviceId);
    }

    return data;
  }

  static async getData(): Promise<StorageData> {
        const result = await chrome.storage.local.get(this.STORAGE_KEY);
    
    const defaultData: StorageData = {
      deviceId: '',
      settings: {
        reminderTime: '13:30',
        reminderDay: 'today', // Default to "today" for immediate testing
        weeklyReminder: true,
        apiUrl: 'http://localhost:3000',
        developerMode: false,
        developerModeDebug: false,
        satisfyingFeedback: false,
        sendToExternal: false, // Default to local-only mode
      },
    };
    
    return result[this.STORAGE_KEY] || defaultData;
  }

  static async saveData(data: Partial<StorageData>): Promise<void> {
    const currentData = await this.getData();
    const updatedData = { ...currentData, ...data };
    await chrome.storage.local.set({ [this.STORAGE_KEY]: updatedData });
  }

  static async getSettings(): Promise<Settings> {
    const data = await this.getData();
    
    // Convert UTC time to local for display
    if (data.settings.reminderTime) {
      data.settings.reminderTime = this.utcTimeToLocal(data.settings.reminderTime);
    }
    
    // Ensure reminderDay has a value
    if (data.settings.reminderDay === undefined) {
      data.settings.reminderDay = 'today';
    }
    
    return data.settings;
  }

  static async updateSettings(updates: Partial<Settings>): Promise<void> {
    const currentData = await this.getData();
    
    // Convert local time to UTC if reminderTime is being updated
    if (updates.reminderTime) {
      updates.reminderTime = this.localTimeToUTC(updates.reminderTime);
    }

    const updatedSettings = {
      ...currentData.settings,
      ...updates,
    };

    await chrome.storage.local.set({
      [this.STORAGE_KEY]: {
        ...currentData,
        settings: updatedSettings,
      },
    });
  }

  static async getDeviceId(): Promise<string> {
    const data = await this.getData();
    return data.deviceId;
  }

  static async setLastSubmittedDate(date: string): Promise<void> {
    await this.saveData({ lastSubmittedDate: date });
  }

  static async getLastSubmittedDate(): Promise<string | undefined> {
    const data = await this.getData();
    return data.lastSubmittedDate;
  }

  static async cacheGuidelines(guidelines: Guideline[]): Promise<void> {
    await this.saveData({ 
      cachedGuidelines: guidelines,
      lastApiSync: Date.now()
    });
  }

  static async getCachedGuidelines(): Promise<Guideline[] | undefined> {
    const data = await this.getData();
    return data.cachedGuidelines;
  }

  static async clearCache(): Promise<void> {
    await this.saveData({ 
      cachedGuidelines: undefined,
      lastApiSync: undefined
    });
  }

  // Consent management methods
  static async getConsentEvidence(): Promise<ConsentEvidence | undefined> {
    const data = await this.getData();
    return data.consentEvidence;
  }

  static async saveConsentEvidence(consent: ConsentEvidence): Promise<void> {
    await this.saveData({ consentEvidence: consent });
  }

  static async withdrawConsent(): Promise<void> {
    const currentData = await this.getData();
    if (currentData.consentEvidence) {
      const updatedConsent = {
        ...currentData.consentEvidence,
        withdrawnAt: new Date().toISOString()
      };
      await this.saveData({ consentEvidence: updatedConsent });
    }
  }

  static async clearLocalData(): Promise<void> {
    await chrome.storage.local.clear();
    // Re-initialize with default data
    await this.initialize();
  }

  static async exportLocalData(): Promise<string> {
    const data = await this.getData();
    return JSON.stringify(data, null, 2);
  }

  // Debug method to inspect storage contents
  static async debugStorage(): Promise<void> {
    const data = await this.getData();
    console.log('🔍 StorageService: Full storage data:', data);
    console.log('🔍 StorageService: Local evaluations:', data.localEvaluations);
    console.log('🔍 StorageService: Cached guidelines:', data.cachedGuidelines);
    console.log('🔍 StorageService: Consent evidence:', data.consentEvidence);
  }

  // Local evaluations storage methods
  static async saveLocalEvaluation(date: string, evaluations: Evaluation[]): Promise<void> {
    const data = await this.getData();
    const localEvaluations = data.localEvaluations || {};
    localEvaluations[date] = evaluations;
    await this.saveData({ localEvaluations });
  }

  static async getLocalEvaluations(date?: string): Promise<Evaluation[] | undefined> {
    const data = await this.getData();
    if (date) {
      return data.localEvaluations?.[date];
    }
    return undefined;
  }

  static async getAllLocalEvaluations(): Promise<Record<string, Evaluation[]>> {
    const data = await this.getData();
    const localEvaluations = data.localEvaluations || {};
    console.log('🔍 StorageService: getAllLocalEvaluations returning:', {
      hasLocalEvaluations: !!data.localEvaluations,
      localEvaluationsCount: Object.keys(localEvaluations).length,
      localEvaluations
    });
    return localEvaluations;
  }

  static async getLocalTrendsData(days: number = 30): Promise<GuidelineHistory[]> {
    const allEvaluations = await this.getAllLocalEvaluations();
    let guidelines = await this.getCachedGuidelines() || [];
    
    console.log('🔍 StorageService: getLocalTrendsData called with:', {
      days,
      allEvaluationsCount: Object.keys(allEvaluations).length,
      allEvaluations,
      cachedGuidelinesCount: guidelines.length,
      cachedGuidelines: guidelines
    });
    
    // If no cached guidelines, use fallback guidelines for local trends
    if (guidelines.length === 0) {
      console.log('🔍 StorageService: No cached guidelines, using fallback guidelines');
      guidelines = [
        { id: 'g-001', text: 'We write E2E tests for critical flows.' },
        { id: 'g-002', text: 'We perform code reviews within one business day.' },
        { id: 'g-003', text: 'We keep PRs small and focused.' },
        { id: 'g-004', text: 'We document architectural decisions (ADRs).' },
        { id: 'g-005', text: 'We monitor and alert for critical paths.' },
        { id: 'g-006', text: 'We maintain accessibility in UI changes.' },
      ];
    }

    const cutoffDate = dayjs().subtract(days, 'day');
    const trendsData: GuidelineHistory[] = [];

    guidelines.forEach(guideline => {
      const guidelineData: Array<{ date: string; average: number; count: number }> = [];
      
      // Process each date's evaluations
      Object.entries(allEvaluations).forEach(([date, evaluations]) => {
        if (dayjs(date).isAfter(cutoffDate)) {
          const guidelineEvaluation = evaluations.find(e => e.guidelineId === guideline.id);
          if (guidelineEvaluation) {
            guidelineData.push({
              date,
              average: guidelineEvaluation.percentage,
              count: 1
            });
          }
        }
      });

      if (guidelineData.length > 0) {
        trendsData.push({
          id: guideline.id,
          text: guideline.text,
          metadata: guideline.metadata,
          data: guidelineData.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
        });
      }
    });

    console.log('🔍 StorageService: getLocalTrendsData returning:', {
      trendsDataCount: trendsData.length,
      trendsData
    });

    return trendsData;
  }

  // Convert local time to UTC for storage
  private static localTimeToUTC(localTime: string): string {
    const [hours, minutes] = localTime.split(':').map(Number);
    // Create a date object in local timezone with the specified time
    const localDateTime = dayjs().hour(hours).minute(minutes).second(0).millisecond(0);
    // Convert to UTC for storage
    const utcDateTime = localDateTime.utc();
    console.log('🕐 StorageService: Converting local time to UTC:', {
      local: localDateTime.format('HH:mm'),
      utc: utcDateTime.format('HH:mm'),
      localFull: localDateTime.format('YYYY-MM-DD HH:mm:ss'),
      utcFull: utcDateTime.format('YYYY-MM-DD HH:mm:ss')
    });
    return utcDateTime.format('HH:mm');
  }

  // Convert UTC time to local for display
  private static utcTimeToLocal(utcTime: string): string {
    const [hours, minutes] = utcTime.split(':').map(Number);
    // Create a date object in UTC with the specified time
    const utcDateTime = dayjs.utc().hour(hours).minute(minutes).second(0).millisecond(0);
    // Convert to local time for display
    const localDateTime = utcDateTime.local();
    console.log('🕐 StorageService: Converting UTC time to local:', {
      utc: utcDateTime.format('HH:mm'),
      local: localDateTime.format('HH:mm'),
      utcFull: utcDateTime.format('YYYY-MM-DD HH:mm:ss'),
      localFull: localDateTime.format('YYYY-MM-DD HH:mm:ss')
    });
    return localDateTime.format('HH:mm');
  }
}
