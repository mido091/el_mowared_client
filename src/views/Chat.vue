<template>
  <div class="relative isolate flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 font-sans rtl:font-arabic dark:bg-slate-900">
    
    <!-- Mobile Back Overlay -->
    <div v-if="chatStore.activeConversation" class="absolute inset-0 z-10 bg-black/20 transition-opacity md:hidden" @click="closeConversationMobile"></div>
    
    <!-- Sidebar: Conversations List -->
    <aside 
      :class="[
        'z-20 w-full shrink-0 border-e border-slate-200 bg-white/80 shadow-lg backdrop-blur-xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900/80 md:w-[380px]',
        chatStore.activeConversation ? '-translate-x-full rtl:translate-x-full md:translate-x-0 md:rtl:translate-x-0 absolute md:relative h-full' : 'translate-x-0'
      ]"
    >
      <!-- Header & Search -->
      <div class="p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <h2 class="font-bold text-xl text-slate-800 dark:text-slate-100 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <MessageSquare class="w-6 h-6 text-teal-500" />
            {{ t('chat.conversations') }}
          </div>
          <button 
            @click="showVendorModal = true"
            class="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all shadow-sm"
            :title="t('chat.new_chat')"
          >
            <Plus class="w-5 h-5" />
          </button>
        </h2>
        
        <!-- Search Input -->
        <div class="relative">
          <Search class="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            :placeholder="t('chat.search')" 
            class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 ps-9 pe-4 text-sm focus:ring-2 focus:ring-teal-500 transition-shadow text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button 
            v-for="tab in ['all', 'unread']" 
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'flex-1 py-1.5 text-xs font-semibold rounded-md transition-all capitalize',
              activeTab === tab ? 'bg-white dark:bg-slate-700 text-navy-700 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            ]"
          >
            {{ t(`chat.tabs.${tab}`) }}
          </button>
        </div>
      </div>
      
      <!-- Conversation List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <!-- Loaders -->
        <div v-if="chatStore.loading" class="p-4 space-y-4">
          <div v-for="i in 6" :key="i" class="flex gap-4">
            <SkeletonLoader type="avatar" size="lg" />
            <div class="flex-1 space-y-2 py-1">
              <SkeletonLoader type="text" width="70%" />
              <SkeletonLoader type="text" width="40%" />
            </div>
          </div>
        </div>

        <div
          v-else-if="chatStore.error && !chatStore.conversations.length"
          class="m-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-start shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10"
        >
          <p class="text-sm font-bold text-rose-700 dark:text-rose-300">
            {{ chatErrorText }}
          </p>
          <button
            @click="chatStore.fetchConversations()"
            class="mt-3 inline-flex items-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            {{ t('common.refresh') }}
          </button>
        </div>
        
        <!-- Empty State -->
        <EmptyState 
          v-else-if="!filteredConversations.length" 
          :title="t('chat.noConversations')" 
          :icon="MessageSquare" 
          class="py-12" 
        />
        
        <!-- Conversation Items -->
        <button
          v-else
          v-for="conv in filteredConversations"
          :key="conv.id"
          @click="selectConversation(conv)"
          :class="[
            'w-full flex items-start gap-3 p-4 text-start hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 focus:outline-none',
            chatStore.activeConversation?.id === conv.id ? 'bg-teal-50/50 dark:bg-teal-900/10 border-s-4 border-s-teal-500' : 'border-s-4 border-s-transparent'
          ]"
        >
          <!-- Avatar Status -->
          <div class="relative shrink-0 mt-1">
            <img v-if="getAvatar(conv)" :src="getAvatar(conv)" class="w-12 h-12 rounded-full object-cover shadow-sm bg-white border border-slate-200 dark:border-slate-700" />
            <div v-else class="w-12 h-12 rounded-full bg-navy-50 dark:bg-navy-900/50 border border-navy-100 dark:border-navy-800 flex items-center justify-center font-bold text-navy-600 dark:text-navy-300 text-lg shadow-inner">
              {{ getOtherParty(conv).charAt(0).toUpperCase() }}
            </div>
            <!-- Online Dot -->
            <span v-if="chatStore.isOtherPartyOnline(getParticipantId(conv))" class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-teal-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </div>

          <!-- Payload -->
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline mb-1">
              <p class="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate pe-2">{{ getOtherParty(conv) }}</p>
              <span class="text-[10px] text-slate-400 font-medium shrink-0 pt-0.5">{{ formatTime(conv.updated_at) }}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <p class="text-[13px] text-slate-500 dark:text-slate-400 truncate leading-relaxed flex-1">
                <span v-if="conv.type === 'SUPPORT'" class="text-rose-500 font-bold me-1 text-[10px] py-0.5 px-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded uppercase">{{ t('chat.support') }}</span>
                {{ conv.last_message || t('chat.noMessages') }}
              </p>
              <!-- Unread Badge Teal -->
              <span v-if="conv.unread_count > 0" class="shrink-0 bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                {{ conv.unread_count > 99 ? '99+' : conv.unread_count }}
              </span>
            </div>
          </div>
        </button>
      </div>
    </aside>

    <!-- Main Chat Workspace -->
    <div 
      :class="[
        'absolute inset-0 z-20 flex min-w-0 flex-1 flex-col bg-slate-50/50 transition-transform duration-300 ease-in-out dark:bg-[#0f172a] md:static md:z-auto',
        !chatStore.activeConversation ? 'translate-x-full rtl:-translate-x-full md:translate-x-0 md:rtl:translate-x-0' : 'translate-x-0'
      ]"
    >
      <!-- Chat Header -->
      <div v-if="chatStore.activeConversation" class="sticky top-0 z-10 flex h-[72px] shrink-0 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 md:px-6">
        <button @click="closeConversationMobile" class="md:hidden p-2 -ms-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors">
          <ChevronLeft class="w-6 h-6 rtl:rotate-180" />
        </button>
        
        <div class="relative shrink-0">
           <img v-if="getAvatar(chatStore.activeConversation)" :src="getAvatar(chatStore.activeConversation)" class="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
           <div v-else class="w-10 h-10 rounded-full bg-navy-50 dark:bg-navy-900/50 border border-navy-100 dark:border-navy-800 flex items-center justify-center font-bold text-navy-600 dark:text-navy-300 text-sm shadow-inner">
             {{ getOtherParty(chatStore.activeConversation).charAt(0).toUpperCase() }}
           </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-slate-800 dark:text-slate-100 text-[15px] truncate">{{ getOtherParty(chatStore.activeConversation) }}</h3>
            <!-- Role Badge -->
            <span v-if="getRoleBadge(chatStore.activeConversation)" class="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {{ getRoleBadge(chatStore.activeConversation) }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 mt-[2px]">
            <span class="w-1.5 h-1.5 rounded-full" :class="chatStore.isOtherPartyOnline(getParticipantId(chatStore.activeConversation)) ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'"></span>
            <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {{ chatStore.isOtherPartyOnline(getParticipantId(chatStore.activeConversation)) ? t('chat.online') : t('chat.offline') }}
            </p>
          </div>
        </div>
        
        <div v-if="canEndConversation || canDeleteConversation" class="flex items-center gap-2">
          <button
            v-if="canDeleteConversation"
            @click="deleteActiveConversation"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-500/20 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
            :title="t('chat.deleteConversation') || 'Delete Chat'"
          >
            <Trash2 class="h-[18px] w-[18px]" />
            <span>{{ t('chat.deleteConversation') || 'Delete Messages' }}</span>
          </button>
          <button
            v-else-if="canEndConversation"
            @click="endActiveConversation"
            class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
          >
            {{ t('chat.endConversation') || 'End Conversation' }}
          </button>
        </div>
      </div>

      <!-- Empty State Selection -->
      <div v-if="!chatStore.activeConversation" class="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50">
        <div class="w-32 h-32 mb-6 opacity-40 bg-navy-100 dark:bg-navy-900/40 rounded-full flex items-center justify-center">
          <MessageSquare class="w-12 h-12 text-navy-500 dark:text-navy-300" />
        </div>
        <h3 class="text-[17px] font-bold text-slate-700 dark:text-slate-200 mb-2">{{ t('chat.selectConversation') }}</h3>
        <p class="text-slate-500 max-w-[260px] text-center text-[13px] leading-relaxed">{{ t('chat.selectConversationDesc') || 'Choose an active conversation from the sidebar to continue business negotiations.' }}</p>
      </div>

      <!-- Messages Thread -->
      <div v-else ref="messagesEl" class="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6 relative bg-slate-50/50 dark:bg-slate-900/30">
        
        <!-- Overlay Loading -->
        <div v-if="chatStore.loadingMessages" class="absolute inset-0 z-20 flex items-center justify-center bg-white/60 transition-opacity dark:bg-slate-900/60">
            <Loader2 class="w-8 h-8 text-teal-500 animate-spin" />
        </div>

        <div
          v-if="chatStore.error"
          class="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
        >
          <p class="font-semibold leading-relaxed">
            {{ chatErrorText }}
          </p>
          <button
            @click="retryActiveConversation"
            class="shrink-0 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            {{ t('common.refresh') }}
          </button>
        </div>

        <!-- Sticky Product Context Bar -->
        <div v-if="chatStore.activeConversation.product_id" class="sticky top-2 z-10 flex w-full justify-center animate-in fade-in slide-in-from-top-2 duration-300">
          <router-link
            :to="productContextLink"
            class="w-full max-w-[440px] rounded-[22px] border border-slate-200/90 bg-white/95 p-3 shadow-lg shadow-slate-200/50 backdrop-blur-xl transition-all group mx-auto hover:border-teal-500/50 hover:shadow-teal-500/10 dark:border-slate-700 dark:bg-slate-800/95 dark:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)]"
          >
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-teal-600 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                 <Package v-if="!chatStore.activeConversation.product_image" class="w-5 h-5" />
                 <img v-else :src="chatStore.activeConversation.product_image" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-[9px] text-teal-600 dark:text-teal-400 font-bold tracking-[0.08em] uppercase">{{ t('chat.inquiryAbout') }}</p>
                  <span class="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                    {{ productContextModeLabel }}
                  </span>
                </div>
                <p class="mt-1 text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {{ chatStore.activeConversation.product_name || `Product #${chatStore.activeConversation.product_id}` }}
                </p>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                  <span v-if="chatStore.activeConversation.product_price" class="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {{ chatStore.activeConversation.product_price }}
                  </span>
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {{ productContextQuantityLabel }}
                  </span>
                  <span v-if="chatStore.activeConversation.product_moq" class="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {{ chatStore.activeConversation.product_moq }}
                  </span>
                </div>
              </div>
              <div class="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors shrink-0">
                 <ExternalLink class="w-[14px] h-[14px] text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
              </div>
            </div>
          </router-link>
        </div>

        <!-- Sticky RFQ Context Bar -->
        <div v-else-if="chatStore.activeConversation.rfq_id" class="sticky top-2 z-10 flex w-full justify-center animate-in fade-in slide-in-from-top-2 duration-300">
          <router-link
            :to="rfqContextLink"
            class="flex items-center gap-3 w-full max-w-[340px] bg-navy-800/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-lg shadow-navy-900/50 dark:shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)] border border-navy-700 dark:border-slate-700 p-2 rounded-[18px] hover:border-secondary/50 hover:shadow-secondary/10 transition-all group mx-auto"
          >
            <div class="w-12 h-12 bg-navy-900 dark:bg-slate-900 rounded-xl flex items-center justify-center text-secondary overflow-hidden shrink-0 border border-navy-700 dark:border-slate-800">
               <FileSignature class="w-5 h-5" />
            </div>
            <div class="min-w-0 flex-1 py-0.5">
              <p class="text-[9px] text-secondary font-bold tracking-[0.05em] uppercase mb-[2px]">RFQ Inquiry</p>
              <p class="text-[13px] font-bold text-white truncate group-hover:text-secondary transition-colors">
                RFQ #{{ chatStore.activeConversation.rfq_id }} / {{ chatStore.activeConversation.rfq_title || 'Active Lead' }}
              </p>
            </div>
            <div class="w-8 h-8 me-1 rounded-full bg-navy-900 dark:bg-slate-900 flex items-center justify-center group-hover:bg-navy-800 dark:group-hover:bg-slate-800 transition-colors shrink-0">
               <ExternalLink class="w-[14px] h-[14px] text-slate-400 group-hover:text-secondary" />
            </div>
          </router-link>
        </div>

        <!-- Chat Bubbles Array -->
        <div
          v-for="(msg, index) in chatStore.messages"
          :key="msg.id"
          class="flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
          :class="msg.sender_id === authStore.user?.id ? 'justify-end' : 'justify-start'"
        >
          <!-- SYSTEM message -->
          <div v-if="msg.type === 'SYSTEM'" class="w-full flex justify-center my-4">
             <span class="px-5 py-2.5 rounded-[12px] bg-slate-200/50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm text-center max-w-sm leading-relaxed">
               {{ msg.message_text }}
             </span>
          </div>

          <!-- Normal Text/Attachment Bubble -->
          <div v-else
            class="max-w-[85%] md:max-w-[70%] lg:max-w-[55%] flex flex-col group relative"
            :class="msg.sender_id === authStore.user?.id ? 'items-end' : 'items-start'"
          >
            <!-- Sender Role Name -->
            <p v-if="msg.sender_id !== authStore.user?.id && getParticipantRole(msg.sender_id) === 'ADMIN'" class="text-[10px] text-slate-400 ms-1 mb-1 font-semibold uppercase tracking-wider">{{ t('chat.support_team') }}</p>

            <div
              class="px-[18px] py-3 text-[14px] md:text-[15px] shadow-sm relative transition-all"
              :class="[
                msg.sender_id === authStore.user?.id
                  ? 'bg-navy-700 text-white rounded-2xl rounded-tr-[4px]'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl rounded-tl-[4px]',
              ]"
            >
              <!-- Display Attachments -->
              <div v-if="msg.attachments && msg.attachments.length > 0" class="mb-3 flex flex-col gap-2">
                 <div v-for="(att, i) in (typeof msg.attachments === 'string' ? JSON.parse(msg.attachments) : msg.attachments)" :key="i">
                    <!-- Image -->
                    <a v-if="att.format !== 'pdf' && !att.format.startsWith('doc')" :href="att.url" target="_blank" class="block overflow-hidden rounded-xl bg-black/5 dark:bg-black/20 ring-1 ring-white/10 relative group/img">
                      <img :src="att.url" class="max-w-[260px] w-full h-auto object-cover group-hover/img:scale-[1.03] transition-transform duration-500" />
                      <div class="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                         <Search class="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                      </div>
                    </a>
                    <!-- PDF / Document -->
                    <a v-else :href="att.url" target="_blank" class="flex items-center gap-3 p-3.5 rounded-xl border border-white/10 w-full max-w-[260px] group/pdf transition-colors" :class="msg.sender_id === authStore.user?.id ? 'bg-navy-800 hover:bg-navy-900 border-navy-600' : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900'">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm" :class="msg.sender_id === authStore.user?.id ? 'bg-navy-600 text-white' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'">
                         <FileText class="w-[22px] h-[22px]" />
                      </div>
                      <div class="min-w-0 flex-1">
                         <p class="text-[13px] font-semibold truncate leading-tight mb-0.5" :class="msg.sender_id === authStore.user?.id ? 'text-white' : 'text-slate-800 dark:text-slate-200'">{{ att.name || 'Document.'+att.format }}</p>
                         <p class="text-[10px] font-medium tracking-wide uppercase" :class="msg.sender_id === authStore.user?.id ? 'text-navy-300' : 'text-slate-400'">{{ (att.size / 1024 / 1024).toFixed(2) }} MB • PDF</p>
                      </div>
                      <div class="w-8 h-8 rounded-full flex items-center justify-center bg-transparent group-hover/pdf:bg-black/5 dark:group-hover/pdf:bg-white/5 transition-colors shrink-0">
                         <Download class="w-[18px] h-[18px] opacity-70 group-hover/pdf:opacity-100 transition-opacity shrink-0" :class="msg.sender_id === authStore.user?.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'" />
                      </div>
                    </a>
                 </div>
              </div>

              <!-- Text Body -->
              <p v-if="msg.message_text && msg.message_text !== 'Attachment'" class="whitespace-pre-wrap leading-[1.6] break-words">{{ sanitize(msg.message_text) }}</p>
              
              <!-- Floating Time inside bubble (if text is long enough to fit float) -->
              <div v-if="msg.message_text && msg.message_text !== 'Attachment' && msg.message_text.length > 40" class="float-right rtl:float-left ms-4 rtl:me-4 rtl:ms-0 mt-3 flex items-center gap-1 opacity-70">
                <span class="text-[10px] font-medium whitespace-nowrap" :class="msg.sender_id === authStore.user?.id ? 'text-navy-100' : 'text-slate-400'">{{ formatTime(msg.created_at) }}</span>
                <CheckCheck v-if="msg.sender_id === authStore.user?.id && (msg.is_read || msg.id < Math.max(...chatStore.messages.filter(m=>m.sender_id===authStore.user?.id).map(m=>m.id)))" class="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <Check v-else-if="msg.sender_id === authStore.user?.id" class="w-3.5 h-3.5 text-navy-200 shrink-0" />
              </div>
            </div>
            
            <!-- Standard Metadata row below short messages -->
            <div v-if="!(msg.message_text && msg.message_text !== 'Attachment' && msg.message_text.length > 40)" class="flex items-center gap-1.5 mt-1.5 px-1.5">
              <span class="text-[10px] font-semibold text-slate-400">{{ formatTime(msg.created_at) }}</span>
              <CheckCheck v-if="msg.sender_id === authStore.user?.id && (msg.is_read || msg.id !== chatStore.messages[chatStore.messages.length-1].id)" class="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <Check v-else-if="msg.sender_id === authStore.user?.id" class="w-[14px] h-[14px] text-slate-400 shrink-0" />
            </div>
          </div>
        </div>
        
        <!-- Animated Typing Indicator -->
        <div v-if="chatStore.isOtherPartyTyping(chatStore.activeConversation?.id)" class="flex justify-start mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-[14px] rounded-2xl rounded-tl-[4px] flex items-center gap-1.5 w-fit shadow-sm">
             <span class="w-[5px] h-[5px] rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style="animation-delay: 0ms"></span>
             <span class="w-[5px] h-[5px] rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style="animation-delay: 150ms"></span>
             <span class="w-[5px] h-[5px] rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style="animation-delay: 300ms"></span>
           </div>
        </div>
      </div>

      <!-- Quick Replies (Vendor only) -->
      <div v-if="chatStore.activeConversation && authStore.isVendor && !pendingFiles.length" class="px-4 md:px-6 py-2 overflow-x-auto custom-scrollbar flex gap-2 w-full animate-in fade-in slide-in-from-bottom-2 shrink-0">
        <button 
          v-for="rep in quickReplies" :key="rep"
          @click="newMessage = rep"
          class="whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 hover:text-teal-600 hover:border-teal-500/30 transition-all shadow-sm flex-shrink-0"
        >
          {{ rep }}
        </button>
      </div>

      <!-- Live Chat Interface Input Engine (Missing Fixes Addressed) -->
      <div v-if="chatStore.activeConversation" class="relative z-10 shrink-0 border-t border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 md:px-6 md:py-4">
        
        <!-- Attachment Staging Area -->
        <div v-if="pendingFiles.length > 0" class="flex flex-wrap gap-3 mb-4">
          <div v-for="(file, index) in pendingFiles" :key="index" class="relative group bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex items-center gap-3 w-[200px] shadow-sm">
             <div class="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" :class="file.type.startsWith('image/') ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' : 'bg-navy-100 dark:bg-navy-900/50 text-navy-600 dark:text-navy-300'">
                <File v-if="!file.type.startsWith('image/')" class="w-[18px] h-[18px]" />
                <Image v-else class="w-[18px] h-[18px]" />
             </div>
             <div class="min-w-0 flex-1">
               <p class="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{{ file.name }}</p>
               <p class="text-[9px] text-slate-400 font-medium">{{ (file.size/1024/1024).toFixed(2) }} MB</p>
             </div>
             <button @click="removePendingFile(index)" class="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md shadow-rose-500/30 scale-90 group-hover:scale-100 hover:bg-rose-600 outline-none">
               <X class="w-3.5 h-3.5" />
             </button>
          </div>
        </div>

        <!-- Toolbar & Quick Actions (Double-Column Overlay Drawer) -->
        <div v-if="showActionsDrawer" class="absolute bottom-full left-4 z-20 mb-3 flex items-center gap-2 rounded-[20px] border border-slate-200 bg-white p-2.5 shadow-xl shadow-slate-200/50 animate-in slide-in-from-bottom-2 fade-in duration-200 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none rtl:left-auto rtl:right-4">
          
          <!-- B2B Vendor Action: Send Formal Quote -->
          <button v-if="authStore.isVendor" @click="openQuoteModal" class="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-w-[80px] group text-teal-600 dark:text-teal-400">
             <div class="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
               <FileSignature class="w-[22px] h-[22px]" />
             </div>
             <span class="text-[10px] font-bold text-center leading-[1.2] whitespace-pre-line">{{ t('chat.send_quote').replace(' ', '\n') }}</span>
          </button>
          
          <!-- Generic Attachments (Images/PDFs) -->
          <button @click="$refs.fileInput.click()" class="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-w-[80px] group text-navy-600 dark:text-navy-400">
             <div class="w-12 h-12 rounded-full bg-navy-50 dark:bg-navy-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
               <Image class="w-[22px] h-[22px]" />
             </div>
             <span class="text-[10px] font-bold text-center leading-[1.2]">{{ t('chat.attachment') }}</span>
          </button>
        </div>

        <!-- Intelligent Input Wrapper -->
        <div class="flex items-end gap-2 md:gap-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-1.5 focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-500 transition-all shadow-inner">
          <!-- + Action Drawer Trigger -->
          <button @click="showActionsDrawer = !showActionsDrawer" class="p-3 mb-0.5 text-slate-400 hover:text-navy-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 outline-none">
            <Plus class="w-[22px] h-[22px] transition-transform duration-300" :class="showActionsDrawer ? 'rotate-45 text-rose-500' : ''" />
          </button>
          <input type="file" ref="fileInput" class="hidden" multiple accept="image/*,.pdf,.doc,.docx" @change="handleFileSelect" />
          
          <!-- Auto-expanding B2B Textarea & Lock Overlay -->
          <div class="flex-1 relative">
            <textarea
              ref="textareaEl"
              v-model="newMessage"
              @input="adjustTextareaHeight"
              @keydown="handleTyping"
              @keydown.enter.exact.prevent="sendMessage"
              :disabled="isInputLocked"
              rows="1"
              :placeholder="isInputLocked ? t('chat.waiting_for_admin') || 'Waiting for an admin to join...' : t('chat.messagePlaceholder')"
              class="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[44px] max-h-[160px] py-[13px] text-[15px] text-slate-800 dark:text-slate-100 custom-scrollbar placeholder:text-slate-400 placeholder:font-medium leading-relaxed disabled:opacity-50"
            />
            <div v-if="isInputLocked" class="absolute inset-x-0 -top-8 text-center pointer-events-none">
              <span class="px-3 py-1 bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded-full border border-amber-500/20 backdrop-blur-sm shadow-sm">{{ t('chat.input_locked') || 'Input restricted until Support replies' }}</span>
            </div>
          </div>
          
          <!-- Send Button (Primary Teal/Navy gradient or solid scale) -->
          <button
            @click="sendMessage"
            :disabled="(!newMessage.trim() && pendingFiles.length === 0) || chatStore.sending || isInputLocked"
            class="w-12 h-12 flex items-center justify-center rounded-[20px] shrink-0 disabled:opacity-50 disabled:shadow-none transition-all outline-none mx-0.5 mb-0.5 shadow-sm"
            :class="(newMessage.trim() || pendingFiles.length > 0) && !isInputLocked ? 'bg-navy-700 hover:bg-teal-500 text-white hover:scale-105 active:scale-95 cursor-pointer shadow-teal-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-600'"
          >
            <Loader2 v-if="chatStore.sending" class="w-5 h-5 animate-spin" />
            <Send v-else class="w-5 h-5 rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Select Vendor Modal -->
    <SelectVendorModal 
      v-model="showVendorModal"
      @select="handleStartNewChat"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { MessageSquare, Send, Loader2, Check, CheckCheck, FileText, Image, File, X, Package, ExternalLink, Plus, ChevronLeft, Search, FileSignature, Download, Trash2 } from 'lucide-vue-next';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { useQuickRepliesStore } from '@/stores/quickRepliesStore';
