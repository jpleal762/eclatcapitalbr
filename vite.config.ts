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
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*"],
      manifest: false, // Desativado - manifest é gerado dinamicamente em index.html para preservar token
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,

        // CRÍTICO: nunca cachear HTML — sempre vai à rede
        navigateFallback: null,
        navigateFallbackDenylist: [/.*/], // bloqueia qualquer fallback de navegação do cache

        // Não pré-cachear HTML — apenas assets estáticos imutáveis
        globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2}"],
        globIgnores: ["**/*.html", "**/index.html"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB

        runtimeCaching: [
          // NAVEGAÇÃO (HTML): sempre busca da rede — NUNCA do cache
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkOnly",
            options: {
              cacheName: "html-cache",
            },
          },
          // JS/CSS: network-first com fallback de 3s — garante versão mais recente
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24, // 1 dia
              },
              networkTimeoutSeconds: 3,
            },
          },
          // Imagens/fontes: cache-first (raramente mudam)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|woff|woff2|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "static-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
