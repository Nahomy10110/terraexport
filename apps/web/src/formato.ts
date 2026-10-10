const usdFmt = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
const numFmt = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 4 });
const entFmt = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 });

export const usd = (x: number): string => usdFmt.format(x);
export const num = (x: number): string => numFmt.format(x);
export const ent = (x: number): string => entFmt.format(x);
export const pct = (x: number, decimales = 1): string =>
  `${(x * 100).toLocaleString("es-CR", { maximumFractionDigits: decimales })} %`;
export const mmss = (s: number): string =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** Escapa texto antes de insertarlo en HTML (alias y otros datos escritos por usuarios). */
export function esc(texto: string | number): string {
  return String(texto).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}
