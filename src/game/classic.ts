import type { CategoryId, Question } from "./types";
import { CATEGORIES } from "./categories";

/**
 * Regras do modo clássico (inspirado em Perguntados):
 * - Gira a roleta → responde uma pergunta da categoria sorteada.
 * - 3 acertos enchem o medidor → pergunta valendo a coroa de uma categoria à escolha.
 * - A fatia "Coroa" da roleta dá a escolha imediatamente.
 * - Erro ou tempo esgotado custa uma vida. Vence quem juntar as 6 coroas.
 *
 * Reducer puro: a geração de perguntas (aleatória) fica no componente e chega via ação,
 * o que mantém as transições determinísticas e testáveis.
 */
export const MAX_LIVES = 3;
export const METER_SIZE = 3;
export const TIME_LIMIT_SEC = 20;
const BASE_POINTS = 100;
const TIME_BONUS_PER_SEC = 5;

export type Phase = "spin" | "crown-pick" | "question" | "feedback" | "won" | "lost";

export interface AnswerRecord {
  question: Question;
  chosenIndex: number | null;
  correct: boolean;
}

export interface ClassicState {
  phase: Phase;
  lives: number;
  score: number;
  streak: number;
  bestStreak: number;
  meter: number;
  /** Incrementa a cada pergunta iniciada: chave estável da UI durante pergunta+feedback. */
  round: number;
  crowns: readonly CategoryId[];
  current: { question: Question; isCrown: boolean } | null;
  history: readonly AnswerRecord[];
}

export type ClassicAction =
  | { type: "start-question"; question: Question; isCrown: boolean }
  | { type: "crown-spin" }
  | { type: "answer"; chosenIndex: number | null; timeLeftSec: number }
  | { type: "next" }
  | { type: "restart" };

export const initialClassicState: ClassicState = {
  phase: "spin",
  lives: MAX_LIVES,
  score: 0,
  streak: 0,
  bestStreak: 0,
  meter: 0,
  round: 0,
  crowns: [],
  current: null,
  history: [],
};

export function remainingCrownCategories(crowns: readonly CategoryId[]): CategoryId[] {
  return CATEGORIES.map((c) => c.id).filter((id) => !crowns.includes(id));
}

export function pointsFor(timeLeftSec: number, isCrown: boolean): number {
  const raw = BASE_POINTS + Math.max(0, Math.round(timeLeftSec)) * TIME_BONUS_PER_SEC;
  return isCrown ? raw * 2 : raw;
}

export function classicReducer(state: ClassicState, action: ClassicAction): ClassicState {
  switch (action.type) {
    case "restart":
      return initialClassicState;

    case "crown-spin":
      return state.phase === "spin" ? { ...state, phase: "crown-pick" } : state;

    case "start-question":
      if (state.phase !== "spin" && state.phase !== "crown-pick") return state;
      return {
        ...state,
        phase: "question",
        round: state.round + 1,
        current: { question: action.question, isCrown: action.isCrown },
      };

    case "answer": {
      if (state.phase !== "question" || !state.current) return state;
      const { question, isCrown } = state.current;
      const correct = action.chosenIndex === question.answerIndex;
      const history = [...state.history, { question, chosenIndex: action.chosenIndex, correct }];

      if (correct) {
        const streak = state.streak + 1;
        return {
          ...state,
          phase: "feedback",
          score: state.score + pointsFor(action.timeLeftSec, isCrown),
          streak,
          bestStreak: Math.max(state.bestStreak, streak),
          meter: isCrown ? 0 : Math.min(METER_SIZE, state.meter + 1),
          crowns:
            isCrown && !state.crowns.includes(question.category)
              ? [...state.crowns, question.category]
              : state.crowns,
          history,
        };
      }
      return {
        ...state,
        phase: "feedback",
        lives: state.lives - 1,
        streak: 0,
        meter: isCrown ? 0 : state.meter,
        history,
      };
    }

    case "next": {
      if (state.phase !== "feedback") return state;
      const base = { ...state, current: null };
      if (state.crowns.length === CATEGORIES.length) return { ...base, phase: "won" };
      if (state.lives <= 0) return { ...base, phase: "lost" };
      if (state.meter >= METER_SIZE) return { ...base, phase: "crown-pick" };
      return { ...base, phase: "spin" };
    }
  }
}
