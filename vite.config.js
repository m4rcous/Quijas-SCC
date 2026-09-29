import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        id: '/',
        name: 'Sistema de Control de Cosecha',
        short_name: 'SCC',

        description:
          'Sistema de Control de Cosecha',

        start_url: '/',
        scope: '/',

        display: 'standalone',

        theme_color: '#1668c7',
        background_color: '#f3f5f7',

        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x188',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x501',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})