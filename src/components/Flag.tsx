/**
 * Bandeiras SVG do pacote flag-icons (MIT), servidas como arquivos estáticos com hash.
 * Por que não emoji: Windows não renderiza emoji de bandeira (mostra "BR" em letras).
 * Por que não CDN: funciona offline e não depende de terceiro em tempo de execução.
 * O glob eager só gera um mapa código→URL (~270 strings); cada SVG é baixado sob demanda pelo <img>.
 */
const FLAG_URLS = import.meta.glob<string>("/node_modules/flag-icons/flags/4x3/??.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const BY_CODE = new Map(
  Object.entries(FLAG_URLS).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1, -4), url]),
);

interface FlagProps {
  code: string;
  /** Texto alternativo. Vazio quando a bandeira é o próprio enigma (não pode vazar a resposta). */
  alt: string;
  size?: "sm" | "md" | "lg";
}

export function Flag({ code, alt, size = "md" }: FlagProps) {
  const src = BY_CODE.get(code);
  if (!src) return null;
  return <img className={`flag flag--${size}`} src={src} alt={alt} loading="lazy" decoding="async" draggable={false} />;
}
