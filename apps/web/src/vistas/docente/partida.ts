// RF-03 crear partida, código de acceso (alias conectados) y RF-05 panel de la ronda.
import { D, pais, producto } from "../../nucleo/datos";
import { $, campo, ir, marcados } from "../../nucleo/dom";
import {
  ALIAS_DEMO,
  EQUIPOS,
  estado,
  nuevaPartida,
  partidaActual,
  type Partida,
} from "../../simulacion/estado";
import { EVENTOS, avisoEvento } from "../../simulacion/eventos";
import { cerrarRonda, siguienteRonda } from "../../simulacion/rondas";
import { bandera } from "../../nucleo/banderas";
import { esc, mmss, usd } from "../../nucleo/formato";

export function crearPartida(app: HTMLElement): void {
  const a = estado.asistente;
  const titulos = ["Configuración", "Países", "Productos"];
  let cuerpo: string;
  if (a.paso === 1) {
    cuerpo = `<div class="fila">
      ${campoNum("rondas", "Número de rondas", a.rondas, 1, 10, "Entre 1 y 10.")}
      ${campoNum("duracion", "Duración de cada ronda (min)", a.duracion, 3, 30, "Entre 3 y 30 minutos.")}
      ${campoNum("capital", "Capital inicial por equipo (USD)", a.capital, 1000, 1000000, "Mismo monto para todos los equipos.")}
    </div>`;
  } else if (a.paso === 2) {
    cuerpo = grupoChips(
      "pais",
      "Mercados disponibles en la partida",
      D.paises.map((p) => [p.iso, p.nombre]),
      a.paises,
      (iso) => bandera(iso),
    );
  } else {
    cuerpo = grupoChips(
      "prod",
      "Productos que podrán exportar",
      D.productos.map((p) => [p.id, p.nombre]),
      a.productos,
    );
  }

  app.innerHTML = `
    <h1>Crear partida</h1>
    <ol class="pasos">${titulos
      .map((t, i) => `<li${a.paso === i + 1 ? ' aria-current="step"' : ""}>${i + 1}. ${t}</li>`)
      .join("")}</ol>
    <form class="panel" id="f" novalidate>${cuerpo}
      <p class="error" id="err" role="alert"></p>
      <div class="acciones">
        ${a.paso > 1 ? '<button type="button" class="btn claro" id="atras">Atrás</button>' : ""}
        <button class="btn" type="submit">${a.paso < 3 ? "Continuar" : "Crear partida"}</button>
      </div>
    </form>`;

  const f = $<HTMLFormElement>("f");
  const guardarPaso = (): string => {
    if (a.paso === 1) {
      a.rondas = Number(campo(f, "rondas").value);
      a.duracion = Number(campo(f, "duracion").value);
      a.capital = Number(campo(f, "capital").value);
      if (!(a.rondas >= 1 && a.rondas <= 10)) return "El número de rondas debe estar entre 1 y 10.";
      if (!(a.duracion >= 3 && a.duracion <= 30)) return "La duración debe estar entre 3 y 30 minutos.";
      if (!(a.capital >= 1000)) return "El capital inicial debe ser de al menos USD 1 000.";
    } else if (a.paso === 2) {
      a.paises = marcados(f, "pais");
      if (a.paises.length < 2) return "Elija al menos 2 países.";
    } else {
      a.productos = marcados(f, "prod");
      if (a.productos.length < 2) return "Elija al menos 2 productos.";
    }
    return "";
  };

  document.getElementById("atras")?.addEventListener("click", () => {
    guardarPaso();
    a.paso--;
    crearPartida(app);
  });
  f.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const err = guardarPaso();
    if (err) {
      $("err").textContent = err;
      return;
    }
    if (a.paso < 3) {
      a.paso++;
      crearPartida(app);
      return;
    }
    estado.partida = nuevaPartida({
      codigo: `TRX${1000 + Math.floor(Math.random() * 9000)}`,
      rondas: a.rondas,
      duracion: a.duracion,
      capital: a.capital,
      paises: [...a.paises],
      productos: [...a.productos],
      equipos: [],
    });
    a.paso = 1;
    ir("docente/codigo");
  });
}

function campoNum(n: string, l: string, v: number, min: number, max: number, ayuda: string): string {
  return `<div class="campo"><label for="${n}">${l}</label>
    <input type="number" id="${n}" name="${n}" value="${v}" min="${min}" max="${max}" required>
    <span class="ayuda">${ayuda}</span></div>`;
}

