import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// base "./" gera assets com caminho relativo: o build funciona em qualquer subdiretório
// (GitHub Pages, S3, file server) sem reconfiguração.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    // Bandeiras SVG nunca viram data-URI: ficam como arquivos separados, baixados sob demanda.
    // Inline embutiria ~270 bandeiras no bundle JS mesmo que o jogador veja só algumas.
    assetsInlineLimit: (file) => (file.includes("flag-icons") ? false : undefined),
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
