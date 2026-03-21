import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Registra o SW e força reload imediato ao detectar versão nova
const updateSW = registerSW({
  onNeedRefresh() {
    // Nova versão detectada → recarrega imediatamente sem perguntar
    window.location.reload();
  },
  onOfflineReady() {
    // App pronto para uso offline
  },
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;

    // Polling agressivo: checa por atualizações a cada 60 segundos
    // Isso garante que usuários vejam a versão nova mesmo sem fechar o app
    setInterval(async () => {
      if (!(!registration.installing && navigator.onLine)) return;
      try {
        const resp = await fetch(swUrl, {
          cache: "no-store",
          headers: { "cache-control": "no-cache" },
        });
        if (resp.status === 200) {
          await registration.update();
        }
      } catch {
        // offline ou erro de rede — ignora silenciosamente
      }
    }, 60 * 1000); // 60 segundos
  },
});

createRoot(document.getElementById("root")!).render(<App />);
