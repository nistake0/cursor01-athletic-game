import { defineConfig } from 'vite'

export default defineConfig({
  base: '/cursor01-athletic-game/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 5173
  }
})
