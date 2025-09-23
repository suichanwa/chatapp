import type { Component } from '../../types/components';

export class NewChatModalStyles implements Component {
  async initialize(): Promise<void> {
    this.injectStyles();
  }

  private injectStyles(): void {
    const existingStyle = document.getElementById('new-chat-modal-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'new-chat-modal-styles';
    style.textContent = `
      /* NewChatModal Component Styles - Matching existing design system */
      .new-chat-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 500px;
        background: var(--bg-2);
      }

      /* Tab Navigation */
      .connection-tabs {
        display: flex;
        background: var(--panel);
        border-bottom: 1px solid var(--border);
        border-radius: 12px 12px 0 0;
        overflow: hidden;
      }

      .tab-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        background: transparent;
        border: none;
        color: var(--muted);
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.3s ease;
        position: relative;
      }

      .tab-btn:hover:not(.active) {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text);
      }

      .tab-btn.active {
        color: var(--text);
        background: var(--bg-2);
      }

      .tab-btn.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(135deg, var(--accent) 0%, #0066aa 100%);
      }

      .tab-icon {
        font-size: 1.1rem;
      }

      /* Tab Content */
      .tab-content {
        display: none;
        flex: 1;
        overflow-y: auto;
      }

      .tab-content.active {
        display: block;
      }

      .tab-section {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Section Titles */
      .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text);
        margin: 0 0 0.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .section-description {
        color: var(--muted);
        font-size: 0.9rem;
        margin: 0 0 1.5rem 0;
        line-height: 1.5;
      }

      /* Form Elements */
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-label {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text);
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .form-input {
        padding: 0.875rem 1rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text);
        font-size: 0.9rem;
        transition: all 0.2s ease;
        outline: none;
      }

      .form-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
      }

      .form-input::placeholder {
        color: var(--muted);
      }

      .form-hint {
        color: var(--muted);
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }

      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        position: relative;
        overflow: hidden;
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--accent) 0%, #0066aa 100%);
        color: white;
        border: 1px solid var(--accent);
      }

      .btn-primary:hover {
        background: linear-gradient(135deg, #0066aa 0%, var(--accent) 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
      }

      .btn-secondary {
        background: var(--panel);
        color: var(--text);
        border: 1px solid var(--border);
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--accent);
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }

      .btn.loading {
        pointer-events: none;
      }

      .btn-icon {
        font-size: 1.1rem;
      }

      /* Form Actions */
      .form-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      /* Info Section */
      .info-section h4 {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text);
        margin: 0 0 1.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .info-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      .info-item label {
        font-weight: 500;
        color: var(--text);
        min-width: 120px;
      }

      /* Status Indicators */
      .status-indicator {
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 500;
        background: var(--bg);
        color: var(--muted);
        border: 1px solid var(--border);
      }

      .status-running {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
        border-color: rgba(34, 197, 94, 0.3);
      }

      /* Copy Buttons */
      .copy-btn {
        padding: 0.5rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--muted);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
      }

      .copy-btn:hover {
        background: var(--accent);
        color: white;
        border-color: var(--accent);
      }

      .copy-btn.success {
        background: #22c55e !important;
        color: white !important;
        border-color: #22c55e !important;
      }

      .copy-btn.error {
        background: #ef4444 !important;
        color: white !important;
        border-color: #ef4444 !important;
      }

      /* Textarea for keys */
      .key-textarea {
        width: 100%;
        min-height: 120px;
        max-height: 200px;
        padding: 0.875rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text);
        font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        font-size: 0.8rem;
        line-height: 1.4;
        resize: vertical;
        outline: none;
      }

      .key-textarea:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
      }

      /* Security Settings */
      .security-section {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
      }

      .security-section h4 {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text);
        margin: 0 0 1.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      /* Toggle Switch */
      .toggle {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        user-select: none;
      }

      .toggle-input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle-track {
        position: relative;
        width: 44px;
        height: 24px;
        background: var(--border);
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .toggle-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .toggle.checked .toggle-track {
        background: var(--accent);
      }

      .toggle.checked .toggle-thumb {
        transform: translateX(20px);
      }

      .toggle-label {
        font-size: 0.9rem;
        color: var(--text);
      }

      /* Responsive Design */
      @media (max-width: 640px) {
        .tab-section {
          padding: 1.5rem;
        }
        
        .tab-btn {
          padding: 0.875rem 1rem;
          font-size: 0.8rem;
        }
        
        .tab-label {
          display: none;
        }
        
        .info-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }
        
        .btn {
          width: 100%;
          justify-content: center;
        }
        
        .copy-btn {
          width: auto;
          min-width: 44px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  cleanup(): void {
    const styleEl = document.getElementById('new-chat-modal-styles');
    if (styleEl) styleEl.remove();
  }
}