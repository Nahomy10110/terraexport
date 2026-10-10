// RF-16 recorrido guiado para la presentación final: una barra fija lleva paso a paso por
// las pantallas de la demo y prepara los datos de cada una (caso C04: café tostado a Japón).
import { D } from "../../nucleo/datos";
import { ir } from "../../nucleo/dom";
import {
  ALIAS_DEMO,
  EQUIPO_ESTUDIANTE,
  asegurarEquipo,
  estado,
  partidaActual,
  partidaDemo,
} from "../../simulacion/estado";
import { esc } from "../../nucleo/formato";
import { cerrarRonda } from "../../simulacion/rondas";

interface Paso {
  ruta: string;
  titulo: string;
  guion: string;
  preparar?: () => void;
}

const ALIAS_PRESENTADOR = "Sofi";

function partidaDelRecorrido(): void {
  const p = partidaDemo();
  p.equipos = [];
  p.capitales = {};
  estado.partida = p;
  estado.estudiante = null;
}

function equiposListos(): void {
  const p = partidaActual();
  for (const a of ALIAS_DEMO.slice(0, 9)) if (!(a in p.integrantes)) p.integrantes[a] = "";
  if (!p.equipos.length) {
    const nombres = ["Ceiba", EQUIPO_ESTUDIANTE, "Cenízaro"];
    Object.keys(p.integrantes).forEach((a, i) => (p.integrantes[a] = nombres[i % 3] ?? EQUIPO_ESTUDIANTE));
    p.integrantes[ALIAS_PRESENTADOR] = EQUIPO_ESTUDIANTE;
    p.equipos = nombres;
    p.capitales = Object.fromEntries(nombres.map((e) => [e, p.capital]));
  }
}

/** Deshace el cierre de la ronda actual para poder volver atrás en el recorrido. */
function reabrirRonda(): void {
  const p = partidaActual();
  const i = p.historial.findIndex((h) => h.ronda === p.ronda);
  if (i < 0) return;
  p.historial.splice(i, 1);
  const previa = p.historial.at(-1);
  for (const e of p.equipos)
    p.capitales[e] = previa?.resultados.find((r) => r.equipo === e)?.capitalFinal ?? p.capital;
}

function decisionC04(): void {
  equiposListos();
  const p = partidaActual();
  asegurarEquipo(p, EQUIPO_ESTUDIANTE);
  const caso = D.casos.find((c) => c.caso === "C04") ?? D.casos[0];
  estado.estudiante = {
    alias: ALIAS_PRESENTADOR,
    equipo: EQUIPO_ESTUDIANTE,
    decision: caso ? { ...caso.decision, capital: p.capitales[EQUIPO_ESTUDIANTE] ?? p.capital } : null,
    choqueRespondido: estado.estudiante?.choqueRespondido ?? null,
  };
}

const PASOS: Paso[] = [
  {
    ruta: "",
    titulo: "La página principal",
    guion:
      "TerraExport es un simulador de exportación para el aula. Esta demo usa datos reales y fórmulas verificadas.",
  },
  {
    ruta: "entrar",
    titulo: "Iniciar sesión",
    guion:
      "No hace falta crear cuenta: se elige entrar como docente, como estudiante o explorar los mercados.",
  },
  {
    ruta: "docente/crear",
    titulo: "La docente crea la partida",
    guion: "Define rondas, duración, capital inicial, países y productos.",
    preparar: () => (estado.asistente.paso = 1),
  },
  {
    ruta: "docente/codigo",
    titulo: "Código y estudiantes conectados",
    guion: "La clase entra con este código y un alias. No se piden datos personales.",
    preparar: partidaDelRecorrido,
  },
  {
    ruta: "docente/equipos",
    titulo: "Conformar equipos",
    guion: "Los alias se reparten solos o la docente los mueve con un selector.",
    preparar: () => {
      const p = partidaActual();
      for (const a of ALIAS_DEMO.slice(0, 9)) if (!(a in p.integrantes)) p.integrantes[a] = "";
    },
  },
  {
    ruta: "docente/panel",
    titulo: "Evento de mercado y reloj",
    guion: "Antes de iniciar, la docente elige un evento. Hoy: el yen se devalúa 4 %.",
    preparar: () => {
      equiposListos();
      reabrirRonda();
      const p = partidaActual();
      p.evento = "yen";
      p.rondaEstado = "espera";
      p.restante = p.duracion * 60;
    },
  },
  {
    ruta: "estudiante/decision",
    titulo: "La decisión del equipo",
    guion: "Café tostado a Japón por avión: el arancel es de 12 % y el evento del yen afecta esta decisión.",
    preparar: () => {
      decisionC04();
      reabrirRonda();
      partidaActual().evento = "yen";
      partidaActual().rondaEstado = "activa";
    },
  },
  {
    ruta: "estudiante/choque",
    titulo: "Choque cultural",
    guion: "Japón tiene alta aversión a la incertidumbre: el comprador quiere todo por escrito.",
    preparar: () => {
      decisionC04();
      reabrirRonda();
      partidaActual().evento = "yen";
      if (estado.estudiante) estado.estudiante.choqueRespondido = null;
    },
  },
  {
    ruta: "estudiante/resultados",
    titulo: "Resultado y explicación",
    guion: "Costo puesto en destino, ventas y una explicación de por qué se ganó o se perdió.",
    preparar: () => {
      decisionC04();
      if (estado.estudiante && estado.estudiante.choqueRespondido === null)
        estado.estudiante.choqueRespondido = 0;
      partidaActual().evento = "yen";
      cerrarRonda(partidaActual());
    },
  },
  {
    ruta: "ranking",
    titulo: "Ranking",
    guion: "El capital de cada equipo pasa a la siguiente ronda. Gana quien más capital acumule.",
  },
  {
    ruta: "docente/reporte",
    titulo: "Reporte para la docente",
    guion: "Historial de rondas y resultados por equipo, listo para imprimir.",
  },
  {
    ruta: "verificacion",
    titulo: "Los números cuadran",
    guion: "Los 10 casos de la hoja de cálculo dan exactamente lo mismo en la demo.",
  },
];

