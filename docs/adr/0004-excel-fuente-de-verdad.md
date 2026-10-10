# ADR 0004: La hoja de cálculo es la fuente de verdad de datos y reglas

- Estado: aceptada
- Fecha: 2026-10-09

## Contexto

El alcance promete una hoja de cálculo verificada con diez casos y un prototipo cuyos montos
coinciden con ella (RNF-05). La docente y el equipo revisan las reglas en Excel, no en código.

## Decisión

1. Los datos de la muestra y las fórmulas se definen primero en `hoja-calculo/TerraExport_Modelo_Calculo.xlsx`.
2. `scripts/excel_a_datos.py` genera `datos/muestra.json`, que incluye los resultados esperados de los 10 casos.
3. `packages/motor/test/casos-excel.test.ts` exige que el motor reproduzca esos resultados campo por campo.
4. El motor redondea a 2 decimales en cada paso, igual que la columna correspondiente en Excel.

## Consecuencias

- Un cambio de regla toca dos lugares (Excel y motor), pero la prueba impide que queden distintos.
- `datos/muestra.json` no se edita a mano; se regenera.
- El Excel y el JSON se suben juntos en el mismo commit.
