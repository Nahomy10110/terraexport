// RF-02 ingreso, sala de espera, RF-08 decisión y RF-11 resultados.
import { calcular, type Decision, type MedioTransporte } from "@terraexport/motor";
import { D, pais, producto, tieneDatos } from "../datos";
import { $, campo, ir } from "../dom";
import { CODIGO_DEMO, estado, partidaActual } from "../estado";
import { ent, esc, num, pct, usd } from "../formato";
import { fichaHtml } from "./ficha";

export function ingresoEstudiante(app: HTMLElement): void {
  const esperado = estado.partida?.codigo ?? CODIGO_DEMO;
  app.innerHTML = `
    <div class="dos-col">
      <form class="panel" id="f" novalidate>
        <h1>Entrar a la partida</h1>
        <div class="campo"><label for="codigo">Código de la partida</label>
          <input type="text" id="codigo" name="codigo" autocomplete="off" placeholder="TRX 4821"></div>
        <div class="campo"><label for="alias">Tu alias</label>
          <input type="text" id="alias" name="alias" maxlength="40" autocomplete="off">
          <span class="ayuda">No uses tu nombre completo: solo se guarda el alias.</span></div>
        <p class="error" id="err" role="alert"></p>
        <div class="acciones"><button class="btn" type="submit">Entrar</button></div>
      </form>
      <div class="nota-proto">Para probar usa el código <strong>${esperado.slice(0, 3)} ${esperado.slice(3)}</strong>
        ${estado.partida ? "(la partida creada por la docente)." : "(partida de demostración)."}</div>
    </div>`;

  const f = $<HTMLFormElement>("f");
  f.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const codigo = campo(f, "codigo");
    const alias = campo(f, "alias");
    const err = $("err");
    codigo.removeAttribute("aria-invalid");
    alias.removeAttribute("aria-invalid");
    if (codigo.value.toUpperCase().replace(/[^A-Z0-9]/g, "") !== esperado) {
      err.textContent = "Ese código no corresponde a ninguna partida abierta. Revísalo con tu docente.";
      codigo.setAttribute("aria-invalid", "true");
      codigo.focus();
      return;
    }
    if (alias.value.trim().length < 2) {
      err.textContent = "Escribe un alias de al menos 2 caracteres.";
      alias.setAttribute("aria-invalid", "true");
      alias.focus();
      return;
    }
    const p = partidaActual();
    estado.estudiante = {
      alias: alias.value.trim(),
      equipo: "Guanacaste",
      capital: p.capital,
      decision: null,
    };
    ir("estudiante/espera");
  });
}

export function salaEspera(app: HTMLElement): void {
  const s = estado.estudiante;
  if (!s) return ir("estudiante");
  app.innerHTML = `
    <div class="panel"><h1>Hola, ${esc(s.alias)}</h1>
      <p>Estás en el <strong>equipo ${s.equipo}</strong> con un capital de <strong>${usd(s.capital)}</strong>.</p>
      <p>La ronda comienza cuando la docente la inicie. Mientras tanto, revisa los mercados.</p>
      <div class="acciones"><a class="btn claro" href="#/pais/${partidaActual().paises[0]}">Ver fichas de países</a>
        <button class="btn" id="ya">Comenzar ronda</button></div>
      <p class="nota-proto" style="margin-top:1rem">Prototipo: el botón simula que la docente inició la ronda.</p>
    </div>`;
  $("ya").addEventListener("click", () => ir("estudiante/decision"));
}

