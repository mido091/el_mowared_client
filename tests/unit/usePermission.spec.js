import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => mockAuth),
}));

let mockAuth = { isAuthenticated: true, user: { role: 'user' } };
let usePermission;

beforeEach(async () => {
  setActivePinia(createPinia());
  mockAuth = { isAuthenticated: true, user: { role: 'user' } };
  const mod = await import('@/composables/usePermission');
  usePermission = mod.usePermission;
});

describe('usePermission composable', () => {
  it('allows owner to do everything', () => {
    mockAuth.user = { role: 'owner' };
    const { can } = usePermission();
    expect(can('manage_products')).toBe(true);
    expect(can('verify_vendors')).toBe(true);
    expect(can('post_rfq')).toBe(true);
  });

  it('allows mowared to use current vendor permissions', () => {
    mockAuth.user = { role: 'mowared' };
    const { can, isVendor } = usePermission();
    expect(can('manage_products')).toBe(true);
    expect(can('respond_rfq')).toBe(true);
    expect(can('view_wallet')).toBe(true);
    expect(can('chat')).toBe(true);
    expect(isVendor.value).toBe(true);
  });

  it('blocks mowared from admin permissions', () => {
    mockAuth.user = { role: 'mowared' };
    const { can } = usePermission();
    expect(can('verify_vendors')).toBe(false);
    expect(can('moderate_products')).toBe(false);
  });

  it('allows user to use current buyer permissions', () => {
    mockAuth.user = { role: 'user' };
    const { can } = usePermission();
    expect(can('post_rfq')).toBe(true);
    expect(can('view_orders')).toBe(true);
    expect(can('chat')).toBe(true);
    expect(can('manage_profile')).toBe(true);
  });

  it('blocks user from vendor/admin actions', () => {
    mockAuth.user = { role: 'user' };
    const { can } = usePermission();
    expect(can('manage_products')).toBe(false);
    expect(can('verify_vendors')).toBe(false);
  });

  it('correctly identifies role', () => {
    mockAuth.user = { role: 'admin' };
    const { is, isAdmin, isOwner } = usePermission();
    expect(is('admin')).toBe(true);
    expect(is('user')).toBe(false);
    expect(isAdmin.value).toBe(true);
    expect(isOwner.value).toBe(false);
  });

  it('hasAccessTo returns true for public routes', () => {
    const { hasAccessTo } = usePermission();
    expect(hasAccessTo([])).toBe(true);
  });

  it('hasAccessTo returns false for unauthenticated users on restricted routes', () => {
    mockAuth.isAuthenticated = false;
    mockAuth.user = null;
    const { hasAccessTo } = usePermission();
    expect(hasAccessTo(['mowared', 'admin'])).toBe(false);
  });

  it('hasAccessTo matches allowed roles for authenticated users', () => {
    mockAuth.user = { role: 'admin' };
    const { hasAccessTo } = usePermission();
    expect(hasAccessTo(['mowared', 'admin'])).toBe(true);
    expect(hasAccessTo(['user'])).toBe(false);
  });
});
