import type { Country } from "./types";

type Article = "o" | "a" | "os" | "as" | "";

/**
 * Artigo definido usado com o nome do país em pt-BR ("do Brasil", "da França", "de Portugal").
 * Mantido fora da base de dados para não poluir cada registro; o padrão é sem artigo.
 */
export const ARTICLES: Readonly<Record<string, Article>> = Object.fromEntries(
  (
    [
      ["o", "br cl uy py pe ec sr ca mx pa ht gb va jp np bt lk af ir iq ye lb az kz uz tm kg tj vn kh la pk bh kw qa eg ma sd ss ke bi ga td ne ml sn tg bj zw mw ls dj"],
      ["a", "ar bo co ve gy gt ni cr jm do es fr de it ie be ch at pl cz sk hu ro bg gr hr si rs ba mk al se no dk fi is ee lv lt ua md ru cn kr kp mn in sa jo sy tr ge am th my id ly tn dz mr et er so tz cd cg cf ng ci gm gn gw sl lr za na zm au nz pg fm"],
      ["os", "us ae nl"],
      ["as", "bs ph mv sb mh sc km"],
    ] as const
  ).flatMap(([article, codes]) => codes.split(" ").map((code) => [code, article] as const)),
);

const CONTRACTION: Readonly<Record<Article, string>> = { o: "do", a: "da", os: "dos", as: "das", "": "de" };

function articleOf(country: Country): Article {
  return ARTICLES[country.code] ?? "";
}

/** "do Brasil", "da Bélgica", "de Portugal". */
export function ofCountry(country: Country): string {
  return `${CONTRACTION[articleOf(country)]} ${country.name}`;
}

/** "o Brasil", "a Bélgica", "Portugal"; `capitalize` para início de frase. */
export function theCountry(country: Country, capitalize = false): string {
  const article = articleOf(country);
  if (!article) return country.name;
  const head = capitalize ? article.toUpperCase().slice(0, 1) + article.slice(1) : article;
  return `${head} ${country.name}`;
}
