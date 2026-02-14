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

      <v-container fluid class="workspace-content">
        <RouterView />
      </v-container>
    </v-main>

    <QuickAddModal :open="quickAddOpen" @close="quickAddOpen = false" />
  </v-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import AppSidebar, { type SidebarMenuItem } from '../components/layout/AppSidebar.vue'
import AppTopbar from '../components/layout/AppTopbar.vue'
import QuickAddModal from '../components/quick-add/QuickAddModal.vue'

const route = useRoute()
const { mobile } = useDisplay()

const drawer = ref(true)
const rail = ref(false)
const quickAddOpen = ref(false)

const menuItems: SidebarMenuItem[] = [
  { title: 'Inbox', icon: 'mdi-inbox-arrow-down-outline', to: '/app/inbox', enabled: true },
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
    radial-gradient(circle at -5% 100%, rgba(15, 118, 110, 0.06), transparent 24%),
    rgba(var(--v-theme-background), 1);
}

.workspace-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 960px) {
  .workspace-content {
    padding: 16px 12px 20px;
  }
}
</style>
