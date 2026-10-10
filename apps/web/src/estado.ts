// Estado en memoria del prototipo. En la arquitectura de referencia este estado
// vive en el servidor (partida, ronda, equipos) y llega por WebSocket.
import type { Decision, IdProducto, IsoPais } from "@terraexport/motor";
import { D } from "./datos";

export type EstadoRonda = "espera" | "activa" | "pausada" | "cerrada";

export interface Partida {
  codigo: string;
  rondas: number;
  duracion: number;
  capital: number;
  paises: IsoPais[];
  productos: IdProducto[];
  equipos: string[];
  ronda: number;
  rondaEstado: EstadoRonda;
  restante: number;
}

export interface SesionEstudiante {
  alias: string;
  equipo: string;
  capital: number;
  decision: Decision | null;
}

export const EQUIPOS = ["Ceiba", "Guanacaste", "Cenízaro", "Pochote", "Malinche", "Roble Sabana"];
export const CODIGO_DEMO = "TRX4821";

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

export function partidaDemo(): Partida {
  return {
    codigo: CODIGO_DEMO,
    rondas: D.parametros.rondas,
    duracion: D.parametros.duracionMin,
    capital: D.parametros.capitalInicial,
    paises: D.paises.map((p) => p.iso),
    productos: D.productos.map((p) => p.id),
    equipos: EQUIPOS.slice(0, 4),
    ronda: 1,
    rondaEstado: "espera",
    restante: D.parametros.duracionMin * 60,
  };
}

export function partidaActual(): Partida {
  return (estado.partida ??= partidaDemo());
}

export function detenerReloj(): void {
  if (estado.reloj !== null) {
    clearInterval(estado.reloj);
    estado.reloj = null;
  }
}
