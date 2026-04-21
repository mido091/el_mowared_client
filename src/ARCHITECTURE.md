# Frontend Architecture Guide

The frontend is a Vue 3 application organized around app shells, route-level views, Pinia stores, and reusable UI components.

Main structure:

- `main.js`: creates the Vue app and installs Pinia, Vue Router, and i18n.
- `App.vue`: top-level app shell. Chooses the active layout, applies direction/language changes, initializes global services, and mounts shared overlays.
- `router/index.js`: the navigation map plus route guards for auth, role checks, and dashboard redirects.
- `layouts/`: page shells (`MainLayout`, `AuthLayout`, `DashboardLayout`) that frame route views.
- `views/`: page-level features grouped by public pages, auth pages, and dashboard role.
- `stores/`: Pinia stores for domain state such as auth, products, chat, notifications, RFQs, and vendor/admin dashboards.
- `services/`: shared client integrations such as the Axios API client and socket/realtime wiring.
- `components/`: reusable UI blocks and feature-specific widgets.
- `composables/`: reusable composition functions for permissions, caching, uploads, SEO, and responsive behavior.
- `utils/`: formatting, error normalization, domain sync, scheduling, sanitization, and other low-level helpers.

Runtime flow:

1. `main.js` mounts the app.
2. `App.vue` selects the layout declared by the current route metadata.
3. Route views fetch and mutate state through Pinia stores.
4. Stores call `services/api.js`, which injects auth headers, locale, retry behavior, and normalized error handling.
5. Realtime/domain sync stores listen for backend events and invalidate stale cached data when relevant.

Important conventions:

- Route metadata drives layouts and guards (`requiresAuth`, `requiresRole`, `allowedRoles`, breadcrumbs).
- Stores hold async state (`loading`, `error`, `success`) so views can stay mostly declarative.
- Shared UI should live in `components/ui`; domain-specific widgets belong in domain folders.
- Business logic should prefer stores/composables over being repeated inside multiple views.
- User roles are normalized to lowercase in the client (`user`, `mowared`, `admin`, `owner`) for easier comparisons.

Good entry points for a new developer:

- Public catalog flow: `router/index.js` -> `views/products/*` -> `stores/products.js` -> `services/api.js`
- Authentication flow: `views/auth/*` -> `stores/auth.js` -> `/auth/*` backend endpoints
- Vendor dashboard flow: `layouts/DashboardLayout.vue` -> `views/dashboard/vendor/*` -> related vendor stores
- Realtime behavior: `App.vue`, `stores/notificationStore.js`, `stores/chat.js`, `stores/marketplaceRealtimeStore.js`
