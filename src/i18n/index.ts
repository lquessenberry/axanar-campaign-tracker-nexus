import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      about: 'About',
      'how-it-works': 'How It Works',
      faq: 'FAQ',
      support: 'Support',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact',
      
      // Authentication
      'access-portal': 'Access Portal',
      'sign-out': 'Sign Out',
      dashboard: 'Donor Dashboard',
      profile: 'Account',
      settings: 'Settings',
      messages: 'Messages',
      admin: 'Admin',
      
      // Common UI
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      loading: 'Loading',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      
      // Theme selector
      'standard-lcars': 'Standard LCARS',
      'night-mode': 'Night Mode',
      'tactical-mode': 'Tactical Mode',
      'klingon-mode': 'Klingon Mode',
      
      // Alert levels
      'status-normal': 'Status Normal',
      'yellow-alert': 'Yellow Alert',
      'red-alert': 'Red Alert',
    }
  },
  tlh: {
    translation: {
      // Navigation - Klingon translations
      home: 'juH',
      about: 'nugh',
      'how-it-works': 'veb',
      faq: 'naDev',
      support: 'jup',
      privacy: 'pegh',
      terms: 'chup',
      contact: 'jup',
      
      // Authentication
      'access-portal': 'naDev lojmIt',
      'sign-out': 'mej',
      dashboard: 'SeHwI\' jup',
      profile: 'nugh',
      settings: 'choq',
      messages: 'nugh',
      admin: 'la\'',
      
      // Common UI
      login: 'nugh',
      register: 'ghItlh',
      logout: 'mej',
      loading: 'polmeH',
      submit: 'naDev',
      cancel: 'chup',
      save: 'choq',
      edit: 'choH',
      delete: 'Haq',
      
      // Theme selector
      'standard-lcars': 'motlhbe\'ghach LCARS',
      'night-mode': 'ram mI\'',
      'tactical-mode': 'may\' mI\'',
      'klingon-mode': 'tlhIngan mI\'',
      
      // Alert levels
      'status-normal': 'motlhbe\'ghach Dotlh',
      'yellow-alert': 'Doq \'e\' chup',
      'red-alert': 'Doq \'e\' may\'',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // react already does escaping
    }
  });

export default i18n;