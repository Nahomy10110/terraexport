# Trazabilidad del Sprint 1

Cada requerimiento del Sprint Backlog 1 apunta a la pantalla del prototipo y a la hoja de cálculo
que lo evidencian (requisito del alcance: "trazables hacia los diagramas y el prototipo").

| RF | Pantalla (ruta y archivo) | Hoja de cálculo | Diagrama |
|---|---|---|---|
| RF-02 | `#/estudiante`, `#/estudiante/espera` (`vistas/estudiante.ts`) | — | Casos de uso, secuencia (pasos 3–5) |
| RF-03 | `#/docente/crear`, `#/docente/codigo` (`vistas/docente.ts`) | Parametros | Casos de uso, secuencia (pasos 1–2) |
| RF-05 | `#/docente/panel` (`vistas/docente.ts`) | Parametros (duración) | Secuencia (pasos 6, 14) |
| RF-06 | `#/pais/<ISO>` y panel de `#/estudiante/decision` (`vistas/ficha.ts`) | Paises, Rutas, Aranceles, Fuentes | ER: pais, tipo_cambio, ruta, arancel, fuente_dato |
| RF-08 | `#/estudiante/decision` (`vistas/estudiante.ts`) | Casos (A–I) | Secuencia (pasos 8–13) |
| RF-09 | `#/estudiante/resultados`; `packages/motor/src/calculo.ts` | Casos (R–Y) | Secuencia (pasos 16–19) |
| RF-10 | `#/estudiante/resultados`; `packages/motor/src/calculo.ts` | Casos (Z–AD), Sensibilidad | Secuencia (pasos 19–20) |
| RF-11 | `#/estudiante/resultados`; `packages/motor/src/explicacion.ts` | Casos (AF) | Secuencia (pasos 24–25) |
| RNF-05 | `#/verificacion`; `packages/motor/test/casos-excel.test.ts` | Casos | — |
| RNF-06 | Fuente y fecha de corte en cada ficha | Fuentes | ER: fuente_dato |

## Cambios al modelo que salieron al construir la hoja

- **Producto necesita `peso_unitario_kg`.** El flete se cobra por kilogramo; sin el peso, un saco de
  café de 46 kg pagaría lo mismo que una caja de mango de 4 kg. Hay que agregarlo a la clase
  `Producto` y a la tabla `producto` del ER.
- **Regla de ventas (RF-10).** El documento dice "según el precio fijado y la competencia" pero no
  define la regla. La hoja usa:
  `unidades vendidas = MIN(volumen, ENTERO((demanda base / equipos en el mercado) × índice de precio^(−elasticidad)))`.
  Esa regla debe quedar escrita en el documento como regla de negocio.


# Pantallas demo del Sprint 2 (presentación final)

Todas son simuladas en el navegador (ADR 0005). Sugerencia de pantalla para cada requerimiento:

| RF | Pantalla demo | Qué se simula |
|---|---|---|
| RF-01 | `#/docente/login` | Inicio de sesión con cualquier correo; no hay cuentas reales |
| RF-04 | `#/docente/equipos` | Arrastrar alias entre equipos o botón "Repartir automáticamente" |
| RF-07 | `#/producto/<id>` | Ficha con código SA, unidad, peso, costo FOB y fuente |
| RF-12 | `#/ranking` | Tabla ordenada por capital con los equipos de la ronda |
| RF-13 | Aviso en `#/estudiante/decision` | Evento "El yen se devalúa 4 %" que cambia el tipo de cambio (variable `variacion` del motor) |
| RF-14 | `#/estudiante/choque` | Pregunta de opción múltiple basada en Hofstede con retroalimentación |
| RF-15 | `#/docente/reporte` | Historial de rondas y botón "Imprimir reporte" |
| RF-16 | `#/demo` | Recorrido guiado para la presentación, de punta a punta |
