<template>
  <BaseModal 
    :model-value="modelValue" 
    @update:model-value="emit('update:modelValue', $event)"
    :title="product ? t('products.editProduct') : t('products.addProduct')" 
    size="xl"
    body-class="p-0 overflow-hidden"
    overlay-class="backdrop-blur-[2px] bg-slate-900/30"
  >
    <div class="relative flex flex-col h-[80vh] lg:h-[70vh] bg-white font-plex overflow-hidden">
      <!-- Success Overlay -->
      <Transition name="scale">
        <div v-if="showSuccess" class="absolute inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-8">
          <div class="w-32 h-32 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-primary/20 border border-primary/20 animate-bounce">
            <Check class="w-16 h-16" />
          </div>
          <h2 class="text-4xl font-black text-secondary mb-4 tracking-tight">{{ t('common.success') }}</h2>
          <p class="text-slate-500 font-medium max-w-sm mx-auto mb-10 text-lg leading-relaxed">
            {{ product ? t('products.updateSuccess') : t('products.createSuccess') }}
          </p>
          <button @click="emit('update:modelValue', false)" class="px-12 h-14 bg-secondary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95">
            {{ t('common.ok') }}
          </button>
        </div>
      </Transition>

      <!-- Wizard Header / Tab Navigation -->
      <div class="bg-secondary p-4 lg:px-12 flex items-center justify-between border-b border-white/5 relative z-20 shadow-xl shadow-secondary/20">
        <div class="flex items-center gap-2 lg:gap-8 overflow-x-auto no-scrollbar py-2">
          <button 
            v-for="tab in wizardTabs" 
            :key="tab.id"
            @click="goToTab(tab.id)"
            :disabled="!canGoToTab(tab.id)"
            :class="[
              'flex items-center gap-3 px-5 py-3 rounded-2xl transition-all whitespace-nowrap border-2',
              currentTab === tab.id 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' 
                : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span class="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{{ t(tab.label) }}</span>
          </button>
        </div>
        <div class="hidden lg:flex flex-col items-end">
          <p class="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{{ t('common.loading') }} {{ progressPercentage }}%</p>
          <div class="w-32 h-1 bg-white/10 rounded-full mt-2 overflow-hidden shadow-inner">
            <div class="h-full bg-primary transition-all duration-700 shadow-glow-teal" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden relative bg-slate-50/50">
        <Transition name="fade-slide" mode="out-in">
          <!-- Step 1: Basic Info (Bilingual) -->
          <div v-if="currentTab === 'info'" key="info" class="absolute inset-0 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
            <div class="max-w-4xl mx-auto space-y-10">
              <div
                v-if="errorText"
                class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 shadow-sm"
              >
                {{ errorText }}
              </div>
              <div class="bg-white border border-slate-100 rounded-[2.5rem] p-8 lg:p-12 space-y-10 shadow-premium">
                <div class="flex items-center gap-5">
                  <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5">
                    <Box class="w-6 h-6" />
                  </div>
                  <div>
                    <h3 class="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{{ t('common.general') }}</h3>
                    <p class="text-lg font-black text-secondary">{{ t('products.name') }} & {{ t('auth.category') }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-12">
                  <!-- Product Name - Side by Side -->
                  <div class="space-y-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div class="space-y-4 group/field">
                        <label class="flex items-center justify-between px-1">
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within/field:text-primary transition-colors">
                            {{ t('products.name') }} (AR) <span class="text-primary">*</span>
                          </span>
                          <span class="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">ARABIC</span>
                        </label>
                        <input 
                          v-model="form.name_ar" 
                          dir="rtl"
                          required
                          @input="handleFieldInput('name_ar')"
                          class="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] px-6 text-sm font-bold text-secondary placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all outline-none"
                        />
                        <p v-if="fieldMessage('name_ar')" class="text-[10px] text-rose-500 font-black mt-2 px-1">
                          {{ fieldMessage('name_ar') }}
                        </p>
                        <Transition name="fade">
                          <p v-if="showErrors && form.name_ar.length <= 2" class="text-[10px] text-rose-500 font-black mt-2 px-1">
                            * {{ locale === 'ar' ? 'الاسم يجب أن يكون 3 أحرف على الأقل' : 'Name must be at least 3 characters' }}
                          </p>
                        </Transition>
                      </div>
                      <div class="space-y-4 group/field">
                        <label class="flex items-center justify-between px-1">
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within/field:text-primary transition-colors">
                            {{ t('products.name') }} (EN) <span class="text-slate-300 font-normal ml-1">(Optional)</span>
                          </span>
                          <span class="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">ENGLISH</span>
                        </label>
                        <input 
                          v-model="form.name_en" 
                          dir="ltr"
                          @input="handleFieldInput('name_en')"
                          class="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] px-6 text-sm font-bold text-secondary placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all outline-none"
                        />
                        <p v-if="fieldMessage('name_en')" class="text-[10px] text-rose-500 font-black mt-2 px-1">
                          {{ fieldMessage('name_en') }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 transition-colors">
                      {{ t('auth.category') }} <span class="text-primary">*</span>
                    </label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CategorySelect 
                        v-model="selectedRootCategory" 
                        :categories="rootCategories"
                      />
                      <Transition name="fade">
                        <CategorySelect 
                          v-if="subCategories.length > 0"
                          v-model="form.category_id" 
                          :categories="subCategories"
                          :placeholder="locale === 'ar' ? 'اختر الفئة التابعة...' : 'Select Subcategory...'"
                        />
                      </Transition>
                    </div>
                    <Transition name="fade">
                      <p v-if="showErrors && !form.category_id" class="text-[10px] text-rose-500 font-black px-1">
                        * {{ locale === 'ar' ? 'يجب اختيار القسم وتحديد الفئة التابعة إن وجدت' : 'Category and Subcategory must be selected' }}
                      </p>
                    </Transition>
                  </div>

                  <!-- Description - Side by Side -->
                  <div class="space-y-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div class="space-y-4 group/field">
                        <label class="flex items-center justify-between px-1">
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within/field:text-primary transition-colors">
                            {{ t('products.description') }} (AR) <span class="text-primary">*</span>
                          </span>
                        </label>
                        <textarea 
                          v-model="form.description_ar" 
                          dir="rtl"
                          rows="6" 
                          required
                          @input="handleFieldInput('description_ar')"
                          class="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-6 text-sm font-medium leading-relaxed text-slate-600 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all outline-none resize-none"
                        ></textarea>
                        <p v-if="fieldMessage('description_ar')" class="text-[10px] text-rose-500 font-black mt-2 px-1">
                          {{ fieldMessage('description_ar') }}
                        </p>
                        <Transition name="fade">
                          <p v-if="showErrors && form.description_ar.length <= 10" class="text-[10px] text-rose-500 font-black mt-2 px-1">
                            * {{ locale === 'ar' ? 'الوصف يجب أن يكون أكثر من 10 أحرف' : 'Description must be more than 10 characters' }}
                          </p>
                        </Transition>
                      </div>
                      <div class="space-y-4 group/field">
                        <label class="flex items-center justify-between px-1">
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within/field:text-primary transition-colors">
                            {{ t('products.description') }} (EN)
                          </span>
                        </label>
                        <textarea 
                          v-model="form.description_en" 
                          dir="ltr"
                          rows="6" 
                          @input="handleFieldInput('description_en')"
                          class="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-6 text-sm font-medium leading-relaxed text-slate-600 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all outline-none resize-none"
                        ></textarea>
                        <p v-if="fieldMessage('description_en')" class="text-[10px] text-rose-500 font-black mt-2 px-1">
                          {{ fieldMessage('description_en') }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Pricing -->
          <div v-else-if="currentTab === 'pricing'" key="pricing" class="absolute inset-0 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
            <div class="max-w-4xl mx-auto space-y-10">
              <div class="bg-white border border-slate-100 rounded-[2.5rem] p-8 lg:p-12 space-y-10 shadow-premium">
                <div class="flex items-center gap-5">
                  <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-500/5">
                    <Coins class="w-6 h-6" />
                  </div>
                  <div>
                    <h3 class="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{{ t('products.pricingWholesale') }}</h3>
                    <p class="text-lg font-black text-secondary">{{ t('products.minPrice') }} & {{ t('products.moqUnits') }}</p>
                  </div>
                </div>

                <!-- Price Range Error -->
                <Transition name="fade">
                  <div v-if="hasPriceError" class="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-500 animate-in slide-in-from-top-2">
                    <X class="w-5 h-5 flex-shrink-0" />
                    <p class="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                      {{ t('products.priceRangeError') }}
                    </p>
                  </div>
                </Transition>

                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10">
                  <div class="space-y-4 group/field">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within/field:text-primary transition-colors">{{ t('products.minPrice') }} <span class="text-primary">*</span></label>
                    <div class="relative">
                      <input 
                        v-model.number="form.price" 
                        type="number" 
                        step="0.01" 
                        required 
                        @input="handleFieldInput('price')"
                        class="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] px-6 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all outline-none" 
                      />
                    </div>
                    <p v-if="fieldMessage('price')" class="text-[10px] text-rose-500 font-black px-1">
                      {{ fieldMessage('price') }}
                    </p>
                    <Transition name="fade">
                      <p v-if="showErrors && form.price <= 0" class="text-[10px] text-rose-500 font-black px-1">
                        * {{ locale === 'ar' ? 'السعر يجب أن يكون أكبر من صفر' : 'Price must be greater than zero' }}
                      </p>
                    </Transition>
                  </div>
                  <div class="space-y-4 group/field">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within/field:text-primary transition-colors">{{ t('products.maxPrice') }}</label>
                    <div class="relative">
                      <input 
                        v-model.number="form.discount_price" 
                        type="number" 
                        step="0.01" 
                        @input="handleFieldInput('discount_price', 'discountPrice')"
                        class="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] px-6 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all outline-none" 
                      />
                    </div>
                    <p v-if="fieldMessage('discount_price', 'discountPrice')" class="text-[10px] text-rose-500 font-black px-1">
                      {{ fieldMessage('discount_price', 'discountPrice') }}
                    </p>
                  </div>
                  <div class="space-y-4 group/field">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within/field:text-primary transition-colors">{{ t('products.moqUnits') }} <span class="text-primary">*</span></label>
                    <div class="relative">
                      <input 
                        v-model.number="form.min_order_quantity" 
                        type="number" 
                        required 
                        @input="handleFieldInput('min_order_quantity', 'minOrderQuantity')"
                        class="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] px-6 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all outline-none" 
                      />
                      <span :class="['absolute top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest', locale === 'ar' ? 'left-5' : 'right-5']">PCS</span>
                    </div>
                    <p v-if="fieldMessage('min_order_quantity', 'minOrderQuantity')" class="text-[10px] text-rose-500 font-black px-1">
                      {{ fieldMessage('min_order_quantity', 'minOrderQuantity') }}
                    </p>
                    <Transition name="fade">
                      <p v-if="showErrors && form.min_order_quantity < 1" class="text-[10px] text-rose-500 font-black px-1">
                        * {{ locale === 'ar' ? 'الحد الأدنى للطلب يجب أن يكون 1 على الأقل' : 'Minimum order must be at least 1' }}
                      </p>
                    </Transition>
                  </div>
                  <div class="space-y-4 group/field">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within/field:text-primary transition-colors">{{ quantityAvailableLabel }} <span class="text-primary">*</span></label>
                    <div class="relative">
                      <input 
                        v-model.number="form.quantity_available" 
                        type="number"
                        min="0"
                        required 
                        @input="handleFieldInput('quantity_available', 'quantityAvailable')"
                        class="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] px-6 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all outline-none" 
                      />
                      <span :class="['absolute top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest', locale === 'ar' ? 'left-5' : 'right-5']">{{ locale === 'ar' ? 'وحدة' : 'Units' }}</span>
                    </div>
                    <p v-if="fieldMessage('quantity_available', 'quantityAvailable')" class="text-[10px] text-rose-500 font-black px-1">
                      {{ fieldMessage('quantity_available', 'quantityAvailable') }}
                    </p>
                    <Transition name="fade">
                      <p v-if="showErrors && form.quantity_available < 0" class="text-[10px] text-rose-500 font-black px-1">
                        * {{ locale === 'ar' ? 'الكمية المتاحة يجب ألا تكون أقل من صفر' : 'Available quantity cannot be less than zero' }}
                      </p>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Specs (Bilingual) -->
          <div v-else-if="currentTab === 'specs'" key="specs" class="absolute inset-0 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
            <div class="max-w-4xl mx-auto space-y-10">
              <div class="bg-white border border-slate-100 rounded-[2.5rem] p-8 lg:p-12 space-y-10 shadow-premium dark:border-slate-800 dark:bg-slate-900/80">
                <div class="space-y-2">
                  <h3 class="text-lg font-black text-secondary dark:text-slate-100">{{ t('products.technicalSpecs') }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    Add Arabic and English specification pairs to help buyers compare products faster.
                  </p>
                </div>
                <SpecsEditor v-model="form.specs" />
              </div>
            </div>
          </div>

          <!-- Step 4: Media -->
          <div v-else-if="currentTab === 'media'" key="media" class="absolute inset-0 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
            <div class="max-w-4xl mx-auto space-y-10">
              <div class="bg-white border border-slate-100 rounded-[2.5rem] p-8 lg:p-12 space-y-10 shadow-premium">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-500/5">
                      <ImageIcon class="w-6 h-6" />
                    </div>
                    <div>
                      <h3 class="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{{ t('products.image') }}</h3>
                      <p class="text-lg font-black text-secondary">{{ previews.length }} / 5 {{ t('common.upload') }}</p>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-8">
                  <div 
                    v-for="(p, i) in previews" 
                    :key="p" 
                    class="relative aspect-square rounded-[1.5rem] border-4 border-slate-50 shadow-luxury overflow-hidden group/img cursor-move transition-all active:scale-95"
                    draggable="true"
                    @dragstart="e => onDragStart(e, i)"
                    @dragover.prevent
                    @drop="e => onDrop(e, i)"
                  >
                    <img :src="p" class="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                    <div v-if="i === 0" class="absolute top-3 left-3 bg-primary text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-2xl z-10 border border-white/20 backdrop-blur-md">
                      {{ t('products.primary') }}
                    </div>
                    <button 
                      v-else
                      type="button" 
                      @click.stop="setPrimary(i)"
                      class="absolute top-3 left-3 bg-white/95 text-secondary text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg z-10 border border-slate-100 opacity-0 group-hover/img:opacity-100 transition-all hover:bg-primary hover:text-white"
                    >
                      {{ t('products.primary') }}
                    </button>
                    <button type="button" @click.stop.prevent="removeImage(i)" class="absolute top-3 right-3 w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center translate-y-2 opacity-0 group-hover/img:opacity-100 group-hover/img:translate-y-0 transition-all shadow-xl z-30 hover:bg-rose-600">
                      <X class="w-4 h-4" />
                    </button>
                  </div>

                  <div 
                    v-if="previews.length < 5"
                    class="relative aspect-square rounded-[1.5rem] border-4 border-dashed border-slate-100 bg-slate-50/50 hover:border-primary hover:bg-white transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group shadow-sm"
                    @dragover.prevent
                    @drop.prevent="handleDropUpload"
                  >
                    <div class="w-12 h-12 rounded-2xl bg-white text-slate-300 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-all shadow-sm border border-slate-100 group-hover:border-primary/20">
                      <Plus class="w-6 h-6" />
                    </div>
                    <div class="space-y-1 text-center px-3">
                      <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Upload Media</p>
                      <p class="text-xs text-slate-400">PNG / JPG up to 5 images</p>
                    </div>
                    <input type="file" multiple accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" @change="handleFileSelect" />
                  </div>
                </div>

                <div v-if="saving && uploadProgress > 0" class="space-y-3">
                  <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
                    <div class="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-1000 ease-out shadow-glow-teal" :style="{ width: uploadProgress + '%' }"></div>
                  </div>
                  <p class="text-[10px] font-black text-secondary uppercase tracking-[0.4em] text-center animate-pulse">{{ uploadProgress }}% {{ t('common.loading') }}</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Progressive Footer -->
      <div class="bg-white border-t border-slate-100 p-6 lg:px-12 relative z-20 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.05)]">
        <div class="flex items-center justify-between max-w-4xl mx-auto w-full">
          <button 
            type="button" 
            @click="prevTab"
            v-if="currentTab !== 'info'"
            class="h-16 px-10 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-slate-50 hover:text-secondary transition-all active:scale-95 flex items-center gap-3"
          >
            <ChevronLeft v-if="locale === 'en'" class="w-4 h-4" />
            <ChevronRight v-else class="w-4 h-4" />
            {{ t('common.cancel') }}
          </button>
          <button 
            type="button" 
            @click="emit('update:modelValue', false)"
            v-else
            class="h-16 px-10 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-slate-50 hover:text-secondary transition-all active:scale-95"
          >
            {{ t('common.cancel') }}
          </button>

          <button 
            v-if="currentTab !== 'media'"
            type="button" 
            @click="nextTab"
            class="h-16 px-12 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl shadow-secondary/20 hover:bg-slate-800 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-30"
          >
            {{ t('common.next') }}
            <ChevronRight v-if="locale === 'en'" class="w-4 h-4" />
            <ChevronLeft v-else class="w-4 h-4" />
          </button>
          
          <button 
            v-else
            type="button" 
            @click="handleSave"
            :disabled="saving" 
            class="h-16 px-12 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center gap-5 shadow-glow-teal hover:opacity-95 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 group/btn"
          >
            <template v-if="saving">
              <Loader2 class="w-6 h-6 animate-spin text-white/50" />
              <span>{{ t('common.loading') }}</span>
            </template>
            <template v-else>
              <div class="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover/btn:scale-110 transition-transform">
                <Check class="w-4 h-4 shrink-0" />
              </div>
              <span>{{ product ? t('common.update') : t('common.save') }}</span>
            </template>
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Plus, Loader2, Check, X,
  Box, Coins, Cpu, Image as ImageIcon,
  ChevronRight, ChevronLeft
} from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import SpecsEditor from './SpecsEditor.vue';
import CategorySelect from './CategorySelect.vue';
import { useCategoryStore } from '@/stores/categoryStore';
import { getFieldErrorMessage } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';

const categoryStore = useCategoryStore();

const { t, te, locale } = useI18n();
const showSuccess = ref(false);
const showErrors = ref(false);
const currentTab = ref('info');

const props = defineProps({
  modelValue: Boolean,
  product: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  saving: Boolean,
  fieldErrors: { type: Object, default: () => ({}) },
  errorMessage: { type: [String, Object], default: '' },
  uploadProgress: { type: Number, default: 0 }
});

const emit = defineEmits(['update:modelValue', 'save', 'clear-field-error']);

const wizardTabs = [
  { id: 'info', label: 'common.general', icon: Box },
  { id: 'pricing', label: 'products.pricingWholesale', icon: Coins },
  { id: 'specs', label: 'products.technicalSpecs', icon: Cpu },
  { id: 'media', label: 'products.image', icon: ImageIcon }
];

const form = reactive({
  name_ar: '',
  name_en: '',
  category_id: '',
  description_ar: '',
  description_en: '',
  price: '',
  discount_price: '',
  min_order_quantity: 1,
  quantity_available: 0,
  specs: [],
  images: []
});

const previews = ref([]);

const progressPercentage = computed(() => {
  const index = wizardTabs.findIndex(t => t.id === currentTab.value);
  return Math.round(((index + 1) / wizardTabs.length) * 100);
});

const quantityAvailableLabel = computed(() => (
  te('products.quantity_available')
    ? t('products.quantity_available')
    : (locale.value === 'ar' ? 'الكمية المتاحة' : 'Quantity Available')
));

const hasPriceError = computed(() => {
  const max = form.discount_price;
  if (max === '' || max === null || max === undefined || Number(max) === 0) return false;
  return Number(max) <= Number(form.price || 0);
});
const errorText = computed(() => resolveLocalizedText(props.errorMessage, locale.value, ''));

const fieldMessage = (...keys) => {
  for (const key of keys) {
    const message = getFieldErrorMessage(props.fieldErrors, key, locale.value);
    if (message) return message;
  }
  return '';
};

const handleFieldInput = (...keys) => {
  showErrors.value = false;
  keys.forEach((key) => emit('clear-field-error', key));
};

const isCurrentTabValid = computed(() => {
  if (currentTab.value === 'info') {
    return form.name_ar.length > 2 && form.category_id && form.description_ar.length > 10;
  }
  if (currentTab.value === 'pricing') {
    return form.price > 0 && form.min_order_quantity >= 1 && form.quantity_available >= 0 && !hasPriceError.value;
  }
  return true; 
});

const canGoToTab = (tabId) => {
  const targetIndex = wizardTabs.findIndex(t => t.id === tabId);
  const currentIndex = wizardTabs.findIndex(t => t.id === currentTab.value);
  if (targetIndex <= currentIndex) return true;
  return isCurrentTabValid.value && targetIndex === currentIndex + 1;
};

const goToTab = (tabId) => {
  if (canGoToTab(tabId)) currentTab.value = tabId;
};

const nextTab = () => {
  if (!isCurrentTabValid.value) {
    showErrors.value = true;
    return;
  }
  showErrors.value = false;
  const index = wizardTabs.findIndex(t => t.id === currentTab.value);
  if (index < wizardTabs.length - 1) {
    currentTab.value = wizardTabs[index + 1].id;
  }
};

const prevTab = () => {
  const index = wizardTabs.findIndex(t => t.id === currentTab.value);
  if (index > 0) currentTab.value = wizardTabs[index - 1].id;
};

const resetForm = () => {
  selectedRootCategory.value = '';
  showErrors.value = false;
  Object.assign(form, {
    name_ar: '',
    name_en: '',
    category_id: props.categories[0]?.id || '',
    description_ar: '',
    description_en: '',
    price: '',
    discount_price: '',
    min_order_quantity: 1,
    quantity_available: 0,
    specs: [],
    images: []
  });
  previews.value = [];
  currentTab.value = 'info';
};

const selectedRootCategory = ref('');

const rootCategories = computed(() => {
  const allowedIds = new Set(props.categories.map(c => c.id));
  return props.categories.filter(c => {
    const parentId = c.parent_id || c.parentId;
    // Treat as root if it has no parent OR its parent isn't in the allowed categories list
    return !parentId || !allowedIds.has(parentId);
  });
});

const subCategories = computed(() => {
  if (!selectedRootCategory.value) return [];
  return categoryStore.categories.filter(c => 
    c.parent_id === selectedRootCategory.value || 
    c.parentId === selectedRootCategory.value
  );
});

watch(selectedRootCategory, (newVal) => {
  if (!newVal) {
    form.category_id = '';
    return;
  }
  
  const subs = categoryStore.categories.filter(c => c.parent_id === newVal || c.parentId === newVal);
  if (subs.length === 0) {
    form.category_id = newVal;
  } else {
    const isAlreadyChild = subs.some(c => c.id === form.category_id);
    if (!isAlreadyChild) {
      form.category_id = '';
    }
  }
});
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    const newVal = props.product;
    if (newVal) {
      let rawSpecs = newVal.specs || [];
      try {
        if (typeof rawSpecs === 'string') rawSpecs = JSON.parse(rawSpecs);
      } catch (e) { rawSpecs = []; }

      // Subcategory pre-selection
      const activeCat = categoryStore.categories.find(c => c.id === newVal.category_id);
      if (activeCat && (activeCat.parent_id || activeCat.parentId)) {
        selectedRootCategory.value = activeCat.parent_id || activeCat.parentId;
      } else {
        selectedRootCategory.value = newVal.category_id || '';
      }

      Object.assign(form, {
        name_ar: newVal.name_ar || '',
        name_en: newVal.name_en || '',
        category_id: newVal.category_id || '',
        description_ar: newVal.description_ar || '',
        description_en: newVal.description_en || '',
        price: newVal.price || '',
        discount_price: newVal.discount_price || '',
        min_order_quantity: newVal.min_order_quantity || 1,
        quantity_available: Number(newVal.quantity_available || 0),
        specs: Array.isArray(rawSpecs) ? rawSpecs : [],
        images: []
      });
      const sortedImages = Array.isArray(newVal.images)
        ? [...newVal.images].sort((a, b) => Number(Boolean(b.is_main)) - Number(Boolean(a.is_main)))
        : [];
      previews.value = sortedImages.map((img) => img.image_url).filter(Boolean);
      if (!previews.value.length && (newVal.main_image || newVal.image_url)) {
        previews.value = [newVal.main_image || newVal.image_url];
      }
    } else {
      resetForm();
    }
    showSuccess.value = false;
    currentTab.value = 'info';
  }
});

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  files.forEach(f => {
    if (previews.value.length < 5) {
      form.images.push(f);
      previews.value.push(URL.createObjectURL(f));
    }
  });
};

