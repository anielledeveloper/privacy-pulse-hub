export interface Guideline {
  id: string;
  text: string;
  metadata?: {
    category?: string;
    version?: number;
    [key: string]: any;
  };
  averagePercentage?: number;
  totalResponses?: number;
}

export interface Evaluation {
  guidelineId: string;
  percentage: number;
  metadata?: Record<string, any>;
}

export interface CreateEvaluationRequest {
  deviceId: string;
  evaluations: Evaluation[];
  consentVersion?: string; // Optional: only included when user has consented
}

export interface GuidelineHistory {
  id: string;
  text: string;
  metadata?: Record<string, any>;
  data: Array<{
    date: string;
    average: number;
    count: number;
  }>;
}

export interface Settings {
  reminderTime: string; // HH:MM format
  reminderDay: number | 'today'; // 0-6 (Sunday = 0, Monday = 1, ..., Saturday = 6) or 'today' for immediate scheduling
  weeklyReminder: boolean;
  apiUrl: string;
  developerMode: boolean; // Show advanced options (API URL, external API toggle)
  developerModeDebug: boolean; // Show debug options (Test Notification, Debug Storage, Check Alarm Status)
  satisfyingFeedback: boolean;
  sendToExternal: boolean; // New: whether to send data to external API
}

export interface ConsentEvidence {
  deviceId: string;
  consentVersion: string;
  consentTextHash: string;
  disclaimerText: string;
  agreedAt: string; // ISO timestamp
  evidence: string; // e.g., "modal_checkbox_and_button"
  withdrawnAt?: string; // ISO timestamp when consent was withdrawn
}

export interface ConsentModalData {
  isVisible: boolean;
  consentText: string;
  consentVersion: string;
  onAccept: (checkboxText?: string) => void;
  onDecline: () => void;
}

export interface StorageData {
  deviceId: string;
  lastSubmittedDate?: string;
  settings: Settings;
  cachedGuidelines?: Guideline[];
  lastApiSync?: number;
  consentEvidence?: ConsentEvidence; // New: consent information
  localEvaluations?: Record<string, Evaluation[]>; // New: local evaluation data by date
}
