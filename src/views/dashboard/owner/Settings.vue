<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-foreground uppercase tracking-tight">{{ t('settings.title', 'Platform Control Center') }}</h1>
        <p class="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">
          {{ t('settings.subtitle', 'Enterprise Configuration & Global Settings') }}
        </p>
      </div>
      <div>
         <button @click="saveAll" :disabled="saving" class="btn-primary min-w-[160px] shadow-lg shadow-primary/20 h-11">
           <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
           <div v-else class="flex items-center gap-2">
             <Save class="w-4 h-4" />
             <span class="font-black uppercase tracking-widest text-xs">{{ t('common.save_changes') }}</span>
           </div>
         </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar Navigation -->
      <div class="lg:col-span-1 flex flex-col gap-2">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left border"
          :class="activeTab === tab.id ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' : 'bg-card text-muted-foreground border-border/50 hover:bg-muted/50 hover:text-foreground hover:border-border'">
            <component :is="tab.icon" class="w-4 h-4" />
            <span class="font-black uppercase tracking-widest text-[10px]">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="lg:col-span-3 space-y-6">
        
        <!-- ============================================== -->
        <!-- 1. GENERAL & MEDIA SETTINGS -->
        <!-- ============================================== -->
        <div v-show="activeTab === 'general'" class="space-y-6 animate-in fade-in duration-300">
          <DashCard :title="t('settings.general')">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border/50">
              <div class="form-group">
                <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.site_name_ar') }}</label>
                <input v-model="form.siteNameAr" class="form-input" :placeholder="t('settings.form.site_name_ar')" />
              </div>
              <div class="form-group">
                <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.site_name_en') }}</label>
                <input v-model="form.siteNameEn" class="form-input" :placeholder="t('settings.form.site_name_en')" />
              </div>
              <div class="form-group md:col-span-2">
                <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.site_desc_ar') }}</label>
                <textarea v-model="form.siteDescriptionAr" class="form-input min-h-[80px]" :placeholder="t('settings.form.site_desc_ar')"></textarea>
              </div>
              <div class="form-group md:col-span-2">
                <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.site_desc_en') }}</label>
                <textarea v-model="form.siteDescriptionEn" class="form-input min-h-[80px]" :placeholder="t('settings.form.site_desc_en')"></textarea>
              </div>
            </div>

            <!-- Logo & Favicon -->
            <div class="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="form-label uppercase text-[10px] tracking-[0.2em] font-black">{{ t('settings.form.brand_logo') }}</label>
                <div class="mt-2 relative group w-full h-32 bg-muted/30 rounded-2xl border-2 border-dashed border-border/50 flex items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                  <img v-if="previews.logo || store.logo" :src="previews.logo || store.logo" class="max-h-20 max-w-[80%] object-contain" />
                  <div v-else class="text-center">
                    <ImagePlus class="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-20" />
                    <span class="text-[10px] font-bold text-muted-foreground uppercase opacity-40">{{ t('common.noData') }}</span>
                  </div>
                  <label class="absolute inset-0 cursor-pointer flex items-center justify-center bg-primary/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload class="w-5 h-5 me-2" />
                    <span class="text-xs font-black uppercase">{{ t('common.upload') }}</span>
                    <input type="file" class="hidden" accept="image/*" @change="e => handleFile(e, 'logo')" />
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label uppercase text-[10px] tracking-[0.2em] font-black">{{ t('settings.form.browser_favicon') }}</label>
                <div class="mt-2 relative group w-full h-32 bg-muted/30 rounded-2xl border-2 border-dashed border-border/50 flex items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                  <img v-if="previews.favicon || store.favicon" :src="previews.favicon || store.favicon" class="w-12 h-12 object-contain" />
                  <div v-else class="text-center">
                    <Sparkles class="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-20" />
                    <span class="text-[10px] font-bold text-muted-foreground uppercase opacity-40">{{ t('common.noData') }}</span>
                  </div>
                  <label class="absolute inset-0 cursor-pointer flex items-center justify-center bg-secondary/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload class="w-5 h-5 me-2" />
                    <span class="text-xs font-black uppercase">{{ t('common.upload') }}</span>
                    <input type="file" class="hidden" accept="image/*" @change="e => handleFile(e, 'favicon')" />
                  </label>
                </div>
              </div>
            </div>
          </DashCard>
        </div>

        <!-- ============================================== -->
        <!-- 2. BRANDING TAB -->
        <!-- ============================================== -->
        <div v-show="activeTab === 'branding'" class="space-y-6 animate-in fade-in duration-300">
          <DashCard :title="t('settings.form.visual_branding')">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="form-group flex flex-col gap-2">
                <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.primary_color') }}</label>
                <div class="flex items-center gap-3">
                  <input type="color" v-model="form.colors.primary" class="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                  <input v-model="form.colors.primary" class="form-input flex-1 font-mono text-xs uppercase" />
                </div>
              </div>
              <div class="form-group flex flex-col gap-2">
                <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.secondary_color') }}</label>
                <div class="flex items-center gap-3">
                  <input type="color" v-model="form.colors.secondary" class="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                  <input v-model="form.colors.secondary" class="form-input flex-1 font-mono text-xs uppercase" />
                </div>
              </div>
              <div class="form-group flex flex-col gap-2">
                <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.accent_color') }}</label>
                <div class="flex items-center gap-3">
                  <input type="color" v-model="form.colors.accent" class="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                  <input v-model="form.colors.accent" class="form-input flex-1 font-mono text-xs uppercase" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/50">
               <div class="form-group">
                <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('common.theme') }}</label>
                <select v-model="form.defaultTheme" class="form-input">
                  <option value="light">{{ t('common.light_mode') }}</option>
                  <option value="dark">{{ t('common.dark_mode') }}</option>
                  <option value="system">{{ t('common.system') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('common.language') }}</label>
                <select v-model="form.defaultLanguage" class="form-input">
                  <option value="ar">{{ t('roles.ADMIN') }} (AR)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>
            </div>
          </DashCard>
        </div>

        <!-- ============================================== -->
        <!-- 3. PLATFORM TOGGLES -->
        <!-- ============================================== -->
        <div v-show="activeTab === 'platform'" class="space-y-6 animate-in fade-in duration-300">
          <DashCard :title="t('settings.form.engine_features')">
            <div class="space-y-4">
              <!-- Toggle 1 -->
              <div class="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-foreground">{{ t('settings.form.enable_rfq') }}</h3>
                    <p class="text-xs text-muted-foreground mt-0.5">{{ t('rfq.desc', 'Enable or disable marketplace RFQ logic.') }}</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" v-model="form.toggles.rfq" class="sr-only peer">
                  <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border/50 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <!-- Toggle 2 -->
              <div class="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <MessageSquare class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-foreground">{{ t('settings.form.enable_chat') }}</h3>
                    <p class="text-xs text-muted-foreground mt-0.5">{{ t('chat.desc', 'Allow buyers and vendors to communicate in real-time.') }}</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" v-model="form.toggles.chat" class="sr-only peer">
                  <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border/50 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                </label>
              </div>

              <!-- Toggle 3 -->
              <div class="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                    <UserPlus class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-foreground">{{ t('settings.form.enable_registration') }}</h3>
                    <p class="text-xs text-muted-foreground mt-0.5">{{ t('admin.vendor_subtitle') }}</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" v-model="form.toggles.vendor_registration" class="sr-only peer">
                  <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border/50 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              <!-- Toggle 4 -->
              <div class="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                    <AlertTriangle class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-red-600 dark:text-red-400">{{ t('settings.form.maintenance_mode') }}</h3>
                    <p class="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">{{ t('common.system') }} Lockdown</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" v-model="form.toggles.maintenance" class="sr-only peer">
                  <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border/50 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </DashCard>
        </div>

        <!-- ============================================== -->
        <!-- 4. SOCIAL LINKS -->
        <!-- ============================================== -->
        <div v-show="activeTab === 'social'" class="space-y-6 animate-in fade-in duration-300">
          <DashCard :title="ownerCopy.socialLinksTitle">
            <div class="flex items-start justify-between gap-4 pb-6 border-b border-border/50">
              <div>
                <h3 class="text-sm font-black text-foreground uppercase tracking-widest">
                  {{ ownerCopy.socialLinksTitle }}
                </h3>
                <p class="text-xs text-muted-foreground mt-2 max-w-2xl leading-6">
                  {{ ownerCopy.socialLinksDesc }}
                </p>
              </div>
              <button type="button" class="btn-secondary h-10 px-4 shrink-0" @click="addSocialLink">
                <Plus class="w-4 h-4" />
                <span class="font-black text-xs uppercase tracking-widest">{{ t('common.add') }}</span>
              </button>
            </div>

            <div class="space-y-4 pt-6">
              <div
                v-for="(link, index) in form.socialLinks"
                :key="`social-link-${index}`"
                class="rounded-2xl border border-border/60 bg-muted/20 p-4 md:p-5"
              >
                <div class="grid grid-cols-1 md:grid-cols-[minmax(0,220px)_1fr_auto] gap-4 items-end">
                  <div class="form-group relative" :data-social-dropdown="index">
                    <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">
                      {{ ownerCopy.socialPlatform }}
                    </label>
                    <button
                      type="button"
                      class="form-input flex items-center justify-between gap-3 text-start min-h-[48px]"
                      :class="openPlatformDropdownIndex === index ? 'ring-2 ring-primary/20 border-primary/40' : ''"
                      @click="togglePlatformDropdown(index)"
                    >
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                          <component
                            :is="getPlatformMeta(link.platform).icon"
                            class="w-4 h-4"
                            :class="link.platform ? 'text-primary' : 'text-muted-foreground'"
                          />
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-semibold text-foreground truncate">
                            {{ getPlatformMeta(link.platform).label }}
                          </p>
                          <p class="text-[11px] text-muted-foreground truncate">
                            {{ getPlatformMeta(link.platform).hint }}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        class="w-4 h-4 text-muted-foreground transition-transform shrink-0"
                        :class="openPlatformDropdownIndex === index ? 'rotate-180' : ''"
                      />
                    </button>

                    <div
                      v-if="openPlatformDropdownIndex === index"
                      class="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl shadow-black/10"
                    >
                      <div class="max-h-72 overflow-y-auto p-2">
                        <button
                          v-for="platform in socialPlatformOptions"
                          :key="platform.value"
                          type="button"
                          class="w-full rounded-xl px-3 py-3 flex items-center justify-between gap-3 text-start transition-colors"
                          :class="link.platform === platform.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/70 text-foreground'"
                          @click="selectPlatform(index, platform.value)"
                        >
                          <div class="flex items-center gap-3 min-w-0">
                            <div
                              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              :class="link.platform === platform.value ? 'bg-white/15' : 'bg-muted/60'"
                            >
                              <component
                                :is="platform.icon"
                                class="w-4 h-4"
                                :class="link.platform === platform.value ? 'text-white' : 'text-primary'"
                              />
                            </div>
                            <div class="min-w-0">
                              <p class="text-sm font-semibold truncate">{{ platform.label }}</p>
                              <p
                                class="text-[11px] truncate"
                                :class="link.platform === platform.value ? 'text-primary-foreground/70' : 'text-muted-foreground'"
                              >
                                {{ platform.hint }}
                              </p>
                            </div>
                          </div>
                          <Check
                            v-if="link.platform === platform.value"
                            class="w-4 h-4 shrink-0"
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">
                      {{ ownerCopy.socialUrl }}
                    </label>
                    <input
                      v-model="link.url"
                      type="url"
                      class="form-input"
                      :placeholder="ownerCopy.socialUrlPlaceholder"
                    />
                  </div>

                  <button
                    type="button"
                    class="h-11 w-11 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-colors"
                    @click="removeSocialLink(index)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                v-if="!form.socialLinks.length"
                class="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-5 py-8 text-center"
              >
                <div class="w-12 h-12 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Share2 class="w-5 h-5" />
                </div>
                <p class="text-sm font-bold text-foreground">
                  {{ ownerCopy.noSocialLinks }}
                </p>
                <p class="text-xs text-muted-foreground mt-2">
                  {{ ownerCopy.noSocialLinksDesc }}
                </p>
              </div>
            </div>
          </DashCard>
        </div>

        <!-- ============================================== -->
        <!-- 5. SEO SETTINGS -->
        <!-- ============================================== -->
        <div v-show="activeTab === 'seo'" class="space-y-6 animate-in fade-in duration-300">
          <DashCard title="Search Engine Optimization">
             <div class="grid grid-cols-1 gap-6">
                <!-- Meta Title -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-group">
                    <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.meta_title_ar') }}</label>
                    <input v-model="form.seo.titleAr" class="form-input" :placeholder="t('settings.form.meta_title_ar')" />
                  </div>
                  <div class="form-group">
                    <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.meta_title_en') }}</label>
                    <input v-model="form.seo.titleEn" class="form-input" :placeholder="t('settings.form.meta_title_en')" />
                  </div>
                </div>

                <!-- Meta Description -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-group">
                    <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.meta_desc_ar') }}</label>
                    <textarea v-model="form.seo.descAr" class="form-input h-24" :placeholder="t('settings.form.meta_desc_ar')"></textarea>
                  </div>
                  <div class="form-group">
                    <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">{{ t('settings.form.meta_desc_en') }}</label>
                    <textarea v-model="form.seo.descEn" class="form-input h-24" :placeholder="t('settings.form.meta_desc_en')"></textarea>
                  </div>
                </div>

                <!-- OpenGraph -->
                <div class="form-group">
                  <label class="form-label uppercase text-[9px] tracking-[0.2em] font-black text-muted-foreground">OpenGraph Social Preview Image</label>
                  <div class="mt-2 relative group w-full h-48 bg-muted/30 rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                    <img v-if="previews.ogImage || store.seo.ogImage" :src="previews.ogImage || store.seo.ogImage" class="absolute inset-0 w-full h-full object-cover blur-sm opacity-50" />
                    <img v-if="previews.ogImage || store.seo.ogImage" :src="previews.ogImage || store.seo.ogImage" class="relative z-10 max-h-[80%] max-w-[80%] object-contain rounded-lg shadow-xl border border-white/20" />
                    <div v-else class="text-center z-10">
                      <ImagePlus class="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-30" />
                      <span class="text-xs font-bold text-muted-foreground uppercase opacity-60">{{ t('common.upload') }} OpenGraph Image</span>
                    </div>
                    <label class="absolute inset-0 z-20 cursor-pointer flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload class="w-6 h-6 me-2" />
                      <span class="text-sm font-black uppercase">{{ t('common.upload') }}</span>
                      <input type="file" class="hidden" accept="image/*" @change="e => handleFile(e, 'ogImage')" />
                    </label>
                  </div>
                  <p class="text-[10px] text-muted-foreground mt-2 italic">{{ t('settings.form.seo_optimization') }}</p>
                </div>
             </div>
          </DashCard>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Loader2, Save, ImagePlus, Upload, Sparkles, 
  Settings as SettingsIcon, Paintbrush, Phone, 
  SlidersHorizontal, SearchCode,
  FileText, MessageSquare, UserPlus, AlertTriangle,
  Share2, Plus, Trash2, ChevronDown, Check,
  Facebook, Instagram, Linkedin, Twitter, Youtube, Music2, Send, Globe
} from 'lucide-vue-next';
import { useUiStore } from '@/stores/ui';
import { useSettingsStore } from '@/stores/settings';
import DashCard from '@/components/dashboard/DashCard.vue';

