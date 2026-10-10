// RF-12 ranking de equipos por capital, después de cada ronda cerrada.
import { estado, partidaActual } from "../estado";
import { esc, usd } from "../formato";
import { ranking } from "../simulacion";

export function verRanking(app: HTMLElement): void {
    const p = partidaActual();
    const s = estado.estudiante;
    const volver = s
        ? '<a class="btn claro" href="#/estudiante/resultados">Ver mis resultados</a>'
        : '<a class="btn claro" href="#/docente/panel">Volver al panel</a>';

    if (!p.historial.length) {
        app.innerHTML = `<div class="panel"><h1>Ranking</h1>
      <p>Todavía no hay rondas cerradas. El ranking aparece cuando se cierra la primera ronda.</p>
      <div class="acciones">${volver}</div></div>`;
        return;
    }
    const filas = ranking(p);
    const ronda = p.historial.at(-1)?.ronda ?? p.ronda;
    const podio = [filas[1], filas[0], filas[2]].filter((f) => f !== undefined);
    const flecha = (c: number): string =>
        c > 0
            ? `<span class="ok"><i class="bi bi-caret-up-fill" aria-hidden="true"></i> ${c}</span>`
            : c < 0
                ? `<span class="mal"><i class="bi bi-caret-down-fill" aria-hidden="true"></i> ${-c}</span>`
                : '<span class="fuente">=</span>';

    app.innerHTML = `
    <h1>Ranking después de la ronda ${ronda}</h1>
    <p class="lead">Gana el equipo con más capital al final de la partida (${p.rondas} rondas).</p>
    <div class="podio" aria-hidden="true">
      ${podio
            .map(
                (f) => `<div class="podio-col puesto-${f.posicion}${f.equipo === s?.equipo ? " tu-equipo" : ""}">
            <div class="podio-nombre">${f.posicion === 1 ? '<i class="bi bi-trophy-fill"></i>' : ""}${esc(f.equipo)}</div>
            <div class="podio-capital">${usd(f.capital)}</div>
            <div class="podio-bloque">${f.posicion}</div>
          </div>`,
            )
            .join("")}
    </div>
    <div class="panel tabla-scroll"><table>
      <caption class="sr-only">Ranking de equipos por capital</caption>
      <thead><tr><th>Posición</th><th>Equipo</th><th class="num">Utilidad de la ronda</th><th class="num">Capital</th><th>Cambio</th></tr></thead>
      <tbody>${filas
            .map(
                (f) => `<tr${f.equipo === s?.equipo ? ' class="tu-equipo"' : ""}>
            <td>${f.posicion}</td>
            <td>Equipo ${esc(f.equipo)}${f.equipo === s?.equipo ? " <strong>(tu equipo)</strong>" : ""}</td>
            <td class="num ${f.ultimaUtilidad !== null && f.ultimaUtilidad < 0 ? "mal" : "ok"}">${f.ultimaUtilidad === null ? "—" : usd(f.ultimaUtilidad)}</td>
            <td class="num"><strong>${usd(f.capital)}</strong></td>
            <td>${flecha(f.cambio)}</td></tr>`,
            )
            .join("")}</tbody>
    </table></div>
    <div class="acciones">${volver}</div>`;
}