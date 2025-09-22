import { Guideline, CreateEvaluationRequest, GuidelineHistory, ConsentEvidence } from '../types';

export class ApiService {
  private baseUrl: string;

  constructor(apiUrl: string) {
    this.baseUrl = apiUrl;
  }

  private async getDeviceId(): Promise<string> {
    // Import StorageService dynamically to avoid circular dependencies
    const { StorageService } = await import('./storage.service');
    return await StorageService.getDeviceId();
  }

  async getGuidelines(date?: string): Promise<Guideline[]> {
    try {
      const url = new URL('/guidelines', this.baseUrl);
      if (date) {
        url.searchParams.set('date', date);
      }

      // Get deviceId for consent validation
      const deviceId = await this.getDeviceId();
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Key': 'dev-local-demo',
          'X-Device-ID': deviceId,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Consent required for external data sharing');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch guidelines:', error);
      throw error;
    }
  }

  async getHistory(days: number = 30): Promise<GuidelineHistory[]> {
    try {
      const url = new URL('/guidelines/history', this.baseUrl);
      url.searchParams.set('days', days.toString());

      // Get deviceId for consent validation
      const deviceId = await this.getDeviceId();
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Key': 'dev-local-demo',
          'X-Device-ID': deviceId,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Consent required for external data sharing');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw error;
    }
  }

  async submitEvaluations(request: CreateEvaluationRequest): Promise<Guideline[]> {
    try {
      // Get deviceId for consent validation
      const deviceId = await this.getDeviceId();
      
      const response = await fetch(`${this.baseUrl}/evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Key': 'dev-local-demo',
          'X-Device-ID': deviceId,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Consent required for external data sharing');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to submit evaluations:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Consent management methods
  async createConsent(consent: ConsentEvidence): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/consents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Key': 'dev-local-demo',
        },
        body: JSON.stringify({
          deviceId: consent.deviceId,
          consentVersion: consent.consentVersion,
          consentTextHash: consent.consentTextHash,
          disclaimerText: consent.disclaimerText,
          agreedAt: consent.agreedAt,
          evidence: consent.evidence,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create consent:', error);
      throw error;
    }
  }

  async withdrawConsent(deviceId: string, consentVersion: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/consents/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Key': 'dev-local-demo',
        },
        body: JSON.stringify({
          deviceId,
          consentVersion,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
      throw error;
    }
  }

  async getConsentStatus(deviceId: string, consentVersion: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/consents/status/${deviceId}/${consentVersion}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Key': 'dev-local-demo',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get consent status:', error);
      throw error;
    }
  }
}
