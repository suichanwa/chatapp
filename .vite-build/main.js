"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const require$$3$1 = require("electron");
const require$$0$1 = require("path");
const require$$1$1 = require("child_process");
const require$$0 = require("tty");
const require$$1 = require("util");
const require$$3 = require("fs");
const require$$4 = require("net");
const path$1 = require("node:path");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var src = { exports: {} };
var browser = { exports: {} };
var debug$1 = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var y = d * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isNaN(val) === false) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    if (ms2 >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (ms2 >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (ms2 >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (ms2 >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    return plural(ms2, d, "day") || plural(ms2, h, "hour") || plural(ms2, m, "minute") || plural(ms2, s, "second") || ms2 + " ms";
  }
  function plural(ms2, n, name) {
    if (ms2 < n) {
      return;
    }
    if (ms2 < n * 1.5) {
      return Math.floor(ms2 / n) + " " + name;
    }
    return Math.ceil(ms2 / n) + " " + name + "s";
  }
  return ms;
}
var hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug$1.exports;
  hasRequiredDebug = 1;
  (function(module2, exports) {
    exports = module2.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = requireMs();
    exports.names = [];
    exports.skips = [];
    exports.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash = 0, i;
      for (i in namespace) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return exports.colors[Math.abs(hash) % exports.colors.length];
    }
    function createDebug(namespace) {
      function debug2() {
        if (!debug2.enabled) return;
        var self = debug2;
        var curr = +/* @__PURE__ */ new Date();
        var ms2 = curr - (prevTime || curr);
        self.diff = ms2;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          if (match === "%%") return match;
          index++;
          var formatter = exports.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports.formatArgs.call(self, args);
        var logFn = debug2.log || exports.log || console.log.bind(console);
        logFn.apply(self, args);
      }
      debug2.namespace = namespace;
      debug2.enabled = exports.enabled(namespace);
      debug2.useColors = exports.useColors();
      debug2.color = selectColor(namespace);
      if ("function" === typeof exports.init) {
        exports.init(debug2);
      }
      return debug2;
    }
    function enable(namespaces) {
      exports.save(namespaces);
      exports.names = [];
      exports.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i]) continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports.enable("");
    }
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
  })(debug$1, debug$1.exports);
  return debug$1.exports;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module2, exports) {
    exports = module2.exports = requireDebug();
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports.humanize(this.diff);
      if (!useColors2) return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ("%%" === match) return;
        index++;
        if ("%c" === match) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports.storage.removeItem("debug");
        } else {
          exports.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load() {
      var r;
      try {
        r = exports.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module2, exports) {
    var tty = require$$0;
    var util = require$$1;
    exports = module2.exports = requireDebug();
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.colors = [6, 2, 3, 4, 5, 1];
    exports.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
      else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
      else if (val === "null") val = null;
      else val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
    }
    exports.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = (/* @__PURE__ */ new Date()).toUTCString() + " " + name + " " + args[0];
      }
    }
    function log() {
      return stream.write(util.format.apply(util, arguments) + "\n");
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs2 = require$$3;
          stream2 = new fs2.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require$$4;
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      var keys = Object.keys(exports.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    exports.enable(load());
  })(node, node.exports);
  return node.exports;
}
if (typeof process !== "undefined" && process.type === "renderer") {
  src.exports = requireBrowser();
} else {
  src.exports = requireNode();
}
var srcExports = src.exports;
var path = require$$0$1;
var spawn = require$$1$1.spawn;
var debug = srcExports("electron-squirrel-startup");
var app = require$$3$1.app;
var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe");
  debug("Spawning `%s` with args `%s`", updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on("close", done);
};
var check = function() {
  if (process.platform === "win32") {
    var cmd = process.argv[1];
    debug("processing squirrel command `%s`", cmd);
    var target = path.basename(process.execPath);
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
      run(["--createShortcut=" + target], app.quit);
      return true;
    }
    if (cmd === "--squirrel-uninstall") {
      run(["--removeShortcut=" + target], app.quit);
      return true;
    }
    if (cmd === "--squirrel-obsolete") {
      app.quit();
      return true;
    }
  }
  return false;
};
var electronSquirrelStartup = check();
const started = /* @__PURE__ */ getDefaultExportFromCjs(electronSquirrelStartup);
class WindowManager {
  constructor() {
    __publicField(this, "mainWindow", null);
    console.log("🖼️ WindowManager: NODE_ENV:", process.env.NODE_ENV);
    console.log("🖼️ WindowManager: __dirname:", __dirname);
    console.log("🖼️ WindowManager: app.isPackaged:", require$$3$1.app.isPackaged);
    console.log("🖼️ WindowManager: process.cwd():", process.cwd());
  }
  createWindow() {
    console.log("🖼️ WindowManager: Creating main window...");
    this.mainWindow = new require$$3$1.BrowserWindow({
      height: 800,
      width: 1200,
      minHeight: 600,
      minWidth: 800,
      webPreferences: {
        preload: this.getPreloadPath(),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        sandbox: false,
        // Required for preload script to work properly
        experimentalFeatures: false
      },
      icon: this.getIconPath(),
      titleBarStyle: "default",
      show: false,
      // Don't show until ready
      autoHideMenuBar: true
      // Hide menu bar by default (can be toggled with Alt)
    });
    this.loadContent();
    this.setupWindowEvents();
    this.mainWindow.once("ready-to-show", () => {
      var _a;
      console.log("🖼️ WindowManager: Window ready to show");
      (_a = this.mainWindow) == null ? void 0 : _a.show();
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.focus();
      }
    });
    return this.mainWindow;
  }
  loadContent() {
    if (!this.mainWindow) return;
    console.log("🖼️ WindowManager: Loading content...");
    {
      console.log("🖼️ WindowManager: Loading dev server:", "http://localhost:5173");
      this.mainWindow.loadURL("http://localhost:5173");
    }
  }
  getProductionRendererPath() {
    return path$1.join(__dirname, "..", "renderer", "main_window", "index.html");
  }
  getPreloadPath() {
    return path$1.join(__dirname, "preload.js");
  }
  getIconPath() {
    const possibleIconPaths = [
      path$1.join(__dirname, "..", "..", "assets", "icon.png"),
      path$1.join(__dirname, "..", "assets", "icon.png"),
      path$1.join(process.cwd(), "assets", "icon.png"),
      path$1.join(process.cwd(), "src", "assets", "icon.png")
    ];
    console.log("🖼️ WindowManager: Searching for icon in paths:", possibleIconPaths);
    const iconPath = possibleIconPaths[0];
    console.log("🖼️ WindowManager: Using icon path:", iconPath);
    return iconPath;
  }
  setupWindowEvents() {
    if (!this.mainWindow) return;
    this.mainWindow.webContents.on("console-message", (event, level, message, line, sourceId) => {
      const levelName = ["verbose", "info", "warning", "error"][level] || "info";
      console.log(`🖼️ Renderer Console [${levelName}]:`, message, sourceId ? `(${sourceId}:${line})` : "");
    });
    this.mainWindow.webContents.on("render-process-gone", (event, details) => {
      console.error("🖼️ Renderer process crashed:", details);
    });
    this.mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
      console.log("🖼️ Navigation attempt to:", navigationUrl);
      try {
        const url = new URL(navigationUrl);
        const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
        const allowedProtocols = ["file:", "https:"];
        if (!allowedOrigins.includes(url.origin) && !allowedProtocols.includes(url.protocol)) {
          event.preventDefault();
          console.log("🖼️ Navigation blocked for security:", url.origin, url.protocol);
        }
      } catch (error) {
        console.error("🖼️ Error parsing navigation URL:", error);
        event.preventDefault();
      }
    });
    this.mainWindow.webContents.on("dom-ready", () => {
      console.log("🖼️ Main: DOM ready event fired");
    });
    this.mainWindow.webContents.on("did-finish-load", () => {
      var _a;
      console.log("🖼️ Main: Renderer finished loading");
      (_a = this.mainWindow) == null ? void 0 : _a.webContents.executeJavaScript(`
        console.log('🖼️ Main->Renderer: Post-load check...');
        console.log('🖼️ Main->Renderer: typeof window.electronAPI:', typeof window.electronAPI);
        if (window.electronAPI) {
          console.log('🖼️ Main->Renderer: electronAPI keys:', Object.keys(window.electronAPI));
          console.log('🖼️ Main->Renderer: ElectronAPI successfully loaded!');
        } else {
          console.error('🖼️ Main->Renderer: ElectronAPI not found! Preload script may have failed.');
        }
      `).catch((error) => {
        console.error("🖼️ Error executing post-load JavaScript:", error);
      });
    });
    this.mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription, validatedURL) => {
      console.error("🖼️ Failed to load renderer:", {
        errorCode,
        errorDescription,
        validatedURL,
        isNetworkError: errorCode <= -100 && errorCode >= -199,
        isHttpError: errorCode <= -300 && errorCode >= -399
      });
    });
    this.mainWindow.webContents.once("did-finish-load", () => {
      console.log("🖼️ WindowManager: Initial load complete");
    });
    this.mainWindow.on("closed", () => {
      console.log("🖼️ WindowManager: Main window closed");
      this.mainWindow = null;
    });
    this.mainWindow.on("focus", () => {
      console.log("🖼️ WindowManager: Window focused");
    });
    this.mainWindow.on("blur", () => {
      console.log("🖼️ WindowManager: Window blurred");
    });
    this.mainWindow.on("minimize", () => {
      console.log("🖼️ WindowManager: Window minimized");
    });
    this.mainWindow.on("maximize", () => {
      console.log("🖼️ WindowManager: Window maximized");
    });
    this.mainWindow.on("unmaximize", () => {
      console.log("🖼️ WindowManager: Window unmaximized");
    });
    this.mainWindow.on("resize", () => {
      const [width, height] = this.mainWindow.getSize();
      console.log(`🖼️ WindowManager: Window resized to ${width}x${height}`);
    });
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      console.log("🖼️ WindowManager: Blocked new window creation for:", url);
      return { action: "deny" };
    });
    this.mainWindow.webContents.on("certificate-error", (event, url, error, certificate, callback) => {
      if (process.env.NODE_ENV === "development") {
        if (url.startsWith("https://localhost") || url.startsWith("https://127.0.0.1")) {
          event.preventDefault();
          callback(true);
          return;
        }
      }
      console.error("🖼️ Certificate error:", { url, error });
      callback(false);
    });
  }
  getMainWindow() {
    return this.mainWindow;
  }
  closeWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      console.log("🖼️ WindowManager: Closing window...");
      this.mainWindow.close();
    }
  }
  isWindowVisible() {
    return this.mainWindow ? this.mainWindow.isVisible() : false;
  }
  showWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }
  hideWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.hide();
    }
  }
  toggleWindow() {
    if (this.isWindowVisible()) {
      this.hideWindow();
    } else {
      this.showWindow();
    }
  }
  // Method to reload the renderer (useful for development)
  reloadRenderer() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      console.log("🖼️ WindowManager: Reloading renderer...");
      this.mainWindow.webContents.reload();
    }
  }
  // Method to open developer tools
  openDevTools() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      console.log("🖼️ WindowManager: Opening DevTools...");
      this.mainWindow.webContents.openDevTools();
    }
  }
  // Method to close developer tools
  closeDevTools() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      console.log("🖼️ WindowManager: Closing DevTools...");
      this.mainWindow.webContents.closeDevTools();
    }
  }
}
class CryptoEngine {
  constructor(keyStore) {
    __publicField(this, "keyStore");
    __publicField(this, "identityKeys", null);
    this.keyStore = keyStore;
  }
  async initialize() {
    this.identityKeys = await this.keyStore.getIdentityKeys() || await this.generateIdentity();
  }
  async generateIdentity() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
      }
    });
    const identityKeys = { publicKey, privateKey };
    await this.keyStore.saveIdentityKeys(identityKeys);
    this.identityKeys = identityKeys;
    return identityKeys;
  }
  async encrypt(data, recipientPublicKey) {
    if (!this.identityKeys) {
      throw new Error("Identity keys not initialized");
    }
    const sessionKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const algorithm = "aes-256-cbc";
    const cipher = crypto.createCipheriv(algorithm, sessionKey, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    const encryptedSessionKey = crypto.publicEncrypt(
      recipientPublicKey,
      sessionKey
    );
    return {
      data: encrypted,
      iv: iv.toString("hex"),
      authTag: "",
      // Not used with CBC mode
      sessionKey: encryptedSessionKey.toString("base64")
    };
  }
  async decrypt(encryptedData) {
    if (!this.identityKeys) {
      throw new Error("Identity keys not initialized");
    }
    if (!encryptedData.sessionKey) {
      throw new Error("Session key missing from encrypted data");
    }
    const sessionKey = crypto.privateDecrypt(
      this.identityKeys.privateKey,
      Buffer.from(encryptedData.sessionKey, "base64")
    );
    const algorithm = "aes-256-cbc";
    const iv = Buffer.from(encryptedData.iv, "hex");
    const decipher = crypto.createDecipheriv(algorithm, sessionKey, iv);
    let decrypted = decipher.update(encryptedData.data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
  async getPublicKey() {
    var _a;
    if (!this.identityKeys) {
      await this.initialize();
    }
    return ((_a = this.identityKeys) == null ? void 0 : _a.publicKey) || null;
  }
}
class DatabaseManager {
  constructor() {
    __publicField(this, "dbPath");
    __publicField(this, "data", {
      messages: /* @__PURE__ */ new Map(),
      chats: /* @__PURE__ */ new Map()
    });
    this.dbPath = path$1.join(os.tmpdir(), "secure-chat-db.json");
  }
  async initialize() {
    try {
      const data = await fs.readFile(this.dbPath, "utf8");
      const parsed = JSON.parse(data);
      if (parsed.messages) {
        for (const [chatId, messages] of Object.entries(parsed.messages)) {
          if (Array.isArray(messages)) {
            const typedMessages = messages.map((msg) => ({
              ...msg,
              type: msg.type || "text"
              // Default to 'text' if missing
            }));
            this.data.messages.set(chatId, typedMessages);
          }
        }
      }
      if (parsed.chats) {
        for (const [chatId, chat] of Object.entries(parsed.chats)) {
          const typedChat = {
            ...chat,
            type: chat.type || "direct"
            // Default to 'direct' if missing
          };
          this.data.chats.set(chatId, typedChat);
        }
      }
    } catch (error) {
      console.warn("Failed to load database, starting fresh:", error);
      this.data = {
        messages: /* @__PURE__ */ new Map(),
        chats: /* @__PURE__ */ new Map()
      };
    }
  }
  async saveMessage(message) {
    const fullMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: message.type || "text"
      // Ensure type is set with default
    };
    const chatMessages = this.data.messages.get(message.chatId) || [];
    chatMessages.push(fullMessage);
    this.data.messages.set(message.chatId, chatMessages);
    const chat = this.data.chats.get(message.chatId);
    if (chat) {
      chat.lastMessage = fullMessage;
      this.data.chats.set(message.chatId, chat);
    }
    await this.persist();
    return fullMessage;
  }
  async getMessages(chatId) {
    const messages = this.data.messages.get(chatId) || [];
    return messages.map((message) => ({
      ...message,
      type: message.type || "text"
    }));
  }
  async saveChat(chat) {
    const fullChat = {
      ...chat,
      id: crypto.randomUUID(),
      type: chat.type || "direct"
      // Ensure type is set with default
    };
    this.data.chats.set(fullChat.id, fullChat);
    await this.persist();
    return fullChat;
  }
  async getChats() {
    const chats = Array.from(this.data.chats.values());
    return chats.map((chat) => ({
      ...chat,
      type: chat.type || "direct"
    }));
  }
  async updateChat(chatId, updates) {
    const existingChat = this.data.chats.get(chatId);
    if (!existingChat) {
      throw new Error(`Chat with id ${chatId} not found`);
    }
    const updatedChat = {
      ...existingChat,
      ...updates,
      type: updates.type || existingChat.type || "direct"
      // Preserve or set type
    };
    this.data.chats.set(chatId, updatedChat);
    await this.persist();
    return updatedChat;
  }
  // New method to get message by ID
  async getMessageById(messageId) {
    for (const messages of this.data.messages.values()) {
      const message = messages.find((m) => m.id === messageId);
      if (message) {
        return {
          ...message,
          type: message.type || "text"
        };
      }
    }
    return null;
  }
  // New method to delete a message
  async deleteMessage(messageId) {
    var _a;
    for (const [chatId, messages] of this.data.messages.entries()) {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex !== -1) {
        messages.splice(messageIndex, 1);
        this.data.messages.set(chatId, messages);
        const chat = this.data.chats.get(chatId);
        if (chat && ((_a = chat.lastMessage) == null ? void 0 : _a.id) === messageId) {
          chat.lastMessage = messages.length > 0 ? messages[messages.length - 1] : void 0;
          this.data.chats.set(chatId, chat);
        }
        await this.persist();
        return true;
      }
    }
    return false;
  }
  // New method to delete a chat and all its messages
  async deleteChat(chatId) {
    const chatExists = this.data.chats.has(chatId);
    if (chatExists) {
      this.data.chats.delete(chatId);
      this.data.messages.delete(chatId);
      await this.persist();
      return true;
    }
    return false;
  }
  // New method to search messages
  async searchMessages(query, chatId) {
    const results = [];
    const searchTerm = query.toLowerCase();
    const messagesToSearch = chatId ? [this.data.messages.get(chatId) || []] : Array.from(this.data.messages.values());
    for (const messages of messagesToSearch) {
      for (const message of messages) {
        if (message.content.toLowerCase().includes(searchTerm)) {
          results.push({
            ...message,
            type: message.type || "text"
          });
        }
      }
    }
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }
  // New method to get chat statistics
  async getChatStats(chatId) {
    const messages = this.data.messages.get(chatId);
    if (!messages) return null;
    const messagesByType = {};
    let lastActivity = 0;
    for (const message of messages) {
      const type = message.type || "text";
      messagesByType[type] = (messagesByType[type] || 0) + 1;
      lastActivity = Math.max(lastActivity, message.timestamp);
    }
    return {
      totalMessages: messages.length,
      messagesByType,
      lastActivity
    };
  }
  async cleanup() {
    this.data.messages.clear();
    this.data.chats.clear();
    try {
      await fs.unlink(this.dbPath);
    } catch {
    }
  }
  async persist() {
    try {
      await fs.mkdir(path$1.dirname(this.dbPath), { recursive: true });
      const dataObject = {
        messages: Object.fromEntries(this.data.messages),
        chats: Object.fromEntries(this.data.chats),
        version: "1.0.0",
        // Add version for future migrations
        lastUpdated: Date.now()
      };
      const tempPath = `${this.dbPath}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(dataObject, null, 2));
      await fs.rename(tempPath, this.dbPath);
    } catch (error) {
      console.error("Failed to persist database:", error);
      throw error;
    }
  }
}
class KeyStore {
  constructor() {
    __publicField(this, "memoryKeys", /* @__PURE__ */ new Map());
    __publicField(this, "keyDir");
    this.keyDir = path$1.join(os.tmpdir(), "secure-chat-keys");
  }
  async initialize() {
    try {
      await fs.access(this.keyDir);
    } catch {
      await fs.mkdir(this.keyDir, { recursive: true });
    }
  }
  async saveIdentityKeys(keys) {
    this.memoryKeys.set("identity", keys);
    const encrypted = this.encryptForStorage(JSON.stringify(keys));
    const keyPath = path$1.join(this.keyDir, "identity.key");
    await fs.writeFile(keyPath, encrypted);
  }
  async getIdentityKeys() {
    const memoryKeys = this.memoryKeys.get("identity");
    if (memoryKeys) {
      return memoryKeys;
    }
    try {
      const keyPath = path$1.join(this.keyDir, "identity.key");
      const encrypted = await fs.readFile(keyPath, "utf8");
      const decrypted = this.decryptFromStorage(encrypted);
      const keys = JSON.parse(decrypted);
      this.memoryKeys.set("identity", keys);
      return keys;
    } catch {
      return null;
    }
  }
  async cleanup() {
    this.memoryKeys.clear();
    try {
      await fs.rm(this.keyDir, { recursive: true, force: true });
    } catch {
    }
  }
  encryptForStorage(data) {
    const algorithm = "aes-256-cbc";
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${key.toString("hex")}:${iv.toString("hex")}:${encrypted}`;
  }
  decryptFromStorage(encryptedData) {
    const [keyHex, ivHex, encrypted] = encryptedData.split(":");
    const algorithm = "aes-256-cbc";
    const key = Buffer.from(keyHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
class PermissionBroker {
  constructor() {
    __publicField(this, "grantedPermissions", /* @__PURE__ */ new Set());
    __publicField(this, "deniedPermissions", /* @__PURE__ */ new Set());
    __publicField(this, "pendingRequests", /* @__PURE__ */ new Map());
    __publicField(this, "trustedOrigins", /* @__PURE__ */ new Set([
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://localhost:5173",
      "file://"
    ]));
    __publicField(this, "sessionHandlersSetup", false);
    console.log("🛡️ PermissionBroker: Instance created, waiting for app ready to setup session handlers");
  }
  // Call this method after app is ready
  setupSessionHandlers() {
    if (this.sessionHandlersSetup) {
      console.log("🛡️ PermissionBroker: Session handlers already setup");
      return;
    }
    try {
      require$$3$1.session.defaultSession.setPermissionRequestHandler(
        (webContents, permission, callback, details) => {
          this.handlePermissionRequest(webContents, permission, callback, details);
        }
      );
      require$$3$1.session.defaultSession.setPermissionCheckHandler(
        (webContents, permission, requestingOrigin, details) => {
          return this.checkPermission(permission, requestingOrigin, details);
        }
      );
      this.sessionHandlersSetup = true;
      console.log("🛡️ PermissionBroker: Session permission handlers configured");
    } catch (error) {
      console.error("🛡️ PermissionBroker: Failed to setup session handlers:", error);
      throw error;
    }
  }
  handlePermissionRequest(webContents, permission, callback, details) {
    const url = webContents.getURL();
    `${permission}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🛡️ PermissionBroker: Permission request for "${permission}" from ${url}`, details);
    try {
      const parsedUrl = new URL(url);
      if (this.shouldDenyPermission(permission, parsedUrl)) {
        console.log(`🛡️ PermissionBroker: Auto-denied permission "${permission}" from ${parsedUrl.origin}`);
        callback(false);
        return;
      }
      if (!this.isTrustedOrigin(parsedUrl.origin)) {
        console.log(`🛡️ PermissionBroker: Denied permission "${permission}" from untrusted origin: ${parsedUrl.origin}`);
        callback(false);
        return;
      }
      const granted = this.evaluatePermissionRequest(permission, parsedUrl, details);
      if (granted) {
        this.grantedPermissions.add(`${parsedUrl.origin}:${permission}`);
        console.log(`🛡️ PermissionBroker: Granted permission "${permission}" to ${parsedUrl.origin}`);
      } else {
        this.deniedPermissions.add(`${parsedUrl.origin}:${permission}`);
        console.log(`🛡️ PermissionBroker: Denied permission "${permission}" to ${parsedUrl.origin}`);
      }
      callback(granted);
    } catch (error) {
      console.error("🛡️ PermissionBroker: Error parsing URL:", error);
      console.log(`🛡️ PermissionBroker: Denied permission "${permission}" due to URL parse error`);
      callback(false);
    }
  }
  checkPermission(permission, requestingOrigin, details) {
    const permissionKey = `${requestingOrigin}:${permission}`;
    if (this.grantedPermissions.has(permissionKey)) {
      return true;
    }
    if (this.deniedPermissions.has(permissionKey)) {
      return false;
    }
    console.log(`🛡️ PermissionBroker: Permission check for "${permission}" from ${requestingOrigin} - defaulting to deny`);
    return false;
  }
  shouldDenyPermission(permission, url) {
    const alwaysDenyPermissions = [
      "camera",
      "microphone",
      "geolocation"
    ];
    if (alwaysDenyPermissions.includes(permission)) {
      return true;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:" && url.protocol !== "file:") {
      return true;
    }
    if (url.protocol === "http:" && !["localhost", "127.0.0.1"].includes(url.hostname)) {
      return true;
    }
    return false;
  }
  isTrustedOrigin(origin) {
    return this.trustedOrigins.has(origin) || origin.startsWith("file://");
  }
  evaluatePermissionRequest(permission, url, details) {
    switch (permission) {
      case "notifications":
        return this.isTrustedOrigin(url.origin);
      case "storage-access":
        return this.isTrustedOrigin(url.origin);
      case "background-sync":
        return this.isTrustedOrigin(url.origin);
      case "push-messaging":
        return false;
      case "midi":
        return false;
      default:
        console.log(`🛡️ PermissionBroker: Unknown permission "${permission}" - defaulting to deny`);
        return false;
    }
  }
  // Application-specific permission methods (keep your existing API)
  async request(permission) {
    console.log(`🛡️ PermissionBroker: App requesting internal permission: ${permission}`);
    switch (permission) {
      case "crypto":
      case "storage":
      case "network":
        this.grantedPermissions.add(`app:${permission}`);
        console.log(`🛡️ PermissionBroker: Granted internal permission: ${permission}`);
        return true;
      case "notifications":
        this.grantedPermissions.add(`app:${permission}`);
        return true;
      default:
        console.log(`🛡️ PermissionBroker: Denied internal permission: ${permission}`);
        return false;
    }
  }
  hasPermission(permission) {
    return this.grantedPermissions.has(`app:${permission}`);
  }
  // Method to add trusted origins dynamically
  addTrustedOrigin(origin) {
    this.trustedOrigins.add(origin);
    console.log(`🛡️ PermissionBroker: Added trusted origin: ${origin}`);
  }
  // Method to remove trusted origins
  removeTrustedOrigin(origin) {
    this.trustedOrigins.delete(origin);
    console.log(`🛡️ PermissionBroker: Removed trusted origin: ${origin}`);
  }
  // Get permission statistics
  getPermissionStats() {
    return {
      granted: Array.from(this.grantedPermissions),
      denied: Array.from(this.deniedPermissions),
      trusted: Array.from(this.trustedOrigins)
    };
  }
  // Revoke all permissions (useful for reset/logout)
  revokeAllPermissions() {
    this.grantedPermissions.clear();
    this.deniedPermissions.clear();
    console.log("🛡️ PermissionBroker: All permissions revoked");
  }
}
class DebugManager {
  constructor() {
    __publicField(this, "logs", []);
    __publicField(this, "maxLogs", 1e3);
    this.setupIPC();
  }
  setupIPC() {
    require$$3$1.ipcMain.handle("debug:getLogs", () => this.getLogs());
    require$$3$1.ipcMain.handle("debug:clearLogs", () => this.clearLogs());
    require$$3$1.ipcMain.handle("debug:addLog", (_, log) => this.addLog(log));
  }
  addLog(log) {
    const fullLog = {
      ...log,
      timestamp: Date.now()
    };
    this.logs.unshift(fullLog);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    this.sendToRenderer("debug:newLog", fullLog);
    console.log(`[${log.component}] ${log.message}`, log.data || "");
  }
  getLogs() {
    return this.logs;
  }
  clearLogs() {
    this.logs = [];
    this.sendToRenderer("debug:logsCleared");
  }
  sendToRenderer(channel, data) {
    const windows = require$$3$1.BrowserWindow.getAllWindows();
    windows.forEach((window2) => {
      if (window2 && !window2.isDestroyed()) {
        window2.webContents.send(channel, data);
      }
    });
  }
  // Helper methods for different log levels
  info(component, message, data) {
    this.addLog({ level: "info", component, message, data });
  }
  warn(component, message, data) {
    this.addLog({ level: "warn", component, message, data });
  }
  error(component, message, data) {
    this.addLog({ level: "error", component, message, data });
  }
}
class TransportManager {
  // Fixed: Removed inferrable type annotation
  constructor() {
    __publicField(this, "server", null);
    __publicField(this, "connections", /* @__PURE__ */ new Map());
    __publicField(this, "serverPort", 0);
    // Fixed: Removed inferrable type annotation
    __publicField(this, "serverAddress", "");
    this.setupIPC();
  }
  setupIPC() {
    require$$3$1.ipcMain.handle("transport:startServer", async (_, port) => {
      return this.startServer(port);
    });
    require$$3$1.ipcMain.handle("transport:connect", async (_, address, port) => {
      return this.connectToPeer(address, port);
    });
    require$$3$1.ipcMain.handle("transport:send", async (_, chatId, data) => {
      return this.sendMessage(chatId, data);
    });
    require$$3$1.ipcMain.handle("transport:disconnect", async (_, chatId) => {
      return this.disconnectPeer(chatId);
    });
  }
  async startServer(port = 0) {
    return new Promise((resolve, reject) => {
      this.server = require$$4.createServer();
      this.server.on("connection", (socket) => {
        this.handleIncomingConnection(socket);
      });
      this.server.on("error", (error) => {
        console.error("🌐 TransportManager: Server error:", error);
        reject(error);
      });
      this.server.listen(port, "127.0.0.1", () => {
        var _a;
        const address = (_a = this.server) == null ? void 0 : _a.address();
        if (address && typeof address === "object") {
          this.serverPort = address.port;
          this.serverAddress = address.address;
          console.log(`🌐 TransportManager: Server listening on ${this.serverAddress}:${this.serverPort}`);
          resolve({ port: this.serverPort, address: this.serverAddress });
        } else {
          reject(new Error("Failed to get server address"));
        }
      });
    });
  }
  handleIncomingConnection(socket) {
    console.log("🌐 TransportManager: Incoming connection from", socket.remoteAddress);
    const tempConnection = {
      socket,
      authenticated: false
    };
    socket.on("data", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "handshake" && !tempConnection.authenticated) {
          const chatId = crypto.randomUUID();
          const peerConnection = {
            chatId,
            socket,
            peerInfo: {
              id: message.peerId,
              name: message.peerName,
              publicKey: message.publicKey,
              address: socket.remoteAddress || "unknown"
            },
            authenticated: true
          };
          this.connections.set(chatId, peerConnection);
          socket.write(JSON.stringify({
            type: "handshake_response",
            chatId,
            success: true
          }));
          this.sendToRenderer("transport:peerConnected", chatId, peerConnection.peerInfo);
          this.setupMessageHandler(peerConnection);
        }
      } catch (error) {
        console.error("🌐 TransportManager: Error handling incoming data:", error);
      }
    });
    socket.on("error", (error) => {
      console.error("🌐 TransportManager: Socket error:", error);
    });
    socket.on("close", () => {
      console.log("🌐 TransportManager: Incoming connection closed");
      for (const [connectionChatId, connection] of this.connections.entries()) {
        if (connection.socket === socket) {
          this.connections.delete(connectionChatId);
          this.sendToRenderer("transport:peerDisconnected", connectionChatId);
          break;
        }
      }
    });
  }
  async connectToPeer(address, port) {
    return new Promise((resolve, reject) => {
      const socket = require$$4.connect(port, address);
      socket.on("connect", () => {
        console.log(`🌐 TransportManager: Connected to peer at ${address}:${port}`);
        crypto.randomUUID();
        socket.write(JSON.stringify({
          type: "handshake",
          peerId: crypto.randomUUID(),
          peerName: "Anonymous User",
          // We'll get this from user input later
          publicKey: "temp-public-key"
          // We'll get this from crypto engine
        }));
      });
      socket.on("data", (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === "handshake_response" && message.success) {
            const peerConnection = {
              chatId: message.chatId,
              socket,
              peerInfo: {
                id: crypto.randomUUID(),
                name: "Remote Peer",
                publicKey: "temp-public-key",
                address: `${address}:${port}`
              },
              authenticated: true
            };
            this.connections.set(message.chatId, peerConnection);
            this.setupMessageHandler(peerConnection);
            this.sendToRenderer("transport:peerConnected", message.chatId, peerConnection.peerInfo);
            resolve(true);
          }
        } catch (error) {
          console.error("🌐 TransportManager: Error handling response:", error);
          reject(error);
        }
      });
      socket.on("error", (error) => {
        console.error("🌐 TransportManager: Connection error:", error);
        reject(error);
      });
      socket.on("close", () => {
        console.log("🌐 TransportManager: Connection closed");
        for (const [connectionChatId, conn] of this.connections.entries()) {
          if (conn.socket === socket) {
            this.connections.delete(connectionChatId);
            this.sendToRenderer("transport:peerDisconnected", connectionChatId);
            break;
          }
        }
      });
      const connectionTimeout = setTimeout(() => {
        socket.destroy();
        reject(new Error("Connection timeout"));
      }, 1e4);
      socket.on("connect", () => {
        clearTimeout(connectionTimeout);
      });
      socket.on("error", () => {
        clearTimeout(connectionTimeout);
      });
    });
  }
  setupMessageHandler(connection) {
    connection.socket.on("data", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "chat_message") {
          this.sendToRenderer("transport:message", connection.chatId, message.payload);
        }
      } catch (error) {
        console.error("🌐 TransportManager: Error handling message:", error);
      }
    });
    connection.socket.on("error", (error) => {
      console.error(`🌐 TransportManager: Connection error for chat ${connection.chatId}:`, error);
      this.connections.delete(connection.chatId);
      this.sendToRenderer("transport:peerDisconnected", connection.chatId);
    });
    connection.socket.on("close", () => {
      console.log(`🌐 TransportManager: Connection closed for chat ${connection.chatId}`);
      this.connections.delete(connection.chatId);
      this.sendToRenderer("transport:peerDisconnected", connection.chatId);
    });
  }
  async sendMessage(chatId, data) {
    const connection = this.connections.get(chatId);
    if (!connection) {
      console.error("🌐 TransportManager: No connection found for chat:", chatId);
      return false;
    }
    if (!connection.authenticated) {
      console.error("🌐 TransportManager: Connection not authenticated for chat:", chatId);
      return false;
    }
    try {
      const message = {
        type: "chat_message",
        timestamp: Date.now(),
        payload: data
      };
      connection.socket.write(JSON.stringify(message));
      console.log(`🌐 TransportManager: Message sent to chat ${chatId}`);
      return true;
    } catch (error) {
      console.error("🌐 TransportManager: Error sending message:", error);
      return false;
    }
  }
  async disconnectPeer(chatId) {
    const connection = this.connections.get(chatId);
    if (connection) {
      console.log(`🌐 TransportManager: Disconnecting peer for chat ${chatId}`);
      connection.socket.destroy();
      this.connections.delete(chatId);
      this.sendToRenderer("transport:peerDisconnected", chatId);
    } else {
      console.warn(`🌐 TransportManager: No connection found to disconnect for chat ${chatId}`);
    }
  }
  sendToRenderer(channel, ...args) {
    const windows = require$$3$1.BrowserWindow.getAllWindows();
    windows.forEach((window2) => {
      if (window2 && !window2.isDestroyed()) {
        window2.webContents.send(channel, ...args);
      }
    });
  }
  getConnectedPeers() {
    return Array.from(this.connections.entries()).map(([chatId, connection]) => ({
      chatId,
      peerInfo: connection.peerInfo
    }));
  }
  getServerInfo() {
    if (this.server && this.serverPort > 0) {
      return { port: this.serverPort, address: this.serverAddress };
    }
    return null;
  }
  isServerRunning() {
    return this.server !== null && this.server.listening;
  }
  async cleanup() {
    console.log("🌐 TransportManager: Starting cleanup...");
    for (const [chatId, connection] of this.connections.entries()) {
      console.log(`🌐 TransportManager: Closing connection for chat ${chatId}`);
      connection.socket.destroy();
    }
    this.connections.clear();
    if (this.server) {
      return new Promise((resolve) => {
        var _a;
        if ((_a = this.server) == null ? void 0 : _a.listening) {
          this.server.close(() => {
            console.log("🌐 TransportManager: Server closed");
            this.server = null;
            this.serverPort = 0;
            this.serverAddress = "";
            resolve();
          });
        } else {
          this.server = null;
          this.serverPort = 0;
          this.serverAddress = "";
          resolve();
        }
      });
    }
    console.log("🌐 TransportManager: Cleanup completed");
  }
}
if (started) {
  require$$3$1.app.quit();
}
class ChatApp {
  constructor() {
    __publicField(this, "windowManager");
    __publicField(this, "cryptoEngine");
    __publicField(this, "databaseManager");
    __publicField(this, "keyStore");
    __publicField(this, "permissionBroker");
    __publicField(this, "debugManager");
    __publicField(this, "transportManager");
    this.debugManager = new DebugManager();
    this.keyStore = new KeyStore();
    this.cryptoEngine = new CryptoEngine(this.keyStore);
    this.databaseManager = new DatabaseManager();
    this.permissionBroker = new PermissionBroker();
    this.windowManager = new WindowManager();
    this.transportManager = new TransportManager();
  }
  async initialize() {
    this.debugManager.info("ChatApp", "Starting initialization...");
    try {
      await this.keyStore.initialize();
      this.debugManager.info("KeyStore", "Initialized successfully");
      await this.databaseManager.initialize();
      this.debugManager.info("DatabaseManager", "Initialized successfully");
      await this.cryptoEngine.initialize();
      this.debugManager.info("CryptoEngine", "Initialized successfully");
      this.setupIPC();
      this.debugManager.info("ChatApp", "IPC handlers registered");
      this.debugManager.info("ChatApp", "Initialization completed successfully");
    } catch (error) {
      this.debugManager.error("ChatApp", "Initialization failed", error);
      throw error;
    }
  }
  setupIPC() {
    require$$3$1.ipcMain.handle("crypto:generateIdentity", async () => {
      this.debugManager.info("CryptoEngine", "Generating identity keys...");
      try {
        const identity = await this.cryptoEngine.generateIdentity();
        this.debugManager.info("CryptoEngine", "Identity keys generated successfully");
        return identity;
      } catch (error) {
        this.debugManager.error("CryptoEngine", "Failed to generate identity", error);
        throw error;
      }
    });
    require$$3$1.ipcMain.handle("crypto:encrypt", (_, data, publicKey) => this.cryptoEngine.encrypt(data, publicKey));
    require$$3$1.ipcMain.handle("crypto:decrypt", (_, encryptedData) => this.cryptoEngine.decrypt(encryptedData));
    require$$3$1.ipcMain.handle("crypto:getPublicKey", () => this.cryptoEngine.getPublicKey());
    require$$3$1.ipcMain.handle("db:saveMessage", (_, message) => this.databaseManager.saveMessage(message));
    require$$3$1.ipcMain.handle("db:getMessages", (_, chatId) => this.databaseManager.getMessages(chatId));
    require$$3$1.ipcMain.handle("db:saveChat", (_, chat) => this.databaseManager.saveChat(chat));
    require$$3$1.ipcMain.handle("db:getChats", () => this.databaseManager.getChats());
    require$$3$1.ipcMain.handle("db:updateChat", (_, chatId, updates) => this.databaseManager.updateChat(chatId, updates));
    require$$3$1.ipcMain.handle("permission:request", (_, permission) => this.permissionBroker.request(permission));
  }
  createWindow() {
    this.debugManager.info("WindowManager", "Creating main window...");
    return this.windowManager.createWindow();
  }
  async cleanup() {
    this.debugManager.info("ChatApp", "Starting cleanup...");
    await this.databaseManager.cleanup();
    await this.keyStore.cleanup();
    await this.transportManager.cleanup();
    this.debugManager.info("ChatApp", "Cleanup completed");
  }
}
const chatApp = new ChatApp();
require$$3$1.app.on("ready", async () => {
  await chatApp.initialize();
  chatApp.createWindow();
});
require$$3$1.app.on("window-all-closed", async () => {
  await chatApp.cleanup();
  if (process.platform !== "darwin") {
    require$$3$1.app.quit();
  }
});
require$$3$1.app.on("activate", () => {
  if (require$$3$1.BrowserWindow.getAllWindows().length === 0) {
    chatApp.createWindow();
  }
});
require$$3$1.app.on("before-quit", async () => {
  await chatApp.cleanup();
});
