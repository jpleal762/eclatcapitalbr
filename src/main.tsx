import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Canal de broadcast: quando uma aba detecta update, notifica todas as outras
const bc = typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("sw-update")
  : null;

bc?.addEventListener("message", (e) => {
  if (e.data === "reload") window.location.reload();
});

function forceReload() {
  bc?.postMessage("reload"); // avisa outras abas abertas
  window.location.reload();
}

// Registra o SW e força reload imediato ao detectar versão nova
registerSW({
  onNeedRefresh() {
    // Nova versão detectada → recarrega imediatamente em todas as abas
    forceReload();
  },
  onOfflineReady() {
    // App pronto para uso offline
  },
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;

    // Polling agressivo: checa por atualizações a cada 30 segundos
    setInterval(async () => {
      if (registration.installing || !navigator.onLine) return;
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
    }, 30 * 1000); // 30 segundos (reduzido de 60 para detectar mais rápido)
  },
});

createRoot(document.getElementById("root")!).render(<App />);
