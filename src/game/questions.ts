import { CONTINENTS, continentName } from "../data/continents";
import { COUNTRIES } from "../data/countries";
import { NATURE_FACTS } from "../data/facts";
import { BRAZIL_STATES } from "../data/states";
import { ofCountry, theCountry } from "./grammar";
import { pick, shuffle, type Rng } from "./rng";
import type { CategoryId, ContinentId, Country, Question } from "./types";

export type CapitalScope = "paises" | "estados" | "todos";

export interface QuestionFilter {
  /** Restringe perguntas baseadas em país a um continente. Ignorado em Continentes e Natureza. */
  continent?: ContinentId;
  /** Apenas para Capitais: países, estados brasileiros ou ambos. */
  capitalScope?: CapitalScope;
}

/**
 * Um template é uma pergunta ainda não sorteada: o id é estável (permite evitar repetição)
 * e `build` embaralha alternativas no momento de exibir. Separar os dois permite
 * montar baralhos sem repetição em O(n) em vez de sortear-e-rejeitar.
 */
export interface QuestionTemplate {
  id: string;
  build: (rng: Rng) => Question;
}

const OPTION_COUNT = 4;

/**
 * Escolhe distratores priorizando `preferred` (ex.: capitais do mesmo continente, mais
 * desafiadoras e educativas) e completando com `fallback`. Garante strings únicas e
 * diferentes da resposta e de `forbidden` (respostas que também seriam corretas).
 */
function pickDistractors(
  rng: Rng,
  answer: string,
  preferred: readonly string[],
  fallback: readonly string[],
  forbidden: ReadonlySet<string> = new Set(),
): string[] {
  const chosen = new Set<string>();
  for (const pool of [preferred, fallback]) {
    for (const candidate of shuffle(rng, pool)) {
      if (chosen.size === OPTION_COUNT - 1) return [...chosen];
      if (candidate !== answer && !forbidden.has(candidate)) chosen.add(candidate);
    }
  }
  if (chosen.size < OPTION_COUNT - 1) {
    throw new Error(`Distratores insuficientes para "${answer}"`);
  }
  return [...chosen];
}

function assemble(
  rng: Rng,
  base: Omit<Question, "options" | "answerIndex">,
  answer: string,
  distractors: readonly string[],
): Question {
  const options = shuffle(rng, [answer, ...distractors]);
  return { ...base, options, answerIndex: options.indexOf(answer) };
}

function sameContinent(country: Country): readonly Country[] {
  return COUNTRIES.filter((c) => c.continent === country.continent && c.code !== country.code);
}

const ALL_CAPITALS = COUNTRIES.map((c) => c.capital);
const ALL_NAMES = COUNTRIES.map((c) => c.name);
const ALL_CURRENCIES = [...new Set(COUNTRIES.flatMap((c) => (c.currency ? [c.currency] : [])))];
const ALL_LANGUAGES = [...new Set(COUNTRIES.flatMap((c) => c.languages ?? []))];

function capitalExplanation(country: Country): string {
  const base = `${country.capital} é a capital ${ofCountry(country)} (${continentName(country.continent)}).`;
  return country.note ? `${base} ${country.note}` : base;
}

function currencyExplanation(country: Country, currency: string): string {
  const base = `A moeda oficial ${ofCountry(country)} é: ${currency}.`;
  const extra = country.otherLegalTender;
  return extra ? `${base} Também tem curso legal: ${extra.join(", ")}.` : base;
}

function countriesFor(filter: QuestionFilter): readonly Country[] {
  return filter.continent ? COUNTRIES.filter((c) => c.continent === filter.continent) : COUNTRIES;
}

function capitalTemplates(filter: QuestionFilter): QuestionTemplate[] {
  const scope = filter.capitalScope ?? "todos";
  const out: QuestionTemplate[] = [];

  if (scope !== "estados") {
    for (const country of countriesFor(filter)) {
      out.push({
        id: `capital:${country.code}`,
        build: (rng) =>
          assemble(
            rng,
            {
              id: `capital:${country.code}`,
              category: "capitais",
              prompt: `Qual é a capital ${ofCountry(country)}?`,
              flagCode: country.code,
              explanation: capitalExplanation(country),
              capitalOf: country.code,
            },
            country.capital,
            pickDistractors(rng, country.capital, sameContinent(country).map((c) => c.capital), ALL_CAPITALS),
          ),
      });

      // Pergunta reversa só quando o enunciado não entrega a resposta (ex.: "Luxemburgo é capital de...").
      if (country.capital !== country.name) {
        out.push({
          id: `capital-rev:${country.code}`,
          build: (rng) =>
            assemble(
              rng,
              {
                id: `capital-rev:${country.code}`,
                category: "capitais",
                prompt: `${country.capital} é a capital de qual país?`,
                explanation: capitalExplanation(country),
                capitalOf: country.code,
              },
              country.name,
              pickDistractors(rng, country.name, sameContinent(country).map((c) => c.name), ALL_NAMES),
            ),
        });
      }
    }
  }

  // Estados entram quando o filtro não exclui o Brasil.
  const includeStates = scope !== "paises" && (!filter.continent || filter.continent === "america-sul");
  if (includeStates) {
    const allStateCapitals = BRAZIL_STATES.map((s) => s.capital);
    for (const state of BRAZIL_STATES) {
      if (state.capital === state.name) continue; // "capital de São Paulo?" seria trivial.
      const sameRegion = BRAZIL_STATES.filter((s) => s.region === state.region && s.uf !== state.uf);
      out.push({
        id: `estado:${state.uf}`,
        build: (rng) =>
          assemble(
            rng,
            {
              id: `estado:${state.uf}`,
              category: "capitais",
              prompt: `Qual é a capital do estado de ${state.name} (${state.uf})?`,
              explanation: `${state.capital} é a capital de ${state.name}, na região ${state.region}.`,
            },
            state.capital,
            pickDistractors(rng, state.capital, sameRegion.map((s) => s.capital), allStateCapitals),
          ),
      });
    }
  }
  return out;
}

