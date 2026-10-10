import { useDeferredValue, useMemo, useState } from "react";
import { Flag } from "../components/Flag";
import { TopBar } from "../components/Hud";
import { SearchIcon } from "../components/Icons";
import { CONTINENTS, continentName } from "../data/continents";
import { COUNTRIES } from "../data/countries";
import { NATURE_FACTS } from "../data/facts";
import { BRAZIL_STATES } from "../data/states";
import { shuffle } from "../game/rng";
import type { BrazilRegion, ContinentId, Country } from "../game/types";
import { isMastered, MASTERED_BOX, MAX_BOX, recordCapital, useProgress, type Progress } from "../storage/progress";

type Tab = "capitais" | "flashcards" | "estados" | "curiosidades";

const TABS: readonly { id: Tab; label: string }[] = [
  { id: "capitais", label: "Capitais" },
  { id: "flashcards", label: "Flashcards" },
  { id: "estados", label: "Estados" },
  { id: "curiosidades", label: "Fatos" },
];

/** Busca sem acento e sem caixa: "brasilia" encontra "Brasília". */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function Study() {
  const [tab, setTab] = useState<Tab>("capitais");
  return (
    <div className="screen">
      <TopBar title="Estudar" />
      <nav className="tabs" role="tablist" aria-label="Seções de estudo">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className={`tabs__tab${tab === t.id ? " tabs__tab--on" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="study-panel">
        {tab === "capitais" && <CapitalsList />}
        {tab === "flashcards" && <Flashcards />}
        {tab === "estados" && <StatesList />}
        {tab === "curiosidades" && <Facts />}
      </div>
    </div>
  );
}

function ContinentChips({
  value,
  onChange,
}: {
  value: ContinentId | "all";
  onChange: (v: ContinentId | "all") => void;
}) {
  return (
    <div className="chips chips--scroll">
      {[{ id: "all" as const, name: "Todos" }, ...CONTINENTS].map((c) => (
        <button
          key={c.id}
          type="button"
          className={`chip${value === c.id ? " chip--active" : ""}`}
          aria-pressed={value === c.id}
          onClick={() => onChange(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

function MasteryBar({ countries, progress }: { countries: readonly Country[]; progress: Progress }) {
  const mastered = countries.filter((c) => isMastered(progress, c.code)).length;
  const pct = countries.length ? Math.round((mastered / countries.length) * 100) : 0;
  return (
    <div className="mastery">
      <div className="mastery__text">
        <strong>{mastered}</strong> de {countries.length} capitais dominadas
        <span className="mastery__pct">{pct}%</span>
      </div>
      <div className="progress progress--green" aria-hidden="true">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CapitalsList() {
  const progress = useProgress();
  const [continent, setContinent] = useState<ContinentId | "all">("all");
  const [query, setQuery] = useState("");
  const [hide, setHide] = useState(false);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  // useDeferredValue: digitação continua fluida enquanto a lista (até 166 cards) re-renderiza.
  const deferredQuery = useDeferredValue(query);

  const byContinent = useMemo(
    () => (continent === "all" ? COUNTRIES : COUNTRIES.filter((c) => c.continent === continent)),
    [continent],
  );
  const visible = useMemo(() => {
    const q = normalize(deferredQuery.trim());
    const list = q
      ? byContinent.filter((c) => normalize(c.name).includes(q) || normalize(c.capital).includes(q))
      : byContinent;
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [byContinent, deferredQuery]);

  function toggleReveal(code: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  return (
    <>
      <MasteryBar countries={byContinent} progress={progress} />
      <div className="toolbar">
        <label className="search">
          <SearchIcon size={18} />
          <span className="sr-only">Buscar país ou capital</span>
          <input
            type="search"
            placeholder="Buscar país ou capital"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="switch">
          <input
            type="checkbox"
            checked={hide}
            onChange={(e) => {
              setHide(e.target.checked);
              setRevealed(new Set());
            }}
          />
          <span className="switch__track" aria-hidden="true" />
          Esconder capitais
        </label>
      </div>
      <ContinentChips value={continent} onChange={setContinent} />

      {visible.length === 0 ? (
        <p className="empty">Nenhum país encontrado para "{query}".</p>
      ) : (
        <ul className="country-grid">
          {visible.map((c) => {
            const hidden = hide && !revealed.has(c.code);
            return (
              <li key={c.code} className={`country-card${isMastered(progress, c.code) ? " country-card--mastered" : ""}`}>
                <Flag code={c.code} alt={`Bandeira de ${c.name}`} size="sm" />
                <div className="country-card__body">
                  <p className="country-card__name">{c.name}</p>
                  {hide ? (
                    <button
                      type="button"
                      className={`reveal${hidden ? "" : " reveal--open"}`}
                      onClick={() => toggleReveal(c.code)}
                      aria-label={hidden ? `Revelar capital de ${c.name}` : `Esconder capital de ${c.name}`}
                    >
                      {hidden ? "Toque para revelar" : c.capital}
                    </button>
                  ) : (
                    <p className="country-card__capital">{c.capital}</p>
                  )}
                  <p className="country-card__meta">
                    {continentName(c.continent)}
                    {c.currency ? ` · ${c.currency}` : ""}
                    {c.languages ? ` · ${c.languages.slice(0, 2).join(", ")}${c.languages.length > 2 ? "…" : ""}` : ""}
                  </p>
                  {c.note && !hidden && <p className="country-card__note">{c.note}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/**
 * Flashcards com repetição espaçada simplificada: o baralho prioriza caixas Leitner baixas
 * (nunca vistas e erradas primeiro), empate resolvido por embaralhamento. O(n log n) por baralho.
 */
function buildFlashDeck(continent: ContinentId | "all", progress: Progress): Country[] {
  const pool = continent === "all" ? COUNTRIES : COUNTRIES.filter((c) => c.continent === continent);
  return shuffle(Math.random, pool).sort(
    (a, b) => (progress.capitalBoxes[a.code] ?? 0) - (progress.capitalBoxes[b.code] ?? 0),
  );
}

const FLASH_SESSION = 15;

function boxLabel(box: number | undefined): string {
  if (!box) return "Novo";
  return box >= MASTERED_BOX ? `Dominada · nível ${box}/${MAX_BOX}` : `Nível ${box}/${MAX_BOX}`;
}

function Flashcards() {
  const progress = useProgress();
  const [continent, setContinent] = useState<ContinentId | "all">("all");
  // Baralho congelado na criação: avaliar um card não reordena a sessão em andamento.
  const [deck, setDeck] = useState<Country[]>(() => buildFlashDeck("all", progress).slice(0, FLASH_SESSION));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ knew: 0, missed: 0 });

  function restart(next: ContinentId | "all" = continent) {
    setContinent(next);
    setDeck(buildFlashDeck(next, progress).slice(0, FLASH_SESSION));
    setIndex(0);
    setFlipped(false);
    setTally({ knew: 0, missed: 0 });
  }

  function grade(knew: boolean) {
    const card = deck[index];
    if (!card) return;
    recordCapital(card.code, knew);
    setTally((t) => (knew ? { ...t, knew: t.knew + 1 } : { ...t, missed: t.missed + 1 }));
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  const card = deck[index];
  const pool = continent === "all" ? COUNTRIES : COUNTRIES.filter((c) => c.continent === continent);

  return (
    <>
      <MasteryBar countries={pool} progress={progress} />
      <ContinentChips value={continent} onChange={restart} />
      {card ? (
        <div className="flash">
          <p className="flash__count">
            Card {index + 1} de {deck.length}
            <span className="flash__box">{boxLabel(progress.capitalBoxes[card.code])}</span>
          </p>
          <button
            type="button"
            className={`flash__card${flipped ? " flash__card--flipped" : ""}`}
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? `Capital: ${card.capital}. Toque para ver a frente.` : `Qual a capital de ${card.name}? Toque para virar.`}
          >
            <span className="flash__face flash__face--front">
              <Flag code={card.code} alt="" size="lg" />
              <span className="flash__name">{card.name}</span>
              <span className="flash__hint">Qual é a capital? Toque para virar</span>
            </span>
            <span className="flash__face flash__face--back">
              <span className="flash__label">Capital</span>
              <span className="flash__capital">{card.capital}</span>
              <span className="flash__hint">{continentName(card.continent)}</span>
              {card.note && <span className="flash__note">{card.note}</span>}
            </span>
          </button>
          <div className="flash__actions">
            <button type="button" className="btn btn--danger" onClick={() => grade(false)} disabled={!flipped}>
              Não sabia
            </button>
            <button type="button" className="btn btn--success" onClick={() => grade(true)} disabled={!flipped}>
              Sabia!
            </button>
          </div>
          {!flipped && <p className="flash__tip">Pense na resposta, vire o card e seja honesto.</p>}
        </div>
      ) : (
        <div className="flash-done">
          <h3>Sessão concluída</h3>
          <p>
            Você sabia <strong>{tally.knew}</strong> e errou <strong>{tally.missed}</strong>. Os cards errados voltam primeiro
            na próxima rodada.
          </p>
          <button type="button" className="btn btn--primary" onClick={() => restart()}>
            Nova rodada
          </button>
        </div>
      )}
    </>
  );
}

const REGIONS: readonly BrazilRegion[] = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

function StatesList() {
  const [hide, setHide] = useState(false);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  return (
    <>
      <div className="toolbar">
        <p className="toolbar__text">26 estados + Distrito Federal (Brasília)</p>
        <label className="switch">
          <input
            type="checkbox"
            checked={hide}
            onChange={(e) => {
              setHide(e.target.checked);
              setRevealed(new Set());
            }}
          />
          <span className="switch__track" aria-hidden="true" />
          Esconder capitais
        </label>
      </div>
      {REGIONS.map((region) => (
        <section key={region} className="region">
          <h3 className="section-title">{region}</h3>
          <ul className="state-list">
            {BRAZIL_STATES.filter((s) => s.region === region).map((s) => {
              const hidden = hide && !revealed.has(s.uf);
              return (
                <li key={s.uf} className="state-row">
                  <span className="state-row__uf">{s.uf}</span>
                  <span className="state-row__name">{s.name}</span>
                  {hide ? (
                    <button
                      type="button"
                      className={`reveal${hidden ? "" : " reveal--open"}`}
                      onClick={() => setRevealed((prev) => new Set(prev).add(s.uf))}
                    >
                      {hidden ? "Revelar" : s.capital}
                    </button>
                  ) : (
                    <span className="state-row__capital">{s.capital}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}

function Facts() {
  return (
    <ul className="facts">
      {NATURE_FACTS.map((f) => (
        <li key={f.id}>
          <details className="fact">
            <summary className="fact__q">{f.prompt}</summary>
            <p className="fact__a">{f.answer}</p>
            <p className="fact__e">{f.explanation}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
