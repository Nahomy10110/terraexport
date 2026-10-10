import { defineConfig } from "vite";

// base relativa: el sitio funciona igual en GitHub Pages (/terraexport/) que en la raíz.
export default defineConfig({
  base: "./",
  server: { port: 5173, open: true },
  build: { outDir: "dist", sourcemap: true },
});
