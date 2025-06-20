/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_TRACKING_ID: string
  readonly VITE_GTM_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}