<template>
  <div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
      <div class="space-y-2">
        <h1 class="text-4xl font-black tracking-tight text-foreground uppercase">
          {{ t('vendor.quick_replies') }}
        </h1>
        <p class="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
          {{ labels.subtitle }}
        </p>
      </div>
      <button
        @click="openModal()"
        class="btn-primary flex h-14 items-center gap-3 rounded-2xl px-8 font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
      >
        <PlusCircle class="h-5 w-5" />
        {{ labels.newTemplate }}
      </button>
    </div>

    <div class="custom-scrollbar flex gap-4 overflow-x-auto pb-4">
      <button
        v-for="cat in categoryTabs"
        :key="cat"
        @click="activeCategory = cat"
        :class="[
          'shrink-0 h-12 rounded-xl border px-8 text-[10px] font-black uppercase tracking-widest transition-all',
          activeCategory === cat
            ? 'border-primary/30 bg-card text-foreground shadow-md'
            : 'border-border/50 bg-muted/10 text-muted-foreground hover:bg-muted/20'
        ]"
      >
        {{ cat === 'All' ? labels.all : translateCategory(cat) }}
      </button>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="reply in filteredReplies"
        :key="reply.id"
        class="group relative flex flex-col space-y-6 overflow-hidden rounded-[2.5rem] border border-border/50 bg-card p-8 shadow-sm transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
      >
        <div class="flex items-center justify-between">
          <span :class="['rounded-lg px-3 py-1 text-[8px] font-black uppercase tracking-widest', getCategoryClass(reply.category)]">
            {{ translateCategory(reply.category) }}
          </span>
          <div class="flex gap-2">
            <button @click="openModal(reply)" class="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary">
              <Pencil class="h-4 w-4" />
            </button>
            <button @click="removeReply(reply.id)" class="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-red-500/5 hover:text-red-500">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="flex-1 space-y-4">
          <h3 class="text-xl font-black italic uppercase tracking-tight text-foreground">{{ reply.title }}</h3>
          <p class="line-clamp-4 text-sm font-medium italic leading-relaxed text-muted-foreground">
            {{ reply.content }}
          </p>
        </div>

        <div class="flex items-center justify-between border-t border-border/50 pt-6">
          <div class="flex items-center gap-2">
            <Zap class="h-3.5 w-3.5 text-primary" />
            <span class="text-[8px] font-black uppercase tracking-widest opacity-40">{{ labels.variableReady }}</span>
          </div>
          <button class="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
            {{ labels.usedInChat }}
          </button>
        </div>
      </div>
    </div>

    <BaseModal v-model="showModal" :title="editingReply ? labels.editTitle : labels.createTitle" size="lg">
      <form @submit.prevent="saveReply" class="space-y-8 py-4">
        <div class="space-y-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="space-y-2">
              <label class="px-1 text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{{ labels.titleLabel }}</label>
              <input
                v-model="form.title"
                required
                :placeholder="labels.titlePlaceholder"
                class="h-14 w-full rounded-2xl border-border/50 bg-muted/20 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div class="space-y-2">
              <label class="px-1 text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{{ labels.categoryLabel }}</label>
              <select
                v-model="form.category"
                required
                class="h-14 w-full rounded-2xl border-border/50 bg-muted/20 px-5 text-[10px] font-black uppercase tracking-widest outline-none"
              >
                <option v-for="cat in repliesStore.categories" :key="cat" :value="cat">{{ translateCategory(cat) }}</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <div class="px-1">
              <label class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{{ labels.contentLabel }}</label>
            </div>
            <textarea
              v-model="form.content"
              rows="10"
              required
              :placeholder="labels.contentPlaceholder"
              class="w-full resize-none rounded-[2rem] border-border/50 bg-muted/20 p-8 text-sm font-medium italic leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end border-t border-border/50 pt-6">
          <button
            type="submit"
            class="h-14 rounded-2xl bg-primary px-12 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            {{ editingReply ? labels.update : labels.create }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Pencil, PlusCircle, Trash2, Zap } from 'lucide-vue-next';
