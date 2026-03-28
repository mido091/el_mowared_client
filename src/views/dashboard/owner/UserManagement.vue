<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-foreground uppercase tracking-tighter">{{ t('admin.userManagement', 'User Ecosystem') }}</h1>
        <p class="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em] mt-1 italic">{{ t('admin.user_subtitle') }}</p>
      </div>
      <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <button @click="openCreateModal" class="btn-primary btn-sm rounded-2xl shadow-lg shadow-primary/20 w-full sm:w-auto justify-center">
          <UserPlus class="w-4 h-4 me-2" />
          {{ t('admin.actions.add_user', 'Add New User') }}
        </button>
        <button @click="fetchUsers" class="btn-outline btn-sm rounded-2xl font-black uppercase tracking-widest text-[10px] w-full sm:w-auto justify-center">
          <RotateCcw class="w-4 h-4 me-2" />
          {{ t('common.refresh', 'Sync Directory') }}
        </button>
      </div>
    </div>

    <!-- Analytics Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in userStats" :key="stat.label" class="card p-6 border-l-4 shadow-sm" :class="stat.borderClass">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{{ t(stat.label) }}</p>
            <p class="text-2xl font-black text-foreground">{{ stat.value }}</p>
          </div>
          <component :is="stat.icon" class="w-8 h-8 opacity-20" :class="stat.textClass" />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-card border border-border rounded-3xl overflow-visible shadow-sm shadow-black/5">
      <!-- Controls Bar -->
      <div class="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-t-[calc(1.5rem-1px)]">
        <div class="flex min-w-0 items-center gap-4 flex-wrap">
          <!-- Batch Actions -->
          <Transition name="fade">
            <div v-if="selectedIds.length > 0" class="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl border border-primary/20">
              <span class="text-[10px] font-black text-primary uppercase tracking-widest">{{ selectedIds.length }} Selected</span>
              <div class="w-px h-4 bg-primary/20 mx-2"></div>
              <button @click="bulkStatus(true)" class="text-[10px] font-black uppercase text-green-600 hover:text-green-700">Activate</button>
              <button @click="bulkStatus(false)" class="text-[10px] font-black uppercase text-red-600 hover:text-red-700">Ban</button>
            </div>
          </Transition>

          <!-- Tabs (Users vs Logs) -->
          <div class="flex max-w-full gap-1 overflow-x-auto bg-background p-1 rounded-2xl border border-border/50 backdrop-blur-sm">
            <button 
              @click="activeTab = 'users'"
              :class="[
                'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                activeTab === 'users' ? 'bg-card text-primary shadow-lg shadow-black/5 ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
              ]"
            >
              {{ t('admin.allUsers', 'Active Directory') }}
            </button>
            <button 
              @click="activeTab = 'logs'"
              :class="[
                'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                activeTab === 'logs' ? 'bg-card text-primary shadow-lg shadow-black/5 ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
              ]"
            >
              {{ t('admin.adminLogs', 'Security Logs') }}
            </button>
          </div>
        </div>

        <!-- Role Filters (User Request: 5 Buttons) -->
        <div class="flex max-w-full flex-nowrap gap-2 overflow-x-auto items-center bg-background p-1.5 rounded-[1.5rem] border border-border/50 shadow-inner">
          <button 
            v-for="filter in ['ALL', ...roles]"
            :key="filter"
            @click="roleFilter = filter"
            :class="[
              'px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ring-1',
              roleFilter === filter 
                ? 'bg-primary text-white shadow-md shadow-primary/20 ring-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted ring-transparent'
            ]"
          >
            {{ filter === 'ALL' ? t('common.all', 'All Users') : t(`roles.${filter}`, filter) }}
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div v-if="activeTab === 'users'" class="animate-in fade-in duration-500">
        <DataTable 
          :columns="columns" 
          :items="filteredUsers" 
          :loading="loading" 
          :has-filters="true"
          mobile-breakpoint="(max-width: 1279px)"
          mobile-title-key="full_name"
          mobile-actions-key="actions"
          v-model:selected="selectedIds"
          selectable
          allow-overflow
        >
          <template #cell-full_name="{ item }">
             <div class="flex items-center gap-4 py-1">
                <div class="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center shadow-inner overflow-hidden">
                  <img v-if="item.profile_image_url" :src="item.profile_image_url" @error="item.profile_image_url = null" class="w-full h-full object-cover" />
                  <span v-else class="text-[10px] font-black text-muted-foreground uppercase">{{ item.first_name?.charAt(0) }}{{ item.last_name?.charAt(0) }}</span>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-foreground leading-tight text-sm">{{ item.first_name }} {{ item.last_name }}</span>
                    <span v-if="item.role === 'OWNER'" class="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-tighter shadow-sm ring-1 ring-amber-500/20">Owner</span>
                  </div>
                  <span class="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">{{ item.email }}</span>
                </div>
             </div>
          </template>
          
          <template #cell-role="{ item }">
             <div v-if="item.record_state !== 'DELETED'" class="relative inline-block" v-click-outside="() => activeRoleMenu = activeRoleMenu === item.id ? null : activeRoleMenu">
               <button 
                 @click.stop="activeRoleMenu = activeRoleMenu === item.id ? null : item.id"
                 class="flex items-center gap-2 bg-muted/50 border border-border/50 rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-widest text-foreground hover:bg-muted transition-all min-w-[110px] justify-between group"
                 :class="{ 'ring-2 ring-primary/20 border-primary/30': activeRoleMenu === item.id }"
               >
                 <span class="truncate">{{ item.role }}</span>
                 <ChevronDown class="w-3 h-3 text-muted-foreground transition-transform duration-300" :class="{ 'rotate-180 text-primary': activeRoleMenu === item.id }" />
               </button>

               <!-- Role Dropdown -->
               <Transition name="dropdown-pop">
                 <div v-if="activeRoleMenu === item.id" class="absolute z-50 mt-2 min-w-[160px] max-w-[calc(100vw-2rem)] start-0 sm:start-auto sm:end-0 bg-card border border-border/60 rounded-2xl shadow-luxury py-2 animate-in fade-in zoom-in-95 duration-200">
                   <button 
                     v-for="role in roles" 
                     :key="role"
                     @click="updateRole(item, role); activeRoleMenu = null"
                     class="w-full text-start px-4 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-between group/item"
                     :class="{ 'text-primary bg-primary/5': item.role === role }"
                   >
                     {{ role }}
                     <Check v-if="item.role === role" class="w-3 h-3 stroke-[3px]" />
                   </button>
                 </div>
               </Transition>
             </div>
             <span v-else class="inline-flex items-center rounded-xl border border-border bg-muted/50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
               {{ item.role }}
             </span>
          </template>

          <template #cell-record_state="{ item }">
             <div :class="[
               'inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
               item.record_state === 'DELETED'
                 ? 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                 : item.record_state === 'INACTIVE'
                   ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                   : 'bg-green-500/10 text-green-600 border border-green-500/20'
             ]">
               <span class="w-1.5 h-1.5 rounded-full me-2" :class="item.record_state === 'DELETED' ? 'bg-slate-500' : item.record_state === 'INACTIVE' ? 'bg-amber-600' : 'bg-green-600'"></span>
               {{ recordStateLabel(item) }}
             </div>
          </template>

          <template #cell-status="{ item }">
             <button
               v-if="item.record_state !== 'DELETED'"
               @click="toggleStatus(item)"
               :class="[
                 'inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                 item.is_active ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
               ]"
             >
               <span class="w-1.5 h-1.5 rounded-full me-2" :class="item.is_active ? 'bg-green-600' : 'bg-red-600'"></span>
               {{ item.is_active ? t('common.active') : t('common.inactive') }}
             </button>
             <span v-else class="inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-600 border border-slate-500/20">
               <span class="w-1.5 h-1.5 rounded-full me-2 bg-slate-500"></span>
               {{ locale === 'ar' ? 'غير متاح' : 'Unavailable' }}
             </span>
          </template>

          <template #cell-created_at="{ item }">
             <div class="flex flex-col">
               <span class="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{{ formatDate(item.created_at) }}</span>
               <span class="text-[9px] text-muted-foreground italic mt-0.5">{{ t('admin.joined') }}</span>
             </div>
          </template>

          <template #cell-actions="{ item }">
             <div class="flex justify-end relative" v-click-outside="() => activeActionsMenu = activeActionsMenu === item.id ? null : activeActionsMenu">
               <button 
                 @click.stop="activeActionsMenu = activeActionsMenu === item.id ? null : item.id"
                 class="p-2 hover:bg-primary/10 rounded-xl transition-all text-muted-foreground hover:text-primary group"
                 :class="{ 'bg-primary/10 text-primary scale-110 shadow-sm': activeActionsMenu === item.id }"
               >
                 <MoreHorizontal class="w-5 h-5 transition-transform duration-300" />
               </button>

               <!-- Actions Menu -->
               <Transition name="dropdown-pop">
                 <div v-if="activeActionsMenu === item.id" class="absolute top-full mt-2 min-w-[220px] max-w-[calc(100vw-2rem)] start-0 sm:start-auto sm:end-0 border border-border/60 rounded-2xl shadow-luxury py-2 z-[60] animate-in fade-in zoom-in-95 duration-200 backdrop-blur-md bg-card/95">
                   <router-link 
                      v-if="item.role === 'MOWARED' && item.vendor_profile_id"
                      :to="`/vendor/${item.vendor_profile_id}`" 
                      class="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <UserCircle class="w-4 h-4" />
                      {{ t('admin.actions.view_profile') }}
                    </router-link>

                   <button v-if="item.record_state !== 'DELETED'" @click="openEditModal(item); activeActionsMenu = null" class="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                     <UserCog class="w-4 h-4" />
                     {{ t('admin.actions.edit_user') }}
                   </button>
                   <button v-if="item.record_state !== 'DELETED'" @click="toggleStatus(item); activeActionsMenu = null" class="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors" :class="item.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'">
                     <Ban v-if="item.is_active" class="w-4 h-4" />
                     <CheckCircle v-else class="w-4 h-4" />
                     {{ item.is_active ? t('admin.actions.ban_account') : t('admin.actions.activate_account') }}
                   </button>
                   <div class="h-px bg-border/50 my-1 mx-2"></div>
                   <button @click="deleteUser(item); activeActionsMenu = null" class="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 transition-colors">
                     <Trash2 class="w-4 h-4" />
                     {{ item.record_state === 'DELETED' ? (locale === 'ar' ? 'حذف نهائي' : 'Purge permanently') : t('admin.actions.delete_permanently') }}
                   </button>
                   <div v-if="item.record_state === 'DELETED'" class="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                     {{ locale === 'ar' ? 'السجل محذوف بالفعل' : 'Record already deleted' }}
                   </div>
                 </div>
               </Transition>
             </div>
          </template>
        </DataTable>
      </div>

      <!-- Logs View -->
      <div v-else class="animate-in fade-in duration-500">
        <DataTable :columns="logColumns" :items="logs" :loading="logsLoading" :has-filters="false">
           <template #cell-admin="{ item }">
              <span class="text-xs font-bold text-foreground">{{ item.admin?.full_name || t('common.system') }}</span>
           </template>
           <template #cell-action="{ item }">
              <div class="flex items-center gap-3">
                 <ShieldAlert v-if="item.action.includes('Ban') || item.action.includes('Role')" class="w-4 h-4 text-amber-500" />
                 <Activity v-else class="w-4 h-4 text-primary" />
                 <span class="text-[10px] font-black uppercase tracking-widest text-foreground">{{ item.action }}</span>
              </div>
           </template>
           <template #cell-details="{ item }">
              <p class="text-[10px] text-muted-foreground font-medium italic">{{ item.details }}</p>
           </template>
           <template #cell-created_at="{ item }">
              <span class="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{{ formatDate(item.created_at) }}</span>
           </template>
        </DataTable>
      </div>
    </div>

    <!-- Edit User Dialog -->
    <BaseModal 
      v-model="isEditModalOpen"
      :title="t('admin.actions.edit_title')"
      size="md"
    >
      <div class="space-y-6 py-4">
        <p class="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black -mt-4 mb-6">{{ t('admin.actions.edit_subtitle') }}</p>
        
        <!-- Identity Section -->
        <div class="flex items-center gap-6">
          <div class="relative group">
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden" 
              accept="image/*"
              @change="handleImageUpload"
            />
            <div 
              @click="triggerImageUpload"
              class="w-24 h-24 rounded-[2rem] bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 cursor-pointer relative"
            >
              <img v-if="editingUser?.profile_image_url" :src="editingUser.profile_image_url" @error="editingUser.profile_image_url = null" class="w-full h-full object-cover transition-transform group-hover:scale-110" />
              <UserCircle v-else class="w-12 h-12 text-muted-foreground" />
              
              <div class="absolute inset-0 bg-black/10 flex items-center justify-center transition-all group-hover:bg-black/30">
                <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/20 group-hover:border-white/40 transition-all shadow-sm">
                  <Camera class="w-5 h-5 text-white/70 group-hover:text-white" />
                </div>
              </div>
    
              <div v-if="uploadingImage" class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                <div class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
          <div v-if="editingUser" class="flex-1 space-y-4">
             <div class="grid grid-cols-2 gap-4">
               <BaseInput v-model="editingUser.first_name" :label="t('auth.firstName')" :placeholder="t('auth.firstNamePlaceholder')" />
               <BaseInput v-model="editingUser.last_name" :label="t('auth.lastName')" :placeholder="t('auth.lastNamePlaceholder')" />
             </div>
          </div>
        </div>

        <div v-if="editingUser" class="space-y-4">
          <BaseInput v-model="editingUser.email" :label="t('auth.email')" :placeholder="t('auth.emailPlaceholder')" type="email" :icon="Mail" />
          <BaseInput v-model="editingUser.password" :label="t('auth.password')" :placeholder="t('auth.passwordPlaceholder')" type="password" :icon="ShieldCheck" />
          
          <div class="pt-2">
            <div class="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between group hover:border-primary/30 transition-colors">
              <div class="space-y-1">
                <p class="text-xs font-bold text-foreground">{{ t('admin.account_visibility') }}</p>
                <p class="text-[10px] text-muted-foreground leading-relaxed">{{ t('admin.account_visibility_desc') }}</p>
              </div>
              <button @click="editingUser.is_active = !editingUser.is_active" :class="['w-12 h-6 rounded-full transition-all relative', editingUser.is_active ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-muted border border-border']">
                <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm', editingUser.is_active ? 'translate-x-7' : 'translate-x-1']"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="ghost" @click="editingUser = null">{{ t('common.cancel') }}</BaseButton>
          <BaseButton variant="primary" @click="saveUserChanges" :loading="savingUser">{{ t('common.saveChanges') }}</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Create User Dialog -->
    <BaseModal 
      v-model="isCreateModalOpen"
      :title="t('admin.actions.add_user', 'Onboard New Identity')"
      size="md"
    >
      <div class="space-y-6 py-4">
        <p class="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black -mt-4 mb-6">Create a new system account with custom role and credentials</p>
        
        <div class="flex items-center gap-6">
          <div @click="triggerCreateImageUpload" class="w-24 h-24 rounded-[2rem] bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all hover:border-primary/50 cursor-pointer relative group">
            <img v-if="newUser.profileImageUrl" :src="newUser.profileImageUrl" @error="newUser.profileImageUrl = null" class="w-full h-full object-cover" />
            <UserPlus v-else class="w-12 h-12 text-muted-foreground opacity-50" />
            <div class="absolute inset-0 bg-black/5 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
              <Camera class="w-6 h-6 text-white" />
            </div>
            <input type="file" ref="createFileInput" class="hidden" accept="image/*" @change="handleCreateImageUpload" />
          </div>

          <div class="flex-1 grid grid-cols-2 gap-4">
             <BaseInput v-model="newUser.firstName" :label="t('auth.firstName')" placeholder="Amir" />
             <BaseInput v-model="newUser.lastName" :label="t('auth.lastName')" placeholder="Mahmoud" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput v-model="newUser.email" :label="t('auth.email')" :placeholder="t('auth.emailPlaceholder')" type="email" :icon="Mail" />
          <BaseInput v-model="newUser.phone" :label="t('auth.phone')" placeholder="+20..." type="tel" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput v-model="newUser.password" :label="t('auth.password')" :placeholder="t('auth.passwordPlaceholder')" type="password" :icon="ShieldCheck" />
          <ResponsiveSelect
            v-model="newUser.role"
            :label="t('common.role')"
            :options="roleOptions"
            :placeholder="t('common.role')"
            :sheet-title="t('common.role')"
            :sheet-kicker="locale === 'ar' ? 'إدارة المستخدمين' : 'User management'"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="ghost" @click="isCreateModalOpen = false">{{ t('common.cancel') }}</BaseButton>
          <BaseButton variant="primary" @click="createUser" :loading="creatingUser">{{ t('auth.register') }}</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { normalizeError } from '@/utils/errorHandler';