function flagTemplates(filter: QuestionFilter): QuestionTemplate[] {
  return countriesFor(filter).map((country) => ({
    id: `flag:${country.code}`,
    build: (rng) =>
      assemble(
        rng,
        {
          id: `flag:${country.code}`,
          category: "bandeiras",
          prompt: "De qual país é esta bandeira?",
          flagCode: country.code,
          explanation: `Esta é a bandeira ${ofCountry(country)}, cuja capital é ${country.capital}.`,
        },
        country.name,
        pickDistractors(rng, country.name, sameContinent(country).map((c) => c.name), ALL_NAMES),
      ),
  }));
}

function continentTemplates(): QuestionTemplate[] {
  const names = CONTINENTS.map((c) => c.name);
  return COUNTRIES.filter((c) => !c.transcontinental).map((country) => {
    const answer = continentName(country.continent);
    return {
      id: `continent:${country.code}`,
      build: (rng) =>
        assemble(
          rng,
          {
            id: `continent:${country.code}`,
            category: "continentes",
            prompt: `Em qual continente fica ${theCountry(country)}?`,
            flagCode: country.code,
            explanation: `${theCountry(country, true)} fica na ${answer}. Capital: ${country.capital}.`,
          },
          answer,
          pickDistractors(rng, answer, names, []),
        ),
    };
  });
}

function currencyTemplates(filter: QuestionFilter): QuestionTemplate[] {
  return countriesFor(filter).flatMap((country) => {
    const currency = country.currency;
    if (!currency) return [];
    const preferred = sameContinent(country).flatMap((c) => (c.currency ? [c.currency] : []));
    return [
      {
        id: `currency:${country.code}`,
        build: (rng: Rng) =>
          assemble(
            rng,
            {
              id: `currency:${country.code}`,
              category: "moedas",
              prompt: `Qual é a moeda oficial ${ofCountry(country)}?`,
              flagCode: country.code,
              explanation: currencyExplanation(country, currency),
            },
            currency,
            pickDistractors(rng, currency, preferred, ALL_CURRENCIES, new Set(country.otherLegalTender)),
          ),
      },
    ];
  });
}

function languageTemplates(filter: QuestionFilter): QuestionTemplate[] {
  return countriesFor(filter).flatMap((country) => {
    const languages = country.languages;
    if (!languages || languages.length === 0) return [];
    // Qualquer idioma oficial do país é resposta válida: todos entram em `forbidden`.
    const forbidden = new Set([...languages, ...(country.regionalLanguages ?? [])]);
    const preferred = sameContinent(country).flatMap((c) => c.languages ?? []);
    const list = languages.join(", ");
    return [
      {
        id: `lang:${country.code}`,
        build: (rng: Rng) => {
          const answer = pick(rng, languages);
          return assemble(
            rng,
            {
              id: `lang:${country.code}`,
              category: "idiomas",
              prompt:
                languages.length > 1
                  ? `Qual destes é um idioma oficial ${ofCountry(country)}?`
                  : `Qual é o idioma oficial ${ofCountry(country)}?`,
              flagCode: country.code,
              explanation:
                languages.length > 1
                  ? `${theCountry(country, true)} tem ${languages.length} idiomas oficiais: ${list}.`
                  : `O idioma oficial ${ofCountry(country)} é o ${answer}.`,
            },
            answer,
            pickDistractors(rng, answer, preferred, ALL_LANGUAGES, forbidden),
          );
        },
      },
    ];
  });
}

function natureTemplates(): QuestionTemplate[] {
  return NATURE_FACTS.map((fact) => ({
    id: `fact:${fact.id}`,
    build: (rng) =>
      assemble(
        rng,
        { id: `fact:${fact.id}`, category: "natureza", prompt: fact.prompt, explanation: fact.explanation },
        fact.answer,
        fact.wrong,
      ),
  }));
}

export function templatesFor(category: CategoryId, filter: QuestionFilter = {}): QuestionTemplate[] {
  switch (category) {
    case "capitais":
      return capitalTemplates(filter);
    case "bandeiras":
      return flagTemplates(filter);
    case "continentes":
      return continentTemplates();
    case "moedas":
      return currencyTemplates(filter);
    case "idiomas":
      return languageTemplates(filter);
    case "natureza":
      return natureTemplates();
  }
}

/** Sorteia uma pergunta inédita na sessão; se o banco esgotou, permite repetição. */
export function drawQuestion(
  category: CategoryId,
  rng: Rng,
  seen: ReadonlySet<string> = new Set(),
  filter: QuestionFilter = {},
): Question {
  const all = templatesFor(category, filter);
  const fresh = all.filter((t) => !seen.has(t.id));
  return pick(rng, fresh.length > 0 ? fresh : all).build(rng);
}

/** Baralho sem repetição: embaralha os templates e constrói só os `count` primeiros. */
export function buildDeck(
  category: CategoryId,
  rng: Rng,
  count: number | "all",
  filter: QuestionFilter = {},
): Question[] {
  const templates = shuffle(rng, templatesFor(category, filter));
  const size = count === "all" ? templates.length : Math.min(count, templates.length);
  return templates.slice(0, size).map((t) => t.build(rng));
}
