# ADR 0003: Motor de cálculo como funciones puras

- Estado: aceptada
- Fecha: 2026-10-09

## Contexto

Las reglas de negocio (FOB, flete, seguro, CIF, arancel, ventas, utilidad y explicación) son el
corazón del producto y su mayor riesgo, según la estructura de costos del Anexo A.

## Decisión

El paquete `@terraexport/motor` solo contiene funciones puras: reciben la muestra y la decisión y
devuelven un resultado. No usan red, disco, base de datos, fecha actual ni números aleatorios.
Los eventos de mercado (RF-13) entran como parámetros (`variacion`), no se generan dentro del motor.

## Consecuencias

- Las pruebas corren en milisegundos y siempre dan el mismo resultado.
- El mismo código sirve en el navegador, en el servidor y en las pruebas.
- Lo que tenga efectos (guardar, notificar, sortear un evento) vive en la capa de aplicación.
