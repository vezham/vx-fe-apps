import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

import { defineConfig, getPrerenderPages } from '@vezham/config/presets/app'

export default defineConfig({
  root: import.meta.dirname,
  plugins: [
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          crawlLinks: true
        }
      },
      pages: getPrerenderPages(import.meta.dirname)
    }),
    tailwindcss(),
    react(),
    nxReadySignal()
  ]
})
