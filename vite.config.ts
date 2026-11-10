import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// The site is served from https://tarundaboss.github.io/smishing-scanner/
export default defineConfig({
  base: '/smishing-scanner/',
  plugins: [react()],
  test: { include: ['src/**/*.test.ts'] },
})
