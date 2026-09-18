import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('1-level.js')) return 'questions-level-1';
          if (id.includes('2-level.js')) return 'questions-level-2';
          if (id.includes('3-level.js')) return 'questions-level-3';
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@vladmandic') || id.includes('face-api')) return 'vendor-face-api';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor';
          }
        }
      }
    }
  }
})

