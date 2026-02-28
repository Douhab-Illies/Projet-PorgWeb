import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy: /api -> gateway (compose exposes 8081 on host)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8081',
      '/health': 'http://localhost:8081'
    }
  }
})
