export type CategoryId =
  | "capitais"
  | "bandeiras"
  | "continentes"
  | "moedas"
  | "idiomas"
  | "natureza";

export type ContinentId =
  | "africa"
  | "america-norte"
  | "america-central"
  | "america-sul"
  | "asia"
  | "europa"
  | "oceania";

export interface Country {
  /** ISO 3166-1 alfa-2, minúsculo. Também é a chave do arquivo de bandeira. */
  code: string;
  name: string;
  capital: string;
  continent: ContinentId;
  /**
   * Países transcontinentais (Rússia, Turquia, Cazaquistão...) ficam fora das perguntas
   * de continente para não existir gabarito discutível. `continent` ainda serve para estudo/filtros.
   */
  transcontinental?: true;
  /** Omitido quando a moeda está em transição ou é ambígua — o país sai das perguntas de moeda. */
  currency?: string;
  /** Moedas de curso legal adicionais: nunca entram como distrator (seriam respostas válidas). */
  otherLegalTender?: readonly string[];
  /** Idiomas oficiais. Omitido quando não há idioma oficial de jure. */
  languages?: readonly string[];
  /**
   * Idiomas cooficiais regionais ou com uso oficial reconhecido. Não são sorteados como resposta,
   * mas também nunca aparecem como distrator — evita gabarito errado do tipo "Catalão não é oficial na Espanha".
   */
  regionalLanguages?: readonly string[];
  /** Observação exibida no estudo e no feedback (ex.: sede de governo em outra cidade). */
  note?: string;
}

export type BrazilRegion = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";

export interface BrazilState {
  uf: string;
  name: string;
  capital: string;
  region: BrazilRegion;
}

export interface Question {
  /** Identificador estável: evita repetir a mesma pergunta numa sessão. */
  id: string;
  category: CategoryId;
  prompt: string;
  options: readonly string[];
  answerIndex: number;
  /** Código da bandeira exibida no enunciado (categoria Bandeiras). */
  flagCode?: string;
  explanation?: string;
  /** Código do país usado para registrar domínio de capitais no progresso. */
  capitalOf?: string;
}