import { useNotificationStore } from '@/stores/notificationStore';
import socketService from '@/services/socket.service';
import EmptyState from '@/components/ui/EmptyState.vue';
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue';
import SelectVendorModal from '@/components/chat/SelectVendorModal.vue';
import { buildProductPath } from '@/utils/routes';
import { sanitize } from '@/utils/sanitize';
import { normalizeError } from '@/utils/errorHandler';
import { resolveLocalizedText } from '@/utils/localizedText';

const { t, locale } = useI18n();
const route = useRoute();
const chatStore = useChatStore();
const authStore = useAuthStore();
const quickRepliesStore = useQuickRepliesStore();
const notificationStore = useNotificationStore();

const newMessage = ref('');
const messagesEl = ref(null);
const fileInput = ref(null);
const textareaEl = ref(null);
const pendingFiles = ref([]);
const searchQuery = ref('');
const activeTab = ref('all');
const showActionsDrawer = ref(false);
const showVendorModal = ref(false);
let typingTimeout = null;

const quickReplies = computed(() =>
  quickRepliesStore.replies.length
    ? quickRepliesStore.replies.slice(0, 6).map((reply) => reply.content)
    : [
        locale.value === 'ar' ? 'مرحبًا، كيف يمكنني مساعدتك اليوم؟' : 'Welcome! How can I help you today?',
        locale.value === 'ar' ? 'هل يمكنك مشاركة مزيد من التفاصيل؟' : 'Could you provide more details?',
        locale.value === 'ar' ? 'الحد الأدنى للطلب هو 100 وحدة.' : 'The minimum order quantity is 100 units.',
        locale.value === 'ar' ? 'نعم، يمكننا توفير عينة مخصصة.' : 'Yes, we can provide a customized sample.'
      ]
);

