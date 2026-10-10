import type { CSSProperties } from "react";
import { BookIcon, CategoryIcon, PlayIcon, TargetIcon } from "../components/Icons";
import { COUNTRIES } from "../data/countries";
import { CATEGORIES } from "../game/categories";
import { navigate } from "../hooks/useHashRoute";
import { isMastered, useProgress } from "../storage/progress";

export function Home() {
  const progress = useProgress();
  const mastered = COUNTRIES.filter((c) => isMastered(progress, c.code)).length;
  const accuracy = progress.answered ? Math.round((progress.correct / progress.answered) * 100) : null;

  return (
    <div className="screen home">
      <header className="brand">
        <span className="brand__mark" aria-hidden="true">
          <CategoryIcon id="continentes" size={30} />
        </span>
        <span className="brand__name">
          AskMe<span className="brand__accent">Geo</span>
        </span>
      </header>

      <section className="hero">
        <h1 className="hero__title">Quanto você sabe de Geografia?</h1>
        <p className="hero__text">Gire a roleta, responda e conquiste as 6 coroas. Capitais são a estrela do jogo.</p>
        <ul className="hero__cats" aria-label="Categorias">
          {CATEGORIES.map((c, i) => (
            <li
              key={c.id}
              className="hero__cat"
              style={{ "--cat": c.color, "--cat-shade": c.shade, "--i": i } as CSSProperties}
              title={c.label}
            >
              <CategoryIcon id={c.id} size={24} />
              <span className="sr-only">{c.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <nav className="menu" aria-label="Modos">
        <button type="button" className="menu__btn menu__btn--play" onClick={() => navigate("jogar")}>
          <span className="menu__icon">
            <PlayIcon size={26} />
          </span>
          <span className="menu__text">
            <strong>Jogar</strong>
            <small>Roleta, 3 vidas e coroas</small>
          </span>
        </button>
        <button type="button" className="menu__btn menu__btn--train" onClick={() => navigate("treinar")}>
          <span className="menu__icon">
            <TargetIcon size={26} />
          </span>
          <span className="menu__text">
            <strong>Treinar</strong>
            <small>Escolha categoria e continente</small>
          </span>
        </button>
        <button type="button" className="menu__btn menu__btn--study" onClick={() => navigate("estudar")}>
          <span className="menu__icon">
            <BookIcon size={26} />
          </span>
          <span className="menu__text">
            <strong>Estudar</strong>
            <small>Capitais, flashcards e fatos</small>
          </span>
        </button>
      </nav>

      <dl className="home-stats">
        <div className="stat">
          <dt>Recorde</dt>
          <dd>{progress.bestScore.toLocaleString("pt-BR")}</dd>
        </div>
        <div className="stat">
          <dt>Capitais dominadas</dt>
          <dd>
            {mastered}
            <small>/{COUNTRIES.length}</small>
          </dd>
        </div>
        <div className="stat">
          <dt>Acertos</dt>
          <dd>{accuracy === null ? "—" : `${accuracy}%`}</dd>
        </div>
      </dl>
    </div>
  );
}
