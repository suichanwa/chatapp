var E=Object.defineProperty;var S=(h,e,t)=>e in h?E(h,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):h[e]=t;var l=(h,e,t)=>S(h,typeof e!="symbol"?e+"":e,t);class L{constructor(){l(this,"isOpen",!1);l(this,"currentTab","system");l(this,"logs",[]);l(this,"logFilter","all");this.setupEventListeners(),this.loadLogs()}setupEventListeners(){var e,t,s,a,n;(e=window.electronAPI)!=null&&e.debug&&((s=(t=window.electronAPI.debug).onNewLog)==null||s.call(t,o=>{this.logs.unshift(o),this.updateLogsDisplay()}),(n=(a=window.electronAPI.debug).onLogsCleared)==null||n.call(a,()=>{this.logs=[],this.updateLogsDisplay()}))}async loadLogs(){var e,t;try{(t=(e=window.electronAPI)==null?void 0:e.debug)!=null&&t.getLogs&&(this.logs=await window.electronAPI.debug.getLogs(),this.updateLogsDisplay())}catch(s){console.error("Failed to load debug logs:",s)}}async initialize(){console.log("🔧 DebugPanel: Starting initialization..."),this.injectDebugStyles(),this.createDebugToggle(),this.createDebugOverlay(),console.log("🔧 DebugPanel: Initialization complete")}createDebugOverlay(){var t,s,a,n,o,i,r,c;const e=`
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
                <span class="api-status-indicator ${typeof((o=window.electronAPI)==null?void 0:o.permission)<"u"?"available":"unavailable"}">
                  ${typeof((i=window.electronAPI)==null?void 0:i.permission)<"u"?"✅":"❌"}
                </span>
              </li>
              <li class="api-status-item">
                <span class="api-status-name">Transport API</span>
                <span class="api-status-indicator ${typeof((r=window.electronAPI)==null?void 0:r.transport)<"u"?"available":"unavailable"}">
                  ${typeof((c=window.electronAPI)==null?void 0:c.transport)<"u"?"✅":"❌"}
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
    `);const t=document.getElementById("debug-toggle");t==null||t.addEventListener("click",()=>this.toggle())}attachEventListeners(){const e=document.getElementById("debug-close");e==null||e.addEventListener("click",()=>this.close()),document.querySelectorAll(".debug-tab").forEach(i=>{i.addEventListener("click",r=>{const d=r.target.dataset.tab;d&&this.switchTab(d)})});const t=document.getElementById("debug-log-filter");t==null||t.addEventListener("change",i=>{this.logFilter=i.target.value,this.updateLogsDisplay()});const s=document.getElementById("debug-component-filter");s==null||s.addEventListener("change",()=>{this.updateComponentFilter(),this.updateLogsDisplay()});const a=document.getElementById("debug-clear-logs");a==null||a.addEventListener("click",()=>this.clearLogs());const n=document.getElementById("debug-refresh-logs");n==null||n.addEventListener("click",()=>this.loadLogs());const o=document.getElementById("debug-overlay");o==null||o.addEventListener("click",i=>{i.target===o&&this.close()}),document.addEventListener("keydown",i=>{i.key==="Escape"&&this.isOpen&&this.close()})}switchTab(e){this.currentTab=e,document.querySelectorAll(".debug-tab").forEach(a=>{a.classList.remove("active")});const t=document.querySelector(`[data-tab="${e}"]`);t==null||t.classList.add("active"),document.querySelectorAll(".debug-panel").forEach(a=>{a.classList.remove("active")});const s=document.getElementById(`debug-${e}`);s==null||s.classList.add("active")}updateComponentFilter(){const e=document.getElementById("debug-component-filter");if(!e)return;const t=[...new Set(this.logs.map(a=>a.component))],s=e.value;e.innerHTML='<option value="all">All Components</option>',t.forEach(a=>{const n=document.createElement("option");n.value=a,n.textContent=a,a===s&&(n.selected=!0),e.appendChild(n)})}updateLogsDisplay(){const e=document.getElementById("debug-logs-container");if(!e)return;const t=document.getElementById("debug-component-filter"),s=(t==null?void 0:t.value)||"all";let a=this.logs;if(this.logFilter!=="all"&&(a=a.filter(n=>n.level===this.logFilter)),s!=="all"&&(a=a.filter(n=>n.component===s)),a.length===0){e.innerHTML='<div class="debug-no-logs">No logs to display</div>';return}e.innerHTML=a.map(n=>`
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
    `,document.head.appendChild(e)}}class x{constructor(e,t,s="",a=""){l(this,"_modal",null);l(this,"isOpen",!1);l(this,"eventListeners",new Map);this.id=e,this.title=t,this.content=s,this.className=a}get modal(){return this._modal}async initialize(){try{this.createModal(),this.attachEventListeners(),console.log(`✅ Modal "${this.id}" initialized successfully`)}catch(e){throw console.error(`❌ Failed to initialize modal "${this.id}":`,e),e}}createModal(){const e=document.getElementById(this.id);e&&e.remove(),this._modal=document.createElement("div"),this._modal.id=this.id,this._modal.className=`modal ${this.className}`,this._modal.setAttribute("role","dialog"),this._modal.setAttribute("aria-modal","true"),this._modal.setAttribute("aria-labelledby",`${this.id}-title`),this._modal.innerHTML=`
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title" id="${this.id}-title">${this.title}</h3>
            <button class="modal-close" data-action="close" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            ${this.content}
          </div>
        </div>
      </div>
    `,document.body.appendChild(this._modal)}attachEventListeners(){if(!this._modal)return;const e=this._modal.querySelector('[data-action="close"]');e==null||e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),this.close()});const t=this._modal.querySelector(".modal-overlay");t==null||t.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),this.close()});const s=this._modal.querySelector(".modal-content");s==null||s.addEventListener("click",n=>{n.stopPropagation()});const a=n=>{n.key==="Escape"&&this.isOpen&&(n.preventDefault(),this.close())};document.addEventListener("keydown",a),this.eventListeners.set("escape",[a])}on(e,t){this.eventListeners.has(e)||this.eventListeners.set(e,[]),this.eventListeners.get(e).push(t)}off(e,t){if(!this.eventListeners.has(e))return;const s=this.eventListeners.get(e);if(t){const a=s.indexOf(t);a>-1&&s.splice(a,1)}else s.length=0}emit(e,...t){const s=this.eventListeners.get(e);s&&s.forEach(a=>{try{a(...t)}catch(n){console.error(`Error in modal event listener for "${e}":`,n)}}),this._modal&&this._modal.dispatchEvent(new CustomEvent(`modal:${e}`,{detail:{modal:this,args:t}}))}open(){if(!this._modal){console.error("Cannot open modal: modal not initialized");return}if(this.isOpen){console.warn("Modal is already open");return}this._modal.classList.add("show"),this.isOpen=!0;const e=this._modal.querySelector('input, button, textarea, select, [tabindex]:not([tabindex="-1"])');e&&setTimeout(()=>e.focus(),100),document.body.style.overflow="hidden",this.emit("opened"),console.log(`Modal "${this.id}" opened`)}close(){if(!this._modal){console.error("Cannot close modal: modal not initialized");return}if(!this.isOpen){console.warn("Modal is already closed");return}this._modal.classList.remove("show"),this.isOpen=!1,document.body.style.overflow="";const e=document.querySelector('[data-modal-trigger="'+this.id+'"]');e==null||e.focus(),this.emit("closed"),console.log(`Modal "${this.id}" closed`)}toggle(){this.isOpen?this.close():this.open()}setContent(e){if(!this._modal){console.error("Cannot set content: modal not initialized");return}const t=this._modal.querySelector(".modal-body");t&&(t.innerHTML=e,console.log(`Modal "${this.id}" content updated`))}setTitle(e){if(!this._modal){console.error("Cannot set title: modal not initialized");return}this.title=e;const t=this._modal.querySelector(".modal-title");t&&(t.textContent=e)}getIsOpen(){return this.isOpen}getElement(){return this._modal}addClass(e){var t;(t=this._modal)==null||t.classList.add(e)}removeClass(e){var t;(t=this._modal)==null||t.classList.remove(e)}hasClass(e){var t;return((t=this._modal)==null?void 0:t.classList.contains(e))??!1}cleanup(){console.log(`🧹 Cleaning up modal "${this.id}"`);const e=this.eventListeners.get("escape");e&&e.forEach(t=>{document.removeEventListener("keydown",t)}),this.eventListeners.clear(),this._modal&&(this._modal.remove(),this._modal=null),this.isOpen=!1,document.body.style.overflow=""}}class M{constructor(e={}){l(this,"modal");l(this,"callbacks",{});l(this,"serverInfo",null);l(this,"currentTab","connect");this.callbacks=e,this.modal=new x("new-chat-modal","🆕 Create New Chat",this.getModalContent(),"new-chat-modal")}async initialize(){await this.modal.initialize(),this.setupEventListeners(),this.setupTabSwitching(),console.log("✅ NewChatModal initialized")}getModalContent(){return`
      <div class="connection-tabs" role="tablist">
        <button class="tab-btn active" data-tab="connect" role="tab" aria-selected="true" aria-controls="connect-tab">
          Connect to Peer
        </button>
        <button class="tab-btn" data-tab="info" role="tab" aria-selected="false" aria-controls="info-tab">
          My Connection Info
        </button>
      </div>

      <div class="tab-content active" id="connect-tab" role="tabpanel" aria-labelledby="connect">
        <div class="tab-section">
          <h4 class="section-title">Connect to Peer</h4>
          <p class="section-description">Enter the address of a peer to start a secure chat</p>
          
          <div class="form-group">
            <label class="form-label">Peer Address (IP:Port)</label>
            <input type="text" 
                   id="peer-address" 
                   class="form-input" 
                   placeholder="127.0.0.1:8080" 
                   autocomplete="off">
            <small class="form-hint">Example: 192.168.1.100:8080</small>
          </div>
          
          <div class="form-group">
            <label class="form-label">Chat Name</label>
            <input type="text" 
                   id="chat-name" 
                   class="form-input" 
                   placeholder="Chat with friend" 
                   autocomplete="off">
            <small class="form-hint">Optional: Give this chat a custom name</small>
          </div>
          
          <div class="form-actions">
            <button id="connect-btn" class="btn btn-primary">
              <span class="btn-icon">🔗</span>
              <span class="btn-text">Connect</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="tab-content" id="info-tab" role="tabpanel" aria-labelledby="info">
        <div class="info-section">
          <h4>📡 Your Connection Info</h4>
          <div class="info-item">
            <label>Server Status:</label>
            <span id="modal-server-status">Not started</span>
          </div>
          <div class="info-item">
            <label>Your Address:</label>
            <span id="modal-my-address">Unknown</span>
            <button
              id="copy-address"
              class="copy-btn"
              title="Click: copy inside app (auto-clears). Shift/Ctrl/⌘: copy to system clipboard"
            >📋</button>
          </div>
          <div class="info-item">
            <label>Your Public Key:</label>
            <textarea id="my-public-key" readonly></textarea>
            <button
              id="copy-key"
              class="copy-btn"
              title="Click: copy inside app (auto-clears). Shift/Ctrl/⌘: copy to system clipboard"
            >📋</button>
          </div>
          <button id="start-server-btn" class="primary-btn">Start Server</button>
        </div>
      </div>
    `}setupTabSwitching(){const e=this.modal.getElement();if(!e)return;e.querySelectorAll(".tab-btn").forEach(s=>{s.addEventListener("click",a=>{a.preventDefault();const n=a.currentTarget.dataset.tab;n&&this.switchTab(n)})})}switchTab(e){const t=this.modal.getElement();if(!t)return;this.currentTab=e,t.querySelectorAll(".tab-btn").forEach(n=>{n.classList.remove("active"),n.setAttribute("aria-selected","false")});const s=t.querySelector(`.tab-btn[data-tab="${e}"]`);s==null||s.classList.add("active"),s==null||s.setAttribute("aria-selected","true"),t.querySelectorAll(".tab-content").forEach(n=>n.classList.remove("active"));const a=t.querySelector(`#${e}-tab`);a==null||a.classList.add("active"),e==="info"&&this.updateConnectionInfo().catch(()=>{})}setupEventListeners(){const e=this.modal.getElement();if(!e)return;const t=e.querySelector("#connect-btn");t==null||t.addEventListener("click",async()=>{await this.handleConnect()});const s=e.querySelector("#start-server-btn");s==null||s.addEventListener("click",async()=>{await this.handleStartServer()}),this.setupCopyButtons(e);const a=e.querySelector("#peer-address"),n=e.querySelector("#chat-name");[a,n].forEach(o=>{o==null||o.addEventListener("keypress",i=>{i.key==="Enter"&&(i.preventDefault(),this.handleConnect())})})}setupCopyButtons(e){const t=e.querySelector("#copy-address"),s=e.querySelector("#copy-key");t==null||t.addEventListener("click",async a=>{var r,c,d,u;const n=e.querySelector("#modal-my-address"),o=(r=n==null?void 0:n.textContent)==null?void 0:r.trim(),i=a.shiftKey||a.ctrlKey||a.metaKey;if(o&&o!=="Unknown")try{if(!i&&((c=window.electronAPI)!=null&&c.secureClipboard))await window.electronAPI.secureClipboard.writeText(o,{ttlMs:12e4});else if((d=window.electronAPI)!=null&&d.clipboard)await window.electronAPI.clipboard.writeText(o);else if((u=navigator.clipboard)!=null&&u.writeText)await navigator.clipboard.writeText(o);else throw new Error("No clipboard API available");this.showCopySuccess(t)}catch(m){console.error("Failed to copy address:",m),this.showCopyError(t)}}),s==null||s.addEventListener("click",async a=>{var r,c,d,u;const n=e.querySelector("#my-public-key"),o=(r=n==null?void 0:n.value)==null?void 0:r.trim(),i=a.shiftKey||a.ctrlKey||a.metaKey;if(o)try{if(!i&&((c=window.electronAPI)!=null&&c.secureClipboard))await window.electronAPI.secureClipboard.writeText(o,{ttlMs:12e4});else if((d=window.electronAPI)!=null&&d.clipboard)await window.electronAPI.clipboard.writeText(o);else if((u=navigator.clipboard)!=null&&u.writeText)await navigator.clipboard.writeText(o);else throw new Error("No clipboard API available");this.showCopySuccess(s)}catch(m){console.error("Failed to copy key:",m),this.showCopyError(s)}})}async handleConnect(){const e=this.modal.getElement();if(!e)return;const t=e.querySelector("#peer-address"),s=e.querySelector("#chat-name"),a=e.querySelector("#connect-btn"),n=t==null?void 0:t.value.trim(),o=(s==null?void 0:s.value.trim())||"Unknown Peer";if(!n){this.showError("Please enter a peer address"),t==null||t.focus();return}if(!this.callbacks.onConnect){this.showError("Connection handler not available");return}a.disabled=!0,a.innerHTML='<span class="btn-icon">⏳</span><span class="btn-text">Connecting...</span>',a.classList.add("loading");try{await this.callbacks.onConnect(n,o),this.close(),t.value="",s.value=""}catch(i){console.error("Connection failed:",i),this.showError(`Connection failed: ${i instanceof Error?i.message:"Unknown error"}`)}finally{a.disabled=!1,a.innerHTML='<span class="btn-icon">🔗</span><span class="btn-text">Connect</span>',a.classList.remove("loading")}}async handleStartServer(){const e=this.modal.getElement();if(!e)return;const t=e.querySelector("#start-server-btn");if(!this.callbacks.onStartServer){this.showError("Server start handler not available");return}t.disabled=!0,t.innerHTML='<span class="btn-icon">⏳</span><span class="btn-text">Starting...</span>',t.classList.add("loading");try{await this.callbacks.onStartServer()}catch(s){console.error("Failed to start server:",s),this.showError(`Failed to start server: ${s instanceof Error?s.message:"Unknown error"}`),t.disabled=!1,t.innerHTML='<span class="btn-icon">🚀</span><span class="btn-text">Start Server</span>',t.classList.remove("loading")}}showCopySuccess(e){const t=e.innerHTML,s=e.className;e.innerHTML="✅",e.className=s+" success",setTimeout(()=>{e.innerHTML=t,e.className=s},2e3)}showCopyError(e){const t=e.innerHTML,s=e.className;e.innerHTML="❌",e.className=s+" error",setTimeout(()=>{e.innerHTML=t,e.className=s},2e3)}showError(e){const t=this.modal.getElement();if(!t)return;let s=t.querySelector(".error-message");if(!s){s=document.createElement("div"),s.className="error-message";const a=t.querySelector(".modal-body");a==null||a.insertBefore(s,a.firstChild)}s.textContent=e,s.style.display="block",setTimeout(()=>{s&&(s.style.display="none")},5e3)}open(){this.modal.open(),this.updateConnectionInfo()}close(){this.modal.close()}toggle(){this.modal.toggle(),this.modal.isOpen()&&this.updateConnectionInfo()}updateServerInfo(e,t){this.serverInfo={address:e,port:t};const s=this.modal.getElement();if(!s)return;const a=s.querySelector("#modal-server-status"),n=s.querySelector("#modal-my-address"),o=s.querySelector("#start-server-btn");a&&(a.textContent="Running",a.className="status-indicator status-running"),n&&(n.textContent=`${e}:${t}`),o&&(o.disabled=!0,o.innerHTML='<span class="btn-icon">✅</span><span class="btn-text">Server Running</span>',o.classList.remove("loading"))}async updateConnectionInfo(){var t;const e=this.modal.getElement();if(e&&(t=window.electronAPI)!=null&&t.crypto)try{const s=await window.electronAPI.crypto.getPublicKey(),a=e.querySelector("#my-public-key");a&&s&&(a.value=s)}catch(s){console.error("Failed to get public key:",s)}}setCallbacks(e){this.callbacks={...this.callbacks,...e}}cleanup(){var e;(e=this.modal)==null||e.cleanup(),console.log("🧹 NewChatModal cleaned up")}}class k{constructor(){l(this,"canvas");l(this,"ctx");this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("2d")}async initialize(){console.log("🖼️ ImageProcessor: Initialized")}async processImageFile(e){return new Promise((t,s)=>{if(!e.type.startsWith("image/")){s(new Error("Selected file is not an image"));return}const a=new FileReader;a.onload=async n=>{var o;try{const i=(o=n.target)==null?void 0:o.result,r=new Image;r.onload=async()=>{try{const{width:u,height:m}=this.calculateDimensions(r.width,r.height,800,600);this.canvas.width=u,this.canvas.height=m,this.ctx.drawImage(r,0,0,u,m);const f=this.canvas.toDataURL("image/jpeg",.8),g=this.calculateDimensions(r.width,r.height,150,100);this.canvas.width=g.width,this.canvas.height=g.height,this.ctx.drawImage(r,0,0,g.width,g.height);const C=this.canvas.toDataURL("image/jpeg",.6),I={filename:e.name,mimeType:e.type,size:this.calculateBase64Size(f),width:u,height:m,data:f,thumbnail:C};t(I)}catch(c){s(c)}},r.onerror=()=>s(new Error("Failed to load image")),r.src=i}catch(i){s(i)}},a.onerror=()=>s(new Error("Failed to read file")),a.readAsDataURL(e)})}calculateDimensions(e,t,s,a){let{width:n,height:o}={width:e,height:t};return n>s&&(o=o*s/n,n=s),o>a&&(n=n*a/o,o=a),{width:Math.round(n),height:Math.round(o)}}calculateBase64Size(e){const t=e.split(",")[1];return Math.round(t.length*3/4)}async createImagePreview(e){const t=document.createElement("div");t.className="image-preview";const s=document.createElement("img");s.src=e.thumbnail||e.data,s.alt=e.filename,s.className="preview-image";const a=document.createElement("div");return a.className="image-info",a.innerHTML=`
      <div class="filename">${e.filename}</div>
      <div class="details">${this.formatFileSize(e.size)} • ${e.width}×${e.height}</div>
    `,t.appendChild(s),t.appendChild(a),t}formatFileSize(e){if(e===0)return"0 B";const t=1024,s=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${s[a]}`}cleanup(){this.canvas.width=0,this.canvas.height=0}}class P{constructor(){l(this,"overlay",null);l(this,"imgEl",null);l(this,"captionEl",null);l(this,"onKeyDown",null)}async initialize(){if(this.overlay)return;const e=document.createElement("div");e.id="image-viewer",e.className="image-viewer",e.style.position="fixed",e.style.inset="0",e.style.display="none",e.style.alignItems="center",e.style.justifyContent="center",e.style.zIndex="100000",e.style.background="rgba(0,0,0,0.85)",e.style.backdropFilter="blur(2px)",e.innerHTML=`
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
        ">
        <div class="image-viewer-caption" style="
          margin-top: 0.5rem;
          text-align: center;
          color: rgba(255,255,255,0.85);
          font-size: 0.9rem;
          max-width: 92vw;
          word-break: break-word;
        "></div>
      </div>
    `,document.body.appendChild(e),this.overlay=e,this.imgEl=e.querySelector(".image-viewer-img"),this.captionEl=e.querySelector(".image-viewer-caption");const t=e.querySelector(".image-viewer-close");t==null||t.addEventListener("click",()=>this.close()),e.addEventListener("click",s=>{s.target===e&&this.close()}),this.onKeyDown=s=>{s.key==="Escape"&&this.close()}}open(e,t="Image",s=""){if(!this.overlay||!this.imgEl||!this.captionEl){this.initialize().then(()=>this.open(e,t,s)).catch(console.error);return}document.body.appendChild(this.overlay),this.imgEl.src="",this.imgEl.alt=t||"Image",this.captionEl.textContent=s||"",this.overlay.style.display="flex",document.body.classList.add("lightbox-open"),this.onKeyDown&&document.addEventListener("keydown",this.onKeyDown);const a=()=>o(),n=()=>{this.captionEl.textContent=s?`${s} (failed to load)`:"Image failed to load",o()},o=i=>{this.imgEl.removeEventListener("load",a),this.imgEl.removeEventListener("error",n)};this.imgEl.addEventListener("load",a,{once:!0}),this.imgEl.addEventListener("error",n,{once:!0}),this.imgEl.src=e,window.setTimeout(()=>{this.overlay&&this.overlay.style.display==="flex"&&this.imgEl.src},100)}close(){this.overlay&&(this.overlay.style.display="none",document.body.classList.remove("lightbox-open"),this.onKeyDown&&document.removeEventListener("keydown",this.onKeyDown))}cleanup(){this.overlay&&(this.overlay.remove(),this.overlay=null,this.imgEl=null,this.captionEl=null)}}const p=class p{constructor(){l(this,"events",new Map)}static getInstance(){return p.instance||(p.instance=new p),p.instance}on(e,t){this.events.has(e)||this.events.set(e,[]),this.events.get(e).push(t)}off(e,t){const s=this.events.get(e);if(s){const a=s.indexOf(t);a>-1&&s.splice(a,1)}}emit(e,...t){const s=this.events.get(e);s&&s.forEach(a=>{try{a(...t)}catch(n){console.error(`Error in event callback for "${e}":`,n)}})}once(e,t){const s=(...a)=>{t(...a),this.off(e,s)};this.on(e,s)}};l(p,"instance");let v=p;class A{constructor(){l(this,"eventBus",v.getInstance());l(this,"savedChatId",null)}async initialize(){await this.ensureSavedChat(),this.setupEventListeners()}setupEventListeners(){this.eventBus.on("saved-messages:save",e=>this.saveMessageToSaved(e)),this.eventBus.on("saved-messages:show",()=>this.showSavedMessages())}async ensureSavedChat(){try{const e=await window.electronAPI.db.getChats(),t=e.find(o=>o.type==="saved")||e.find(o=>o.name==="💾 Saved Messages");if(t){this.savedChatId=t.id;return}const s={name:"💾 Saved Messages",participants:["me"],type:"saved"},a=await window.electronAPI.db.saveChat(s);this.savedChatId=a.id;const n={chatId:this.savedChatId,content:`👋 Welcome to Saved Messages!

Forward messages here to keep them handy. You can save:
• Text messages
• Images
• Important notes

Note: Saved messages are cleared when the app is restarted.`,sender:"system",type:"system",encrypted:!1};await window.electronAPI.db.saveMessage(n)}catch(e){console.error("Failed to ensure Saved Messages chat:",e)}}async saveMessageToSaved(e){try{if(this.savedChatId||await this.ensureSavedChat(),!this.savedChatId)return;const t={chatId:this.savedChatId,content:`📝 Forwarded: ${e.content}`,sender:"me",type:e.type,encrypted:!1,imageData:e.imageData,replyTo:e.id},s=await window.electronAPI.db.saveMessage(t);this.eventBus.emit("message:sent",s),this.eventBus.emit("chat:updated",this.savedChatId),this.showSaveNotification()}catch(t){console.error("Failed to save message:",t)}}async showSavedMessages(){this.savedChatId||await this.ensureSavedChat(),this.savedChatId&&this.eventBus.emit("chat:selected",this.savedChatId)}showSaveNotification(){const e=document.createElement("div");e.className="save-notification",e.textContent="💾 Saved to Saved Messages",document.body.appendChild(e),setTimeout(()=>e.classList.add("show"),100),setTimeout(()=>{e.classList.remove("show"),setTimeout(()=>e.remove(),300)},2e3)}async getSavedMessages(){try{return this.savedChatId||await this.ensureSavedChat(),this.savedChatId?await window.electronAPI.db.getMessages(this.savedChatId):[]}catch(e){return console.error("Failed to get saved messages:",e),[]}}cleanup(){}}function w(h){return String(h).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function T(h,e={}){const t=e.locale,s=new Intl.DateTimeFormat(t,e.time??{hour:"2-digit",minute:"2-digit"}),a=new Intl.DateTimeFormat(t,e.date??{year:"numeric",month:"short",day:"2-digit"}),n=new Date(h);return{time:s.format(n),date:a.format(n)}}function $(h,e={}){const{time:t,date:s}=T(h,e);return`
    <div class="message-time${e.className?` ${e.className}`:""}">
      <span class="time">${w(t)}</span>
      <span class="date">${w(s)}</span>
    </div>
  `}class B{constructor(e={autoStart:!0}){l(this,"eventBus",v.getInstance());l(this,"serverInfo",null);l(this,"config");l(this,"bound",!1);this.config=e}async initialize(){this.setupTransportListeners(),this.setupEventListeners(),this.config.autoStart&&await this.startServer(this.config.port)}setupEventListeners(){this.eventBus.on("network:connect-request",async({address:e,port:t})=>{try{await this.connectToPeer(e,t)}catch(s){console.error("Failed to connect to peer:",s),this.eventBus.emit("status:updated",{step:"Peer Connection",status:"error",message:s instanceof Error?s.message:"Failed to connect to peer",timestamp:Date.now()})}}),this.eventBus.on("network:start-server-request",async()=>{try{await this.startServer()}catch(e){console.error("Failed to start server:",e),this.eventBus.emit("status:updated",{step:"Server Start",status:"error",message:e instanceof Error?e.message:"Failed to start server",timestamp:Date.now()})}}),this.eventBus.on("network:get-server-info",()=>{this.serverInfo&&this.eventBus.emit("network:server-started",this.serverInfo)})}setupTransportListeners(){var e,t,s;this.bound||(this.bound=!0,(e=window.electronAPI)!=null&&e.transport&&(window.electronAPI.transport.onPeerConnected((a,n)=>{this.eventBus.emit("peer:connected",a,n)}),window.electronAPI.transport.onPeerDisconnected(a=>{this.eventBus.emit("peer:disconnected",a)}),window.electronAPI.transport.onMessage((a,n)=>{this.eventBus.emit("message:received",{chatId:a,data:n})}),(s=(t=window.electronAPI.transport).onSignal)==null||s.call(t,(a,n)=>{this.eventBus.emit("signal:received",a,n)})))}async startServer(e){try{this.eventBus.emit("status:updated",{step:"Network Setup",status:"pending",message:"Starting server...",timestamp:Date.now()}),this.serverInfo=await window.electronAPI.transport.startServer(e),this.eventBus.emit("status:updated",{step:"Network Setup",status:"success",message:`Server listening on ${this.serverInfo.address}:${this.serverInfo.port}`,timestamp:Date.now()}),this.eventBus.emit("network:server-started",this.serverInfo)}catch(t){throw this.eventBus.emit("status:updated",{step:"Network Setup",status:"error",message:t instanceof Error?t.message:"Failed to start server",timestamp:Date.now()}),t}}async connectToPeer(e,t){var s;if(!((s=window.electronAPI)!=null&&s.transport))throw new Error("Transport API not available");try{console.log(`Connecting to ${e}:${t}...`);const a=await window.electronAPI.transport.connect(e,t);return a&&console.log("Successfully connected to peer"),a}catch(a){throw console.error("Connection error:",a),a}}async sendMessage(e,t){var s;if(!((s=window.electronAPI)!=null&&s.transport))throw new Error("Transport API not available");try{if(!await window.electronAPI.transport.send(e,{content:t.content,timestamp:Date.now(),...t}))throw new Error("Failed to send message - transport returned false")}catch(a){throw console.error("Failed to send message via transport:",a),a}}getServerInfo(){return this.serverInfo}cleanup(){this.eventBus.off("network:connect-request",this.handleConnectRequest.bind(this)),this.eventBus.off("network:start-server-request",this.handleStartServerRequest.bind(this)),this.eventBus.off("network:get-server-info",this.handleGetServerInfo.bind(this))}async handleConnectRequest({address:e,port:t}){try{await this.connectToPeer(e,t)}catch(s){console.error("Failed to connect to peer:",s),this.eventBus.emit("status:updated",{step:"Peer Connection",status:"error",message:s instanceof Error?s.message:"Failed to connect to peer",timestamp:Date.now()})}}async handleStartServerRequest(){try{await this.startServer()}catch(e){console.error("Failed to start server:",e),this.eventBus.emit("status:updated",{step:"Server Start",status:"error",message:e instanceof Error?e.message:"Failed to start server",timestamp:Date.now()})}}handleGetServerInfo(){this.serverInfo&&this.eventBus.emit("network:server-started",this.serverInfo)}}class D{constructor(){l(this,"eventBus",v.getInstance());l(this,"components",new Map);l(this,"currentChatId",null);l(this,"chats",new Map);l(this,"serverInfo",null);l(this,"newChatModal",null);l(this,"imageProcessor",new k);l(this,"imageViewer",new P);l(this,"typingTimers",new Map);l(this,"lastTypingSentAt",0);l(this,"privacyMode",!0);l(this,"revealedMessageId",null);l(this,"revealTimer",null);l(this,"recentIncoming",new Map);this.components.set("debug",new L),this.components.set("savedMessages",new A),this.components.set("network",new B({autoStart:!1})),this.newChatModal=new M({onConnect:this.handleModalConnect.bind(this),onStartServer:this.handleModalStartServer.bind(this)}),this.components.set("newChatModal",this.newChatModal)}async initialize(){await this.setupUI(),await this.checkElectronAPI();for(const[,e]of this.components)e.initialize&&await e.initialize();await this.imageProcessor.initialize(),await this.imageViewer.initialize(),this.setupEventListeners(),await this.loadExistingChats()}transport(){var e;return(e=window.electronAPI)==null?void 0:e.transport}async checkElectronAPI(){try{const e=typeof window.electronAPI<"u",t=document.getElementById("app-status");t&&(e?(t.textContent="🟢 Ready",t.classList.remove("pending","warning","error"),t.classList.add("safe")):(t.textContent="⚠️ Preload not loaded",t.classList.remove("pending","safe"),t.classList.add("warning")))}catch(e){console.error("ElectronAPI check failed:",e)}}setupEventListeners(){var e,t,s,a,n,o;this.eventBus.on("chat:selected",i=>this.selectChat(i)),this.eventBus.on("chat:updated",()=>this.refreshChatList()),this.eventBus.on("message:sent",i=>{this.currentChatId===i.chatId&&this.refreshMessages(),this.refreshChatList()}),this.eventBus.on("message:received",({chatId:i,data:r})=>{this.handleIncomingMessage(i,r)}),(t=(e=window.electronAPI)==null?void 0:e.transport)!=null&&t.onPeerConnected&&window.electronAPI.transport.onPeerConnected((i,r)=>{this.handlePeerConnected(i,r)}),(a=(s=window.electronAPI)==null?void 0:s.transport)!=null&&a.onPeerDisconnected&&window.electronAPI.transport.onPeerDisconnected(i=>{this.handlePeerDisconnected(i)}),(o=(n=this.transport())==null?void 0:n.onSignal)==null||o.call(n,(i,r)=>{this.handleSignal(i,r)}),this.eventBus.on("saved-messages:show",()=>this.openSavedMessages())}async setupUI(){var e;document.body.innerHTML=`
      <div id="app">
        <header class="app-header">
          <h1>🔒 Secure Chat</h1>
          <div class="app-status-container">
            <span id="app-status" class="app-status">🔄 Starting...</span>
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
              <div id="my-address">Address: Unknown</div>
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
              <button id="image-btn" class="image-btn" disabled title="Send Image">📷</button>
              <input type="text" id="message-input" placeholder="Type a secure message..." disabled>
              <button id="send-btn" disabled>Send</button>
            </div>
          </section>
        </main>
      </div>
    `,this.setupBasicEventListeners(),await((e=this.newChatModal)==null?void 0:e.initialize()),this.updateServerStatus()}setupBasicEventListeners(){const e=document.getElementById("send-btn"),t=document.getElementById("message-input"),s=document.getElementById("new-chat-btn"),a=document.getElementById("saved-messages-btn");e==null||e.addEventListener("click",()=>this.sendMessage()),t==null||t.addEventListener("keydown",i=>{i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),this.sendMessage())}),s==null||s.addEventListener("click",()=>this.showNewChatModal()),a==null||a.addEventListener("click",()=>this.openSavedMessages());const n=document.getElementById("image-btn"),o=document.getElementById("image-input");n==null||n.addEventListener("click",()=>o==null?void 0:o.click()),o==null||o.addEventListener("change",async i=>{var c,d;const r=(d=(c=i.target)==null?void 0:c.files)==null?void 0:d[0];if(r&&this.currentChatId)try{await this.sendImageMessage(r),i.target.value=""}catch(u){console.error("Failed to send image:",u),alert(`Failed to send image: ${u instanceof Error?u.message:"Unknown error"}`)}}),t==null||t.addEventListener("input",()=>{var r,c;if(!this.currentChatId)return;const i=Date.now();i-this.lastTypingSentAt>1200&&(this.lastTypingSentAt=i,(c=(r=this.transport())==null?void 0:r.sendSignal)==null||c.call(r,this.currentChatId,{action:"typing"}),setTimeout(()=>{var d,u;Date.now()-this.lastTypingSentAt>1100&&this.currentChatId&&((u=(d=this.transport())==null?void 0:d.sendSignal)==null||u.call(d,this.currentChatId,{action:"stop_typing"}))},1400))}),t==null||t.addEventListener("blur",()=>{var i,r;this.currentChatId&&((r=(i=this.transport())==null?void 0:i.sendSignal)==null||r.call(i,this.currentChatId,{action:"stop_typing"}))}),document.addEventListener("keydown",i=>{i.key==="Escape"&&this.hideRevealedMessage()}),window.addEventListener("blur",()=>this.hideRevealedMessage())}showNewChatModal(){this.newChatModal?(this.newChatModal.open(),this.newChatModal.updateConnectionInfo().catch(()=>{}),this.serverInfo&&this.newChatModal.updateServerInfo(this.serverInfo.address,this.serverInfo.port)):this.createSimpleFallbackModal()}async handleModalStartServer(){var t,s;if(!((t=window.electronAPI)!=null&&t.transport))throw new Error("Transport API not available");const e=await window.electronAPI.transport.startServer();this.serverInfo=e,this.updateServerStatus(),(s=this.newChatModal)==null||s.updateServerInfo(e.address,e.port)}async handleModalConnect(e,t){var o;if(!((o=window.electronAPI)!=null&&o.transport))throw new Error("Transport API not available");let s=e,a=null;if(e.includes(":")){const[i,r]=e.split(":");s=i,a=Number.parseInt(r,10)}if(!s||!a||Number.isNaN(a))throw new Error("Invalid address format. Use IP:PORT");if(!await window.electronAPI.transport.connect(s,a))throw new Error("Failed to connect to peer")}updateServerStatus(){const e=document.getElementById("server-status"),t=document.getElementById("my-address");e&&(e.textContent=this.serverInfo?"Server: Running":"Server: Not started"),t&&(t.textContent=this.serverInfo?`Address: ${this.serverInfo.address}:${this.serverInfo.port}`:"Address: Unknown")}async handlePeerConnected(e,t){const s={name:`Chat with ${t.name}`,participants:["me",t.id],peerAddress:t.address,peerPublicKey:t.publicKey,type:"direct",isOnline:!0};try{const a=await window.electronAPI.db.saveChat(s);this.chats.set(e,{...a,id:e}),this.refreshChatList(),this.selectChat(e)}catch(a){console.error("Failed to save new chat:",a)}}handlePeerDisconnected(e){const t=this.chats.get(e);t&&(t.isOnline=!1,this.refreshChatList(),this.currentChatId===e&&this.updateChatHeader())}isDuplicateIncoming(e,t,s=2e3){const a=Date.now();let n=this.recentIncoming.get(e);n||(n=new Map,this.recentIncoming.set(e,n));for(const[o,i]of n)a-i>s&&n.delete(o);return n.has(t)?!0:(n.set(t,a),!1)}async handleIncomingMessage(e,t){var s;try{const a=t??{},n=typeof a.content=="string"?a.content:typeof a.message=="string"?a.message:String(t),o=typeof a.type=="string"?a.type:"text",i=(s=a.imageData)==null?void 0:s.data,r=["peer",o,a.encrypted?"1":"0",n,i?i.slice(0,64):""].join("|");if(this.isDuplicateIncoming(e,r))return;const c={chatId:e,content:n,sender:"peer",encrypted:!!a.encrypted,type:o,imageData:a.imageData};await window.electronAPI.db.saveMessage(c),this.currentChatId===e&&await this.refreshMessages(),this.refreshChatList()}catch(a){console.error("Failed to handle incoming message:",a)}}handleSignal(e,t){if(this.currentChatId!==e)return;const s=document.getElementById("chat-status");if(s)if(t.action==="typing"){s.textContent="Peer is typing…",s.classList.add("typing");const a=this.typingTimers.get(e);a&&window.clearTimeout(a);const n=window.setTimeout(()=>{s.textContent==="Peer is typing…"&&(s.textContent="",s.classList.remove("typing"))},3e3);this.typingTimers.set(e,n)}else t.action==="stop_typing"?(s.textContent="",s.classList.remove("typing")):t.action==="read"&&(s.textContent="Seen",setTimeout(()=>{s.textContent==="Seen"&&(s.textContent="")},2e3))}async loadExistingChats(){try{const e=await window.electronAPI.db.getChats();this.chats.clear();for(const t of e)this.chats.set(t.id,t);this.refreshChatList()}catch(e){console.error("Failed to load chats:",e)}}refreshChatList(){const e=document.getElementById("chat-list");if(!e)return;if(this.chats.size===0){e.innerHTML='<li class="no-chats">No chats yet. Create one!</li>';return}const t=Array.from(this.chats.values()).sort((s,a)=>{var i,r;if(s.type==="saved")return-1;if(a.type==="saved")return 1;const n=((i=s.lastMessage)==null?void 0:i.timestamp)??0;return(((r=a.lastMessage)==null?void 0:r.timestamp)??0)-n});e.innerHTML=t.map(s=>`
      <li class="chat-item ${this.currentChatId===s.id?"active":""}" data-chat-id="${s.id}">
        <div class="chat-name">${s.name}</div>
        <div class="chat-preview">
          ${s.lastMessage?s.lastMessage.type==="image"?"📷 Photo":(s.lastMessage.content??"").substring(0,50)+((s.lastMessage.content??"").length>50?"...":""):"No messages yet"}
        </div>
        <div class="chat-time">
          ${s.lastMessage?new Date(s.lastMessage.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):""}
        </div>
      </li>
    `).join(""),e.querySelectorAll(".chat-item").forEach(s=>{s.addEventListener("click",()=>{const a=s.dataset.chatId;this.selectChat(a)})})}escapeHtml(e){const t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};return String(e).replace(/[&<>"']/g,s=>t[s])}async refreshMessages(){var t,s;const e=document.getElementById("messages");if(!e||!this.currentChatId){e&&(e.innerHTML=`
          <div class="welcome-message">
            <h3>🔒 Welcome to Secure Chat</h3>
            <p>Your messages are end-to-end encrypted using RSA + AES encryption.</p>
            <p>Click "New Chat" to connect to a peer or start your first conversation.</p>
          </div>
        `);return}try{const a=await window.electronAPI.db.getMessages(this.currentChatId);if(a.length===0){e.innerHTML='<div class="no-messages">No messages yet. Start the conversation!</div>';return}e.innerHTML=a.map(i=>{var b;const d=`
          <div class="message-footer">
            ${`
          <div class="message-time-wrapper">
            ${$(i.timestamp)}
            <span class="timestamp-hint">show time</span>
          </div>
        `}
            ${i.sender!=="me"&&((b=this.chats.get(this.currentChatId))==null?void 0:b.type)!=="saved"?`<button class="save-message-btn" onclick="window.chatApp.saveMessage('${i.id}')" title="Save Message">💾</button>`:""}
          </div>
        `,m=i.type!=="system"?"sensitive":"";if(i.type==="image"&&i.imageData){const y=this.escapeHtml(i.content),g=this.escapeHtml(i.imageData.filename);return`
            <div class="message ${i.sender==="me"?"sent":"received"} ${m}" data-mid="${i.id}">
              <div class="image-message">
                <img src="${i.imageData.data}" alt="${g}" class="message-image">
                <div class="image-caption">${y}</div>
              </div>
              ${d}
            </div>
          `}const f=this.escapeHtml(i.content);return`
          <div class="message ${i.sender==="me"?"sent":"received"} ${m}" data-mid="${i.id}">
            <div class="message-content">${f}</div>
            ${d}
          </div>
        `}).join(""),e.querySelectorAll(".message-image").forEach(i=>{var c,d;const r=((d=(c=i.closest(".image-message"))==null?void 0:c.querySelector(".image-caption"))==null?void 0:d.textContent)||"";i.addEventListener("click",u=>{u.preventDefault();const m=i.closest(".message");if(m&&m.classList.contains("sensitive")&&!m.classList.contains("revealed")){this.revealMessage(m.getAttribute("data-mid")||"");return}this.openImageWithFallback(i,r)})}),this.attachPrivacyHandlers(e),e.scrollTop=e.scrollHeight;const o=a[a.length-1];o&&((s=(t=this.transport())==null?void 0:t.sendSignal)==null||s.call(t,this.currentChatId,{action:"read",lastSeenTs:o.timestamp}))}catch(a){console.error("Failed to render messages:",a)}}attachPrivacyHandlers(e){if(!this.privacyMode)return;e.querySelectorAll(".message.sensitive").forEach(s=>{s.addEventListener("click",a=>{if(a.target.closest("button"))return;const o=s.getAttribute("data-mid")||"";o&&this.revealMessage(o)},{passive:!0})});const t=s=>{s.target.closest(".message.revealed")||this.hideRevealedMessage()};e.removeEventListener("click",t),e.addEventListener("click",t)}revealMessage(e){if(!e)return;if(this.revealedMessageId&&this.revealedMessageId!==e){const s=document.querySelector(`.message[data-mid="${this.revealedMessageId}"]`);s==null||s.classList.remove("revealed")}const t=document.querySelector(`.message[data-mid="${e}"]`);t&&(t.classList.add("revealed"),this.revealedMessageId=e,this.revealTimer&&window.clearTimeout(this.revealTimer),this.revealTimer=window.setTimeout(()=>this.hideRevealedMessage(),1e4))}hideRevealedMessage(){if(!this.revealedMessageId)return;const e=document.querySelector(`.message[data-mid="${this.revealedMessageId}"]`);e==null||e.classList.remove("revealed"),this.revealedMessageId=null,this.revealTimer&&(window.clearTimeout(this.revealTimer),this.revealTimer=null)}openImageWithFallback(e,t){try{this.imageViewer.open(e.src,e.alt||"Image",t)}catch{}setTimeout(()=>{this.isViewerShowing(e.src)||this.toggleInlineLightbox(e)},50)}isViewerShowing(e){const t=document.getElementById("image-viewer");if(!t||(t.style.display||getComputedStyle(t).display)==="none")return!1;if(e){const a=t.querySelector("img");if(!a)return!1;const n=a.getAttribute("src")||"";if(!(n===e||n.startsWith(e.slice(0,32))))return!1}return!0}toggleInlineLightbox(e){const t=e.classList.toggle("expanded");if(document.body.classList.toggle("lightbox-open",t),t){const s=a=>{a.key==="Escape"&&(e.classList.remove("expanded"),document.body.classList.remove("lightbox-open"),document.removeEventListener("keydown",s))};document.addEventListener("keydown",s,{once:!0})}}async selectChat(e){this.currentChatId=e,this.refreshChatList(),this.updateChatHeader(),await this.refreshMessages();const t=document.getElementById("message-input"),s=document.getElementById("send-btn"),a=document.getElementById("image-btn");t&&(t.disabled=!1),s&&(s.disabled=!1),a&&(a.disabled=!1)}updateChatHeader(){const e=document.getElementById("chat-title"),t=document.getElementById("chat-status");if(!this.currentChatId){e&&(e.textContent="Select a chat"),t&&(t.textContent="");return}const s=this.chats.get(this.currentChatId);s&&(e&&(e.textContent=s.name),t&&(t.textContent=s.type==="saved"?"Your saved messages":s.isOnline?`Connected to ${s.peerAddress}`:"Offline"))}async sendMessage(){var s,a,n;const e=document.getElementById("message-input"),t=(e==null?void 0:e.value.trim())||"";if(!(!t||!this.currentChatId))try{const o={chatId:this.currentChatId,content:t,sender:"me",encrypted:!1,type:"text"},i=await window.electronAPI.db.saveMessage(o);((s=this.chats.get(this.currentChatId))==null?void 0:s.type)==="saved"||window.electronAPI.transport&&await window.electronAPI.transport.send(this.currentChatId,{content:t,timestamp:i.timestamp,type:"text"}),e&&(e.value=""),this.currentChatId&&((n=(a=this.transport())==null?void 0:a.sendSignal)==null||n.call(a,this.currentChatId,{action:"stop_typing"})),await this.refreshMessages(),this.refreshChatList()}catch(o){console.error("Failed to send message:",o),alert("Failed to send message")}}async sendImageMessage(e){var o;if(!this.currentChatId)return;const t=await this.imageProcessor.processImageFile(e),s={chatId:this.currentChatId,content:`📷 ${t.filename}`,sender:"me",encrypted:!1,type:"image",imageData:t},a=await window.electronAPI.db.saveMessage(s);((o=this.chats.get(this.currentChatId))==null?void 0:o.type)==="saved"||window.electronAPI.transport&&await window.electronAPI.transport.send(this.currentChatId,{content:`📷 ${t.filename}`,timestamp:a.timestamp,type:"image",imageData:t}),await this.refreshMessages(),this.refreshChatList()}async openSavedMessages(){try{let e=Array.from(this.chats.values()).find(t=>t.type==="saved");e||(e=(await window.electronAPI.db.getChats()).find(s=>s.type==="saved"),e||(e=await window.electronAPI.db.saveChat({name:"💾 Saved Messages",participants:["me"],type:"saved"})),this.chats.set(e.id,e),this.refreshChatList()),await this.selectChat(e.id)}catch(e){console.error("Failed to open Saved Messages:",e),alert("Failed to open Saved Messages")}}async saveMessage(e){try{if(!this.currentChatId)return;const s=(await window.electronAPI.db.getMessages(this.currentChatId)).find(a=>a.id===e);s&&this.eventBus.emit("saved-messages:save",s)}catch(t){console.error("Failed to save message:",t)}}cleanup(){for(const[,e]of this.components)e.cleanup&&e.cleanup();this.chats.clear(),this.currentChatId=null,this.serverInfo=null,this.typingTimers.clear()}createSimpleFallbackModal(){var s,a;const e=document.getElementById("new-chat-modal");e&&e.remove();const t=document.createElement("div");t.id="new-chat-modal",t.style.cssText=`
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      display: flex; align-items: center; justify-content: center; z-index: 10000;
    `,t.innerHTML=`
      <div style="background:#2d2d2d; padding: 2rem; border-radius: 8px; color: white; max-width: 400px;">
        <h3>🆕 New Chat (Fallback)</h3>
        <div style="margin:1rem 0;">
          <input type="text" id="simple-address" placeholder="IP:Port"
            style="width:100%; padding:0.5rem; margin-bottom:1rem; background:#1a1a1a; border:1px solid #404040; color:white; border-radius:4px;">
          <button id="simple-connect" style="padding:0.5rem 1rem; background:#007acc; color:white; border:none; border-radius:4px; margin-right:0.5rem;">
            Connect
          </button>
          <button id="simple-close" style="padding:0.5rem 1rem; background:#666; color:white; border:none; border-radius:4px;">
            Close
          </button>
        </div>
      </div>
    `,document.body.appendChild(t),(s=t.querySelector("#simple-close"))==null||s.addEventListener("click",()=>t.remove()),(a=t.querySelector("#simple-connect"))==null||a.addEventListener("click",async()=>{const n=t.querySelector("#simple-address"),o=n==null?void 0:n.value.trim();if(o)try{await this.handleModalConnect(o,"Peer"),t.remove()}catch(i){alert(`Connection failed: ${i instanceof Error?i.message:"Unknown error"}`)}else alert("Please enter an address")}),t.addEventListener("click",n=>{n.target===t&&t.remove()})}}window.chatApp=new D;window.chatApp.initialize().catch(h=>{console.error("Failed to initialize ChatApp:",h),document.getElementById("app-status").textContent="❌ Error initializing app"});export{D as ChatApp};
