import { useState, useEffect, useCallback } from "react";

const TV_BASE_W = 1920;
const TV_BASE_H = 1080;

export function useTVScale() {
  const calc = useCallback(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : TV_BASE_W;
    const h = typeof window !== "undefined" ? window.innerHeight : TV_BASE_H;
    const scale = Math.min(w / TV_BASE_W, h / TV_BASE_H);
    return Math.min(Math.max(scale, 0.4), 2.5);
  }, []);

  const [scale, setScale] = useState(calc);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onResize = () => setScale(calc());
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    window.addEventListener("resize", onResize);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", onFSChange);
    };
  }, [calc]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  }, []);

  return { scale, isFullscreen, toggleFullscreen };
}
