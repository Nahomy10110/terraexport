// RNF-05: la demo debe dar los mismos montos que la hoja de cálculo.
import { calcular, type Resultado } from "@terraexport/motor";
import { D, pais, producto } from "../../nucleo/datos";
import { esc, usd } from "../../nucleo/formato";

export function verificacion(app: HTMLElement): void {
  let coinciden = 0;
  const filas = D.casos
    .map((c) => {
      const r = calcular(D, c.decision);
      const campos = Object.keys(c.esperado) as (keyof Resultado)[];
      const malos = r.ok ? campos.filter((k) => r[k] !== c.esperado[k]) : ["datos faltantes"];
      if (!malos.length) coinciden++;
      return `<tr><td>${c.caso}</td>
        <td>${esc(pais(c.decision.iso).nombre)} / ${esc(producto(c.decision.producto).nombre)}</td>
        <td class="num">${usd(c.esperado.costoTotal)}</td><td class="num">${r.ok ? usd(r.costoTotal) : "—"}</td>
        <td class="num">${usd(c.esperado.utilidad)}</td><td class="num">${r.ok ? usd(r.utilidad) : "—"}</td>
        <td>${malos.length ? `<span class="mal">✖ difiere en ${malos.join(", ")}</span>` : '<span class="ok">✔ coincide</span>'}</td></tr>`;
    })
    .join("");
  app.innerHTML = `
    <h1>Verificación contra la hoja de cálculo</h1>
    <p>Cada caso de la hoja <em>Casos</em> se vuelve a calcular con el motor y se comparan los 15 resultados
      (montos, unidades y explicación). Las mismas comparaciones corren como pruebas automáticas en cada pull request.</p>
    <p><strong class="${coinciden === D.casos.length ? "ok" : "mal"}">${coinciden} de ${D.casos.length} casos coinciden.</strong>
      Datos generados el ${esc(D.generado)}.</p>
    <div class="panel tabla-scroll"><table>
      <thead><tr><th>Caso</th><th>Mercado / producto</th><th class="num">Costo total (Excel)</th><th class="num">Costo total (demo)</th>
        <th class="num">Utilidad (Excel)</th><th class="num">Utilidad (demo)</th><th>Estado</th></tr></thead>
      <tbody>${filas}</tbody></table></div>`;
}
