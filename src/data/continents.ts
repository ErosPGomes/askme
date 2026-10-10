import type { ContinentId } from "../game/types";

export const CONTINENTS: readonly { id: ContinentId; name: string }[] = [
  { id: "america-sul", name: "América do Sul" },
  { id: "america-central", name: "América Central e Caribe" },
  { id: "america-norte", name: "América do Norte" },
  { id: "europa", name: "Europa" },
  { id: "africa", name: "África" },
  { id: "asia", name: "Ásia" },
  { id: "oceania", name: "Oceania" },
];

const NAME_BY_ID = new Map(CONTINENTS.map((c) => [c.id, c.name]));

export function continentName(id: ContinentId): string {
  return NAME_BY_ID.get(id) ?? id;
}