const { t, locale } = useI18n();
const uiStore = useUiStore();
const store = useSettingsStore();

const saving = ref(false);
const openPlatformDropdownIndex = ref(null);

const ownerCopy = computed(() =>
  locale.value === 'ar'
    ? {
        tabs: {
          general: 'الهوية العامة',
          platform: 'محرك الموقع',
          social: 'روابط التواصل',
          payment: 'البيانات المالية'
        },
        socialLinksTitle: 'روابط التواصل الاجتماعي',
        socialLinksDesc: 'اختر المنصة وضع رابطها ليظهر مباشرة في الفوتر بنفس ترتيب الحفظ.',
        socialPlatform: 'المنصة',
        choosePlatform: 'اختر المنصة',
        socialUrl: 'الرابط',
        socialUrlPlaceholder: 'https://example.com/your-page',
        noSocialLinks: 'لا توجد روابط تواصل اجتماعي محفوظة بعد',
        noSocialLinksDesc: 'أضف أول رابط ليظهر في الفوتر بشكل تلقائي.',
        invalidSocialLink: 'يرجى اختيار المنصة وإدخال رابط صحيح يبدأ بـ http أو https.'
      }
    : {
        tabs: {
          general: 'General Identity',
          platform: 'Site Engine',
          social: 'Social Links',
          payment: 'Financial Data'
        },
        socialLinksTitle: 'Social Media Links',
        socialLinksDesc: 'Choose the platform and add its URL to display it in the footer automatically.',
        socialPlatform: 'Platform',
        choosePlatform: 'Choose platform',
        socialUrl: 'URL',
        socialUrlPlaceholder: 'https://example.com/your-page',
        noSocialLinks: 'No social links saved yet',
        noSocialLinksDesc: 'Add your first social link to make it appear in the footer.',
        invalidSocialLink: 'Please choose a platform and enter a valid URL starting with http or https.'
      }
);

