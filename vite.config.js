import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router') || id.includes('vue-i18n')) return 'framework';
            if (id.includes('@vueuse')) return 'vueuse';
            return 'vendor';
          }

          if (id.includes('/src/views/dashboard/admin/')) return 'admin';
          if (id.includes('/src/views/dashboard/vendor/')) return 'vendor-dashboard';
          if (id.includes('/src/views/dashboard/owner/')) return 'owner-dashboard';
          if (id.includes('/src/views/dashboard/user/') || id.includes('/src/views/dashboard/Profile.vue')) return 'user-dashboard';
          if (id.includes('/src/views/products/ProductDetail.vue')) return 'product-detail';
          if (id.includes('/src/views/products/ProductList.vue')) return 'product-list';
          if (id.includes('/src/views/products/Compare.vue')) return 'product-compare';
          if (id.includes('/src/views/vendor/')) return 'vendor-public';
          if (id.includes('/src/views/rfq/')) return 'rfq-public';
          if (id.includes('/src/views/Home.vue') || id.includes('/src/views/AboutUs.vue') || id.includes('/src/views/ContactUs.vue')) return 'marketing';
          if (id.includes('/src/locales/')) return 'i18n';
          return undefined;
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://el-mowared-server.vercel.app',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
  },
});
