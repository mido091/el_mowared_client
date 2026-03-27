<template>
  <div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div class="space-y-2">
        <h1 class="text-4xl font-black text-foreground tracking-tight uppercase">
          {{ t('orders.management') }}
        </h1>
        <p class="text-muted-foreground text-sm font-black uppercase tracking-[0.2em] opacity-60">
          {{ ordersStore.pagination.total }} Active Contracts • Delivery Intelligence
        </p>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="relative group hidden lg:block">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            v-model="ordersStore.filters.search"
            type="text" 
            placeholder="Search Order ID or Buyer..." 
            class="bg-card border border-border/50 rounded-2xl ps-12 h-14 w-80 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            @input="debounceFetch"
          />
        </div>
        <button class="h-14 px-8 rounded-2xl bg-muted border border-border/50 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-muted-foreground/10 transition-all">
          <Download class="w-4 h-4" />
          {{ t('vendor.wallet_export') }}
        </button>
      </div>
    </div>

    <!-- Status Kanban Strip -->
    <div class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
      <button 
        v-for="status in statuses" 
        :key="status.value"
        @click="ordersStore.filters.status = status.value; fetch()"
        :class="[
          'shrink-0 h-16 px-8 rounded-2xl border transition-all flex items-center gap-4 relative overflow-hidden group',
          ordersStore.filters.status === status.value 
            ? 'bg-card border-primary/30 shadow-lg' 
            : 'bg-muted/10 border-border/50 text-muted-foreground hover:bg-muted/20'
        ]"
      >
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', status.colorClass]">
          <component :is="status.icon" class="w-5 h-5" />
        </div>
        <div class="text-left">
          <p class="text-[10px] font-black uppercase tracking-widest">{{ status.label }}</p>
          <p class="text-[8px] font-bold opacity-40 uppercase tracking-tighter">{{ status.desc }}</p>
        </div>
        <div v-if="ordersStore.filters.status === status.value" class="absolute inset-x-0 bottom-0 h-1 bg-primary"></div>
      </button>
    </div>

    <!-- Orders Feed -->
    <div v-if="ordersStore.loading" class="space-y-6">
      <div v-for="i in 3" :key="i" class="h-64 bg-muted/20 rounded-[2.5rem] animate-pulse"></div>
    </div>

    <div v-else-if="ordersStore.orders.length > 0" class="space-y-6">
      <div 
        v-for="order in ordersStore.orders" 
        :key="order.id"
        class="bg-card border border-border/50 rounded-[2.5rem] p-8 space-y-8 hover:border-primary/30 transition-all shadow-sm hover:shadow-2xl hover:shadow-primary/5 group"
      >
        <!-- Top Bar -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="flex items-center gap-6">
             <div class="w-16 h-16 rounded-[1.5rem] bg-muted flex items-center justify-center font-black text-xl border border-border shadow-inner">
                #{{ order.id.toString().slice(-3) }}
             </div>
             <div>
                <div class="flex items-center gap-3">
                   <h3 class="text-xl font-black text-foreground italic">{{ order.buyer_name || 'Strategic Partner' }}</h3>
                   <span :class="['px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest', getStatusClass(order.status)]">
                      {{ order.status }}
                   </span>
                </div>
                <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                   Placed on {{ formatDate(order.created_at) }} • Escrow Secured
                </p>
             </div>
          </div>
          
          <div class="flex items-center gap-8">
             <div class="text-start lg:text-end">
                <p class="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">Grand Total</p>
                <p class="text-2xl font-black text-foreground mt-1 tracking-tighter">${{ order.total_amount?.toLocaleString() }}</p>
             </div>
             <button @click="openOrder(order)" class="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95">
                <ChevronRight class="w-6 h-6" />
             </button>
          </div>
        </div>

        <!-- Progress Roadmap -->
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4 py-6 px-4 sm:px-10 bg-muted/20 rounded-3xl relative overflow-hidden">
           <div v-for="(milestone, idx) in milestones" :key="idx" class="relative z-10 flex flex-col items-center text-center gap-3">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500',
                isMilestoneActive(order.status, milestone.status) ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted border border-border text-muted-foreground opacity-30'
              ]">
                 <component :is="milestone.icon" class="w-5 h-5" />
              </div>
              <div class="hidden md:block">
                 <p class="text-[9px] font-black uppercase tracking-widest">{{ milestone.label }}</p>
              </div>
           </div>
           <!-- Connection Lines -->
           <div class="absolute top-11 left-16 right-16 h-0.5 bg-border/50 hidden md:block">
              <div class="h-full bg-primary transition-all duration-1000" :style="{ width: getProgressWidth(order.status) + '%' }"></div>
           </div>
        </div>

        <!-- Items Preview -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <div v-for="item in order.items?.slice(0, 4)" :key="item.id" class="flex items-center gap-4 bg-muted/10 p-4 rounded-2xl border border-border/30">
              <div class="w-14 h-14 rounded-xl bg-card border border-border/50 overflow-hidden shadow-inner">
                 <img :src="item.product?.image_url" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0">
                 <p class="text-[10px] font-black text-foreground truncate uppercase">{{ item.product?.name }}</p>
                 <p class="text-[9px] font-bold text-muted-foreground uppercase opacity-60 mt-0.5">Qty: {{ item.quantity }}</p>
              </div>
           </div>
           <div v-if="order.items?.length > 4" class="flex items-center justify-center p-4 bg-muted/10 rounded-2xl border border-dashed border-border/50">
              <p class="text-[10px] font-black text-muted-foreground uppercase">+{{ order.items.length - 4 }} More Items</p>
           </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-32 text-center rounded-[3rem] border-2 border-dashed border-border/50 bg-muted/10 flex flex-col items-center justify-center grayscale opacity-40">
       <ShoppingBag class="w-20 h-20 mb-6 text-muted-foreground" />
       <h3 class="text-xl font-black uppercase tracking-[0.3em]">No Active Contracts</h3>
       <p class="text-sm font-medium mt-2 max-w-sm">When buyers purchase your products or accept your offers, they will appear here for fulfillment.</p>
    </div>

    <!-- Timeline Detail Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 z-[100] flex justify-end">
       <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedOrder = null"></div>
       <div class="relative w-full max-w-xl bg-card h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
          <div class="p-8 border-b border-border/50 flex items-center justify-between bg-muted/20 shrink-0">
             <div>
                <span class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Order #{{ selectedOrder.id.toString().slice(-4) }}</span>
                <h3 class="text-2xl font-black text-foreground mt-2 italic">{{ selectedOrder.buyer_name || 'Strategic Partner' }}</h3>
             </div>
             <button @click="selectedOrder = null" class="w-10 h-10 bg-muted rounded-xl flex items-center justify-center hover:bg-muted-foreground/20 transition-all">
                <X class="w-5 h-5 text-muted-foreground" />
             </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
             <!-- Status Control (Vendor Only) -->
             <div class="space-y-4">
                <h4 class="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Update Status</h4>
                <div class="flex flex-wrap gap-2">
                   <button 
                     v-for="st in availableStatuses" :key="st.value"
                     @click="updateOrderStatus(st.value)"
                     :class="[
                       'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border outline-none',
                       selectedOrder.status === st.value ? getStatusClass(st.value) + ' shadow-md scale-105' : 'bg-muted border-border/50 text-muted-foreground hover:bg-muted/80'
                     ]"
                     :disabled="selectedOrder.status === st.value"
                   >
                     {{ st.label }}
                   </button>
                </div>
             </div>

             <!-- Timeline Log -->
             <div class="space-y-6">
                <h4 class="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock class="w-4 h-4" /> Activity Timeline
                </h4>
                
                <div class="relative border-s-2 border-border/50 ms-3 space-y-6 pb-4">
                   <!-- Map timeline entries, if none fallback to order created -->
                   <div 
                     v-for="(log, i) in (selectedOrder.timeline || mockTimeline(selectedOrder))" 
                     :key="i"
                     class="relative ps-6"
                   >
                     <span class="absolute -start-[11px] top-1 w-5 h-5 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                        <span class="w-2 h-2 rounded-full bg-primary animate-pulse" v-if="i === 0"></span>
                     </span>
                     <div>
                        <p class="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">{{ new Date(log.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) }}</p>
                        <p class="text-sm font-bold text-foreground">Status changed to <span :class="getStatusClass(log.status) + ' px-1.5 py-0.5 rounded-md ms-1 text-[9px] uppercase'">{{ log.status }}</span></p>
                        <p class="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">{{ log.desc || `Order status updated to ${log.status}` }}</p>
                     </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  ShoppingBag, Clock, Package, Truck, 
  CheckCircle2, Search, Download, ChevronRight, 
  Settings2, Activity, Zap, FileText, FileSignature, Handshake, Users, X
} from 'lucide-vue-next';
import { useVendorOrdersStore } from '@/stores/vendorOrdersStore';
import { useUiStore } from '@/stores/ui';