const tabs = computed(() => [
  { id: 'general', label: ownerCopy.value.tabs.general, icon: SettingsIcon },
  // { id: 'branding', label: 'Brand Styling', icon: Paintbrush },
  { id: 'platform', label: ownerCopy.value.tabs.platform, icon: SlidersHorizontal },
  { id: 'social', label: ownerCopy.value.tabs.social, icon: Share2 },
  // { id: 'seo', label: 'Search & Meta', icon: SearchCode }
]);
const activeTab = ref('general');

const form = reactive({
  siteNameAr: '',
  siteNameEn: '',
  siteDescriptionAr: '',
  siteDescriptionEn: '',
  defaultLanguage: 'ar',
  defaultTheme: 'light',
  colors: {
    primary: '#0B1E3C',
    secondary: '#1A9882',
    accent: '#F7F9FC'
  },
  toggles: {
    rfq: true,
    chat: true,
    vendor_registration: true,
    maintenance: false
  },
  seo: {
    titleAr: '',
    titleEn: '',
    descAr: '',
    descEn: '',
    keywords: ''
  },
  socialLinks: []
});

const socialPlatformOptions = [
  { value: 'facebook', label: 'Facebook', icon: Facebook, hint: 'facebook.com/...' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, hint: 'instagram.com/...' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, hint: 'linkedin.com/company/...' },
  { value: 'x/twitter', label: 'X / Twitter', icon: Twitter, hint: 'x.com/... or twitter.com/...' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, hint: 'youtube.com/@channel' },
  { value: 'tiktok', label: 'TikTok', icon: Music2, hint: 'tiktok.com/@username' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, hint: 'wa.me/201...' },
  { value: 'telegram', label: 'Telegram', icon: Send, hint: 't.me/username' }
];

