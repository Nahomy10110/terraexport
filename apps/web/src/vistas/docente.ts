// RF-03 crear partida, código de acceso y RF-05 panel de la ronda.
import { calcular } from "@terraexport/motor";
import { D, pais, producto } from "../datos";
import { $, campo, ir, marcados } from "../dom";
import { EQUIPOS, estado, partidaActual, type Partida } from "../estado";
import { esc, mmss, usd } from "../formato";

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
    estado.partida = {
      codigo: `TRX${1000 + Math.floor(Math.random() * 9000)}`,
      rondas: a.rondas,
      duracion: a.duracion,
      capital: a.capital,
      paises: [...a.paises],
      productos: [...a.productos],
      equipos: [],
      ronda: 1,
      rondaEstado: "espera",
      restante: a.duracion * 60,
    };
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
): string {
  return `<fieldset class="campo"><legend>${leyenda}</legend><p class="ayuda">Elija al menos 2.</p><div class="chips">
    ${opciones
      .map(
        ([v, t]) =>
          `<label class="chip"><input type="checkbox" name="${grupo}" value="${v}"${elegidos.includes(v) ? " checked" : ""}><span>${esc(t)}</span></label>`,
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
      <div class="panel"><h2>Equipos conectados</h2><ul class="lista-equipos" id="eq"></ul>
        <p class="nota-proto">Prototipo: los equipos se conectan solos cada pocos segundos para simular la clase.</p>
        <div class="acciones"><button class="btn" id="iniciar">Iniciar ronda 1</button></div>
      </div>
    </div>`;
  const pintar = (): void => {
    $("eq").innerHTML = p.equipos.length
      ? p.equipos.map((e) => `<li><span>Equipo ${e}</span><span>conectado</span></li>`).join("")
      : "<li><span>Esperando al primer equipo…</span></li>";
  };
  pintar();
  estado.reloj = window.setInterval(() => {
    const siguiente = EQUIPOS[p.equipos.length];
    if (p.equipos.length < 4 && siguiente) {
      p.equipos.push(siguiente);
      pintar();
    }
  }, 1800);
  $("iniciar").addEventListener("click", () => {
    if (!p.equipos.length) p.equipos = EQUIPOS.slice(0, 4);
    p.rondaEstado = "activa";
    p.restante = p.duracion * 60;
    ir("docente/panel");
  });
}

const ETIQUETAS = {
  espera: "Ronda en espera",
  activa: "Ronda en curso",
  pausada: "Ronda en pausa",
  cerrada: "Ronda cerrada",
};

export function panelDocente(app: HTMLElement): void {
  const p = partidaActual();
  if (p.rondaEstado === "espera") p.rondaEstado = "activa";
  app.innerHTML = `
    <h1>Ronda ${p.ronda} de ${p.rondas}</h1>
    <div class="dos-col">
      <div class="panel"><p class="estado-ronda" data-estado="${p.rondaEstado}">${ETIQUETAS[p.rondaEstado]}</p>
        <div class="reloj" id="reloj" role="timer" aria-live="off">${mmss(p.restante)}</div>
        <div class="acciones">
          ${p.rondaEstado === "activa" ? '<button class="btn claro" id="pausar">Pausar ronda</button>' : ""}
          ${p.rondaEstado === "pausada" ? '<button class="btn" id="reanudar">Reanudar ronda</button>' : ""}
          ${p.rondaEstado !== "cerrada" ? '<button class="btn peligro" id="cerrar">Cerrar ronda y calcular</button>' : ""}
          ${p.rondaEstado === "cerrada" && p.ronda < p.rondas ? `<button class="btn" id="siguiente">Iniciar ronda ${p.ronda + 1}</button>` : ""}
        </div>
      </div>
      <div class="panel"><h2>Decisiones recibidas</h2><ul class="lista-equipos">
        ${p.equipos
          .map(
            (e, i) =>
              `<li><span>Equipo ${e}</span><span>${p.rondaEstado === "cerrada" || i < 2 ? "registrada" : "pendiente"}</span></li>`,
          )
          .join("")}
      </ul></div>
    </div>
    ${p.rondaEstado === "cerrada" ? tablaEquipos(p) : ""}`;

  const accion = (id: string, fn: () => void): void =>
    document.getElementById(id)?.addEventListener("click", fn);
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
      p.rondaEstado = "cerrada";
      panelDocente(app);
    }
  });
  accion("siguiente", () => {
    p.ronda++;
    p.rondaEstado = "activa";
    p.restante = p.duracion * 60;
    panelDocente(app);
  });

  if (p.rondaEstado === "activa") {
    estado.reloj = window.setInterval(() => {
      p.restante = Math.max(0, p.restante - 1);
      const r = document.getElementById("reloj");
      if (r) r.textContent = mmss(p.restante);
      if (p.restante === 0) {
        p.rondaEstado = "cerrada";
        panelDocente(app);
      }
    }, 1000);
  }
}

function tablaEquipos(p: Partida): string {
  const filas = p.equipos
    .map((e, i) => {
      const caso = D.casos[i % D.casos.length];
      if (!caso) return "";
      const r = calcular(D, caso.decision);
      if (!r.ok) return "";
      return `<tr><td>Equipo ${e}</td>
        <td>${esc(pais(caso.decision.iso).nombre)} / ${esc(producto(caso.decision.producto).nombre)}</td>
        <td class="num">${usd(r.costoTotal)}</td><td class="num">${usd(r.ventas)}</td>
        <td class="num ${r.utilidad < 0 ? "mal" : "ok"}">${usd(r.utilidad)}</td></tr>`;
    })
    .join("");
  return `<section class="panel" style="margin-top:1.5rem"><h2>Resultados de la ronda</h2>
    <div class="tabla-scroll"><table>
      <thead><tr><th>Equipo</th><th>Mercado / producto</th><th class="num">Costo total</th><th class="num">Ventas</th><th class="num">Utilidad</th></tr></thead>
      <tbody>${filas}</tbody></table></div>
    <p class="nota-proto">Prototipo: cada equipo usa la decisión de un caso de la hoja de cálculo. El ranking (RF-12) llega en el Sprint 2.</p>
  </section>`;
}