const { t, locale } = useI18n();
const ordersStore = useVendorOrdersStore();
const uiStore = useUiStore();

const selectedOrder = ref(null);

const statuses = [
  { label: 'All', value: '', icon: Activity, colorClass: 'bg-primary/10 text-primary', desc: 'Portfolio' },
  { label: 'New', value: 'new', icon: Zap, colorClass: 'bg-pink-500/10 text-pink-500', desc: 'Inquiry' },
  { label: 'Negotiating', value: 'negotiating', icon: Users, colorClass: 'bg-purple-500/10 text-purple-500', desc: 'Chat' },
  { label: 'Agreed', value: 'agreed', icon: Handshake, colorClass: 'bg-amber-500/10 text-amber-500', desc: 'Confirmed' },
  { label: 'Preparing', value: 'preparing', icon: Package, colorClass: 'bg-blue-500/10 text-blue-500', desc: 'Production' },
  { label: 'Shipped', value: 'shipped', icon: Truck, colorClass: 'bg-indigo-500/10 text-indigo-500', desc: 'Transit' },
  { label: 'Completed', value: 'completed', icon: CheckCircle2, colorClass: 'bg-green-500/10 text-green-500', desc: 'Fulfilled' },
];

const availableStatuses = computed(() => statuses.filter(s => s.value !== ''));

