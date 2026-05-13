import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://<user>.github.io/<repo>/
const repo = 'expense.github.io'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.CI ? `/${repo}/` : '/',
})
