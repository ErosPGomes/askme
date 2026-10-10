import type { CategoryId } from "./types";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  /** Cor principal (fundo de botões, fatias da roleta). */
  color: string;
  /** Tom escuro da mesma matiz: sombra "3D" dos botões e texto sobre fundo claro (contraste AA). */
  shade: string;
  /** Tom bem claro: fundos de cartão e chips. */
  tint: string;
  /** Cor do texto sobre `color`. Escuro no amarelo: branco sobre #F5BD0F tem contraste ~1,7:1. */
  ink: string;
  blurb: string;
}

export const CATEGORIES: readonly CategoryMeta[] = [
  { id: "capitais", label: "Capitais", color: "#2F7DF6", shade: "#1A56B8", tint: "#E6F0FF", ink: "#FFFFFF", blurb: "Países e estados do Brasil" },
  { id: "bandeiras", label: "Bandeiras", color: "#F2464B", shade: "#B42328", tint: "#FFE9EA", ink: "#FFFFFF", blurb: "Reconheça a bandeira" },
  { id: "continentes", label: "Continentes", color: "#FF8A1F", shade: "#B85A00", tint: "#FFF0E1", ink: "#FFFFFF", blurb: "Onde fica cada país" },
  { id: "moedas", label: "Moedas", color: "#F5BD0F", shade: "#9A6F00", tint: "#FFF7D6", ink: "#3D2B00", blurb: "Dinheiro pelo mundo" },
  { id: "idiomas", label: "Idiomas", color: "#C04FD8", shade: "#80239A", tint: "#F8E8FC", ink: "#FFFFFF", blurb: "O que se fala onde" },
  { id: "natureza", label: "Natureza", color: "#1FB76A", shade: "#0E7A44", tint: "#E1F7EB", ink: "#FFFFFF", blurb: "Rios, montanhas e biomas" },
];

const META_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

export function categoryMeta(id: CategoryId): CategoryMeta {
  const meta = META_BY_ID.get(id);
  if (!meta) throw new Error(`Categoria desconhecida: ${id}`);
  return meta;
}

/** Coroa em azul-noite: distinta das 6 categorias (o roxo anterior se confundia com Idiomas). */
export const CROWN_COLOR = { color: "#27305A", shade: "#121735", tint: "#ECEEF7", ink: "#FFFFFF" } as const;
