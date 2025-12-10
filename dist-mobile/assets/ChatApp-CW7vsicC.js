var P=Object.defineProperty;var T=(h,e,t)=>e in h?P(h,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):h[e]=t;var o=(h,e,t)=>T(h,typeof e!="symbol"?e+"":e,t);class A{constructor(){o(this,"isOpen",!1);o(this,"currentTab","system");o(this,"logs",[]);o(this,"logFilter","all");this.setupEventListeners(),this.loadLogs()}setupEventListeners(){var e,t,s,a,n;(e=window.electronAPI)!=null&&e.debug&&((s=(t=window.electronAPI.debug).onNewLog)==null||s.call(t,i=>{this.logs.unshift(i),this.updateLogsDisplay()}),(n=(a=window.electronAPI.debug).onLogsCleared)==null||n.call(a,()=>{this.logs=[],this.updateLogsDisplay()}))}async loadLogs(){var e,t;try{(t=(e=window.electronAPI)==null?void 0:e.debug)!=null&&t.getLogs&&(this.logs=await window.electronAPI.debug.getLogs(),this.updateLogsDisplay())}catch(s){console.error("Failed to load debug logs:",s)}}async initialize(){console.log("🔧 DebugPanel: Starting initialization..."),this.injectDebugStyles(),this.createDebugToggle(),this.createDebugOverlay(),console.log("🔧 DebugPanel: Initialization complete")}createDebugOverlay(){var t,s,a,n,i,c,r,l;const e=`
      <div id="debug-overlay" class="debug-overlay">
        <div class="debug-header">
          <span class="debug-title">🔧 Debug Panel</span>
          <button class="debug-btn close" id="debug-close">×</button>
        </div>
        <div class="debug-content">
          <div class="debug-tabs">
            <button class="debug-tab active" data-tab="system">System</button>
            <button class="debug-tab" data-tab="api">APIs</button>
            <button class="debug-tab" data-tab="logs">Logs</button>
          </div>
          
          <div class="debug-panel active" id="debug-system">
            <div class="system-info-grid">
              <span class="system-info-label">User Agent:</span>
              <span class="system-info-value">${navigator.userAgent}</span>
              <span class="system-info-label">Platform:</span>
              <span class="system-info-value">${navigator.platform}</span>
              <span class="system-info-label">Language:</span>
              <span class="system-info-value">${navigator.language}</span>
              <span class="system-info-label">Cookies Enabled:</span>
              <span class="system-info-value">${navigator.cookieEnabled}</span>
              <span class="system-info-label">Online:</span>
              <span class="system-info-value">${navigator.onLine}</span>
              <span class="system-info-label">Screen Resolution:</span>
              <span class="system-info-value">${screen.width}x${screen.height}</span>
              <span class="system-info-label">Window Size:</span>
              <span class="system-info-value">${window.innerWidth}x${window.innerHeight}</span>
              <span class="system-info-label">Color Depth:</span>
              <span class="system-info-value">${screen.colorDepth}-bit</span>
              <span class="system-info-label">Pixel Ratio:</span>
              <span class="system-info-value">${window.devicePixelRatio}</span>
              <span class="system-info-label">Timezone:</span>
              <span class="system-info-value">${Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
          </div>
          
          <div class="debug-panel" id="debug-api">
            <ul class="api-status-list">
              <li class="api-status-item">
                <span class="api-status-name">ElectronAPI</span>
                <span class="api-status-indicator ${typeof window.electronAPI<"u"?"available":"unavailable"}">
                  ${typeof window.electronAPI<"u"?"✅":"❌"}
                </span>
              </li>
              <li class="api-status-item">
                <span class="api-status-name">Crypto API</span>
                <span class="api-status-indicator ${typeof((t=window.electronAPI)==null?void 0:t.crypto)<"u"?"available":"unavailable"}">
                  ${typeof((s=window.electronAPI)==null?void 0:s.crypto)<"u"?"✅":"❌"}
                </span>
              </li>
              <li class="api-status-item">
                <span class="api-status-name">Database API</span>
                <span class="api-status-indicator ${typeof((a=window.electronAPI)==null?void 0:a.db)<"u"?"available":"unavailable"}">
                  ${typeof((n=window.electronAPI)==null?void 0:n.db)<"u"?"✅":"❌"}
                </span>
              </li>
              <li class="api-status-item">
                <span class="api-status-name">Permission API</span>
                <span class="api-status-indicator ${typeof((i=window.electronAPI)==null?void 0:i.permission)<"u"?"available":"unavailable"}">
                  ${typeof((c=window.electronAPI)==null?void 0:c.permission)<"u"?"✅":"❌"}
                </span>
              </li>
              <li class="api-status-item">
                <span class="api-status-name">Transport API</span>
                <span class="api-status-indicator ${typeof((r=window.electronAPI)==null?void 0:r.transport)<"u"?"available":"unavailable"}">
                  ${typeof((l=window.electronAPI)==null?void 0:l.transport)<"u"?"✅":"❌"}
                </span>
              </li>
            </ul>
          </div>
          
          <div class="debug-panel" id="debug-logs">
            <div class="debug-log-controls">
              <select class="debug-filter" id="debug-log-filter">
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warn">Warnings</option>
                <option value="error">Errors</option>
              </select>
              <select class="debug-filter" id="debug-component-filter">
                <option value="all">All Components</option>
              </select>
              <button class="debug-btn" id="debug-clear-logs">Clear Logs</button>
              <button class="debug-btn" id="debug-refresh-logs">Refresh</button>
            </div>
            <div class="debug-logs-container" id="debug-logs-container">
              <!-- Logs will be populated here -->
            </div>
          </div>
        </div>
      </div>
    `;document.getElementById("debug-overlay")||document.body.insertAdjacentHTML("beforeend",e),this.attachEventListeners()}createDebugToggle(){document.getElementById("debug-toggle")||document.body.insertAdjacentHTML("beforeend",`
      <button id="debug-toggle" class="debug-toggle" title="Toggle Debug Panel">🔧</button>
    `);const t=document.getElementById("debug-toggle");t==null||t.addEventListener("click",()=>this.toggle())}attachEventListeners(){const e=document.getElementById("debug-close");e==null||e.addEventListener("click",()=>this.close()),document.querySelectorAll(".debug-tab").forEach(c=>{c.addEventListener("click",r=>{const d=r.target.dataset.tab;d&&this.switchTab(d)})});const t=document.getElementById("debug-log-filter");t==null||t.addEventListener("change",c=>{this.logFilter=c.target.value,this.updateLogsDisplay()});const s=document.getElementById("debug-component-filter");s==null||s.addEventListener("change",()=>{this.updateComponentFilter(),this.updateLogsDisplay()});const a=document.getElementById("debug-clear-logs");a==null||a.addEventListener("click",()=>this.clearLogs());const n=document.getElementById("debug-refresh-logs");n==null||n.addEventListener("click",()=>this.loadLogs());const i=document.getElementById("debug-overlay");i==null||i.addEventListener("click",c=>{c.target===i&&this.close()}),document.addEventListener("keydown",c=>{c.key==="Escape"&&this.isOpen&&this.close()})}switchTab(e){this.currentTab=e,document.querySelectorAll(".debug-tab").forEach(a=>{a.classList.remove("active")});const t=document.querySelector(`[data-tab="${e}"]`);t==null||t.classList.add("active"),document.querySelectorAll(".debug-panel").forEach(a=>{a.classList.remove("active")});const s=document.getElementById(`debug-${e}`);s==null||s.classList.add("active")}updateComponentFilter(){const e=document.getElementById("debug-component-filter");if(!e)return;const t=[...new Set(this.logs.map(a=>a.component))],s=e.value;e.innerHTML='<option value="all">All Components</option>',t.forEach(a=>{const n=document.createElement("option");n.value=a,n.textContent=a,a===s&&(n.selected=!0),e.appendChild(n)})}updateLogsDisplay(){const e=document.getElementById("debug-logs-container");if(!e)return;const t=document.getElementById("debug-component-filter"),s=(t==null?void 0:t.value)||"all";let a=this.logs;if(this.logFilter!=="all"&&(a=a.filter(n=>n.level===this.logFilter)),s!=="all"&&(a=a.filter(n=>n.component===s)),a.length===0){e.innerHTML='<div class="debug-no-logs">No logs to display</div>';return}e.innerHTML=a.map(n=>`
      <div class="debug-log-entry ${n.level}">
        <div class="debug-log-header">
          <span class="debug-log-time">${new Date(n.timestamp).toLocaleTimeString()}</span>
          <span class="debug-log-level ${n.level}">${n.level.toUpperCase()}</span>
          <span class="debug-log-component">${n.component}</span>
        </div>
        <div class="debug-log-message">${n.message}</div>
        ${n.data?`<div class="debug-log-data">${JSON.stringify(n.data,null,2)}</div>`:""}
      </div>
    `).join(""),this.updateComponentFilter()}async clearLogs(){var e,t;try{(t=(e=window.electronAPI)==null?void 0:e.debug)!=null&&t.clearLogs&&await window.electronAPI.debug.clearLogs(),this.logs=[],this.updateLogsDisplay()}catch(s){console.error("Failed to clear logs:",s)}}toggle(){this.isOpen?this.close():this.open()}open(){this.isOpen=!0;const e=document.getElementById("debug-overlay"),t=document.getElementById("debug-toggle");e==null||e.classList.add("open"),t==null||t.classList.add("active")}close(){this.isOpen=!1;const e=document.getElementById("debug-overlay"),t=document.getElementById("debug-toggle");e==null||e.classList.remove("open"),t==null||t.classList.remove("active")}cleanup(){const e=document.getElementById("debug-overlay"),t=document.getElementById("debug-toggle");e==null||e.remove(),t==null||t.remove()}injectDebugStyles(){if(document.getElementById("debug-styles"))return;const e=document.createElement("style");e.id="debug-styles",e.textContent=`
      /* Debug Toggle Button - MOVED TO MIDDLE RIGHT */
      .debug-toggle {
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 122, 204, 0.8);
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .debug-toggle:hover {
        background: rgba(0, 122, 204, 1);
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 122, 204, 0.4);
      }

      .debug-toggle.active {
        background: rgba(220, 53, 69, 0.8);
      }

      .debug-toggle.active:hover {
        background: rgba(220, 53, 69, 1);
        box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
      }

      /* Debug Overlay */
      .debug-overlay {
        position: fixed;
        top: 0;
        right: 0;
        width: 450px;
        height: 100vh;
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(10px);
        border-left: 1px solid #404040;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
        display: flex;
        flex-direction: column;
      }

      .debug-overlay.open {
        transform: translateX(0);
      }

      /* Rest of your debug styles... */
      .debug-header {
        background: #2d2d2d;
        padding: 1rem;
        border-bottom: 1px solid #404040;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .debug-header h3 {
        font-size: 1rem;
        margin: 0;
        color: #ffffff;
      }

      .debug-controls {
        display: flex;
        gap: 0.5rem;
      }

      .debug-btn {
        background: #404040;
        border: none;
        color: #ffffff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: background-color 0.2s;
      }

      .debug-btn:hover {
        background: #555555;
      }

      .debug-btn.clear {
        background: #dc3545;
      }

      .debug-btn.clear:hover {
        background: #c82333;
      }

      .debug-btn.close {
        background: none;
        color: #888;
        font-size: 1.2rem;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }

      .debug-btn.close:hover {
        color: #fff;
        background: #404040;
      }

      .debug-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .debug-tabs {
        display: flex;
        background: #1a1a1a;
        border-bottom: 1px solid #404040;
      }

      .debug-tab {
        flex: 1;
        padding: 0.75rem;
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s;
      }

      .debug-tab.active {
        color: #ffffff;
        background: #2d2d2d;
        border-bottom: 2px solid #007acc;
      }

      .debug-tab:hover:not(.active) {
        background: #333;
        color: #ccc;
      }

      .debug-panel {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: none;
      }

      .debug-panel.active {
        display: block;
      }

      /* System Info Panel */
      .system-info-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0.5rem;
        font-size: 0.8rem;
        font-family: monospace;
      }

      .system-info-label {
        color: #888;
        font-weight: 500;
      }

      .system-info-value {
        color: #ffffff;
        word-break: break-all;
      }

      /* API Status Panel */
      .api-status-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .api-status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #333;
        font-size: 0.8rem;
      }

      .api-status-item:last-child {
        border-bottom: none;
      }

      .api-status-name {
        color: #ccc;
      }

      .api-status-indicator {
        font-size: 1rem;
      }

      .api-status-indicator.available {
        color: #00ff00;
      }

      .api-status-indicator.unavailable {
        color: #ff4444;
      }

      /* Logs Panel */
      .debug-log-controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }

      .debug-filter {
        background: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
      }

      .debug-logs {
        flex: 1;
        overflow-y: auto;
      }

      .debug-log-entry {
        padding: 0.5rem;
        border-bottom: 1px solid #333;
        font-size: 0.8rem;
        font-family: monospace;
      }

      .debug-log-entry:last-child {
        border-bottom: none;
      }

      .debug-log-entry.info {
        border-left: 3px solid #17a2b8;
      }

      .debug-log-entry.warn {
        border-left: 3px solid #ffc107;
      }

      .debug-log-entry.error {
        border-left: 3px solid #dc3545;
      }

      .debug-log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;
      }

      .debug-log-component {
        color: #007acc;
        font-weight: 500;
      }

      .debug-log-time {
        color: #888;
        font-size: 0.7rem;
      }

      .debug-log-message {
        color: #ffffff;
        margin-bottom: 0.25rem;
      }

      .debug-log-data {
        color: #ccc;
        background: #1a1a1a;
        padding: 0.25rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.7rem;
      }

      /* Responsive adjustments */
      @media (max-width: 1200px) {
        .debug-overlay {
          width: 100vw;
        }
        
        .debug-toggle {
          right: 15px;
          width: 36px;
          height: 36px;
          font-size: 1rem;
        }
      }

      @media (max-width: 768px) {
        .debug-toggle {
          right: 10px;
          width: 32px;
          height: 32px;
          font-size: 0.9rem;
        }
      }
    `,document.head.appendChild(e)}}class S{constructor(e,t,s="",a=""){o(this,"_modal",null);o(this,"isOpen",!1);o(this,"eventListeners",new Map);o(this,"contentUpdateCallback");this.id=e,this.title=t,this.content=s,this.className=a}get modal(){return this._modal}async initialize(){try{this.injectModalStyles(),this.createModal(),this.attachEventListeners(),console.log(`✅ Modal "${this.id}" initialized successfully`)}catch(e){throw console.error(`❌ Failed to initialize modal "${this.id}":`,e),e}}injectModalStyles(){if(document.getElementById("modal-base-styles"))return;const t=document.createElement("style");t.id="modal-base-styles",t.textContent=`
      /* Modal Base Styles - Matching Your Design System */
      .modal {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: none;
        pointer-events: none;
      }

      .modal.show {
        display: flex;
        pointer-events: auto;
      }

      .modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .modal.show .modal-overlay {
        opacity: 1;
      }

      .modal-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 2rem;
        z-index: 10001;
      }

      .modal-content {
        background: var(--bg-2, #2d2d2d);
        border: 1px solid var(--border, #404040);
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        width: 100%;
        max-width: 600px;
        max-height: 85vh;
        overflow: hidden;
        transform: translateY(30px) scale(0.9);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .modal.show .modal-content {
        transform: translateY(0) scale(1);
        opacity: 1;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid var(--border, #404040);
        background: var(--panel, #252525);
      }

      .modal-title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text, #ffffff);
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .modal-title .material-icons {
        font-size: 1.4rem;
        color: var(--accent, #007acc);
      }

      .modal-close {
        background: transparent;
        border: none;
        color: var(--muted, #888);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        font-size: 1.5rem;
        line-height: 1;
      }

      .modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text, #ffffff);
      }

      .modal-close:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 2px var(--accent, #007acc);
      }

      .modal-close svg {
        width: 1.25rem;
        height: 1.25rem;
      }

      .modal-body {
        padding: 0;
        overflow-y: auto;
        max-height: calc(85vh - 100px);
        background: var(--bg-2, #2d2d2d);
      }

      /* Custom scrollbar to match your design */
      .modal-body::-webkit-scrollbar {
        width: 6px;
      }

      .modal-body::-webkit-scrollbar-track {
        background: var(--bg, #1a1a1a);
      }

      .modal-body::-webkit-scrollbar-thumb {
        background: var(--border, #404040);
        border-radius: 3px;
      }

      .modal-body::-webkit-scrollbar-thumb:hover {
        background: var(--muted, #888);
      }

      /* Focus trap styles - invisible */
      .modal-focus-trap {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .modal-container {
          padding: 1rem;
        }

        .modal-content {
          max-width: 100%;
          max-height: 90vh;
          border-radius: 8px;
        }

        .modal-header {
          padding: 1rem 1.5rem;
        }

        .modal-title {
          font-size: 1.1rem;
        }

        .modal-close {
          width: 2rem;
          height: 2rem;
          font-size: 1.25rem;
        }

        .modal-close svg {
          width: 1rem;
          height: 1rem;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .modal-content {
          border: 2px solid var(--text, #ffffff);
        }

        .modal-close:focus {
          outline: 2px solid var(--text, #ffffff);
          outline-offset: 2px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .modal-overlay,
        .modal-content {
          transition: none;
        }

        .modal.show .modal-content {
          transform: none;
        }
      }

      /* Print styles */
      @media print {
        .modal {
          display: none !important;
        }
      }
    `,document.head.appendChild(t)}createModal(){const e=document.getElementById(this.id);e&&e.remove(),this._modal=document.createElement("div"),this._modal.id=this.id,this._modal.className=`modal ${this.className}`,this._modal.setAttribute("role","dialog"),this._modal.setAttribute("aria-modal","true"),this._modal.setAttribute("aria-labelledby",`${this.id}-title`),this._modal.setAttribute("aria-hidden","true"),this._modal.innerHTML=`
      <div class="modal-overlay" aria-hidden="true"></div>
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-focus-trap" tabindex="0"></div>
          <div class="modal-header">
            <h3 class="modal-title" id="${this.id}-title">${this.title}</h3>
            <button class="modal-close" data-action="close" aria-label="Close modal" type="button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div class="modal-body" role="document">
            ${this.content}
          </div>
          <div class="modal-focus-trap" tabindex="0"></div>
        </div>
      </div>
    `,document.body.appendChild(this._modal)}attachEventListeners(){if(!this._modal)return;const e=this._modal.querySelector('[data-action="close"]'),t=r=>{r.preventDefault(),r.stopPropagation(),this.close()};e==null||e.addEventListener("click",t);const s=this._modal.querySelector(".modal-overlay"),a=r=>{r.target===s&&(r.preventDefault(),r.stopPropagation(),this.close())};s==null||s.addEventListener("click",a);const n=this._modal.querySelector(".modal-content"),i=r=>{r.stopPropagation()};n==null||n.addEventListener("click",i);const c=r=>{r.key==="Escape"&&this.isOpen&&(r.preventDefault(),r.stopPropagation(),this.close())};document.addEventListener("keydown",c),this.setupFocusTrap(),this.eventListeners.set("escape",[c]),this.eventListeners.set("close",[t]),this.eventListeners.set("overlay",[a]),this.eventListeners.set("content",[i])}setupFocusTrap(){if(!this._modal)return;const e=this._modal.querySelectorAll(".modal-focus-trap"),t=e[0],s=e[1];t&&s&&(t.addEventListener("focus",()=>{const a=this.getLastFocusableElement();a&&a.focus()}),s.addEventListener("focus",()=>{const a=this.getFirstFocusableElement();a&&a.focus()}))}getFocusableElements(){if(!this._modal)return[];const e=["button:not([disabled])","input:not([disabled])","textarea:not([disabled])","select:not([disabled])","a[href]",'[tabindex]:not([tabindex="-1"])'].join(", "),t=this._modal.querySelectorAll(e);return Array.from(t).filter(s=>{const a=s;return!a.classList.contains("modal-focus-trap")&&a.offsetWidth>0&&a.offsetHeight>0})}getFirstFocusableElement(){return this.getFocusableElements()[0]||null}getLastFocusableElement(){const e=this.getFocusableElements();return e[e.length-1]||null}on(e,t){this.eventListeners.has(e)||this.eventListeners.set(e,[]);const s=this.eventListeners.get(e);s&&s.push(t)}off(e,t){if(!this.eventListeners.has(e))return;const s=this.eventListeners.get(e);if(s)if(t){const a=s.indexOf(t);a>-1&&s.splice(a,1)}else s.length=0}emit(e,...t){const s=this.eventListeners.get(e);s&&s.forEach(a=>{try{a(...t)}catch(n){console.error(`Error in modal event listener for "${e}":`,n)}}),this._modal&&this._modal.dispatchEvent(new CustomEvent(`modal:${e}`,{detail:{modal:this,args:t}}))}open(){if(!this._modal){console.error("Cannot open modal: modal not initialized");return}if(this.isOpen){console.warn("Modal is already open");return}this._modal.classList.add("show"),this._modal.setAttribute("aria-hidden","false"),this.isOpen=!0;const e=document.activeElement;e&&this._modal.setAttribute("data-previous-focus",e.id||""),document.body.style.overflow="hidden",setTimeout(()=>{const t=this.getFirstFocusableElement();t&&t.focus()},150),this.emit("opened"),console.log(`Modal "${this.id}" opened`)}close(){if(!this._modal){console.error("Cannot close modal: modal not initialized");return}if(!this.isOpen){console.warn("Modal is already closed");return}this._modal.classList.remove("show"),this._modal.setAttribute("aria-hidden","true"),this.isOpen=!1,document.body.style.overflow="";const e=this._modal.getAttribute("data-previous-focus");if(e){const t=document.getElementById(e);t&&setTimeout(()=>t.focus(),100)}this.emit("closed"),console.log(`Modal "${this.id}" closed`)}toggle(){this.isOpen?this.close():this.open()}setContentUpdateCallback(e){this.contentUpdateCallback=e}setContent(e){if(!this._modal){console.error("Cannot set content: modal not initialized");return}const t=this._modal.querySelector(".modal-body");t&&(t.innerHTML=e,console.log(`Modal "${this.id}" content updated`),this.emit("content-updated"),this.contentUpdateCallback&&setTimeout(()=>{this.contentUpdateCallback&&this.contentUpdateCallback()},0))}setTitle(e){if(!this._modal){console.error("Cannot set title: modal not initialized");return}this.title=e;const t=this._modal.querySelector(".modal-title");t&&(t.innerHTML=e)}getIsOpen(){return this.isOpen}getElement(){return this._modal}addClass(e){var t;(t=this._modal)==null||t.classList.add(e)}removeClass(e){var t;(t=this._modal)==null||t.classList.remove(e)}hasClass(e){var t;return((t=this._modal)==null?void 0:t.classList.contains(e))??!1}cleanup(){console.log(`🧹 Cleaning up modal "${this.id}"`);const e=this.eventListeners.get("escape");if(e&&e.forEach(t=>{document.removeEventListener("keydown",t)}),this.eventListeners.clear(),this.contentUpdateCallback=void 0,this._modal&&(this._modal.remove(),this._modal=null),this.isOpen=!1,document.body.style.overflow="",!document.querySelector(".modal")){const t=document.getElementById("modal-base-styles");t&&t.remove()}}}o(S,"ANIM_MS",300);class C{constructor(){o(this,"root",null)}async initialize(){console.log("✅ ErrorModal: Ready")}show(e){var s;this.root||(this.root=document.createElement("div"),this.root.id="error-modal",this.root.style.cssText="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);z-index:100000;",this.root.innerHTML=`
        <div style="background:#2b2b2b;color:#fff;border-radius:10px;max-width:420px;width:92vw;padding:18px;box-shadow:0 18px 60px rgba(0,0,0,.5)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:18px">⚠️</span>
            <h3 style="margin:0;font-size:16px">Error</h3>
          </div>
          <div id="error-modal-message" style="white-space:pre-wrap;word-break:break-word;margin:12px 0"></div>
          <div style="display:flex;justify-content:flex-end;gap:8px">
            <button id="error-modal-close" style="border:1px solid #555;background:#444;color:#fff;border-radius:6px;padding:6px 10px;cursor:pointer">OK</button>
          </div>
        </div>
      `,this.root.addEventListener("click",a=>{a.target===this.root&&this.close()}),document.body.appendChild(this.root),(s=this.root.querySelector("#error-modal-close"))==null||s.addEventListener("click",()=>this.close()));const t=this.root.querySelector("#error-modal-message");t&&(t.textContent=e),this.root.style.display="flex"}close(){this.root&&(this.root.style.display="none")}cleanup(){this.root&&(this.root.remove(),this.root=null)}}class z{constructor(){o(this,"errorModal",new C)}async initialize(){await this.errorModal.initialize()}render(e){return`
      <div class="tab-content ${e?"active":""}" id="connect-tab" role="tabpanel" aria-labelledby="connect">
        <div class="tab-section">
          <h4 class="section-title">
            <span class="material-icons">connect_without_contact</span>
            Connect to Peer
          </h4>
          <p class="section-description">Enter the address of a peer to start a secure, encrypted chat session</p>

          <div class="form-group">
            <label class="form-label">
              <span class="material-icons" style="color: var(--accent);">wifi_tethering</span>
              Peer Address (IP:Port)
            </label>
            <input type="text" id="peer-address" class="form-input" placeholder="127.0.0.1:8080" autocomplete="off">
            <small class="form-hint">Example: 192.168.1.100:8080 or your-domain.com:8080</small>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="material-icons" style="color: #22c55e;">chat</span>
              Chat Name
            </label>
            <input type="text" id="chat-name" class="form-input" placeholder="Chat with friend" autocomplete="off">
            <small class="form-hint">Optional: Give this chat a custom name for easy identification</small>
          </div>

          <div class="form-actions">
            <button id="connect-btn" class="btn btn-primary">
              <span class="material-icons btn-icon">link</span>
              <span class="btn-text">Connect Securely</span>
            </button>
          </div>

          <div class="form-actions" style="margin-top:12px">
            <button id="start-server-btn-connect" class="btn btn-secondary">
              <span class="material-icons btn-icon">rocket_launch</span>
              <span class="btn-text">Start Server Instead</span>
            </button>
          </div>
        </div>
      </div>
    `}async handleClick(e,t){const s=e.target;s.closest("#connect-btn")?(e.preventDefault(),await this.handleConnect(t)):s.closest("#start-server-btn-connect")&&(e.preventDefault(),await this.handleStartServer(t))}handleKeydown(e,t){const s=e.target;(s.id==="peer-address"||s.id==="chat-name")&&e.key==="Enter"&&(e.preventDefault(),this.handleConnect(t))}async handleConnect(e){const t=document.querySelector("#peer-address"),s=document.querySelector("#chat-name"),a=document.querySelector("#connect-btn"),n=t==null?void 0:t.value.trim(),i=(s==null?void 0:s.value.trim())||"Unknown Peer";if(!n){this.showError("Please enter a peer address"),t==null||t.focus();return}if(!e.onConnect){this.showError("Connection handler not available");return}this.setButtonLoading(a,!0,"Connecting...");try{await e.onConnect(n,i),t&&(t.value=""),s&&(s.value="")}catch(c){this.showError(`Connection failed: ${c instanceof Error?c.message:"Unknown error"}`)}finally{this.setButtonLoading(a,!1)}}async handleStartServer(e){const t=document.querySelector("#start-server-btn-connect");if(!e.onStartServer){this.showError("Server start handler not available");return}this.setButtonLoading(t,!0,"Starting...");try{await e.onStartServer()}catch(s){this.showError(`Failed to start server: ${s instanceof Error?s.message:"Unknown error"}`),this.setButtonLoading(t,!1)}}setButtonLoading(e,t,s){if(e)if(t){e.disabled=!0;const a=e.innerHTML;e.dataset.originalContent=a;const n=s||"Loading...";e.innerHTML=`<span class="material-icons btn-icon">hourglass_empty</span><span class="btn-text">${n}</span>`,e.classList.add("loading")}else e.disabled=!1,e.dataset.originalContent&&(e.innerHTML=e.dataset.originalContent,delete e.dataset.originalContent),e.classList.remove("loading")}showError(e){this.errorModal.show(e)}cleanup(){this.errorModal.cleanup()}}class E{async initialize(){console.log("🔒 SecuritySettings initialized")}render(){return`
      <div class="security-section">
        <h4>
          <span class="material-icons">security</span>
          Security Settings
        </h4>
        <div class="form-group">
          <label class="form-label">
            <span class="material-icons" style="color: #f59e0b;">vpn_key</span>
            Pre‑Shared Key (PSK)
          </label>
          <input type="password" id="psk-input" class="form-input" placeholder="Optional - Leave empty for default security">
          <small class="form-hint">When set on both peers, connections require a matching PSK for extra security</small>
        </div>
        <div class="form-group">
          <label class="form-label">
            <span class="material-icons" style="color: #ef4444;">block</span>
            Allow Only This IP
          </label>
          <input type="text" id="allow-ip-input" class="form-input" placeholder="Optional (e.g., 203.0.113.5)">
          <small class="form-hint">Leave empty to accept any IP (subject to PSK/rate limits)</small>
        </div>
        <div class="form-group">
          <label class="form-label">
            <span class="material-icons" style="color: #8b5cf6;">public</span>
            Public Host Mode
          </label>
          <div class="toggle" id="public-mode-toggle">
            <input type="checkbox" id="public-mode" class="toggle-input" aria-label="Public Host Mode (allow multiple peers)">
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
            <span class="toggle-label">Allow multiple peers to connect simultaneously</span>
          </div>
          <small class="form-hint">Uncheck to keep a single private line; check to host multiple peers</small>
        </div>
        <div class="form-actions">
          <button id="save-security-btn" class="btn btn-secondary">
            <span class="material-icons btn-icon">save</span>
            <span class="btn-text">Save Security Settings</span>
          </button>
        </div>
      </div>
    `}async handleClick(e){const t=e.target;t.closest("#save-security-btn")&&(e.preventDefault(),await this.saveSecuritySettings());const s=t.closest("#public-mode-toggle");if(s){const a=s.querySelector("#public-mode");a&&t!==a&&(e.preventDefault(),a.checked=!a.checked,a.dispatchEvent(new Event("change",{bubbles:!0})))}}handleChange(e){const t=e.target;if(t.matches("#public-mode")){const s=t,a=s.closest(".toggle");a&&a.classList.toggle("checked",s.checked)}}async saveSecuritySettings(){var r,l,d,p,m,u,g;const e=document.querySelector("#psk-input"),t=document.querySelector("#allow-ip-input"),s=document.querySelector("#public-mode"),a=document.querySelector("#save-security-btn"),n=(e==null?void 0:e.value.trim())||null,i=(t==null?void 0:t.value.trim())||null,c=(s==null?void 0:s.checked)||!1;this.setButtonLoading(a,!0,"Saving...");try{await Promise.all([(l=(r=window.electronAPI)==null?void 0:r.transport)==null?void 0:l.setPSK(n&&n.length?n:null),(p=(d=window.electronAPI)==null?void 0:d.transport)==null?void 0:p.allowOnly(i&&i.length?i:null),(g=(u=(m=window.electronAPI)==null?void 0:m.transport)==null?void 0:u.setPublicMode)==null?void 0:g.call(u,c)]),this.setButtonSuccess(a,"Saved!")}catch(v){console.error("Failed to save security settings:",v),this.setButtonError(a,"Failed")}}setButtonLoading(e,t,s){if(e)if(t){const a=e.innerHTML;e.dataset.originalContent=a,e.innerHTML=`<span class="material-icons btn-icon">hourglass_empty</span><span class="btn-text">${s||"Loading..."}</span>`,e.disabled=!0}else e.dataset.originalContent&&(e.innerHTML=e.dataset.originalContent,delete e.dataset.originalContent),e.disabled=!1}setButtonSuccess(e,t){e&&(e.innerHTML=`<span class="material-icons btn-icon">check</span><span class="btn-text">${t}</span>`,e.classList.add("success"),setTimeout(()=>{e.dataset.originalContent&&(e.innerHTML=e.dataset.originalContent,delete e.dataset.originalContent),e.classList.remove("success")},1500))}setButtonError(e,t){e&&(e.innerHTML=`<span class="material-icons btn-icon">error</span><span class="btn-text">${t}</span>`,e.classList.add("error"),setTimeout(()=>{e.dataset.originalContent&&(e.innerHTML=e.dataset.originalContent,delete e.dataset.originalContent),e.classList.remove("error")},1500))}cleanup(){}}class ${constructor(){o(this,"securitySettings",new E);o(this,"serverInfo",null)}async initialize(){await this.securitySettings.initialize()}render(e,t){return this.serverInfo=t,`
      <div class="tab-content ${e?"active":""}" id="info-tab" role="tabpanel" aria-labelledby="info">
        <div class="tab-section">
          <div class="info-section">
            ${this.renderConnectionInfo()}
            ${this.securitySettings.render()}
            ${this.renderServerActions()}
          </div>
        </div>
      </div>
    `}renderConnectionInfo(){const e=this.serverInfo?"Running":"Not started",t=this.serverInfo?"status-running":"",s=this.serverInfo?`${this.serverInfo.address}:${this.serverInfo.port}`:"Unknown";return`
      <h4>
        <span class="material-icons">router</span>
        Your Connection Info
      </h4>
      <div class="info-item">
        <label>Server Status:</label>
        <span id="modal-server-status" class="status-indicator ${t}">${e}</span>
      </div>
      <div class="info-item">
        <label>Your Address:</label>
        <span id="modal-my-address">${s}</span>
        <button id="copy-address" class="copy-btn" title="Click: copy inside app (auto-clears). Shift/Ctrl/⌘: system clipboard">
          <span class="material-icons">content_copy</span>
        </button>
      </div>
      <div class="info-item">
        <label>Your Public Key:</label>
        <div class="flex-1 flex flex-col gap-2">
          <textarea id="my-public-key" class="key-textarea" readonly placeholder="Loading your public key..."></textarea>
          <button id="copy-key" class="copy-btn self-end" title="Click: copy inside app (auto-clears). Shift/Ctrl/⌘: system clipboard">
            <span class="material-icons">content_copy</span>
          </button>
        </div>
      </div>
    `}renderServerActions(){const e=!!this.serverInfo;return`
      <div class="form-actions" style="margin-top:24px">
        <button id="start-server-btn" class="btn btn-primary" ${e?"disabled":""}>
          <span class="material-icons btn-icon">${e?"check_circle":"rocket_launch"}</span>
          <span class="btn-text">${e?"Server Running":"Start Server"}</span>
        </button>
      </div>
    `}async handleClick(e,t){const s=e.target;s.closest("#copy-address")?(e.preventDefault(),await this.copyAddress()):s.closest("#copy-key")?(e.preventDefault(),await this.copyKey()):s.closest("#start-server-btn")?(e.preventDefault(),await this.handleStartServer(t)):await this.securitySettings.handleClick(e)}async copyAddress(){var s;const e=document.querySelector("#modal-my-address"),t=(s=e==null?void 0:e.textContent)==null?void 0:s.trim();try{t&&t!=="Unknown"&&await this.copyToClipboard(t)}catch(a){console.error("Failed to copy address:",a)}}async copyKey(){var s;const e=document.querySelector("#my-public-key"),t=(s=e==null?void 0:e.value)==null?void 0:s.trim();try{t&&await this.copyToClipboard(t)}catch(a){console.error("Failed to copy key:",a)}}async copyToClipboard(e){var a,n,i;const t=window.event;if(!!!(t&&(t.shiftKey||t.ctrlKey||t.metaKey))&&((a=window.electronAPI)!=null&&a.secureClipboard))await window.electronAPI.secureClipboard.writeText(e,{ttlMs:12e4});else if((n=window.electronAPI)!=null&&n.clipboard)await window.electronAPI.clipboard.writeText(e);else if((i=navigator.clipboard)!=null&&i.writeText)await navigator.clipboard.writeText(e);else throw new Error("No clipboard API available")}async handleStartServer(e){const t=document.querySelector("#start-server-btn");if(!e.onStartServer){console.error("Server start handler not available");return}t&&(t.disabled=!0,t.innerHTML='<span class="material-icons btn-icon">hourglass_empty</span><span class="btn-text">Starting...</span>',t.classList.add("loading"));try{await e.onStartServer()}catch(s){console.error("Failed to start server:",s),t&&(t.disabled=!1,t.innerHTML='<span class="material-icons btn-icon">rocket_launch</span><span class="btn-text">Start Server</span>',t.classList.remove("loading"))}}updateServerInfo(e,t){this.serverInfo={address:e,port:t};const s=document.querySelector("#modal-server-status"),a=document.querySelector("#modal-my-address"),n=document.querySelector("#start-server-btn");s&&(s.textContent="Running",s.className="status-indicator status-running"),a&&(a.textContent=`${e}:${t}`),n&&(n.disabled=!0,n.innerHTML='<span class="material-icons btn-icon">check_circle</span><span class="btn-text">Server Running</span>',n.classList.remove("loading"))}async updateConnectionInfo(){var e;if((e=window.electronAPI)!=null&&e.crypto)try{const t=await window.electronAPI.crypto.getPublicKey(),s=document.querySelector("#my-public-key");s&&t&&(s.value=t)}catch(t){console.error("Failed to get public key:",t)}this.serverInfo&&this.updateServerInfo(this.serverInfo.address,this.serverInfo.port)}cleanup(){this.securitySettings.cleanup()}}class B{async initialize(){this.injectStyles()}injectStyles(){if(document.getElementById("new-chat-modal-styles"))return;const t=document.createElement("style");t.id="new-chat-modal-styles",t.textContent=`
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
    `,document.head.appendChild(t)}cleanup(){const e=document.getElementById("new-chat-modal-styles");e&&e.remove()}}class D{constructor(e={}){o(this,"modal");o(this,"callbacks",{});o(this,"serverInfo",null);o(this,"errorModal",new C);o(this,"currentTab","connect");o(this,"connectionForm");o(this,"infoPanel");o(this,"securitySettings");o(this,"styles");this.callbacks=e,this.styles=new B,this.connectionForm=new z,this.infoPanel=new $,this.securitySettings=new E,this.modal=new S("new-chat-modal",'<span class="material-icons" style="vertical-align: middle; margin-right: 8px;">add_circle</span>Create New Chat',this.getModalContent(),"new-chat-modal")}async initialize(){await Promise.all([this.modal.initialize(),this.styles.initialize(),this.connectionForm.initialize(),this.infoPanel.initialize(),this.securitySettings.initialize()]),this.modal.setContentUpdateCallback(()=>{this.bindDelegatedHandlers()}),this.bindDelegatedHandlers()}getModalContent(){return`
      <div class="new-chat-content">
        ${this.renderTabNavigation()}
        ${this.connectionForm.render(this.currentTab==="connect")}
        ${this.infoPanel.render(this.currentTab==="info",this.serverInfo)}
      </div>
    `}renderTabNavigation(){return`
      <div class="connection-tabs" role="tablist" aria-label="New Chat Tabs">
        <button class="tab-btn ${this.currentTab==="connect"?"active":""}" data-tab="connect" role="tab" aria-selected="${this.currentTab==="connect"}" aria-controls="connect-tab">
          <span class="material-icons tab-icon">connect_without_contact</span>
          <span class="tab-label">Connect to Peer</span>
        </button>
        <button class="tab-btn ${this.currentTab==="info"?"active":""}" data-tab="info" role="tab" aria-selected="${this.currentTab==="info"}" aria-controls="info-tab">
          <span class="material-icons tab-icon">info</span>
          <span class="tab-label">My Connection Info</span>
        </button>
      </div>
    `}bindDelegatedHandlers(){const e=this.modal.getElement();if(!e)return;const t=e._newChatHandler;t&&(e.removeEventListener("click",t),e.removeEventListener("change",t));const s=async n=>{const c=n.target.closest(".tab-btn");if(c&&c.dataset.tab)return n.preventDefault(),n.stopPropagation(),this.switchTab(c.dataset.tab),!1;this.currentTab==="connect"?await this.connectionForm.handleClick(n,this.callbacks):await this.infoPanel.handleClick(n,this.callbacks)},a=n=>{this.currentTab==="info"&&this.securitySettings.handleChange(n)};e._newChatHandler=s,e._newChatChangeHandler=a,e.addEventListener("click",s,!0),e.addEventListener("change",a,!0),e.addEventListener("keydown",n=>{this.currentTab==="connect"&&this.connectionForm.handleKeydown(n,this.callbacks)})}switchTab(e){this.currentTab=e,this.modal.setContent(this.getModalContent()),this.bindDelegatedHandlers(),e==="info"?this.updateConnectionInfo().catch(()=>{}):setTimeout(()=>{var s;const t=this.modal.getElement();(s=t==null?void 0:t.querySelector("#peer-address"))==null||s.focus()},100)}open(){this.modal.setContent(this.getModalContent()),this.bindDelegatedHandlers(),this.modal.open(),this.currentTab==="connect"?setTimeout(()=>{var t;const e=this.modal.getElement();(t=e==null?void 0:e.querySelector("#peer-address"))==null||t.focus()},100):this.updateConnectionInfo().catch(()=>{})}close(){this.modal.close()}updateServerInfo(e,t){this.serverInfo={address:e,port:t},this.infoPanel.updateServerInfo(e,t)}async updateConnectionInfo(){await this.infoPanel.updateConnectionInfo()}setCallbacks(e){this.callbacks={...this.callbacks,...e}}cleanup(){var e;this.styles.cleanup(),this.connectionForm.cleanup(),this.infoPanel.cleanup(),this.securitySettings.cleanup(),(e=this.modal)==null||e.cleanup()}}class F{constructor(){o(this,"canvas");o(this,"ctx");this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("2d")}async initialize(){console.log("🖼️ ImageProcessor: Initialized")}async sanitizeIncomingImage(e,t="image.jpg",s={}){const a=s.mimeType??"image/jpeg",n=typeof s.quality=="number"?s.quality:.85,i=s.maxWidth??1600,c=s.maxHeight??1200;return new Promise((r,l)=>{const d=new Image;d.onload=()=>{try{const{width:p,height:m}=this.calculateDimensions(d.width,d.height,i,c);this.canvas.width=p,this.canvas.height=m,this.ctx.drawImage(d,0,0,p,m);const u=this.canvas.toDataURL(a,n),g=this.calculateDimensions(p,m,150,100);this.canvas.width=g.width,this.canvas.height=g.height,this.ctx.drawImage(d,0,0,g.width,g.height);const v=this.canvas.toDataURL(a,.6);r({filename:this.sanitizeFileName(t,a),mimeType:a,size:this.calculateBase64Size(u),width:p,height:m,data:u,thumbnail:v})}catch(p){l(p)}},d.onerror=()=>l(new Error("Failed to load incoming image")),d.src=e})}sanitizeFileName(e,t){var i;const s=t.includes("png")?"png":"jpg";return`${(((i=e.split("/").pop())==null?void 0:i.split("\\").pop())||"image").replace(/\.[^/.]+$/,"").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,32)||"image"}.${s}`}async processImageFile(e){return new Promise((t,s)=>{if(!e.type.startsWith("image/")){s(new Error("Selected file is not an image"));return}const a=new FileReader;a.onload=async n=>{var i;try{const c=(i=n.target)==null?void 0:i.result,r=new Image;r.onload=async()=>{try{const{width:p,height:m}=this.calculateDimensions(r.width,r.height,800,600);this.canvas.width=p,this.canvas.height=m,this.ctx.drawImage(r,0,0,p,m);const u=this.canvas.toDataURL("image/jpeg",.8),f=this.calculateDimensions(r.width,r.height,150,100);this.canvas.width=f.width,this.canvas.height=f.height,this.ctx.drawImage(r,0,0,f.width,f.height);const x=this.canvas.toDataURL("image/jpeg",.6),k={filename:this.sanitizeFileName(e.name,"image/jpeg"),mimeType:"image/jpeg",size:this.calculateBase64Size(u),width:p,height:m,data:u,thumbnail:x};t(k)}catch(l){s(l)}},r.onerror=()=>s(new Error("Failed to load image")),r.src=c}catch(c){s(c)}},a.onerror=()=>s(new Error("Failed to read image file")),a.readAsDataURL(e)})}calculateDimensions(e,t,s,a){let{width:n,height:i}={width:e,height:t};return n>s&&(i=i*s/n,n=s),i>a&&(n=n*a/i,i=a),{width:Math.round(n),height:Math.round(i)}}calculateBase64Size(e){const t=e.split(",")[1];return Math.round(t.length*3/4)}async createImagePreview(e){const t=document.createElement("div");t.className="image-preview";const s=document.createElement("img");s.src=e.thumbnail||e.data,s.alt=e.filename,s.className="preview-image";const a=document.createElement("div");return a.className="image-info",a.innerHTML=`
      <div class="filename">${e.filename}</div>
      <div class="details">${this.formatFileSize(e.size)} • ${e.width}×${e.height}</div>
    `,t.appendChild(s),t.appendChild(a),t}formatFileSize(e){if(e===0)return"0 B";const t=1024,s=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${s[a]}`}cleanup(){this.canvas.width=0,this.canvas.height=0}}class L{constructor(){o(this,"overlay",null);o(this,"imgEl",null);o(this,"captionEl",null);o(this,"toolbarEl",null);o(this,"onKeyDown",null);o(this,"scale",1);o(this,"rotation",0);o(this,"translateX",0);o(this,"translateY",0);o(this,"minScale",.5);o(this,"maxScale",5);o(this,"isPanning",!1);o(this,"panStartX",0);o(this,"panStartY",0);o(this,"startTranslateX",0);o(this,"startTranslateY",0);o(this,"activePointers",new Map);o(this,"pinchStartDist",0);o(this,"pinchStartScale",1);o(this,"pinchCenter",{x:0,y:0});o(this,"onPointerDown",e=>{var t,s;if(this.imgEl){if((s=(t=e.target).setPointerCapture)==null||s.call(t,e.pointerId),this.activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),this.activePointers.size===1)this.isPanning=!0,this.panStartX=e.clientX,this.panStartY=e.clientY,this.startTranslateX=this.translateX,this.startTranslateY=this.translateY,this.applyTransform();else if(this.activePointers.size===2){const a=Array.from(this.activePointers.values());this.pinchStartDist=Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y)||1,this.pinchStartScale=this.scale,this.pinchCenter={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}}}});o(this,"onPointerMove",e=>{if(!this.overlay||!this.imgEl)return;const t=this.activePointers.get(e.pointerId);if(t){if((this.isPanning||this.activePointers.size>=2)&&e.preventDefault(),t.x=e.clientX,t.y=e.clientY,this.activePointers.size===1&&this.isPanning){const s=e.clientX-this.panStartX,a=e.clientY-this.panStartY;this.translateX=this.startTranslateX+s,this.translateY=this.startTranslateY+a,this.applyTransform()}else if(this.activePointers.size===2){const s=Array.from(this.activePointers.values()),a=Math.hypot(s[1].x-s[0].x,s[1].y-s[0].y)||1,n=this.clamp(a/this.pinchStartDist*(this.pinchStartScale/this.scale),.2,5);this.zoomAtPoint(n,this.pinchCenter.x,this.pinchCenter.y)}}});o(this,"onPointerUp",e=>{this.activePointers.delete(e.pointerId),this.activePointers.size<=1&&this.endPan()})}async initialize(){var s;if(this.overlay)return;const e=document.createElement("div");e.id="image-viewer",e.className="image-viewer",e.style.position="fixed",e.style.inset="0",e.style.display="none",e.style.alignItems="center",e.style.justifyContent="center",e.style.zIndex="100000",e.style.background="rgba(0,0,0,0.85)",e.style.backdropFilter="blur(2px)",e.innerHTML=`
      <div class="image-viewer-content" style="
        position: relative;
        max-width: 92vw;
        max-height: 92vh;
      ">
        <button class="image-viewer-close" aria-label="Close" style="
          position: absolute;
          top: -14px;
          right: -14px;
          width: 36px;
          height: 36px;
          border-radius: 18px;
          border: none;
          background: rgba(0,0,0,0.65);
          color: #fff;
          cursor: pointer;
          font-size: 18px;
          line-height: 36px;
          text-align: center;
          box-shadow: 0 4px 18px rgba(0,0,0,0.4);
        ">✕</button>
        <img class="image-viewer-img" alt="" style="
          display: block;
          max-width: 92vw;
          max-height: 82vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6);
          user-select: none;
          touch-action: none; /* enable pinch-zoom via pointer events */
          cursor: grab;
        ">
        <div class="image-viewer-caption" style="
          margin-top: 0.5rem;
          text-align: center;
          color: rgba(255,255,255,0.85);
          font-size: 0.9rem;
          max-width: 92vw;
          word-break: break-word;
        "></div>

        <!-- Toolbar -->
        <div class="image-viewer-toolbar" style="
          position: absolute;
          left: 50%;
          bottom: -44px;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 6px 8px;
          backdrop-filter: blur(4px);
        ">
          <button data-action="zoom-out" title="Zoom Out (-)" style="${y()}">➖</button>
          <button data-action="zoom-in" title="Zoom In (+)" style="${y()}">➕</button>
          <button data-action="reset" title="Reset (0)" style="${y()}">⟲</button>
          <button data-action="rotate-left" title="Rotate Left (L)" style="${y()}">⟲90°</button>
          <button data-action="rotate-right" title="Rotate Right (R)" style="${y()}">⟳90°</button>
          <button data-action="download" title="Download" style="${y()}">⬇</button>
        </div>
      </div>
    `,document.body.appendChild(e),this.overlay=e,this.imgEl=e.querySelector(".image-viewer-img"),this.captionEl=e.querySelector(".image-viewer-caption"),this.toolbarEl=e.querySelector(".image-viewer-toolbar"),this.imgEl.style.transformOrigin="0 0";const t=e.querySelector(".image-viewer-close");t==null||t.addEventListener("click",()=>this.close()),e.addEventListener("click",a=>{a.target===e&&this.close()}),this.onKeyDown=a=>{switch(a.key){case"Escape":this.close();break;case"+":case"=":this.zoomAtViewport(1.2);break;case"-":case"_":this.zoomAtViewport(1/1.2);break;case"0":this.resetTransform();break;case"r":case"R":this.rotate(90);break;case"l":case"L":this.rotate(-90);break;case"ArrowLeft":this.panBy(40,0);break;case"ArrowRight":this.panBy(-40,0);break;case"ArrowUp":this.panBy(0,40);break;case"ArrowDown":this.panBy(0,-40);break}},(s=this.toolbarEl)==null||s.addEventListener("click",a=>{const n=a.target;if(!(n instanceof HTMLButtonElement))return;const i=n.getAttribute("data-action");i&&(i==="zoom-in"&&this.zoomAtViewport(1.2),i==="zoom-out"&&this.zoomAtViewport(1/1.2),i==="reset"&&this.resetTransform(),i==="rotate-left"&&this.rotate(-90),i==="rotate-right"&&this.rotate(90),i==="download"&&this.downloadCurrent())}),this.imgEl.addEventListener("wheel",a=>{a.preventDefault();const n=a.deltaY<0?1.1:1/1.1;this.zoomAtPoint(n,a.clientX,a.clientY)},{passive:!1}),this.imgEl.addEventListener("dblclick",a=>{a.preventDefault();const n=this.scale<1.25?2:1;this.zoomAtPoint(n/this.scale,a.clientX,a.clientY)}),this.imgEl.addEventListener("pointerdown",this.onPointerDown,{passive:!0}),window.addEventListener("pointermove",this.onPointerMove,{passive:!1}),window.addEventListener("pointerup",this.onPointerUp,{passive:!0}),window.addEventListener("pointercancel",this.onPointerUp,{passive:!0})}open(e,t="Image",s=""){if(!this.overlay||!this.imgEl||!this.captionEl){this.initialize().then(()=>this.open(e,t,s)).catch(console.error);return}document.body.appendChild(this.overlay),this.imgEl.src="",this.imgEl.alt=t||"Image",this.captionEl.textContent=s||"",this.resetTransform(),this.overlay.style.display="flex",document.body.classList.add("lightbox-open"),this.onKeyDown&&document.addEventListener("keydown",this.onKeyDown);const a=()=>i(),n=()=>{this.captionEl&&(this.captionEl.textContent=s?`${s} (failed to load)`:"Image failed to load"),i()},i=c=>{var r,l;(r=this.imgEl)==null||r.removeEventListener("load",a),(l=this.imgEl)==null||l.removeEventListener("error",n)};this.imgEl.addEventListener("load",a,{once:!0}),this.imgEl.addEventListener("error",n,{once:!0}),this.imgEl.src=e,window.setTimeout(()=>{this.overlay&&this.overlay.style.display==="flex"&&this.imgEl&&this.imgEl.src},100)}close(){this.overlay&&(this.overlay.style.display="none",document.body.classList.remove("lightbox-open"),this.onKeyDown&&document.removeEventListener("keydown",this.onKeyDown),this.endPan(),this.activePointers.clear())}cleanup(){this.overlay&&(this.overlay.remove(),this.overlay=null,this.imgEl=null,this.captionEl=null,this.toolbarEl=null),this.onKeyDown=null,this.activePointers.clear()}applyTransform(){this.imgEl&&(this.imgEl.style.transform=`translate(${this.translateX}px, ${this.translateY}px) rotate(${this.rotation}deg) scale(${this.scale})`,this.imgEl.style.cursor=this.scale>1?this.isPanning?"grabbing":"grab":"auto")}resetTransform(){this.scale=1,this.rotation=0,this.translateX=0,this.translateY=0,this.applyTransform()}rotate(e){this.rotation=(this.rotation+e)%360,this.applyTransform()}panBy(e,t){this.translateX+=e,this.translateY+=t,this.applyTransform()}zoomAtViewport(e){const t=window.innerWidth/2,s=window.innerHeight/2;this.zoomAtPoint(e,t,s)}zoomAtPoint(e,t,s){if(!this.overlay||!this.imgEl)return;const a=this.clamp(this.scale*e,this.minScale,this.maxScale),n=a/this.scale;if(n===1)return;const i=this.overlay.getBoundingClientRect(),c=t-i.left,r=s-i.top;this.translateX=(1-n)*c+n*this.translateX,this.translateY=(1-n)*r+n*this.translateY,this.scale=a,this.applyTransform()}clamp(e,t,s){return Math.max(t,Math.min(s,e))}endPan(){this.isPanning=!1,this.applyTransform()}downloadCurrent(){if(!this.imgEl||!this.imgEl.src)return;const e=document.createElement("a");e.href=this.imgEl.src,e.download="image",document.body.appendChild(e),e.click(),e.remove()}}function y(){return["border: 1px solid rgba(255,255,255,0.15)","background: rgba(0,0,0,0.35)","color: #fff","border-radius: 6px","padding: 6px 8px","cursor: pointer","font-size: 14px","line-height: 1"].join(";")}const b=class b{constructor(){o(this,"events",new Map)}static getInstance(){return b.instance||(b.instance=new b),b.instance}on(e,t){this.events.has(e)||this.events.set(e,[]),this.events.get(e).push(t)}off(e,t){const s=this.events.get(e);if(s){const a=s.indexOf(t);a>-1&&s.splice(a,1)}}emit(e,...t){const s=this.events.get(e);s&&s.forEach(a=>{try{a(...t)}catch(n){console.error(`Error in event callback for "${e}":`,n)}})}once(e,t){const s=(...a)=>{t(...a),this.off(e,s)};this.on(e,s)}};o(b,"instance");let w=b;class H{constructor(){o(this,"eventBus",w.getInstance());o(this,"savedChatId",null)}async initialize(){await this.ensureSavedChat(),this.setupEventListeners(),this.injectStyles()}injectStyles(){if(document.getElementById("saved-messages-styles"))return;const t=document.createElement("style");t.id="saved-messages-styles",t.textContent=`
      /* Save Message Notification */
      .save-notification {
        position: fixed;
        top: 20px;
        right: -300px;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 
          0 8px 32px rgba(40, 167, 69, 0.3),
          0 2px 8px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(40, 167, 69, 0.4);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 280px;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transform: translateX(0);
      }

      .save-notification::before {
        content: 'bookmark_added';
        font-family: 'Material Icons';
        font-size: 1.3rem;
        flex-shrink: 0;
        animation: pulse 2s ease-in-out infinite;
      }

      .save-notification.show {
        right: 20px;
        transform: translateX(0) scale(1);
      }

      .save-notification.hide {
        right: -300px;
        transform: translateX(20px) scale(0.95);
        opacity: 0;
      }

      @keyframes pulse {
        0%, 100% { 
          opacity: 1; 
          transform: scale(1);
        }
        50% { 
          opacity: 0.8; 
          transform: scale(1.05);
        }
      }

      /* Saved Messages Button Styles */
      .save-message-btn {
        background: rgba(40, 167, 69, 0.1);
        border: 1px solid rgba(40, 167, 69, 0.3);
        color: #28a745;
        padding: 0.375rem 0.75rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-height: 32px;
      }

      .save-message-btn::before {
        content: 'bookmark_border';
        font-family: 'Material Icons';
        font-size: 0.9rem;
      }

      .save-message-btn:hover {
        background: rgba(40, 167, 69, 0.2);
        border-color: rgba(40, 167, 69, 0.5);
        color: #20c997;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
      }

      .save-message-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(40, 167, 69, 0.2);
      }

      /* Saved Messages Chat Indicator */
      .chat-item[data-chat-type="saved"] {
        background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.05) 100%);
        border: 1px solid rgba(40, 167, 69, 0.2);
      }

      .chat-item[data-chat-type="saved"] .chat-name::before {
        content: 'bookmark';
        font-family: 'Material Icons';
        font-size: 1.1rem;
        margin-right: 0.5rem;
        color: #28a745;
      }

      .chat-item[data-chat-type="saved"]:hover {
        background: linear-gradient(135deg, rgba(40, 167, 69, 0.15) 0%, rgba(32, 201, 151, 0.08) 100%);
        border-color: rgba(40, 167, 69, 0.3);
      }

      .chat-item[data-chat-type="saved"].active {
        background: linear-gradient(135deg, rgba(40, 167, 69, 0.2) 0%, rgba(32, 201, 151, 0.1) 100%);
        border-color: #28a745;
        box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.1);
      }

      /* Saved Messages Welcome Styles */
      .saved-messages-welcome {
        background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.05) 100%);
        border: 1px solid rgba(40, 167, 69, 0.2);
        border-radius: 12px;
        padding: 2rem;
        margin: 1rem 0;
        text-align: center;
      }

      .saved-messages-welcome h3 {
        color: #28a745;
        font-size: 1.3rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .saved-messages-welcome h3::before {
        content: 'bookmark_added';
        font-family: 'Material Icons';
        font-size: 1.5rem;
      }

      .saved-messages-welcome p {
        color: #ccc;
        line-height: 1.6;
        margin-bottom: 0.75rem;
      }

      .saved-messages-welcome ul {
        text-align: left;
        color: #ddd;
        margin: 1rem 0;
        padding-left: 1.5rem;
      }

      .saved-messages-welcome li {
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .saved-messages-welcome li::before {
        font-family: 'Material Icons';
        font-size: 1rem;
        color: #28a745;
      }

      .saved-messages-welcome li:nth-child(1)::before { content: 'message'; }
      .saved-messages-welcome li:nth-child(2)::before { content: 'image'; }
      .saved-messages-welcome li:nth-child(3)::before { content: 'note'; }

      /* Forwarded Message Indicator */
      .message.forwarded {
        position: relative;
        border-left: 3px solid #28a745;
        padding-left: 1rem;
      }

      .message.forwarded::before {
        content: 'reply';
        font-family: 'Material Icons';
        position: absolute;
        left: -2px;
        top: 0.5rem;
        font-size: 0.8rem;
        color: #28a745;
        background: var(--bg);
        padding: 2px;
        border-radius: 50%;
      }

      .forwarded-prefix {
        color: #28a745;
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .forwarded-prefix::before {
        content: 'forward';
        font-family: 'Material Icons';
        font-size: 0.9rem;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .save-notification {
          right: -280px;
          min-width: 260px;
          top: 80px;
        }

        .save-notification.show {
          right: 10px;
        }

        .save-message-btn {
          padding: 0.3rem 0.6rem;
          font-size: 0.75rem;
          min-height: 28px;
        }

        .saved-messages-welcome {
          padding: 1.5rem;
          margin: 0.5rem 0;
        }
      }

      /* Dark theme enhancements */
      @media (prefers-color-scheme: dark) {
        .save-notification {
          background: linear-gradient(135deg, #1e7e34 0%, #28a745 100%);
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .save-message-btn {
          border-width: 2px;
        }

        .chat-item[data-chat-type="saved"] {
          border-width: 2px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .save-notification {
          transition: opacity 0.2s ease;
        }

        .save-notification::before {
          animation: none;
        }

        .save-message-btn {
          transition: none;
        }

        .save-message-btn:hover {
          transform: none;
        }
      }
    `,document.head.appendChild(t)}setupEventListeners(){this.eventBus.on("saved-messages:save",e=>this.saveMessageToSaved(e)),this.eventBus.on("saved-messages:show",()=>this.showSavedMessages())}async ensureSavedChat(){try{const e=await window.electronAPI.db.getChats(),t=e.find(i=>i.type==="saved")||e.find(i=>i.name.includes("Saved Messages"));if(t){this.savedChatId=t.id;return}const s={name:"Saved Messages",participants:["me"],type:"saved"},a=await window.electronAPI.db.saveChat(s);this.savedChatId=a.id;const n={chatId:this.savedChatId,content:this.getWelcomeMessage(),sender:"system",type:"system",encrypted:!1};await window.electronAPI.db.saveMessage(n)}catch(e){console.error("Failed to ensure Saved Messages chat:",e)}}getWelcomeMessage(){return`<div class="saved-messages-welcome">
      <h3>Welcome to Saved Messages!</h3>
      <p>Forward messages here to keep them handy. Perfect for:</p>
      <ul>
        <li>Text messages</li>
        <li>Images and media</li>
        <li>Important notes</li>
      </ul>
      <p><strong>Tip:</strong> Use the bookmark button next to messages to save them here instantly.</p>
    </div>`}async saveMessageToSaved(e){try{if(this.savedChatId||await this.ensureSavedChat(),!this.savedChatId)return;const t=this.formatForwardedMessage(e),s={chatId:this.savedChatId,content:t,sender:"me",type:e.type,encrypted:!1,imageData:e.imageData,replyTo:e.id},a=await window.electronAPI.db.saveMessage(s);this.eventBus.emit("message:sent",a),this.eventBus.emit("chat:updated",this.savedChatId),this.showSaveNotification()}catch(t){console.error("Failed to save message:",t),this.showErrorNotification("Failed to save message")}}formatForwardedMessage(e){const t=new Date(e.timestamp).toLocaleString(),s=e.sender==="me"?"You":"Peer";return e.type==="image"?`<div class="forwarded-prefix">Forwarded ${e.type} from ${s} • ${t}</div>${e.content}`:`<div class="forwarded-prefix">Forwarded from ${s} • ${t}</div>${e.content}`}async showSavedMessages(){this.savedChatId||await this.ensureSavedChat(),this.savedChatId&&this.eventBus.emit("chat:selected",this.savedChatId)}showSaveNotification(){document.querySelectorAll(".save-notification").forEach(s=>s.remove());const t=document.createElement("div");t.className="save-notification",t.innerHTML="Saved to Saved Messages",document.body.appendChild(t),requestAnimationFrame(()=>{t.classList.add("show")}),setTimeout(()=>{t.classList.add("hide"),setTimeout(()=>{t.parentNode&&t.remove()},400)},3e3)}showErrorNotification(e){const t=document.createElement("div");t.className="save-notification error",t.style.background="linear-gradient(135deg, #dc3545 0%, #c82333 100%)",t.innerHTML=`<span class="material-icons">error</span>${e}`,document.body.appendChild(t),requestAnimationFrame(()=>{t.classList.add("show")}),setTimeout(()=>{t.classList.add("hide"),setTimeout(()=>{t.parentNode&&t.remove()},400)},4e3)}async getSavedMessages(){try{return this.savedChatId||await this.ensureSavedChat(),this.savedChatId?await window.electronAPI.db.getMessages(this.savedChatId):[]}catch(e){return console.error("Failed to get saved messages:",e),[]}}getSavedChatId(){return this.savedChatId}cleanup(){const e=document.getElementById("saved-messages-styles");e&&e.remove(),document.querySelectorAll(".save-notification").forEach(s=>s.remove()),this.eventBus.off("saved-messages:save"),this.eventBus.off("saved-messages:show")}}class _{constructor(e={autoStart:!0}){o(this,"eventBus",w.getInstance());o(this,"serverInfo",null);o(this,"config");o(this,"bound",!1);this.config=e}async initialize(){this.setupTransportListeners(),this.setupEventListeners(),this.config.autoStart&&await this.startServer(this.config.port)}setupEventListeners(){this.eventBus.on("network:connect-request",async({address:e,port:t})=>{try{await this.connectToPeer(e,t)}catch(s){console.error("Failed to connect to peer:",s),this.eventBus.emit("status:updated",{step:"Peer Connection",status:"error",message:s instanceof Error?s.message:"Failed to connect to peer",timestamp:Date.now()})}}),this.eventBus.on("network:start-server-request",async()=>{try{await this.startServer()}catch(e){console.error("Failed to start server:",e),this.eventBus.emit("status:updated",{step:"Server Start",status:"error",message:e instanceof Error?e.message:"Failed to start server",timestamp:Date.now()})}}),this.eventBus.on("network:get-server-info",()=>{this.serverInfo&&this.eventBus.emit("network:server-started",this.serverInfo)})}setupTransportListeners(){var e,t,s;this.bound||(this.bound=!0,(e=window.electronAPI)!=null&&e.transport&&(window.electronAPI.transport.onPeerConnected((a,n)=>{this.eventBus.emit("peer:connected",a,n)}),window.electronAPI.transport.onPeerDisconnected(a=>{this.eventBus.emit("peer:disconnected",a)}),window.electronAPI.transport.onMessage((a,n)=>{this.eventBus.emit("message:received",{chatId:a,data:n})}),(s=(t=window.electronAPI.transport).onSignal)==null||s.call(t,(a,n)=>{this.eventBus.emit("signal:received",a,n)})))}async startServer(e){try{this.eventBus.emit("status:updated",{step:"Network Setup",status:"pending",message:"Starting server...",timestamp:Date.now()}),this.serverInfo=await window.electronAPI.transport.startServer(e),this.eventBus.emit("status:updated",{step:"Network Setup",status:"success",message:`Server listening on ${this.serverInfo.address}:${this.serverInfo.port}`,timestamp:Date.now()}),this.eventBus.emit("network:server-started",this.serverInfo)}catch(t){throw this.eventBus.emit("status:updated",{step:"Network Setup",status:"error",message:t instanceof Error?t.message:"Failed to start server",timestamp:Date.now()}),t}}async connectToPeer(e,t){var s;if(!((s=window.electronAPI)!=null&&s.transport))throw new Error("Transport API not available");try{console.log(`Connecting to ${e}:${t}...`);const a=await window.electronAPI.transport.connect(e,t);if(typeof a=="boolean")return a;if(!a.ok){const n=a.reason,i=n==="occupied"||n==="already_connected"?"The line is already busy.":n==="unauthorized"?"Connection rejected: invalid PSK.":n==="rate_limited"?"The server is busy. Please try again in a moment.":n==="timeout"?"Connection timed out.":"Network error. Please try again.";throw new Error(i)}return!0}catch(a){throw console.error("Connection error:",a),a}}async sendMessage(e,t){var s;if(!((s=window.electronAPI)!=null&&s.transport))throw new Error("Transport API not available");try{if(!await window.electronAPI.transport.send(e,{content:t.content,timestamp:Date.now(),...t}))throw new Error("Failed to send message - transport returned false")}catch(a){throw console.error("Failed to send message via transport:",a),a}}getServerInfo(){return this.serverInfo}cleanup(){this.eventBus.off("network:connect-request",this.handleConnectRequest.bind(this)),this.eventBus.off("network:start-server-request",this.handleStartServerRequest.bind(this)),this.eventBus.off("network:get-server-info",this.handleGetServerInfo.bind(this))}async handleConnectRequest({address:e,port:t}){try{await this.connectToPeer(e,t)}catch(s){console.error("Failed to connect to peer:",s),this.eventBus.emit("status:updated",{step:"Peer Connection",status:"error",message:s instanceof Error?s.message:"Failed to connect to peer",timestamp:Date.now()})}}async handleStartServerRequest(){try{await this.startServer()}catch(e){console.error("Failed to start server:",e),this.eventBus.emit("status:updated",{step:"Server Start",status:"error",message:e instanceof Error?e.message:"Failed to start server",timestamp:Date.now()})}}handleGetServerInfo(){this.serverInfo&&this.eventBus.emit("network:server-started",this.serverInfo)}}class N{constructor(){o(this,"modal");this.modal=new S("shortcuts-modal",'<span class="material-icons" style="vertical-align: middle; margin-right: 8px;">keyboard</span>Keyboard Shortcuts',this.getContent(),"shortcuts-modal")}async initialize(){await this.modal.initialize(),this.injectStyles()}injectStyles(){if(document.getElementById("shortcuts-modal-styles"))return;const t=document.createElement("style");t.id="shortcuts-modal-styles",t.textContent=`
      /* ShortcutsModal - Matching Your Design System */
      .shortcuts-container {
        padding: 2rem;
        max-height: 70vh;
        overflow-y: auto;
        background: var(--bg-2);
      }

      .shortcuts-intro {
        color: var(--muted);
        font-size: 0.9rem;
        margin-bottom: 2rem;
        text-align: center;
        padding: 1rem;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 8px;
      }

      .shortcuts-intro .material-icons {
        color: var(--accent);
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        display: block;
      }

      .shortcut-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 2rem 0 1rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text);
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.5rem;
      }

      .shortcut-section .material-icons {
        color: var(--accent);
        font-size: 1.2rem;
      }

      .shortcuts-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      @media (min-width: 768px) {
        .shortcuts-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .shortcut-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .shortcut-item:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--accent);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .shortcut-keys {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        min-width: 140px;
        flex-shrink: 0;
      }

      .shortcut-item kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2rem;
        height: 1.75rem;
        padding: 0 0.5rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text);
        font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        font-size: 0.75rem;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.15s ease;
      }

      .shortcut-item:hover kbd {
        background: var(--panel);
        border-color: var(--accent);
        color: var(--accent);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      }

      .shortcut-plus {
        color: var(--muted);
        font-weight: 500;
        font-size: 0.8rem;
        margin: 0 0.25rem;
      }

      .shortcut-desc {
        color: var(--text);
        font-size: 0.9rem;
        flex: 1;
      }

      .shortcut-item:hover .shortcut-desc {
        color: var(--text);
      }

      .shortcuts-hint {
        margin-top: 2rem;
        padding: 1rem;
        background: rgba(0, 122, 204, 0.1);
        border: 1px solid rgba(0, 122, 204, 0.2);
        border-radius: 8px;
        color: var(--accent);
        font-size: 0.9rem;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .shortcuts-hint::before {
        content: 'lightbulb';
        font-family: 'Material Icons';
        font-size: 1.1rem;
      }

      /* Scrollbar styling */
      .shortcuts-container::-webkit-scrollbar {
        width: 6px;
      }

      .shortcuts-container::-webkit-scrollbar-track {
        background: var(--bg);
      }

      .shortcuts-container::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
      }

      .shortcuts-container::-webkit-scrollbar-thumb:hover {
        background: var(--muted);
      }

      /* Responsive design */
      @media (max-width: 640px) {
        .shortcuts-container {
          padding: 1.5rem;
        }

        .shortcut-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
        }

        .shortcut-keys {
          min-width: 100%;
          justify-content: flex-start;
        }

        .shortcut-desc {
          font-size: 0.8rem;
        }

        .shortcuts-grid {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
      }

      /* High contrast support */
      @media (prefers-contrast: high) {
        .shortcut-item {
          border: 2px solid var(--border);
        }

        .shortcut-item kbd {
          border: 2px solid var(--text);
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .shortcut-item {
          transition: none;
          transform: none;
        }

        .shortcut-item:hover {
          transform: none;
        }
      }
    `,document.head.appendChild(t)}getContent(){return`
      <div class="shortcuts-container">
        <div class="shortcuts-intro">
          <span class="material-icons">info</span>
          Quick reference for keyboard shortcuts. Some shortcuts work only when a chat is selected.
        </div>

        <div class="shortcut-section">
          <span class="material-icons">chat</span>
          Chat Actions
        </div>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Enter</kbd>
            </div>
            <div class="shortcut-desc">Send message to current chat</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>T</kbd>
            </div>
            <div class="shortcut-desc">Focus the message input field</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>O</kbd>
            </div>
            <div class="shortcut-desc">Open image picker to send photos</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>Shift</kbd><span class="shortcut-plus">+</span><kbd>C</kbd>
            </div>
            <div class="shortcut-desc">Copy revealed message or last message</div>
          </div>
        </div>

        <div class="shortcut-section">
          <span class="material-icons">navigation</span>
          Navigation
        </div>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>N</kbd>
            </div>
            <div class="shortcut-desc">Open "New Chat" modal</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Esc</kbd>
            </div>
            <div class="shortcut-desc">Hide revealed message or close modals</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>Shift</kbd><span class="shortcut-plus">+</span><kbd>/</kbd>
            </div>
            <div class="shortcut-desc">Show this shortcuts reference</div>
          </div>
        </div>

        <div class="shortcut-section">
          <span class="material-icons">content_copy</span>
          Quick Copy
        </div>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Ctrl</kbd><span class="shortcut-plus">+</span><kbd>Shift</kbd><span class="shortcut-plus">+</span><kbd>A</kbd>
            </div>
            <div class="shortcut-desc">Copy my server address to clipboard</div>
          </div>
        </div>

        <div class="shortcut-section">
          <span class="material-icons">privacy_tip</span>
          Privacy
        </div>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Click</kbd>
            </div>
            <div class="shortcut-desc">Click any message to reveal timestamp</div>
          </div>
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>Esc</kbd>
            </div>
            <div class="shortcut-desc">Hide revealed timestamp for privacy</div>
          </div>
        </div>

        <div class="shortcuts-hint">
          <span>Tip: You can also click the keyboard icon in the header to access these shortcuts anytime!</span>
        </div>
      </div>
    `}open(){this.modal.open()}close(){this.modal.close()}toggle(){this.modal.toggle()}cleanup(){var t;const e=document.getElementById("shortcuts-modal-styles");e&&e.remove(),(t=this.modal)==null||t.cleanup()}}function I(h){return String(h).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function R(h,e={}){const t=e.locale,s=new Intl.DateTimeFormat(t,e.time??{hour:"2-digit",minute:"2-digit"}),a=new Intl.DateTimeFormat(t,e.date??{year:"numeric",month:"short",day:"2-digit"}),n=new Date(h);return{time:s.format(n),date:a.format(n)}}function q(h,e={}){const{time:t,date:s}=R(h,e);return`
    <div class="message-time${e.className?` ${e.className}`:""}">
      <span class="time">${I(t)}</span>
      <span class="date">${I(s)}</span>
    </div>
  `}class K{constructor(e){o(this,"imageViewer");o(this,"revealedMessageId",null);o(this,"revealTimer",null);o(this,"privacyMode",!0);this.imageViewer=(e==null?void 0:e.imageViewer)??new L}async initialize(){await this.imageViewer.initialize(),this.injectMessageStyles()}injectMessageStyles(){if(document.getElementById("message-list-styles"))return;const t=document.createElement("style");t.id="message-list-styles",t.textContent=`
      /* Message Actions Styling with Tailwind-like approach */
      .message-footer {
        @apply flex items-end justify-between gap-2 mt-2 pt-1;
      }

      .message-actions {
        @apply flex items-center gap-1 opacity-0 transition-opacity duration-200;
      }

      .message:hover .message-actions {
        @apply opacity-100;
      }

      /* TINY Copy and Save Button Styling - Much smaller icons */
      .copy-message-btn,
      .save-message-btn {
        @apply inline-flex items-center justify-center;
        @apply bg-white/[0.08] border border-white/[0.12] text-gray-400;
        @apply px-1 py-0.5 rounded text-[0.65rem] font-medium cursor-pointer;
        @apply transition-all duration-200 min-h-[18px] min-w-[18px] whitespace-nowrap;
        @apply hover:transform hover:-translate-y-px;
      }

      /* CRITICAL: Material Icons in buttons - VERY TINY */
      .copy-message-btn .material-icons,
      .save-message-btn .material-icons {
        font-size: 8px !important; /* 8px - ultra small */
        line-height: 1 !important;
        width: 8px !important;
        height: 8px !important;
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
        vertical-align: middle !important;
      }

      /* Copy button hover */
      .copy-message-btn:hover {
        @apply bg-blue-500/15 border-blue-500/30 text-blue-400;
        @apply shadow-lg shadow-blue-500/15;
      }

      /* Save button styling - green theme */
      .save-message-btn {
        @apply bg-green-500/[0.08] border-green-500/20 text-green-500;
      }

      .save-message-btn:hover {
        @apply bg-green-500/15 border-green-500/35 text-green-400;
        @apply shadow-lg shadow-green-500/15;
      }

      .save-message-btn:active,
      .copy-message-btn:active {
        @apply translate-y-0;
      }

      /* Enhanced message time wrapper */
      .message-time-wrapper {
        @apply flex flex-col items-end leading-tight text-xs text-gray-500 min-h-[1.6em] relative;
      }

      /* Timestamp hint styling */
      .timestamp-hint {
        @apply absolute right-0 bottom-0 text-[0.65rem] text-gray-500 opacity-0;
        @apply tracking-wider uppercase pointer-events-none transition-opacity duration-150;
      }

      .message:not(.sensitive) .timestamp-hint { 
        @apply hidden; 
      }

      .message.sensitive:not(.revealed) .timestamp-hint { 
        @apply opacity-25; 
      }

      .message.sensitive:not(.revealed):hover .timestamp-hint { 
        @apply opacity-40; 
      }

      .message.sensitive.revealed .timestamp-hint { 
        @apply opacity-0; 
      }

      /* System message enhanced styling */
      .message.system {
        @apply self-center max-w-[90%] mx-auto my-6;
      }

      .message.system .message-content {
        @apply text-center text-sm py-5 px-6 rounded-xl leading-relaxed;
        background: linear-gradient(135deg, rgba(0, 122, 204, 0.08) 0%, rgba(0, 122, 204, 0.04) 100%);
        color: #ddd;
        border: 1px solid rgba(0, 122, 204, 0.15);
      }

      /* Forwarded message indicators - also smaller */
      .message.forwarded {
        @apply relative border-l-2 border-green-500 pl-3 ml-2;
      }

      .message.forwarded::before {
        content: 'reply';
        font-family: 'Material Icons';
        @apply absolute -left-1.5 top-2 text-[8px] text-green-500;
        @apply w-3 h-3 flex items-center justify-center rounded-full;
        background: var(--bg);
        padding: 1px;
      }

      /* No messages state */
      .no-messages {
        @apply text-center py-12 px-8 text-gray-400 italic;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .message-actions {
          @apply opacity-100; /* Always visible on mobile */
        }

        .copy-message-btn,
        .save-message-btn {
          @apply px-0.5 py-0.5 text-[0.6rem] min-h-[16px] min-w-[16px];
        }

        /* Even tinier on mobile */
        .copy-message-btn .material-icons,
        .save-message-btn .material-icons {
          font-size: 6px !important; /* 6px - extremely small on mobile */
          width: 6px !important;
          height: 6px !important;
        }

        .message-footer {
          @apply flex-col items-start gap-1;
        }

        .message-actions {
          @apply self-end;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .copy-message-btn,
        .save-message-btn {
          @apply border-2;
        }

        .message.forwarded {
          @apply border-l-4;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .copy-message-btn,
        .save-message-btn {
          @apply transition-none;
        }

        .copy-message-btn:hover,
        .save-message-btn:hover {
          @apply transform-none;
        }

        .message-actions {
          @apply transition-none;
        }
      }

      /* Image message lightbox styles */
      .message-image.expanded {
        @apply fixed inset-0 z-50 max-w-none max-h-none w-screen h-screen object-contain;
        @apply bg-black/90 cursor-pointer;
      }

      body.lightbox-open {
        @apply overflow-hidden;
      }
    `,document.head.appendChild(t)}getRevealedMessageId(){return this.revealedMessageId}hideRevealedMessage(){if(!this.revealedMessageId)return;const e=document.querySelector(`.message[data-mid="${this.revealedMessageId}"]`);e==null||e.classList.remove("revealed"),this.revealedMessageId=null,this.revealTimer&&(window.clearTimeout(this.revealTimer),this.revealTimer=null)}async refresh(e){var s,a,n;const t=document.getElementById("messages");if(t)try{const i=await window.electronAPI.db.getMessages(e);if(!i.length){t.innerHTML='<div class="no-messages">No messages yet. Start the conversation!</div>';return}t.innerHTML=i.map(l=>this.renderMessage(l,e)).join(""),t.querySelectorAll(".message-image").forEach(l=>{var p,m;const d=((m=(p=l.closest(".image-message"))==null?void 0:p.querySelector(".image-caption"))==null?void 0:m.textContent)||"";l.addEventListener("click",u=>{u.preventDefault();const g=l.closest(".message");if(g&&g.classList.contains("sensitive")&&!g.classList.contains("revealed")){this.revealMessage(g.getAttribute("data-mid")||"");return}this.openImageWithFallback(l,d)})}),this.attachPrivacyHandlers(t),t.scrollTop=t.scrollHeight;const r=i[i.length-1];r&&((n=(a=(s=window.electronAPI)==null?void 0:s.transport)==null?void 0:a.sendSignal)==null||n.call(a,e,{action:"read",lastSeenTs:r.timestamp}))}catch(i){console.error("Failed to render messages:",i)}}cleanup(){var t;this.hideRevealedMessage(),(t=this.imageViewer)==null||t.cleanup();const e=document.getElementById("message-list-styles");e&&e.remove()}renderMessage(e,t){var g,v,f,x;const a=`
      <div class="message-time-wrapper">
        ${q(e.timestamp)}
        <span class="timestamp-hint">show time</span>
      </div>
    `,n=`<button class="copy-message-btn" onclick="window.chatApp.copyMessage('${e.id}')" title="Copy Text">
      <span class="material-icons tiny">content_copy</span>
    </button>`,i=e.sender!=="me",c=t===((x=(f=(v=(g=window.chatApp)==null?void 0:g.components)==null?void 0:v.get("savedMessages"))==null?void 0:f.getSavedChatId)==null?void 0:x.call(f)),l=i&&!c?`<button class="save-message-btn" onclick="window.chatApp.saveMessage('${e.id}')" title="Save Message">
          <span class="material-icons tiny">bookmark_border</span>
         </button>`:"",d=`
      <div class="message-footer">
        ${a}
        <div class="message-actions">
          ${n}
          ${l}
        </div>
      </div>
    `,p=e.type!=="system"?"sensitive":"",m=e.replyTo?"forwarded":"";if(e.type==="image"&&e.imageData){const k=this.escapeHtml(e.content),M=this.escapeHtml(e.imageData.filename);return`
        <div class="message ${e.sender==="me"?"sent":"received"} ${p} ${m}" data-mid="${e.id}">
          <div class="image-message max-w-sm rounded-xl overflow-hidden bg-gray-800">
            <img src="${e.imageData.data}" alt="${M}" class="message-image w-full h-auto block cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
            <div class="image-caption px-3 py-3 text-sm text-white bg-black/30">${k}</div>
          </div>
          ${d}
        </div>
      `}if(e.type==="system")return`
        <div class="message system" data-mid="${e.id}">
          <div class="message-content">${e.content}</div>
          ${d}
        </div>
      `;const u=this.escapeHtml(e.content);return`
      <div class="message ${e.sender==="me"?"sent":"received"} ${p} ${m}" data-mid="${e.id}">
        <div class="message-content">${u}</div>
        ${d}
      </div>
    `}attachPrivacyHandlers(e){e.addEventListener("click",t=>{const s=t.target,a=s.closest(".message.sensitive:not(.revealed)");if(a&&!s.closest("button")&&!s.closest("img")){t.preventDefault();const n=a.getAttribute("data-mid");n&&this.revealMessage(n)}})}revealMessage(e){if(!e)return;if(this.revealedMessageId&&this.revealedMessageId!==e){const s=document.querySelector(`.message[data-mid="${this.revealedMessageId}"]`);s==null||s.classList.remove("revealed")}const t=document.querySelector(`.message[data-mid="${e}"]`);t&&(t.classList.add("revealed"),this.revealedMessageId=e,this.revealTimer&&window.clearTimeout(this.revealTimer),this.revealTimer=window.setTimeout(()=>this.hideRevealedMessage(),1e4))}openImageWithFallback(e,t){try{this.imageViewer.open(e.src,e.alt||"Image",t)}catch{}setTimeout(()=>{this.isViewerShowing(e.src)||this.toggleInlineLightbox(e)},50)}isViewerShowing(e){const t=document.querySelector(".image-viewer");if(!t||!t.style.display||t.style.display==="none")return!1;if(!e)return!0;const s=t.querySelector("img");return!!(s&&s.src===e)}toggleInlineLightbox(e){const t=e.classList.toggle("expanded");if(document.body.classList.toggle("lightbox-open",t),t){const s=a=>{a.key==="Escape"&&(e.classList.remove("expanded"),document.body.classList.remove("lightbox-open"),document.removeEventListener("keydown",s))};document.addEventListener("keydown",s,{once:!0})}}escapeHtml(e){const t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};return String(e??"").replace(/[&<>"']/g,s=>t[s])}}class j{constructor(e){o(this,"app");o(this,"onKeyDown");this.app=e}async initialize(){this.onKeyDown=async e=>{var s;const t=this.app.currentChatId;if(e.ctrlKey&&!e.shiftKey&&(e.key==="t"||e.key==="T")){const a=document.getElementById("message-input");if(!t||!a||a.disabled)return;e.preventDefault(),e.stopPropagation(),a.focus();const n=a.value.length;a.selectionStart=a.selectionEnd=n;return}if(e.ctrlKey&&!e.shiftKey&&(e.key==="o"||e.key==="O")){if(!t)return;const a=document.getElementById("image-btn"),n=document.getElementById("image-input");if(a!=null&&a.disabled)return;e.preventDefault(),e.stopPropagation(),n==null||n.click();return}if(e.ctrlKey&&e.shiftKey&&(e.key==="?"||e.key==="/")){e.preventDefault(),e.stopPropagation(),this.app.openShortcuts();return}if(e.ctrlKey&&e.shiftKey&&(e.key==="c"||e.key==="C")){if(!t)return;e.preventDefault(),e.stopPropagation();let a=this.app.getRevealedMessageId();if(!a){const n=await window.electronAPI.db.getMessages(t);a=((s=n[n.length-1])==null?void 0:s.id)??null}a&&await this.app.copyMessage(a);return}if(e.ctrlKey&&!e.shiftKey&&!e.altKey&&(e.key==="n"||e.key==="N")){e.preventDefault(),e.stopPropagation(),this.app.showNewChatModal();return}if(e.ctrlKey&&e.shiftKey&&(e.key==="a"||e.key==="A")){const a=document.getElementById("my-address"),n=((a==null?void 0:a.textContent)||"").trim(),i="Address:";let c=null;if(n.startsWith(i)){const r=n.slice(i.length).trim();r&&r.toLowerCase()!=="unknown"&&(c=r)}if(!c)return;e.preventDefault(),e.stopPropagation();try{await navigator.clipboard.writeText(c);const r=document.getElementById("server-status");if(r){const l=r.textContent;r.textContent="Address copied",setTimeout(()=>{r.textContent==="Address copied"&&(r.textContent=l||"")},1e3)}}catch{}return}},document.addEventListener("keydown",this.onKeyDown,{capture:!1})}cleanup(){this.onKeyDown&&(document.removeEventListener("keydown",this.onKeyDown),this.onKeyDown=void 0)}}class O{constructor(){o(this,"container",null);o(this,"currentStatus",{isSecure:!1})}async initialize(){this.injectStyles(),this.createIndicator(),console.log("✅ ChatSecurityIndicator initialized")}injectStyles(){if(document.getElementById("chat-security-indicator-styles"))return;const t=document.createElement("style");t.id="chat-security-indicator-styles",t.textContent=`
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
    `,document.head.appendChild(t)}createIndicator(){const e=document.querySelector(".chat-header");if(!e){console.warn("Chat header not found, cannot create security indicator");return}this.container=document.createElement("div"),this.container.className="chat-security-indicator unknown",this.container.setAttribute("role","button"),this.container.setAttribute("tabindex","0"),this.container.setAttribute("aria-label","Chat security status"),this.container.setAttribute("title","Click to see security details"),this.container.addEventListener("click",this.toggleTooltip.bind(this)),this.container.addEventListener("keydown",t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this.toggleTooltip())}),e.appendChild(this.container),this.updateIndicator(this.currentStatus)}toggleTooltip(){var t,s;const e=((t=this.container)==null?void 0:t.getAttribute("aria-expanded"))==="true";(s=this.container)==null||s.setAttribute("aria-expanded",(!e).toString())}updateSecurityStatus(e){this.currentStatus=e,this.updateIndicator(e)}updateIndicator(e){if(!this.container)return;this.container.classList.remove("secure","insecure","unknown");let t,s,a,n;e.isSecure?(t="secure",s="verified_user",a="Secure",n=this.getSecureTooltipContent(e)):e.isSecure===!1&&e.encryptionType?(t="insecure",s="gpp_bad",a="Not Secure",n=this.getInsecureTooltipContent(e)):(t="unknown",s="help_outline",a="Unknown",n=this.getUnknownTooltipContent()),this.container.className=`chat-security-indicator ${t}`;const i=e.details?`<span class="security-details">(${e.details})</span>`:"";this.container.innerHTML=`
      <span class="material-icons security-icon">${s}</span>
      <span class="security-text">${a}</span>
      ${i}
      <div class="security-tooltip">
        ${n}
      </div>
    `,this.container.setAttribute("aria-label",`Chat security: ${a}. ${e.details||"Click for details"}`)}getSecureTooltipContent(e){const t=[];return e.encryptionType==="RSA+AES"?t.push('<div class="security-feature"><span class="material-icons">lock</span>RSA + AES Encryption</div>'):e.encryptionType==="PSK"&&t.push('<div class="security-feature"><span class="material-icons">vpn_key</span>Pre-Shared Key</div>'),e.peerVerified&&t.push('<div class="security-feature"><span class="material-icons">verified</span>Peer Identity Verified</div>'),e.connectionType==="direct"&&t.push('<div class="security-feature"><span class="material-icons">link</span>Direct P2P Connection</div>'),`
      <div class="tooltip-header">
        <span class="material-icons" style="color: #22c55e;">verified_user</span>
        Secure Chat
      </div>
      <div class="tooltip-content">
        <p style="margin-bottom: 0.5rem;">This chat is encrypted and secure.</p>
        ${t.join("")}
      </div>
    `}getInsecureTooltipContent(e){return`
      <div class="tooltip-header">
        <span class="material-icons" style="color: #ef4444;">gpp_bad</span>
        Not Secure
      </div>
      <div class="tooltip-content">
        <p style="margin-bottom: 0.5rem;">This chat may not be fully secure.</p>
        <div class="security-feature">
          <span class="material-icons">warning</span>
          ${e.details||"Connection security could not be verified"}
        </div>
      </div>
    `}getUnknownTooltipContent(){return`
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
    `}show(){this.container&&(this.container.style.display="flex")}hide(){this.container&&(this.container.style.display="none")}showSavedMessagesSecure(){this.updateSecurityStatus({isSecure:!0,encryptionType:"RSA+AES",peerVerified:!0,connectionType:"direct",details:"Local Storage"})}cleanup(){const e=document.getElementById("chat-security-indicator-styles");e&&e.remove(),this.container&&(this.container.remove(),this.container=null),console.log("🧹 ChatSecurityIndicator cleaned up")}}class U{constructor(){o(this,"eventBus",w.getInstance());o(this,"components",new Map);o(this,"currentChatId",null);o(this,"chats",new Map);o(this,"serverInfo",null);o(this,"newChatModal",null);o(this,"shortcutsModal",null);o(this,"imageProcessor",new F);o(this,"imageViewer",new L);o(this,"messageList",new K({imageViewer:this.imageViewer}));o(this,"typingTimers",new Map);o(this,"lastTypingSentAt",0);o(this,"recentIncoming",new Map);o(this,"errorModal",new C);o(this,"securityIndicator",new O);this.components.set("debug",new A),this.components.set("savedMessages",new H),this.components.set("network",new _({autoStart:!1})),this.newChatModal=new D({onConnect:this.handleModalConnect.bind(this),onStartServer:this.handleModalStartServer.bind(this)}),this.components.set("newChatModal",this.newChatModal),this.shortcutsModal=new N,this.components.set("shortcutsModal",this.shortcutsModal),this.components.set("messageList",this.messageList),this.components.set("shortcutsController",new j(this)),this.components.set("securityIndicator",this.securityIndicator)}async initialize(){await this.setupUI(),await this.checkElectronAPI();for(const[,e]of this.components)e.initialize&&await e.initialize();await this.imageProcessor.initialize(),this.setupEventListeners(),await this.loadExistingChats()}transport(){var e;return(e=window.electronAPI)==null?void 0:e.transport}async checkElectronAPI(){try{const e=typeof window.electronAPI<"u",t=document.getElementById("app-status");t&&(e?(t.textContent="🟢 Ready",t.classList.remove("pending","warning","error"),t.classList.add("safe")):(t.textContent="⚠️ Preload not loaded",t.classList.remove("pending","safe"),t.classList.add("warning")))}catch(e){console.error("ElectronAPI check failed:",e)}}setupEventListeners(){var e,t,s,a,n,i;this.eventBus.on("chat:selected",c=>this.selectChat(c)),this.eventBus.on("chat:updated",()=>this.refreshChatList()),this.eventBus.on("message:sent",c=>{this.currentChatId===c.chatId&&this.refreshMessages(),this.refreshChatList()}),this.eventBus.on("message:received",({chatId:c,data:r})=>{this.handleIncomingMessage(c,r)}),(t=(e=window.electronAPI)==null?void 0:e.transport)!=null&&t.onPeerConnected&&window.electronAPI.transport.onPeerConnected((c,r)=>{this.handlePeerConnected(c,r)}),(a=(s=window.electronAPI)==null?void 0:s.transport)!=null&&a.onPeerDisconnected&&window.electronAPI.transport.onPeerDisconnected(c=>{this.handlePeerDisconnected(c)}),(i=(n=this.transport())==null?void 0:n.onSignal)==null||i.call(n,(c,r)=>{this.handleSignal(c,r)}),this.eventBus.on("saved-messages:show",()=>this.openSavedMessages())}async setupUI(){var e;document.body.innerHTML=`
      <div id="app">
        <header class="app-header">
          <h1>🔒 Secure Chat</h1>
          <div class="app-status-container">
            <span id="app-status" class="app-status">🔄 Starting...</span>
            <button id="shortcuts-btn" class="shortcuts-btn" title="Keyboard Shortcuts (Ctrl+Shift+/)">⌨️</button>
          </div>
        </header>
        
        <main class="app-main">
          <aside class="chat-list">
            <div class="chat-list-header">
              <h2>Chats</h2>
              <div class="chat-list-actions">
                <button id="new-chat-btn">+ New Chat</button>
                <button id="saved-messages-btn" title="Open Saved Messages">💾 Saved</button>
              </div>
            </div>
            <ul id="chat-list"></ul>
            <div class="connection-info">
              <div id="server-status">Server: Not started</div>
              <div class="address-row">
                <div id="my-address">Address: Unknown</div>
                <button id="copy-address-btn" title="Copy my address (Ctrl+Shift+A)">📋</button>
              </div>
            </div>
          </aside>
          
          <section class="chat-view">
            <div class="chat-header">
              <h3 id="chat-title">Select a chat</h3>
              <div id="chat-status"></div>
            </div>
            <div class="messages" id="messages">
              <div class="welcome-message">
                <h3>🔒 Welcome to Secure Chat</h3>
                <p>Your messages are end-to-end encrypted using RSA + AES encryption.</p>
                <p>Click "New Chat" to connect to a peer or start your first conversation.</p>
                <p>💾 Check out "Saved Messages" to save important messages!</p>
              </div>
            </div>
            <div class="message-composer">
              <input type="file" id="image-input" accept="image/*" style="display:none">
              <button id="image-btn" class="image-btn" disabled title="Send Image (Ctrl+O)">📷</button>
              <input type="text" id="message-input" placeholder="Type a secure message..." disabled>
              <button id="send-btn" disabled>Send</button>
            </div>
          </section>
        </main>
      </div>
    `,this.setupBasicEventListeners(),await((e=this.newChatModal)==null?void 0:e.initialize()),this.updateServerStatus()}setupBasicEventListeners(){const e=document.getElementById("send-btn"),t=document.getElementById("message-input"),s=document.getElementById("new-chat-btn"),a=document.getElementById("saved-messages-btn"),n=document.getElementById("copy-address-btn"),i=document.getElementById("shortcuts-btn");e==null||e.addEventListener("click",()=>this.sendMessage()),t==null||t.addEventListener("keydown",l=>{l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),this.sendMessage())}),s==null||s.addEventListener("click",()=>this.showNewChatModal()),a==null||a.addEventListener("click",()=>this.openSavedMessages()),i==null||i.addEventListener("click",()=>this.openShortcuts());const c=document.getElementById("image-btn"),r=document.getElementById("image-input");c==null||c.addEventListener("click",()=>r==null?void 0:r.click()),r==null||r.addEventListener("change",async l=>{var p,m;const d=(m=(p=l.target)==null?void 0:p.files)==null?void 0:m[0];if(d&&this.currentChatId)try{await this.sendImageMessage(d),l.target.value=""}catch(u){console.error("Failed to send image:",u),alert(`Failed to send image: ${u instanceof Error?u.message:"Unknown error"}`)}}),t==null||t.addEventListener("input",()=>{var d,p;if(!this.currentChatId)return;const l=Date.now();l-this.lastTypingSentAt>1200&&(this.lastTypingSentAt=l,(p=(d=this.transport())==null?void 0:d.sendSignal)==null||p.call(d,this.currentChatId,{action:"typing"}),setTimeout(()=>{var m,u;Date.now()-this.lastTypingSentAt>1100&&this.currentChatId&&((u=(m=this.transport())==null?void 0:m.sendSignal)==null||u.call(m,this.currentChatId,{action:"stop_typing"}))},1400))}),t==null||t.addEventListener("blur",()=>{var l,d;this.currentChatId&&((d=(l=this.transport())==null?void 0:l.sendSignal)==null||d.call(l,this.currentChatId,{action:"stop_typing"}))}),n==null||n.addEventListener("click",async()=>{const l=this.getMyAddressString();if(!l)return;await this.copyText(l);const d=document.getElementById("server-status");if(d){const p=d.textContent;d.textContent="Address copied",setTimeout(()=>{d.textContent==="Address copied"&&(d.textContent=p||"")},1e3)}}),document.addEventListener("keydown",l=>{l.key==="Escape"&&this.messageList.hideRevealedMessage()}),window.addEventListener("blur",()=>this.messageList.hideRevealedMessage())}async refreshMessages(){this.currentChatId&&await this.messageList.refresh(this.currentChatId)}getRevealedMessageId(){return this.messageList.getRevealedMessageId()}openShortcuts(){var e;(e=this.shortcutsModal)==null||e.open()}async selectChat(e){this.currentChatId=e;const t=this.chats.get(e);if(!t)return;this.updateChatHeader(),await this.refreshMessages(),this.updateChatSecurity(t);const s=document.getElementById("message-input"),a=document.getElementById("send-btn"),n=document.getElementById("image-btn");s&&(s.disabled=!1),a&&(a.disabled=!1),n&&(n.disabled=!1)}updateChatSecurity(e){if(e.type==="saved"){this.securityIndicator.showSavedMessagesSecure(),this.securityIndicator.show();return}const t=e.isOnline,s=!!e.peerPublicKey,a=!!e.peerAddress;let n;t&&s&&a?n={isSecure:!0,encryptionType:"RSA+AES",peerVerified:!0,connectionType:"direct",details:"End-to-End Encrypted"}:s?n={isSecure:!1,encryptionType:"RSA+AES",peerVerified:!0,connectionType:"direct",details:"Peer Offline"}:a?n={isSecure:!1,encryptionType:"none",peerVerified:!1,connectionType:"direct",details:"Keys Not Exchanged"}:n={isSecure:!1,details:"No Connection Info"},this.securityIndicator.updateSecurityStatus(n),this.securityIndicator.show()}updateChatHeader(){const e=document.getElementById("chat-title"),t=this.currentChatId?this.chats.get(this.currentChatId):null;e&&(t?(e.textContent=t.name,this.securityIndicator.show()):(e.textContent="Select a chat",this.securityIndicator.hide()))}async handleIncomingMessage(e,t){var s;try{const a=t??{},n=typeof a.content=="string"?a.content:typeof a.message=="string"?a.message:String(t),i=typeof a.type=="string"?a.type:"text",c=(s=a.imageData)==null?void 0:s.data,r=["peer",i,a.encrypted?"1":"0",n,c?c.slice(0,64):""].join("|");if(this.isDuplicateIncoming(e,r))return;const l={chatId:e,content:n,sender:"peer",encrypted:!!a.encrypted,type:i,imageData:a.imageData};await window.electronAPI.db.saveMessage(l),this.currentChatId===e&&await this.refreshMessages(),this.refreshChatList()}catch(a){console.error("Failed to handle incoming message:",a)}}async copyMessage(e){try{if(!this.currentChatId)return;const s=(await window.electronAPI.db.getMessages(this.currentChatId)).find(c=>c.id===e);if(!s)return;let a=(s.content??"").trim();a||(s.type==="image"&&s.imageData?a=`📷 ${s.imageData.filename}`:a=""),await(async c=>{try{await navigator.clipboard.writeText(c)}catch{const r=document.createElement("textarea");r.value=c,r.style.position="fixed",r.style.opacity="0",document.body.appendChild(r),r.select(),document.execCommand("copy"),document.body.removeChild(r)}})(a);const i=document.getElementById("chat-status");if(i){const c=i.textContent;i.textContent="Copied",setTimeout(()=>{i.textContent==="Copied"&&(i.textContent=c||"")},1e3)}}catch(t){console.error("Failed to copy message:",t),alert("Failed to copy")}}showNewChatModal(){this.newChatModal&&(this.newChatModal.open(),this.newChatModal.updateConnectionInfo().catch(()=>{}),this.serverInfo&&this.newChatModal.updateServerInfo(this.serverInfo.address,this.serverInfo.port))}async handleModalStartServer(){var t,s;if(!((t=window.electronAPI)!=null&&t.transport))throw new Error("Transport API not available");const e=await window.electronAPI.transport.startServer();this.serverInfo=e,this.updateServerStatus(),(s=this.newChatModal)==null||s.updateServerInfo(e.address,e.port)}async handleModalConnect(e,t){var i;if(!((i=window.electronAPI)!=null&&i.transport))throw new Error("Transport API not available");let s=e,a=null;if(e.includes(":")){const[c,r]=e.split(":");s=c,a=Number.parseInt(r,10)}if(!s||!a||Number.isNaN(a))throw new Error("Invalid address format. Use IP:PORT");const n=await window.electronAPI.transport.connect(s,a);if(typeof n=="boolean"){if(!n)throw new Error("Failed to connect to peer");return}if(!n.ok){const c=this.mapConnectError(n.reason);throw this.errorModal.show(c),new Error(c)}}mapConnectError(e){switch(e){case"occupied":case"already_connected":return"The line is already busy.";case"unauthorized":return"Connection rejected: invalid PSK.";case"rate_limited":return"The server is busy. Please try again in a moment.";case"bad_handshake":return"Protocol mismatch or malformed handshake.";case"timeout":return"Connection timed out.";default:return"Network error. Please try again."}}updateServerStatus(){const e=document.getElementById("server-status"),t=document.getElementById("my-address");e&&(e.textContent=this.serverInfo?"Server: Running":"Server: Not started"),t&&(t.textContent=this.serverInfo?`Address: ${this.serverInfo.address}:${this.serverInfo.port}`:"Address: Unknown")}async handlePeerConnected(e,t){const s={name:`Chat with ${t.name}`,participants:["me",t.id],peerAddress:t.address,peerPublicKey:t.publicKey,type:"direct",isOnline:!0};try{const n=await window.electronAPI.db.saveChat(s);this.chats.set(e,{...n,id:e})}catch(n){console.error("Failed to save new chat:",n),this.chats.set(e,{...s,id:e})}this.refreshChatList(),this.selectChat(e);const a=this.chats.get(e);a&&this.currentChatId===e&&this.updateChatSecurity(a)}handlePeerDisconnected(e){const t=this.chats.get(e);t&&(t.isOnline=!1,this.refreshChatList(),this.currentChatId===e&&this.updateChatHeader());const s=this.chats.get(e);s&&this.currentChatId===e&&this.updateChatSecurity(s)}handleSignal(e,t){if(this.currentChatId!==e)return;const s=document.getElementById("chat-status");if(s)if(t.action==="typing"){s.textContent="Peer is typing…",s.classList.add("typing");const a=this.typingTimers.get(e);a&&window.clearTimeout(a);const n=window.setTimeout(()=>{s.textContent==="Peer is typing…"&&(s.textContent="",s.classList.remove("typing"))},3e3);this.typingTimers.set(e,n)}else t.action==="stop_typing"?(s.textContent="",s.classList.remove("typing")):t.action==="read"&&(s.textContent="Seen",setTimeout(()=>{s.textContent==="Seen"&&(s.textContent="")},2e3))}async loadExistingChats(){try{const e=await window.electronAPI.db.getChats();this.chats.clear();for(const t of e)this.chats.set(t.id,t);this.refreshChatList()}catch(e){console.error("Failed to load chats:",e)}}refreshChatList(){const e=document.getElementById("chat-list");if(!e)return;if(this.chats.size===0){e.innerHTML='<li class="no-chats">No chats yet. Create one!</li>';return}const t=Array.from(this.chats.values()).sort((s,a)=>{var c,r;if(s.type==="saved")return-1;if(a.type==="saved")return 1;const n=((c=s.lastMessage)==null?void 0:c.timestamp)??0;return(((r=a.lastMessage)==null?void 0:r.timestamp)??0)-n});e.innerHTML=t.map(s=>`
      <li class="chat-item ${this.currentChatId===s.id?"active":""}" data-chat-id="${s.id}">
        <div class="chat-name">${s.name}</div>
        <div class="chat-preview">
          ${s.lastMessage?s.lastMessage.type==="image"?"📷 Photo":(s.lastMessage.content??"").substring(0,50)+((s.lastMessage.content??"").length>50?"...":""):"No messages yet"}
        </div>
        <div class="chat-time">
          ${s.lastMessage?new Date(s.lastMessage.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):""}
        </div>
      </li>
    `).join(""),e.querySelectorAll(".chat-item").forEach(s=>{s.addEventListener("click",()=>{const a=s.dataset.chatId;this.selectChat(a)})})}async sendMessage(){var s,a,n;const e=document.getElementById("message-input"),t=(e==null?void 0:e.value.trim())||"";if(!(!t||!this.currentChatId))try{const i={chatId:this.currentChatId,content:t,sender:"me",encrypted:!1,type:"text"},c=await window.electronAPI.db.saveMessage(i);((s=this.chats.get(this.currentChatId))==null?void 0:s.type)==="saved"||window.electronAPI.transport&&await window.electronAPI.transport.send(this.currentChatId,{content:t,timestamp:c.timestamp,type:"text"}),e&&(e.value=""),this.currentChatId&&((n=(a=this.transport())==null?void 0:a.sendSignal)==null||n.call(a,this.currentChatId,{action:"stop_typing"})),await this.refreshMessages(),this.refreshChatList()}catch(i){console.error("Failed to send message:",i),alert("Failed to send message")}}async sendImageMessage(e){var i;if(!this.currentChatId)return;const t=await this.imageProcessor.processImageFile(e),s={chatId:this.currentChatId,content:`📷 ${t.filename}`,sender:"me",encrypted:!1,type:"image",imageData:t},a=await window.electronAPI.db.saveMessage(s);((i=this.chats.get(this.currentChatId))==null?void 0:i.type)==="saved"||window.electronAPI.transport&&await window.electronAPI.transport.send(this.currentChatId,{content:`📷 ${t.filename}`,timestamp:a.timestamp,type:"image",imageData:t}),await this.refreshMessages(),this.refreshChatList()}async openSavedMessages(){try{let e=Array.from(this.chats.values()).find(t=>t.type==="saved");e||(e=(await window.electronAPI.db.getChats()).find(s=>s.type==="saved"),e||(e=await window.electronAPI.db.saveChat({name:"💾 Saved Messages",participants:["me"],type:"saved"})),this.chats.set(e.id,e),this.refreshChatList()),await this.selectChat(e.id)}catch(e){console.error("Failed to open Saved Messages:",e),alert("Failed to open Saved Messages")}}async saveMessage(e){try{if(!this.currentChatId)return;const s=(await window.electronAPI.db.getMessages(this.currentChatId)).find(a=>a.id===e);s&&this.eventBus.emit("saved-messages:save",s)}catch(t){console.error("Failed to save message:",t)}}cleanup(){for(const[,e]of this.components)e.cleanup&&e.cleanup();this.chats.clear(),this.currentChatId=null,this.serverInfo=null;for(const[,e]of this.typingTimers)window.clearTimeout(e);this.typingTimers.clear(),this.messageList.hideRevealedMessage(),this.recentIncoming.clear()}isDuplicateIncoming(e,t,s=2e3){const a=Date.now();let n=this.recentIncoming.get(e);n||(n=new Map,this.recentIncoming.set(e,n));for(const[i,c]of n)a-c>s&&n.delete(i);return n.has(t)?!0:(n.set(t,a),!1)}getMyAddressString(){var n,i;if((n=this.serverInfo)!=null&&n.address&&((i=this.serverInfo)!=null&&i.port))return`${this.serverInfo.address}:${this.serverInfo.port}`;const e=document.getElementById("my-address"),t=((e==null?void 0:e.textContent)||"").trim(),s="Address:";if(!t.startsWith(s))return null;const a=t.slice(s.length).trim();return!a||a.toLowerCase()==="unknown"?null:a}async copyText(e){try{await navigator.clipboard.writeText(e)}catch{const t=document.createElement("textarea");t.value=e,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t)}}}export{U as ChatApp};
