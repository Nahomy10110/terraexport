// Punto único de acceso a la muestra. La web nunca edita estos datos:
// salen del Excel mediante scripts/excel_a_datos.py.
import type { IdProducto, IsoPais, Muestra, Pais, Producto } from "@terraexport/motor";
import muestra from "../../../../datos/muestra.json";

export const D = muestra as Muestra;

export function pais(iso: IsoPais): Pais {
  const p = D.paises.find((x) => x.iso === iso);
  if (!p) throw new Error(`País desconocido: ${iso}`);
  return p;
}

export function producto(id: IdProducto): Producto {
  const p = D.productos.find((x) => x.id === id);
  if (!p) throw new Error(`Producto desconocido: ${id}`);
  return p;
}

export function tieneDatos(iso: IsoPais, id: IdProducto): boolean {
  return (
    D.aranceles.some((a) => a.iso === iso && a.producto === id) &&
    D.demanda.some((d) => d.iso === iso && d.producto === id)
  );
}

export function nombreFuente(id: string): string {
  return D.fuentes[id]?.nombre ?? id;
}
