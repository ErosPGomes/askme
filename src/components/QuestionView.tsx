import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { categoryMeta, CROWN_COLOR } from "../game/categories";
import type { Question } from "../game/types";
import { useCountdown } from "../hooks/useCountdown";
import { Flag } from "./Flag";
import { CategoryIcon, CheckIcon, ClockIcon, CrossIcon } from "./Icons";

interface QuestionViewProps {
  question: Question;
  /** null = sem cronômetro (modo treino relaxado). */
  timeLimitSec: number | null;
  isCrown?: boolean;
  /** Ex.: "3 / 10" no modo treino. */
  counter?: string;
  /** Retorna os pontos ganhos (opcional) para exibir no feedback. */
  onAnswer: (chosenIndex: number | null, timeLeftSec: number) => number | void;
  onContinue: () => void;
  continueLabel?: string;
}

const LETTERS = ["A", "B", "C", "D"] as const;

/** Monte com `key={question.id}`: o remount zera estado e cronômetro sem lógica de reset manual. */
export function QuestionView({
  question,
  timeLimitSec,
  isCrown = false,
  counter,
  onAnswer,
  onContinue,
  continueLabel = "Continuar",
}: QuestionViewProps) {
  const meta = categoryMeta(question.category);
  const theme = isCrown ? CROWN_COLOR : meta;
  // undefined = ainda não respondeu; null = tempo esgotado.
  const [chosen, setChosen] = useState<number | null | undefined>(undefined);
  const [points, setPoints] = useState<number | null>(null);
  const answered = chosen !== undefined;

  // Ref (não state) como trava: síncrona, bloqueia duplo clique/tecla no mesmo frame
  // e mantém o efeito colateral fora de updaters de setState (que o StrictMode executa 2x).
  const lock = useRef(false);
  const answer = useCallback(
    (index: number | null, timeLeftSec: number) => {
      if (lock.current) return;
      lock.current = true;
      const earned = onAnswer(index, timeLeftSec);
      setPoints(typeof earned === "number" && index === question.answerIndex ? earned : null);
      setChosen(index);
    },
    [onAnswer, question.answerIndex],
  );

  const { remaining, timeLeft } = useCountdown(timeLimitSec, !answered, () => answer(null, 0));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (!answered) {
        const byNumber = Number.parseInt(e.key, 10) - 1;
        const byLetter = LETTERS.indexOf(e.key.toUpperCase() as (typeof LETTERS)[number]);
        const index = byNumber >= 0 && byNumber < 4 ? byNumber : byLetter;
        if (index >= 0) answer(index, timeLeft());
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onContinue();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, answer, onContinue, timeLeft]);

  const correct = answered && chosen === question.answerIndex;
  const isFlagQuiz = question.category === "bandeiras";
  const urgent = timeLimitSec !== null && remaining <= 5 && !answered;

  return (
    <section
      className="question"
      style={{ "--cat": theme.color, "--cat-shade": theme.shade, "--cat-tint": theme.tint, "--cat-ink": theme.ink } as CSSProperties}
      aria-labelledby="question-prompt"
    >
      <header className="question__head">
        <span className="pill pill--cat">
          <CategoryIcon id={isCrown ? "coroa" : question.category} size={18} />
          {isCrown ? `Coroa · ${meta.label}` : meta.label}
        </span>
        {counter && <span className="question__counter">{counter}</span>}
        {timeLimitSec !== null && (
          <span className={`timer${urgent ? " timer--urgent" : ""}`} aria-label={`${Math.ceil(remaining)} segundos`}>
            <ClockIcon size={18} />
            {Math.ceil(remaining)}
          </span>
        )}
      </header>

      {timeLimitSec !== null && (
        <div className="timebar" aria-hidden="true">
          <div
            className="timebar__fill"
            style={{
              animationDuration: `${timeLimitSec}s`,
              animationPlayState: answered ? "paused" : "running",
            }}
          />
        </div>
      )}

      <div className="question__card">
        {question.flagCode && (
          <Flag
            code={question.flagCode}
            alt={isFlagQuiz ? "Bandeira misteriosa" : ""}
            size={isFlagQuiz ? "lg" : "sm"}
          />
        )}
        <h2 id="question-prompt" className="question__prompt">
          {question.prompt}
        </h2>
      </div>

      <ol className="options">
        {question.options.map((option, i) => {
          const state = !answered
            ? ""
            : i === question.answerIndex
              ? " option--correct"
              : i === chosen
                ? " option--wrong"
                : " option--dim";
          return (
            <li key={option}>
              <button
                type="button"
                className={`option${state}`}
                onClick={() => answer(i, timeLeft())}
                disabled={answered}
                aria-describedby={answered ? "feedback" : undefined}
              >
                <span className="option__letter" aria-hidden="true">
                  {answered && i === question.answerIndex ? (
                    <CheckIcon size={18} />
                  ) : answered && i === chosen ? (
                    <CrossIcon size={18} />
                  ) : (
                    LETTERS[i]
                  )}
                </span>
                <span className="option__text">{option}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div id="feedback" className="feedback-slot" aria-live="polite">
        {answered && (
          <div className={`feedback ${correct ? "feedback--ok" : "feedback--bad"}`}>
            <p className="feedback__title">
              {correct ? "Correto!" : chosen === null ? "Tempo esgotado!" : "Não foi dessa vez"}
              {points !== null && <span className="feedback__points">+{points}</span>}
            </p>
            {question.explanation && <p className="feedback__text">{question.explanation}</p>}
            <button type="button" className="btn btn--primary btn--block" onClick={onContinue} autoFocus>
              {continueLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
