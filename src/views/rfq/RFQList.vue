<template>
  <div class="container-wide py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-black text-foreground">{{ t('rfq.title') }}</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ t('rfq.subtitle') }}</p>
      </div>
      <router-link to="/rfq/post" class="btn-secondary font-bold">
        <PlusCircle class="w-4 h-4" />
        {{ t('rfq.postRfq') }}
      </router-link>
    </div>

    <!-- Skeleton -->
    <div v-if="rfqStore.loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="card skeleton h-28 rounded-2xl" />
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="!rfqStore.rfqs.length"
      :title="t('rfq.noRfqs')"
      :description="t('rfq.noRfqsDesc')"
      :icon="FileText"
    >
      <router-link to="/rfq/post" class="btn-secondary btn-sm mt-2">{{ t('rfq.postRfq') }}</router-link>
    </EmptyState>

    <!-- RFQ Cards -->
    <div v-else class="space-y-4">
      <router-link
        v-for="rfq in rfqStore.rfqs"
        :key="rfq.id"
        :to="`/rfq/${rfq.id}`"
        class="card-hover p-5 block"
      >
        <div class="flex flex-col sm:flex-row sm:items-start gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="badge-secondary text-[10px] font-bold uppercase px-2 py-0.5">{{ rfq.category }}</span>
              <span :class="statusBadge(rfq.status)">{{ t(`rfq.status${rfq.status}`) }}</span>
            </div>
            <h3 class="font-bold text-foreground mb-1 truncate">{{ rfq.title || rfq.description }}</h3>
            <div class="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span class="flex items-center gap-1"><Package class="w-3.5 h-3.5" />{{ rfq.quantity }} {{ t('products.pieces') }}</span>
              <span class="flex items-center gap-1"><Clock class="w-3.5 h-3.5" />{{ formatDate(rfq.deadline) }}</span>
              <span class="flex items-center gap-1"><User class="w-3.5 h-3.5" />{{ rfq.buyer?.full_name || rfq.user?.full_name }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <div class="text-center">
              <p class="text-lg font-black text-secondary">{{ rfq._count?.offers || rfq.offers_count || 0 }}</p>
              <p class="text-[10px] text-muted-foreground font-medium uppercase">{{ t('rfq.offers') }}</p>
            </div>
            <ChevronRight class="w-5 h-5 text-muted-foreground/40 rtl:rotate-180" />
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { PlusCircle, FileText, Package, Clock, User, ChevronRight } from 'lucide-vue-next';
import { useRfqStore } from '@/stores/rfqStore';
import EmptyState from '@/components/ui/EmptyState.vue';
import { useSeo } from '@/composables/useSeo';

const { t, locale } = useI18n();
const rfqStore = useRfqStore();

useSeo(() => ({
  title: t('rfq.title'),
  description: t('rfq.subtitle'),
  canonical: '/rfq',
  ogType: 'website',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('rfq.title'),
      description: t('rfq.subtitle'),
      url: `${window.location.origin}/rfq`
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
          name: t('rfq.title'),
          item: `${window.location.origin}/rfq`
        }
      ]
    }
  ]
}));

const statusBadge = (s) => ({
  OPEN:   'badge badge-success',
  CLOSED: 'badge badge-muted',
  FILLED: 'badge badge-secondary',
}[s] || 'badge-muted');

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

onMounted(() => rfqStore.fetchPublicRfqs());
</script>