export function decision(app: HTMLElement): void {
  const s = estado.estudiante;
  if (!s) return ir("estudiante");
  const p = partidaActual();
  const d = s.decision;

  app.innerHTML = `
    <h1>Decisión de la ronda ${p.ronda}</h1>
    <div class="dos-col">
      <form class="panel" id="f" novalidate>
        <div class="campo"><label for="iso">Mercado de destino</label><select id="iso" name="iso">
          ${p.paises.map((i) => `<option value="${i}"${i === d?.iso ? " selected" : ""}>${esc(pais(i).nombre)}</option>`).join("")}
        </select></div>
        <div class="campo"><label for="producto">Producto</label><select id="producto" name="producto"></select></div>
        <fieldset class="campo"><legend>Transporte</legend><div class="chips">
          ${(["Marítimo", "Aéreo"] as const)
            .map(
              (m) =>
                `<label class="chip"><input type="radio" name="medio" value="${m}"${m === (d?.medio ?? "Marítimo") ? " checked" : ""}><span>${m}</span></label>`,
            )
            .join("")}
        </div></fieldset>
        <div class="fila">
          <div class="campo"><label for="volumen">Volumen (unidades)</label>
            <input type="number" id="volumen" name="volumen" min="1" step="1" value="${d?.volumen ?? ""}"><span class="ayuda" id="unidad"></span></div>
          <div class="campo"><label for="precio">Precio por unidad (USD)</label>
            <input type="number" id="precio" name="precio" min="0.01" step="0.01" value="${d?.precio ?? ""}"><span class="ayuda" id="ref"></span></div>
        </div>
        <div id="previo"></div>
        <p class="error" id="err" role="alert"></p>
        <div class="acciones"><button class="btn" type="submit" id="enviar">Registrar decisión</button></div>
      </form>
      <aside class="panel" id="ficha" aria-live="polite"></aside>
    </div>`;

  const f = $<HTMLFormElement>("f");
  const iso = campo(f, "iso");
  const prod = campo(f, "producto");
  const vol = campo(f, "volumen");
  const precio = campo(f, "precio");
  const medio = (): MedioTransporte =>
    (f.querySelector<HTMLInputElement>("input[name=medio]:checked")?.value ?? "Marítimo") as MedioTransporte;
  const armar = (): Decision => ({
    iso: iso.value,
    producto: prod.value,
    medio: medio(),
    volumen: Number(vol.value),
    precio: Number(precio.value),
    equipos: 2,
    variacion: 0,
    capital: s.capital,
  });

  const llenarProductos = (): void => {
    const elegido = prod.value || d?.producto;
    prod.innerHTML =
      '<option value="">Elige un producto</option>' +
      p.productos
        .map((id) => {
          const ok = tieneDatos(iso.value, id);
          return `<option value="${id}"${ok ? "" : " disabled"}${ok && id === elegido ? " selected" : ""}>${esc(producto(id).nombre)}${ok ? "" : " (sin datos verificados aún)"}</option>`;
        })
        .join("");
  };

  const actualizar = (): void => {
    $("ficha").innerHTML = fichaHtml(iso.value, true, prod.value || undefined);
    $("unidad").textContent = prod.value ? `Unidad: ${producto(prod.value).unidad}` : "";
    const dem = D.demanda.find((x) => x.iso === iso.value && x.producto === prod.value);
    $("ref").textContent = dem ? `Precio de referencia del mercado: ${usd(dem.precioReferencia)}` : "";
    const dec = armar();
    const previo = $("previo");
    previo.innerHTML = "";
    if (prod.value && dec.volumen > 0 && dec.precio > 0) {
      const r = calcular(D, dec);
      if (r.ok) {
        previo.innerHTML = `<p class="nota-proto">Costo puesto en destino estimado: <strong>${usd(r.costoTotal)}</strong>
          (${usd(r.costoTotal / dec.volumen)} por unidad).
          ${r.costoTotal > s.capital ? '<span class="mal">Supera tu capital disponible.</span>' : "Las ventas se conocen al cerrar la ronda."}</p>`;
      }
    }
  };

  llenarProductos();
  actualizar();
  iso.addEventListener("change", () => {
    llenarProductos();
    actualizar();
  });
  f.addEventListener("change", actualizar);
  f.addEventListener("input", actualizar);

  f.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const err = $("err");
    const dec = armar();
    if (!dec.producto) return void (err.textContent = "Elige un producto.");
    if (!(dec.volumen >= 1) || !Number.isInteger(dec.volumen))
      return void (err.textContent = "El volumen debe ser un número entero mayor que 0.");
    if (!(dec.precio > 0)) return void (err.textContent = "El precio debe ser mayor que 0.");
    const r = calcular(D, dec);
    if (!r.ok)
      return void (err.textContent = `Faltan datos para esta combinación: ${r.faltantes.join(", ")}.`);
    if (r.costoTotal > s.capital)
      return void (err.textContent = `El costo puesto en destino (${usd(r.costoTotal)}) supera tu capital. Reduce el volumen o cambia el transporte.`);

    s.decision = dec;
    app.innerHTML = `
      <div class="panel"><h1>Decisión registrada</h1>
        <p>Equipo ${s.equipo}: ${ent(dec.volumen)} × ${esc(producto(dec.producto).nombre)} hacia ${esc(pais(dec.iso).nombre)}
          por vía ${dec.medio.toLowerCase()}, a ${usd(dec.precio)} la unidad.</p>
        <p>Puedes cambiarla hasta que la docente cierre la ronda.</p>
        <div class="acciones"><a class="btn claro" href="#/estudiante/decision">Cambiar decisión</a>
          <button class="btn" id="cierre">Ver resultados</button></div>
        <p class="nota-proto" style="margin-top:1rem">Prototipo: "Ver resultados" simula el cierre de la ronda.</p>
      </div>`;
    $("cierre").addEventListener("click", () => ir("estudiante/resultados"));
  });
}

