<template>
  <div class="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all overflow-hidden">
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="bg-secondary/10 text-secondary text-[8px] font-black uppercase px-2 py-0.5 rounded border border-secondary/20">Quote #{{ id }}</span>
          <span class="text-[10px] font-bold text-muted-foreground italic transition-colors">Exp: {{ deadline }}</span>
        </div>
        <div class="flex items-center gap-1 text-xs font-black text-secondary">
          <FileCheck class="w-4 h-4" />
          VERIFIED
        </div>
      </div>

      <div class="flex items-start gap-4 py-2">
        <div class="w-16 h-16 rounded-xl bg-muted/10 border border-border flex-shrink-0 overflow-hidden">
          <img :src="productImage" class="w-full h-full object-cover" />
        </div>
        <div class="flex-grow min-w-0">
          <h4 class="font-bold text-sm text-foreground transition-colors truncate uppercase tracking-tight italic">{{ productName }}</h4>
          <p class="text-xs text-muted-foreground font-medium transition-colors">Qty: {{ quantity }} {{ unit }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-lg font-black text-foreground transition-colors">${{ price }}</span>
            <span class="text-[8px] font-bold text-muted-foreground transition-colors uppercase tracking-widest">Total: ${{ price * quantity }}</span>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-4 border-t border-border border-dashed flex items-center justify-between gap-3">
        <button class="flex-grow btn border-2 border-border text-[10px] font-black uppercase text-muted-foreground hover:border-secondary hover:text-secondary transition-all rounded-lg h-9 bg-muted/5">
          Reject
        </button>
        <button class="flex-grow btn btn-primary text-[10px] font-black uppercase shadow-lg shadow-primary/20 rounded-lg h-9">
          Accept Offer
        </button>
      </div>
      
      <p class="text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">10% Deposit: ${{ (price * quantity * 0.1).toFixed(2) }}</p>
    </div>
  </div>
</template>

<script setup>
import { FileCheck } from 'lucide-vue-next';

defineProps({
  id: String,
  productName: String,
  productImage: String,
  quantity: Number,
  unit: String,
  price: Number,
  deadline: String
});
</script>
