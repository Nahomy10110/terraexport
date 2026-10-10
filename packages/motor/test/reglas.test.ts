import { describe, expect, it } from "vitest";
import muestra from "../../../datos/muestra.json";
import { calcular, redondear, type Decision, type Muestra } from "../src";

const datos = muestra as Muestra;
const base: Decision = {
  iso: "USA",
  producto: "P01",
  medio: "Marítimo",
  volumen: 2000,
  precio: 14,
  equipos: 2,
  variacion: 0,
  capital: 50000,
};

describe("redondear", () => {
  it("redondea mitades lejos de cero como Excel", () => {
    expect(redondear(1.005)).toBe(1.01);
    expect(redondear(-2.345)).toBe(-2.35);
    expect(redondear(2.5, 0)).toBe(3);
  });
});

describe("reglas de negocio", () => {
  it("nunca vende más de lo enviado", () => {
    const r = calcular(datos, { ...base, precio: 1 });
    expect(r.ok && r.unidadesVendidas).toBe(2000);
  });

  it("subir el precio por encima de la referencia reduce las unidades vendidas", () => {
    const barato = calcular(datos, { ...base, volumen: 5000, precio: 15 });
    const caro = calcular(datos, { ...base, volumen: 5000, precio: 18 });
    expect(barato.ok && caro.ok).toBe(true);
    if (barato.ok && caro.ok) expect(caro.unidadesVendidas).toBeLessThan(barato.unidadesVendidas);
  });

  it("más competidores en el mismo mercado reducen la demanda del equipo", () => {
    const solo = calcular(datos, { ...base, volumen: 5000, equipos: 1 });
    const tres = calcular(datos, { ...base, volumen: 5000, equipos: 3 });
    if (solo.ok && tres.ok) expect(tres.unidadesVendidas).toBeLessThan(solo.unidadesVendidas);
  });

  it("una depreciación de la moneda destino encarece el producto y baja la demanda", () => {
    const normal = calcular(datos, {
      ...base,
      iso: "JPN",
      producto: "P04",
      medio: "Aéreo",
      volumen: 500,
      precio: 210,
    });
    const shock = calcular(datos, {
      ...base,
      iso: "JPN",
      producto: "P04",
      medio: "Aéreo",
      volumen: 500,
      precio: 210,
      variacion: 0.04,
    });
    if (normal.ok && shock.ok) expect(shock.unidadesVendidas).toBeLessThan(normal.unidadesVendidas);
  });

  it("marca como inválida una decisión que supera el capital", () => {
    const r = calcular(datos, { ...base, volumen: 10000 });
    expect(r.ok && r.valida).toBe("No: excede el capital");
  });

  it("informa qué datos faltan cuando la combinación no está en la muestra", () => {
    const r = calcular(datos, { ...base, iso: "BEL", producto: "P01" });
    expect(r).toEqual({ ok: false, faltantes: ["arancel", "demanda de mercado"] });
  });
});
