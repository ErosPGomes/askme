import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { ScoreChip, TopBar } from "../components/Hud";
import { CategoryIcon } from "../components/Icons";
import { QuestionView } from "../components/QuestionView";
import { Results } from "../components/Results";
import { CONTINENTS } from "../data/continents";
import { CATEGORIES, categoryMeta } from "../game/categories";
import type { AnswerRecord } from "../game/classic";
import { pointsFor } from "../game/classic";
import { buildDeck, templatesFor, type CapitalScope, type QuestionFilter } from "../game/questions";
import { shuffle } from "../game/rng";
import type { CategoryId, ContinentId, Question } from "../game/types";
import { recordAnswer } from "../storage/progress";

type Count = 10 | 20 | "all";

interface Config {
  category: CategoryId;
  continent: ContinentId | "all";
  capitalScope: CapitalScope;
  count: Count;
  timed: boolean;
}

const DEFAULT_CONFIG: Config = { category: "capitais", continent: "all", capitalScope: "paises", count: 10, timed: true };
const TIME_LIMIT_SEC = 20;
const CONTINENT_FILTERABLE: ReadonlySet<CategoryId> = new Set(["capitais", "bandeiras", "moedas", "idiomas"]);

function toFilter(config: Config): QuestionFilter {
  const usesContinent =
    CONTINENT_FILTERABLE.has(config.category) && !(config.category === "capitais" && config.capitalScope === "estados");
  return {
    ...(usesContinent && config.continent !== "all" ? { continent: config.continent } : {}),
    ...(config.category === "capitais" ? { capitalScope: config.capitalScope } : {}),
  };
}

interface Run {
  deck: readonly Question[];
  index: number;
  score: number;
  history: readonly AnswerRecord[];
}

export function Practice() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [run, setRun] = useState<Run | null>(null);

  const start = (deck: readonly Question[]) => setRun({ deck, index: 0, score: 0, history: [] });

  if (!run) {
    return (
      <div className="screen">
        <TopBar title="Treino" />
        <PracticeSetup
          config={config}
          onChange={setConfig}
          onStart={() => start(buildDeck(config.category, Math.random, config.count, toFilter(config)))}
        />
      </div>
    );
  }

  const done = run.index >= run.deck.length;
  if (done) {
    const hits = run.history.filter((h) => h.correct).length;
    const pct = Math.round((hits / run.history.length) * 100);
    const mistakes = run.history.filter((h) => !h.correct).map((h) => h.question);
    return (
      <div className="screen">
        <TopBar title="Treino" />
        <Results
          tone={pct >= 70 ? "win" : "neutral"}
          title={pct === 100 ? "Gabaritou!" : pct >= 70 ? "Mandou bem!" : "Continue treinando"}
          subtitle={`${categoryMeta(run.deck[0]!.category).label} · ${run.deck.length} perguntas`}
          stats={[
            { label: "Acertos", value: `${hits}/${run.history.length}` },
            { label: "Aproveitamento", value: `${pct}%` },
            ...(config.timed ? [{ label: "Pontos", value: run.score.toLocaleString("pt-BR") }] : []),
          ]}
          history={run.history}
          actions={
            <>
              {mistakes.length > 0 && (
                // Reaproveita as perguntas erradas com alternativas reembaralhadas: repetição focada.
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={() => start(shuffle(Math.random, mistakes).map((q) => reshuffle(q)))}
                >
                  Refazer os erros
                </button>
              )}
              <button type="button" className="btn btn--secondary btn--block" onClick={() => start(buildDeck(config.category, Math.random, config.count, toFilter(config)))}>
                Novo treino igual
              </button>
              <button type="button" className="btn btn--ghost btn--block" onClick={() => setRun(null)}>
                Mudar configuração
              </button>
            </>
          }
        />
      </div>
    );
  }

  return <PracticeRun run={run} timed={config.timed} onUpdate={setRun} onQuit={() => setRun(null)} />;
}

function reshuffle(q: Question): Question {
  const answer = q.options[q.answerIndex]!;
  const options = shuffle(Math.random, q.options);
  return { ...q, options, answerIndex: options.indexOf(answer) };
}