import { 
  ShieldAlert, Activity, UserCog, Ban, CheckCircle, 
  RotateCcw, Users, UserCheck, UserX, ShieldCheck,
  MoreHorizontal, ChevronDown, Check, Trash2, Camera, Mail, UserCircle,
  UserPlus
} from 'lucide-vue-next';
import api from '@/services/api';
import { getApiCollection } from '@/utils/apiResponse';
import { useUiStore } from '@/stores/ui';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAdminUsersStore } from '@/stores/adminUsersStore';
import DataTable from '@/components/ui/DataTable.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect.vue';

const { t, locale } = useI18n();
const uiStore = useUiStore();
const notificationStore = useNotificationStore();
const usersStore = useAdminUsersStore();
const { normalizedUsers: users, loading } = storeToRefs(usersStore);
const logsLoading = ref(false);
const logs = ref([]);
const activeTab = ref('users');
const selectedIds = ref([]);
const activeRoleMenu = ref(null);
const activeActionsMenu = ref(null);
const editingUser = ref(null);
const savingUser = ref(false);
const uploadingImage = ref(false);
const fileInput = ref(null);
const createFileInput = ref(null);

const roleFilter = ref('ALL');
const isCreateModalOpen = ref(false);
const creatingUser = ref(false);
const newUser = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'USER',
  profileImageUrl: ''
});

