import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import i18n from './locales';
import App from './App.vue';
import './style.css';

// The entry file only wires global plugins. Feature initialization happens inside App.vue
// so route-aware services and stores are created after the app context exists.
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

app.mount('#app');
