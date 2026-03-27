import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiData } from '@/utils/apiResponse';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    siteName: 'Elmowared',
    siteNameAr: 'المورد',
    siteNameEn: 'Elmowared',
    siteDescriptionAr: '',
    siteDescriptionEn: '',
    logo: null,
    favicon: null,
    socialLinks: [],
    defaultLanguage: 'ar',
    defaultTheme: 'light',

    colors: {
      primary: '#0B1E3C',
      secondary: '#1A9882',
      accent: '#F7F9FC'
    },

    toggles: {
      rfq: true,
      chat: true,
      vendor_registration: true,
      maintenance: false
    },

    seo: {
      titleAr: '',
      titleEn: '',
      descAr: '',
      descEn: '',
      keywords: '',
      ogImage: null
    },

    loaded: false,
    _settings: {}
  }),

  actions: {
    get(key) {
      return this._settings[key] !== undefined ? this._settings[key] : '';
    },

    async fetch() {
      if (this._fetchPromise) return this._fetchPromise;

      this._fetchPromise = (async () => {
        try {
          const res = await api.get('/settings/public');
          const d = getApiData(res) || {};

          this._settings = d;
          this.siteName = d.site_name_en || d.site_name || 'Elmowared';
          this.siteNameAr = d.site_name_ar || 'المورد';
          this.siteNameEn = d.site_name_en || 'Elmowared';
          this.siteDescriptionAr = d.site_description_ar || '';
          this.siteDescriptionEn = d.site_description_en || '';

          this.defaultLanguage = d.default_language || 'ar';
          this.defaultTheme = d.default_theme || 'light';

          this.colors.primary = d.primary_color || '#0B1E3C';
          this.colors.secondary = d.secondary_color || '#1A9882';
          this.colors.accent = d.accent_color || '#F7F9FC';

          this.toggles.rfq = d.enable_rfq;
          this.toggles.chat = d.enable_chat;
          this.toggles.vendor_registration = d.enable_vendor_registration;
          this.toggles.maintenance = d.maintenance_mode;

          this.seo.titleAr = d.meta_title_ar || '';
          this.seo.titleEn = d.meta_title_en || '';
          this.seo.descAr = d.meta_description_ar || '';
          this.seo.descEn = d.meta_description_en || '';
          this.seo.keywords = d.meta_keywords || '';

          const getUrl = (val) => {
            if (!val) return null;
            if (typeof val === 'string' && val.startsWith('{')) {
              try {
                return JSON.parse(val).url;
              } catch {
                return val;
              }
            }
            return typeof val === 'object' ? val.url : val;
          };

          const parseSocialLinks = (val) => {
            if (!val) return [];

            let raw = val;
            if (typeof raw === 'string') {
              try {
                raw = JSON.parse(raw);
              } catch {
                return [];
              }
            }

            if (!Array.isArray(raw)) return [];

            return raw
              .map((item) => ({
                platform: item?.platform || '',
                url: item?.url || ''
              }))
              .filter((item) => item.platform && item.url);
          };

          this.logo = getUrl(d.site_logo);
          this.favicon = getUrl(d.site_favicon);
          this.seo.ogImage = getUrl(d.seo_og_image);
          this.socialLinks = parseSocialLinks(d.social_links);

          this.loaded = true;
        } catch (e) {
          console.error('Failed to load site settings', e);
        } finally {
          this._fetchPromise = null;
        }
      })();

      return this._fetchPromise;
    },

    async updateBatch(settingsArray) {
      await api.patch('/settings', { settings: settingsArray });
      await this.fetch();
    },

    async updateMedia(key, file) {
      const fd = new FormData();
      fd.append('key', key);
      fd.append('file', file);
      await api.patch('/settings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await this.fetch();
    }
  }
});
