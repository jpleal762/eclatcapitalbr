import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Força reload automático quando nova versão do Service Worker é detectada
registerSW({
  onNeedRefresh() {
    window.location.reload();
  },
  onOfflineReady() {
    // App pronto para uso offline
  },
});

createRoot(document.getElementById("root")!).render(<App />);
