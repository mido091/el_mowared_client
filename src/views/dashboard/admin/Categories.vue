<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-foreground uppercase tracking-tight">{{ t('admin.categories') }}</h1>
        <p class="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">Global Industry Hierarchy</p>
      </div>
      <BaseButton @click="openModal()" class="px-6 font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
        <Plus class="w-4 h-4 me-2" /> {{ t('admin.addCategory') }}
      </BaseButton>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card p-6 bg-primary/5 border-primary/20">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-primary/10 rounded-2xl text-primary">
            <LayoutGrid class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-tighter text-muted-foreground">{{ t('admin.totalCategories') }}</p>
            <h4 class="text-2xl font-black text-foreground">{{ categoryStore.adminCategories.length }}</h4>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Table -->
    <DataTable :columns="columns" :items="categoryStore.adminCategories" :loading="categoryStore.loading">
      <template #cell-name="{ item }">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-secondary border border-border/40 transition-colors group-hover:bg-secondary/10">
            <component :is="getIcon(item.icon)" class="w-5 h-5" />
          </div>
          <div>
            <p class="font-bold text-foreground">
              {{ locale === 'ar' ? (item.name_ar || item.nameAr) : (item.name_en || item.nameEn) }}
            </p>
            <p class="text-[10px] text-muted-foreground font-black tracking-widest uppercase">
              /{{ item.slug }}
            </p>
          </div>
        </div>
      </template>

      <template #cell-translations="{ item }">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-black bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">AR</span>
            <span class="text-xs font-bold text-foreground">{{ item.name_ar || item.nameAr }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-black bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">EN</span>
            <span class="text-xs font-bold text-foreground">{{ item.name_en || item.nameEn }}</span>
          </div>
        </div>
      </template>

      <template #cell-parent="{ item }">
        <div v-if="item.parent_id" class="flex items-center gap-2">
          <CornerDownRight class="w-3 h-3 text-muted-foreground/40" />
          <span class="text-xs font-bold text-secondary bg-secondary/5 px-2 py-1 rounded-lg border border-secondary/10">
            {{ getParentName(item.parent_id) }}
          </span>
        </div>
        <span v-else class="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">— Root</span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex gap-2 justify-end">
          <button @click="openModal(item)" class="p-2 hover:bg-muted text-muted-foreground hover:text-secondary rounded-lg transition-colors">
            <Edit class="w-4 h-4" />
          </button>
          <button @click="confirmDelete(item)" class="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <BaseModal 
      v-model="modalOpen" 
      :title="editingId ? t('admin.editCategory') : t('admin.addCategory')"
      size="lg"
    >
      <form @submit.prevent="saveCategory" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            v-model="form.nameAr"
            :label="t('admin.nameAr')"
            placeholder="مثال: الإلكترونيات"
            required
          />
          <BaseInput
            v-model="form.nameEn"
            :label="t('admin.nameEn')"
            placeholder="e.g., Electronics"
            required
          />
          <BaseInput
            v-model="form.slug"
            :label="t('admin.slug')"
            placeholder="electronics"
            required
            @input="form.slug = $event.target.value.toLowerCase().replace(/\s+/g, '-')"
          />
          <div class="space-y-2">
            <label class="form-label">{{ t('admin.parentCategory') }}</label>
            <select v-model="form.parentId" class="form-input">
              <option :value="null">None (Root Category)</option>
              <option v-for="cat in parentOptions" :key="cat.id" :value="cat.id">
                {{ locale === 'ar' ? cat.nameAr : cat.nameEn }}
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="form-label">{{ t('admin.icon') }}</label>
            <select v-model="form.icon" class="form-input">
              <option v-for="icon in iconOptions" :key="icon" :value="icon">{{ icon }}</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-border/40">
          <BaseButton type="button" variant="outline" @click="modalOpen = false">
            {{ t('common.cancel') }}
          </BaseButton>
          <BaseButton type="submit" :loading="saving">
            {{ editingId ? t('common.update') : t('common.create') }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { normalizeError } from '@/utils/errorHandler';
import { 
  Plus, Edit, Trash2, LayoutGrid, ShoppingBag, 
  Camera, Globe, Database, Cpu, PenTool, Shield, Smartphone,
  CornerDownRight
} from 'lucide-vue-next';
import api from '@/services/api';
import { useNotificationStore } from '@/stores/notificationStore';
import { useCategoryStore } from '@/stores/categoryStore';
import DataTable from '@/components/ui/DataTable.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useUiStore } from '@/stores/ui';

const { t, locale } = useI18n();
const uiStore = useUiStore();
const notificationStore = useNotificationStore();
const categoryStore = useCategoryStore();

const saving = ref(false);
const modalOpen = ref(false);
const editingId = ref(null);

const form = ref({
  nameAr: '',
  nameEn: '',
  slug: '',
  icon: 'default',
  parentId: null
});

const columns = [
  { key: 'name', label: t('admin.categoryName') },
  { key: 'parent', label: t('admin.parentCategory') },
  { key: 'translations', label: t('admin.translations') },
  { key: 'actions', label: '', class: 'w-24' }
];

const parentOptions = computed(() => {
  return categoryStore.adminCategories.filter(c => c.id !== editingId.value && !c.parent_id);
});

const getParentName = (parentId) => {
  const parent = categoryStore.adminCategories.find(c => c.id === parentId);
  return parent ? (locale.value === 'ar' ? parent.nameAr : parent.nameEn) : 'N/A';
};

const iconOptions = [
  'default', 'cctv', 'networking', 'data_centers', 'electronics', 
  'tools', 'security', 'it', 'zap', 'smartphone'
];

const iconMap = {
  'cctv': Camera,
  'networking': Globe,
  'data_centers': Database,
  'electronics': Cpu,
  'tools': PenTool,
  'security': Shield,
  'zap': LayoutGrid,
  'smartphone': Smartphone,
  'default': ShoppingBag
};

const getIcon = (name) => iconMap[name] || iconMap.default;

const fetchCategories = () => categoryStore.fetchCategories();

const openModal = (item = null) => {
  if (item) {
    editingId.value = item.id;
    form.value = {
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      slug: item.slug,
      icon: item.icon || 'default',
      parentId: item.parent_id
    };
  } else {
    editingId.value = null;
    form.value = { nameAr: '', nameEn: '', slug: '', icon: 'default', parentId: null };
  }
  modalOpen.value = true;
};

const saveCategory = async () => {
  saving.value = true;
  try {
    if (editingId.value) {
      await categoryStore.updateCategory(editingId.value, form.value);
      notificationStore.success(t('admin.categoryUpdated'));
    } else {
      await categoryStore.createCategory(form.value);
      notificationStore.success(t('admin.categoryCreated'));
    }
    modalOpen.value = false;
  } catch (err) {
    notificationStore.error(normalizeError(err).message);
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (item) => {
  if (await notificationStore.confirm(
    t('admin.confirmDeleteCategory'),
    'common.confirm'
  )) {
    try {
      await categoryStore.deleteCategory(item.id);
      notificationStore.success(t('admin.categoryDeleted'));
    } catch (err) {
      notificationStore.error('Failed to delete');
    }
  }
};

onMounted(fetchCategories);
</script>
