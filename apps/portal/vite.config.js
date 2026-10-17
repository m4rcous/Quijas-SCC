import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  server: { fs: { allow: [fileURLToPath(new URL('../../', import.meta.url))] } },
  // Un solo runtime React para componentes y renderer, también en tests.
  resolve: { dedupe: ['react', 'react-dom'] },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.jsx'],
    setupFiles: ['./tests/setup.jsx'],
    restoreMocks: true
  }
})