let actual: number | null = null;

export function iniciarRecorrido(): void {
  irAPaso(0);
}

function irAPaso(i: number): void {
  const paso = PASOS[i];
  if (!paso) return;
  actual = i;
  paso.preparar?.();
  const destino = `#/${paso.ruta}`;
  if (location.hash === destino || (destino === "#/" && !location.hash)) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    ir(paso.ruta);
  }
}

/** Dibuja o quita la barra del recorrido. Se llama después de cada cambio de pantalla. */
export function pintarRecorrido(): void {
  let barra = document.getElementById("tour");
  const paso = actual === null ? undefined : PASOS[actual];
  document.body.classList.toggle("con-tour", Boolean(paso));
  if (!paso || actual === null) {
    barra?.remove();
    return;
  }
  if (!barra) {
    barra = document.createElement("aside");
    barra.id = "tour";
    barra.className = "tour";
    barra.setAttribute("aria-label", "Recorrido guiado");
    document.body.append(barra);
  }
  const n = actual;
  barra.innerHTML = `
    <div class="tour-texto">
      <p class="tour-paso">Paso ${n + 1} de ${PASOS.length}</p>
      <strong>${esc(paso.titulo)}</strong>
      <p class="tour-guion">${esc(paso.guion)}</p>
    </div>
    <div class="tour-botones">
      <button class="btn claro chico" id="tour-anterior"${n === 0 ? " disabled" : ""}><i class="bi bi-chevron-left" aria-hidden="true"></i>Anterior</button>
      ${
        n < PASOS.length - 1
          ? '<button class="btn chico" id="tour-siguiente">Siguiente<i class="bi bi-chevron-right" aria-hidden="true"></i></button>'
          : '<button class="btn chico" id="tour-fin">Terminar</button>'
      }
      <button class="btn claro chico" id="tour-salir" aria-label="Salir del recorrido"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
    </div>`;
  barra.querySelector("#tour-anterior")?.addEventListener("click", () => irAPaso(n - 1));
  barra.querySelector("#tour-siguiente")?.addEventListener("click", () => irAPaso(n + 1));
  const salir = (): void => {
    actual = null;
    pintarRecorrido();
  };
  barra.querySelector("#tour-salir")?.addEventListener("click", salir);
  barra.querySelector("#tour-fin")?.addEventListener("click", () => {
    salir();
    ir("");
  });
}

/** Pantalla #/demo: explica el recorrido antes de empezar. */
export function recorridoInicio(app: HTMLElement): void {
  app.innerHTML = `
    <h1>Recorrido guiado</h1>
    <p class="lead">Para presentar TerraExport de principio a fin. Una barra abajo te lleva por cada pantalla con una frase de guion
      y deja los datos listos (caso C04: café tostado a Japón por avión).</p>
    <ol class="tour-lista">${PASOS.map((p) => `<li><strong>${esc(p.titulo)}</strong><span>${esc(p.guion)}</span></li>`).join("")}</ol>
    <div class="acciones">
      <button class="btn" id="empezar"><i class="bi bi-play-fill" aria-hidden="true"></i>Empezar recorrido</button>
      <a class="btn claro" href="#/entrar">Volver</a>
    </div>`;
  document.getElementById("empezar")?.addEventListener("click", iniciarRecorrido);
}
