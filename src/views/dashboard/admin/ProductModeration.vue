<template>
  <div class="space-y-8 font-plex">
    <section class="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-card via-white to-accent/60 p-6 shadow-premium backdrop-blur-xl sm:p-8 dark:from-card dark:via-card dark:to-accent/15">
      <div class="absolute inset-y-0 end-0 hidden w-1/3 bg-gradient-to-bl from-primary/10 via-transparent to-secondary/5 lg:block"></div>
      <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-primary shadow-sm dark:bg-card/80">
            <Shield class="h-4 w-4" />
            {{ locale === 'ar' ? 'مركز مراجعة المنتجات' : 'Product Moderation Center' }}
          </div>
          <div>
            <h1 class="text-3xl font-black tracking-tight text-secondary sm:text-4xl dark:text-slate-100">
              {{ locale === 'ar' ? 'مراجعة منتجات الموردين حسب الشركة' : 'Review supplier products by vendor' }}
            </h1>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {{ locale === 'ar'
                ? 'نظّم المراجعة حسب المورد، وافتح معاينة سريعة، ثم اعتمد أو ارفض كل منتج مع توثيق واضح لقرار المراجعة.'
                : 'Work vendor-first, open a rich preview drawer, and approve or reject every product with a clear moderation trail.' }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-border/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-card/80">
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{{ summaryPendingLabel }}</p>
            <p class="mt-2 text-2xl font-black text-primary dark:text-primary">{{ moderationStore.statusCounts.pending }}</p>
          </div>
          <div class="rounded-2xl border border-border/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-card/80">
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{{ summaryApprovedLabel }}</p>
            <p class="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-300">{{ moderationStore.statusCounts.approved }}</p>
          </div>
          <div class="col-span-2 rounded-2xl border border-border/80 bg-white/80 p-4 shadow-sm backdrop-blur sm:col-span-1 dark:bg-card/80">
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{{ summaryRejectedLabel }}</p>
            <p class="mt-2 text-2xl font-black text-rose-600 dark:text-rose-300">{{ moderationStore.statusCounts.rejected }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-[1.75rem] border border-border bg-card/85 p-3 shadow-premium backdrop-blur sm:p-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="changeTab(tab.value)"
          :class="[
            'rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.24em] transition-all',
            moderationStore.activeTab === tab.value
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-secondary dark:hover:text-slate-100'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </section>

    <section v-if="moderationStore.loading" class="space-y-5">
      <div v-for="index in 3" :key="index" class="overflow-hidden rounded-[1.75rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
        <div class="flex items-center gap-4">
          <div class="h-14 w-14 animate-pulse rounded-2xl bg-muted"></div>
          <div class="space-y-3">
            <div class="h-4 w-48 animate-pulse rounded-full bg-muted"></div>
            <div class="h-3 w-28 animate-pulse rounded-full bg-muted/70"></div>
          </div>
        </div>
        <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="card in 3" :key="card" class="rounded-[1.5rem] border border-border bg-background/70 p-4">
            <div class="mb-4 h-40 animate-pulse rounded-[1.25rem] bg-muted"></div>
            <div class="space-y-3">
              <div class="h-4 w-2/3 animate-pulse rounded-full bg-muted"></div>
              <div class="h-3 w-1/2 animate-pulse rounded-full bg-muted/70"></div>
              <div class="h-10 animate-pulse rounded-2xl bg-muted/70"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="vendorGroups.length" class="space-y-6">
      <article
        v-for="group in vendorGroups"
        :key="group.key"
        class="overflow-hidden rounded-[1.75rem] border border-border bg-card/90 shadow-premium backdrop-blur"
      >
        <button
          class="flex w-full items-center justify-between gap-4 border-b border-border bg-gradient-to-r from-secondary/5 via-transparent to-primary/10 px-5 py-5 text-start sm:px-6"
          @click="toggleVendor(group.key)"
        >
          <div class="flex min-w-0 items-center gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white text-secondary shadow-sm dark:bg-card">
              <img v-if="group.vendorLogo" :src="group.vendorLogo" class="h-full w-full object-cover" />
              <User v-else class="h-6 w-6 text-primary" />
            </div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-lg font-black text-secondary dark:text-slate-100">
                  {{ locale === 'ar' ? group.vendorNameAr : group.vendorNameEn }}
                </h2>
                <span class="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                  {{ locale === 'ar' ? `قيد المراجعة: ${group.pendingCount}` : `Pending items: ${group.pendingCount}` }}
                </span>
              </div>
              <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                {{ group.products.length }} {{ locale === 'ar' ? 'منتج مرتبط بهذا المورد' : 'products in this vendor queue' }}
              </p>
            </div>
          </div>
          <ChevronDown
            class="h-5 w-5 shrink-0 text-muted-foreground transition-transform md:hidden"
            :class="{ 'rotate-180': isVendorExpanded(group.key) }"
          />
        </button>

        <div v-show="isDesktop || isVendorExpanded(group.key)" class="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
          <button
            v-for="product in group.products"
            :key="product.id"
            class="group overflow-hidden rounded-[1.5rem] border border-border bg-card/90 text-start shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_45px_-32px_hsl(var(--primary)/0.35)]"
            @click="openPreview(product)"
          >
            <div class="relative aspect-[4/3] overflow-hidden bg-muted">
              <img v-if="product.main_image" :src="product.main_image" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div v-else class="flex h-full items-center justify-center">
                <Box class="h-10 w-10 text-muted-foreground/50" />
              </div>
              <div class="absolute start-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-secondary shadow-sm backdrop-blur dark:bg-card/90 dark:text-slate-100">
                <span class="h-2 w-2 rounded-full" :class="statusDot(effectiveRecordState(product))"></span>
                {{ statusLabel(effectiveRecordState(product)) }}
              </div>
            </div>

              <div class="space-y-4 p-4">
                <div>
                  <h3 class="line-clamp-2 text-base font-black text-secondary dark:text-slate-100">
                    {{ locale === 'ar' ? product.name_ar : (product.name_en || product.name_ar) }}
                  </h3>
                  <p
                    v-if="product.model_number"
                    class="mt-2 text-xs font-bold tracking-[0.08em] text-primary"
                    dir="ltr"
                  >
                    {{ locale === 'ar' ? 'موديل:' : 'Model:' }} {{ product.model_number }}
                  </p>
                  <p class="mt-2 line-clamp-3 text-xs leading-6 text-muted-foreground">
                    {{ locale === 'ar' ? (product.description_ar || product.description_en || '') : (product.description_en || product.description_ar || '') }}
                  </p>
              </div>

              <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                <span>{{ formatDate(product.created_at) }}</span>
                <span>{{ product.views_count || 0 }} {{ locale === 'ar' ? 'مشاهدة' : 'views' }}</span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  v-if="effectiveRecordState(product) !== 'DELETED' && !isApproved(product)"
                  class="flex-1 rounded-2xl bg-primary px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:opacity-90"
                  @click.stop="approveFromCard(product)"
                >
                  {{ locale === 'ar' ? 'اعتماد' : 'Approve' }}
                </button>
                <button
                  v-if="canShowRejectAction(product)"
                  class="flex-1 rounded-2xl bg-rose-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 transition hover:bg-rose-100"
                  @click.stop="startReject(product)"
                >
                  {{ locale === 'ar' ? (isApproved(product) ? 'إيقاف وتعليق' : 'رفض') : (isApproved(product) ? 'Deactivate' : 'Reject') }}
                </button>
                <button
                  v-if="canDeleteRejectedProduct(product)"
                  class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white transition hover:bg-slate-800"
                  @click.stop="deleteRejectedProductFromCard(product)"
                  :title="locale === 'ar' ? 'حذف المنتج نهائيًا' : 'Delete product'"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </button>
        </div>
      </article>
    </section>

    <section v-else class="rounded-[2rem] border border-dashed border-primary/30 bg-gradient-to-br from-accent/60 via-card to-white p-10 text-center shadow-[0_24px_50px_-35px_hsl(var(--primary)/0.35)] dark:from-accent/10 dark:via-card dark:to-card">
      <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/80 shadow-lg">
        <Shield class="h-10 w-10 text-primary" />
      </div>
      <h2 class="mt-6 text-2xl font-black text-secondary dark:text-slate-100">
        {{ locale === 'ar' ? 'تمت مراجعة كل المنتجات. عمل رائع.' : 'All products are reviewed. Nice work.' }}
      </h2>
      <p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        {{ locale === 'ar'
          ? 'لا توجد عناصر معلقة في هذا القسم الآن. يمكنك التبديل بين التبويبات لمراجعة المنتجات المعتمدة أو المرفوضة.'
          : 'There are no pending items in this section right now. Switch tabs to inspect approved or rejected products.' }}
      </p>
    </section>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="previewOpen" class="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" @click="closePreview"></div>
      </Transition>
      <Transition name="drawer">
        <aside
          v-if="previewOpen"
          class="fixed inset-y-0 end-0 z-[60] flex w-full max-w-3xl flex-col overflow-hidden border-s border-border/70 bg-card/95 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.45)] backdrop-blur-2xl"
        >
          <div class="flex items-start justify-between border-b border-border px-5 py-5 sm:px-7">
            <div>
              <p class="text-[11px] font-black uppercase tracking-[0.26em] text-primary">
                {{ locale === 'ar' ? 'معاينة سريعة' : 'Quick preview' }}
              </p>
              <h3 class="mt-2 text-2xl font-black text-secondary dark:text-slate-100">
                {{ currentProductTitle }}
              </h3>
              <p class="mt-2 text-sm text-muted-foreground">
                {{ currentVendorName }}
              </p>
            </div>
            <button class="rounded-2xl bg-muted p-3 text-muted-foreground transition hover:bg-accent hover:text-secondary dark:hover:text-slate-100" @click="closePreview">
              <X class="h-5 w-5" />
            </button>
          </div>

          <div v-if="moderationStore.detailLoading && !selectedDetail" class="flex-1 space-y-5 overflow-y-auto p-6 sm:p-7">
            <div class="h-72 animate-pulse rounded-[1.75rem] bg-muted"></div>
            <div class="grid gap-4 sm:grid-cols-3">
              <div v-for="item in 3" :key="item" class="h-24 animate-pulse rounded-2xl bg-muted/70"></div>
            </div>
            <div class="h-40 animate-pulse rounded-[1.5rem] bg-muted/70"></div>
          </div>

          <div v-else-if="selectedDetail" class="flex-1 overflow-y-auto p-6 sm:p-7">
            <div class="space-y-7">
              <div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
                <div class="space-y-4">
                  <div class="overflow-hidden rounded-[1.75rem] border border-border bg-muted">
                    <img
                      v-if="activePreviewImage"
                      :src="activePreviewImage"
                      class="h-[320px] w-full object-cover sm:h-[380px]"
                    />
                    <div v-else class="flex h-[320px] items-center justify-center sm:h-[380px]">
                      <Box class="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  </div>
                  <div class="grid grid-cols-4 gap-3">
                    <button
                      v-for="image in detailImages"
                      :key="image"
                      class="overflow-hidden rounded-2xl border-2 transition"
                      :class="activePreviewImage === image ? 'border-primary' : 'border-border'"
                      @click="activePreviewImage = image"
                    >
                      <img :src="image" class="h-20 w-full object-cover" />
                    </button>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="rounded-[1.5rem] border border-border bg-card/85 p-5 shadow-sm">
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">{{ locale === 'ar' ? 'المورد' : 'Vendor' }}</p>
                    <div class="mt-4 flex items-center gap-4">
                      <div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
                        <img v-if="selectedDetail.vendor?.logo" :src="selectedDetail.vendor.logo" class="h-full w-full object-cover" />
                        <User v-else class="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p class="font-black text-secondary dark:text-slate-100">{{ currentVendorName }}</p>
                        <p class="mt-1 text-xs text-muted-foreground">
                          {{ locale === 'ar' ? 'منتج تحت المراجعة' : 'Product in moderation' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-[1.5rem] border border-border bg-card/85 p-5 shadow-sm">
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">{{ locale === 'ar' ? 'البيانات التجارية' : 'Commercial details' }}</p>
                    <div class="mt-4 space-y-3 text-sm text-muted-foreground">
                      <div class="flex items-center justify-between gap-4">
                        <span>{{ locale === 'ar' ? 'السعر' : 'Price' }}</span>
                        <strong class="text-secondary dark:text-slate-100">
                          {{ Number(selectedDetail.price_max || selectedDetail.discount_price || 0) > Number(selectedDetail.price || 0)
                            ? `${formatCurrency(selectedDetail.price)} - ${formatCurrency(selectedDetail.price_max || selectedDetail.discount_price)}`
                            : formatCurrency(selectedDetail.price) }}
                        </strong>
                      </div>
                      <div v-if="selectedDetail.model_number" class="flex items-center justify-between gap-4">
                        <span>{{ locale === 'ar' ? 'رقم الموديل' : 'Model No.' }}</span>
                        <strong class="text-secondary dark:text-slate-100" dir="ltr">{{ selectedDetail.model_number }}</strong>
                      </div>
                      <div class="flex items-center justify-between gap-4">
                        <span>{{ locale === 'ar' ? 'الحد الأدنى للطلب' : 'MOQ' }}</span>
                        <strong class="text-secondary dark:text-slate-100">{{ selectedDetail.min_order_quantity || 1 }}</strong>
                      </div>
                      <div class="flex items-center justify-between gap-4">
                        <span>{{ locale === 'ar' ? 'الكمية المتاحة' : 'Available quantity' }}</span>
                        <strong class="text-secondary dark:text-slate-100">{{ Number(selectedDetail.quantity_available || 0) }}</strong>
                      </div>
                      <div class="flex items-center justify-between gap-4">
                        <span>{{ locale === 'ar' ? 'الاستفسارات' : 'Inquiries' }}</span>
                        <strong class="text-secondary dark:text-slate-100">{{ selectedProduct?.inquiries_count || 0 }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-[1.5rem] border border-border bg-card/85 p-5 shadow-sm">
                <div class="flex items-center gap-3">
                  <Box class="h-5 w-5 text-primary" />
                  <h4 class="text-lg font-black text-secondary dark:text-slate-100">{{ locale === 'ar' ? 'الوصف الكامل' : 'Full description' }}</h4>
                </div>
                <div class="mt-4 grid gap-4 md:grid-cols-2">
                  <div class="rounded-2xl bg-muted/60 p-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">AR</p>
                    <p class="mt-3 text-sm leading-7 text-foreground">{{ selectedDetail.description_ar || selectedDetail.description_en || '-' }}</p>
                  </div>
                  <div class="rounded-2xl bg-muted/60 p-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">EN</p>
                    <p class="mt-3 text-sm leading-7 text-foreground">{{ selectedDetail.description_en || selectedDetail.description_ar || '-' }}</p>
                  </div>
                </div>
              </div>

              <div class="rounded-[1.5rem] border border-border bg-card/85 p-5 shadow-sm">
                <div class="flex items-center gap-3">
                  <PanelRightOpen class="h-5 w-5 text-primary" />
                  <h4 class="text-lg font-black text-secondary dark:text-slate-100">{{ locale === 'ar' ? 'المواصفات الفنية' : 'Technical specifications' }}</h4>
                </div>
                <div v-if="specEntries.length" class="mt-4 overflow-hidden rounded-[1.25rem] border border-border">
                  <table class="w-full text-sm">
                    <tbody>
                      <tr v-for="entry in specEntries" :key="entry.key" class="border-t border-border first:border-t-0">
                        <td class="w-1/3 bg-muted/60 px-4 py-3 font-bold text-muted-foreground">{{ entry.key }}</td>
                        <td class="px-4 py-3 text-foreground">{{ entry.value }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p v-else class="mt-4 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  {{ locale === 'ar' ? 'لا توجد مواصفات فنية مضافة حتى الآن.' : 'No technical specifications have been added yet.' }}
                </p>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 border-t border-border bg-card/95 px-5 py-4 backdrop-blur sm:px-7">
            <div v-if="showRejectForm" class="mb-4 rounded-[1.5rem] border border-rose-100 bg-rose-50/80 p-4">
              <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-rose-500">
                {{ locale === 'ar' ? 'سبب الرفض' : 'Rejection reason' }}
              </label>
              <textarea
                v-model="rejectReason"
                rows="3"
                class="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm text-secondary outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                :placeholder="locale === 'ar' ? 'اذكر ملاحظات المراجعة المطلوبة من المورد' : 'Describe the review feedback the vendor needs to fix'"
              />
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 v-if="showSuccessBurst" class="h-5 w-5 text-primary" />
                <span>{{ locale === 'ar' ? 'قرار المراجعة يحدّث الواجهة فورًا.' : 'Review decisions update the queue immediately.' }}</span>
              </div>
              <div class="flex flex-wrap gap-3">
                <button
                  v-if="showRejectForm"
                  class="rounded-2xl bg-muted px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground transition hover:bg-accent hover:text-secondary"
                  @click="cancelReject"
                >
                  {{ locale === 'ar' ? 'إلغاء' : 'Cancel' }}
                </button>
                <button
                  v-if="!showRejectForm && canShowRejectAction(selectedProduct)"
                  class="rounded-2xl bg-rose-50 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 transition hover:bg-rose-100"
                  @click="showRejectForm = true"
                >
                  {{ locale === 'ar' ? (isApproved(selectedProduct) ? 'إيقاف وتعليق' : 'رفض') : (isApproved(selectedProduct) ? 'Deactivate' : 'Reject') }}
                </button>
                <button
                  v-else-if="showRejectForm && canShowRejectAction(selectedProduct)"
                  class="rounded-2xl bg-rose-500 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-rose-600 disabled:opacity-40"
                  :disabled="!rejectReason.trim() || submitting"
                  @click="submitReview('rejected')"
                >
                  {{ locale === 'ar' 
                      ? (isApproved(selectedProduct) ? 'تأكيد الإيقاف' : 'تأكيد الرفض') 
                      : (isApproved(selectedProduct) ? 'Confirm deactivate' : 'Confirm reject') 
                  }}
                </button>
                <button
                  v-if="!isApproved(selectedProduct)"
                  class="rounded-2xl bg-primary px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:opacity-50"
                  :disabled="submitting"
                  @click="submitReview('approved')"
                >
                  <span v-if="!submitting">{{ locale === 'ar' ? 'اعتماد المنتج' : 'Approve product' }}</span>
                  <span v-else>{{ locale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...' }}</span>
                </button>
                <button
                  v-if="canDeleteRejectedProduct(selectedProduct)"
                  class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800 disabled:opacity-50"
                  :disabled="submitting"
                  @click="deleteRejectedProduct"
                >
                  <Trash2 class="h-4 w-4" />
                  <span>{{ locale === 'ar' ? 'حذف المنتج نهائيًا' : 'Delete product' }}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Box,
  CheckCircle2,
  ChevronDown,
  PanelRightOpen,
  Shield,
  Trash2,
  User,
  X,
} from 'lucide-vue-next';
import { useAdminProductModerationStore } from '@/stores/adminProductModerationStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { normalizeError } from '@/utils/errorHandler';
import { useUiStore } from '@/stores/ui';
import { formatEGPCurrency } from '@/utils/currency';

const { locale } = useI18n();
const moderationStore = useAdminProductModerationStore();
const notificationStore = useNotificationStore();
const uiStore = useUiStore();

const tabs = computed(() => ([
  { value: 'PENDING', label: locale.value === 'ar' ? 'قيد المراجعة' : 'Pending' },
  { value: 'APPROVED', label: locale.value === 'ar' ? 'معتمد' : 'Approved' },
  { value: 'REJECTED', label: locale.value === 'ar' ? 'مرفوض' : 'Rejected' },
]));

const vendorGroups = computed(() => moderationStore.groupedByVendor);
const activeTabLabel = computed(() => tabs.value.find((tab) => tab.value === moderationStore.activeTab)?.label || tabs.value[0].label);
const summaryPendingLabel = computed(() => locale.value === 'ar' ? 'قيد المراجعة' : 'Under Review');
const summaryApprovedLabel = computed(() => locale.value === 'ar' ? 'معتمد' : 'Approved');
const summaryRejectedLabel = computed(() => locale.value === 'ar' ? 'مرفوض' : 'Rejected');

const previewOpen = ref(false);
const selectedProduct = ref(null);
const selectedDetail = ref(null);
const activePreviewImage = ref('');
const showRejectForm = ref(false);
const rejectReason = ref('');
const showSuccessBurst = ref(false);
const submitting = ref(false);
const expandedVendors = ref(new Set());
const isDesktop = ref(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

const updateViewportMode = () => {
  isDesktop.value = window.innerWidth >= 768;
  if (isDesktop.value) {
    expandedVendors.value = new Set(vendorGroups.value.map((group) => group.key));
  }
};

const ensureExpandedGroups = () => {
  if (isDesktop.value) {
    expandedVendors.value = new Set(vendorGroups.value.map((group) => group.key));
  } else if (!expandedVendors.value.size && vendorGroups.value.length) {
    expandedVendors.value = new Set([vendorGroups.value[0].key]);
  }
};

const detailImages = computed(() => {
  const images = selectedDetail.value?.images || [];
  return images.map((image) => image.image_url || image).filter(Boolean);
});

const specEntries = computed(() => {
  const specs = selectedDetail.value?.specs;
  if (!specs) return [];

  if (Array.isArray(specs)) {
    return specs.map((entry) => ({
      key: entry.key_ar || entry.key_en || entry.key || '-',
      value: entry.value_ar || entry.value_en || entry.value || '-',
    }));
  }

  if (typeof specs === 'object') {
    return Object.entries(specs).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : value,
    }));
  }

  return [];
});

const currentProductTitle = computed(() => {
  if (!selectedDetail.value) return '';
  return locale.value === 'ar'
    ? (selectedDetail.value.name_ar || selectedDetail.value.name_en || '')
    : (selectedDetail.value.name_en || selectedDetail.value.name_ar || '');
});

const currentVendorName = computed(() => {
  if (!selectedDetail.value?.vendor) return '';
  return locale.value === 'ar'
    ? (selectedDetail.value.vendor.company_name_ar || selectedDetail.value.vendor.company_name_en || '')
    : (selectedDetail.value.vendor.company_name_en || selectedDetail.value.vendor.company_name_ar || '');
});

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  : '';

const formatCurrency = (value) => formatEGPCurrency(value, locale.value);

const statusLabel = (status) => {
  const normalized = (status || 'PENDING').toUpperCase();
  if (locale.value === 'ar') {
    if (normalized === 'DELETED') return 'محذوف';
    if (normalized === 'APPROVED') return 'معتمد';
    if (normalized === 'REJECTED') return 'مرفوض';
    if (normalized === 'UPDATE_PENDING') return 'تحديث قيد المراجعة';
    return 'قيد المراجعة';
  }

  if (normalized === 'DELETED') return 'Deleted';
  if (normalized === 'APPROVED') return 'Approved';
  if (normalized === 'REJECTED') return 'Rejected';
  if (normalized === 'UPDATE_PENDING') return 'Update pending';
  return 'Pending';
};

const statusDot = (status) => {
  const normalized = (status || 'PENDING').toUpperCase();
  if (normalized === 'DELETED') return 'bg-slate-500';
  if (normalized === 'APPROVED') return 'bg-emerald-500';
  if (normalized === 'REJECTED') return 'bg-rose-500';
  if (normalized === 'UPDATE_PENDING') return 'bg-orange-500';
  return 'bg-amber-500';
};
const effectiveRecordState = (product) => `${product?.record_state || product?.lifecycle_status || product?.status || 'PENDING'}`.toUpperCase();
const isApproved = (product) => {
  return effectiveRecordState(product) === 'APPROVED';
};
const canShowRejectAction = (product) => {
  const state = effectiveRecordState(product);
  return state !== 'DELETED' && state !== 'REJECTED';
};
const canDeleteRejectedProduct = (product) => effectiveRecordState(product) === 'REJECTED';

const isVendorExpanded = (key) => expandedVendors.value.has(key);

const toggleVendor = (key) => {
  if (isDesktop.value) return;

  const next = new Set(expandedVendors.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  expandedVendors.value = next;
};

const changeTab = async (tab) => {
  closePreview();
  await moderationStore.fetchProducts(tab);
  ensureExpandedGroups();
};

const openPreview = async (product) => {
  selectedProduct.value = product;
  previewOpen.value = true;
  showRejectForm.value = false;
  rejectReason.value = '';
  selectedDetail.value = moderationStore.productDetails[product.id] || null;
  activePreviewImage.value = selectedDetail.value?.main_image || '';

  try {
    const detail = await moderationStore.fetchProductDetail(product.id);
    selectedDetail.value = detail;
    activePreviewImage.value = detailImages.value[0] || detail.main_image || '';
  } catch {
    notificationStore.error(locale.value === 'ar' ? 'تعذر تحميل تفاصيل المنتج.' : 'Could not load product details.');
  }
};

const closePreview = () => {
  previewOpen.value = false;
  selectedProduct.value = null;
  selectedDetail.value = null;
  activePreviewImage.value = '';
  showRejectForm.value = false;
  rejectReason.value = '';
  showSuccessBurst.value = false;
};

const startReject = async (product) => {
  await openPreview(product);
  showRejectForm.value = true;
};

const cancelReject = () => {
  showRejectForm.value = false;
  rejectReason.value = '';
};

const deleteRejectedProduct = async () => {
  if (!selectedProduct.value || !canDeleteRejectedProduct(selectedProduct.value)) return;

  const confirmed = await notificationStore.confirm(
    locale.value === 'ar'
      ? 'سيتم حذف المنتج المرفوض نهائيًا ولن تتمكن من استعادته. هل تريد المتابعة؟'
      : 'This rejected product will be deleted permanently and cannot be restored. Continue?',
    locale.value === 'ar' ? 'تأكيد الحذف' : 'Confirm deletion'
  );

  if (!confirmed) return;

  submitting.value = true;
  try {
    await moderationStore.deleteRejectedProduct(selectedProduct.value.id);
    uiStore.showToast(
      locale.value === 'ar' ? 'تم حذف المنتج المرفوض بالكامل.' : 'Rejected product deleted successfully.',
      'success'
    );
    closePreview();
  } catch (error) {
    notificationStore.error(
      normalizeError(error).message ||
      (locale.value === 'ar' ? 'فشل حذف المنتج.' : 'Failed to delete product.')
    );
  } finally {
    submitting.value = false;
  }
};

const deleteRejectedProductFromCard = async (product) => {
  if (!product || !canDeleteRejectedProduct(product)) return;

  const confirmed = await notificationStore.confirm(
    locale.value === 'ar'
      ? 'سيتم حذف المنتج المرفوض نهائيًا ولن تتمكن من استعادته. هل تريد المتابعة؟'
      : 'This rejected product will be deleted permanently and cannot be restored. Continue?',
    locale.value === 'ar' ? 'تأكيد الحذف' : 'Confirm deletion'
  );

  if (!confirmed) return;

  try {
    await moderationStore.deleteRejectedProduct(product.id);
    uiStore.showToast(
      locale.value === 'ar' ? 'تم حذف المنتج المرفوض بالكامل.' : 'Rejected product deleted successfully.',
      'success'
    );
    if (Number(selectedProduct.value?.id) === Number(product.id)) {
      closePreview();
    }
  } catch (error) {
    notificationStore.error(
      normalizeError(error).message ||
      (locale.value === 'ar' ? 'فشل حذف المنتج.' : 'Failed to delete product.')
    );
  }
};

const submitReview = async (status) => {
  if (!selectedProduct.value) return;
  if (status === 'rejected' && !rejectReason.value.trim()) return;

  submitting.value = true;
  try {
    await moderationStore.reviewProduct({
      productId: selectedProduct.value.id,
      status,
      rejection_reason: status === 'rejected' ? rejectReason.value.trim() : null,
    });

    showSuccessBurst.value = status === 'approved';
    uiStore.showToast(
      status === 'approved'
        ? (locale.value === 'ar' ? 'تم اعتماد المنتج بنجاح.' : 'Product approved successfully.')
        : (locale.value === 'ar' ? 'تم رفض المنتج مع حفظ سبب الرفض.' : 'Product rejected with feedback saved.'),
      'success'
    );

    setTimeout(() => {
      closePreview();
    }, status === 'approved' ? 700 : 250);
  } catch (error) {
    notificationStore.error(
      normalizeError(error).message ||
      (locale.value === 'ar' ? 'فشل تحديث حالة المنتج.' : 'Failed to update product status.')
    );
  } finally {
    submitting.value = false;
  }
};

const approveFromCard = async (product) => {
  await openPreview(product);
  await submitReview('approved');
};

watch(vendorGroups, ensureExpandedGroups, { immediate: true });

onMounted(async () => {
  window.addEventListener('resize', updateViewportMode);
  updateViewportMode();
  await Promise.all([
    moderationStore.fetchProducts('PENDING'),
    moderationStore.fetchSummary()
  ]);
  ensureExpandedGroups();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportMode);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

