var L=Object.defineProperty,A=Object.defineProperties;var x=Object.getOwnPropertyDescriptors;var P=Object.getOwnPropertySymbols;var M=Object.prototype.hasOwnProperty,k=Object.prototype.propertyIsEnumerable;var E=(u,e,t)=>e in u?L(u,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):u[e]=t,y=(u,e)=>{for(var t in e||(e={}))M.call(e,t)&&E(u,t,e[t]);if(P)for(var t of P(e))k.call(e,t)&&E(u,t,e[t]);return u},w=(u,e)=>A(u,x(e));var l=(u,e,t)=>E(u,typeof e!="symbol"?e+"":e,t);var i=(u,e,t)=>new Promise((s,n)=>{var a=d=>{try{c(t.next(d))}catch(p){n(p)}},o=d=>{try{c(t.throw(d))}catch(p){n(p)}},c=d=>d.done?s(d.value):Promise.resolve(d.value).then(a,o);c((t=t.apply(u,e)).next())});class ${constructor(){l(this,"isOpen",!1);l(this,"currentTab","system");l(this,"logs",[]);l(this,"logFilter","all");this.setupEventListeners(),this.loadLogs()}setupEventListeners(){var e,t,s,n,a;(e=window.electronAPI)!=null&&e.debug&&((s=(t=window.electronAPI.debug).onNewLog)==null||s.call(t,o=>{this.logs.unshift(o),this.updateLogsDisplay()}),(a=(n=window.electronAPI.debug).onLogsCleared)==null||a.call(n,()=>{this.logs=[],this.updateLogsDisplay()}))}loadLogs(){return i(this,null,function*(){var e,t;try{(t=(e=window.electronAPI)==null?void 0:e.debug)!=null&&t.getLogs&&(this.logs=yield window.electronAPI.debug.getLogs(),this.updateLogsDisplay())}catch(s){console.error("Failed to load debug logs:",s)}})}initialize(){return i(this,null,function*(){console.log("🔧 DebugPanel: Starting initialization..."),this.injectDebugStyles(),this.createDebugToggle(),this.createDebugOverlay(),console.log("🔧 DebugPanel: Initialization complete")})}createDebugOverlay(){var t,s,n,a,o,c,d,p;const e=`
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
                <span class="api-status-indicator ${typeof window.electronAPI!="undefined"?"available":"unavailable"}">
                  ${typeof window.electronAPI!="undefined"?"✅":"❌"}
                </span>
              </li>
              <li class="api-status-item">
                <span class="api-status-name">Crypto API</span>
                <span class="api-status-indicator ${typeof((t=window.electronAPI)==null?void 0:t.crypto)!="undefined"?"available":"unavailable"}">
                  ${typeof((s=window.electronAPI)==null?void 0:s.crypto)!="undefined"?"✅":"❌"}
                </span>
              </li>
              <li class="api-status-item">
                <span class="api-status-name">Database API</span>
                <span class="api-status-indicator ${typeof((n=window.electronAPI)==null?void 0:n.db)!="undefined"?"available":"unavailable"}">
                  ${typeof((a=window.electronAPI)==null?void 0:a.db)!="undefined"?"✅":"❌"}
                </span>
              </li>
              <li class="api-status-item">
                <span class="api-status-name">Permission API</span>
                <span class="api-status-indicator ${typeof((o=window.electronAPI)==null?void 0:o.permission)!="undefined"?"available":"unavailable"}">
                  ${typeof((c=window.electronAPI)==null?void 0:c.permission)!="undefined"?"✅":"❌"}
                </span>
              </li>
              <li class="api-status-item">
                <span class="api-status-name">Transport API</span>
                <span class="api-status-indicator ${typeof((d=window.electronAPI)==null?void 0:d.transport)!="undefined"?"available":"unavailable"}">
                  ${typeof((p=window.electronAPI)==null?void 0:p.transport)!="undefined"?"✅":"❌"}
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
    `);const t=document.getElementById("debug-toggle");t==null||t.addEventListener("click",()=>this.toggle())}attachEventListeners(){const e=document.getElementById("debug-close");e==null||e.addEventListener("click",()=>this.close()),document.querySelectorAll(".debug-tab").forEach(c=>{c.addEventListener("click",d=>{const h=d.target.dataset.tab;h&&this.switchTab(h)})});const t=document.getElementById("debug-log-filter");t==null||t.addEventListener("change",c=>{this.logFilter=c.target.value,this.updateLogsDisplay()});const s=document.getElementById("debug-component-filter");s==null||s.addEventListener("change",()=>{this.updateComponentFilter(),this.updateLogsDisplay()});const n=document.getElementById("debug-clear-logs");n==null||n.addEventListener("click",()=>this.clearLogs());const a=document.getElementById("debug-refresh-logs");a==null||a.addEventListener("click",()=>this.loadLogs());const o=document.getElementById("debug-overlay");o==null||o.addEventListener("click",c=>{c.target===o&&this.close()}),document.addEventListener("keydown",c=>{c.key==="Escape"&&this.isOpen&&this.close()})}switchTab(e){this.currentTab=e,document.querySelectorAll(".debug-tab").forEach(n=>{n.classList.remove("active")});const t=document.querySelector(`[data-tab="${e}"]`);t==null||t.classList.add("active"),document.querySelectorAll(".debug-panel").forEach(n=>{n.classList.remove("active")});const s=document.getElementById(`debug-${e}`);s==null||s.classList.add("active")}updateComponentFilter(){const e=document.getElementById("debug-component-filter");if(!e)return;const t=[...new Set(this.logs.map(n=>n.component))],s=e.value;e.innerHTML='<option value="all">All Components</option>',t.forEach(n=>{const a=document.createElement("option");a.value=n,a.textContent=n,n===s&&(a.selected=!0),e.appendChild(a)})}updateLogsDisplay(){const e=document.getElementById("debug-logs-container");if(!e)return;const t=document.getElementById("debug-component-filter"),s=(t==null?void 0:t.value)||"all";let n=this.logs;if(this.logFilter!=="all"&&(n=n.filter(a=>a.level===this.logFilter)),s!=="all"&&(n=n.filter(a=>a.component===s)),n.length===0){e.innerHTML='<div class="debug-no-logs">No logs to display</div>';return}e.innerHTML=n.map(a=>`
      <div class="debug-log-entry ${a.level}">
        <div class="debug-log-header">
          <span class="debug-log-time">${new Date(a.timestamp).toLocaleTimeString()}</span>
          <span class="debug-log-level ${a.level}">${a.level.toUpperCase()}</span>
          <span class="debug-log-component">${a.component}</span>
        </div>
        <div class="debug-log-message">${a.message}</div>
        ${a.data?`<div class="debug-log-data">${JSON.stringify(a.data,null,2)}</div>`:""}
      </div>
    `).join(""),this.updateComponentFilter()}clearLogs(){return i(this,null,function*(){var e,t;try{(t=(e=window.electronAPI)==null?void 0:e.debug)!=null&&t.clearLogs&&(yield window.electronAPI.debug.clearLogs()),this.logs=[],this.updateLogsDisplay()}catch(s){console.error("Failed to clear logs:",s)}})}toggle(){this.isOpen?this.close():this.open()}open(){this.isOpen=!0;const e=document.getElementById("debug-overlay"),t=document.getElementById("debug-toggle");e==null||e.classList.add("open"),t==null||t.classList.add("active")}close(){this.isOpen=!1;const e=document.getElementById("debug-overlay"),t=document.getElementById("debug-toggle");e==null||e.classList.remove("open"),t==null||t.classList.remove("active")}cleanup(){const e=document.getElementById("debug-overlay"),t=document.getElementById("debug-toggle");e==null||e.remove(),t==null||t.remove()}injectDebugStyles(){if(document.getElementById("debug-styles"))return;const e=document.createElement("style");e.id="debug-styles",e.textContent=`
      /* Debug Toggle Button */
      .debug-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .debug-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
      }

      .debug-toggle.active {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
        transform: scale(0.95);
      }

      /* Debug Overlay */
      .debug-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10001;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
      }

      .debug-overlay.open {
        display: flex;
      }

      .debug-overlay > div {
        background: #2d2d2d;
        border-radius: 16px;
        width: 90%;
        max-width: 900px;
        height: 80%;
        max-height: 700px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid #404040;
      }

      .debug-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }

      .debug-title {
        font-size: 1.1rem;
        font-weight: 600;
      }

      .debug-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        color: white;
        padding: 0.25rem 0.75rem;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s;
      }

      .debug-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .debug-btn.close {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 1.2rem;
        font-weight: bold;
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

      .debug-logs-container {
        flex: 1;
        overflow-y: auto;
        font-family: monospace;
        font-size: 0.7rem;
      }

      .debug-log-entry {
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        border-left: 3px solid #555;
        background: #1e1e1e;
        border-radius: 0 4px 4px 0;
      }

      .debug-log-entry.info {
        border-left-color: #007acc;
      }

      .debug-log-entry.warn {
        border-left-color: #ff9800;
      }

      .debug-log-entry.error {
        border-left-color: #f44336;
      }

      .debug-log-header {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
        font-size: 0.6rem;
      }

      .debug-log-time {
        color: #888;
      }

      .debug-log-level {
        font-weight: bold;
        text-transform: uppercase;
      }

      .debug-log-level.info {
        color: #007acc;
      }

      .debug-log-level.warn {
        color: #ff9800;
      }

      .debug-log-level.error {
        color: #f44336;
      }

      .debug-log-component {
        color: #4fc3f7;
        font-weight: 500;
      }

      .debug-log-message {
        color: #fff;
        margin-bottom: 0.25rem;
      }

      .debug-log-data {
        background: #0f0f0f;
        padding: 0.5rem;
        border-radius: 4px;
        color: #4fc3f7;
        font-size: 0.65rem;
        overflow-x: auto;
        white-space: pre-wrap;
      }

      .debug-no-logs {
        color: #888;
        text-align: center;
        padding: 2rem;
        font-style: italic;
      }
    `,document.head.appendChild(e)}}const f=class f{constructor(){l(this,"events",new Map)}static getInstance(){return f.instance||(f.instance=new f),f.instance}on(e,t){this.events.has(e)||this.events.set(e,[]),this.events.get(e).push(t)}off(e,t){const s=this.events.get(e);if(s){const n=s.indexOf(t);n>-1&&s.splice(n,1)}}emit(e,...t){const s=this.events.get(e);s&&s.forEach(n=>{try{n(...t)}catch(a){console.error(`Error in event callback for "${e}":`,a)}})}once(e,t){const s=(...n)=>{t(...n),this.off(e,s)};this.on(e,s)}};l(f,"instance");let g=f;class T{constructor(){l(this,"eventBus",g.getInstance());l(this,"initSteps",[])}initialize(){return i(this,null,function*(){this.setupEventListeners(),this.render()})}setupEventListeners(){this.eventBus.on("status:updated",e=>{this.updateStatus(e)})}render(){const e=document.querySelector(".app-status-container");e&&(e.innerHTML=`
      <span id="app-status" class="app-status">🔄 Starting...</span>
    `)}updateStatus(e){const t=this.initSteps.findIndex(s=>s.step===e.step);t!==-1?this.initSteps[t]=e:this.initSteps.push(e),this.updateStatusDisplay()}updateStatusDisplay(){var b,I,C;const e=document.getElementById("app-status");if(!e)return;const t=this.initSteps.filter(r=>r.status==="pending"),s=this.initSteps.filter(r=>r.status==="error"),n=this.initSteps.filter(r=>r.status==="success"),a=typeof window.electronAPI!="undefined",o=typeof((b=window.electronAPI)==null?void 0:b.crypto)!="undefined",c=typeof((I=window.electronAPI)==null?void 0:I.db)!="undefined",d=typeof((C=window.electronAPI)==null?void 0:C.transport)!="undefined",p=this.initSteps.some(r=>r.step==="Crypto Initialization"&&r.status==="success"),h=this.initSteps.some(r=>r.step==="Network Setup"&&r.status==="success"),m=this.initSteps.some(r=>r.step==="UI Setup"&&r.status==="success"),v=this.initSteps.some(r=>r.step==="ElectronAPI Check"&&r.status==="success");if(console.log("🔍 StatusBar Debug:",{pendingSteps:t.length,errorSteps:s.length,successSteps:n.length,hasElectronAPI:a,hasCryptoAPI:o,hasDbAPI:c,hasTransportAPI:d,hasCryptoKeys:p,hasNetworking:h,hasUISetup:m,hasAPICheck:v,allSteps:this.initSteps.map(r=>`${r.step}: ${r.status}`)}),s.length>0)e.textContent="🔴 App is not safe",e.className="app-status error",e.title=`Errors: ${s.map(r=>r.step).join(", ")}`;else if(t.length>0)e.textContent="🔄 Starting...",e.className="app-status pending",e.title=`Initializing: ${t.map(r=>r.step).join(", ")}`;else if(a&&o&&c&&d&&p&&h&&m&&v)e.textContent="🟢 App is safe",e.className="app-status safe",e.title="All systems operational";else{const r=[];a||r.push("No ElectronAPI"),o||r.push("No Crypto API"),c||r.push("No Database API"),d||r.push("No Transport API"),p||r.push("No Crypto Keys"),h||r.push("No Network"),m||r.push("No UI"),v||r.push("No API Check"),e.textContent="🟡 App is not safe",e.className="app-status warning",e.title=`Issues: ${r.join(", ")}`}}cleanup(){this.eventBus.off("status:updated",this.updateStatus.bind(this))}}class D{constructor(){l(this,"eventBus",g.getInstance());l(this,"identityKeys",null)}initialize(){return i(this,null,function*(){this.setupEventListeners(),yield this.initializeCrypto()})}setupEventListeners(){this.eventBus.on("crypto:get-public-key",this.handleGetPublicKey.bind(this))}handleGetPublicKey(){this.identityKeys&&this.eventBus.emit("crypto:identity-ready",this.identityKeys.publicKey)}initializeCrypto(){return i(this,null,function*(){try{if(typeof window.electronAPI=="undefined")throw new Error("ElectronAPI not available - preload script may not be loaded");if(!window.electronAPI.crypto)throw new Error("Crypto API not available");this.eventBus.emit("status:updated",{step:"Crypto Initialization",status:"pending",message:"Generating identity keys...",timestamp:Date.now()});const e=new Promise((s,n)=>setTimeout(()=>n(new Error("Crypto initialization timeout")),1e4)),t=window.electronAPI.crypto.generateIdentity();this.identityKeys=yield Promise.race([t,e]),this.eventBus.emit("status:updated",{step:"Crypto Initialization",status:"success",message:`Generated ${this.identityKeys.publicKey.length} char public key`,timestamp:Date.now()}),this.eventBus.emit("crypto:identity-ready",this.identityKeys.publicKey)}catch(e){throw console.error("Failed to initialize crypto:",e),this.eventBus.emit("status:updated",{step:"Crypto Initialization",status:"error",message:e instanceof Error?e.message:"Unknown error",timestamp:Date.now()}),e}})}getIdentityKeys(){return this.identityKeys}encrypt(e,t){return i(this,null,function*(){var s;if(!((s=window.electronAPI)!=null&&s.crypto))throw new Error("Crypto API not available");return yield window.electronAPI.crypto.encrypt(e,t)})}decrypt(e){return i(this,null,function*(){var t;if(!((t=window.electronAPI)!=null&&t.crypto))throw new Error("Crypto API not available");return yield window.electronAPI.crypto.decrypt(e)})}cleanup(){this.eventBus.off("crypto:get-public-key",this.handleGetPublicKey.bind(this))}}class z{constructor(e={autoStart:!0}){l(this,"eventBus",g.getInstance());l(this,"serverInfo",null);l(this,"config");this.config=e}initialize(){return i(this,null,function*(){this.setupTransportListeners(),this.setupEventListeners(),this.config.autoStart&&(yield this.startServer(this.config.port))})}setupEventListeners(){this.eventBus.on("network:connect-request",s=>i(this,[s],function*({address:e,port:t}){try{yield this.connectToPeer(e,t)}catch(n){console.error("Failed to connect to peer:",n),this.eventBus.emit("status:updated",{step:"Peer Connection",status:"error",message:n instanceof Error?n.message:"Failed to connect to peer",timestamp:Date.now()})}})),this.eventBus.on("network:start-server-request",()=>i(this,null,function*(){try{yield this.startServer()}catch(e){console.error("Failed to start server:",e),this.eventBus.emit("status:updated",{step:"Server Start",status:"error",message:e instanceof Error?e.message:"Failed to start server",timestamp:Date.now()})}})),this.eventBus.on("network:get-server-info",()=>{this.serverInfo&&this.eventBus.emit("network:server-started",this.serverInfo)})}setupTransportListeners(){var e;(e=window.electronAPI)!=null&&e.transport&&(window.electronAPI.transport.onPeerConnected((t,s)=>{console.log("🔗 Peer connected:",t,s),this.eventBus.emit("peer:connected",t,s)}),window.electronAPI.transport.onPeerDisconnected(t=>{console.log("🔗 Peer disconnected:",t),this.eventBus.emit("peer:disconnected",t)}),window.electronAPI.transport.onMessage((t,s)=>{console.log("📨 Message received:",t,s),this.eventBus.emit("message:received",{chatId:t,data:s})}))}startServer(e){return i(this,null,function*(){try{this.eventBus.emit("status:updated",{step:"Network Setup",status:"pending",message:"Starting server...",timestamp:Date.now()}),this.serverInfo=yield window.electronAPI.transport.startServer(e),this.eventBus.emit("status:updated",{step:"Network Setup",status:"success",message:`Server listening on ${this.serverInfo.address}:${this.serverInfo.port}`,timestamp:Date.now()}),this.eventBus.emit("network:server-started",this.serverInfo)}catch(t){throw this.eventBus.emit("status:updated",{step:"Network Setup",status:"error",message:t instanceof Error?t.message:"Failed to start server",timestamp:Date.now()}),t}})}connectToPeer(e,t){return i(this,null,function*(){var s;if(!((s=window.electronAPI)!=null&&s.transport))throw new Error("Transport API not available");try{console.log(`Connecting to ${e}:${t}...`);const n=yield window.electronAPI.transport.connect(e,t);return n&&console.log("Successfully connected to peer"),n}catch(n){throw console.error("Connection error:",n),n}})}sendMessage(e,t){return i(this,null,function*(){var s;if(!((s=window.electronAPI)!=null&&s.transport))throw new Error("Transport API not available");try{if(!(yield window.electronAPI.transport.send(e,y({content:t.content,timestamp:Date.now()},t))))throw new Error("Failed to send message - transport returned false")}catch(n){throw console.error("Failed to send message via transport:",n),n}})}getServerInfo(){return this.serverInfo}cleanup(){this.eventBus.off("network:connect-request",this.handleConnectRequest.bind(this)),this.eventBus.off("network:start-server-request",this.handleStartServerRequest.bind(this)),this.eventBus.off("network:get-server-info",this.handleGetServerInfo.bind(this))}handleConnectRequest(s){return i(this,arguments,function*({address:e,port:t}){try{yield this.connectToPeer(e,t)}catch(n){console.error("Failed to connect to peer:",n),this.eventBus.emit("status:updated",{step:"Peer Connection",status:"error",message:n instanceof Error?n.message:"Failed to connect to peer",timestamp:Date.now()})}})}handleStartServerRequest(){return i(this,null,function*(){try{yield this.startServer()}catch(e){console.error("Failed to start server:",e),this.eventBus.emit("status:updated",{step:"Server Start",status:"error",message:e instanceof Error?e.message:"Failed to start server",timestamp:Date.now()})}})}handleGetServerInfo(){this.serverInfo&&this.eventBus.emit("network:server-started",this.serverInfo)}}class F{constructor(){l(this,"canvas");l(this,"ctx");this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("2d")}initialize(){return i(this,null,function*(){console.log("🖼️ ImageProcessor: Initialized")})}processImageFile(e){return i(this,null,function*(){return new Promise((t,s)=>{if(!e.type.startsWith("image/")){s(new Error("Selected file is not an image"));return}const n=new FileReader;n.onload=a=>i(this,null,function*(){var o;try{const c=(o=a.target)==null?void 0:o.result,d=new Image;d.onload=()=>i(this,null,function*(){try{const{width:m,height:v}=this.calculateDimensions(d.width,d.height,800,600);this.canvas.width=m,this.canvas.height=v,this.ctx.drawImage(d,0,0,m,v);const b=this.canvas.toDataURL("image/jpeg",.8),r=this.calculateDimensions(d.width,d.height,150,100);this.canvas.width=r.width,this.canvas.height=r.height,this.ctx.drawImage(d,0,0,r.width,r.height);const S=this.canvas.toDataURL("image/jpeg",.6),B={filename:e.name,mimeType:e.type,size:this.calculateBase64Size(b),width:m,height:v,data:b,thumbnail:S};t(B)}catch(p){s(p)}}),d.onerror=()=>s(new Error("Failed to load image")),d.src=c}catch(c){s(c)}}),n.onerror=()=>s(new Error("Failed to read file")),n.readAsDataURL(e)})})}calculateDimensions(e,t,s,n){let{width:a,height:o}={width:e,height:t};return a>s&&(o=o*s/a,a=s),o>n&&(a=a*n/o,o=n),{width:Math.round(a),height:Math.round(o)}}calculateBase64Size(e){const t=e.split(",")[1];return Math.round(t.length*3/4)}createImagePreview(e){return i(this,null,function*(){const t=document.createElement("div");t.className="image-preview";const s=document.createElement("img");s.src=e.thumbnail||e.data,s.alt=e.filename,s.className="preview-image";const n=document.createElement("div");return n.className="image-info",n.innerHTML=`
      <div class="filename">${e.filename}</div>
      <div class="details">${this.formatFileSize(e.size)} • ${e.width}×${e.height}</div>
    `,t.appendChild(s),t.appendChild(n),t})}formatFileSize(e){if(e===0)return"0 B";const t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,n)).toFixed(1))} ${s[n]}`}cleanup(){this.canvas.width=0,this.canvas.height=0}}class N{constructor(){l(this,"eventBus",g.getInstance());l(this,"imageProcessor");this.imageProcessor=new F}initialize(){return i(this,null,function*(){yield this.imageProcessor.initialize(),this.setupEventListeners()})}setupEventListeners(){this.eventBus.on("message:received",e=>{this.handleIncomingMessage(e.chatId,e.data)})}handleIncomingMessage(e,t){console.log("📨 Handling incoming message:",{chatId:e,data:t});const s={chatId:e,content:String(t.content||t.message||"Empty message"),sender:"peer",encrypted:!!t.encrypted,timestamp:Number(t.timestamp)||Date.now(),type:String(t.type||"text"),imageData:t.imageData};this.eventBus.emit("message:processed",s)}sendTextMessage(e,t){return i(this,null,function*(){try{const s={chatId:e,content:t,sender:"me",encrypted:!1,type:"text"},n=yield window.electronAPI.db.saveMessage(s);this.eventBus.emit("message:sent",n),this.eventBus.emit("network:send",e,{content:t,timestamp:n.timestamp,type:"text"})}catch(s){throw console.error("Failed to send text message:",s),s}})}sendImageMessage(e,t){return i(this,null,function*(){try{const s=yield this.imageProcessor.processImageFile(t),n={chatId:e,content:`📷 ${s.filename}`,sender:"me",encrypted:!1,type:"image",imageData:s},a=yield window.electronAPI.db.saveMessage(n);this.eventBus.emit("message:sent",a),this.eventBus.emit("network:send",e,{content:`📷 ${s.filename}`,timestamp:a.timestamp,type:"image",imageData:w(y({},s),{data:s.thumbnail})})}catch(s){throw console.error("Failed to send image message:",s),s}})}sendMessage(e,t){return i(this,null,function*(){return this.sendTextMessage(e,t)})}getMessages(e){return i(this,null,function*(){try{return yield window.electronAPI.db.getMessages(e)}catch(t){return console.error("Failed to get messages:",t),[]}})}forwardMessage(e,t){return i(this,null,function*(){try{this.eventBus.emit("message:forward-request",{messageId:e,targetChatId:t})}catch(s){throw console.error("Failed to forward message:",s),s}})}cleanup(){this.eventBus.off("message:received",this.handleIncomingMessage.bind(this)),this.imageProcessor.cleanup()}}class H{constructor(){l(this,"eventBus",g.getInstance());l(this,"savedChatId","saved-messages")}initialize(){return i(this,null,function*(){yield this.createSavedMessagesChat(),this.setupEventListeners()})}setupEventListeners(){this.eventBus.on("saved-messages:save",e=>{this.saveMessageToSaved(e)}),this.eventBus.on("saved-messages:show",()=>{this.showSavedMessages()})}createSavedMessagesChat(){return i(this,null,function*(){try{if(!(yield window.electronAPI.db.getChats()).find(s=>s.id===this.savedChatId)){const s={name:"💾 Saved Messages",participants:["me"],type:"saved"};yield window.electronAPI.db.saveChat(w(y({},s),{id:this.savedChatId}));const n={chatId:this.savedChatId,content:`👋 Welcome to Saved Messages!

