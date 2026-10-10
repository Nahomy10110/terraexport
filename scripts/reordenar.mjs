// Reordena apps/web/src en carpetas y divide estilos.css por secciones.
// Uso (desde la raíz del repositorio): node scripts/reordenar.mjs
// Se ejecuta una sola vez y después se borra.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("apps/web/src");
if (!fs.existsSync(path.join(SRC, "main.ts"))) {
  console.error("Ejecute este script desde la carpeta raíz del repositorio.");
  process.exit(1);
}
if (fs.existsSync(path.join(SRC, "estilos"))) {
  console.error("La carpeta estilos/ ya existe: parece que el reordenamiento ya se hizo.");
  process.exit(1);
}

// ---------------------------------------------------------------- 1. Mapa de archivos
const MOVER = {
  "datos.ts": "nucleo/datos.ts",
  "dom.ts": "nucleo/dom.ts",
  "formato.ts": "nucleo/formato.ts",
  "estado.ts": "simulacion/estado.ts",
  "simulacion.ts": "simulacion/rondas.ts",
  "eventos.ts": "simulacion/eventos.ts",
  "choques.ts": "simulacion/choques.ts",
  "recorrido.ts": "vistas/presentacion/recorrido.ts",
  "vistas/inicio.ts": "vistas/publico/inicio.ts",
  "vistas/entrar.ts": "vistas/publico/entrar.ts",
  "vistas/devs.ts": "vistas/publico/devs.ts",
  "vistas/docente.ts": "vistas/docente/partida.ts",
  "vistas/equipos.ts": "vistas/docente/equipos.ts",
  "vistas/reporte.ts": "vistas/docente/reporte.ts",
  "vistas/estudiante.ts": "vistas/estudiante/ronda.ts",
  "vistas/choque.ts": "vistas/estudiante/choque.ts",
  "vistas/ficha.ts": "vistas/mercados/pais.ts",
  "vistas/producto.ts": "vistas/mercados/producto.ts",
  "vistas/ranking.ts": "vistas/compartido/ranking.ts",
  "vistas/verificacion.ts": "vistas/compartido/verificacion.ts",
  "estilos.css": "estilos/index.css",
};

const abs = (rel) => path.join(SRC, rel);
const destino = new Map(Object.entries(MOVER).map(([a, b]) => [abs(a), abs(b)]));
const faltan = Object.keys(MOVER).filter((f) => !fs.existsSync(abs(f)));
if (faltan.length) {
  console.error("No se encontraron estos archivos:", faltan.join(", "));
  process.exit(1);
}

function listar(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? listar(p) : p.endsWith(".ts") ? [p] : [];
  });
}
const archivos = listar(SRC).map((viejo) => ({ viejo, nuevo: destino.get(viejo) ?? viejo }));

// ---------------------------------------------------------------- 2. Reescribir imports
function resolverViejo(desde, spec) {
  const base = path.resolve(path.dirname(desde), spec);
  for (const c of [base, `${base}.ts`]) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return base;
}
function relativo(desdeArchivo, hacia) {
  let r = path.relative(path.dirname(desdeArchivo), hacia).split(path.sep).join("/");
  if (r.endsWith(".ts")) r = r.slice(0, -3);
  return r.startsWith(".") ? r : `./${r}`;
}
const contenidoNuevo = new Map();
for (const { viejo, nuevo } of archivos) {
  const texto = fs.readFileSync(viejo, "utf8");
  const reescrito = texto.replace(/((?:from|import)\s+")(\.{1,2}\/[^"]+)(")/g, (_, a, spec, z) => {
    const objetivoViejo = resolverViejo(viejo, spec);
    const objetivoNuevo = destino.get(objetivoViejo) ?? objetivoViejo;
    return `${a}${relativo(nuevo, objetivoNuevo)}${z}`;
  });
  contenidoNuevo.set(nuevo, reescrito);
}

