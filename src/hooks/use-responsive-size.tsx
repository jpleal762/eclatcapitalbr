import { useState, useEffect } from 'react';

interface ResponsiveSize {
  width: number;
  height: number;
  unit: number;
  scale: number;
  isWidescreen: boolean;
}

export function useResponsiveSize(): ResponsiveSize {
  const [size, setSize] = useState<ResponsiveSize>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1600;
    const h = typeof window !== 'undefined' ? window.innerHeight : 900;
    const aspectRatio = w / h;
    const isWidescreen = aspectRatio > 1.5;
    const baseScale = isWidescreen 
      ? Math.min(h / 1080, w / 1920) 
      : Math.min(h / 900, w / 1600);
    return {
      width: w,
      height: h,
      unit: Math.min(h * 0.01, w * 0.008),
      scale: baseScale,
      isWidescreen,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspectRatio = w / h;
      const isWidescreen = aspectRatio > 1.5;
      const baseScale = isWidescreen 
        ? Math.min(h / 1080, w / 1920) 
        : Math.min(h / 900, w / 1600);
      setSize({
        width: w,
        height: h,
        unit: Math.min(h * 0.01, w * 0.008),
        scale: baseScale,
        isWidescreen,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
