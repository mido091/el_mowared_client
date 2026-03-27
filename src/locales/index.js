import { createI18n } from 'vue-i18n';
import en from './en_v2.json';
import ar from './ar_v2.json';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    ar
  },
});

export default i18n;
