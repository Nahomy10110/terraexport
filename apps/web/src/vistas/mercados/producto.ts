// RF-07 ficha de producto, con fuente y estado del dato (RNF-06).
import { D, nombreFuente, pais, producto, tieneDatos } from "../../nucleo/datos";
import { bandera } from "../../nucleo/banderas";
import { botonVolver } from "../../nucleo/dom";
import { esc, num, pct, usd } from "../../nucleo/formato";

export function fichaProducto(app: HTMLElement, partes: string[]): void {
  const id = partes[1] ?? D.productos[0]?.id ?? "P01";
  if (!D.productos.some((p) => p.id === id)) {
    app.innerHTML = `<div class="panel"><h1>Ese producto no está en la muestra</h1><div class="acciones">${botonVolver("Volver al inicio")}</div></div>`;
    return;
  }
  const p = producto(id);
  const conDatos = D.paises.filter((x) => tieneDatos(x.iso, id));
  const sinDatos = D.paises.filter((x) => !tieneDatos(x.iso, id));

  const mercados = conDatos
    .map((x) => {
      const ar = D.aranceles.find((a) => a.iso === x.iso && a.producto === id);
      const dem = D.demanda.find((d) => d.iso === x.iso && d.producto === id);
      return `<tr>
        <td><a class="con-bandera" href="#/pais/${x.iso}">${bandera(x.iso)}${esc(x.nombre)}</a></td>
        <td class="num">${ar ? pct(ar.pct) : "—"}</td>
        <td class="num">${dem ? usd(dem.precioReferencia) : "—"}</td>
        <td class="fuente">${ar ? esc(nombreFuente(ar.fuente)) : ""}</td>
      </tr>`;
    })
    .join("");

  app.innerHTML = `
    ${botonVolver()}
    <h1>${esc(p.nombre)}</h1>
    <div class="dos-col">
      <div class="panel">
        <div class="datos-clave">
          <div class="dato"><div class="n">${usd(p.costoFob)}</div><div class="l">costo FOB por ${esc(p.unidad)}</div>
            <div class="fuente">${esc(nombreFuente(p.fuente))} (${esc(p.estado.toLowerCase())})</div></div>
          <div class="dato"><div class="n">${num(p.pesoKg)} kg</div><div class="l">peso por unidad, para calcular el flete</div></div>
          <div class="dato"><div class="n">${esc(p.codigoSa)}</div><div class="l">código del Sistema Armonizado</div></div>
        </div>
        ${p.nota ? `<p class="fuente">${esc(p.nota)}</p>` : ""}
        <h2>Mercados con datos</h2>
        ${
          conDatos.length
            ? `<div class="tabla-scroll"><table>
                <thead><tr><th>País</th><th class="num">Arancel</th><th class="num">Precio de referencia</th><th>Fuente del arancel</th></tr></thead>
                <tbody>${mercados}</tbody></table></div>`
            : "<p>Este producto todavía no tiene aranceles verificados en ningún mercado de la muestra.</p>"
        }
        ${sinDatos.length ? `<p class="fuente" style="margin-top:1rem">Sin datos verificados aún: ${sinDatos.map((x) => esc(x.nombre)).join(", ")}.</p>` : ""}
      </div>
      <nav class="panel" aria-label="Otros productos"><h2>Otros productos</h2><ul class="lista-equipos">
        ${D.productos
          .map(
            (x) =>
              `<li><a href="#/producto/${x.id}"${x.id === id ? ' aria-current="page"' : ""}>${esc(x.nombre)}</a><span>${esc(x.codigoSa)}</span></li>`,
          )
          .join("")}
      </ul></nav>
    </div>`;
}