function grupoChips(
  grupo: string,
  leyenda: string,
  opciones: [string, string][],
  elegidos: string[],
  icono: (valor: string) => string = () => "",
): string {
  return `<fieldset class="campo"><legend>${leyenda}</legend><p class="ayuda">Elija al menos 2.</p><div class="chips">
    ${opciones
      .map(
        ([v, t]) =>
          `<label class="chip"><input type="checkbox" name="${grupo}" value="${v}"${elegidos.includes(v) ? " checked" : ""}><span>${icono(v)}${esc(t)}</span></label>`,
      )
      .join("")}</div></fieldset>`;
}

export function codigoPartida(app: HTMLElement): void {
  const p = partidaActual();
  app.innerHTML = `
    <div class="dos-col">
      <div class="codigo"><p>Código de la partida</p>
        <div class="valor" aria-live="polite">${p.codigo.slice(0, 3)} ${p.codigo.slice(3)}</div>
        <p>Los estudiantes entran en <strong>${esc(location.host || "terraexport")}</strong> con este código y un alias.</p>
      </div>
      <div class="panel"><h2>Estudiantes conectados <span id="cuenta"></span></h2>
        <ul class="alias-conectados" id="alias"></ul>
        <p class="nota-proto">Prototipo: los alias se conectan solos cada pocos segundos para simular la clase.</p>
        <div class="acciones"><button class="btn" id="equipos">Conformar equipos</button></div>
      </div>
    </div>`;
  const pintar = (): void => {
    const lista = Object.keys(p.integrantes);
    $("cuenta").textContent = `(${lista.length})`;
    $("alias").innerHTML = lista.length
      ? lista.map((a) => `<li><i class="bi bi-person-circle" aria-hidden="true"></i>${esc(a)}</li>`).join("")
      : "<li>Esperando al primer estudiante…</li>";
  };
  pintar();
  estado.reloj = window.setInterval(() => {
    const siguiente = ALIAS_DEMO.find((a) => !(a in p.integrantes));
    if (siguiente && Object.keys(p.integrantes).length < ALIAS_DEMO.length) {
      p.integrantes[siguiente] = "";
      pintar();
    }
  }, 900);
  $("equipos").addEventListener("click", () => {
    if (Object.keys(p.integrantes).length < 2)
      for (const a of ALIAS_DEMO.slice(0, 8)) p.integrantes[a] ??= "";
    ir("docente/equipos");
  });
}

const ETIQUETAS = {
  espera: "Ronda lista para iniciar",
  activa: "Ronda en curso",
  pausada: "Ronda en pausa",
  cerrada: "Ronda cerrada",
};

