import type { Decision } from "./tipos";

interface DatosExplicacion {
  decision: Decision;
  unidadesVendidas: number;
  indicePrecio: number;
  arancel: number;
  costoTotal: number;
  utilidad: number;
}

/** Texto breve del resultado de la ronda (RF-11). Replica la columna AF de la hoja "Casos". */
export function explicar(d: DatosExplicacion): string {
  const { decision, unidadesVendidas, indicePrecio, arancel, costoTotal, utilidad } = d;
  const partes: string[] = [];

  partes.push(
    unidadesVendidas < decision.volumen
      ? `Vendiste ${unidadesVendidas} de ${decision.volumen} unidades. `
      : `Vendiste las ${decision.volumen} unidades enviadas. `,
  );

  const diferencia = Math.abs(indicePrecio - 1);
  partes.push(
    diferencia < 0.005
      ? "Tu precio en moneda local quedó igual al de referencia"
      : `Tu precio en moneda local quedó ${Math.round(diferencia * 100)} % ${
          indicePrecio > 1 ? "por encima" : "por debajo"
        } del de referencia`,
  );

  partes.push(
    decision.equipos > 1
      ? ` y competiste con ${decision.equipos - 1} equipo(s) más. `
      : " y no tuviste competencia en ese mercado. ",
  );

  partes.push(
    arancel > 0
      ? `El arancel se llevó el ${Math.round((arancel / costoTotal) * 100)} % de tu costo total. `
      : "Este mercado no cobra arancel a tu producto. ",
  );

  partes.push(utilidad < 0 ? "Resultado: pérdida." : "Resultado: utilidad.");
  return partes.join("");
}
