# ADR 0002: Monolito modular de tres capas en un monorepo

- Estado: aceptada
- Fecha: 2026-10-09

## Contexto

Equipo de cinco estudiantes, un solo dominio (simulación de exportación) y presupuesto de nube
de US$ 0–25 al mes (Anexo A). El documento pide un diseño en tres capas con despliegue en la nube.

## Decisión

Un monolito modular con tres capas (presentación, lógica, datos) y el dominio aislado en su propio
paquete, todo en un repositorio con npm workspaces: `packages/motor`, `apps/web` y, más adelante, `apps/api`.

## Alternativas descartadas

- Microservicios: más despliegues, más costos y fallas de red sin ningún beneficio a esta escala.
- Repositorios separados para web y servidor: duplicaría el motor o exigiría publicar un paquete.

## Consecuencias

- Un solo `npm install`, un solo flujo de CI y una sola versión por entrega.
- Si el producto crece, un módulo puede separarse después porque las dependencias ya están ordenadas.
