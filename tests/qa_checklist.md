# Manual QA Checklist - Elmowared Enterprise

## 1. Authentication & Session
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (check error message)
- [ ] Register new user (check validation)
- [ ] Logout (check session destruction and socket disconnect)
- [ ] Browser Refresh (check session restore/persistence)

## 2. Role-Based Access Control (RBAC)
- [ ] User accessing Admin dashboard (should redirect to User dashboard)
- [ ] Guest accessing User dashboard (should redirect to Login)
- [ ] Vendor accessing Admin logs (should be blocked)
- [ ] Check UI Visibility: Marketer specific links hidden for regular Users

## 3. Global Navigation & i18n
- [ ] Switch to Arabic (check RTL layout, font Cairo)
- [ ] Switch to English (check LTR layout, font Inter)
- [ ] MegaMenu functionality (Open/Close/Navigation)
- [ ] Breadcrumbs accuracy on deep routes (e.g., Dashboard -> Product Management)

## 4. B2B Core Features
- [ ] Product Search & Filtering (Debounce check)
- [ ] RFQ Posting (Validation & Sanitization check)
- [ ] Vendor Wallet: Transaction history display
- [ ] Real-time Toasts: Verify Socket.io alerts reflect on UI

## 5. UI Safety & Resilience
- [ ] Force API Error (check `errorHandler.js` and Toast feedback)
- [ ] Check Empty States: Empty search result, Empty cart, Empty logs
- [ ] Verify Loading States: Skeleton loaders during product fetch
- [ ] 404 Page (check `PageError.vue` layout and recovery buttons)

## 6. Performance & Responsiveness
- [ ] Mobile navigation (check toggle menu)
- [ ] Tablet layout (check grid columns)
- [ ] Lighthouse Audit: Score check for Performance/A11Y/SEO
