<template>
  <footer class="bg-primary text-primary-foreground/80 mt-20">
    <div class="container-wide py-10 md:py-12">
      <div class="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-sm px-5 py-6 md:px-8 md:py-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] lg:items-start">
          <div class="space-y-5">
            <router-link to="/" class="inline-flex items-center gap-3 group max-w-full">
              <div class="h-12 min-w-12 px-3 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-[1.03] transition-transform">
                <AppImage
                  v-if="settingsStore.logo"
                  :src="settingsStore.logo"
                  :alt="settingsStore.siteName"
                  :width="96"
                  :height="32"
                  sizes="96px"
                  img-class="h-8 w-auto object-contain"
                />
                <span v-else class="text-primary font-black text-sm">
                  {{ brandInitials }}
                </span>
              </div>

              <div class="min-w-0">
                <p class="text-[11px] uppercase tracking-[0.28em] text-primary-foreground/45 font-black">
                  Elmowared
                </p>
                <h2 class="text-xl md:text-2xl font-black text-white tracking-tight truncate">
                  {{ settingsStore.siteName }}
                </h2>
              </div>
            </router-link>

            <p class="text-sm md:text-[15px] leading-7 text-primary-foreground/62 max-w-xl">
              {{ copy.platformPresence }}
            </p>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Share2 class="w-4 h-4 text-secondary" />
              </div>
              <div>
                <h3 class="text-sm font-black text-white">{{ copy.socialLinksTitle }}</h3>
                <p class="text-xs text-primary-foreground/50">{{ copy.socialLinksDesc }}</p>
              </div>
            </div>

            <div v-if="socials.length" class="flex flex-wrap items-center gap-3">
              <a
                v-for="social in socials"
                :key="`${social.platform}-${social.url}`"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-secondary/20 hover:border-secondary/40 transition-all"
              >
                <component :is="social.icon" class="w-4 h-4 text-secondary" />
                <span class="font-semibold">{{ social.label }}</span>
              </a>
            </div>

            <div
              v-else
              class="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-primary-foreground/45"
            >
              {{ copy.noSocialLinks }}
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                <BadgeCheck class="w-4 h-4 text-secondary" />
              </div>
              <div>
                <h3 class="text-sm font-black text-white">{{ copy.developedBy }}</h3>
                <p class="text-xs text-primary-foreground/50">{{ copy.developerNote }}</p>
              </div>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-3">
              <p class="text-base font-black text-white">Mido</p>
              <a
                href="tel:+201551683581"
                dir="ltr"
                class="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
              >
                <Phone class="w-4 h-4 text-secondary shrink-0" />
                <span>+201551683581</span>
              </a>
              <a
                href="mailto:midoproblems091@gmail.com"
                class="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-secondary transition-colors break-all"
              >
                <Mail class="w-4 h-4 text-secondary shrink-0" />
                <span>midoproblems091@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        <div class="mt-8 border-t border-white/10 pt-5">
          <div class="flex flex-col items-center justify-center gap-2 text-center md:flex-row md:gap-3">
            <p class="text-xs md:text-sm text-primary-foreground/45">
              {{ copyrightSymbol }} {{ currentYear }} {{ settingsStore.siteName }}. {{ t('footer.rights') }}
            </p>
            <router-link
              to="/about-us"
              class="text-xs font-bold text-white/75 transition-colors hover:text-secondary md:text-sm"
            >
              {{ copy.aboutLink }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import {
  BadgeCheck,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  Phone,
  Send,
  Share2,
  Twitter,
  Youtube
} from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';
import AppImage from '@/components/ui/AppImage.vue';

const { t, locale } = useI18n();
const settingsStore = useSettingsStore();

const socialIconMap = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  'x/twitter': Twitter,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Music2,
  whatsapp: MessageCircle,
  telegram: Send
};

const socialLabelMap = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  'x/twitter': 'X / Twitter',
  twitter: 'X / Twitter',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram'
};

const currentYear = new Date().getFullYear();
const copyrightSymbol = String.fromCharCode(169);

const copy = computed(() =>
  locale.value === 'ar'
    ? {
        platformPresence: 'ابقَ على اتصال بمنصة المورد عبر القنوات الرسمية التي يتم التحكم بها من إعدادات الموقع.',
        socialLinksTitle: 'روابط التواصل',
        socialLinksDesc: 'القنوات الرسمية التي تظهر داخل الفوتر.',
        noSocialLinks: 'لم تتم إضافة روابط تواصل اجتماعي بعد.',
        developedBy: 'تم التطوير بواسطة',
        developerNote: 'للتواصل التقني والدعم المباشر',
        aboutLink: 'ماذا عنا'
      }
    : {
        platformPresence: 'Stay connected with Elmowared through the official channels configured from your platform settings.',
        socialLinksTitle: 'Social Links',
        socialLinksDesc: 'Official platform channels displayed in the footer.',
        noSocialLinks: 'No social media links have been added yet.',
        developedBy: 'Developed by',
        developerNote: 'Technical support and implementation contact',
        aboutLink: 'About Us'
      }
);

const brandInitials = computed(() => {
  const name = (settingsStore.siteName || 'EL').trim();
  return name.substring(0, 2).toUpperCase();
});

const socials = computed(() =>
  (settingsStore.socialLinks || []).map((item) => {
    const key = (item.platform || '').toLowerCase();
    return {
      ...item,
      icon: socialIconMap[key] || Globe,
      label: socialLabelMap[key] || item.platform
    };
  })
);
</script>
