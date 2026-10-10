import "bootstrap-icons/font/bootstrap-icons.css";
import "./estilos.css";
import { D } from "./datos";
import { detenerReloj } from "./estado";
import { pintarRecorrido, recorridoInicio } from "./recorrido";
import { codigoPartida, crearPartida, panelDocente } from "./vistas/docente";
import { devs } from "./vistas/devs";
import { entrar } from "./vistas/entrar";
import { conformarEquipos } from "./vistas/equipos";
import { choqueCultural } from "./vistas/choque";
import { decision, ingresoEstudiante, resultados, salaEspera } from "./vistas/estudiante";
import { fichaPais } from "./vistas/ficha";
import { fichaProducto } from "./vistas/producto";
import { verRanking } from "./vistas/ranking";
import { reporte } from "./vistas/reporte";
import { inicio } from "./vistas/inicio";
import { verificacion } from "./vistas/verificacion";

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
  pintarRecorrido();
  app!.focus();;
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

window.addEventListener("hashchange", render);
avisoDatos();
render();