const isEditModalOpen = computed({
  get: () => !!editingUser.value,
  set: (val) => { if (!val) editingUser.value = null; }
});

const roles = ['USER', 'MOWARED', 'ADMIN', 'OWNER'];
const roleOptions = computed(() =>
  roles.map((role) => ({
    value: role,
    label: t(`roles.${role}`, role),
    description: locale.value === 'ar'
      ? {
          USER: 'حساب عميل عادي للتصفح والطلبات',
          MOWARED: 'حساب مورد لإدارة المنتجات والعروض',
          ADMIN: 'مشرف لإدارة العمليات اليومية',
          OWNER: 'مالك النظام بصلاحيات كاملة',
        }[role]
      : {
          USER: 'Standard customer account for browsing and requests',
          MOWARED: 'Supplier account for products and offers',
          ADMIN: 'Admin account for daily operations',
          OWNER: 'Full system owner permissions',
        }[role],
  }))
);

const filteredUsers = computed(() => {
  if (roleFilter.value === 'ALL') return users.value;
  return users.value.filter(u => u.role === roleFilter.value);
});

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};

const userStats = computed(() => [
  { label: 'admin.totalUsers', value: users.value.length, icon: Users, borderClass: 'border-l-primary', textClass: 'text-primary' },
  { label: 'admin.activeUsers', value: users.value.filter(u => u.record_state === 'ACTIVE').length, icon: UserCheck, borderClass: 'border-l-green-500', textClass: 'text-green-500' },
  { label: 'admin.bannedUsers', value: users.value.filter(u => u.record_state !== 'ACTIVE').length, icon: UserX, borderClass: 'border-l-red-500', textClass: 'text-red-500' },
  { label: 'admin.admins', value: users.value.filter(u => u.role === 'ADMIN' || u.role === 'OWNER').length, icon: ShieldCheck, borderClass: 'border-l-amber-500', textClass: 'text-amber-500' }
]);

