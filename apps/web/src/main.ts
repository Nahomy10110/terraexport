import "bootstrap-icons/font/bootstrap-icons.css";
import "./estilos/index.css";
import { D } from "./nucleo/datos";
import { detenerReloj } from "./simulacion/estado";
import { pintarRecorrido, recorridoInicio } from "./vistas/presentacion/recorrido";
import { codigoPartida, crearPartida, panelDocente } from "./vistas/docente/partida";
import { devs } from "./vistas/publico/devs";
import { entrar } from "./vistas/publico/entrar";
import { conformarEquipos } from "./vistas/docente/equipos";
import { choqueCultural } from "./vistas/estudiante/choque";
import { decision, ingresoEstudiante, resultados, salaEspera } from "./vistas/estudiante/ronda";
import { fichaPais } from "./vistas/mercados/pais";
import { fichaProducto } from "./vistas/mercados/producto";
import { verRanking } from "./vistas/compartido/ranking";
import { reporte } from "./vistas/docente/reporte";
import { inicio } from "./vistas/publico/inicio";
import { verificacion } from "./vistas/compartido/verificacion";

type Vista = (app: HTMLElement, partes: string[]) => void;

const rutas: Record<string, Vista> = {
  "": inicio,
  entrar,
  devs,
  demo: recorridoInicio,
  "docente/crear": crearPartida,
  "docente/codigo": codigoPartida,
  "docente/equipos": conformarEquipos,
  "docente/panel": panelDocente,
  "docente/reporte": reporte,
  estudiante: ingresoEstudiante,
  "estudiante/espera": salaEspera,
  "estudiante/decision": decision,
  "estudiante/choque": choqueCultural,
  "estudiante/resultados": resultados,
  pais: fichaPais,
  producto: fichaProducto,
  ranking: verRanking,
  verificacion,
};

// Rutas con un parámetro al final, por ejemplo #/pais/JPN o #/producto/P04.
// Para agregar una nueva, ponga aquí su primera parte y regístrela en `rutas` con esa misma clave.
const RUTAS_CON_PARAMETRO = new Set(["pais", "producto"]);

const app = document.getElementById("app");
if (!app) throw new Error("Falta el contenedor #app");

function render(): void {
  const hash = location.hash.replace(/^#\/?/, "");
  const partes = hash.split("/");
  const clave = RUTAS_CON_PARAMETRO.has(partes[0] ?? "") ? (partes[0] ?? "") : hash;
  const vista: Vista =
    rutas[clave] ??
    ((a) => {
      a.innerHTML =
        '<div class="panel"><h1>Esta pantalla no existe</h1><p>Vuelva al <a href="#/">inicio</a> para elegir cómo entrar.</p></div>';
    });
  detenerReloj();
  app!.className = "";
  vista(app!, partes);
  marcarMenu(hash);
  pintarRecorrido();
  app!.focus();
  window.scrollTo(0, 0);
}

function avisoDatos(): void {
  // Solo se avisa si queda algún dato sin valor confirmado en la hoja ("Por verificar").
  const registros = [...D.paises, ...D.productos, ...D.rutas, ...D.aranceles];
  const pendientes = registros.filter((x) => x.estado.includes("Por verificar")).length;
  const aviso = document.getElementById("aviso-datos");
  if (aviso && pendientes) {
    aviso.hidden = false;
    aviso.textContent = `Datos en revisión: ${pendientes} registros de la muestra siguen como «Por verificar» en la hoja de cálculo.`;
  }
  const pie = document.getElementById("pie-generado");
  if (pie) pie.textContent = ` ${D.generado}.`;
}

/** Marca en la barra superior el enlace de la sección actual. */
function marcarMenu(hash: string): void {
  document.querySelectorAll<HTMLAnchorElement>(".barra-nav a").forEach((a) => {
    const destino = a.getAttribute("href")?.replace(/^#\/?/, "") ?? "";
    const seccion = destino.split("/")[0] ?? "";
    const activo = destino === "" ? hash === "" : hash.split("/")[0] === seccion;
    if (activo) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

// Todos los botones "Volver" (data-volver): regresan a la pantalla anterior o al inicio.
document.addEventListener("click", (e) => {
  const boton = (e.target as HTMLElement).closest("[data-volver]");
  if (!boton) return;
  if (history.length > 1) history.back();
  else location.hash = "#/";
});

window.addEventListener("hashchange", render);
avisoDatos();
render();
