import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const apiBaseUrl = process.env.VITE_API_BASE_URL || ''
  if (mode === 'production') {
    let target
    try {
      target = new URL(apiBaseUrl)
    } catch {
      throw new Error('Production build requires a valid VITE_API_BASE_URL environment variable.')
    }
    if (target.protocol !== 'https:' || /(^|\.)(onrender\.com|vercel\.app)$/i.test(target.hostname)) {
      throw new Error('Production API URL must use HTTPS and must not target the legacy Render/Vercel hosts.')
    }
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: false,
      proxy: mode === 'production' ? undefined : {
        '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      },
    },
  }
})
