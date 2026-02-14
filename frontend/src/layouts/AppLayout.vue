<template>
  <v-layout class="app-layout">
    <AppSidebar
      v-model:drawer="drawer"
      v-model:rail="rail"
      :mobile="mobile"
      :menu-items="menuItems"
    />

    <v-main class="workspace-main">
      <AppTopbar
        :title="pageTitle"
        :mobile="mobile"
        @toggle-drawer="toggleDrawer"
        @toggle-rail="toggleRail"
      />

      <v-sheet
        v-if="tabs.length > 0"
        class="workspace-tabs"
        color="surface"
        border="b"
      >
        <v-tabs
          :model-value="activeTabId"
          align-tabs="start"
          density="comfortable"
          show-arrows
          class="workspace-tabs-bar"
          @update:model-value="onTabSelect"
        >
          <v-tab
            v-for="tab in tabs"
            :key="tab.id"
            :value="tab.id"
            class="workspace-tab"
          >
            <span class="workspace-tab__label">{{ tab.title }}</span>
            <v-btn
              v-if="!tab.affix"
              icon="mdi-close"
              size="x-small"
              variant="text"
              class="workspace-tab__close"
              @click.stop="onTabClose(tab.id)"
            />
          </v-tab>
        </v-tabs>
      </v-sheet>

      <v-container fluid class="workspace-content">
        <RouterView v-slot="{ Component, route: viewRoute }">
          <KeepAlive :max="12">
            <component
              :is="Component"
              v-if="viewRoute.meta.keepAlive"
              :key="resolveViewCacheKey(viewRoute)"
            />
          </KeepAlive>
          <component
            :is="Component"
            v-if="!viewRoute.meta.keepAlive"
            :key="viewRoute.fullPath"
          />
        </RouterView>
      </v-container>
    </v-main>

    <QuickAddModal :open="quickAddOpen" @close="quickAddOpen = false" />
  </v-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
import { useDisplay } from 'vuetify'
import AppSidebar, { type SidebarMenuItem } from '../components/layout/AppSidebar.vue'
import AppTopbar from '../components/layout/AppTopbar.vue'
import QuickAddModal from '../components/quick-add/QuickAddModal.vue'
import { useTabsStore } from '../stores/tabsStore'

const route = useRoute()
const router = useRouter()
const { mobile } = useDisplay()
const tabsStore = useTabsStore()
const { tabs, activeTabId } = storeToRefs(tabsStore)

const drawer = ref(true)
const rail = ref(false)
const quickAddOpen = ref(false)

const menuItems: SidebarMenuItem[] = [
  { title: 'Inbox', icon: 'mdi-inbox-arrow-down-outline', to: '/app/inbox', enabled: true },
  { title: 'Tasks', icon: 'mdi-format-list-checks', to: '/app/tasks', enabled: true },
  { title: 'Projects', icon: 'mdi-view-dashboard-outline', to: '/app/projects', enabled: true },
  { title: 'Calendar', icon: 'mdi-calendar-month-outline', to: '/app/calendar', enabled: true },
  { title: 'Templates', icon: 'mdi-file-document-edit-outline', to: '/app/templates', enabled: true },
  { title: 'Approvals', icon: 'mdi-clipboard-check-outline', to: '/app/approvals', enabled: false },
  { title: 'Settings', icon: 'mdi-cog-outline', to: '/app/settings', enabled: false },
]

const pageTitle = computed(() => {
  if (typeof route.meta.title === 'string' && route.meta.title.trim().length > 0) {
    return route.meta.title
  }
  if (typeof route.name === 'string') {
    return route.name
  }
  return 'Dashboard'
})

watch(
  () => mobile.value,
  (isMobile) => {
    if (isMobile) {
      drawer.value = false
      rail.value = false
    } else {
      drawer.value = true
    }
  },
  { immediate: true },
)

const toggleDrawer = () => {
  drawer.value = !drawer.value
}

const toggleRail = () => {
  if (mobile.value) {
    drawer.value = !drawer.value
    return
  }
  rail.value = !rail.value
}

const onTabSelect = (tabId: string) => {
  const targetTab = tabsStore.tabs.find((tab) => tab.id === tabId)
  if (!targetTab) {
    return
  }
  tabsStore.setActive(targetTab.id)
  if (route.fullPath !== targetTab.fullPath) {
    void router.push(targetTab.fullPath)
  }
}

const onTabClose = (tabId: string) => {
  const targetPath = tabsStore.closeTab(tabId)
  if (targetPath && route.fullPath !== targetPath) {
    void router.push(targetPath)
  }
}

const resolveViewCacheKey = (viewRoute: RouteLocationNormalizedLoaded) => {
  if (viewRoute.meta.tabbed) {
    return tabsStore.buildTabId(viewRoute)
  }
  return viewRoute.fullPath
}

const closeCurrentTab = () => {
  if (!activeTabId.value) {
    return
  }
  const targetPath = tabsStore.closeTab(activeTabId.value)
  if (targetPath && route.fullPath !== targetPath) {
    void router.push(targetPath)
  }
}

const moveTabFocus = (step: 1 | -1) => {
  if (tabs.value.length <= 1 || !activeTabId.value) {
    return
  }
  const index = tabs.value.findIndex((tab) => tab.id === activeTabId.value)
  if (index === -1) {
    return
  }
  const nextIndex = (index + step + tabs.value.length) % tabs.value.length
  const target = tabs.value[nextIndex]
  tabsStore.setActive(target.id)
  if (route.fullPath !== target.fullPath) {
    void router.push(target.fullPath)
  }
}

const isTypingContext = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  if (!target) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

const onGlobalKeydown = (event: KeyboardEvent) => {
  if (!event.repeat && (event.key === '/' || (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)))) {
    if (!isTypingContext(event)) {
      event.preventDefault()
      quickAddOpen.value = true
    }
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'w' && route.path.startsWith('/app')) {
    if (!isTypingContext(event)) {
      event.preventDefault()
      closeCurrentTab()
    }
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'Tab' && route.path.startsWith('/app')) {
    if (!isTypingContext(event)) {
      event.preventDefault()
      moveTabFocus(event.shiftKey ? -1 : 1)
    }
  }

  if (event.key === 'Escape' && quickAddOpen.value) {
    quickAddOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.workspace-main {
  background:
    radial-gradient(circle at 100% -5%, rgba(37, 99, 235, 0.09), transparent 22%),
    radial-gradient(circle at -5% 100%, rgba(14, 165, 233, 0.05), transparent 24%),
    rgba(var(--v-theme-background), 1);
}

.workspace-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.workspace-tabs {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.45);
}

.workspace-tabs-bar {
  min-height: 50px;
  padding-inline: 12px;
}

.workspace-tab {
  min-width: 140px;
}

.workspace-tab__label {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-tab__close {
  margin-left: 4px;
}

@media (max-width: 960px) {
  .workspace-content {
    padding: 16px 12px 20px;
  }

  .workspace-tabs-bar {
    padding-inline: 8px;
  }

  .workspace-tab {
    min-width: 120px;
  }

  .workspace-tab__label {
    max-width: 130px;
  }
}
</style>