const columns = [
  { key: 'full_name',  label: t('common.fullName') },
  { key: 'role',       label: t('common.role') },
  { key: 'record_state', label: t('common.status') },
  { key: 'status',     label: t('common.status') },
  { key: 'created_at', label: t('common.joinedAt') },
  { key: 'actions',    label: '', class: 'w-20' }
];

const logColumns = [
  { key: 'admin', label: t('admin.moderator') },
  { key: 'action', label: t('admin.action_taken') },
  { key: 'details', label: t('admin.context') },
  { key: 'created_at', label: t('admin.timestamp') }
];

const formatDate = (d) => new Date(d).toLocaleDateString();
const recordStateLabel = (user) => {
  switch (`${user.record_state || ''}`.toUpperCase()) {
    case 'DELETED':
      return locale.value === 'ar' ? 'محذوف' : 'Deleted';
    case 'INACTIVE':
      return locale.value === 'ar' ? 'موقوف' : 'Inactive';
    default:
      return locale.value === 'ar' ? 'نشط' : 'Active';
  }
};

const fetchUsers = async () => {
  try {
    await usersStore.fetchUsers({ mode: 'revalidate' });
  } catch (err) { uiStore.showToast(t('admin.toasts.fetch_users_failed'), 'error'); } 
};

const fetchLogs = async () => {
  logsLoading.value = true;
  try {
    const res = await api.get('/admin/logs');
    logs.value = getApiCollection(res, ['logs', 'items']);
  } catch (err) { console.error('Logs error:', err); } 
  finally { logsLoading.value = false; }
};

