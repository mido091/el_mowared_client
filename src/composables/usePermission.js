import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

/**
 * RBAC Permission Mapping
 * Defines which roles have which granular permissions.
 */
const ROLE_PERMISSIONS = {
  owner: ['*'], // God mode
  admin: [
    'moderate_products',
    'verify_vendors',
    'moderate_rfqs',
    'view_vendor_queue',
  ],
  mowared: [
    'manage_products',
    'manage_orders',
    'view_wallet',
    'respond_rfq',
    'chat'
  ],
  user: [
    'view_orders',
    'post_rfq',
    'chat',
    'manage_profile'
  ]
};

export function usePermission() {
  const authStore = useAuthStore();

  const userRole = computed(() => authStore.user?.role?.toLowerCase() || 'guest');

  /**
   * Check if user has a specific role
   * @param {string} role 
   */
  const is = (role) => {
    return userRole.value === role.toLowerCase();
  };

  /**
   * Check if user has a specific permission
   * @param {string} permission 
   */
  const can = (permission) => {
    if (is('owner')) return true;
    
    const permissions = ROLE_PERMISSIONS[userRole.value] || [];
    return permissions.includes(permission) || permissions.includes('*');
  };

  /**
   * Check if user has any of the provided roles
   * @param {string[]} roles 
   */
  const hasAnyRole = (roles) => {
    return roles.map(r => r.toLowerCase()).includes(userRole.value);
  };

  /**
   * Check route-level access requirements.
   * Empty role lists are considered public.
   * @param {string[]} roles
   */
  const hasAccessTo = (roles = []) => {
    if (!Array.isArray(roles) || roles.length === 0) return true;
    if (!authStore.isAuthenticated) return false;
    return hasAnyRole(roles);
  };

  return {
    userRole,
    is,
    can,
    hasAnyRole,
    hasAccessTo,
    isAdmin: computed(() => is('admin') || is('owner')),
    isOwner: computed(() => is('owner')),
    isVendor: computed(() => is('mowared')),
  };
}
