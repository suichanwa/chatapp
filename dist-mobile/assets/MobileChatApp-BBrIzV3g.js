var f=Object.defineProperty;var y=(d,i,e)=>i in d?f(d,i,{enumerable:!0,configurable:!0,writable:!0,value:e}):d[i]=e;var r=(d,i,e)=>y(d,typeof i!="symbol"?i+"":i,e);import{ChatApp as w}from"./ChatApp-CW7vsicC.js";class M{async initialize(){this.render()}render(){const i=document.querySelector(".app-status-container");i&&(i.innerHTML=`
      <span id="app-status" class="app-status">🔄 Starting...</span>
    `)}updateStatus(i){var g;const e=document.getElementById("app-status");if(!e)return;const t=!!(crypto&&crypto.subtle),s=(g=window.Capacitor)==null?void 0:g.isNative,o="mediaDevices"in navigator&&"getUserMedia"in navigator.mediaDevices,n=i.initSteps||[],c=n.filter(a=>a.status==="error"),h=n.filter(a=>a.status==="pending"),l=n.filter(a=>a.status==="success"),u=l.some(a=>a.step==="UI Setup"),p=l.some(a=>a.step==="Mobile APIs Check"),m=l.some(a=>a.step==="Mobile Crypto"),b=l.some(a=>a.step==="Mobile Network"),v=l.some(a=>a.step==="Mobile Storage");if(console.log("📱 Mobile StatusBar Debug:",{hasWebCrypto:t,hasCapacitor:s,hasCameraAPI:o,errorSteps:c.length,pendingSteps:h.length,successSteps:l.length,hasUISetup:u,hasMobileAPIs:p,hasMobileCrypto:m,hasMobileNetwork:b,hasMobileStorage:v,mobileInitialized:i.mobileInitialized,identityKeys:!!i.identityKeys}),c.length>0)e.textContent="🔴 Mobile app has errors",e.className="app-status error",e.title=`Errors: ${c.map(a=>a.step).join(", ")}`;else if(h.length>0)e.textContent="🔄 Starting mobile app...",e.className="app-status pending",e.title=`Initializing: ${h.map(a=>a.step).join(", ")}`;else if(t&&u&&p&&m&&b&&v&&i.mobileInitialized&&l.length>=5)e.textContent="🟢 Mobile app is safe",e.className="app-status safe",e.title="All mobile systems operational";else{const a=[];t||a.push("No Web Crypto"),u||a.push("UI not ready"),p||a.push("APIs not checked"),m||a.push("Crypto not ready"),b||a.push("Network not ready"),v||a.push("Storage not ready"),i.mobileInitialized||a.push("Mobile not initialized"),e.textContent="🟡 Mobile app initializing...",e.className="app-status warning",e.title=`Working on: ${a.join(", ")}`}}cleanup(){}}class C{setup(){console.log("📱 MobileTouch: Setup complete"),this.setupTouchGestures(),this.setupSwipeHandlers(),this.preventDefaultBehaviors()}setupTouchGestures(){document.addEventListener("touchstart",this.handleTouchStart.bind(this),{passive:!0}),document.addEventListener("touchend",this.handleTouchEnd.bind(this),{passive:!0}),document.addEventListener("touchmove",this.handleTouchMove.bind(this),{passive:!1})}setupSwipeHandlers(){let i=0,e=0;document.addEventListener("touchstart",t=>{i=t.touches[0].clientX,e=t.touches[0].clientY},{passive:!0}),document.addEventListener("touchend",t=>{const s=t.changedTouches[0].clientX,o=t.changedTouches[0].clientY,n=i-s,c=e-o;Math.abs(n)>Math.abs(c)&&Math.abs(n)>50&&(n>0?this.onSwipeLeft():this.onSwipeRight())},{passive:!0})}preventDefaultBehaviors(){document.addEventListener("touchmove",e=>{document.body.scrollTop===0&&e.preventDefault()},{passive:!1});let i=0;document.addEventListener("touchend",e=>{const t=new Date().getTime();t-i<=300&&e.preventDefault(),i=t},!1)}handleTouchStart(i){const e=i.target;(e.classList.contains("chat-item")||e.classList.contains("button"))&&e.classList.add("touch-active")}handleTouchEnd(i){const e=i.target;e.classList.contains("touch-active")&&setTimeout(()=>{e.classList.remove("touch-active")},150)}handleTouchMove(i){const e=i.target;e.classList.contains("touch-active")&&e.classList.remove("touch-active")}onSwipeLeft(){console.log("📱 Swipe left detected")}onSwipeRight(){console.log("📱 Swipe right detected")}}class L{constructor(){r(this,"touch",new C)}async initialize(){this.touch.setup()}cleanup(){}}class S{constructor(){r(this,"handlers",[])}async initialize(){const i=()=>{};window.addEventListener("resize",i),this.handlers.push({target:window,type:"resize",fn:i})}cleanup(){for(const i of this.handlers)i.target.removeEventListener(i.type,i.fn);this.handlers=[]}}class T extends w{constructor(){super();r(this,"mobileStatusBar");r(this,"touchHandler");r(this,"keyboardHandler");r(this,"isKeyboardVisible",!1);r(this,"currentOrientation","portrait");r(this,"chatListVisible",!0);r(this,"lastTapTime",0);console.log("📱 MobileChatApp: Initializing mobile components..."),this.mobileStatusBar=new M(this),this.touchHandler=new L(this),this.keyboardHandler=new S(this),this.components.set("mobileStatusBar",this.mobileStatusBar),this.components.set("touchHandler",this.touchHandler),this.components.set("keyboardHandler",this.keyboardHandler)}async initialize(){console.log("📱 MobileChatApp: Starting mobile initialization..."),this.setupMobileEventListeners(),this.setupMobileViewport(),await super.initialize(),this.applyMobileAdaptations(),this.setupMobileGestures(),console.log("📱 MobileChatApp: Mobile initialization complete")}async setupUI(){document.body.innerHTML=`
      <div id="app" class="mobile-app">
        <!-- Mobile Status Bar -->
        <div id="mobile-status-bar" class="mobile-status-bar">
          <div class="status-left">
            <span id="connection-status" class="connection-status">🔄</span>
            <span id="app-title">Secure Chat</span>
          </div>
          <div class="status-right">
            <button id="mobile-menu-btn" class="mobile-menu-btn">☰</button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <nav id="mobile-nav" class="mobile-nav hidden">
          <div class="nav-item" data-action="new-chat">
            <span class="nav-icon">➕</span>
            <span class="nav-label">New Chat</span>
          </div>
          <div class="nav-item" data-action="settings">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Settings</span>
          </div>
          <div class="nav-item" data-action="debug">
            <span class="nav-icon">🔧</span>
            <span class="nav-label">Debug</span>
          </div>
        </nav>

        <!-- Mobile Main Content -->
        <main class="mobile-main">
          <!-- Chat List Panel -->
          <aside id="chat-list-panel" class="chat-list-panel ${this.chatListVisible?"visible":"hidden"}">
            <div class="chat-list-header">
              <h2>Chats</h2>
              <button id="new-chat-btn" class="new-chat-btn">➕</button>
            </div>
            <div class="search-container">
              <input type="text" id="chat-search" class="chat-search" placeholder="Search chats...">
            </div>
            <ul id="chat-list" class="chat-list"></ul>
            
            <!-- Mobile Connection Info -->
            <div class="mobile-connection-info">
              <div class="connection-item">
                <span class="connection-label">Server:</span>
                <span id="mobile-server-status" class="connection-value">Not started</span>
              </div>
              <div class="connection-item">
                <span class="connection-label">Address:</span>
                <span id="mobile-my-address" class="connection-value">Unknown</span>
              </div>
            </div>
          </aside>
          
          <!-- Chat View Panel -->
          <section id="chat-view-panel" class="chat-view-panel ${this.currentChatId?"visible":"hidden"}">
            <!-- Mobile Chat Header -->
            <header class="mobile-chat-header">
              <button id="back-to-chats" class="back-btn">‹</button>
              <div class="chat-info">
                <h3 id="chat-title">Select a chat</h3>
                <div id="chat-status" class="chat-status"></div>
              </div>
              <div class="chat-actions">
                <button id="chat-menu-btn" class="chat-menu-btn">⋮</button>
              </div>
            </header>

            <!-- Messages Container -->
            <div id="messages" class="mobile-messages">
              <div class="welcome-message">
                <h3>🔒 Welcome to Secure Chat Mobile</h3>
                <p>Your messages are end-to-end encrypted using RSA + AES encryption.</p>
                <p>Tap "➕" to connect to a peer or start your first conversation.</p>
                <p>💾 Long press messages to save them!</p>
              </div>
            </div>

            <!-- Mobile Message Composer -->
            <div id="message-composer" class="mobile-message-composer">
              <div class="composer-controls">
                <button id="image-btn" class="composer-btn" disabled title="Send Image">📷</button>
                <button id="voice-btn" class="composer-btn" disabled title="Voice Message">🎤</button>
              </div>
              <div class="composer-input-container">
                <input type="text" 
                       id="message-input" 
                       class="mobile-message-input" 
                       placeholder="Type a secure message..." 
                       disabled
                       autocomplete="off"
                       autocorrect="off"
                       autocapitalize="sentences">
                <button id="send-btn" class="mobile-send-btn" disabled>➤</button>
              </div>
              <input type="file" id="image-input" accept="image/*" style="display: none;">
            </div>
          </section>
        </main>

        <!-- Mobile Overlay for modals -->
        <div id="mobile-overlay" class="mobile-overlay hidden"></div>
      </div>
    `,this.setupMobileEventListeners()}setupMobileEventListeners(){document.addEventListener("click",t=>{var o;const s=t.target;if(s.id==="mobile-menu-btn")this.toggleMobileMenu();else if(s.id==="back-to-chats")this.showChatList();else if(s.closest(".nav-item")){const n=(o=s.closest(".nav-item"))==null?void 0:o.getAttribute("data-action");this.handleNavAction(n)}});const e=document.getElementById("chat-search");e==null||e.addEventListener("input",t=>{const s=t.target.value.toLowerCase();this.filterChats(s)}),window.addEventListener("orientationchange",()=>{setTimeout(()=>this.handleOrientationChange(),100)}),window.addEventListener("resize",()=>{this.handleKeyboardVisibility()}),this.setupSwipeGestures(),document.addEventListener("touchend",t=>{if(t.touches.length>1)return;const s=Date.now(),o=s-this.lastTapTime;o<300&&o>0&&t.preventDefault(),this.lastTapTime=s})}setupMobileViewport(){const e=document.querySelector('meta[name="viewport"]');e&&(e.content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"),document.documentElement.style.setProperty("--safe-area-inset-top","env(safe-area-inset-top)"),document.documentElement.style.setProperty("--safe-area-inset-bottom","env(safe-area-inset-bottom)"),document.documentElement.style.setProperty("--safe-area-inset-left","env(safe-area-inset-left)"),document.documentElement.style.setProperty("--safe-area-inset-right","env(safe-area-inset-right)"),this.updateOrientation()}applyMobileAdaptations(){document.body.classList.add("mobile-device");const e=document.createElement("style");e.textContent=this.getMobileCSSOverrides(),document.head.appendChild(e),document.addEventListener("contextmenu",t=>{t.preventDefault()}),this.isIOS()&&document.body.classList.add("ios-device"),this.isAndroid()&&document.body.classList.add("android-device")}setupMobileGestures(){let e=0,t=0,s=0,o=0;document.getElementById("chat-list-panel"),document.getElementById("chat-view-panel"),document.addEventListener("touchstart",n=>{e=n.touches[0].clientX,t=n.touches[0].clientY},{passive:!0}),document.addEventListener("touchmove",n=>{s=n.touches[0].clientX,o=n.touches[0].clientY},{passive:!0}),document.addEventListener("touchend",()=>{const n=e-s,c=t-o;Math.abs(n)>Math.abs(c)&&Math.abs(n)>50&&(n>0?this.currentChatId&&this.showChatView():this.showChatList())})}setupSwipeGestures(){let e=0,t=0,s=0;document.addEventListener("touchstart",o=>{e=o.touches[0].clientX,t=o.touches[0].clientY,s=Date.now()},{passive:!0}),document.addEventListener("touchend",o=>{const n=o.changedTouches[0].clientX,c=o.changedTouches[0].clientY,h=Date.now(),l=n-e,u=c-t,p=h-s;Math.abs(l)>Math.abs(u)&&Math.abs(l)>50&&p<500&&(l>0?this.showChatList():this.currentChatId&&this.showChatView())})}toggleMobileMenu(){const e=document.getElementById("mobile-nav"),t=document.getElementById("mobile-overlay");e&&t&&(e.classList.toggle("hidden"),t.classList.toggle("hidden"),e.classList.contains("hidden")||t.addEventListener("click",()=>{e.classList.add("hidden"),t.classList.add("hidden")},{once:!0}))}handleNavAction(e){const t=document.getElementById("mobile-nav"),s=document.getElementById("mobile-overlay");switch(t==null||t.classList.add("hidden"),s==null||s.classList.add("hidden"),e){case"new-chat":this.showNewChatModal();break;case"settings":this.showMobileSettings();break;case"debug":this.toggleMobileDebug();break}}showChatList(){this.chatListVisible=!0;const e=document.getElementById("chat-list-panel"),t=document.getElementById("chat-view-panel");e==null||e.classList.add("visible"),e==null||e.classList.remove("hidden"),window.innerWidth<=768&&(t==null||t.classList.add("hidden"),t==null||t.classList.remove("visible"))}showChatView(){if(!this.currentChatId)return;const e=document.getElementById("chat-list-panel"),t=document.getElementById("chat-view-panel");t==null||t.classList.add("visible"),t==null||t.classList.remove("hidden"),window.innerWidth<=768&&(this.chatListVisible=!1,e==null||e.classList.add("hidden"),e==null||e.classList.remove("visible"))}filterChats(e){document.querySelectorAll(".chat-item").forEach(s=>{var c,h,l,u;const o=((h=(c=s.querySelector(".chat-name"))==null?void 0:c.textContent)==null?void 0:h.toLowerCase())||"",n=((u=(l=s.querySelector(".chat-preview"))==null?void 0:l.textContent)==null?void 0:u.toLowerCase())||"";o.includes(e)||n.includes(e)||e===""?s.style.display="":s.style.display="none"})}handleOrientationChange(){this.updateOrientation(),this.adjustUIForOrientation()}updateOrientation(){window.innerHeight>window.innerWidth?(this.currentOrientation="portrait",document.body.classList.add("portrait"),document.body.classList.remove("landscape")):(this.currentOrientation="landscape",document.body.classList.add("landscape"),document.body.classList.remove("portrait"))}adjustUIForOrientation(){if(this.currentOrientation==="landscape"){const e=document.getElementById("chat-list-panel"),t=document.getElementById("chat-view-panel");window.innerWidth>=768&&(e==null||e.classList.add("visible"),e==null||e.classList.remove("hidden"),t==null||t.classList.add("visible"),t==null||t.classList.remove("hidden"))}}handleKeyboardVisibility(){var s;const t=(((s=window.visualViewport)==null?void 0:s.height)||window.innerHeight)<screen.height*.75;t!==this.isKeyboardVisible&&(this.isKeyboardVisible=t,t?(document.body.classList.add("keyboard-visible"),this.scrollToBottomOfMessages()):document.body.classList.remove("keyboard-visible"))}scrollToBottomOfMessages(){setTimeout(()=>{const e=document.getElementById("messages");e&&(e.scrollTop=e.scrollHeight)},100)}async selectChat(e){await super.selectChat(e),this.showChatView(),this.updateMobileChatHeader()}updateMobileChatHeader(){const e=document.getElementById("chat-title"),t=document.getElementById("chat-status");if(!this.currentChatId){e&&(e.textContent="Select a chat"),t&&(t.textContent="");return}const s=this.chats.get(this.currentChatId);s&&(e&&(e.textContent=s.name),t&&(s.type==="saved"?t.textContent="Your saved messages":t.textContent=s.isOnline?`Connected • ${s.peerAddress}`:"Offline"))}refreshChatList(){super.refreshChatList(),this.updateMobileConnectionInfo()}updateMobileConnectionInfo(){const e=document.getElementById("connection-status");if(document.getElementById("mobile-server-status"),document.getElementById("mobile-my-address"),e){const t=Array.from(this.chats.values()).some(s=>s.isOnline);e.textContent=t?"🟢":"🔄"}}showNewChatModal(){console.log("📱 MobileChatApp: Opening mobile new chat modal..."),this.newChatModal?(setTimeout(()=>{const e=document.getElementById("new-chat-modal");e==null||e.classList.add("mobile-modal")},10),this.newChatModal.open()):(console.error("📱 NewChatModal not available"),this.createMobileFallbackModal())}createMobileFallbackModal(){var t;const e=document.createElement("div");e.id="mobile-new-chat-modal",e.className="mobile-modal-overlay",e.innerHTML=`
      <div class="mobile-modal">
        <div class="mobile-modal-header">
          <h3>🆕 New Chat</h3>
          <button class="mobile-modal-close">✕</button>
        </div>
        <div class="mobile-modal-body">
          <div class="mobile-form-group">
            <label>Peer Address (IP:Port)</label>
            <input type="text" id="mobile-peer-address" placeholder="127.0.0.1:8080">
          </div>
          <div class="mobile-form-group">
            <label>Chat Name</label>
            <input type="text" id="mobile-chat-name" placeholder="Chat with friend">
          </div>
          <button id="mobile-connect-btn" class="mobile-primary-btn">Connect</button>
        </div>
      </div>
    `,document.body.appendChild(e),(t=e.querySelector(".mobile-modal-close"))==null||t.addEventListener("click",()=>{e.remove()}),e.addEventListener("click",s=>{s.target===e&&e.remove()})}showMobileSettings(){console.log("📱 MobileChatApp: Mobile settings not implemented yet")}toggleMobileDebug(){const e=this.components.get("debug");e&&"toggle"in e&&e.toggle()}isIOS(){return/iPad|iPhone|iPod/.test(navigator.userAgent)}isAndroid(){return/Android/.test(navigator.userAgent)}getMobileCSSOverrides(){return`
      /* Mobile-specific CSS overrides */
      .mobile-device {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      .mobile-app {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      
      .mobile-status-bar {
        height: 44px;
        padding-top: var(--safe-area-inset-top, 0);
        background: #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: var(--safe-area-inset-left, 16px);
        padding-right: var(--safe-area-inset-right, 16px);
        border-bottom: 1px solid #333;
      }
      
      .mobile-main {
        flex: 1;
        display: flex;
        overflow: hidden;
      }
      
      @media (max-width: 768px) {
        .chat-list-panel {
          width: 100vw;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 10;
        }
        
        .chat-view-panel {
          width: 100vw;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 5;
        }
        
        .hidden {
          transform: translateX(-100%);
        }
        
        .visible {
          transform: translateX(0);
        }
      }
      
      .keyboard-visible .mobile-message-composer {
        padding-bottom: var(--safe-area-inset-bottom, 0);
      }
    `}cleanup(){console.log("📱 MobileChatApp: Starting mobile cleanup..."),window.removeEventListener("orientationchange",this.handleOrientationChange),window.removeEventListener("resize",this.handleKeyboardVisibility),super.cleanup(),console.log("📱 MobileChatApp: Mobile cleanup complete")}}export{T as MobileChatApp};