export function resultados(app: HTMLElement): void {
  const s = estado.estudiante;
  if (!s?.decision) return ir("estudiante");
  const d = s.decision;
  const r = calcular(D, d);
  if (!r.ok) return ir("estudiante/decision");
  const c = r.condiciones;
  const tope = Math.max(r.costoTotal, r.ventas);
  const segmentos: [string, number, string][] = [
    ["FOB", r.valorFob, "var(--fob)"],
    ["Flete", r.flete, "var(--flete)"],
    ["Seguro", r.seguro, "var(--seguro)"],
    ["Arancel", r.arancel, "var(--arancel)"],
  ];
  const fila = (t: string, v: number): string => `<tr><td>${t}</td><td class="num">${usd(v)}</td></tr>`;

  app.innerHTML = `
    <article class="manifiesto">
      <header>
        <div><h1>Resultado de la ronda ${partidaActual().ronda}</h1>
          <p>Equipo ${s.equipo}: ${esc(c.producto.nombre)} hacia ${esc(c.pais.nombre)}, vía ${d.medio.toLowerCase()}.</p></div>
        <div><div class="l">Utilidad</div><div class="saldo ${r.utilidad < 0 ? "neg" : "pos"}">${usd(r.utilidad)}</div></div>
      </header>
      <div class="cuerpo">
        <h2>Costo puesto en destino</h2>
        <div class="carga" role="img" aria-label="Composición del costo total">
          ${segmentos.map(([t, v, col]) => `<span style="width:${(v / tope) * 100}%;background:${col}" title="${t}"></span>`).join("")}
        </div>
        <div class="leyenda">${segmentos.map(([t, , col]) => `<span><b style="background:${col}"></b>${t}</span>`).join("")}</div>
        <h2 style="margin-top:1.25rem">Ventas</h2>
        <div class="ventas-barra" style="width:${(r.ventas / tope) * 100}%" role="img" aria-label="Ventas comparadas con el costo"></div>
        <div class="tabla-scroll"><table><tbody>
          ${fila(`Valor FOB (${ent(d.volumen)} × ${usd(c.producto.costoFob)})`, r.valorFob)}
          ${fila(`Flete (${ent(d.volumen)} × ${num(c.producto.pesoKg)} kg × ${usd(c.ruta.fletePorKg)}/kg)`, r.flete)}
          ${fila(`Seguro (${pct(c.ruta.pctSeguro, 2)} de FOB + flete)`, r.seguro)}
          ${fila("Valor CIF", r.valorCif)}
          ${fila(`Arancel (${pct(c.arancel.pct)} del CIF)`, r.arancel)}
          <tr class="total"><td>Costo total</td><td class="num">${usd(r.costoTotal)}</td></tr>
          <tr><td>Costo total en ${esc(c.pais.moneda.toLowerCase())} (TC ${num(r.tcAplicado)})</td><td class="num">${num(r.costoLocal)} ${c.pais.codigoMoneda}</td></tr>
          ${fila(`Ventas (${ent(r.unidadesVendidas)} de ${ent(d.volumen)} unidades × ${usd(d.precio)})`, r.ventas)}
          <tr class="total"><td>Utilidad</td><td class="num ${r.utilidad < 0 ? "mal" : "ok"}">${usd(r.utilidad)}</td></tr>
          ${fila("Capital para la próxima ronda", r.capitalFinal)}
        </tbody></table></div>
        <p class="explicacion">${esc(r.explicacion)}</p>
        <div class="acciones"><a class="btn claro" href="#/estudiante/decision">Probar otra decisión</a>
          <a class="btn claro" href="#/pais/${d.iso}">Ver ficha de ${esc(c.pais.nombre)}</a></div>
      </div>
    </article>`;
}
