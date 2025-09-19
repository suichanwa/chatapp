"use strict";
const electron = require("electron");
console.log("🔧 PRELOAD: Starting preload script execution...");
console.log("🔧 PRELOAD: contextBridge available:", !!electron.contextBridge);
console.log("🔧 PRELOAD: ipcRenderer available:", !!electron.ipcRenderer);
const electronAPI = {
  // Crypto operations
  crypto: {
    generateIdentity: () => {
      console.log("🔧 PRELOAD: crypto.generateIdentity called");
      return electron.ipcRenderer.invoke("crypto:generateIdentity");
    },
    encrypt: (data, publicKey) => electron.ipcRenderer.invoke("crypto:encrypt", data, publicKey),
    decrypt: (encryptedData) => electron.ipcRenderer.invoke("crypto:decrypt", encryptedData),
    getPublicKey: () => electron.ipcRenderer.invoke("crypto:getPublicKey")
  },
  // Database operations
  db: {
    saveMessage: (message) => electron.ipcRenderer.invoke("db:saveMessage", message),
    getMessages: (chatId) => electron.ipcRenderer.invoke("db:getMessages", chatId),
    saveChat: (chat) => electron.ipcRenderer.invoke("db:saveChat", chat),
    getChats: () => electron.ipcRenderer.invoke("db:getChats"),
    updateChat: (chatId, updates) => electron.ipcRenderer.invoke("db:updateChat", chatId, updates)
  },
  // Enhanced Permission system
  permission: {
    request: (permission) => electron.ipcRenderer.invoke("permission:request", permission),
    check: (permission) => electron.ipcRenderer.invoke("permission:check", permission),
    getStats: () => electron.ipcRenderer.invoke("permission:getStats"),
    addTrustedOrigin: (origin) => electron.ipcRenderer.invoke("permission:addTrustedOrigin", origin),
    revokeAll: () => electron.ipcRenderer.invoke("permission:revokeAll")
  },
  // Debug operations
  debug: {
    getLogs: () => electron.ipcRenderer.invoke("debug:getLogs"),
    clearLogs: () => electron.ipcRenderer.invoke("debug:clearLogs"),
    addLog: (log) => electron.ipcRenderer.invoke("debug:addLog", log),
    onNewLog: (callback) => {
      electron.ipcRenderer.on("debug:newLog", (_, log) => callback(log));
    },
    onLogsCleared: (callback) => {
      electron.ipcRenderer.on("debug:logsCleared", () => callback());
    }
  },
  // Transport layer
  transport: {
    startServer: (port) => electron.ipcRenderer.invoke("transport:startServer", port),
    connect: (address, port) => electron.ipcRenderer.invoke("transport:connect", address, port),
    send: (chatId, data) => electron.ipcRenderer.invoke("transport:send", chatId, data),
    disconnect: (chatId) => electron.ipcRenderer.invoke("transport:disconnect", chatId),
    onMessage: (callback) => {
      electron.ipcRenderer.on("transport:message", (_, chatId, data) => callback(chatId, data));
    },
    onPeerConnected: (callback) => {
      electron.ipcRenderer.on("transport:peerConnected", (_, chatId, peerInfo) => callback(chatId, peerInfo));
    },
    onPeerDisconnected: (callback) => {
      electron.ipcRenderer.on("transport:peerDisconnected", (_, chatId) => callback(chatId));
    }
  }
};
console.log("🔧 PRELOAD: electronAPI object created:", !!electronAPI);
console.log("🔧 PRELOAD: electronAPI keys:", Object.keys(electronAPI));
try {
  electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
  console.log("🔧 PRELOAD: contextBridge.exposeInMainWorld completed successfully");
} catch (error) {
  console.error("🔧 PRELOAD: Failed to expose electronAPI:", error);
}
console.log("🔧 PRELOAD: Preload script completed execution");
setTimeout(() => {
  console.log("🔧 PRELOAD: Testing API exposure...");
  try {
    console.log("🔧 PRELOAD: electronAPI still accessible:", !!electronAPI);
  } catch (error) {
    console.error("🔧 PRELOAD: Error testing API:", error);
  }
}, 100);
