import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0a69648e42c441d682ee290ad344c5cf',
  appName: 'axanar-campaign-tracker-nexus',
  webDir: 'dist',
  server: {
    url: 'https://0a69648e-42c4-41d6-82ee-290ad344c5cf.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;