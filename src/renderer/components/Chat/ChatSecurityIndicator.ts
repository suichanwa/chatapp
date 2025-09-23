import type { Component } from '../../types/components';

export interface SecurityStatus {
  isSecure: boolean;
  encryptionType?: 'RSA+AES' | 'PSK' | 'none';
  peerVerified?: boolean;
  connectionType?: 'direct' | 'relay';
  details?: string;
}

export class ChatSecurityIndicator implements Component {
  private container: HTMLElement | null = null;
  private currentStatus: SecurityStatus = { isSecure: false };

  async initialize(): Promise<void> {
    this.injectStyles();
    this.createIndicator();
    console.log('✅ ChatSecurityIndicator initialized');
  }

  private injectStyles(): void {
    const existingStyle = document.getElementById('chat-security-indicator-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'chat-security-indicator-styles';
    style.textContent = `
      /* Chat Security Indicator - Matching Your Design System */
      .chat-security-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 500;
        transition: all 0.2s ease;
        cursor: pointer;
        user-select: none;
        position: relative;
        margin-left: 1rem;
      }

      .chat-security-indicator:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .chat-security-indicator.secure {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #22c55e;
      }

      .chat-security-indicator.secure:hover {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.15) 100%);
        border-color: rgba(34, 197, 94, 0.4);
      }

      .chat-security-indicator.insecure {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
      }

      .chat-security-indicator.insecure:hover {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%);
        border-color: rgba(239, 68, 68, 0.4);
      }

      .chat-security-indicator.unknown {
        background: linear-gradient(135deg, rgba(156, 163, 175, 0.15) 0%, rgba(107, 114, 128, 0.1) 100%);
        border: 1px solid rgba(156, 163, 175, 0.3);
        color: var(--muted);
      }

      .chat-security-indicator.unknown:hover {
        background: linear-gradient(135deg, rgba(156, 163, 175, 0.2) 0%, rgba(107, 114, 128, 0.15) 100%);
        border-color: rgba(156, 163, 175, 0.4);
      }

      .security-icon {
        font-size: 1rem;
        flex-shrink: 0;
      }

      .security-text {
        font-weight: 500;
        flex-shrink: 0;
      }

      .security-details {
        font-size: 0.7rem;
        opacity: 0.8;
        margin-left: 0.25rem;
      }

      /* Security tooltip - FIXED POSITIONING */
      .security-tooltip {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 0.75rem;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: all 0.2s ease;
        min-width: 220px;
        margin-top: 0.5rem;
        white-space: nowrap;
      }

      .chat-security-indicator:hover .security-tooltip {
        opacity: 1;
        pointer-events: auto;
        transform: translateX(-50%) translateY(2px);
      }

      .security-tooltip::before {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-bottom-color: var(--border);
      }

      .tooltip-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: var(--text);
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }

      .tooltip-content {
        color: var(--muted);
        font-size: 0.8rem;
        line-height: 1.4;
      }

      .tooltip-content .security-feature {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0.25rem 0;
        white-space: nowrap;
      }

      .tooltip-content .security-feature .material-icons {
        font-size: 0.9rem;
        color: var(--accent);
        flex-shrink: 0;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .chat-security-indicator {
          font-size: 0.75rem;
          padding: 0.4rem 0.6rem;
          margin-left: 0.5rem;
        }

        .security-icon {
          font-size: 0.9rem;
        }

        .security-details {
          display: none; /* Hide details on mobile */
        }

        .security-tooltip {
          position: fixed;
          top: auto;
          bottom: 4rem;
          left: 1rem;
          right: 1rem;
          transform: none;
          min-width: unset;
          margin-top: 0;
          white-space: normal;
        }

        .security-tooltip::before {
          display: none;
        }

        .tooltip-content .security-feature {
          white-space: normal;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .chat-security-indicator {
          border-width: 2px;
        }

        .chat-security-indicator.secure {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.3);
        }

        .chat-security-indicator.insecure {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.3);
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .chat-security-indicator,
        .security-tooltip {
          transition: none;
        }

        .chat-security-indicator:hover {
          transform: none;
        }
      }

      /* Accessibility */
      .chat-security-indicator:focus {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }

      .chat-security-indicator[aria-expanded="true"] .security-tooltip {
        opacity: 1;
        pointer-events: auto;
      }

      /* Make sure tooltip doesn't get clipped by chat header */
      .chat-header {
        overflow: visible !important;
        position: relative;
        z-index: 999;
      }

      /* Ensure tooltip renders above other elements */
      .chat-security-indicator {
        z-index: 1001;
      }

      .security-tooltip {
        z-index: 1002;
      }
    `;
    document.head.appendChild(style);
  }

  private createIndicator(): void {
    // Find the chat header to insert the indicator
    const chatHeader = document.querySelector('.chat-header');
    if (!chatHeader) {
      console.warn('Chat header not found, cannot create security indicator');
      return;
    }

    this.container = document.createElement('div');
    this.container.className = 'chat-security-indicator unknown';
    this.container.setAttribute('role', 'button');
    this.container.setAttribute('tabindex', '0');
    this.container.setAttribute('aria-label', 'Chat security status');
    this.container.setAttribute('title', 'Click to see security details');

    // Add click and keyboard handlers for accessibility
    this.container.addEventListener('click', this.toggleTooltip.bind(this));
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTooltip();
      }
    });

    // Append to the right side of chat header (after chat-status)
    chatHeader.appendChild(this.container);

    this.updateIndicator(this.currentStatus);
  }

  private toggleTooltip(): void {
    const isExpanded = this.container?.getAttribute('aria-expanded') === 'true';
    this.container?.setAttribute('aria-expanded', (!isExpanded).toString());
  }

  public updateSecurityStatus(status: SecurityStatus): void {
    this.currentStatus = status;
    this.updateIndicator(status);
  }

  private updateIndicator(status: SecurityStatus): void {
    if (!this.container) return;

    // Remove existing classes
    this.container.classList.remove('secure', 'insecure', 'unknown');

    // Determine security level
    let securityClass: string;
    let icon: string;
    let text: string;
    let tooltipContent: string;

    if (status.isSecure) {
      securityClass = 'secure';
      icon = 'verified_user';
      text = 'Secure';
      tooltipContent = this.getSecureTooltipContent(status);
    } else if (status.isSecure === false && status.encryptionType) {
      securityClass = 'insecure';
      icon = 'gpp_bad';
      text = 'Not Secure';
      tooltipContent = this.getInsecureTooltipContent(status);
    } else {
      securityClass = 'unknown';
      icon = 'help_outline';
      text = 'Unknown';
      tooltipContent = this.getUnknownTooltipContent();
    }

    this.container.className = `chat-security-indicator ${securityClass}`;

    const details = status.details ? `<span class="security-details">(${status.details})</span>` : '';

    this.container.innerHTML = `
      <span class="material-icons security-icon">${icon}</span>
      <span class="security-text">${text}</span>
      ${details}
      <div class="security-tooltip">
        ${tooltipContent}
      </div>
    `;

    // Update ARIA attributes
    this.container.setAttribute('aria-label', `Chat security: ${text}. ${status.details || 'Click for details'}`);
  }

  private getSecureTooltipContent(status: SecurityStatus): string {
    const features: string[] = [];

    if (status.encryptionType === 'RSA+AES') {
      features.push('<div class="security-feature"><span class="material-icons">lock</span>RSA + AES Encryption</div>');
    } else if (status.encryptionType === 'PSK') {
      features.push('<div class="security-feature"><span class="material-icons">vpn_key</span>Pre-Shared Key</div>');
    }

    if (status.peerVerified) {
      features.push('<div class="security-feature"><span class="material-icons">verified</span>Peer Identity Verified</div>');
    }

    if (status.connectionType === 'direct') {
      features.push('<div class="security-feature"><span class="material-icons">link</span>Direct P2P Connection</div>');
    }

    return `
      <div class="tooltip-header">
        <span class="material-icons" style="color: #22c55e;">verified_user</span>
        Secure Chat
      </div>
      <div class="tooltip-content">
        <p style="margin-bottom: 0.5rem;">This chat is encrypted and secure.</p>
        ${features.join('')}
      </div>
    `;
  }

  private getInsecureTooltipContent(status: SecurityStatus): string {
    return `
      <div class="tooltip-header">
        <span class="material-icons" style="color: #ef4444;">gpp_bad</span>
        Not Secure
      </div>
      <div class="tooltip-content">
        <p style="margin-bottom: 0.5rem;">This chat may not be fully secure.</p>
        <div class="security-feature">
          <span class="material-icons">warning</span>
          ${status.details || 'Connection security could not be verified'}
        </div>
      </div>
    `;
  }

  private getUnknownTooltipContent(): string {
    return `
      <div class="tooltip-header">
        <span class="material-icons" style="color: var(--muted);">help_outline</span>
        Security Unknown
      </div>
      <div class="tooltip-content">
        <p style="margin-bottom: 0.5rem;">Security status is being determined...</p>
        <div class="security-feature">
          <span class="material-icons">hourglass_empty</span>
          Checking connection security
        </div>
      </div>
    `;
  }

  // Method to show the indicator (when a chat is selected)
  public show(): void {
    if (this.container) {
      this.container.style.display = 'flex';
    }
  }

  // Method to hide the indicator (when no chat is selected)
  public hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  // Method to update for saved messages (always secure)
  public showSavedMessagesSecure(): void {
    this.updateSecurityStatus({
      isSecure: true,
      encryptionType: 'RSA+AES',
      peerVerified: true,
      connectionType: 'direct',
      details: 'Local Storage'
    });
  }

  cleanup(): void {
    // Remove injected styles
    const styleEl = document.getElementById('chat-security-indicator-styles');
    if (styleEl) styleEl.remove();

    // Remove the indicator from DOM
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    console.log('🧹 ChatSecurityIndicator cleaned up');
  }
}