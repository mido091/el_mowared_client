<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-background/45 backdrop-blur-[1px]" @click="close"></div>

    <!-- Modal Content -->
    <div class="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      <!-- Header -->
      <div class="h-16 px-8 border-b border-border flex items-center justify-between bg-muted/30">
        <h3 class="text-sm font-black uppercase tracking-widest text-foreground">{{ t('admin.vendorDetail', 'Vendor Profile Review') }}</h3>
        <button @click="close" class="p-2 hover:bg-muted rounded-xl transition-colors">
          <X class="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <!-- Identity -->
        <div class="flex items-start gap-6">
          <div class="w-24 h-24 rounded-2xl bg-muted border-2 border-border/50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            <img v-if="vendor.logo || vendor.user?.profile_image_url || vendor.profile_image_url" :src="vendor.logo || vendor.user?.profile_image_url || vendor.profile_image_url" class="w-full h-full object-cover" />
            <Package v-else class="w-12 h-12 text-muted-foreground/30" />
          </div>
          <div class="flex-1 min-w-0">
             <div class="flex items-center gap-3 mb-2">
               <span :class="['badge-sm', vendor.verification_status === 'APPROVED' ? 'badge-success' : 'badge-warning']">
                 {{ vendor.verification_status }}
               </span>
               <span class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID: #{{ vendor.id }}</span>
             </div>
             <h2 class="text-2xl font-black text-foreground uppercase tracking-tight truncate">{{ vendor.company_name || vendor.company_name_en || vendor.company_name_ar }}</h2>
             <p class="text-xs font-bold text-muted-foreground mt-1">{{ vendor.address || vendor.location || t('vendor.noLocation', 'Location not set') }}</p>
          </div>
        </div>

        <!-- Comprehensive Details View -->
        <div class="space-y-8">
           <!-- Contact Info Grid -->
           <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-2xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                <span class="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{{ t('auth.firstName') }} & {{ t('auth.lastName') }}</span>
                <span class="text-sm font-bold text-foreground">
                  {{ vendor.first_name || vendor.rep_first_name || vendor.user?.first_name || '—' }} {{ vendor.last_name || vendor.rep_last_name || vendor.user?.last_name || '—' }}
                </span>
              </div>
              <div class="p-4 rounded-2xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                <span class="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{{ t('auth.email') }}</span>
                <span class="text-sm font-bold text-foreground">{{ vendor.email || vendor.rep_email || vendor.user?.email || '—' }}</span>
              </div>
              <div class="p-4 rounded-2xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                <span class="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{{ t('auth.phone') }}</span>
                <span class="text-sm font-bold text-foreground" dir="ltr" :class="locale==='ar'?'text-end':'text-start'">{{ vendor.phone || vendor.rep_phone || vendor.user?.phone || '—' }}</span>
              </div>
              <div class="p-4 rounded-2xl bg-muted/20 border border-border/50 flex flex-col gap-1">
                <span class="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{{ t('auth.address') }}</span>
                <span class="text-sm font-bold text-foreground">{{ vendor.address || vendor.location || '—' }}</span>
              </div>
           </div>

           <!-- Bio & Categories -->
           <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-4">
                 <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{{ t('vendor.about', 'Business Bio') }}</h4>
                 <div class="p-4 rounded-2xl bg-muted/30 border border-border/50 text-sm leading-relaxed text-foreground min-h-[100px]">
                   <p>{{ vendor.bio || (locale === 'ar' ? vendor.bio_ar : vendor.bio_en) || t('vendor.noBio') }}</p>
                 </div>
              </div>

              <div class="space-y-4">
                 <h4 class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{{ t('vendor.industries', 'Categories') }}</h4>
                 <div class="flex flex-wrap gap-2 p-4 rounded-2xl bg-muted/30 border border-border/50 min-h-[100px] content-start">
                   <span v-for="cat in vendor.categories" :key="cat.id" class="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase">
                      {{ locale === 'ar' ? (cat.name_ar || cat.name) : (cat.name_en || cat.name) }}
                   </span>
                   <p v-if="!vendor.categories?.length" class="text-xs text-muted-foreground italic">{{ t('vendor.noCategories', 'No categories assigned') }}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-6 px-8 border-t border-border bg-muted/30 flex justify-end gap-3">
        <button @click="$emit('delete', vendor.id)" class="btn-ghost text-destructive hover:bg-destructive/5 font-black uppercase tracking-widest text-[11px]">
          {{ t('common.delete', 'Delete') }}
        </button>
        <button v-if="vendor.verification_status !== 'REJECTED'" @click="$emit('reject', vendor.id)" class="btn-ghost text-destructive hover:bg-destructive/5 font-black uppercase tracking-widest text-[11px]">
          {{ t('common.reject') }}
        </button>
        <button v-if="vendor.verification_status !== 'APPROVED'" @click="$emit('verify', vendor.id)" class="btn-primary min-w-[140px] shadow-lg shadow-primary/20">
          <Check class="w-4 h-4 mr-2" />
          <span class="font-black uppercase tracking-widest text-xs">{{ t('common.verify', 'Verify Vendor') }}</span>
        </button>
        <button v-else disabled class="btn-primary opacity-50 border-none bg-green-500/10 text-green-600">
           <ShieldCheck class="w-4 h-4 mr-2" />
           <span class="font-black uppercase tracking-widest text-xs">{{ t('common.verified') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { X, Package, ShieldCheck, FileText, AlertCircle, Check } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  vendor: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'verify', 'reject', 'delete']);
const { t, locale } = useI18n();

const close = () => emit('close');
</script>