Forward messages here to keep them handy. You can save:
• Text messages
• Images
• Important notes

Note: Saved messages are cleared when the app is restarted.`,sender:"system",type:"system",encrypted:!1};yield window.electronAPI.db.saveMessage(n),console.log("💾 Created Saved Messages chat")}}catch(e){console.error("Failed to create Saved Messages chat:",e)}})}saveMessageToSaved(e){return i(this,null,function*(){try{const t={chatId:this.savedChatId,content:`📝 Forwarded: ${e.content}`,sender:"me",type:e.type,encrypted:!1,imageData:e.imageData,replyTo:e.id},s=yield window.electronAPI.db.saveMessage(t);this.eventBus.emit("message:sent",s),this.eventBus.emit("chat:updated",this.savedChatId),this.showSaveNotification()}catch(t){console.error("Failed to save message:",t)}})}showSavedMessages(){this.eventBus.emit("chat:selected",this.savedChatId)}showSaveNotification(){const e=document.createElement("div");e.className="save-notification",e.textContent="💾 Saved to Saved Messages",document.body.appendChild(e),setTimeout(()=>{e.classList.add("show")},100),setTimeout(()=>{e.classList.remove("show"),setTimeout(()=>{document.body.removeChild(e)},300)},2e3)}getSavedMessages(){return i(this,null,function*(){try{return yield window.electronAPI.db.getMessages(this.savedChatId)}catch(e){return console.error("Failed to get saved messages:",e),[]}})}cleanup(){this.eventBus.off("saved-messages:save",this.saveMessageToSaved.bind(this)),this.eventBus.off("saved-messages:show",this.showSavedMessages.bind(this))}}class K{constructor(){l(this,"eventBus",g.getInstance());l(this,"isVisible",!1);l(this,"currentTab","connect")}initialize(){return i(this,null,function*(){this.render(),this.setupEventListeners()})}render(){document.getElementById("new-chat-modal")||document.body.insertAdjacentHTML("beforeend",`
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
    `)}setupEventListeners(){const e=document.getElementById("modal-close"),t=document.getElementById("new-chat-modal");e==null||e.addEventListener("click",()=>this.hide()),t==null||t.addEventListener("click",c=>{c.target===t&&this.hide()}),document.querySelectorAll(".tab-btn").forEach(c=>{c.addEventListener("click",d=>{const h=d.target.dataset.tab;h&&this.switchTab(h)})});const s=document.getElementById("connect-btn"),n=document.getElementById("start-server-btn"),a=document.getElementById("copy-address"),o=document.getElementById("copy-key");s==null||s.addEventListener("click",()=>this.connectToPeer()),n==null||n.addEventListener("click",()=>this.startServer()),a==null||a.addEventListener("click",()=>this.copyToClipboard("address")),o==null||o.addEventListener("click",()=>this.copyToClipboard("key")),this.eventBus.on("network:server-started",c=>{this.updateServerInfo(c)}),this.eventBus.on("crypto:identity-ready",c=>{this.updatePublicKey(c)})}show(){const e=document.getElementById("new-chat-modal"),t=document.getElementById("app");e&&(e.classList.add("show"),this.isVisible=!0,t&&(t.classList.add("blurred"),t.classList.add("modal-animate-in"),setTimeout(()=>t.classList.remove("modal-animate-in"),400)),this.updateModalInfo())}hide(){const e=document.getElementById("new-chat-modal"),t=document.getElementById("app");e&&(e.classList.remove("show"),this.isVisible=!1,t&&(t.classList.remove("blurred"),t.classList.add("modal-animate-out"),setTimeout(()=>t.classList.remove("modal-animate-out"),400)))}switchTab(e){this.currentTab=e,document.querySelectorAll(".tab-btn").forEach(n=>{n.classList.remove("active")});const t=document.querySelector(`[data-tab="${e}"]`);t==null||t.classList.add("active"),document.querySelectorAll(".tab-content").forEach(n=>{n.classList.remove("active")});const s=document.getElementById(`${e}-tab`);s==null||s.classList.add("active")}connectToPeer(){return i(this,null,function*(){const e=document.getElementById("peer-address"),t=document.getElementById("chat-name"),s=e.value.trim(),n=t.value.trim();if(!s){alert("Please enter a peer address");return}try{const[a,o]=s.split(":"),c=parseInt(o);if(!a||!c)throw new Error("Invalid address format. Use IP:PORT");console.log(`Connecting to ${a}:${c}...`),this.eventBus.emit("network:connect-request",{address:a,port:c,chatName:n||`Chat with ${a}:${c}`}),e.value="",t.value="",this.hide()}catch(a){console.error("Connection error:",a),alert(`Connection failed: ${a instanceof Error?a.message:"Unknown error"}`)}})}startServer(){return i(this,null,function*(){try{this.eventBus.emit("network:start-server-request")}catch(e){console.error("Failed to start server:",e),alert("Failed to start server")}})}copyToClipboard(e){return i(this,null,function*(){try{let t="";if(e==="address"){const s=document.getElementById("modal-my-address");t=(s==null?void 0:s.textContent)||""}else if(e==="key"){const s=document.getElementById("my-public-key");t=(s==null?void 0:s.value)||""}if(t){yield navigator.clipboard.writeText(t);const s=document.getElementById(e==="address"?"copy-address":"copy-key");if(s){const n=s.textContent;s.textContent="✅",setTimeout(()=>{s.textContent=n},2e3)}}}catch(t){console.error("Failed to copy to clipboard:",t),alert("Failed to copy to clipboard")}})}updateModalInfo(){this.eventBus.emit("network:get-server-info"),this.eventBus.emit("crypto:get-public-key")}updateServerInfo(e){const t=document.getElementById("modal-server-status"),s=document.getElementById("modal-my-address");t&&(t.textContent="Running"),s&&(s.textContent=`${e.address}:${e.port}`)}updatePublicKey(e){const t=document.getElementById("my-public-key");t&&(t.value=e)}isOpen(){return this.isVisible}cleanup(){this.eventBus.off("network:server-started",this.updateServerInfo.bind(this)),this.eventBus.off("crypto:identity-ready",this.updatePublicKey.bind(this));const e=document.getElementById("new-chat-modal");e&&e.remove()}}class q{constructor(){l(this,"eventBus",g.getInstance());l(this,"components",new Map);l(this,"currentChatId",null);l(this,"chats",new Map);this.initializeComponents()}initializeComponents(){this.components.set("debug",new $),this.components.set("status",new T),this.components.set("crypto",new D),this.components.set("network",new z),this.components.set("messages",new N),this.components.set("savedMessages",new H),this.components.set("newChatModal",new K)}initialize(){return i(this,null,function*(){console.log("🔧 ChatApp: Starting initialization..."),yield new Promise(e=>setTimeout(e,100)),this.setupEventListeners(),this.eventBus.emit("status:updated",{step:"UI Setup",status:"pending",message:"Setting up user interface...",timestamp:Date.now()}),yield this.setupUI(),this.eventBus.emit("status:updated",{step:"UI Setup",status:"success",message:"UI components ready",timestamp:Date.now()}),yield this.checkElectronAPI();for(const[e,t]of this.components)try{console.log(`🔧 Initializing ${e}...`),yield t.initialize(),console.log(`✅ ${e} initialized`)}catch(s){console.error(`❌ Failed to initialize ${e}:`,s)}yield this.loadExistingChats(),console.log("🔧 ChatApp: Initialization complete")})}setupEventListeners(){this.eventBus.on("chat:selected",e=>{this.selectChat(e)}),this.eventBus.on("chat:updated",e=>{console.log("Chat updated:",e),this.refreshChatList()}),this.eventBus.on("message:sent",e=>{this.currentChatId===e.chatId&&this.refreshMessages(),this.refreshChatList()}),this.eventBus.on("message:received",e=>{this.currentChatId===e.chatId&&this.refreshMessages(),this.refreshChatList()}),this.eventBus.on("peer:connected",(e,t)=>{this.handlePeerConnected(e,t)}),this.eventBus.on("peer:disconnected",e=>{this.handlePeerDisconnected(e)}),this.eventBus.on("network:send",(e,t)=>{this.components.get("network").sendMessage(e,t)}),this.eventBus.on("message:forward-request",({messageId:e,targetChatId:t})=>{this.handleForwardMessage(e,t)})}checkElectronAPI(){return i(this,null,function*(){try{if(this.eventBus.emit("status:updated",{step:"ElectronAPI Check",status:"pending",message:"Checking API availability...",timestamp:Date.now()}),typeof window.electronAPI=="undefined")throw new Error("window.electronAPI is undefined - preload script not loaded");const e=["crypto","db","permission","debug","transport"],t=[];for(const s of e)window.electronAPI[s]||t.push(s);if(t.length>0)throw new Error(`Missing APIs: ${t.join(", ")}`);this.eventBus.emit("status:updated",{step:"ElectronAPI Check",status:"success",message:"All APIs available",timestamp:Date.now()})}catch(e){this.eventBus.emit("status:updated",{step:"ElectronAPI Check",status:"error",message:e instanceof Error?e.message:"Unknown error",timestamp:Date.now()})}})}setupUI(){return i(this,null,function*(){document.body.innerHTML=`
      <div id="app">
        <header class="app-header">
          <h1>🔒 Secure Chat</h1>
          <div class="app-status-container">
            <!-- Status bar will render here -->
          </div>
        </header>
        
        <main class="app-main">
          <aside class="chat-list">
            <div class="chat-list-header">
              <h2>Chats</h2>
              <button id="new-chat-btn">+ New Chat</button>
            </div>
            <ul id="chat-list"></ul>
            <div class="connection-info" id="connection-info">
              <!-- Network info will render here -->
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
              <input type="file" id="image-input" accept="image/*" style="display: none;">
              <button id="image-btn" class="image-btn" disabled title="Send Image">📷</button>
              <input type="text" id="message-input" placeholder="Type a secure message..." disabled>
              <button id="send-btn" disabled>Send</button>
            </div>
          </section>
        </main>
      </div>
    `,this.setupBasicEventListeners()})}setupBasicEventListeners(){const e=document.getElementById("send-btn"),t=document.getElementById("message-input"),s=document.getElementById("new-chat-btn"),n=document.getElementById("image-btn"),a=document.getElementById("image-input");e==null||e.addEventListener("click",()=>this.sendMessage()),t==null||t.addEventListener("keypress",o=>{o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),this.sendMessage())}),s==null||s.addEventListener("click",()=>this.showNewChatModal()),n==null||n.addEventListener("click",()=>this.showImagePicker()),a==null||a.addEventListener("change",o=>this.handleImageSelection(o))}showImagePicker(){const e=document.getElementById("image-input");e==null||e.click()}handleImageSelection(e){return i(this,null,function*(){var n;const t=e.target,s=(n=t.files)==null?void 0:n[0];if(!(!s||!this.currentChatId))try{yield this.components.get("messages").sendImageMessage(this.currentChatId,s),t.value=""}catch(a){console.error("Failed to send image:",a),alert(`Failed to send image: ${a instanceof Error?a.message:"Unknown error"}`)}})}showNewChatModal(){this.components.get("newChatModal").show()}loadExistingChats(){return i(this,null,function*(){try{const e=yield window.electronAPI.db.getChats();this.chats.clear();for(const t of e)this.chats.set(t.id,t);this.refreshChatList(),this.eventBus.emit("status:updated",{step:"Chat Loading",status:"success",message:`Loaded ${e.length} chats`,timestamp:Date.now()})}catch(e){this.eventBus.emit("status:updated",{step:"Chat Loading",status:"error",message:e instanceof Error?e.message:"Failed to load chats",timestamp:Date.now()})}})}refreshChatList(){const e=document.getElementById("chat-list");if(!e)return;if(this.chats.size===0){e.innerHTML='<li class="no-chats">No chats yet. Create one!</li>';return}const t=Array.from(this.chats.values()).sort((s,n)=>{var c,d;if(s.type==="saved")return-1;if(n.type==="saved")return 1;const a=((c=s.lastMessage)==null?void 0:c.timestamp)||0;return(((d=n.lastMessage)==null?void 0:d.timestamp)||0)-a});e.innerHTML=t.map(s=>{const n=s.type==="saved"||s.isOnline,a=s.type==="saved"?"💾":n?"🟢":"🔴";return`
        <li class="chat-item ${this.currentChatId===s.id?"active":""}" 
            data-chat-id="${s.id}">
          <div class="chat-avatar">${a}</div>
          <div class="chat-info">
            <div class="chat-name">${s.name}</div>
            <div class="chat-preview">
              ${s.lastMessage?this.formatMessagePreview(s.lastMessage):"No messages yet"}
            </div>
          </div>
          <div class="chat-meta">
            <div class="chat-time">
              ${s.lastMessage?new Date(s.lastMessage.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):""}
            </div>
          </div>
        </li>
      `}).join(""),e.querySelectorAll(".chat-item").forEach(s=>{s.addEventListener("click",()=>{const n=s.dataset.chatId;n&&this.eventBus.emit("chat:selected",n)})})}formatMessagePreview(e){return e.type==="image"?"📷 Photo":e.type==="system"?"📢 System message":e.content.substring(0,50)+(e.content.length>50?"...":"")}selectChat(e){return i(this,null,function*(){this.currentChatId=e,this.refreshChatList(),this.updateChatHeader(),yield this.refreshMessages();const t=document.getElementById("message-input"),s=document.getElementById("send-btn"),n=document.getElementById("image-btn");t&&(t.disabled=!1),s&&(s.disabled=!1),n&&(n.disabled=!1)})}updateChatHeader(){const e=document.getElementById("chat-title"),t=document.getElementById("chat-status");if(!this.currentChatId){e&&(e.textContent="Select a chat"),t&&(t.textContent="");return}const s=this.chats.get(this.currentChatId);s&&(e&&(e.textContent=s.name),t&&(s.type==="saved"?t.textContent="Your saved messages":t.textContent=s.isOnline?`Connected to ${s.peerAddress}`:"Offline"))}refreshMessages(){return i(this,null,function*(){if(!this.currentChatId)return;const t=yield this.components.get("messages").getMessages(this.currentChatId),s=document.getElementById("messages");if(s){if(t.length===0){s.innerHTML='<div class="no-messages">No messages yet. Start the conversation!</div>';return}s.innerHTML=t.map(n=>this.renderMessage(n)).join(""),s.scrollTop=s.scrollHeight}})}renderMessage(e){const t=e.sender==="me",s=e.type==="system",n=new Date(e.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});if(s)return`
        <div class="message system">
          <div class="message-content">${e.content}</div>
          <div class="message-time">${n}</div>
        </div>
      `;let a="";e.type==="image"&&e.imageData?a=`
        <div class="image-message">
          <img src="${e.imageData.data}" 
               alt="${e.imageData.filename}"
               class="message-image"
               onclick="this.classList.toggle('expanded')">
          <div class="image-caption">${e.content}</div>
        </div>
      `:a=`<div class="message-content">${this.formatMessageContent(e.content)}</div>`;const o=!t&&this.currentChatId!=="saved-messages"?`<button class="save-message-btn" onclick="window.chatApp.saveMessage('${e.id}')" title="Save Message">💾</button>`:"";return`
      <div class="message ${t?"sent":"received"}" data-message-id="${e.id}">
        ${a}
        <div class="message-footer">
          <div class="message-time">${n}</div>
          ${o}
        </div>
      </div>
    `}formatMessageContent(e){return e.replace(/\n/g,"<br>").replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank">$1</a>')}sendMessage(){return i(this,null,function*(){const e=document.getElementById("message-input"),t=e.value.trim();if(!(!t||!this.currentChatId))try{yield this.components.get("messages").sendMessage(this.currentChatId,t),e.value=""}catch(s){console.error("Failed to send message:",s),alert("Failed to send message")}})}saveMessage(e){return i(this,null,function*(){try{if(!this.currentChatId)return;const s=(yield window.electronAPI.db.getMessages(this.currentChatId)).find(n=>n.id===e);s&&this.eventBus.emit("saved-messages:save",s)}catch(t){console.error("Failed to save message:",t)}})}handleForwardMessage(e,t){return i(this,null,function*(){console.log(`Forwarding message ${e} to chat ${t}`)})}handlePeerConnected(e,t){return i(this,null,function*(){const s={name:`Chat with ${t.name}`,participants:["me",t.id],peerAddress:t.address,peerPublicKey:t.publicKey,type:"direct",isOnline:!0};try{const n=yield window.electronAPI.db.saveChat(s);this.chats.set(n.id,w(y({},n),{id:e})),this.refreshChatList(),this.eventBus.emit("chat:selected",e)}catch(n){console.error("Failed to save new chat:",n)}})}handlePeerDisconnected(e){const t=this.chats.get(e);t&&(t.isOnline=!1,this.refreshChatList(),this.currentChatId===e&&this.updateChatHeader())}cleanup(){for(const[e,t]of this.components)t.cleanup&&(console.log(`🧹 Cleaning up ${e}...`),t.cleanup())}}const U=Object.freeze(Object.defineProperty({__proto__:null,ChatApp:q},Symbol.toStringTag,{value:"Module"}));export{q as C,F as I,H as S,U as a};
