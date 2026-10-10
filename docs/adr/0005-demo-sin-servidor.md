# ADR 0005: La entrega final es una demo interactiva sin servidor

- Estado: aceptada
- Fecha: 2026-10-09

## Contexto

El alcance del proyecto excluye la implementación en código, la base de datos operativa y el despliegue
productivo. Para la presentación final el equipo quiere mostrar pantallas interactivas que se sientan
reales.

## Decisión

1. Se construye solo `apps/web`: pantallas navegables que corren completas en el navegador.
2. Todo lo que en el producto real ocurriría en el servidor se **simula** en la pantalla: equipos que
   se conectan, cierre de ronda, eventos de mercado, ranking, reporte final.
3. Los montos sí se calculan con `packages/motor`, para que coincidan con la hoja verificada (RNF-05).
4. No se agregan `apps/api`, base de datos, autenticación real ni WebSocket.
5. La demo se publica como sitio estático en GitHub Pages para presentarla desde cualquier computadora.

## Consecuencias

- Cada pantalla nueva del Sprint 2 se construye como demo: datos de la muestra + estado en memoria.
- Al recargar la página la demo vuelve al inicio; eso es aceptable para una presentación.
- Las simulaciones se marcan en pantalla con una nota "Prototipo" para no confundir a la audiencia.
