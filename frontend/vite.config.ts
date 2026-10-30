import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When building for GitHub Pages, set VITE_BASE to /repo-name/
// e.g. VITE_BASE=/sentinel-portal/ npm run build
const base = process.env.VITE_BASE || './'

export default defineConfig({
  plugins: [react()],
  base,
  // No proxy needed — simulation runs entirely in-browser
})
