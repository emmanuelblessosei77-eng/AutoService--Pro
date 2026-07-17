import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:4000';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        xfwd: true,
      },
    },
    hmr: {
      host: process.env.VITE_HMR_HOST || 'localhost',
      clientPort: process.env.VITE_HMR_PORT ? Number(process.env.VITE_HMR_PORT) : 5173,
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
  },
})

