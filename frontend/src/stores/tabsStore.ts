import { defineStore } from 'pinia'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export type TabKeyStrategy = 'NAME_PARAMS' | 'FULLPATH'

export interface WorkspaceTab {
  id: string
  title: string
  fullPath: string
  routeName?: string
  params?: Record<string, string>
  affix: boolean
  icon?: string
}

interface TabsState {
  tabs: WorkspaceTab[]
  activeTabId: string
}

interface RestoreOptions {
  validatePath?: (fullPath: string) => boolean
}

const STORAGE_KEY = 'workapp.tabs.v1'
const MAX_TABS = 12

const toParamValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(',')
  }
  if (value === undefined || value === null) {
    return ''
  }
  return String(value)
}

const normalizeParams = (params: RouteLocationNormalizedLoaded['params']): Record<string, string> => {
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = toParamValue(params[key])
      return acc
    }, {})
  return sorted
}

const asRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isWorkspaceTab = (value: unknown): value is WorkspaceTab => {
  if (!asRecord(value)) {
    return false
  }
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.fullPath === 'string' &&
    typeof value.affix === 'boolean'
  )
}

const resolveTitle = (route: RouteLocationNormalizedLoaded): string => {
  const titleMeta = typeof route.meta.title === 'string' ? route.meta.title : ''
  const id = toParamValue(route.params.id)
  const projectId = toParamValue(route.params.projectId)
  const riskId = toParamValue(route.params.riskId)

  switch (route.name) {
    case 'project-detail':
      return `Project ${id || '-'}`
    case 'project-board':
      return `Project ${id || '-'} / Board`
    case 'project-templates':
      return `Project ${id || '-'} / Templates`
    case 'project-risks':
      return `Project ${projectId || '-'} / Risks`
    case 'risk-detail':
      return `Risk ${riskId || '-'}`
    default:
      return titleMeta || String(route.name ?? route.path)
  }
}

export const useTabsStore = defineStore('tabs', {
  state: (): TabsState => ({
    tabs: [],
    activeTabId: '',
  }),
  getters: {
    activeTab: (state) => state.tabs.find((tab) => tab.id === state.activeTabId) ?? null,
  },
  actions: {
    persist() {
      if (typeof window === 'undefined') {
        return
      }
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tabs: this.tabs,
          activeTabId: this.activeTabId,
        }),
      )
    },
    restore(options?: RestoreOptions) {
      if (typeof window === 'undefined') {
        return
      }
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        return
      }

      try {
        const parsed = JSON.parse(raw) as { tabs?: unknown[]; activeTabId?: string }
        if (!Array.isArray(parsed.tabs)) {
          return
        }

        const validTabs = parsed.tabs.filter((tab): tab is WorkspaceTab => {
          if (!isWorkspaceTab(tab)) {
            return false
          }
          if (options?.validatePath && !options.validatePath(tab.fullPath)) {
            return false
          }
          return true
        })

        this.tabs = validTabs
        if (validTabs.length === 0) {
          this.activeTabId = ''
          this.persist()
          return
        }

        const hasActive = typeof parsed.activeTabId === 'string' && validTabs.some((tab) => tab.id === parsed.activeTabId)
        this.activeTabId = hasActive ? (parsed.activeTabId as string) : validTabs[0].id
      } catch {
        this.tabs = []
        this.activeTabId = ''
      }
    },
    buildTabId(route: RouteLocationNormalizedLoaded): string {
      const strategy = (route.meta.tabKeyStrategy as TabKeyStrategy | undefined) ?? 'NAME_PARAMS'
      if (strategy === 'FULLPATH') {
        return route.fullPath
      }
      const key = route.name ? String(route.name) : route.path
      return `${key}::${JSON.stringify(normalizeParams(route.params))}`
    },
    openOrActivateFromRoute(route: RouteLocationNormalizedLoaded) {
      if (!route.meta.tabbed) {
        return
      }

      const id = this.buildTabId(route)
      const existing = this.tabs.find((tab) => tab.id === id)
      const nextTitle = resolveTitle(route)

      if (existing) {
        existing.fullPath = route.fullPath
        existing.title = nextTitle
        existing.affix = existing.affix || Boolean(route.meta.affix)
        this.activeTabId = existing.id
        this.persist()
        return
      }

      this.tabs.push({
        id,
        title: nextTitle,
        fullPath: route.fullPath,
        routeName: route.name ? String(route.name) : undefined,
        params: normalizeParams(route.params),
        affix: Boolean(route.meta.affix),
      })

      this.enforceTabLimit()
      this.activeTabId = id
      this.persist()
    },
    enforceTabLimit() {
      if (this.tabs.length <= MAX_TABS) {
        return
      }

      while (this.tabs.length > MAX_TABS) {
        const candidateIndex = this.tabs.findIndex((tab) => !tab.affix && tab.id !== this.activeTabId)
        if (candidateIndex === -1) {
          break
        }
        this.tabs.splice(candidateIndex, 1)
      }
    },
    setActive(tabId: string) {
      if (this.tabs.some((tab) => tab.id === tabId)) {
        this.activeTabId = tabId
        this.persist()
      }
    },
    closeTab(tabId: string): string | null {
      const index = this.tabs.findIndex((tab) => tab.id === tabId)
      if (index === -1) {
        return null
      }

      const tab = this.tabs[index]
      if (tab.affix) {
        return null
      }

      const isActive = this.activeTabId === tabId
      let targetPath: string | null = null
      let targetId = ''

      if (isActive) {
        const right = this.tabs[index + 1]
        const left = this.tabs[index - 1]
        const target = right ?? left ?? null
        targetPath = target?.fullPath ?? null
        targetId = target?.id ?? ''
      }

      this.tabs.splice(index, 1)

      if (this.tabs.length === 0) {
        this.activeTabId = ''
        this.persist()
        return null
      }

      if (isActive) {
        this.activeTabId = targetId || this.tabs[0].id
      } else if (!this.tabs.some((candidate) => candidate.id === this.activeTabId)) {
        this.activeTabId = this.tabs[0].id
      }

      this.persist()
      return targetPath
    },
    closeOthers(tabId: string) {
      const keep = new Set(
        this.tabs.filter((tab) => tab.affix || tab.id === tabId).map((tab) => tab.id),
      )
      this.tabs = this.tabs.filter((tab) => keep.has(tab.id))
      if (!keep.has(this.activeTabId)) {
        this.activeTabId = tabId
      }
      if (!this.tabs.some((tab) => tab.id === this.activeTabId)) {
        this.activeTabId = this.tabs[0]?.id ?? ''
      }
      this.persist()
    },
    closeAll() {
      const affixTabs = this.tabs.filter((tab) => tab.affix)
      this.tabs = affixTabs
      this.activeTabId = affixTabs[0]?.id ?? ''
      this.persist()
    },
  },
})