function PracticeRun({
  run,
  timed,
  onUpdate,
  onQuit,
}: {
  run: Run;
  timed: boolean;
  onUpdate: (run: Run) => void;
  onQuit: () => void;
}) {
  const question = run.deck[run.index]!;
  const progressPct = (run.index / run.deck.length) * 100;

  const onAnswer = useCallback(
    (chosenIndex: number | null, timeLeftSec: number) => {
      const correct = chosenIndex === question.answerIndex;
      recordAnswer(correct, question.capitalOf);
      const earned = correct && timed ? pointsFor(timeLeftSec, false) : 0;
      onUpdate({ ...run, score: run.score + earned, history: [...run.history, { question, chosenIndex, correct }] });
      return timed ? earned : undefined;
    },
    [question, run, timed, onUpdate],
  );

  // Avança a partir do histórico já gravado: `run` aqui é a versão pós-resposta.
  const onContinue = useCallback(() => onUpdate({ ...run, index: run.index + 1 }), [run, onUpdate]);

  return (
    <div className="screen">
      <header className="topbar">
        <button type="button" className="btn btn--ghost btn--sm" onClick={onQuit}>
          Encerrar
        </button>
        <div className="progress" aria-hidden="true">
          <div className="progress__fill" style={{ width: `${progressPct}%` }} />
        </div>
        {timed && <ScoreChip score={run.score} />}
      </header>
      <QuestionView
        key={`${question.id}-${run.index}`}
        question={question}
        timeLimitSec={timed ? TIME_LIMIT_SEC : null}
        counter={`${run.index + 1} / ${run.deck.length}`}
        onAnswer={onAnswer}
        onContinue={onContinue}
        continueLabel={run.index + 1 === run.deck.length ? "Ver resultado" : "Próxima"}
      />
    </div>
  );
}

function PracticeSetup({
  config,
  onChange,
  onStart,
}: {
  config: Config;
  onChange: (c: Config) => void;
  onStart: () => void;
}) {
  const set = <K extends keyof Config>(key: K, value: Config[K]) => onChange({ ...config, [key]: value });
  const available = useMemo(() => templatesFor(config.category, toFilter(config)).length, [config]);
  const showContinent =
    CONTINENT_FILTERABLE.has(config.category) && !(config.category === "capitais" && config.capitalScope === "estados");
  const total = config.count === "all" ? available : Math.min(config.count, available);

  return (
    <div className="setup">
      <fieldset className="field">
        <legend className="section-title">Categoria</legend>
        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`cat-card${config.category === c.id ? " cat-card--active" : ""}`}
              aria-pressed={config.category === c.id}
              style={{ "--cat": c.color, "--cat-shade": c.shade, "--cat-tint": c.tint } as CSSProperties}
              onClick={() => set("category", c.id)}
            >
              <span className="cat-card__icon">
                <CategoryIcon id={c.id} size={28} />
              </span>
              <span className="cat-card__label">{c.label}</span>
              <span className="cat-card__blurb">{c.blurb}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {config.category === "capitais" && (
        <fieldset className="field">
          <legend className="section-title">O que treinar</legend>
          <Segmented
            value={config.capitalScope}
            onChange={(v) => set("capitalScope", v)}
            options={[
              { value: "paises", label: "Países" },
              { value: "estados", label: "Estados do Brasil" },
              { value: "todos", label: "Tudo" },
            ]}
          />
        </fieldset>
      )}

      {showContinent && (
        <fieldset className="field">
          <legend className="section-title">Continente</legend>
          <div className="chips">
            {[{ id: "all" as const, name: "Todos" }, ...CONTINENTS].map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip${config.continent === c.id ? " chip--active" : ""}`}
                aria-pressed={config.continent === c.id}
                onClick={() => set("continent", c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="field-row">
        <fieldset className="field">
          <legend className="section-title">Perguntas</legend>
          <Segmented
            value={config.count}
            onChange={(v) => set("count", v)}
            options={[
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: "all", label: `Todas (${available})` },
            ]}
          />
        </fieldset>
        <fieldset className="field">
          <legend className="section-title">Cronômetro</legend>
          <Segmented
            value={config.timed}
            onChange={(v) => set("timed", v)}
            options={[
              { value: true, label: `${TIME_LIMIT_SEC}s` },
              { value: false, label: "Sem tempo" },
            ]}
          />
        </fieldset>
      </div>

      <button type="button" className="btn btn--primary btn--lg btn--block setup__start" onClick={onStart} disabled={total === 0}>
        Começar · {total} perguntas
      </button>
    </div>
  );
}

function Segmented<T extends string | number | boolean>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={`segmented__opt${o.value === value ? " segmented__opt--on" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
