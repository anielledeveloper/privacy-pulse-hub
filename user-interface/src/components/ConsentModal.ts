import { ConsentModalData } from '../types';

export class ConsentModal {
  private modalElement: HTMLElement | null = null;
  private data: ConsentModalData;

  constructor(data: ConsentModalData) {
    this.data = data;
    this.createModal();
  }

  private createModal(): void {
    // Create modal container
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'consent-modal-overlay';
    this.modalElement.style.display = 'none';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'consent-modal';
    modalContent.innerHTML = `
      <div class="consent-modal-header">
        <h2>🔒 Data Sharing Consent</h2>
        <p class="consent-subtitle">Enable external data sharing to contribute to team insights</p>
      </div>
      
      <div class="consent-modal-body">
        <div class="consent-section">
          <h3>What will be shared?</h3>
          <ul>
            <li><strong>Guideline evaluations:</strong> Your 0-100% ratings for each guideline</li>
            <li><strong>Device identifier:</strong> A random UUID generated on your device (not your IP address)</li>
            <li><strong>Submission timestamp:</strong> When you completed the evaluation</li>
          </ul>
        </div>
        
        <div class="consent-section">
          <h3>What will NOT be shared?</h3>
          <ul>
            <li><strong>IP address:</strong> We do not collect or store your IP address</li>
            <li><strong>Personal information:</strong> No names, emails, or identifying details</li>
            <li><strong>Browsing history:</strong> We only access data you explicitly submit</li>
          </ul>
        </div>
        
        <div class="consent-section">
          <h3>How is this data used?</h3>
          <ul>
            <li><strong>Team insights:</strong> Aggregate trends and averages for your team</li>
            <li><strong>Progress tracking:</strong> Monitor guideline adherence over time</li>
            <li><strong>Improvement areas:</strong> Identify which guidelines need attention</li>
          </ul>
        </div>
        
        <div class="consent-section">
          <h3>Your rights</h3>
          <ul>
            <li><strong>Withdraw anytime:</strong> Turn off external sharing in Settings</li>
            <li><strong>Local-only mode:</strong> Continue using the extension without sharing</li>
            <li><strong>Data export:</strong> Download your local data anytime</li>
          </ul>
        </div>
        
        <div class="consent-checkbox-section">
          <label class="consent-checkbox-label">
            <input type="checkbox" id="consent-checkbox" required>
            <span class="checkmark"></span>
            <span>I understand and agree to share my guideline evaluations with my team for aggregate insights. I acknowledge that no IP address or personal information will be collected.</span>
          </label>
        </div>
      </div>
      
      <div class="consent-modal-footer">
        <button type="button" class="btn btn-secondary" id="consent-decline">
          Keep Local Only
        </button>
        <button type="button" class="btn btn-primary" id="consent-accept" disabled>
          I Agree & Enable Sharing
        </button>
      </div>
      
      <div class="consent-modal-footer-note">
        <small>
          <strong>Consent Version:</strong> ${this.data.consentVersion} | 
          <a href="#" id="privacy-notice-link">Privacy Notice</a>
        </small>
      </div>
    `;

    this.modalElement.appendChild(modalContent);
    document.body.appendChild(this.modalElement);
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.modalElement) return;

    const consentCheckbox = this.modalElement.querySelector('#consent-checkbox') as HTMLInputElement;
    const acceptButton = this.modalElement.querySelector('#consent-accept') as HTMLButtonElement;
    const declineButton = this.modalElement.querySelector('#consent-decline') as HTMLButtonElement;
    const privacyLink = this.modalElement.querySelector('#privacy-notice-link') as HTMLAnchorElement;

    // Enable/disable accept button based on checkbox
    consentCheckbox?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (acceptButton) {
        acceptButton.disabled = !target.checked;
      }
    });

    // Handle accept button
    acceptButton?.addEventListener('click', () => {
      if (consentCheckbox?.checked) {
        // Get the checkbox text to include in evidence
        const checkboxLabel = this.modalElement?.querySelector('.consent-checkbox-label span:not(.checkmark)') as HTMLElement;
        const checkboxText = checkboxLabel?.textContent?.trim() || 'I understand and agree to share my guideline evaluations with my team for aggregate insights. I acknowledge that no IP address or personal information will be collected.';
        
        this.data.onAccept(checkboxText);
        this.hide();
      }
    });

    // Handle decline button
    declineButton?.addEventListener('click', () => {
      this.data.onDecline();
      this.hide();
    });

    // Handle privacy notice link
    privacyLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showPrivacyNotice();
    });

    // Close modal when clicking outside
    this.modalElement.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.data.onDecline();
        this.hide();
      }
    });
  }

  private showPrivacyNotice(): void {
    // Create a simple privacy notice popup
    const notice = document.createElement('div');
    notice.className = 'privacy-notice-popup';
    notice.innerHTML = `
      <div class="privacy-notice-content">
        <h3>Privacy Notice</h3>
        <p>This extension respects your privacy:</p>
        <ul>
          <li>No IP addresses are collected or stored</li>
          <li>Data is stored locally on your device</li>
          <li>External sharing is optional and requires consent</li>
          <li>You can withdraw consent anytime</li>
          <li>Your data is never sold or shared with third parties</li>
        </ul>
        <button class="btn btn-primary" id="privacy-notice-close-btn">Close</button>
      </div>
    `;
    
    // Add event listener for close button
    const closeBtn = notice.querySelector('#privacy-notice-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        notice.remove();
      });
    }
    
    document.body.appendChild(notice);
  }

  public show(): void {
    if (this.modalElement) {
      this.modalElement.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  public hide(): void {
    if (this.modalElement) {
      this.modalElement.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  public destroy(): void {
    if (this.modalElement) {
      this.modalElement.remove();
      this.modalElement = null;
    }
  }
}
