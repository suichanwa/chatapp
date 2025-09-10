var m=Object.defineProperty;var b=(u,e,t)=>e in u?m(u,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):u[e]=t;var l=(u,e,t)=>b(u,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(n){if(n.ep)return;n.ep=!0;const o=t(n);fetch(n.href,o)}})();class f{constructor(){l(this,"isOpen",!1);l(this,"currentTab","system");l(this,"logs",[]);l(this,"logFilter","all");this.setupEventListeners(),this.loadLogs()}setupEventListeners(){var e,t,s,n;window.electronAPI&&((t=(e=window.electronAPI.debug)==null?void 0:e.onNewLog)==null||t.call(e,o=>{this.logs.unshift(o),this.updateLogsDisplay()}),(n=(s=window.electronAPI.debug)==null?void 0:s.onLogsCleared)==null||n.call(s,()=>{this.logs=[],this.updateLogsDisplay()}))}async loadLogs(){var e,t;try{(t=(e=window.electronAPI)==null?void 0:e.debug)!=null&&t.getLogs&&(this.logs=await window.electronAPI.debug.getLogs(),this.updateLogsDisplay())}catch(s){console.error("Failed to load debug logs:",s)}}createDebugOverlay(){var t,s,n,o,a,d;const e=document.createElement("div");e.className="debug-overlay",e.id="debug-overlay",e.innerHTML=`
      <div class="debug-header">
        <h3>🔧 Debug Panel</h3>
        <div class="debug-controls">
          <button class="debug-btn clear" id="debug-clear">Clear Logs</button>
          <button class="debug-btn close" id="debug-close">×</button>
        </div>
      </div>
      
      <div class="debug-content">
        <div class="debug-tabs">
          <button class="debug-tab active" data-tab="system">System</button>
          <button class="debug-tab" data-tab="api">API</button>
          <button class="debug-tab" data-tab="logs">Logs</button>
        </div>
        
        <div class="debug-panel active" id="debug-system">
          <div class="system-info-grid">
            <div class="system-info-label">User Agent:</div>
            <div class="system-info-value">${navigator.userAgent}</div>
            <div class="system-info-label">Platform:</div>
            <div class="system-info-value">${navigator.platform}</div>
            <div class="system-info-label">Language:</div>
            <div class="system-info-value">${navigator.language}</div>
            <div class="system-info-label">Online:</div>
            <div class="system-info-value">${navigator.onLine?"Yes":"No"}</div>
            <div class="system-info-label">Screen:</div>
            <div class="system-info-value">${screen.width}x${screen.height}</div>
            <div class="system-info-label">Viewport:</div>
            <div class="system-info-value">${window.innerWidth}x${window.innerHeight}</div>
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
              <span class="api-status-indicator ${typeof((n=window.electronAPI)==null?void 0:n.db)<"u"?"available":"unavailable"}">
                ${typeof((o=window.electronAPI)==null?void 0:o.db)<"u"?"✅":"❌"}
              </span>
            </li>
            <li class="api-status-item">
              <span class="api-status-name">Permission API</span>
              <span class="api-status-indicator ${typeof((a=window.electronAPI)==null?void 0:a.permission)<"u"?"available":"unavailable"}">
                ${typeof((d=window.electronAPI)==null?void 0:d.permission)<"u"?"✅":"❌"}
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
          </div>
          <div class="debug-logs" id="debug-logs-container">
            <!-- Logs will be populated here -->
          </div>
        </div>
      </div>
    `,document.body.appendChild(e),this.attachEventListeners(),this.updateComponentFilter(),this.updateLogsDisplay()}createDebugToggle(){const e=document.createElement("button");e.className="debug-toggle",e.id="debug-toggle",e.innerHTML="🔧",e.title="Toggle Debug Panel",e.addEventListener("click",()=>this.toggle()),document.body.appendChild(e)}attachEventListeners(){var e,t,s,n;document.querySelectorAll(".debug-tab").forEach(o=>{o.addEventListener("click",a=>{const c=a.target.dataset.tab;c&&this.switchTab(c)})}),(e=document.getElementById("debug-close"))==null||e.addEventListener("click",()=>this.close()),(t=document.getElementById("debug-clear"))==null||t.addEventListener("click",()=>this.clearLogs()),(s=document.getElementById("debug-log-filter"))==null||s.addEventListener("change",o=>{const a=o.target;this.logFilter=a.value,this.updateLogsDisplay()}),(n=document.getElementById("debug-component-filter"))==null||n.addEventListener("change",o=>{const a=o.target;this.logFilter=a.value,this.updateLogsDisplay()})}switchTab(e){var t,s;this.currentTab=e,document.querySelectorAll(".debug-tab").forEach(n=>{n.classList.remove("active")}),(t=document.querySelector(`[data-tab="${e}"]`))==null||t.classList.add("active"),document.querySelectorAll(".debug-panel").forEach(n=>{n.classList.remove("active")}),(s=document.getElementById(`debug-${e}`))==null||s.classList.add("active")}updateComponentFilter(){const e=document.getElementById("debug-component-filter");if(!e)return;const t=new Set(this.logs.map(s=>s.component));e.innerHTML='<option value="all">All Components</option>',t.forEach(s=>{const n=document.createElement("option");n.value=s,n.textContent=s,e.appendChild(n)})}updateLogsDisplay(){const e=document.getElementById("debug-logs-container");if(!e)return;let t=this.logs;this.logFilter!=="all"&&(t=t.filter(s=>s.level===this.logFilter)),e.innerHTML=t.map(s=>`
      <div class="debug-log-entry ${s.level}">
        <div class="debug-log-header">
          <span class="debug-log-component">${s.component}</span>
          <span class="debug-log-time">${new Date(s.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="debug-log-message">${s.message}</div>
        ${s.data?`<div class="debug-log-data">${JSON.stringify(s.data,null,2)}</div>`:""}
      </div>
    `).join(""),this.updateComponentFilter()}async clearLogs(){var e,t;try{(t=(e=window.electronAPI)==null?void 0:e.debug)!=null&&t.clearLogs&&await window.electronAPI.debug.clearLogs(),this.logs=[],this.updateLogsDisplay()}catch(s){console.error("Failed to clear logs:",s)}}toggle(){this.isOpen?this.close():this.open()}open(){this.isOpen=!0;const e=document.getElementById("debug-overlay"),t=document.getElementById("debug-toggle");e&&e.classList.add("open"),t&&t.classList.add("active")}close(){this.isOpen=!1;const e=document.getElementById("debug-overlay"),t=document.getElementById("debug-toggle");e&&e.classList.remove("open"),t&&t.classList.remove("active")}initialize(){console.log("🔧 DebugPanel: Starting initialization..."),this.injectDebugStyles(),this.createDebugToggle(),this.createDebugOverlay(),console.log("🔧 DebugPanel: Initialization complete")}injectDebugStyles(){const e=document.createElement("style");e.textContent=`
      /* Debug Menu Styles */
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

      /* Toggle Button - POSITIONED NEXT TO STATUS */
      .debug-toggle {
        position: absolute;
        top: 50%;
        right: -45px;
        transform: translateY(-50%);
        background: rgba(0, 122, 204, 0.8);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1rem;
        z-index: 9999;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .debug-toggle:hover {
        background: rgba(0, 122, 204, 1);
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 122, 204, 0.4);
      }

      .debug-toggle.active {
        background: rgba(220, 53, 69, 0.8);
      }

      .debug-toggle.active:hover {
        background: rgba(220, 53, 69, 1);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
      }

      /* Responsive adjustments */
      @media (max-width: 1200px) {
        .debug-overlay {
          width: 100vw;
        }
        
        .debug-toggle {
          right: 1rem;
          width: 28px;
          height: 28px;
          font-size: 0.9rem;
        }
      }
    `,document.head.appendChild(e)}}class v{constructor(){l(this,"identityKeys",null);l(this,"initSteps",[]);l(this,"debugPanel");l(this,"currentChatId",null);l(this,"chats",new Map);l(this,"serverInfo",null);this.debugPanel=new f}async initialize(){console.log("🔧 ChatApp: Starting initialization..."),await new Promise(e=>setTimeout(e,100)),console.log("🔧 ChatApp: Initializing debug panel..."),this.debugPanel.initialize(),console.log("🔧 ChatApp: Debug panel initialized"),this.addInitStep("UI Setup","pending"),await this.setupUI(),this.addInitStep("UI Setup","success"),this.addInitStep("ElectronAPI Check","pending"),await this.checkElectronAPI(),this.addInitStep("Crypto Initialization","pending"),await this.initializeCrypto(),this.addInitStep("Network Setup","pending"),await this.setupNetworking(),this.addInitStep("Chat Loading","pending"),await this.loadExistingChats(),console.log("🔧 ChatApp: Initialization complete")}addInitStep(e,t,s){var a;const n={step:e,status:t,message:s,timestamp:Date.now()},o=this.initSteps.findIndex(d=>d.step===e);if(o!==-1?this.initSteps[o]=n:this.initSteps.push(n),(a=window.electronAPI)!=null&&a.debug){const d=t==="error"?"error":"info";window.electronAPI.debug.addLog({level:d,component:"ChatApp",message:`${e}: ${t}`,data:s?{message:s}:void 0})}this.updateInitStatus()}async checkElectronAPI(){try{if(console.log("🔧 Checking ElectronAPI availability..."),typeof window.electronAPI>"u")throw new Error("window.electronAPI is undefined - preload script not loaded");console.log("🔧 ElectronAPI found:",Object.keys(window.electronAPI));const e=["crypto","db","permission","debug","transport"],t=[];for(const s of e)window.electronAPI[s]||t.push(s);if(t.length>0)throw new Error(`Missing APIs: ${t.join(", ")}`);this.addInitStep("ElectronAPI Check","success","All APIs available")}catch(e){console.error("🔧 ElectronAPI check failed:",e),this.addInitStep("ElectronAPI Check","error",e instanceof Error?e.message:"Unknown error")}}async setupUI(){document.body.innerHTML=`
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
              <button id="new-chat-btn">+ New Chat</button>
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
              </div>
            </div>
            <div class="message-composer">
              <input type="text" id="message-input" placeholder="Type a secure message..." disabled>
              <button id="send-btn" disabled>Send</button>
            </div>
          </section>
        </main>
      </div>

      <!-- New Chat Modal -->
      <div id="new-chat-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>🆕 Create New Chat</h3>
            <button class="modal-close" id="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="connection-tabs">
              <button class="tab-btn active" data-tab="connect">Connect to Peer</button>
              <button class="tab-btn" data-tab="info">My Connection Info</button>
            </div>
            
            <div class="tab-content active" id="connect-tab">
              <div class="form-group">
                <label>Peer Address (IP:Port)</label>
                <input type="text" id="peer-address" placeholder="127.0.0.1:8080" />
              </div>
              <div class="form-group">
                <label>Chat Name</label>
                <input type="text" id="chat-name" placeholder="Chat with friend" />
              </div>
              <button id="connect-btn" class="primary-btn">Connect</button>
            </div>
            
            <div class="tab-content" id="info-tab">
              <div class="info-section">
                <h4>📡 Your Connection Info</h4>
                <div class="info-item">
                  <label>Server Status:</label>
                  <span id="modal-server-status">Not started</span>
                </div>
                <div class="info-item">
                  <label>Your Address:</label>
                  <span id="modal-my-address">Unknown</span>
                  <button id="copy-address" class="copy-btn">📋</button>
                </div>
                <div class="info-item">
                  <label>Your Public Key:</label>
                  <textarea id="my-public-key" readonly></textarea>
                  <button id="copy-key" class="copy-btn">📋</button>
                </div>
              </div>
              <button id="start-server-btn" class="primary-btn">Start Server</button>
            </div>
          </div>
        </div>
      </div>
    `,this.setupEventListeners();const e=document.getElementById("debug-toggle");console.log("🔧 Debug toggle found:",e?"YES":"NO"),e||(console.error("🔧 Debug toggle not found! Re-initializing debug panel..."),setTimeout(()=>{this.debugPanel.initialize()},1e3))}setupEventListeners(){var p;const e=document.getElementById("send-btn"),t=document.getElementById("message-input"),s=document.getElementById("new-chat-btn");e==null||e.addEventListener("click",()=>this.sendMessage()),t==null||t.addEventListener("keypress",r=>{r.key==="Enter"&&this.sendMessage()}),s==null||s.addEventListener("click",()=>this.showNewChatModal());const n=document.getElementById("modal-close"),o=document.getElementById("new-chat-modal");n==null||n.addEventListener("click",()=>this.hideNewChatModal()),o==null||o.addEventListener("click",r=>{r.target===o&&this.hideNewChatModal()}),document.querySelectorAll(".tab-btn").forEach(r=>{r.addEventListener("click",i=>{const h=i.target.dataset.tab;h&&this.switchTab(h)})});const a=document.getElementById("connect-btn"),d=document.getElementById("start-server-btn"),c=document.getElementById("copy-address"),g=document.getElementById("copy-key");a==null||a.addEventListener("click",()=>this.connectToPeer()),d==null||d.addEventListener("click",()=>this.startServer()),c==null||c.addEventListener("click",()=>this.copyToClipboard("address")),g==null||g.addEventListener("click",()=>this.copyToClipboard("key")),(p=window.electronAPI)!=null&&p.transport&&(window.electronAPI.transport.onPeerConnected((r,i)=>{console.log("🔗 Peer connected:",r,i),this.handlePeerConnected(r,i)}),window.electronAPI.transport.onPeerDisconnected(r=>{console.log("🔗 Peer disconnected:",r),this.handlePeerDisconnected(r)}),window.electronAPI.transport.onMessage((r,i)=>{console.log("📨 Message received:",r,i),this.handleIncomingMessage(r,i)}))}async setupNetworking(){try{this.serverInfo=await window.electronAPI.transport.startServer(),this.addInitStep("Network Setup","success",`Server listening on ${this.serverInfo.address}:${this.serverInfo.port}`),this.updateServerStatus()}catch(e){this.addInitStep("Network Setup","error",e instanceof Error?e.message:"Failed to start server")}}async loadExistingChats(){try{const e=await window.electronAPI.db.getChats();this.chats.clear();for(const t of e)this.chats.set(t.id,t);this.renderChatList(),this.addInitStep("Chat Loading","success",`Loaded ${e.length} chats`)}catch(e){this.addInitStep("Chat Loading","error",e instanceof Error?e.message:"Failed to load chats")}}updateInitStatus(){var p,r;const e=document.getElementById("app-status");if(!e)return;const t=this.initSteps.filter(i=>i.status==="pending"),s=this.initSteps.filter(i=>i.status==="error"),n=this.initSteps.filter(i=>i.status==="success"),o=typeof window.electronAPI<"u",a=typeof((p=window.electronAPI)==null?void 0:p.crypto)<"u",d=typeof((r=window.electronAPI)==null?void 0:r.db)<"u",c=this.identityKeys!==null,g=this.serverInfo!==null;if(s.length>0)e.textContent="🔴 App is not safe",e.className="app-status error";else if(t.length>0)e.textContent="🔄 Starting...",e.className="app-status pending";else if(n.length>=4&&o&&a&&d&&c&&g)e.textContent="🟢 App is safe",e.className="app-status safe";else{const i=[];o||i.push("No ElectronAPI"),a||i.push("No Crypto"),d||i.push("No Database"),c||i.push("No Identity"),g||i.push("No Network"),e.textContent="🟡 App is not safe",e.className="app-status warning",e.title=`Issues: ${i.join(", ")}`}}async initializeCrypto(){try{if(typeof window.electronAPI>"u")throw new Error("ElectronAPI not available - preload script may not be loaded");if(!window.electronAPI.crypto)throw new Error("Crypto API not available");this.addInitStep("Crypto Initialization","pending","Generating identity keys...");const e=new Promise((s,n)=>setTimeout(()=>n(new Error("Crypto initialization timeout")),1e4)),t=window.electronAPI.crypto.generateIdentity();this.identityKeys=await Promise.race([t,e]),this.addInitStep("Crypto Initialization","success",`Generated ${this.identityKeys.publicKey.length} char public key`)}catch(e){console.error("Failed to initialize crypto:",e),this.addInitStep("Crypto Initialization","error",`${e instanceof Error?e.message:"Unknown error"}`)}}showNewChatModal(){const e=document.getElementById("new-chat-modal");e&&(e.classList.add("show"),this.updateModalInfo())}hideNewChatModal(){const e=document.getElementById("new-chat-modal");e&&e.classList.remove("show")}switchTab(e){var t,s;document.querySelectorAll(".tab-btn").forEach(n=>{n.classList.remove("active")}),(t=document.querySelector(`[data-tab="${e}"]`))==null||t.classList.add("active"),document.querySelectorAll(".tab-content").forEach(n=>{n.classList.remove("active")}),(s=document.getElementById(`${e}-tab`))==null||s.classList.add("active")}async updateModalInfo(){const e=document.getElementById("modal-server-status"),t=document.getElementById("modal-my-address"),s=document.getElementById("my-public-key");e&&(e.textContent=this.serverInfo?"Running":"Not started"),t&&this.serverInfo&&(t.textContent=`${this.serverInfo.address}:${this.serverInfo.port}`),s&&this.identityKeys&&(s.value=this.identityKeys.publicKey)}async startServer(){try{this.serverInfo=await window.electronAPI.transport.startServer(),this.updateServerStatus(),this.updateModalInfo()}catch(e){console.error("Failed to start server:",e)}}updateServerStatus(){const e=document.getElementById("server-status"),t=document.getElementById("my-address");e&&(e.textContent=this.serverInfo?"Server: Running":"Server: Not started"),t&&this.serverInfo&&(t.textContent=`Address: ${this.serverInfo.address}:${this.serverInfo.port}`)}async connectToPeer(){const e=document.getElementById("peer-address"),t=document.getElementById("chat-name"),s=e.value.trim();if(t.value.trim(),!s){alert("Please enter a peer address");return}try{const[n,o]=s.split(":"),a=parseInt(o);if(!n||!a)throw new Error("Invalid address format. Use IP:PORT");console.log(`Connecting to ${n}:${a}...`),await window.electronAPI.transport.connect(n,a)?(console.log("Successfully connected to peer"),this.hideNewChatModal(),e.value="",t.value=""):alert("Failed to connect to peer")}catch(n){console.error("Connection error:",n),alert(`Connection failed: ${n instanceof Error?n.message:"Unknown error"}`)}}async handlePeerConnected(e,t){const s={name:`Chat with ${t.name}`,participants:["me",t.id],peerAddress:t.address,peerPublicKey:t.publicKey};try{const n=await window.electronAPI.db.saveChat(s);this.chats.set(n.id,{...n,id:e}),this.renderChatList(),this.selectChat(e)}catch(n){console.error("Failed to save new chat:",n)}}handlePeerDisconnected(e){this.chats.get(e)&&(this.renderChatList(),this.currentChatId===e&&(this.currentChatId=null,this.renderMessages(),this.updateChatHeader()))}async handleIncomingMessage(e,t){try{const s={chatId:e,content:t.content||t.message||String(t),sender:"peer",encrypted:!1};await window.electronAPI.db.saveMessage(s),this.currentChatId===e&&this.renderMessages(),this.renderChatList()}catch(s){console.error("Failed to handle incoming message:",s)}}renderChatList(){const e=document.getElementById("chat-list");if(e){if(this.chats.size===0){e.innerHTML='<li class="no-chats">No chats yet. Create one!</li>';return}e.innerHTML=Array.from(this.chats.values()).map(t=>`
      <li class="chat-item ${this.currentChatId===t.id?"active":""}" 
          data-chat-id="${t.id}">
        <div class="chat-name">${t.name}</div>
        <div class="chat-preview">
          ${t.lastMessage?t.lastMessage.content.substring(0,50)+"...":"No messages yet"}
        </div>
        <div class="chat-time">
          ${t.lastMessage?new Date(t.lastMessage.timestamp).toLocaleTimeString():""}
        </div>
      </li>
    `).join(""),e.querySelectorAll(".chat-item").forEach(t=>{t.addEventListener("click",()=>{const s=t.dataset.chatId;s&&this.selectChat(s)})})}}async selectChat(e){this.currentChatId=e,this.renderChatList(),this.updateChatHeader(),await this.renderMessages();const t=document.getElementById("message-input"),s=document.getElementById("send-btn");t&&(t.disabled=!1),s&&(s.disabled=!1)}updateChatHeader(){const e=document.getElementById("chat-title"),t=document.getElementById("chat-status");if(!this.currentChatId){e&&(e.textContent="Select a chat"),t&&(t.textContent="");return}const s=this.chats.get(this.currentChatId);s&&(e&&(e.textContent=s.name),t&&(t.textContent=`Connected to ${s.peerAddress}`))}async renderMessages(){const e=document.getElementById("messages");if(!e||!this.currentChatId){e&&(e.innerHTML=`
          <div class="welcome-message">
            <h3>🔒 Welcome to Secure Chat</h3>
            <p>Your messages are end-to-end encrypted using RSA + AES encryption.</p>
            <p>Click "New Chat" to connect to a peer or start your first conversation.</p>
          </div>
        `);return}try{const t=await window.electronAPI.db.getMessages(this.currentChatId);if(t.length===0){e.innerHTML='<div class="no-messages">No messages yet. Start the conversation!</div>';return}e.innerHTML=t.map(s=>`
        <div class="message ${s.sender==="me"?"sent":"received"}">
          <div class="message-content">${s.content}</div>
          <div class="message-time">${new Date(s.timestamp).toLocaleTimeString()}</div>
          <div class="message-sender">${s.sender}</div>
        </div>
      `).join(""),e.scrollTop=e.scrollHeight}catch(t){console.error("Failed to render messages:",t)}}async sendMessage(){const e=document.getElementById("message-input"),t=e.value.trim();if(!(!t||!this.currentChatId))try{const s={chatId:this.currentChatId,content:t,sender:"me",encrypted:!1};await window.electronAPI.db.saveMessage(s),await window.electronAPI.transport.send(this.currentChatId,{content:t,timestamp:Date.now()}),e.value="",await this.renderMessages(),this.renderChatList()}catch(s){console.error("Failed to send message:",s),alert("Failed to send message")}}async copyToClipboard(e){try{let t="";e==="address"&&this.serverInfo?t=`${this.serverInfo.address}:${this.serverInfo.port}`:e==="key"&&this.identityKeys&&(t=this.identityKeys.publicKey),await navigator.clipboard.writeText(t);const s=document.getElementById(e==="address"?"copy-address":"copy-key");if(s){const n=s.textContent;s.textContent="✅",setTimeout(()=>{s.textContent=n},1e3)}}catch(t){console.error("Failed to copy to clipboard:",t)}}}console.log("🔒 Secure Chat App starting...");const y=new v;y.initialize();
