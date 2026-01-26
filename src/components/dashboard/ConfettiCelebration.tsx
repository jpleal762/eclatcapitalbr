import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiCelebrationProps {
  trigger: boolean;
  origin?: { x: number; y: number };
}

export function ConfettiCelebration({ trigger, origin }: ConfettiCelebrationProps) {
  const hasTriggered = useRef(false);
  
  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      
      // Burst de confetti dourado (cores da marca)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: origin || { x: 0.5, y: 0.6 },
        colors: ['#FFE066', '#E6A800', '#22C55E', '#FFFFFF'],
        gravity: 0.8,
        scalar: 1.2,
      });
      
      // Segunda explosão menor após delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: origin || { x: 0.5, y: 0.6 },
          colors: ['#FFE066', '#22C55E'],
        });
      }, 150);
    }
  }, [trigger, origin]);
  
  // Reset when trigger becomes false
  useEffect(() => {
    if (!trigger) {
      hasTriggered.current = false;
    }
  }, [trigger]);
  
  return null;
}
