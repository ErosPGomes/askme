import { useEffect } from "react";
import { useHashRoute } from "./hooks/useHashRoute";
import { ClassicGame } from "./screens/ClassicGame";
import { Home } from "./screens/Home";
import { Practice } from "./screens/Practice";
import { Study } from "./screens/Study";

const TITLES = { home: "AskMe Geo", jogar: "Partida · AskMe Geo", treinar: "Treino · AskMe Geo", estudar: "Estudar · AskMe Geo" };

export function App() {
  const route = useHashRoute();

  useEffect(() => {
    document.title = TITLES[route];
    window.scrollTo(0, 0);
  }, [route]);

  // `key` força remount ao trocar de rota: cada tela começa com estado limpo.
  return (
    <main className="app" key={route}>
      {route === "home" && <Home />}
      {route === "jogar" && <ClassicGame />}
      {route === "treinar" && <Practice />}
      {route === "estudar" && <Study />}
    </main>
  );
}
