import { useState, useEffect } from 'react';

interface ResponsiveSize {
  width: number;
  height: number;
  unit: number;
  scale: number;
}

export function useResponsiveSize(): ResponsiveSize {
  const [size, setSize] = useState<ResponsiveSize>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1600;
    const h = typeof window !== 'undefined' ? window.innerHeight : 900;
    return {
      width: w,
      height: h,
      unit: Math.min(h * 0.01, w * 0.008),
      scale: Math.min(h / 900, w / 1600),
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setSize({
        width: w,
        height: h,
        unit: Math.min(h * 0.01, w * 0.008),
        scale: Math.min(h / 900, w / 1600),
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