// ---------------------------------------------------------------- 3. Mover (git mv conserva el historial)
const enGit = (() => {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();
function mover(de, a) {
  fs.mkdirSync(path.dirname(a), { recursive: true });
  if (enGit) {
    try {
      execSync(`git mv "${de}" "${a}"`, { stdio: "ignore" });
      return;
    } catch {
      /* archivo no versionado todavía: se mueve sin git */
    }
  }
  fs.renameSync(de, a);
}
for (const { viejo, nuevo } of archivos) if (viejo !== nuevo) mover(viejo, nuevo);
mover(abs("estilos.css"), abs("estilos/index.css"));
for (const [nuevo, texto] of contenidoNuevo) fs.writeFileSync(nuevo, texto);

// ---------------------------------------------------------------- 4. Dividir el CSS
const cssViejo = abs("estilos/index.css");
const css = fs.readFileSync(cssViejo, "utf8");

/** Separa reglas de primer nivel; quita los comentarios que están fuera de las reglas. */
function reglas(texto) {
  const out = [];
  let i = 0;
  let prelude = "";
  while (i < texto.length) {
    if (texto.startsWith("/*", i)) {
      const fin = texto.indexOf("*/", i + 2);
      i = fin < 0 ? texto.length : fin + 2;
      continue;
    }
    if (texto[i] === "{") {
      let prof = 1;
      let j = i + 1;
      while (j < texto.length && prof > 0) {
        if (texto.startsWith("/*", j)) {
          j = texto.indexOf("*/", j + 2) + 2;
          continue;
        }
        if (texto[j] === '"' || texto[j] === "'") {
          const q = texto[j];
          j++;
          while (j < texto.length && texto[j] !== q) j++;
        } else if (texto[j] === "{") prof++;
        else if (texto[j] === "}") prof--;
        j++;
      }
      out.push({ selector: prelude.trim(), cuerpo: texto.slice(i + 1, j - 1) });
      prelude = "";
      i = j;
      continue;
    }
    prelude += texto[i];
    i++;
  }
  return out;
}

const ARCHIVOS_CSS = [
  ["recorrido", /\.tour|con-tour/],
  ["ranking", /\.podio|\.puesto-|tu-equipo/],
  [
    "estudiante",
    /\.choque|\.opcion-choque|\.retro\b|fieldset:disabled|\.manifiesto|\.saldo|\.carga|\.leyenda|\.ventas-barra|\.explicacion/,
  ],
  ["mercados", /\.hof/],
  [
    "docente",
    /\.codigo|\.lista-equipos|\.reloj|\.estado-ronda|\.eventos|\.evento-opcion|\.aviso-evento|\.afecta-texto|\.alias-conectados|\.equipos-grid|\.equipo-caja|\.reporte/,
  ],
  [
    "inicio",
    /\.hero|\.barco|zarpar|\.seccion|\.que-es|\.lista-pasos|\.carrusel|\.slide|\.puntos|\.motivo|\.llamado|\.entrar|\.camino|aparecer|saludar|rebotar|girar|\.devs|\.dev\b|\.avatar|\.curso/,
  ],
  [
    "base",
    /^(:root|\*|html|body|h1|h2|h3|p|a|main|:focus)|\.bi\b|\.pie|\.barra|\.marca|\.aviso\b|\.btn|\.acciones|\.sr-only/,
  ],
];
const DESCRIPCION = {
  base: "Variables de la paleta, tipografía, barra superior, botones y utilidades generales.",
  componentes: "Piezas compartidas: paneles, formularios, chips, tablas, datos clave y notas de prototipo.",
  inicio: "Página principal, carrusel, tarjetas, Iniciar sesión (tres caminos) y Conoce a los devs.",
  mercados: "Ficha de país y de producto.",
  docente: "Crear partida, código, equipos (RF-04), panel con eventos (RF-13) y reporte (RF-15).",
  estudiante: "Decisión, resultados (RF-11) y choque cultural (RF-14).",
  ranking: "Ranking y podio (RF-12).",
  recorrido: "Recorrido guiado para la presentación (RF-16).",
};
const ORDEN = ["base", "componentes", "inicio", "mercados", "docente", "estudiante", "ranking", "recorrido"];
const clasificar = (sel) => ARCHIVOS_CSS.find(([, re]) => re.test(sel))?.[0] ?? "componentes";

const salida = Object.fromEntries(ORDEN.map((n) => [n, []]));
for (const r of reglas(css)) {
  if (r.selector.startsWith("@media")) {
    if (/print/.test(r.selector)) {
      salida.docente.push(`${r.selector} {${r.cuerpo}}`);
      continue;
    }
    if (/prefers-reduced-motion/.test(r.selector)) {
      salida.base.push(`${r.selector} {${r.cuerpo}}`);
      continue;
    }
    const porArchivo = {};
    for (const interna of reglas(r.cuerpo)) {
      const n = clasificar(interna.selector);
      (porArchivo[n] ??= []).push(`  ${interna.selector} {${interna.cuerpo}}`);
    }
    for (const [n, lista] of Object.entries(porArchivo))
      salida[n].push(`${r.selector} {\n${lista.join("\n")}\n}`);
    continue;
  }
  salida[clasificar(r.selector)].push(`${r.selector} {${r.cuerpo}}`);
}

for (const n of ORDEN) {
  fs.writeFileSync(
    abs(`estilos/${n}.css`),
    `/* ${n}.css: ${DESCRIPCION[n]} */\n\n${salida[n].join("\n\n")}\n`,
  );
}
fs.writeFileSync(
  cssViejo,
  `/* Estilos de TerraExport, divididos por sección. El orden importa: base primero. */\n` +
    ORDEN.map((n) => `@import "./${n}.css";`).join("\n") +
    "\n",
);
if (enGit) execSync(`git add "${path.join(SRC, "estilos")}"`, { stdio: "ignore" });

console.log("Listo. Ahora borre este script y ejecute: npm run format && npm run check");
for (const n of ORDEN) console.log(`  estilos/${n}.css: ${salida[n].length} reglas`);
