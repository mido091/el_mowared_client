import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/services/api';

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: () => ({
    error: vi.fn(),
  }),
}));

// No need to mock axios deeply, we test the interceptors on the exported 'api' instance
describe('API Service Interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should inject Authorization token if present in localStorage', async () => {
    const token = 'test-token';
    localStorage.setItem('token', token);
    
    // We can't easily trigger the interceptor without a real request or by 
    // manually extracting it. Since api.interceptors.request.use is what 
    // registers it, let's verify if we can access the handlers.
    
    // In Axios, interceptors are stored in handlers array
    const handlers = api.interceptors.request.handlers;
    const authHandler = handlers.find(h => h.fulfilled && h.fulfilled.toString().includes('Authorization'));
    
    expect(authHandler).toBeDefined();
    
    const config = { headers: {} };
    const result = await authHandler.fulfilled(config);
    expect(result.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('should inject Accept-Language header based on localStorage', async () => {
    localStorage.setItem('locale', 'ar');
    const handlers = api.interceptors.request.handlers;
    const localeHandler = handlers.find(h => h.fulfilled && h.fulfilled.toString().includes('Accept-Language'));
    
    const config = { headers: {} };
    const result = await localeHandler.fulfilled(config);
    expect(result.headers['Accept-Language']).toBe('ar');
  });

  it('should handle 401 Unauthorized by clearing storage', async () => {
    // Mock window.location.href to prevent jsdom navigation side-effects
    const originalLocation = window.location;
    delete window.location;
    window.location = { pathname: '/dashboard', href: '' };

    const handlers = api.interceptors.response.handlers;
    const errorHandler = [...handlers]
      .reverse()
      .find((h) => h.rejected && h.rejected.toString().includes('localStorage.removeItem'))
      .rejected;

    const error = {
      response: { status: 401 },
      config: { url: '/test' },
      message: 'Unauthorized',
    };

    localStorage.setItem('token', 'old-token');
    localStorage.setItem('user', '{"id":1}');

    try {
      await errorHandler(error);
    } catch (e) {
      // Expected rejection
    }

    // Token is removed synchronously before the setTimeout redirect
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();

    // Restore
    window.location = originalLocation;
  });
});