const chatErrorText = computed(() =>
  resolveLocalizedText(chatStore.error, locale.value, t('errors.generic'))
);

// Derived Data & Filtering
const filteredConversations = computed(() => {
  let list = chatStore.sortedConversations;
  
  if (activeTab.value === 'unread') {
    list = list.filter(c => c.unread_count > 0);
  }
  
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(c => {
      const name = getOtherParty(c).toLowerCase();
      const msg = (c.last_message || '').toLowerCase();
      return name.includes(q) || msg.includes(q);
    });
  }
  
  return list;
});

const productContextLink = computed(() => {
  const conversation = chatStore.activeConversation;
  if (!conversation?.product_id) return '/products';
  return conversation.product_url || buildProductPath({
    id: conversation.product_id,
    slug: conversation.product_slug,
    name_en: conversation.product_name_en || conversation.product_name
  });
});

const rfqContextLink = computed(() => {
  const conversation = chatStore.activeConversation;
  if (!conversation?.rfq_id) {
    return authStore.isVendor ? '/dashboard/vendor/leads' : '/rfq';
  }
  return `/rfq/${conversation.rfq_id}`;
});

const productContextQuantityLabel = computed(() => {
  const quantity = chatStore.activeConversation?.requested_quantity;
  if (quantity) {
    return locale.value === 'ar' ? `الكمية: ${quantity}` : `Qty: ${quantity}`;
  }
  return locale.value === 'ar' ? 'استفسار سياقي' : 'Contextual inquiry';
});

