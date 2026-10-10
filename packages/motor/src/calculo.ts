import { explicar } from "./explicacion";
import { enteroHaciaAbajo, redondear } from "./redondeo";
import type { Arancel, Decision, Demanda, Muestra, Pais, Producto, Resultado, Ruta } from "./tipos";

export interface CondicionesComerciales {
  pais: Pais;
  producto: Producto;
  ruta: Ruta;
  arancel: Arancel;
  demanda: Demanda;
}

export type Busqueda = { ok: true; condiciones: CondicionesComerciales } | { ok: false; faltantes: string[] };

/** Busca en la muestra las condiciones vigentes para una decisión (paso 17 del diagrama de secuencia). */
export function buscarCondiciones(datos: Muestra, d: Pick<Decision, "iso" | "producto" | "medio">): Busqueda {
  const pais = datos.paises.find((p) => p.iso === d.iso);
  const producto = datos.productos.find((p) => p.id === d.producto);
  const ruta = datos.rutas.find((r) => r.iso === d.iso && r.medio === d.medio);
  const arancel = datos.aranceles.find((a) => a.iso === d.iso && a.producto === d.producto);
  const demanda = datos.demanda.find((x) => x.iso === d.iso && x.producto === d.producto);

  if (pais && producto && ruta && arancel && demanda) {
    return { ok: true, condiciones: { pais, producto, ruta, arancel, demanda } };
  }
  const faltantes: string[] = [];
  if (!pais) faltantes.push("país");
  if (!producto) faltantes.push("producto");
  if (!ruta) faltantes.push(`ruta ${d.medio.toLowerCase()}`);
  if (!arancel) faltantes.push("arancel");
  if (!demanda) faltantes.push("demanda de mercado");
  return { ok: false, faltantes };
}

/**
 * Calcula el resultado de una decisión. Función pura: no lee ni escribe nada
 * fuera de sus argumentos, por eso puede ejecutarse igual en el navegador,
 * en un servidor o en las pruebas.
 *
 * Cada línea corresponde a una columna de la hoja "Casos" (entre corchetes).
 */
export function calcularResultado(c: CondicionesComerciales, d: Decision, elasticidad: number): Resultado {
  const valorFob = redondear(d.volumen * c.producto.costoFob); // [R]
  const flete = redondear(d.volumen * c.producto.pesoKg * c.ruta.fletePorKg); // [S]
  const seguro = redondear((valorFob + flete) * c.ruta.pctSeguro); // [T]
  const valorCif = redondear(valorFob + flete + seguro); // [U]
  const arancel = redondear(valorCif * c.arancel.pct); // [V]
  const costoTotal = redondear(valorCif + arancel); // [W]
  const tcAplicado = redondear(c.pais.unidadesPorUsd * (1 + d.variacion), 4); // [X]
  const costoLocal = redondear(costoTotal * tcAplicado); // [Y]
  const indicePrecio = redondear((d.precio / c.demanda.precioReferencia) * (1 + d.variacion), 4); // [Z]
  const potencial = (c.demanda.demandaBase / d.equipos) * Math.pow(indicePrecio, -elasticidad);
  const unidadesVendidas = Math.min(d.volumen, enteroHaciaAbajo(potencial)); // [AA]
  const ventas = redondear(unidadesVendidas * d.precio); // [AB]
  const utilidad = redondear(ventas - costoTotal); // [AC]
  const capitalFinal = redondear(d.capital + utilidad); // [AD]
  const valida = costoTotal <= d.capital ? "Sí" : "No: excede el capital"; // [AE]

  return {
    valorFob,
    flete,
    seguro,
    valorCif,
    arancel,
    costoTotal,
    tcAplicado,
    costoLocal,
    indicePrecio,
    unidadesVendidas,
    ventas,
    utilidad,
    capitalFinal,
    valida,
    explicacion: explicar({ decision: d, unidadesVendidas, indicePrecio, arancel, costoTotal, utilidad }),
  };
}

export type Calculo =
  | ({ ok: true; condiciones: CondicionesComerciales } & Resultado)
  | { ok: false; faltantes: string[] };

/** Atajo: busca las condiciones en la muestra y calcula. */
export function calcular(datos: Muestra, d: Decision): Calculo {
  const b = buscarCondiciones(datos, d);
  if (!b.ok) return b;
  return {
    ok: true,
    condiciones: b.condiciones,
    ...calcularResultado(b.condiciones, d, datos.parametros.elasticidad),
  };
}