const files = reactive({
  logo: null,
  favicon: null,
  ogImage: null
});

const previews = reactive({
  logo: null,
  favicon: null,
  ogImage: null
});

onMounted(async () => {
  document.addEventListener('click', handleOutsidePlatformDropdown);
  await store.fetch();
  syncFormToStore();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsidePlatformDropdown);
});

const syncFormToStore = () => {
  form.siteNameAr = store.siteNameAr || '';
  form.siteNameEn = store.siteNameEn || '';
  form.siteDescriptionAr = store.siteDescriptionAr || '';
  form.siteDescriptionEn = store.siteDescriptionEn || '';
  form.defaultTheme = store.defaultTheme || 'light';
  form.defaultLanguage = store.defaultLanguage || 'ar';
  
  if (store.colors) {
    form.colors.primary = store.colors.primary;
    form.colors.secondary = store.colors.secondary;
    form.colors.accent = store.colors.accent;
  }
  
  if (store.toggles) {
    form.toggles.rfq = store.toggles.rfq;
    form.toggles.chat = store.toggles.chat;
    form.toggles.vendor_registration = store.toggles.vendor_registration;
    form.toggles.maintenance = store.toggles.maintenance;
  }

  if (store.seo) {
    form.seo.titleAr = store.seo.titleAr;
    form.seo.titleEn = store.seo.titleEn;
    form.seo.descAr = store.seo.descAr;
    form.seo.descEn = store.seo.descEn;
    form.seo.keywords = store.seo.keywords;
  }

  form.socialLinks = (store.socialLinks || []).map((item) => ({
    platform: item.platform || '',
    url: item.url || ''
  }));
};

