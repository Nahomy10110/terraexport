// Eventos de mercado. El motor no se modifica: los eventos cambiarios entran como
// `variacion` en la decisión, y los de flete o arancel se aplican sobre una copia de la muestra.
import type { IsoPais, Muestra } from "@terraexport/motor";
import { redondear } from "@terraexport/motor";
import { esc } from "./formato";

export interface EventoMercado {
    id: string;
    titulo: string;
    descripcion: string;
    icono: string;
    /** Variación del tipo de cambio por país (0.04 = la moneda destino pierde 4 %). */
    cambio?: Partial<Record<IsoPais, number>>;
    /** Factor sobre el flete por kg de un medio. */
    flete?: { medio: "Marítimo" | "Aéreo"; factor: number };
    /** Puntos que se suman al arancel de una combinación país + producto. */
    arancel?: { iso: IsoPais; producto: string; puntos: number };
    /** Texto que se muestra cuando el evento es simulado. */
    simulado: string;
}

export const EVENTOS: EventoMercado[] = [
    {
    id: "ninguno",
    titulo: "Sin evento",
    descripcion: "El mercado se mantiene estable esta ronda.",
    icono: "bi-sun",
    simulado: "",
    },
    {
    id: "yen",
    titulo: "El yen se devalúa 4 %",
    descripcion: "Con un yen más débil, los productos que vienen de fuera se encarecen para los compradores japoneses.",
    icono: "bi-currency-yen",
    cambio: { JPN: 0.04 },
    simulado: "",
    },
    {
    id: "euro",
    titulo: "El euro se fortalece 3 %",
    descripcion: "Los compradores de Países Bajos, Bélgica, Alemania y España pagan menos euros por lo mismo.",
    icono: "bi-currency-euro",
    cambio: { NLD: -0.03, BEL: -0.03, DEU: -0.03, ESP: -0.03 },
    simulado: "",
    },
    {
    id: "peso",
    titulo: "El peso mexicano pierde 6 %",
    descripcion: "Vender en México se vuelve más difícil: el precio en pesos sube para el comprador.",
    icono: "bi-graph-down-arrow",
    cambio: { MEX: 0.06 },
    simulado: "",
    },
    {
    id: "flete-aereo",
    titulo: "Sube 20 % el flete aéreo",
    descripcion: "Las aerolíneas de carga suben tarifas por temporada alta. El marítimo no cambia.",
    icono: "bi-airplane",
    flete: { medio: "Aéreo", factor: 1.2 },
    simulado: "Evento simulado: la demo multiplica el flete aéreo de la muestra por 1,2 solo durante esta ronda.",
    },
    {
    id: "arancel-yuca",
    titulo: "EE. UU. sube 5 puntos el arancel a la yuca",
    descripcion: "Una medida comercial encarece la entrada de yuca fresca a Estados Unidos.",
    icono: "bi-bank",
    arancel: { iso: "USA", producto: "P07", puntos: 0.05 },
    simulado: "Evento simulado: la demo suma 5 puntos al arancel de la muestra solo durante esta ronda.",
    },
];

export function evento(id: string): EventoMercado {
    return EVENTOS.find((e) => e.id === id) ?? (EVENTOS[0] as EventoMercado);
}

export function variacionPara(ev: EventoMercado, iso: IsoPais): number {
    return ev.cambio?.[iso] ?? 0;
}

/** ¿El evento afecta a esta combinación? Sirve para avisar al estudiante. */
export function afecta(ev: EventoMercado, iso: IsoPais, producto?: string, medio?: string): boolean {
    if (ev.cambio && iso in ev.cambio) return true;
    if (ev.flete && (!medio || ev.flete.medio === medio)) return true;
    if (ev.arancel && ev.arancel.iso === iso && (!producto || ev.arancel.producto === producto)) return true;
    return false;
}

/** Copia de la muestra con el evento aplicado (la muestra original no se toca). */
export function datosConEvento(base: Muestra, ev: EventoMercado): Muestra {
    if (!ev.flete && !ev.arancel) return base;
    const { flete, arancel } = ev;
    return {
        ...base,
        rutas: flete
        ? base.rutas.map((r) =>
          r.medio === flete.medio ? { ...r, fletePorKg: redondear(r.fletePorKg * flete.factor) } : r,
        )
        : base.rutas,
        aranceles: arancel
        ? base.aranceles.map((a) =>
            a.iso === arancel.iso && a.producto === arancel.producto
            ? { ...a, pct: redondear(a.pct + arancel.puntos, 4) }
            : a,
        )
        : base.aranceles,
    };
}

/** Aviso del evento vigente; vacío si no hay evento. Se usa en el panel y en la decisión del estudiante. */
export function avisoEvento(id: string, afectaTuDecision = false): string {
    const e = evento(id);
    if (e.id === "ninguno") return "";
    return `<aside class="aviso-evento${afectaTuDecision ? " afecta" : ""}" role="note">
        <i class="bi ${e.icono}" aria-hidden="true"></i>
        <div><strong>Evento de la ronda: ${esc(e.titulo)}</strong><p>${esc(e.descripcion)}</p>
            ${afectaTuDecision ? '<p class="afecta-texto">Este evento afecta tu decisión actual.</p>' : ""}
            ${e.simulado ? `<p class="fuente">${esc(e.simulado)}</p>` : ""}</div>
    </aside>`;
}