import { useQuickRepliesStore } from '@/stores/quickRepliesStore';
import BaseModal from '@/components/ui/BaseModal.vue';

const { t, locale } = useI18n();
const repliesStore = useQuickRepliesStore();

const activeCategory = ref('All');
const showModal = ref(false);
const editingReply = ref(null);

const form = reactive({
  title: '',
  category: 'General',
  content: ''
});

const isArabic = computed(() => locale.value === 'ar');

const labels = computed(() => ({
  subtitle: isArabic.value
    ? `${repliesStore.replies.length} ردًا سريعًا جاهزًا للاستخدام داخل المحادثات المباشرة`
    : `${repliesStore.replies.length} quick replies ready for live chat use`,
  newTemplate: isArabic.value ? 'إضافة رد سريع' : 'New Quick Reply',
  all: isArabic.value ? 'الكل' : 'All',
  variableReady: isArabic.value ? 'جاهز للإدراج السريع داخل الشات' : 'Ready for quick chat insertion',
  usedInChat: isArabic.value ? 'يُستخدم في الشات' : 'Used in Chat',
  createTitle: isArabic.value ? 'إنشاء رد سريع جديد' : 'Create New Quick Reply',
  editTitle: isArabic.value ? 'تعديل الرد السريع' : 'Edit Quick Reply',
  titleLabel: isArabic.value ? 'عنوان الرد' : 'Reply Title',
  titlePlaceholder: isArabic.value ? 'مثال: رد بخصوص مدة الشحن' : 'e.g. Shipping timeline reply',
  categoryLabel: isArabic.value ? 'التصنيف' : 'Category',
  contentLabel: isArabic.value ? 'محتوى الرد' : 'Reply Content',
  contentPlaceholder: isArabic.value
    ? 'اكتب الرد الجاهز الذي تريد استخدامه في محادثات التاجر المباشرة...'
    : 'Write the reusable reply for live vendor chats...',
  update: isArabic.value ? 'حفظ التعديل' : 'Save Changes',
  create: isArabic.value ? 'إضافة الرد' : 'Add Reply'
}));

const categoryLabels = {
  Pricing: { ar: 'الأسعار', en: 'Pricing' },
  Shipping: { ar: 'الشحن', en: 'Shipping' },
  Technical: { ar: 'فني', en: 'Technical' },
  General: { ar: 'عام', en: 'General' },
  general: { ar: 'عام', en: 'General' }
};

const categoryTabs = computed(() => ['All', ...repliesStore.categories]);

const filteredReplies = computed(() => {
  if (activeCategory.value === 'All') return repliesStore.replies;
  return repliesStore.replies.filter((reply) => reply.category === activeCategory.value);
});

const translateCategory = (category) => {
  const label = categoryLabels[category];
  if (!label) return category;
  return isArabic.value ? label.ar : label.en;
};

const getCategoryClass = (cat) => {
  const map = {
    Pricing: 'border border-green-500/20 bg-green-500/10 text-green-500',
    Shipping: 'border border-blue-500/20 bg-blue-500/10 text-blue-500',
    Technical: 'border border-indigo-500/20 bg-indigo-500/10 text-indigo-500',
    General: 'border border-slate-500/20 bg-slate-500/10 text-slate-500',
    general: 'border border-slate-500/20 bg-slate-500/10 text-slate-500'
  };
  return map[cat] || map.General;
};

const openModal = (reply = null) => {
  editingReply.value = reply;
  if (reply) {
    Object.assign(form, reply);
  } else {
    Object.assign(form, { title: '', category: 'General', content: '' });
  }
  showModal.value = true;
};

const saveReply = async () => {
  await repliesStore.addReply({ ...form });
  showModal.value = false;
};

const removeReply = async (id) => {
  await repliesStore.deleteReply(id);
};

onMounted(repliesStore.fetchReplies);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border) / 0.5); border-radius: 20px; }
</style>
