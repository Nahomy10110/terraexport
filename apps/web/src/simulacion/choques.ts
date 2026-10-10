// RF-14 choques culturales: banco de escenarios de opción múltiple basados en las dimensiones
// de Hofstede et al. (2010). A cada país le toca el escenario de su dimensión más marcada.
import type { IdProducto, IsoPais, Muestra, PerfilHofstede } from "@terraexport/motor";
import { pais } from "../nucleo/datos";

export interface OpcionChoque {
  texto: string;
  /** Cambio en la demanda base de la ronda: 0.05 = +5 %. */
  impacto: number;
  retro: string;
}

export interface EscenarioChoque {
  id: string;
  dimension: keyof PerfilHofstede;
  etiqueta: string;
  sentido: "alto" | "bajo";
  umbral: number;
  /** {pais} se reemplaza por el nombre del país. */
  situacion: string;
  opciones: OpcionChoque[];
}

const BIEN = 0.05;
const MAL = -0.05;

export const ESCENARIOS: EscenarioChoque[] = [
  {
    id: "colectivismo",
    dimension: "individualismo",
    etiqueta: "Individualismo bajo (cultura colectivista)",
    sentido: "bajo",
    umbral: 35,
    situacion:
      "Antes de hablar de precios, tu socio en {pais} te invita a cenar con su familia y otros socios.",
    opciones: [
      {
        texto: "Aceptar y dedicar tiempo a conocerlos antes de negociar.",
        impacto: BIEN,
        retro: "En culturas colectivistas la relación y la confianza del grupo van antes que el contrato.",
      },
      {
        texto: "Agradecer y proponer mejor una videollamada corta para cerrar el trato.",
        impacto: MAL,
        retro: "Rechazar la invitación se lee como poco interés en la relación, y sin relación no hay trato.",
      },
      {
        texto: "Aceptar, pero llevar el contrato impreso para firmarlo en la cena.",
        impacto: 0,
        retro: "Ir a la cena suma, pero mezclar el contrato con el encuentro personal le resta.",
      },
    ],
  },
  {
    id: "jerarquia",
    dimension: "distanciaPoder",
    etiqueta: "Distancia al poder alta",
    sentido: "alto",
    umbral: 65,
    situacion:
      "En la primera reunión en {pais} llegan la gerente general y tres asistentes. ¿A quién le presentas la propuesta?",
    opciones: [
      {
        texto: "A la gerente general, con trato formal y respetando su cargo.",
        impacto: BIEN,
        retro:
          "Con alta distancia al poder, las decisiones las toma la jerarquía y el respeto a los cargos importa.",
      },
      {
        texto: "Al asistente que parece más abierto, para tener un aliado.",
        impacto: MAL,
        retro: "Saltarse la jerarquía se percibe como falta de respeto hacia quien decide.",
      },
      {
        texto: "A todos por igual, tuteándolos para romper el hielo.",
        impacto: 0,
        retro: "La cercanía es buena intención, pero aquí se espera formalidad.",
      },
    ],
  },
  {
    id: "incertidumbre",
    dimension: "aversionIncertidumbre",
    etiqueta: "Aversión a la incertidumbre alta",
    sentido: "alto",
    umbral: 80,
    situacion:
      "Tu comprador en {pais} pide, antes de firmar, la ficha técnica, los certificados sanitarios y un calendario de entregas por escrito.",
    opciones: [
      {
        texto: "Enviar toda la documentación y un calendario detallado de entregas.",
        impacto: BIEN,
        retro: "Cuando la incertidumbre incomoda, las reglas claras y los documentos generan confianza.",
      },
      {
        texto: "Decirle que confíe: el equipo siempre cumple.",
        impacto: MAL,
        retro: "Sin papeles el comprador percibe riesgo y prefiere a otro proveedor.",
      },
      {
        texto: "Ofrecer un descuento para cerrar hoy mismo.",
        impacto: 0,
        retro: "El descuento no quita la incertidumbre: lo que busca es seguridad.",
      },
    ],
  },
  {
    id: "individualismo",
    dimension: "individualismo",
    etiqueta: "Individualismo alto",
    sentido: "alto",
    umbral: 80,
    situacion: "El comprador en {pais} te da 15 minutos por videollamada y quiere saber qué gana su empresa.",
    opciones: [
      {
        texto: "Ir directo: precio, volumen, plazos y beneficio para su negocio.",
        impacto: BIEN,
        retro: "En culturas individualistas se valoran la claridad, la eficiencia y el beneficio concreto.",
      },
      {
        texto: "Usar la llamada para contar la historia de la finca y de la familia.",
        impacto: MAL,
        retro: "La historia puede servir después; en esos 15 minutos esperaba números y condiciones.",
      },
      {
        texto: "Pedir otra reunión más larga para conocerse mejor.",
        impacto: 0,
        retro: "No está mal, pero desaprovechas la oportunidad que te dio.",
      },
    ],
  },
  {
    id: "largo-plazo",
    dimension: "largoPlazo",
    etiqueta: "Orientación a largo plazo alta",
    sentido: "alto",
    umbral: 80,
    situacion:
      "Tu cliente en {pais} propone un contrato por tres años con un precio un poco más bajo el primer año.",
    opciones: [
      {
        texto: "Analizarlo: una relación estable compensa un margen menor al inicio.",
        impacto: BIEN,
        retro: "Con alta orientación a largo plazo se valoran la constancia y las relaciones duraderas.",
      },
      {
        texto: "Rechazarlo y exigir el precio más alto desde ya.",
        impacto: MAL,
        retro: "Priorizar la ganancia inmediata choca con una cultura que piensa en años, no en meses.",
      },
      {
        texto: "Firmar solo por seis meses y ver qué pasa.",
        impacto: 0,
        retro: "Es prudente, pero transmite poco compromiso con la relación.",
      },
    ],
  },
  {
    id: "sostenibilidad",
    dimension: "masculinidad",
    etiqueta: "Masculinidad baja (cultura orientada al bienestar)",
    sentido: "bajo",
    umbral: 25,
    situacion:
      "El comprador en {pais} pregunta por las condiciones de los trabajadores y el impacto ambiental de tu producto.",
    opciones: [
      {
        texto: "Explicar tus prácticas sostenibles y buscar un acuerdo que convenga a ambos.",
        impacto: BIEN,
        retro: "En estas culturas se valoran la calidad de vida, el consenso y la sostenibilidad.",
      },
      {
        texto: "Cambiar el tema: tu precio es el más bajo del mercado.",
        impacto: MAL,
        retro: "Competir solo por precio no responde lo que le importa al comprador.",
      },
      {
        texto: "Prometer certificaciones que todavía no tienen.",
        impacto: MAL,
        retro: "Prometer lo que no tienes rompe la confianza en cuanto se descubre.",
      },
    ],
  },
];

/** Escenario de la dimensión más marcada del país, o null si ninguna supera su umbral. */
export function escenarioPara(iso: IsoPais): EscenarioChoque | null {
  const h = pais(iso).hofstede;
  let mejor: EscenarioChoque | null = null;
  let intensidad = -1;
  for (const e of ESCENARIOS) {
    const valor = h[e.dimension];
    const d = e.sentido === "alto" ? valor - e.umbral : e.umbral - valor;
    if (d >= 0 && d > intensidad) {
      mejor = e;
      intensidad = d;
    }
  }
  return mejor;
}

export function situacion(e: EscenarioChoque, iso: IsoPais): string {
  return e.situacion.replace("{pais}", pais(iso).nombre);
}

/** Copia de la muestra con la demanda de una combinación ajustada por el choque cultural. */
export function datosConChoque(base: Muestra, iso: IsoPais, producto: IdProducto, impacto: number): Muestra {
  if (!impacto) return base;
  return {
    ...base,
    demanda: base.demanda.map((d) =>
      d.iso === iso && d.producto === producto
        ? { ...d, demandaBase: Math.round(d.demandaBase * (1 + impacto)) }
        : d,
    ),
  };
}