const updateRole = async (user, newRole) => {
  if (user.role === newRole) return;
  if (!(await notificationStore.confirm(t('admin.confirm.role_change', { role: t(`roles.${newRole}`) }), 'common.confirm'))) return;
  try {
    await usersStore.updateRole(user.id, newRole);
    uiStore.showToast(t('admin.toasts.role_updated', { role: t(`roles.${newRole}`) }), 'success');
  } catch (err) { uiStore.showToast(t('admin.toasts.role_update_failed'), 'error'); }
};

const deleteUser = async (user) => {
  const isDeletedRecord = `${user.record_state || ''}`.toUpperCase() === 'DELETED';
  const confirmMessage = isDeletedRecord
    ? (locale.value === 'ar'
        ? `هذا الحساب مؤرشف بالفعل. هل تريد حذفه نهائيًا من النظام؟`
        : `This account is already archived. Do you want to purge it permanently from the system?`)
    : t('admin.confirm.delete_user', { name: user.first_name });
  if (!(await notificationStore.confirm(confirmMessage, 'common.confirm'))) return;
  try {
    await usersStore.deleteUser(user.id);
    uiStore.showToast(
      isDeletedRecord
        ? (locale.value === 'ar' ? 'تم الحذف النهائي بنجاح' : 'Record purged successfully')
        : t('admin.toasts.delete_success'),
      'success'
    );
  } catch (err) { uiStore.showToast(t('admin.toasts.delete_failed'), 'error'); }
};

