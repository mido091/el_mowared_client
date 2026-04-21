/**
 * @file router/index.js
 * @description Vue Router configuration for the Elmowared SPA.
 *
 * Route metadata conventions:
 *  - `layout`       – Which layout shell to wrap the view in (MainLayout | AuthLayout | DashboardLayout).
 *  - `requiresAuth` – Redirects anonymous users to /login, preserving target path in `redirect` query.
 *  - `guestOnly`    – Redirects authenticated users to their role dashboard (prevents /login double-visit).
 *  - `requiresRole` – Exact role required (e.g. 'mowared', 'owner', 'admin').
 *  - `allowedRoles` – Array of roles allowed (shared elevated-access routes like admin/owner).
 *  - `breadcrumb`   – i18n key used by the layout breadcrumb component.
 *
 * Navigation guard logic (beforeEach):
 *  1. Restore user from /auth/me if a token exists but in-memory user is null (page reload).
 *  2. Redirect authenticated users away from guest-only pages (e.g. /login, /register).
 *  3. Bounce anonymous users from protected routes to /login with redirect query param.
 *  4. Redirect buyer (USER) dashboard routes to /profile (buyers have no traditional dashboard).
 *  5. Enforce `allowedRoles` and `requiresRole` access guards with home-page fallback.
 *  6. Resolve /dashboard to the role-appropriate home screen.
 *
 * All routes use lazy-loading (()=> import()) for code-splitting and faster initial load.
 */

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Route metadata drives layout selection, auth checks, and role-aware dashboard access.
const routes = [
  // ── Public / Main ──────────────────────────────
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { layout: 'MainLayout' }
  },
  {
    path: '/contact-us',
    name: 'ContactUs',
    component: () => import('@/views/ContactUs.vue'),
    meta: { layout: 'MainLayout' }
  },
  {
    path: '/about-us',
    name: 'AboutUs',
    component: () => import('@/views/AboutUs.vue'),
    meta: { layout: 'MainLayout' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/products/ProductList.vue'),
    meta: { layout: 'MainLayout' }
  },
  {
    path: '/products/:slug-:id(\\d+)',
    name: 'ProductDetail',
    component: () => import('@/views/products/ProductDetail.vue'),
    meta: { layout: 'MainLayout' }
  },
  {
    path: '/products/:id(\\d+)',
    name: 'ProductDetailLegacy',
    component: () => import('@/views/products/ProductDetail.vue'),
    meta: { layout: 'MainLayout', legacyProductRoute: true }
  },
  {
    path: '/product/:id',
    redirect: (to) => `/products/${to.params.id}`
  },
  {
    path: '/compare',
    name: 'Compare',
    component: () => import('@/views/products/Compare.vue'),
    meta: { layout: 'MainLayout' }
  },
  {
    path: '/vendor/:id',
    name: 'VendorProfile',
    component: () => import('@/views/vendor/VendorProfile.vue'),
    meta: { layout: 'MainLayout' }
  },
  {
    path: '/rfq',
    name: 'RFQList',
    component: () => import('@/views/rfq/RFQList.vue'),
    meta: { layout: 'MainLayout' }
  },
  {
    path: '/rfq/post',
    name: 'PostRFQ',
    component: () => import('@/views/rfq/PostRFQ.vue'),
    meta: { layout: 'MainLayout', requiresAuth: true }
  },
  {
    path: '/rfq/:id',
    name: 'RFQDetail',
    component: () => import('@/views/rfq/RFQDetail.vue'),
    meta: { layout: 'MainLayout' }
  },

  // ── Auth ───────────────────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { layout: 'AuthLayout', guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { layout: 'AuthLayout', guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/ForgotPassword.vue'),
    meta: { layout: 'AuthLayout', guestOnly: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPassword.vue'),
    meta: { layout: 'AuthLayout', guestOnly: true }
  },

  // ── Cart & Orders ──────────────────────────────
  {
    path: '/cart',
    redirect: '/products'
  },
  {
    path: '/checkout',
    redirect: '/products'
  },
  {
    path: '/order-success',
    redirect: '/products'
  },

  // ── Chat ───────────────────────────────────────
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/Chat.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true }
  },

  // ── User Dashboard ─────────────────────────────
  {
    path: '/dashboard',
    redirect: (to) => {
      const authStore = useAuthStore();
      const role = authStore.user?.role?.toLowerCase();
      if (role === 'owner') return '/dashboard/owner';
      if (role === 'admin') return '/dashboard/admin';
      if (role === 'mowared') return '/dashboard/vendor';
      if (role === 'user') return '/profile';
      return '/';
    }
  },
  {
    path: '/dashboard/user',
    redirect: '/profile'
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/dashboard/Profile.vue'),
    meta: { layout: 'MainLayout', requiresAuth: true, breadcrumb: 'profile.my_profile' }
  },
  {
    path: '/dashboard/profile',
    name: 'Profile',
    component: () => import('@/views/dashboard/Profile.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, breadcrumb: 'profile.title' }
  },
  {
    path: '/dashboard/user/orders',
    redirect: '/profile?tab=orders'
  },
  {
    path: '/dashboard/user/rfqs',
    redirect: '/profile?tab=rfqs'
  },

  // ── Vendor Dashboard ───────────────────────────
  {
    path: '/dashboard/vendor',
    name: 'DashboardVendor',
    component: () => import('@/views/dashboard/vendor/Overview.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'nav.overview' }
  },
  {
    path: '/dashboard/vendor/products',
    name: 'DashboardVendorProducts',
    component: () => import('@/views/dashboard/vendor/Products.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'vendor.products' }
  },
  {
    path: '/dashboard/vendor/leads',
    name: 'DashboardVendorLeads',
    component: () => import('@/views/dashboard/vendor/LeadsCenter.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'rfq.leads_center' }
  },
  {
    path: '/dashboard/vendor/orders',
    name: 'DashboardVendorOrders',
    component: () => import('@/views/dashboard/vendor/Orders.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'common.orders' }
  },
  {
    path: '/dashboard/vendor/chat',
    name: 'DashboardVendorChat',
    component: () => import('@/views/Chat.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'chat.title' }
  },
  {
    path: '/dashboard/vendor/rfq-offers',
    name: 'DashboardVendorRFQOffers',
    component: () => import('@/views/dashboard/vendor/RFQOffers.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'rfq.offers' }
  },
  {
    path: '/dashboard/vendor/quick-replies',
    name: 'DashboardVendorQuickReplies',
    component: () => import('@/views/dashboard/vendor/QuickReplies.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'vendor.quick_replies' }
  },
  {
    path: '/dashboard/vendor/stock-alerts',
    name: 'DashboardVendorStockAlerts',
    component: () => import('@/views/dashboard/vendor/StockAlerts.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'vendor.stock_alerts' }
  },
  {
    path: '/dashboard/vendor/insights',
    name: 'DashboardVendorInsights',
    component: () => import('@/views/dashboard/vendor/MarketInsights.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'vendor.market_insights' }
  },
  {
    path: '/dashboard/vendor/profile',
    name: 'DashboardVendorProfile',
    component: () => import('@/views/dashboard/vendor/CompanyProfile.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'vendor.company_profile' }
  },
  {
    path: '/dashboard/vendor/verification',
    name: 'DashboardVendorVerification',
    component: () => import('@/views/dashboard/vendor/Verification.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'vendor.verification' }
  },
  {
    path: '/dashboard/vendor/wallet',
    name: 'DashboardVendorWallet',
    component: () => import('@/views/dashboard/vendor/Wallet.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'vendor.sales_review' }
  },
  {
    path: '/dashboard/vendor/industries',
    name: 'DashboardVendorIndustries',
    component: () => import('@/views/dashboard/vendor/IndustrySettings.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'mowared', breadcrumb: 'vendor.sections' }
  },

  // ── Admin Dashboard ────────────────────────────
  {
    path: '/dashboard/admin',
    name: 'DashboardAdmin',
    component: () => import('@/views/dashboard/admin/Overview.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, allowedRoles: ['admin', 'owner'] }
  },
  {
    path: '/dashboard/admin/vendors',
    name: 'DashboardAdminVendors',
    component: () => import('@/views/dashboard/admin/Vendors.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, allowedRoles: ['admin', 'owner'] }
  },
  {
    path: '/dashboard/admin/payments',
    name: 'DashboardAdminPayments',
    component: () => import('@/views/dashboard/admin/Payments.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'owner' }
  },
  {
    path: '/dashboard/admin/settings',
    name: 'DashboardAdminSettings',
    component: () => import('@/views/dashboard/admin/SiteSettings.vue'),
    meta: { layout: 'DashboardLayout' , requiresAuth: true, requiresRole: 'owner' }
  },
  {
    path: '/dashboard/admin/categories',
    name: 'DashboardAdminCategories',
    component: () => import('@/views/dashboard/admin/Categories.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, allowedRoles: ['admin', 'owner'] }
  },
  {
    path: '/dashboard/admin/rfq-moderation',
    name: 'DashboardAdminRfqModeration',
    component: () => import('@/views/dashboard/admin/RfqModeration.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, allowedRoles: ['admin', 'owner'] }
  },
  {
    path: '/dashboard/admin/products',
    name: 'DashboardAdminProducts',
    component: () => import('@/views/dashboard/admin/AdminProductReview.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, allowedRoles: ['admin', 'owner'], breadcrumb: 'admin.products.title' }
  },
  {
    path: '/dashboard/admin/reviews',
    name: 'DashboardAdminReviews',
    component: () => import('@/views/dashboard/admin/Reviews.vue'),
    meta: {
      layout: 'DashboardLayout',
      requiresAuth: true,
      allowedRoles: ['admin', 'owner'],
      breadcrumb: 'admin.reviews',
      breadcrumbText: {
        ar: 'مراجعة التقييمات',
        en: 'Reviews Moderation'
      }
    }
  },
  {
    path: '/dashboard/admin/analytics',
    name: 'DashboardAdminAnalytics',
    component: () => import('@/views/dashboard/admin/Analytics.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'owner' }
  },
  {
    path: '/dashboard/admin/contact-messages',
    name: 'DashboardAdminContactMessages',
    component: () => import('@/views/dashboard/admin/ContactMessages.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'owner' }
  },
  {
    path: '/dashboard/owner',
    name: 'DashboardOwner',
    component: () => import('@/views/dashboard/owner/Overview.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'owner' }
  },
  {
    path: '/dashboard/owner/logs',
    name: 'DashboardOwnerLogs',
    component: () => import('@/views/dashboard/owner/Logs.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'owner', breadcrumb: 'dashboard.owner.logs' }
  },
  {
    path: '/dashboard/owner/users',
    name: 'DashboardOwnerUsers',
    component: () => import('@/views/dashboard/owner/UserManagement.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'owner', breadcrumb: 'admin.userManagement' }
  },
  {
    path: '/dashboard/owner/settings',
    name: 'DashboardOwnerSettings',
    component: () => import('@/views/dashboard/owner/Settings.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, requiresRole: 'owner', breadcrumb: 'dashboard.owner.settings' }
  },
  {
    path: '/dashboard/owner/support-archives',
    redirect: '/dashboard/admin/contact-messages'
  },

  // ── Catch-all ──────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { layout: 'MainLayout' }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  }
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Restore the user profile when the page reloads with a persisted token.
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchMe();
    } catch (err) {
      console.error('Session restore failed', err);
    }
  }

  // 2. Guest-only (auth pages) — redirect if already logged in
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    const role = authStore.user?.role;
    if (role === 'mowared') return next({ name: 'DashboardVendor' });
    if (role === 'owner') return next({ name: 'DashboardOwner' });
    if (role === 'admin') return next({ name: 'DashboardAdmin' });
    if (role === 'user') return next({ name: 'UserProfile' });
    return next({ name: 'Home' });
  }

  // Protected routes bounce anonymous users to login and preserve the target path.
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // Buyers use a profile-centric experience rather than the vendor/admin dashboard shell.
  if (to.path.startsWith('/dashboard') && authStore.user?.role?.toLowerCase() === 'user') {
    return next({ name: 'UserProfile', query: to.query });
  }

  // `allowedRoles` is used for routes shared by multiple elevated roles.
  if (to.meta.allowedRoles) {
    const userRole = authStore.user?.role?.toLowerCase();
    const allowedRoles = to.meta.allowedRoles.map((role) => role.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return next({ name: 'Home' });
    }
  }

  if (to.meta.requiresRole) {
    const userRole = authStore.user?.role?.toLowerCase();
    const requiredRole = to.meta.requiresRole;

    // Owner/Admin are treated as elevated operators for management routes.
    const isPowerful = ['admin', 'owner'].includes(userRole);

    if (requiredRole === 'owner' && userRole !== 'owner') {
      return next({ name: 'Home' });
    }

    if (requiredRole === 'admin' && !isPowerful) {
      return next({ name: 'Home' });
    }

    if (requiredRole === 'mowared' && userRole !== 'mowared' && !isPowerful) {
      return next({ name: 'Home' });
    }
  }

  // Keep `/dashboard` as a friendly entry point that fans out to the correct role home.
  if (to.path === '/dashboard') {
    const role = authStore.user?.role;
    if (role === 'mowared') return next({ name: 'DashboardVendor' });
    if (role === 'owner') return next({ name: 'DashboardOwner' });
    if (role === 'admin') return next({ name: 'DashboardAdmin' });
    if (role === 'user') return next({ name: 'UserProfile' });
    return next({ name: 'Home' });
  }

  next();
});

export default router;
