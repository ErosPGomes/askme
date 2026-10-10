import { useState, type CSSProperties, type ReactNode } from "react";
import { CATEGORIES } from "../game/categories";
import type { CategoryId } from "../game/types";
import { navigate } from "../hooks/useHashRoute";
import { BackIcon, CategoryIcon, HeartIcon } from "./Icons";

interface TopBarProps {
  title: string;
  /** Confirmação antes de sair (ex.: partida em andamento). */
  confirmLeave?: string | undefined;
  right?: ReactNode;
}

/**
 * Confirmação inline em vez de window.confirm: diálogos nativos são bloqueados em iframes
 * sandbox (retornam false sem exibir nada) e não seguem o visual do app.
 */
export function TopBar({ title, confirmLeave, right }: TopBarProps) {
  const [asking, setAsking] = useState(false);
  function back() {
    if (confirmLeave) setAsking(true);
    else navigate("home");
  }
  return (
    <>
    <header className="topbar">
      <button type="button" className="icon-btn" onClick={back} aria-label="Voltar ao início">
        <BackIcon />
      </button>
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__right">{right}</div>
    </header>
    {asking && confirmLeave && (
      <div className="leave" role="alertdialog" aria-labelledby="leave-text">
        <p id="leave-text" className="leave__text">{confirmLeave}</p>
        <div className="leave__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAsking(false)} autoFocus>
            Continuar jogando
          </button>
          <button type="button" className="btn btn--danger btn--sm" onClick={() => navigate("home")}>
            Sair
          </button>
        </div>
      </div>
    )}
    </>
  );
}

export function Lives({ lives, max }: { lives: number; max: number }) {
  return (
    <span className="lives" aria-label={`${lives} de ${max} vidas`}>
      {Array.from({ length: max }, (_, i) => (
        <HeartIcon key={i} size={22} className={i < lives ? "heart" : "heart heart--lost"} />
      ))}
    </span>
  );
}

export function CrownTrack({ crowns }: { crowns: readonly CategoryId[] }) {
  return (
    <ul className="crowns" aria-label={`${crowns.length} de ${CATEGORIES.length} coroas`}>
      {CATEGORIES.map((c) => {
        const won = crowns.includes(c.id);
        return (
          <li
            key={c.id}
            className={`crown${won ? " crown--won" : ""}`}
            style={{ "--cat": c.color, "--cat-shade": c.shade } as CSSProperties}
            title={`${c.label}${won ? " (conquistada)" : ""}`}
          >
            <CategoryIcon id={c.id} size={20} />
            <span className="sr-only">
              {c.label}: {won ? "conquistada" : "pendente"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function Meter({ value, max }: { value: number; max: number }) {
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label="Progresso até a coroa">
      <span className="meter__label">Rumo à coroa</span>
      <span className="meter__pips">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={`meter__pip${i < value ? " meter__pip--on" : ""}`} />
        ))}
      </span>
    </div>
  );
}

export function ScoreChip({ score }: { score: number }) {
  return (
    <span className="score-chip" aria-label={`${score} pontos`}>
      {score.toLocaleString("pt-BR")}
      <small>pts</small>
    </span>
  );
}
