import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COUNTRIES } from "../data/countries";
import { NATURE_FACTS } from "../data/facts";
import { BRAZIL_STATES } from "../data/states";
import { CATEGORIES } from "./categories";
import { ARTICLES, ofCountry, theCountry } from "./grammar";
import { buildDeck, drawQuestion, templatesFor } from "./questions";
import { seeded } from "./rng";

const SEEDS = [1, 7, 42, 1337, 2026];

describe("integridade da base", () => {
  it("códigos, nomes e capitais de países são únicos", () => {
    const unique = (xs: string[]) => new Set(xs).size === xs.length;
    expect(unique(COUNTRIES.map((c) => c.code))).toBe(true);
    expect(unique(COUNTRIES.map((c) => c.name))).toBe(true);
    expect(unique(COUNTRIES.map((c) => c.capital))).toBe(true);
    expect(unique(BRAZIL_STATES.map((s) => s.uf))).toBe(true);
    expect(BRAZIL_STATES).toHaveLength(26);
  });

  it("todo país tem arquivo de bandeira", () => {
    const missing = COUNTRIES.filter(
      (c) => !existsSync(new URL(`../../node_modules/flag-icons/flags/4x3/${c.code}.svg`, import.meta.url)),
    );
    expect(missing.map((c) => c.code)).toEqual([]);
  });

  it("tabela de artigos só referencia países existentes", () => {
    const codes = new Set(COUNTRIES.map((c) => c.code));
    expect(Object.keys(ARTICLES).filter((code) => !codes.has(code))).toEqual([]);
  });

  it("idiomas regionais nunca coincidem com os oficiais (evita dado contraditório)", () => {
    for (const c of COUNTRIES) {
      for (const lang of c.regionalLanguages ?? []) expect(c.languages ?? []).not.toContain(lang);
    }
  });

  it("fatos curados têm 3 distratores distintos da resposta", () => {
    for (const fact of NATURE_FACTS) {
      expect(new Set([fact.answer, ...fact.wrong]).size).toBe(4);
    }
  });
});

describe("gramática", () => {
  it("contrai preposição com artigo", () => {
    const by = (code: string) => COUNTRIES.find((c) => c.code === code)!;
    expect(ofCountry(by("br"))).toBe("do Brasil");
    expect(ofCountry(by("fr"))).toBe("da França");
    expect(ofCountry(by("pt"))).toBe("de Portugal");
    expect(ofCountry(by("us"))).toBe("dos Estados Unidos");
    expect(ofCountry(by("ph"))).toBe("das Filipinas");
    expect(theCountry(by("be"), true)).toBe("A Bélgica");
  });
});

describe("geração de perguntas", () => {
  for (const { id: category } of CATEGORIES) {
    it(`${category}: toda pergunta tem 4 alternativas únicas e gabarito consistente`, () => {
      const templates = templatesFor(category);
      expect(templates.length).toBeGreaterThan(20);
      expect(new Set(templates.map((t) => t.id)).size).toBe(templates.length);

      for (const seed of SEEDS) {
        const rng = seeded(seed);
        for (const template of templates) {
          const q = template.build(rng);
          expect(q.id).toBe(template.id);
          expect(q.category).toBe(category);
          expect(q.options).toHaveLength(4);
          expect(new Set(q.options).size).toBe(4);
          expect(q.answerIndex).toBeGreaterThanOrEqual(0);
          expect(q.answerIndex).toBeLessThan(4);
          expect(q.prompt).not.toMatch(/ de (o|a|os|as) /);
        }
      }
    });
  }

  it("idiomas: nenhum distrator é idioma oficial ou regional do país", () => {
    const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));
    for (const seed of SEEDS) {
      const rng = seeded(seed);
      for (const t of templatesFor("idiomas")) {
        const q = t.build(rng);
        const country = byCode.get(t.id.split(":")[1]!)!;
        const valid = new Set([...(country.languages ?? []), ...(country.regionalLanguages ?? [])]);
        q.options.forEach((opt, i) => {
          if (i !== q.answerIndex) expect(valid.has(opt), `${country.name}: ${opt}`).toBe(false);
        });
      }
    }
  });

  it("moedas: nenhum distrator tem curso legal no país", () => {
    const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));
    for (const seed of SEEDS) {
      const rng = seeded(seed);
      for (const t of templatesFor("moedas")) {
        const q = t.build(rng);
        const country = byCode.get(t.id.split(":")[1]!)!;
        const valid = new Set([country.currency, ...(country.otherLegalTender ?? [])]);
        q.options.forEach((opt, i) => {
          if (i !== q.answerIndex) expect(valid.has(opt), `${country.name}: ${opt}`).toBe(false);
        });
      }
    }
  });

  it("continentes: exclui países transcontinentais", () => {
    const ids = new Set(templatesFor("continentes").map((t) => t.id));
    expect(ids.has("continent:ru")).toBe(false);
    expect(ids.has("continent:tr")).toBe(false);
    expect(ids.has("continent:br")).toBe(true);
  });

  it("capitais: filtros de escopo e continente", () => {
    const states = templatesFor("capitais", { capitalScope: "estados" });
    expect(states.every((t) => t.id.startsWith("estado:"))).toBe(true);
    expect(states.some((t) => t.id === "estado:SP")).toBe(false); // capital homônima = trivial

    const europe = templatesFor("capitais", { capitalScope: "paises", continent: "europa" });
    expect(europe.some((t) => t.id === "capital:fr")).toBe(true);
    expect(europe.some((t) => t.id === "capital:br")).toBe(false);
    expect(europe.some((t) => t.id === "capital-rev:lu")).toBe(false); // Luxemburgo/Luxemburgo
  });

  it("buildDeck não repete perguntas e respeita o tamanho", () => {
    const deck = buildDeck("capitais", seeded(3), "all", { continent: "oceania", capitalScope: "paises" });
    expect(new Set(deck.map((q) => q.id)).size).toBe(deck.length);
    expect(buildDeck("natureza", seeded(3), 10)).toHaveLength(10);
  });

  it("drawQuestion evita perguntas já vistas enquanto houver inéditas", () => {
    const all = templatesFor("natureza").map((t) => t.id);
    const seen = new Set(all.slice(1));
    expect(drawQuestion("natureza", seeded(9), seen).id).toBe(all[0]);
  });
});
