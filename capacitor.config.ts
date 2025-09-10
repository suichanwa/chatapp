import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.securechat',
  appName: 'Secure Chat',
  webDir: 'dist-mobile',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      showSpinner: true,
      spinnerColor: "#007acc"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#1a1a1a"
    }
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    appendUserAgent: 'SecureChat/1.0'
  }
};

export default config;