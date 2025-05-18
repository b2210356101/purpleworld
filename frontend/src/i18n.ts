import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationTR from './locales/tr/translation.json';

const storedLang = localStorage.getItem('lang');
const browserLang = navigator.language.split('-')[0]; // 'tr-TR' → 'tr'
const defaultLang = storedLang || browserLang || 'en';

const resources = {
  en: {
    translation: translationEN
  },
  tr: {
    translation: translationTR
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
