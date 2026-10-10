// Pruebas de aceptación: los 10 casos de la hoja "Casos" son la referencia (RNF-05).
// Si alguien cambia una fórmula en el Excel o en el motor y no en el otro, esta prueba falla.
import { describe, expect, it } from "vitest";
import muestra from "../../../datos/muestra.json";
import { calcular, type Muestra } from "../src";

const datos = muestra as Muestra;

describe("motor vs. hoja de cálculo verificada", () => {
  it("la muestra trae los 10 casos", () => {
    expect(datos.casos).toHaveLength(10);
  });

  for (const caso of datos.casos) {
    it(`${caso.caso}: ${caso.decision.iso} / ${caso.decision.producto} coincide en los 15 resultados`, () => {
      const r = calcular(datos, caso.decision);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      const { ok: _ok, condiciones: _c, ...resultado } = r;
      expect(resultado).toEqual(caso.esperado);
    });
  }
});
