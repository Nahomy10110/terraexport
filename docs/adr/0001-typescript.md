# ADR 0001: TypeScript como lenguaje del proyecto

- Estado: aceptada
- Fecha: 2026-10-09

## Contexto

El motor de cálculo debe dar los mismos montos que la hoja verificada (RNF-05) y debe correr en el
navegador (estimación mientras el equipo decide) y en el servidor (resultado oficial al cerrar la
ronda). Se evaluaron TypeScript, PHP/Laravel, Java/Spring, C#/.NET y Python (ver `docs/arquitectura.md`).

## Decisión

Usar TypeScript en todo el proyecto: dominio, web y, cuando exista, servidor.

## Consecuencias

- Un solo motor, probado una sola vez contra el Excel.
- El equipo trabaja en un solo lenguaje y un solo gestor de paquetes (npm).
- Quien no conozca TypeScript necesita aprender tipos básicos; los errores de tipo aparecen antes de ejecutar.
