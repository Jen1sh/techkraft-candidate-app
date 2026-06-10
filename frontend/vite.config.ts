import tailwindcss from "@tailwindcss/postcss"
import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } },
  },
})
