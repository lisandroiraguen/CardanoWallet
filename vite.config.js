import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm' // <-- 1. Importa el plugin
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    sourcemap: true
  }
})