const openEditModal = (user) => { editingUser.value = { ...user, password: '' }; };

const openCreateModal = () => {
  newUser.value = { firstName: '', lastName: '', email: '', phone: '', password: '', role: 'USER', profileImageUrl: '' };
  isCreateModalOpen.value = true;
};

const createUser = async () => {
  creatingUser.value = true;
  try {
    await usersStore.createUser(newUser.value);
    uiStore.showToast(t('admin.toasts.save_success'), 'success');
    isCreateModalOpen.value = false;
  } catch (err) { uiStore.showToast(t('admin.toasts.save_failed'), 'error'); } 
  finally { creatingUser.value = false; }
};

const triggerImageUpload = () => fileInput.value?.click();
const triggerCreateImageUpload = () => createFileInput.value?.click();

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('image', file);
  uploadingImage.value = true;
  try {
    const res = await api.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    // api.js interceptor already unwraps — res IS the payload
    editingUser.value.profile_image_url = res?.url || res;
    uiStore.showToast(t('common.success'), 'success');
  } catch (err) { uiStore.showToast(t('admin.toasts.save_failed'), 'error'); } 
  finally { uploadingImage.value = false; }
};

const handleCreateImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('image', file);
  try {
    const res = await api.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    // api.js interceptor already unwraps — res IS the payload
    newUser.value.profileImageUrl = res?.url || res;
    uiStore.showToast(t('common.success'), 'success');
  } catch (err) { uiStore.showToast(t('admin.toasts.save_failed'), 'error'); }
};

