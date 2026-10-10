import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import { App } from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root ausente em index.html");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
