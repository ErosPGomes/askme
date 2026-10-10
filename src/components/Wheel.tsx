import { useEffect, useRef, useState } from "react";
import { categoryMeta, CROWN_COLOR } from "../game/categories";
import type { CategoryId } from "../game/types";
import { CategoryIcon } from "./Icons";

export type WheelSegment = CategoryId | "coroa";

/** Capitais ocupa duas fatias opostas: é o foco do jogo e aparece com o dobro da frequência. */
export const WHEEL_SEGMENTS: readonly WheelSegment[] = [
  "capitais",
  "bandeiras",
  "continentes",
  "moedas",
  "capitais",
  "idiomas",
  "natureza",
  "coroa",
];

const SLICE = 360 / WHEEL_SEGMENTS.length;
const RADIUS = 92;
const SPIN_MS = 3400;
const REDUCED_SPIN_MS = 700;

function segmentColor(segment: WheelSegment) {
  return segment === "coroa" ? CROWN_COLOR : categoryMeta(segment);
}

/** Ponto na circunferência; ângulo em graus no sentido horário a partir do topo. */
function polar(angleDeg: number, r: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [r * Math.cos(rad), r * Math.sin(rad)];
}

function slicePath(index: number): string {
  const [x0, y0] = polar(index * SLICE, RADIUS);
  const [x1, y1] = polar((index + 1) * SLICE, RADIUS);
  return `M0 0L${x0.toFixed(3)} ${y0.toFixed(3)}A${RADIUS} ${RADIUS} 0 0 1 ${x1.toFixed(3)} ${y1.toFixed(3)}Z`;
}

interface WheelProps {
  onResult: (segment: WheelSegment) => void;
  /** Fonte de aleatoriedade injetável (testes/demonstração). */
  random?: () => number;
}

export function Wheel({ onResult, random = Math.random }: WheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reducedMotion ? REDUCED_SPIN_MS : SPIN_MS;

  function spin() {
    if (spinning) return;
    const index = Math.floor(random() * WHEEL_SEGMENTS.length);
    // Ângulo da roda que deve ficar sob o ponteiro: centro da fatia ± 35% (evita parar na borda).
    const landing = (index + 0.5 + (random() - 0.5) * 0.7) * SLICE;
    const target = (360 - landing) % 360;
    const current = ((rotation % 360) + 360) % 360;
    const delta = (target - current + 360) % 360;
    const turns = reducedMotion ? 1 : 5;
    setRotation(rotation + turns * 360 + delta);
    setSpinning(true);
    // setTimeout em vez de transitionend: dispara mesmo com a aba oculta ou transição cancelada.
    timer.current = window.setTimeout(() => {
      setSpinning(false);
      onResult(WHEEL_SEGMENTS[index] as WheelSegment);
    }, duration + 150);
  }

  return (
    <div className="wheel">
      <div className="wheel__pointer" aria-hidden="true" />
      <svg className="wheel__svg" viewBox="-100 -100 200 200" aria-hidden="true">
        <circle r="99" className="wheel__rim" />
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${duration}ms cubic-bezier(0.15, 0.7, 0.12, 1)` : "none",
          }}
        >
          {WHEEL_SEGMENTS.map((segment, i) => {
            const colors = segmentColor(segment);
            const mid = (i + 0.5) * SLICE;
            return (
              <g key={i}>
                <path d={slicePath(i)} fill={colors.color} stroke="#fff" strokeWidth="1.5" />
                <g transform={`rotate(${mid}) translate(0 -60)`} color={segment === "coroa" ? "#FFC21A" : "#fff"}>
                  <circle r="17" fill={colors.shade} opacity="0.35" />
                  <CategoryIcon id={segment} x={-12} y={-12} width={24} height={24} />
                </g>
              </g>
            );
          })}
        </g>
        {Array.from({ length: 16 }, (_, i) => {
          const [x, y] = polar(i * 22.5, 96);
          return <circle key={i} cx={x} cy={y} r="2.1" className="wheel__bulb" />;
        })}
      </svg>
      <button
        type="button"
        className="wheel__hub"
        onClick={spin}
        disabled={spinning}
        aria-label={spinning ? "Girando a roleta" : "Girar a roleta"}
      >
        {spinning ? "…" : "GIRAR"}
      </button>
    </div>
  );
}
