// Estado en memoria de la demo. En el producto real este estado viviría en el servidor
// (partida, ronda, equipos) y llegaría por WebSocket; aquí se simula en el navegador.
// Al recargar la página se pierde: es una demo.
import type { Calculo, Decision, IdProducto, IsoPais } from "@terraexport/motor";
import { D } from "./datos";

export type EstadoRonda = "espera" | "activa" | "pausada" | "cerrada";

/** Resultado de un equipo en una ronda cerrada. */
export interface ResultadoEquipo {
  equipo: string;
  /** null si el equipo no registró decisión */
  decision: Decision | null;
  /** false si la decisión superaba el capital o faltaban datos: el equipo no exportó. */
  exporto: boolean;
  capitalInicial: number;
  costoTotal: number;
  ventas: number;
  utilidad: number;
  capitalFinal: number;
  detalle: Extract<Calculo, { ok: true }> | null;
}

export interface RondaJugada {
  ronda: number;
  evento: string;
  resultados: ResultadoEquipo[];
}

export interface Partida {
  codigo: string;
  rondas: number;
  duracion: number;
  capital: number;
  paises: IsoPais[];
  productos: IdProducto[];
  equipos: string[];
  /** alias → equipo (RF-04) */
  integrantes: Record<string, string>;
  ronda: number;
  rondaEstado: EstadoRonda;
  restante: number;
  /** id del evento de mercado de la ronda actual (RF-13) */
  evento: string;
  /** capital actual de cada equipo */
  capitales: Record<string, number>;
  historial: RondaJugada[];
}

export interface SesionEstudiante {
  alias: string;
  equipo: string;
  decision: Decision | null;
  /** respuesta elegida en el choque cultural de la ronda (RF-14) */
  choqueRespondido: number | null;
}

export const EQUIPOS = ["Ceiba", "Guanacaste", "Cenízaro", "Pochote", "Malinche", "Roble Sabana"];
export const EQUIPO_ESTUDIANTE = "Guanacaste";
export const CODIGO_DEMO = "TRX4821";
/** Alias de estudiantes "conectados" que simula la demo. */
export const ALIAS_DEMO = ["Sofi", "Dani", "Mau", "Vale", "Andrés", "Fer", "Majo", "Luis", "Cami", "Joss", "Naty", "Pablo"];

export const estado = {
  asistente: {
    paso: 1,
    rondas: D.parametros.rondas,
    duracion: D.parametros.duracionMin,
    capital: D.parametros.capitalInicial,
    paises: D.paises.map((p) => p.iso),
    productos: D.productos.map((p) => p.id),
  },
  partida: null as Partida | null,
  estudiante: null as SesionEstudiante | null,
  reloj: null as number | null,
};

export function nuevaPartida(cfg: {
  codigo: string;
  rondas: number;
  duracion: number;
  capital: number;
  paises: IsoPais[];
  productos: IdProducto[];
  equipos: string[];
}): Partida {
  return {
    ...cfg,
    integrantes: {},
    ronda: 1,
    rondaEstado: "espera",
    restante: cfg.duracion * 60,
    evento: "ninguno",
    capitales: Object.fromEntries(cfg.equipos.map((e) => [e, cfg.capital])),
    historial: [],
  };
}

export function partidaDemo(): Partida {
  return nuevaPartida({
    codigo: CODIGO_DEMO,
    rondas: D.parametros.rondas,
    duracion: D.parametros.duracionMin,
    capital: D.parametros.capitalInicial,
    paises: D.paises.map((p) => p.iso),
    productos: D.productos.map((p) => p.id),
    equipos: EQUIPOS.slice(0, 4),
  });
}

export function partidaActual(): Partida {
  return (estado.partida ??= partidaDemo());
}

/** Capital disponible de un equipo en la ronda actual. */
export function capitalDe(p: Partida, equipo: string): number {
  return p.capitales[equipo] ?? p.capital;
}

/** Garantiza que el equipo exista en la partida (por ejemplo si el estudiante entra antes que la docente arme equipos). */
export function asegurarEquipo(p: Partida, equipo: string): void {
  if (!p.equipos.includes(equipo)) {
    p.equipos.push(equipo);
    p.capitales[equipo] = p.capital;
  }
}

export function detenerReloj(): void {
  if (estado.reloj !== null) {
    clearInterval(estado.reloj);
    estado.reloj = null;
  }
}