const addSocialLink = () => {
  form.socialLinks.push({ platform: '', url: '' });
};

const removeSocialLink = (index) => {
  form.socialLinks.splice(index, 1);
  if (openPlatformDropdownIndex.value === index) {
    openPlatformDropdownIndex.value = null;
  } else if (typeof openPlatformDropdownIndex.value === 'number' && openPlatformDropdownIndex.value > index) {
    openPlatformDropdownIndex.value -= 1;
  }
};

const getPlatformMeta = (value) => {
  const match = socialPlatformOptions.find((item) => item.value === value);
  return match || {
    label: ownerCopy.value.choosePlatform,
    icon: Globe,
    hint: locale.value === 'ar' ? 'اختر منصة من القائمة' : 'Choose from the curated list'
  };
};

const togglePlatformDropdown = (index) => {
  openPlatformDropdownIndex.value = openPlatformDropdownIndex.value === index ? null : index;
};

const selectPlatform = (index, value) => {
  form.socialLinks[index].platform = value;
  openPlatformDropdownIndex.value = null;
};

const handleOutsidePlatformDropdown = (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.closest('[data-social-dropdown]')) {
    openPlatformDropdownIndex.value = null;
  }
};

const normalizeSocialLinks = () =>
  form.socialLinks
    .map((item) => ({
      platform: String(item.platform || '').trim(),
      url: String(item.url || '').trim()
    }))
    .filter((item) => item.platform || item.url);

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const handleFile = (e, type) => {
  const file = e.target.files[0];
  if (!file) return;
  files[type] = file;
  previews[type] = URL.createObjectURL(file);
};

