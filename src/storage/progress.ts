import { useSyncExternalStore } from "react";

/**
 * Progresso local (por navegador). Leitner simplificado por país:
 * acerto sobe uma caixa (máx. 5), erro volta para a caixa 1. Caixa ≥ 3 = capital dominada.
 * Store externo + useSyncExternalStore: todos os componentes leem o mesmo snapshot
 * sem Context, e a escrita no localStorage é isolada num único ponto com try/catch
 * (modo privado/quota cheia não derrubam o jogo).
 */
export const MAX_BOX = 5;
export const MASTERED_BOX = 3;

export interface Progress {
  version: 1;
  bestScore: number;
  /** código do país → caixa Leitner (1..5). Ausente = nunca estudado. */
  capitalBoxes: Readonly<Record<string, number>>;
  answered: number;
  correct: number;
}

const STORAGE_KEY = "askme-geo:progress";
const EMPTY: Progress = { version: 1, bestScore: 0, capitalBoxes: {}, answered: 0, correct: 0 };

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    // Validação mínima: dado corrompido ou de versão futura volta ao estado vazio em vez de quebrar a UI.
    if (typeof parsed !== "object" || parsed === null || (parsed as Progress).version !== 1) return EMPTY;
    return { ...EMPTY, ...(parsed as Progress) };
  } catch {
    return EMPTY;
  }
}

let snapshot: Progress = typeof localStorage === "undefined" ? EMPTY : load();
const listeners = new Set<() => void>();

function commit(next: Progress): void {
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* armazenamento indisponível: progresso vive só nesta aba */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, () => snapshot, () => EMPTY);
}

export function recordCapital(code: string, correct: boolean): void {
  const box = snapshot.capitalBoxes[code] ?? 0;
  const next = correct ? Math.min(MAX_BOX, Math.max(1, box) + 1) : 1;
  commit({ ...snapshot, capitalBoxes: { ...snapshot.capitalBoxes, [code]: next } });
}

export function recordAnswer(correct: boolean, capitalOf?: string): void {
  commit({ ...snapshot, answered: snapshot.answered + 1, correct: snapshot.correct + (correct ? 1 : 0) });
  if (capitalOf) recordCapital(capitalOf, correct);
}

export function submitScore(score: number): boolean {
  if (score <= snapshot.bestScore) return false;
  commit({ ...snapshot, bestScore: score });
  return true;
}

export function resetProgress(): void {
  commit(EMPTY);
}

export function isMastered(progress: Progress, code: string): boolean {
  return (progress.capitalBoxes[code] ?? 0) >= MASTERED_BOX;
}
