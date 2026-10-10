import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from "react";
import { CrownTrack, Lives, Meter, ScoreChip, TopBar } from "../components/Hud";
import { CategoryIcon } from "../components/Icons";
import { QuestionView } from "../components/QuestionView";
import { Results } from "../components/Results";
import { Wheel, WHEEL_SEGMENTS, type WheelSegment } from "../components/Wheel";
import { CATEGORIES, categoryMeta, CROWN_COLOR } from "../game/categories";
import {
  classicReducer,
  initialClassicState,
  MAX_LIVES,
  METER_SIZE,
  pointsFor,
  remainingCrownCategories,
  TIME_LIMIT_SEC,
} from "../game/classic";
import { drawQuestion } from "../game/questions";
import type { CategoryId } from "../game/types";
import { navigate } from "../hooks/useHashRoute";
import { recordAnswer, submitScore, useProgress } from "../storage/progress";

const SPLASH_MS = 1100;
const rng = Math.random;

export function ClassicGame() {
  const [state, dispatch] = useReducer(classicReducer, initialClassicState);
  const [splash, setSplash] = useState<WheelSegment | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const progress = useProgress();
  const splashTimer = useRef<number | undefined>(undefined);
  const seen = useMemo(() => new Set(state.history.map((h) => h.question.id)), [state.history]);

  useEffect(() => () => window.clearTimeout(splashTimer.current), []);

  const startQuestion = useCallback(
    (category: CategoryId, isCrown: boolean) => {
      dispatch({ type: "start-question", question: drawQuestion(category, rng, seen), isCrown });
    },
    [seen],
  );

  function onSpin(segment: WheelSegment) {
    setSplash(segment);
    splashTimer.current = window.setTimeout(() => {
      setSplash(null);
      if (segment === "coroa") dispatch({ type: "crown-spin" });
      else startQuestion(segment, false);
    }, SPLASH_MS);
  }

  const finished = state.phase === "won" || state.phase === "lost";
  useEffect(() => {
    if (finished) setNewRecord(submitScore(state.score));
  }, [finished, state.score]);

  const current = state.current;
  const onAnswer = useCallback(
    (chosenIndex: number | null, timeLeftSec: number) => {
      if (!current) return;
      const correct = chosenIndex === current.question.answerIndex;
      recordAnswer(correct, current.question.capitalOf);
      dispatch({ type: "answer", chosenIndex, timeLeftSec });
      return pointsFor(timeLeftSec, current.isCrown);
    },
    [current],
  );
  const onContinue = useCallback(() => dispatch({ type: "next" }), []);

  if (finished) {
    const answered = state.history.length;
    const hits = state.history.filter((h) => h.correct).length;
    const won = state.phase === "won";
    return (
      <div className="screen">
        <TopBar title="Partida" />
        <CrownTrack crowns={state.crowns} />
        <Results
          tone={won ? "win" : "lose"}
          title={won ? "Você conquistou todas as coroas!" : "Fim de jogo"}
          subtitle={newRecord ? "Novo recorde pessoal!" : `Recorde: ${progress.bestScore.toLocaleString("pt-BR")} pts`}
          stats={[
            { label: "Pontos", value: state.score.toLocaleString("pt-BR") },
            { label: "Acertos", value: `${hits}/${answered}` },
            { label: "Melhor sequência", value: String(state.bestStreak) },
            { label: "Coroas", value: `${state.crowns.length}/${CATEGORIES.length}` },
          ]}
          history={state.history}
          actions={
            <>
              <button type="button" className="btn btn--primary btn--block" onClick={() => dispatch({ type: "restart" })}>
                Jogar de novo
              </button>
              <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate("estudar")}>
                Ir para o estudo
              </button>
            </>
          }
        />
      </div>
    );
  }

  const inQuestion = (state.phase === "question" || state.phase === "feedback") && current;
  return (
    <div className="screen">
      <TopBar
        title="Partida"
        confirmLeave={state.history.length > 0 ? "Sair da partida? O progresso desta rodada será perdido." : undefined}
        right={
          <>
            <Lives lives={state.lives} max={MAX_LIVES} />
            <ScoreChip score={state.score} />
          </>
        }
      />
      <CrownTrack crowns={state.crowns} />

      {inQuestion ? (
        <QuestionView
          key={state.round}
          question={current.question}
          isCrown={current.isCrown}
          timeLimitSec={TIME_LIMIT_SEC}
          onAnswer={onAnswer}
          onContinue={onContinue}
        />
      ) : state.phase === "crown-pick" ? (
        <CrownPicker crowns={state.crowns} onPick={(c) => startQuestion(c, true)} />
      ) : (
        <div className="spin-area">
          <Meter value={state.meter} max={METER_SIZE} />
          <Wheel onResult={onSpin} />
          <WheelLegend />
          {splash && <Splash segment={splash} />}
        </div>
      )}
    </div>
  );
}

function WheelLegend() {
  const unique = [...new Set(WHEEL_SEGMENTS)];
  return (
    <ul className="legend" aria-label="Categorias da roleta">
      {unique.map((segment) => {
        const colors = segment === "coroa" ? CROWN_COLOR : categoryMeta(segment);
        return (
          <li key={segment} className="legend__item" style={{ "--cat": colors.color } as CSSProperties}>
            <span className="legend__dot" aria-hidden="true" />
            {segment === "coroa" ? "Coroa" : categoryMeta(segment).label}
          </li>
        );
      })}
    </ul>
  );
}

function Splash({ segment }: { segment: WheelSegment }) {
  const colors = segment === "coroa" ? CROWN_COLOR : categoryMeta(segment);
  const label = segment === "coroa" ? "Coroa!" : categoryMeta(segment).label;
  return (
    <div className="splash" role="status" style={{ "--cat": colors.color, "--cat-shade": colors.shade } as CSSProperties}>
      <div className="splash__badge">
        <CategoryIcon id={segment} size={64} />
      </div>
      <p className="splash__label">{label}</p>
      {segment === "coroa" && <p className="splash__hint">Escolha qual coroa disputar</p>}
    </div>
  );
}

function CrownPicker({ crowns, onPick }: { crowns: readonly CategoryId[]; onPick: (c: CategoryId) => void }) {
  const options = remainingCrownCategories(crowns);
  return (
    <section className="crown-pick" aria-labelledby="crown-pick-title">
      <div className="crown-pick__badge" aria-hidden="true">
        <CategoryIcon id="coroa" size={44} />
      </div>
      <h2 id="crown-pick-title" className="crown-pick__title">
        Pergunta da coroa
      </h2>
      <p className="crown-pick__text">Acerte para conquistar a coroa da categoria. Vale pontos em dobro.</p>
      <div className="cat-grid">
        {options.map((id) => {
          const meta = categoryMeta(id);
          return (
            <button
              key={id}
              type="button"
              className="cat-card"
              style={{ "--cat": meta.color, "--cat-shade": meta.shade, "--cat-tint": meta.tint } as CSSProperties}
              onClick={() => onPick(id)}
            >
              <span className="cat-card__icon">
                <CategoryIcon id={id} size={28} />
              </span>
              <span className="cat-card__label">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
