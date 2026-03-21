import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      // CRÍTICO: nunca cachear o próprio arquivo sw.js via HTTP cache
      // Sem isso, o browser serve o sw antigo e nunca detecta atualizações
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*"],
      manifest: false, // Desativado - manifest é gerado dinamicamente em index.html para preservar token
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Nunca cacheia HTML — sempre vai à rede para checar versão nova
        navigateFallback: null,
        globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB
        // Estratégia network-first para JS/CSS — garante versão mais recente
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 dia
              },
              networkTimeoutSeconds: 3,
            },
          },
        ],
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