const productContextModeLabel = computed(() =>
  chatStore.isOtherPartyOnline(getParticipantId(chatStore.activeConversation))
    ? (t('chat.online') || 'Online')
    : (t('chat.offline') || 'Offline')
);

const isInputLocked = computed(() => {
  const conv = chatStore.activeConversation;
  if (!conv) return false;
  const role = `${authStore.user?.role || ''}`.toUpperCase();
  if (role === 'ADMIN' || role === 'OWNER') return false;
  if (conv.type === 'SUPPORT') {
    return !chatStore.messages.some(m => m.sender_id !== authStore.user?.id);
  }
  return false;
});

const activeConversationType = computed(() => `${chatStore.activeConversation?.type || ''}`.toUpperCase());
const canEndConversation = computed(() => !!chatStore.activeConversation && ['SUPPORT', 'INQUIRY'].includes(activeConversationType.value));
const canDeleteConversation = computed(() => {
  const role = `${authStore.user?.role || ''}`.toLowerCase();
  return ['admin', 'owner'].includes(role) && !!chatStore.activeConversation && activeConversationType.value === 'SUPPORT';
});

// Auto-expand Textarea Logic
const adjustTextareaHeight = () => {
  if (!textareaEl.value) return;
  textareaEl.value.style.height = 'auto'; // Reset height to recalculate
  textareaEl.value.style.height = Math.min(textareaEl.value.scrollHeight, 160) + 'px';
  if (newMessage.value === '') {
    textareaEl.value.style.height = '44px'; // Base height
  }
};

