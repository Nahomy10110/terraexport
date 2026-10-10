// RF-14 choque cultural: aparece después de registrar la decisión si el mercado tiene escenario.
import { pais } from "../../nucleo/datos";
import { $, ir } from "../../nucleo/dom";
import { ESCENARIOS, escenarioPara, situacion } from "../../simulacion/choques";
import { estado, partidaActual } from "../../simulacion/estado";
import { esc } from "../../nucleo/formato";
import { cerrarRonda } from "../../simulacion/rondas";

const NOMBRES = {
  distanciaPoder: "Distancia al poder",
  individualismo: "Individualismo",
  masculinidad: "Masculinidad",
  aversionIncertidumbre: "Aversión a la incertidumbre",
  largoPlazo: "Orientación a largo plazo",
  indulgencia: "Indulgencia",
} as const;

export function choqueCultural(app: HTMLElement): void {
  const s = estado.estudiante;
  if (!s?.decision) return ir("estudiante/decision");
  const iso = s.decision.iso;
  const e = escenarioPara(iso);
  if (!e) return ir("estudiante/resultados");
  const puntaje = pais(iso).hofstede[e.dimension];
  const elegida = s.choqueRespondido;
  const opcion = elegida !== null ? e.opciones[elegida] : undefined;
  const mejor = Math.max(...e.opciones.map((o) => o.impacto));

  app.innerHTML = `
    <section class="choque">
      <p class="choque-dim"><i class="bi bi-people" aria-hidden="true"></i>${NOMBRES[e.dimension]} en ${esc(pais(iso).nombre)}: <strong>${puntaje}</strong> de 100</p>
      <h1>Choque cultural</h1>
      <p class="choque-situacion">${esc(situacion(e, iso))}</p>
      <form id="f" novalidate>
        <fieldset ${opcion ? "disabled" : ""}><legend class="sr-only">¿Qué haces?</legend>
          ${e.opciones
            .map((o, i) => {
              const clase = opcion
                ? o.impacto === mejor
                  ? " correcta"
                  : i === elegida
                    ? " elegida"
                    : ""
                : "";
              return `<label class="opcion-choque${clase}" for="op-${i}">
                <input type="radio" name="opcion" id="op-${i}" value="${i}"${i === elegida ? " checked" : ""}>
                <span>${esc(o.texto)}${clase === " correcta" ? ' <i class="bi bi-check-circle-fill" aria-label="Mejor respuesta"></i>' : ""}</span></label>`;
            })
            .join("")}
        </fieldset>
        <p class="error" id="err" role="alert"></p>
        ${opcion ? "" : '<div class="acciones"><button class="btn" id="responder" type="submit">Responder</button></div>'}
      </form>
      ${
        opcion
          ? `<div class="retro ${opcion.impacto > 0 ? "bien" : opcion.impacto < 0 ? "mal-retro" : "neutra"}" role="status">
              <strong>${opcion.impacto > 0 ? "¡Bien leído!" : opcion.impacto < 0 ? "Eso no funcionó" : "A medias"}</strong>
              <p>${esc(opcion.retro)}</p>
              <p>Efecto en tu demanda esta ronda: <strong>${opcion.impacto > 0 ? "+" : ""}${Math.round(opcion.impacto * 100)} %</strong>.</p>
            </div>
            <div class="acciones"><button class="btn" id="a-resultados">Ver resultados</button></div>`
          : ""
      }
      <p class="nota-proto" style="margin-top:1.25rem">Prototipo: banco de ${ESCENARIOS.length} escenarios basados en las dimensiones de Hofstede et al. (2010). En la demo el cierre de la ronda se simula al ver los resultados.</p>
    </section>`;

  $<HTMLFormElement>("f").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const marcada = app.querySelector<HTMLInputElement>("input[name=opcion]:checked");
    if (!marcada) {
      $("err").textContent = "Elige una opción.";
      return;
    }
    s.choqueRespondido = Number(marcada.value);
    choqueCultural(app);
  });
  document.getElementById("a-resultados")?.addEventListener("click", () => {
    cerrarRonda(partidaActual());
    ir("estudiante/resultados");
  });
}
