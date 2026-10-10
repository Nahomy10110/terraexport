/**
 * Redondeo igual a la función ROUND de Excel: las mitades se alejan de cero
 * (ROUND(2.345; 2) = 2,35 y ROUND(-2.345; 2) = -2,35).
 *
 * Se usa notación exponencial para evitar el error clásico de
 * Math.round(1.005 * 100) / 100 = 1 (debería ser 1,01).
 */
export function redondear(valor: number, decimales = 2): number {
  const signo = valor < 0 ? -1 : 1;
  const desplazado = Math.round(Number(`${Math.abs(valor)}e${decimales}`));
  return signo * Number(`${desplazado}e-${decimales}`);
}

/** Igual a ROUNDDOWN(x; 0) para valores positivos, tolerante a errores de coma flotante. */
export function enteroHaciaAbajo(valor: number): number {
  return Math.floor(valor + 1e-9);
}
