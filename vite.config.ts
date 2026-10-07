import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import dns from "node:dns";
import path from "path";
import { fileURLToPath } from "url";

dns.setDefaultResultOrder("verbatim");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      injectRegister: "script-defer",

      manifest: false,
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,json,woff2,opus,wav,mp3,ogg}",
        ],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,

        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  server: {
    port: 3333,
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