const milestones = [
  { label: 'New', status: 'new', icon: Zap },
  { label: 'Chat', status: 'negotiating', icon: Users },
  { label: 'Agreed', status: 'agreed', icon: Handshake },
  { label: 'Prep', status: 'preparing', icon: Package },
  { label: 'Shipped', status: 'shipped', icon: Truck },
  { label: 'Done', status: 'completed', icon: CheckCircle2 },
];

const openOrder = (order) => {
  selectedOrder.value = order;
};

const updateOrderStatus = async (newStatus) => {
  if(!selectedOrder.value) return;
  // This would hit an API update endpoint via store
  selectedOrder.value.status = newStatus;
  
  if(!selectedOrder.value.timeline) {
    selectedOrder.value.timeline = mockTimeline(selectedOrder.value);
  }
  selectedOrder.value.timeline.unshift({
    status: newStatus,
    date: new Date().toISOString(),
    desc: 'Status manually updated by vendor'
  });
  uiStore.showToast('Order status updated to ' + newStatus, 'success');
};

const mockTimeline = (order) => {
  return [
    { status: order.status, date: new Date().toISOString(), desc: 'Current status recorded' },
    { status: 'new', date: order.created_at, desc: 'Order received into the system' }
  ];
};

const fetch = () => ordersStore.fetchVendorOrders();

const debounceFetch = () => {
  clearTimeout(this.timer);
  this.timer = setTimeout(fetch, 500);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

const getStatusClass = (status) => {
  const map = {
    new: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    negotiating: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    agreed: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    preparing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    shipped: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  };
  return map[status] || 'bg-muted text-muted-foreground border-border/50';
};

const statusOrder = ['new', 'negotiating', 'agreed', 'preparing', 'shipped', 'completed'];

const isMilestoneActive = (currentStatus, milestoneStatus) => {
  return statusOrder.indexOf(currentStatus) >= statusOrder.indexOf(milestoneStatus);
};

const getProgressWidth = (status) => {
  const idx = statusOrder.indexOf(status);
  if(idx === -1) return 0;
  return (idx / (statusOrder.length - 1)) * 100;
};

onMounted(fetch);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border) / 0.5); border-radius: 20px; }
</style>
