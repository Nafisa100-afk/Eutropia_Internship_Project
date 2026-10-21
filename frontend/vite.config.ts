import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Django backend-e CORS enable kora nai, tai browser "/api" e call kore ar Vite dev server
// seta http://127.0.0.1:8000 e forward kore. Backend-e kono change lage na.
const proxy = { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true } }

export default defineConfig({ plugins: [react()], server: { proxy }, preview: { proxy } })
