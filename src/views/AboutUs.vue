<template>
  <div class="min-h-screen bg-background text-foreground">
    <section class="relative overflow-hidden bg-secondary text-white">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(44,177,161,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />
      <div class="container-wide relative py-20 md:py-28 lg:py-32">
        <div class="mx-auto max-w-5xl text-center">
          <p class="mb-5 text-xs font-black uppercase tracking-[0.32em] text-white/60">
            {{ copy.heroEyebrow }}
          </p>
          <div class="mx-auto flex max-w-3xl flex-col items-center">
            <div class="flex min-h-[112px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.05] px-8 py-6 shadow-[0_24px_80px_-34px_rgba(0,0,0,0.45)] backdrop-blur-sm">
              <AppImage
                v-if="settingsStore.logo"
                :src="settingsStore.logo"
                :alt="siteName"
                :width="384"
                :height="96"
                sizes="(min-width: 1024px) 384px, 256px"
                img-class="h-16 w-auto object-contain md:h-20 lg:h-24"
              />
              <div v-else class="text-center">
                <p class="text-4xl font-black tracking-tight text-white md:text-5xl">
                  {{ siteName }}
                </p>
              </div>
            </div>

            <p class="mx-auto mt-8 max-w-3xl text-lg leading-9 text-white/78 md:text-[1.45rem]">
              {{ siteDescription }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-muted/55 py-16 md:py-20 lg:py-24">
      <div class="container-wide">
        <div class="mb-12 text-center md:mb-16">
          <h2 class="text-3xl font-black tracking-tight text-foreground md:text-4xl">
            {{ copy.whyTitle }}
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <article
            v-for="item in whyCards"
            :key="item.title"
            class="rounded-[2rem] border border-border bg-card px-7 py-9 text-center shadow-[0_24px_60px_-38px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-38px_rgba(15,23,42,0.34)] dark:shadow-[0_24px_60px_-38px_rgba(2,8,23,0.7)]"
          >
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <component :is="item.icon" class="h-7 w-7" />
            </div>
            <h3 class="mt-6 text-2xl font-black tracking-tight text-foreground">
              {{ item.title }}
            </h3>
            <p class="mt-4 text-lg leading-8 text-muted-foreground">
              {{ item.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="bg-card py-18 md:py-22 lg:py-24">
      <div class="container-wide">
        <div class="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-16">
          <div class="max-w-2xl">
            <h2 class="text-3xl font-black tracking-tight text-foreground md:text-5xl">
              {{ copy.marketTitle }}
            </h2>
            <p class="mt-6 max-w-xl text-xl leading-10 text-muted-foreground">
              {{ copy.marketDescription }}
            </p>
          </div>

          <div class="mx-auto w-full max-w-[500px] rounded-[2.25rem] border border-border bg-muted/65 p-6 shadow-[0_22px_70px_-36px_rgba(15,23,42,0.18)] dark:bg-muted/35 dark:shadow-[0_22px_70px_-36px_rgba(2,8,23,0.72)]">
            <svg viewBox="0 0 520 360" class="h-auto w-full">
              <rect x="0" y="0" width="520" height="360" rx="34" fill="transparent" />
              <path d="M108 95 167 80 198 122 187 198 120 212 92 145Z" fill="rgba(44,177,161,0.18)" />
              <path d="M214 108 292 76 360 116 404 180 381 245 307 257 236 188Z" fill="rgba(47,70,104,0.18)" />
              <path d="M386 150 430 144 454 178 416 199 386 182Z" fill="rgba(47,70,104,0.18)" />
              <path d="M118 146C180 150 230 158 295 171C349 180 390 184 420 185" fill="none" stroke="rgba(44,177,161,0.58)" stroke-width="2.5" stroke-dasharray="7 7" />

              <circle cx="151" cy="146" r="8" fill="rgb(44,177,161)" />
              <circle cx="305" cy="175" r="6.5" fill="rgb(47,70,104)" />
              <circle cx="394" cy="182" r="6.5" fill="rgb(47,70,104)" />
              <circle cx="231" cy="87" r="5.5" fill="rgb(44,177,161)" />

              <text x="129" y="185" font-size="22" fill="rgba(47,70,104,0.75)" font-weight="600">
                {{ copy.cityOne }}
              </text>
              <text x="288" y="210" font-size="22" fill="rgba(47,70,104,0.75)" font-weight="600">
                {{ copy.cityTwo }}
              </text>
              <text x="379" y="225" font-size="22" fill="rgba(47,70,104,0.75)" font-weight="600">
                {{ copy.cityThree }}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-primary py-16 text-white md:py-18 lg:py-20">
      <div class="container-wide">
        <div class="mx-auto max-w-4xl text-center">
          <h2 class="text-3xl font-black tracking-tight md:text-5xl">
            {{ copy.ctaTitle }}
          </h2>
          <p class="mt-5 text-lg leading-8 text-white/85 md:text-2xl">
            {{ copy.ctaSubtitle }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BarChart3, ShieldCheck, Zap } from 'lucide-vue-next';
import { useSettingsStore } from '@/stores/settings';
import { useSeo } from '@/composables/useSeo';
import AppImage from '@/components/ui/AppImage.vue';

const { locale } = useI18n();
const settingsStore = useSettingsStore();

const siteName = computed(() => settingsStore.siteName || 'Elmowared');
const siteDescription = computed(() =>
  locale.value === 'ar'
    ? settingsStore.siteDescriptionAr || 'منصة B2B ذكية تربط المشترين بالموردين وتبسط إدارة طلبات العروض ومقارنة الخيارات التجارية.'
    : settingsStore.siteDescriptionEn || 'A smart B2B platform that connects buyers with suppliers and simplifies RFQ management and offer comparison.'
);

const copy = computed(() =>
  locale.value === 'ar'
    ? {
        heroEyebrow: 'عن المنصة',
        whyTitle: `لماذا ${siteName.value}؟`,
        marketTitle: 'مصمم خصيصًا لسوق الشرق الأوسط',
        marketDescription: 'نجمع بين المشترين والموردين في تجربة B2B عملية تساعدك على إنشاء طلبات عروض، واستقبال عروض أسعار أسرع، ومقارنة الخيارات بثقة داخل منصة موثوقة ومنظمة.',
        ctaTitle: 'جاهز لتبسيط رحلة التوريد؟',
        ctaSubtitle: `تنضم مئات الشركات إلى ${siteName.value} لإدارة فرص التوريد بكفاءة أعلى ووضوح أكبر.`,
        cityOne: 'القاهرة',
        cityTwo: 'الرياض',
        cityThree: 'دبي'
      }
    : {
        heroEyebrow: 'About the Platform',
        whyTitle: `Why ${siteName.value}?`,
        marketTitle: 'Built for the Middle East Market',
        marketDescription: 'We bring buyers and suppliers together in a practical B2B flow that helps teams create RFQs, receive quotations faster, and compare offers with confidence in one trusted marketplace.',
        ctaTitle: 'Ready to simplify your procurement flow?',
        ctaSubtitle: `Hundreds of companies rely on ${siteName.value} to manage sourcing opportunities with more clarity and speed.`,
        cityOne: 'Cairo',
        cityTwo: 'Riyadh',
        cityThree: 'Dubai'
      }
);

const whyCards = computed(() =>
  locale.value === 'ar'
    ? [
        {
          icon: ShieldCheck,
          title: 'شبكة B2B موثوقة',
          description: 'تواصل مع موردين معتمدين في قطاع التيار الخفيف عبر تجربة مبنية على الثقة والاعتماد.'
        },
        {
          icon: Zap,
          title: 'تسعير أسرع',
          description: 'استقبل عروض أسعار تنافسية خلال ساعات بدلًا من انتظار أيام من المتابعات اليدوية.'
        },
        {
          icon: BarChart3,
          title: 'مقارنة ذكية',
          description: 'قارن العروض جنبًا إلى جنب داخل المنصة لاتخاذ قرار شراء أدق وأسرع.'
        }
      ]
    : [
        {
          icon: ShieldCheck,
          title: 'Trusted B2B Network',
          description: 'Connect with verified suppliers in the light current sector through a marketplace built on trust.'
        },
        {
          icon: Zap,
          title: 'Fast Quotation Process',
          description: 'Receive competitive quotations within hours instead of losing days in scattered follow-ups.'
        },
        {
          icon: BarChart3,
          title: 'Smart Comparison',
          description: 'Compare supplier offers side by side inside the platform to make faster sourcing decisions.'
        }
      ]
);

useSeo(() => ({
  title: locale.value === 'ar' ? `ماذا عنا | ${siteName.value}` : `About Us | ${siteName.value}`,
  description: siteDescription.value,
  canonical: '/about-us',
  image: settingsStore.logo || '',
  ogType: 'website',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName.value,
      description: siteDescription.value,
      url: `${window.location.origin}/about-us`,
      logo: settingsStore.logo || undefined
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale.value === 'ar' ? 'الرئيسية' : 'Home',
          item: `${window.location.origin}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: locale.value === 'ar' ? 'ماذا عنا' : 'About Us',
          item: `${window.location.origin}/about-us`
        }
      ]
    }
  ]
}));
</script>
