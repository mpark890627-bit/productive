import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
    tabbed?: boolean
    affix?: boolean
    keepAlive?: boolean
    tabKeyStrategy?: 'NAME_PARAMS' | 'FULLPATH'
    tabGroup?: string
  }
}