watch(newMessage, () => {
  nextTick(adjustTextareaHeight);
});

watch(showVendorModal, (open) => {
  if (open) {
    showActionsDrawer.value = false;
  }
});

// Helpers
const getParticipantId = (conv) => {
  if (!conv) return null;
  const role = `${authStore.user?.role || ''}`.toLowerCase();
  const type = `${conv.type || ''}`.toUpperCase();
  if (role === 'admin' || role === 'owner') {
    return type === 'SUPPORT' ? conv.user_id : (conv.vendor_user_id || conv.user_id || conv.vendor_id);
  }
  return authStore.isVendor ? conv.user_id : (conv.vendor_user_id || conv.vendor_id);
};

const getRoleBadge = (conv) => {
  if (!conv) return null;
  if (authStore.user?.role === 'ADMIN' || authStore.user?.role === 'OWNER') {
    return conv.type === 'SUPPORT' ? 'Customer' : 'Supplier';
  }
  return authStore.isVendor ? 'Buyer' : 'Supplier';
};

const getParticipantRole = (senderId) => {
  return 'USER'; // Expandable based on user dictionary.
};

const getOtherParty = (conv) => {
  if (!conv) return '';
  if (authStore.user?.role === 'ADMIN' || authStore.user?.role === 'OWNER') {
    if (conv.type === 'SUPPORT') {
      return `${conv.user_first_name || ''} ${conv.user_last_name || ''}`.trim() || 'Customer';
    }
    return conv.vendor_company_name_ar || conv.vendor_company_name_en || `${conv.user_first_name || ''} ${conv.user_last_name || ''}`.trim() || 'Supplier';
  }
  if (authStore.isVendor && conv.user_first_name) return `${conv.user_first_name} ${conv.user_last_name}`;
  return conv.vendor_company_name_ar || conv.vendor_company_name_en || 'Supplier';
};

