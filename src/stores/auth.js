import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiData } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';

export const useAuthStore = defineStore('auth', {
  state: () => {
    const user = JSON.parse(localStorage.getItem('user')) || null;
    if (user && user.profile_image_url && !user.avatar) {
      user.avatar = user.profile_image_url;
    }
    return {
      user,
      token: localStorage.getItem('token') || null,
      loading: false,
      error: null,
      errorCode: null,
      fieldErrors: {},
      success: false,
    };
  },
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isVendor: (state) => state.user?.role === 'mowared',
    isAdmin: (state) => ['admin', 'owner'].includes(state.user?.role),
    userName: (state) => (state.user?.first_name ? `${state.user.first_name} ${state.user.last_name}` : null) || state.user?.company_name || 'User',
  },
  
  actions: {
    async init() {
      if (this.token && !this.user) {
        await this.fetchMe();
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;
      this.errorCode = null;
      this.fieldErrors = {};
      try {
        const response = await api.post('/auth/login', credentials, { errorMode: 'inline', redirectOn401: false });
        const { user, token } = getApiData(response) || {};
        this.setUser(user, token);
        return user;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.errorCode = normalized.code || null;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async registerUser(userData) {
      this.loading = true;
      this.error = null;
      this.errorCode = null;
      this.fieldErrors = {};
      try {
        const response = await api.post('/auth/register/user', userData, { errorMode: 'inline' });
        return getApiData(response) || {};
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.errorCode = normalized.code || null;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async registerMowared(vendorData) {
      this.loading = true;
      this.error = null;
      this.errorCode = null;
      this.fieldErrors = {};
      try {
        const response = await api.post('/auth/register/mowared', vendorData, { errorMode: 'inline' });
        return getApiData(response) || {};
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.errorCode = normalized.code || null;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ──────────────────────────────────────────────
    // OTP & Verification Flows
    // ──────────────────────────────────────────────

    async verifyRegistrationOtp(email, otp) {
      this.loading = true;
      this.error = null;
      this.errorCode = null;
      this.fieldErrors = {};
      try {
        const response = await api.post('/auth/otp/verify-registration', { email, otp }, { errorMode: 'inline' });
        const payload = getApiData(response) || {};
        const { user, token } = payload;
        
        if (token && user) {
          this.setUser(user, token);
        }
        return payload;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.errorCode = normalized.code || null;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async verifyVendorOtp(email, otp) {
      this.loading = true;
      this.error = null;
      this.errorCode = null;
      this.fieldErrors = {};
      try {
        const response = await api.post('/auth/otp/verify-vendor', { email, otp }, { errorMode: 'inline' });
        return getApiData(response) || {};
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.errorCode = normalized.code || null;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async resendOtp(email, type) {
      try {
        const response = await api.post('/auth/otp/resend', { email, type });
        return response;
      } catch (err) {
        throw err;
      }
    },

    async forgotPassword(email) {
      this.loading = true;
      this.error = null;
      this.errorCode = null;
      this.fieldErrors = {};
      try {
        const response = await api.post('/auth/otp/forgot-password', { email }, { errorMode: 'inline' });
        return response;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.errorCode = normalized.code || null;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async verifyResetOtp(email, otp) {
      this.loading = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.post('/auth/otp/verify-reset', { email, otp }, { errorMode: 'inline' });
        return getApiData(response)?.resetToken || null;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async resetPassword(resetToken, newPassword) {
      this.loading = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.post('/auth/otp/reset-password', { resetToken, newPassword }, { errorMode: 'inline' });
        return response;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async cancelRegistration(email) {
      this.loading = true;
      this.error = null;
      this.fieldErrors = {};
      try {
        const response = await api.delete('/auth/registration/cancel', { data: { email }, errorMode: 'inline' });
        return response;
      } catch (err) {
        const normalized = normalizeError(err);
        this.error = normalized.message;
        this.fieldErrors = normalized.fields;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      this.loading = true;
      try {
        const response = await api.get('/auth/me');
        const user = getApiData(response)?.user || null;
        if (user) {
          this.user = user;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (err) {
        this.logout();
      } finally {
        this.loading = false;
      }
    },
    
    setUser(user, token) {
      if (user && user.profile_image_url && !user.avatar) {
        user.avatar = user.profile_image_url;
      }
      this.user = user;
      this.token = token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },

    updateAvatar(url) {
      if (this.user) {
        this.user.avatar = url;
        this.user.profile_image_url = url;
        localStorage.setItem('user', JSON.stringify(this.user));
      }
    },
    
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Use event instead of direct location to allow clean cleanup
      window.dispatchEvent(new CustomEvent('app:logout'));
      window.location.href = '/login';
    },
  }
});