const saveAll = async () => {
  saving.value = true;
  try {
    const socialLinks = normalizeSocialLinks();

    const invalidSocialLink = socialLinks.find(
      (item) => !item.platform || !item.url || !isValidUrl(item.url)
    );

    if (invalidSocialLink) {
      uiStore.showToast(ownerCopy.value.invalidSocialLink, 'error');
      saving.value = false;
      return;
    }

    // 1. Compile Batch JSON Updates
    const settingsArr = [
      { key: 'site_name_ar', value: form.siteNameAr },
      { key: 'site_name_en', value: form.siteNameEn },
      { key: 'site_description_ar', value: form.siteDescriptionAr },
      { key: 'site_description_en', value: form.siteDescriptionEn },
      { key: 'default_theme', value: form.defaultTheme },
      { key: 'default_language', value: form.defaultLanguage },
      
      { key: 'primary_color', value: form.colors.primary },
      { key: 'secondary_color', value: form.colors.secondary },
      { key: 'accent_color', value: form.colors.accent },

      { key: 'enable_rfq', value: form.toggles.rfq.toString() },
      { key: 'enable_chat', value: form.toggles.chat.toString() },
      { key: 'enable_vendor_registration', value: form.toggles.vendor_registration.toString() },
      { key: 'maintenance_mode', value: form.toggles.maintenance.toString() },

      { key: 'meta_title_ar', value: form.seo.titleAr },
      { key: 'meta_title_en', value: form.seo.titleEn },
      { key: 'meta_description_ar', value: form.seo.descAr },
      { key: 'meta_description_en', value: form.seo.descEn },
      { key: 'meta_keywords', value: form.seo.keywords },

      { key: 'social_links', value: socialLinks }
    ];

    await store.updateBatch(settingsArr);

    // 2. Upload Binaries Individually
    if (files.logo) await store.updateMedia('site_logo', files.logo);
    if (files.favicon) await store.updateMedia('site_favicon', files.favicon);
    if (files.ogImage) await store.updateMedia('seo_og_image', files.ogImage);

    uiStore.showToast(t('common.success'), 'success');
  } catch (err) {
    uiStore.showToast(t('common.error_occurred'), 'error');
    console.error(err);
  } finally {
    saving.value = false;
  }
};
</script>
