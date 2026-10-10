import { useEffect, useRef, useState } from "react";

/**
 * Cronômetro baseado em timestamp (performance.now), não em contagem de ticks:
 * imune a atraso de setInterval em aba em segundo plano. A UI atualiza a cada 250 ms
 * (4 renders/s) — a barra visual é animada por CSS, então não há render por frame.
 */
export function useCountdown(totalSec: number | null, running: boolean, onExpire: () => void) {
  const startRef = useRef(0);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const [remaining, setRemaining] = useState(totalSec ?? 0);

  useEffect(() => {
    if (totalSec === null || !running) return;
    startRef.current = performance.now();
    setRemaining(totalSec);
    const deadline = startRef.current + totalSec * 1000;
    const interval = window.setInterval(() => {
      const left = Math.max(0, (deadline - performance.now()) / 1000);
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(interval);
        onExpireRef.current();
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [totalSec, running]);

  /** Tempo restante exato no momento da chamada (para pontuação ao responder). */
  const timeLeft = (): number =>
    totalSec === null ? 0 : Math.max(0, totalSec - (performance.now() - startRef.current) / 1000);

  return { remaining, timeLeft };
}