const saveUserChanges = async () => {
  savingUser.value = true;
  try {
    const raw = editingUser.value;
    const payload = {};
    if (raw.first_name?.trim()) payload.firstName = raw.first_name.trim();
    if (raw.last_name?.trim())  payload.lastName  = raw.last_name.trim();
    if (raw.email?.trim())      payload.email     = raw.email.trim();
    if (raw.phone?.trim())      payload.phone     = raw.phone.trim();
    if (raw.password?.trim())   payload.password  = raw.password.trim();
    if (raw.profile_image_url)  payload.profileImageUrl = raw.profile_image_url;
    if (raw.is_active !== undefined) payload.isActive = !!raw.is_active;

    await usersStore.updateUser(raw.id, payload);
    uiStore.showToast(t('admin.toasts.save_success'), 'success');
    editingUser.value = null;
    } catch (err) { 
      const msg = normalizeError(err).message || t('admin.toasts.save_failed');
      uiStore.showToast(msg, 'error'); 
    } 
    finally { savingUser.value = false; }
};

const toggleStatus = async (user) => {
  const newStatus = !user.is_active;
  const actionText = t(newStatus ? 'admin.actions.activate_account' : 'admin.actions.ban_account');
  if (!(await notificationStore.confirm(t('admin.confirm.status_toggle', { action: actionText }), 'common.confirm'))) return;
  try {
    await usersStore.toggleStatus(user.id, newStatus);
    uiStore.showToast(t('admin.toasts.status_updated', { status: newStatus ? t('common.active') : t('common.inactive') }), newStatus ? 'success' : 'warning');
  } catch (err) { uiStore.showToast(t('admin.toasts.status_update_failed'), 'error'); }
};

const bulkStatus = async (activate) => {
  const actionText = t(activate ? 'admin.actions.activate_account' : 'admin.actions.ban_account');
  if (!(await notificationStore.confirm(t('admin.confirm.bulk_status', { action: actionText, count: selectedIds.value.length }), 'common.confirm'))) return;
  try {
    await Promise.all(selectedIds.value.map(id => usersStore.toggleStatus(id, activate)));
    uiStore.showToast(t('admin.toasts.bulk_success'), 'success');
    selectedIds.value = [];
  } catch (err) { uiStore.showToast(t('admin.toasts.bulk_failed'), 'error'); fetchUsers(); }
};

onMounted(() => {
  fetchUsers();
  fetchLogs();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active,
.dropdown-pop-enter-active, .dropdown-pop-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to,
.dropdown-pop-enter-from, .dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.shadow-luxury { box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.2); }
</style>
