// RF-15 historial de rondas y reporte final para la docente, listo para imprimir.
import { pais, producto } from "../../nucleo/datos";
import { partidaActual } from "../../simulacion/estado";
import { evento } from "../../simulacion/eventos";
import { ent, esc, usd } from "../../nucleo/formato";
import { ranking } from "../../simulacion/rondas";

export function reporte(app: HTMLElement): void {
  const p = partidaActual();
  const terminada = p.historial.length >= p.rondas;
  const fecha = new Date().toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" });

  if (!p.historial.length) {
    app.innerHTML = `<div class="panel"><h1>Reporte de la partida</h1>
      <p>Aún no hay rondas cerradas. Cierre la primera ronda desde el panel para ver el historial.</p>
      <div class="acciones"><a class="btn" href="#/docente/panel">Ir al panel</a></div></div>`;
    return;
  }

  const todas = p.historial.flatMap((h) =>
    h.resultados.filter((r) => r.exporto).map((r) => ({ ...r, ronda: h.ronda })),
  );
  const mejor = [...todas].sort((a, b) => b.utilidad - a.utilidad)[0];
  const peor = [...todas].sort((a, b) => a.utilidad - b.utilidad)[0];
  const utilidadClase = todas.reduce((s, r) => s + r.utilidad, 0);
  const tabla = ranking(p);
  const describir = (r: (typeof todas)[number] | undefined): string =>
    r?.decision
      ? `Equipo ${esc(r.equipo)}, ronda ${r.ronda}: ${esc(producto(r.decision.producto).nombre)} a ${esc(pais(r.decision.iso).nombre)} (${usd(r.utilidad)})`
      : "—";

  app.innerHTML = `
    <article class="reporte">
      <header class="reporte-encabezado">
        <div>
          <h1>${terminada ? "Reporte final" : "Reporte parcial"} de la partida ${p.codigo.slice(0, 3)} ${p.codigo.slice(3)}</h1>
          <p class="lead">${fecha}. ${p.historial.length} de ${p.rondas} rondas jugadas, ${p.equipos.length} equipos,
            capital inicial de ${usd(p.capital)} por equipo.</p>
        </div>
        <div class="acciones">
          <button class="btn" id="imprimir"><i class="bi bi-printer" aria-hidden="true"></i>Imprimir reporte</button>
          <a class="btn claro" href="#/docente/panel"><i class="bi bi-arrow-left" aria-hidden="true"></i>Volver al panel</a>
        </div>
      </header>

      <section class="datos-clave">
        <div class="dato"><div class="n">${esc(tabla[0]?.equipo ?? "—")}</div><div class="l">equipo con más capital</div></div>
        <div class="dato"><div class="n">${usd(utilidadClase)}</div><div class="l">utilidad sumada de todos los equipos</div></div>
        <div class="dato"><div class="n">${ent(todas.length)}</div><div class="l">exportaciones realizadas</div></div>
      </section>
      <p><strong>Mejor decisión:</strong> ${describir(mejor)}.<br><strong>Decisión con más pérdida:</strong> ${describir(peor)}.</p>

      <h2>Ranking</h2>
      <div class="tabla-scroll"><table>
        <thead><tr><th>Posición</th><th>Equipo</th><th class="num">Capital</th><th class="num">Resultado acumulado</th></tr></thead>
        <tbody>${tabla
          .map(
            (
              f,
            ) => `<tr><td>${f.posicion}</td><td>Equipo ${esc(f.equipo)}</td><td class="num">${usd(f.capital)}</td>
              <td class="num ${f.capital - p.capital < 0 ? "mal" : "ok"}">${usd(f.capital - p.capital)}</td></tr>`,
          )
          .join("")}</tbody>
      </table></div>

      <h2>Historial de rondas</h2>
      ${p.historial
        .map((h) => {
          const ev = evento(h.evento);
          return `<section class="reporte-ronda">
            <h3>Ronda ${h.ronda}${ev.id === "ninguno" ? "" : `: ${esc(ev.titulo)}`}</h3>
            <div class="tabla-scroll"><table>
              <thead><tr><th>Equipo</th><th>Decisión</th><th class="num">Costo</th><th class="num">Ventas</th><th class="num">Utilidad</th><th class="num">Capital</th></tr></thead>
              <tbody>${h.resultados
                .map((r) => {
                  const d = r.decision;
                  const desc = d
                    ? `${ent(d.volumen)} × ${esc(producto(d.producto).nombre)} a ${esc(pais(d.iso).nombre)}, ${d.medio.toLowerCase()}, ${usd(d.precio)}${r.exporto ? "" : " (no exportó)"}`
                    : "Sin decisión";
                  return `<tr><td>Equipo ${esc(r.equipo)}</td><td>${desc}</td><td class="num">${usd(r.costoTotal)}</td>
                    <td class="num">${usd(r.ventas)}</td><td class="num ${r.utilidad < 0 ? "mal" : "ok"}">${usd(r.utilidad)}</td>
                    <td class="num">${usd(r.capitalFinal)}</td></tr>`;
                })
                .join("")}</tbody>
            </table></div>
          </section>`;
        })
        .join("")}
      <p class="nota-proto">Prototipo: el historial existe solo mientras la página esté abierta. Los montos salen del motor de cálculo verificado contra la hoja de cálculo.</p>
    </article>`;

  document.getElementById("imprimir")?.addEventListener("click", () => window.print());
}