const handleDropUpload = (e) => {
  const files = Array.from(e.dataTransfer.files);
  files.forEach(f => {
    if (f.type.startsWith('image/') && previews.value.length < 5) {
      form.images.push(f);
      previews.value.push(URL.createObjectURL(f));
    }
  });
};

const removeImage = (index) => {
  form.images.splice(index, 1);
  previews.value.splice(index, 1);
};

const setPrimary = (index) => {
  const p = previews.value.splice(index, 1)[0];
  previews.value.unshift(p);
  if (form.images.length > index) {
    const f = form.images.splice(index, 1)[0];
    form.images.unshift(f);
  }
};

let dragIndex = null;
const onDragStart = (e, index) => {
  dragIndex = index;
  e.dataTransfer.effectAllowed = 'move';
};

const onDrop = (e, dropIndex) => {
  if (dragIndex !== null && dragIndex !== dropIndex) {
    const movedPrev = previews.value.splice(dragIndex, 1)[0];
    previews.value.splice(dropIndex, 0, movedPrev);
    if (form.images.length > 0) {
      const movedImg = form.images.splice(dragIndex, 1)[0];
      form.images.splice(dropIndex, 0, movedImg);
    }
  }
  dragIndex = null;
};

const handleSave = async () => {
  emit('save', { ...form });
};
</script>

<style scoped>
.font-plex { font-family: 'IBM Plex Sans Arabic', 'Inter', sans-serif; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 30px; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Cinematic Fade & Slide Transition */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.98);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(1.02);
}

.scale-enter-active { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from { opacity: 0; transform: scale(1.1) translateY(20px); }

@keyframes shadow-glow-teal {
  0%, 100% { box-shadow: 0 0 15px -5px rgba(44, 177, 161, 0.2); }
  50% { box-shadow: 0 0 30px 0px rgba(44, 177, 161, 0.4); }
}
.shadow-glow-teal { animation: shadow-glow-teal 3s infinite; }

@keyframes bounce {
  0%, 100% { transform: translateY(-8%); }
  50% { transform: translateY(0); }
}
.animate-bounce { animation: bounce 1.2s infinite; }
</style>
