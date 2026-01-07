import { useEffect } from "react";
import { useTheme } from "next-themes";

export function useAutoTheme() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const checkTimeAndSetTheme = () => {
      const hour = new Date().getHours();
      // Após 16:00 (4 PM) ativa dark mode
      if (hour >= 16) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    };

    // Verificar imediatamente
    checkTimeAndSetTheme();

    // Verificar a cada minuto para troca automática
    const interval = setInterval(checkTimeAndSetTheme, 60000);

    return () => clearInterval(interval);
  }, [setTheme]);
}
