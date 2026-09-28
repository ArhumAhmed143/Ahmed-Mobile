import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// Sync uploaded logo to public folder
const uploadedLogoPath = "C:/Users/dell/.gemini/antigravity-ide/brain/98ab5891-48df-41a2-8c63-614c154ac11a/.user_uploaded/media_1790504584929.jpg"
try {
  if (fs.existsSync(uploadedLogoPath)) {
    const pubDir = path.resolve('public')
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true })
    fs.copyFileSync(uploadedLogoPath, path.join(pubDir, 'logo.jpg'))
    fs.copyFileSync(uploadedLogoPath, path.join(pubDir, 'ahmed-mobile-logo.jpg'))
  }
} catch (e) {
  console.warn('Logo sync info:', e.message)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  envDir: '../backend',
  server: {
    port: 5173
  }
})

