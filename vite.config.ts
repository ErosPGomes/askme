import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// base "./" gera assets com caminho relativo: o build funciona em qualquer subdiretório
// (GitHub Pages, S3, file server) sem reconfiguração.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    // Duas páginas no mesmo build: o quiz (raiz) e o jogo de combate aéreo em /jet/.
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        jet: resolve(import.meta.dirname, "jet/index.html"),
      },
    },
    // Bandeiras SVG nunca viram data-URI: ficam como arquivos separados, baixados sob demanda.
    // Inline embutiria ~270 bandeiras no bundle JS mesmo que o jogador veja só algumas.
    // three.js sozinho tem ~600 kB minificado e é todo necessário no boot: dividir não reduz o tempo até jogar.
    chunkSizeWarningLimit: 800,
    assetsInlineLimit: (file) => (file.includes("flag-icons") ? false : undefined),
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
