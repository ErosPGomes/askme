import { useSyncExternalStore } from "react";

export type Route = "home" | "jogar" | "treinar" | "estudar";
const ROUTES: readonly Route[] = ["home", "jogar", "treinar", "estudar"];

/**
 * Roteamento por hash: o botão "voltar" do navegador/celular funciona e o build estático
 * roda em qualquer host sem regra de rewrite — sem custo de uma lib de roteamento para 4 telas.
 */
function read(): Route {
  const value = window.location.hash.replace(/^#\/?/, "");
  return (ROUTES as readonly string[]).includes(value) ? (value as Route) : "home";
}

function subscribe(listener: () => void): () => void {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, read, () => "home");
}

export function navigate(route: Route): void {
  // "#jogar" sem barra: âncora simples é o único formato preservado por hosts embutidos (iframes sandbox).
  window.location.hash = route === "home" ? "" : route;
}
