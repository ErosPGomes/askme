import type { CSSProperties, ReactNode } from "react";
import { categoryMeta } from "../game/categories";
import type { AnswerRecord } from "../game/classic";
import { CategoryIcon } from "./Icons";

interface ResultsProps {
  tone: "win" | "lose" | "neutral";
  title: string;
  subtitle?: string;
  stats: readonly { label: string; value: string }[];
  history: readonly AnswerRecord[];
  actions: ReactNode;
}

export function Results({ tone, title, subtitle, stats, history, actions }: ResultsProps) {
  const mistakes = history.filter((h) => !h.correct);
  return (
    <section className={`results results--${tone}`}>
      <div className="results__hero">
        <h2 className="results__title">{title}</h2>
        {subtitle && <p className="results__subtitle">{subtitle}</p>}
        <dl className="results__stats">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="results__actions">{actions}</div>

      {mistakes.length > 0 && (
        <div className="review">
          <h3 className="section-title">Para revisar ({mistakes.length})</h3>
          <ul className="review__list">
            {mistakes.map(({ question, chosenIndex }, i) => {
              const meta = categoryMeta(question.category);
              return (
                <li
                  key={`${question.id}-${i}`}
                  className="review__item"
                  style={{ "--cat": meta.color, "--cat-tint": meta.tint, "--cat-shade": meta.shade } as CSSProperties}
                >
                  <span className="review__icon" aria-hidden="true">
                    <CategoryIcon id={question.category} size={18} />
                  </span>
                  <div>
                    <p className="review__prompt">{question.prompt}</p>
                    <p className="review__answer">
                      <strong>{question.options[question.answerIndex]}</strong>
                      {chosenIndex === null ? (
                        <span className="review__yours"> · tempo esgotado</span>
                      ) : (
                        <span className="review__yours"> · você marcou {question.options[chosenIndex]}</span>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
