// Simulación de una ronda para la demo: el equipo del estudiante usa su decisión y los
// demás equipos usan decisiones de los casos de la hoja de cálculo. Todo se calcula con el motor.
import { calcular, type Decision, type Muestra } from "@terraexport/motor";
import { D } from "../nucleo/datos";
import { estado, capitalDe, type Partida, type ResultadoEquipo } from "./estado";
import { datosConChoque, escenarioPara } from "./choques";
import { datosConEvento, evento, variacionPara } from "./eventos";

function decisionRival(p: Partida, indice: number): Decision | null {
  const disponibles = D.casos.filter(
    (c) => p.paises.includes(c.decision.iso) && p.productos.includes(c.decision.producto),
  );
  const lista = disponibles.length ? disponibles : D.casos;
  const caso = lista[(indice + p.ronda - 1) % lista.length];
  return caso ? { ...caso.decision } : null;
}

/** Decisión que tomará cada equipo en la ronda actual. */
export function decisionDe(p: Partida, equipo: string): Decision | null {
  const s = estado.estudiante;
  if (s && s.equipo === equipo) return s.decision ? { ...s.decision } : null;
  return decisionRival(p, p.equipos.indexOf(equipo));
}

/** Impacto del choque cultural (RF-14): solo aplica al equipo del estudiante si respondió. */
export function impactoChoque(equipo: string, iso: string): number {
  const s = estado.estudiante;
  if (!s || s.equipo !== equipo || s.choqueRespondido === null) return 0;
  return escenarioPara(iso)?.opciones[s.choqueRespondido]?.impacto ?? 0;
}

function conChoque(datos: Muestra, equipo: string, d: Decision): Muestra {
  return datosConChoque(datos, d.iso, d.producto, impactoChoque(equipo, d.iso));
}

/** Cierra la ronda actual: calcula a todos los equipos y actualiza capitales. Idempotente. */
export function cerrarRonda(p: Partida): void {
  if (p.historial.some((h) => h.ronda === p.ronda)) {
    p.rondaEstado = "cerrada";
    return;
  }
  const ev = evento(p.evento);
  const datos = datosConEvento(D, ev);
  const resultados: ResultadoEquipo[] = p.equipos.map((equipo) => {
    const capitalInicial = capitalDe(p, equipo);
    const base = decisionDe(p, equipo);
    const vacio: ResultadoEquipo = {
      equipo,
      decision: base,
      exporto: false,
      capitalInicial,
      costoTotal: 0,
      ventas: 0,
      utilidad: 0,
      capitalFinal: capitalInicial,
      detalle: null,
    };
    if (!base) return vacio;
    const decision: Decision = { ...base, capital: capitalInicial, variacion: variacionPara(ev, base.iso) };
    const r = calcular(conChoque(datos, equipo, decision), decision);
    if (!r.ok || r.costoTotal > capitalInicial) return { ...vacio, decision };
    return {
      equipo,
      decision,
      exporto: true,
      capitalInicial,
      costoTotal: r.costoTotal,
      ventas: r.ventas,
      utilidad: r.utilidad,
      capitalFinal: r.capitalFinal,
      detalle: r,
    };
  });
  for (const r of resultados) p.capitales[r.equipo] = r.capitalFinal;
  p.historial.push({ ronda: p.ronda, evento: p.evento, resultados });
  p.rondaEstado = "cerrada";
}

/** Pasa a la siguiente ronda (queda en espera para que la docente elija evento y la inicie). */
export function siguienteRonda(p: Partida): boolean {
  if (p.ronda >= p.rondas) return false;
  p.ronda++;
  p.rondaEstado = "espera";
  p.evento = "ninguno";
  p.restante = p.duracion * 60;
  if (estado.estudiante) {
    estado.estudiante.decision = null;
    estado.estudiante.choqueRespondido = null;
  }
  return true;
}

/** Resultado de un equipo en la ronda indicada (o null si la ronda no se ha cerrado). */
export function resultadoDe(p: Partida, equipo: string, ronda = p.ronda): ResultadoEquipo | null {
  return p.historial.find((h) => h.ronda === ronda)?.resultados.find((r) => r.equipo === equipo) ?? null;
}

export interface FilaRanking {
  equipo: string;
  capital: number;
  posicion: number;
  /** Posiciones ganadas (+) o perdidas (-) respecto a la ronda anterior. */
  cambio: number;
  ultimaUtilidad: number | null;
}

/** Ranking por capital actual (RF-12). */
export function ranking(p: Partida): FilaRanking[] {
  const ultima = p.historial.at(-1);
  const anterior = p.historial.at(-2);
  const ordenar = (capital: (e: string) => number): string[] =>
    [...p.equipos].sort((a, b) => capital(b) - capital(a));
  const actual = ordenar((e) => capitalDe(p, e));
  const previo = anterior
    ? ordenar((e) => anterior.resultados.find((r) => r.equipo === e)?.capitalFinal ?? p.capital)
    : actual;
  return actual.map((equipo, i) => ({
    equipo,
    capital: capitalDe(p, equipo),
    posicion: i + 1,
    cambio: anterior ? previo.indexOf(equipo) - i : 0,
    ultimaUtilidad: ultima?.resultados.find((r) => r.equipo === equipo)?.utilidad ?? null,
  }));
}