const getAvatar = (conv) => {
  if (!conv) return null;
  const role = `${authStore.user?.role || ''}`.toLowerCase();
  if (role === 'admin' || role === 'owner') {
    return `${conv.type || ''}`.toUpperCase() === 'SUPPORT' ? conv.user_image : (conv.vendor_logo || conv.user_image);
  }
  return authStore.isVendor ? conv.user_image : conv.vendor_logo;
};

const formatTime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (new Date().toDateString() === date.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const scrollToBottom = () => {
  if (messagesEl.value) {
    // Add small delay for DOM render inside custom-scrollbars
    setTimeout(() => {
        if(messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }, 50);
  }
};

// UI Actions
const selectConversation = async (conv) => {
  await chatStore.setActiveConversation(conv);
  showActionsDrawer.value = false;
  nextTick(scrollToBottom);
};

const closeConversationMobile = () => {
  chatStore.activeConversation = null;
  showActionsDrawer.value = false;
};

const notifyNormalizedError = (error) => {
  const normalized = normalizeError(error);
  notificationStore.error(normalized.message);
};

const retryActiveConversation = async () => {
  if (chatStore.activeConversation?.id) {
    await chatStore.fetchMessages(chatStore.activeConversation.id);
    return;
  }
  await chatStore.fetchConversations();
};

const endActiveConversation = async () => {
  if (!chatStore.activeConversation?.id) return;
  try {
    await chatStore.updateConversationStatus(chatStore.activeConversation.id, 'closed');
  } catch (error) {
    notifyNormalizedError(error);
  }
};

const deleteActiveConversation = async () => {
  if (!chatStore.activeConversation?.id) return;
  try {
    await chatStore.deleteConversation(chatStore.activeConversation.id);
  } catch (error) {
    notifyNormalizedError(error);
  }
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  const oversized = files.find(f => f.size > 10 * 1024 * 1024);
  if (oversized) {
    notificationStore.warn(t('chat.fileTooLarge') || 'File exceeds 10MB limit.');
    return;
  }
  pendingFiles.value = [...pendingFiles.value, ...files].slice(0, 5); // Max 5 attachments
  fileInput.value.value = '';
  showActionsDrawer.value = false;
  nextTick(scrollToBottom);
};

const removePendingFile = (index) => {
  pendingFiles.value.splice(index, 1);
};

const openQuoteModal = () => {
  showActionsDrawer.value = false;
  notificationStore.info(
    locale.value === 'ar'
      ? `سيتم قريبًا تفعيل إرسال عرض سعر مباشر لهذا المنتج رقم ${chatStore.activeConversation?.product_id || ''}.`
      : `Direct quote sending will be enabled soon for product #${chatStore.activeConversation?.product_id || ''}.`
  );
};

const handleStartNewChat = async (vendor) => {
  const existing = chatStore.conversations.find(c => c.vendor_id === vendor.id && !c.product_id);
  if (existing) {
    selectConversation(existing);
  } else {
    // Initiate placeholders or trigger start API with just a generic message
    try {
      await chatStore.startChat(vendor.id, null, t('chat.default_inquiry'));
    } catch (err) {
      notifyNormalizedError(err);
    }
  }
};

// Socket Emits
const handleTyping = () => {
  if (!chatStore.activeConversation) return;
  socketService.emit('typing_start', { conversationId: chatStore.activeConversation.id });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socketService.emit('typing_stop', { conversationId: chatStore.activeConversation.id });
  }, 2000);
};

