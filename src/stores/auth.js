/**
 * @file auth.js
 * @description Pinia store for authentication state management.
 *
 * State persistence:
 *  - JWT token and user object are persisted in localStorage because the app
 *    uses Bearer token authentication (not HTTP-only cookies).
 *  - On page load, the state is hydrated from localStorage. If an in-memory
 *    user is missing but a token exists, `init()` calls /auth/me to restore it.
 *
 * Role enumeration (lowercase on the client):
 *  - 'user'    → Regular buyer
 *  - 'mowared' → Vendor/Supplier
 *  - 'admin'   → Platform administrator
 *  - 'owner'   → Highest privilege (system owner)
 *
 * OTP flows supported:
 *  - Registration: User → OTP → account activated
 *  - Vendor registration: Vendor → OTP → pending admin approval
 *  - Password reset: Email → OTP → reset token → new password
 */

import { defineStore } from 'pinia';
import api from '@/services/api';
import { getApiData } from '@/utils/apiResponse';
import { normalizeError } from '@/utils/errorHandler';

// Auth state is persisted in localStorage because the app uses bearer tokens rather than cookie sessions.
export const useAuthStore = defineStore('auth', {
  state: () => {
    // Restore persisted session from localStorage on first load.
    const user = JSON.parse(localStorage.getItem('user')) || null;
    // Normalize avatar field for older records stored before the 'avatar' alias was introduced.
    if (user && user.profile_image_url && !user.avatar) {
      user.avatar = user.profile_image_url;
    }
    return {
      user,                                          // Full user object (null when logged out)
      token: localStorage.getItem('token') || null,  // JWT Bearer token
      loading: false,     // True while any auth API call is in flight
      error: null,        // Localized error message string (bilingual object)
      errorCode: null,    // Machine-readable error code (e.g. 'RATE_LIMITED')
      fieldErrors: {},    // Per-field validation errors from the backend
      success: false,     // Generic operation success flag
    };
  },
  
  getters: {
    /** True if a JWT token exists in state (does not validate expiry). */
    isAuthenticated: (state) => !!state.token,

    /** True if the logged-in user is a vendor (Mowared). */
    isVendor: (state) => state.user?.role === 'mowared',

    /** True if the logged-in user has admin or owner privileges. */
    isAdmin: (state) => ['admin', 'owner'].includes(state.user?.role),

    /**
     * Best-effort display name for the current user.
     * Preference: first+last > company_name > fallback 'User'.
     */
    userName: (state) => (state.user?.first_name ? `${state.user.first_name} ${state.user.last_name}` : null) || state.user?.company_name || 'User',
  },
  
  actions: {
    async init() {
      // Session restoration is intentionally lazy. We only hit /auth/me when a token exists
      // but the in-memory user object has not been rebuilt yet.
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
        
        // Buyers receive a token immediately after verification, while vendors may remain pending approval.
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
        // If the backend rejects the token, the frontend clears local state and returns to a clean login flow.
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
      // The logout event lets realtime/notification modules clean up subscriptions before navigation.
      window.dispatchEvent(new CustomEvent('app:logout'));
      window.location.href = '/login';
    },
  }
});
