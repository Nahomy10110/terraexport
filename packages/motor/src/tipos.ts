// Tipos del dominio. Reflejan las tablas del diagrama entidad-relación
// (pais, producto, ruta, arancel, demanda_mercado, fuente_dato).

export type IsoPais = string; // ISO 3166-1 alfa-3, por ejemplo "JPN"
export type IdProducto = string; // "P01" ... "P15"
export type MedioTransporte = "Marítimo" | "Aéreo";

export interface Fuente {
  nombre: string;
  url: string;
  uso: string;
}

export interface PerfilHofstede {
  distanciaPoder: number;
  individualismo: number;
  masculinidad: number;
  aversionIncertidumbre: number;
  largoPlazo: number;
  indulgencia: number;
}

export interface Pais {
  iso: IsoPais;
  nombre: string;
  moneda: string;
  codigoMoneda: string;
  unidadesPorUsd: number;
  fuenteTc: string;
  fechaCorte: string;
  hofstede: PerfilHofstede;
  fuenteHofstede: string;
  estado: string;
}

export interface Producto {
  id: IdProducto;
  nombre: string;
  codigoSa: string;
  unidad: string;
  pesoKg: number;
  costoFob: number;
  fuente: string;
  estado: string;
  nota: string;
}

export interface Ruta {
  iso: IsoPais;
  medio: MedioTransporte;
  fletePorKg: number;
  pctSeguro: number;
  diasTransito: number;
  fuente: string;
  estado: string;
  nota: string;
}

export interface Arancel {
  iso: IsoPais;
  producto: IdProducto;
  pct: number;
  fuente: string;
  fechaCorte: string;
  estado: string;
  nota: string;
}

export interface Demanda {
  iso: IsoPais;
  producto: IdProducto;
  precioReferencia: number;
  demandaBase: number;
  fuente: string;
  estado: string;
}

export interface Parametros {
  capitalInicial: number;
  elasticidad: number;
  rondas: number;
  duracionMin: number;
  origen: string;
}

/** Decisión de un equipo en una ronda (RF-08). */
export interface Decision {
  iso: IsoPais;
  producto: IdProducto;
  medio: MedioTransporte;
  volumen: number;
  precio: number;
  /** Equipos que eligieron el mismo mercado y producto en la ronda (incluye al propio). */
  equipos: number;
  /** Variación del tipo de cambio por un evento de mercado: 0.04 = la moneda destino pierde 4 %. */
  variacion: number;
  capital: number;
}

export interface Resultado {
  valorFob: number;
  flete: number;
  seguro: number;
  valorCif: number;
  arancel: number;
  costoTotal: number;
  tcAplicado: number;
  costoLocal: number;
  indicePrecio: number;
  unidadesVendidas: number;
  ventas: number;
  utilidad: number;
  capitalFinal: number;
  valida: "Sí" | "No: excede el capital";
  explicacion: string;
}

export interface CasoVerificacion {
  caso: string;
  decision: Decision;
  esperado: Resultado;
}

/** Contenido de datos/muestra.json, generado desde la hoja de cálculo. */
export interface Muestra {
  generado: string;
  parametros: Parametros;
  fuentes: Record<string, Fuente>;
  paises: Pais[];
  productos: Producto[];
  rutas: Ruta[];
  aranceles: Arancel[];
  demanda: Demanda[];
  casos: CasoVerificacion[];
}
