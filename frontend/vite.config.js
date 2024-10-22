import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom', 'react-router-dom', 'react-error-boundary', 'react-hook-form', 'react-icons'],
          'apex_charts':['apexcharts', 'react-apexcharts']
        }
      }
    }
  }
})
