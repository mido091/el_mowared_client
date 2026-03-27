<template>
  <div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Action Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div class="space-y-2">
        <h1 class="text-4xl font-black text-foreground tracking-tight uppercase">
          {{ t('vendor.stock_alerts') }}
        </h1>
        <p class="text-muted-foreground text-sm font-black uppercase tracking-[0.2em] opacity-60">
          {{ insightsStore.stockAlerts.length }} Critical Issues Detected • Catalog Health Center
        </p>
      </div>
      <button 
        @click="insightsStore.fetchStockAlerts"
        class="h-14 px-8 rounded-2xl bg-muted border border-border/50 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-muted-foreground/10 transition-all shadow-sm"
      >
        <RefreshCw :class="['w-4 h-4', insightsStore.loading ? 'animate-spin' : '']" />
        Force Audit
      </button>
    </div>

    <!-- Inventory Health Dashboard -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <!-- Main Alerts Feed -->
       <div class="lg:col-span-2 space-y-6">
          <div v-if="insightsStore.loading" class="space-y-4">
             <div v-for="i in 3" :key="i" class="h-32 bg-muted/20 animate-pulse rounded-[2.5rem]"></div>
          </div>
          <div v-else class="space-y-6">
             <div 
               v-for="alert in insightsStore.stockAlerts" 
               :key="alert.id"
               class="bg-card border border-border/50 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 hover:border-red-500/30 transition-all shadow-sm group relative"
             >
                <div :class="[
                  'w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 border-2',
                  alert.type === 'LOW_STOCK' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                ]">
                   <Package v-if="alert.type === 'LOW_STOCK'" class="w-10 h-10" />
                   <Clock v-else class="w-10 h-10" />
                </div>
                
                <div class="flex-1 min-w-0 text-center md:text-left">
                   <h3 class="text-xl font-black text-foreground uppercase tracking-tight italic">{{ alert.product_name }}</h3>
                   <div class="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-2">
                      <div class="flex items-center gap-2">
                         <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                         <span class="text-[10px] font-black uppercase tracking-widest text-red-500">Critical Status</span>
                      </div>
                      <span class="text-[10px] font-black text-muted-foreground uppercase opacity-40">
                         {{ alert.type === 'LOW_STOCK' ? `Current Stock: ${alert.current_stock}` : `Last Update: ${alert.last_updated}` }}
                      </span>
                   </div>
                </div>

                <div class="flex gap-2">
                   <button class="h-12 px-6 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                      {{ alert.type === 'LOW_STOCK' ? 'Replenish' : 'Refresh Catalog' }}
                   </button>
                   <button class="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 class="w-5 h-5" />
                   </button>
                </div>
             </div>
             
             <!-- Empty State -->
             <div v-if="insightsStore.stockAlerts.length === 0" class="py-24 text-center space-y-6 opacity-30 grayscale">
                <div class="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto shadow-inner">
                   <ShieldCheck class="w-12 h-12 text-primary" />
                </div>
                <h3 class="text-xl font-black uppercase tracking-[0.2em]">Inventory Healthy</h3>
                <p class="text-xs font-bold mt-2">No critical stock or catalog issues detected.</p>
             </div>
          </div>
       </div>

       <!-- Audit Summary Sidebar -->
       <div class="space-y-8">
          <div class="bg-card border border-border/50 rounded-[3rem] p-10 space-y-8 shadow-sm">
             <h2 class="text-xl font-black text-foreground tracking-tight uppercase italic flex items-center gap-3">
                <Activity class="w-6 h-6 text-primary" />
                Health Summary
             </h2>
             
             <div class="space-y-6">
                <div class="flex justify-between items-center py-4 border-b border-border/30">
                   <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catalog Vitality</span>
                   <span class="text-lg font-black text-green-500">98%</span>
                </div>
                <div class="flex justify-between items-center py-4 border-b border-border/30">
                   <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Low Stock Risk</span>
                   <span class="text-lg font-black text-red-500">02 Products</span>
                </div>
                <div class="flex justify-between items-center py-4">
                   <span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catalog Staleness</span>
                   <span class="text-lg font-black text-amber-500">01 Listing</span>
                </div>
             </div>
             
             <div class="pt-6">
                <div class="h-2 bg-muted rounded-full overflow-hidden">
                   <div class="h-full bg-primary" style="width: 85%"></div>
                </div>
                <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-3 opacity-50 text-center">Audit Coverage: 100% of Inventory</p>
             </div>
          </div>

          <div class="bg-primary p-10 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-primary/30 relative overflow-hidden group">
             <div class="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-500">
                <Zap class="w-8 h-8" />
             </div>
             <div class="space-y-2 relative z-10">
                <h3 class="text-xl font-black uppercase tracking-tight italic leading-tight">Proactive Catalog Management</h3>
                <p class="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                   Updating your listings every 30 days improves search ranking by up to 15%.
                </p>
             </div>
             <div class="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Package, Clock, RefreshCw, Trash2, ShieldCheck, 
  Activity, Zap, ArrowRight, AlertTriangle 
} from 'lucide-vue-next';
import { useInsightsStore } from '@/stores/insightsStore';

const { t } = useI18n();
const insightsStore = useInsightsStore();

onMounted(insightsStore.fetchStockAlerts);
</script>

<style scoped>
.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}
</style>
