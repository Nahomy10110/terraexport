// RF-06 ficha de país, con fuente y fecha de corte de cada dato (RNF-06).
import type { IdProducto, IsoPais } from "@terraexport/motor";
import { D, nombreFuente, pais, producto } from "../../nucleo/datos";
import { esc, num, pct, usd } from "../../nucleo/formato";

export function fichaHtml(iso: IsoPais, compacta: boolean, productoId?: IdProducto): string {
  const p = pais(iso);
  const rutas = D.rutas.filter((r) => r.iso === iso);
  const aranceles = D.aranceles.filter((a) => a.iso === iso);
  const arSel = productoId ? aranceles.find((a) => a.producto === productoId) : undefined;
  const h = p.hofstede;
  const dims: [string, number][] = [
    ["Distancia al poder", h.distanciaPoder],
    ["Individualismo", h.individualismo],
    ["Masculinidad", h.masculinidad],
    ["Aversión a la incertidumbre", h.aversionIncertidumbre],
    ["Orientación a largo plazo", h.largoPlazo],
    ["Indulgencia", h.indulgencia],
  ];
  const dato = (n: string, l: string, f: string): string =>
    `<div class="dato"><div class="n">${n}</div><div class="l">${l}</div><div class="fuente">${f}</div></div>`;

  return `${compacta ? `<h2>${esc(p.nombre)}</h2>` : ""}
    <div class="datos-clave">
      ${dato(`${num(p.unidadesPorUsd)} ${p.codigoMoneda}`, "por 1 USD", `${esc(nombreFuente(p.fuenteTc))}, ${p.fechaCorte}`)}
      ${arSel && productoId ? dato(pct(arSel.pct), `arancel a ${esc(producto(productoId).nombre.toLowerCase())}`, `${esc(nombreFuente(arSel.fuente))}, ${arSel.fechaCorte}`) : ""}
      ${rutas
        .map((r) =>
          dato(
            `${usd(r.fletePorKg)}/kg`,
            `flete ${r.medio.toLowerCase()}, ${r.diasTransito} días, seguro ${pct(r.pctSeguro, 2)}`,
            `${esc(nombreFuente(r.fuente))} (${esc(r.estado.toLowerCase())})`,
          ),
        )
        .join("")}
    </div>
    ${
      !compacta && aranceles.length
        ? `<h3>Aranceles cargados</h3><ul>${aranceles
            .map(
              (a) =>
                `<li><a href="#/producto/${a.producto}">${esc(producto(a.producto).nombre)}</a>: ${pct(a.pct)} <span class="fuente">(${esc(nombreFuente(a.fuente))}, ${esc(a.estado.toLowerCase())})</span></li>`,
            )
            .join("")}</ul>`
        : ""
    }
    <h3>Perfil cultural</h3>
    <div class="hof">${dims
      .map(
        ([t, v]) =>
          `<div class="hof-fila"><span>${t}</span><span class="hof-barra"><i style="width:${Math.min(100, v)}%"></i></span><span>${v}</span></div>`,
      )
      .join("")}</div>
    <p class="fuente" style="margin-top:.5rem">${esc(nombreFuente(p.fuenteHofstede))}</p>`;
}

export function fichaPais(app: HTMLElement, partes: string[]): void {
  const iso = partes[1] ?? D.paises[0]?.iso ?? "USA";
  if (!D.paises.some((p) => p.iso === iso)) {
    app.innerHTML =
      '<div class="panel"><h1>Ese país no está en la muestra</h1><p><a href="#/">Volver al inicio</a></p></div>';
    return;
  }
  app.innerHTML = `
    <p><a href="javascript:history.back()">Volver</a></p>
    <h1>${esc(pais(iso).nombre)}</h1>
    <div class="dos-col"><div class="panel">${fichaHtml(iso, false)}</div>
      <nav class="panel" aria-label="Otros países"><h2>Otros mercados</h2><ul class="lista-equipos">
        ${D.paises
          .map(
            (p) =>
              `<li><a href="#/pais/${p.iso}"${p.iso === iso ? ' aria-current="page"' : ""}>${esc(p.nombre)}</a><span>${p.codigoMoneda}</span></li>`,
          )
          .join("")}
      </ul></nav>
    </div>`;
}