export function panelDocente(app: HTMLElement): void {
  const p = partidaActual();
  if (!p.equipos.length) p.equipos = EQUIPOS.slice(0, 4);
  const ultima = p.ronda === p.rondas;
  app.innerHTML = `
    <h1>Ronda ${p.ronda} de ${p.rondas}</h1>
    <div class="dos-col">
      <div class="panel"><p class="estado-ronda" data-estado="${p.rondaEstado}">${ETIQUETAS[p.rondaEstado]}</p>
        <div class="reloj" id="reloj" role="timer" aria-live="off">${mmss(p.restante)}</div>
        <div class="acciones">
          ${p.rondaEstado === "espera" ? `<button class="btn" id="iniciar">Iniciar ronda ${p.ronda}</button>` : ""}
          ${p.rondaEstado === "activa" ? '<button class="btn claro" id="pausar">Pausar ronda</button>' : ""}
          ${p.rondaEstado === "pausada" ? '<button class="btn" id="reanudar">Reanudar ronda</button>' : ""}
          ${p.rondaEstado === "activa" || p.rondaEstado === "pausada" ? '<button class="btn peligro" id="cerrar">Cerrar ronda y calcular</button>' : ""}
          ${p.rondaEstado === "cerrada" ? '<a class="btn claro" href="#/ranking"><i class="bi bi-trophy" aria-hidden="true"></i>Ver ranking</a>' : ""}
          ${p.rondaEstado === "cerrada" && !ultima ? `<button class="btn" id="siguiente">Preparar ronda ${p.ronda + 1}</button>` : ""}
          ${p.rondaEstado === "cerrada" && ultima ? '<a class="btn" href="#/docente/reporte"><i class="bi bi-file-earmark-text" aria-hidden="true"></i>Ver reporte final</a>' : ""}
          ${p.historial.length && !(p.rondaEstado === "cerrada" && ultima) ? '<a class="btn claro" href="#/docente/reporte">Ver historial</a>' : ""}
        </div>
      </div>
      <div class="panel"><h2>Decisiones recibidas</h2><ul class="lista-equipos">
        ${p.equipos
          .map(
            (e, i) =>
              `<li><span>Equipo ${esc(e)}</span><span>${
                p.rondaEstado === "espera"
                  ? "esperando inicio"
                  : p.rondaEstado === "cerrada" || i < 2
                    ? "registrada"
                    : "pendiente"
              }</span></li>`,
          )
          .join("")}
      </ul></div>
    </div>
    ${p.rondaEstado === "espera" ? selectorEvento(p) : avisoEvento(p.evento)}
    ${p.rondaEstado === "cerrada" ? tablaEquipos(p) : ""}`;

  const accion = (id: string, fn: () => void): void =>
    document.getElementById(id)?.addEventListener("click", fn);
  app
    .querySelectorAll<HTMLInputElement>("input[name=evento]")
    .forEach((r) => r.addEventListener("change", () => (p.evento = r.value)));
  accion("iniciar", () => {
    p.rondaEstado = "activa";
    p.restante = p.duracion * 60;
    panelDocente(app);
  });
  accion("pausar", () => {
    p.rondaEstado = "pausada";
    panelDocente(app);
  });
  accion("reanudar", () => {
    p.rondaEstado = "activa";
    panelDocente(app);
  });
  accion("cerrar", () => {
    if (confirm("¿Cerrar la ronda? Los equipos ya no podrán cambiar su decisión.")) {
      cerrarRonda(p);
      panelDocente(app);
    }
  });
  accion("siguiente", () => {
    siguienteRonda(p);
    panelDocente(app);
  });

  if (p.rondaEstado === "activa") {
    estado.reloj = window.setInterval(() => {
      p.restante = Math.max(0, p.restante - 1);
      const r = document.getElementById("reloj");
      if (r) r.textContent = mmss(p.restante);
      if (p.restante === 0) {
        cerrarRonda(p);
        panelDocente(app);
      }
    }, 1000);
  }
}

function tablaEquipos(p: Partida): string {
  const ronda = p.historial.find((h) => h.ronda === p.ronda);
  if (!ronda) return "";
  const filas = ronda.resultados
    .map((r) => {
      const d = r.decision;
      const mercado = d ? `${esc(pais(d.iso).nombre)} / ${esc(producto(d.producto).nombre)}` : "Sin decisión";
      return `<tr><td>Equipo ${esc(r.equipo)}</td><td>${mercado}${r.exporto || !d ? "" : ' <span class="mal">(no exportó)</span>'}</td>
        <td class="num">${usd(r.costoTotal)}</td><td class="num">${usd(r.ventas)}</td>
        <td class="num ${r.utilidad < 0 ? "mal" : "ok"}">${usd(r.utilidad)}</td>
        <td class="num">${usd(r.capitalFinal)}</td></tr>`;
    })
    .join("");
  return `<section class="panel" style="margin-top:1.5rem"><h2>Resultados de la ronda ${p.ronda}</h2>
    <div class="tabla-scroll"><table>
      <thead><tr><th>Equipo</th><th>Mercado / producto</th><th class="num">Costo total</th><th class="num">Ventas</th><th class="num">Utilidad</th><th class="num">Capital</th></tr></thead>
      <tbody>${filas}</tbody></table></div>
    <p class="nota-proto">Prototipo: los equipos rivales usan decisiones de los casos de la hoja de cálculo; el equipo del estudiante usa la suya.</p>
  </section>`;
}

function selectorEvento(p: Partida): string {
  return `<section class="panel" style="margin-top:1.5rem"><h2>Evento de mercado para la ronda ${p.ronda}</h2>
    <p class="ayuda">Elija un evento antes de iniciar. Los equipos lo verán como aviso al decidir.</p>
    <fieldset class="eventos"><legend class="sr-only">Evento de mercado</legend>
      ${EVENTOS.map(
        (e) => `<label class="evento-opcion" for="evento-${e.id}">
          <input type="radio" name="evento" id="evento-${e.id}" value="${e.id}"${e.id === p.evento ? " checked" : ""}>
          <span><i class="bi ${e.icono}" aria-hidden="true"></i><strong>${esc(e.titulo)}</strong>${esc(e.descripcion)}</span>
        </label>`,
      ).join("")}
    </fieldset></section>`;
}