const sendMessage = async () => {
  if (!newMessage.value.trim() && pendingFiles.value.length === 0) return;
  const conv = chatStore.activeConversation;
  if (!conv) return;
  
  socketService.emit('typing_stop', { conversationId: conv.id });

  const messageText = newMessage.value.trim();
  const filesToUpload = [...pendingFiles.value];
  
  // Eagerly clear the inputs to feel instantaneous.
  newMessage.value = '';
  pendingFiles.value = [];
  if (textareaEl.value) textareaEl.value.style.height = '44px';
  showActionsDrawer.value = false;
  
  try {
    if (filesToUpload.length > 0) {
      await chatStore.uploadAttachments(conv.id, filesToUpload);
    } 
    if (messageText) {
      await chatStore.sendMessage(conv.id, messageText);
    }
    nextTick(scrollToBottom);
  } catch (err) {
    if (messageText) {
      newMessage.value = messageText;
    }
    if (filesToUpload.length > 0) {
      pendingFiles.value = filesToUpload;
    }
    nextTick(adjustTextareaHeight);
  }
};

// Observers
watch(() => chatStore.messages.length, () => nextTick(scrollToBottom));

watch(
  () => [route.query.id, chatStore.conversations.length],
  async ([conversationId]) => {
    if (!conversationId || !chatStore.conversations.length) return;
    const target = chatStore.conversations.find((conversation) => String(conversation.id) === String(conversationId));
    if (target && chatStore.activeConversation?.id !== target.id) {
      await selectConversation(target);
    }
  },
  { immediate: true }
);

onMounted(() => {
  chatStore.fetchConversations();
  if (['mowared', 'admin', 'owner'].includes(`${authStore.user?.role || ''}`.toLowerCase())) {
    quickRepliesStore.fetchReplies();
  }
  
  if (authStore.token) {
    socketService.connect(authStore.token);
  }
});

onUnmounted(() => {
  if (chatStore.activeConversation) {
    socketService.emit('leave_conversation', chatStore.activeConversation.id);
    chatStore.activeConversation = null;
    chatStore.messages = [];
  }
});
</script>
