# TerraExport

Plataforma web de simulación de comercio internacional para estudiantes de secundaria y universidad.
Proyecto final del curso **EIF409 Aplicaciones Informáticas Globales** (UNA, Sede Regional Chorotega,
Campus Liberia, II Ciclo 2026). Docente: MBA. Ariela Moraga Marchena.

## Alcance: demo, no juego

TerraExport **no se programa como juego real**. El entregable final es una **demo interactiva**: pantallas
navegables que muestran cómo funcionaría la plataforma, con montos reales calculados con las fórmulas de
la hoja de cálculo. No hay servidor, base de datos, cuentas de usuario ni partidas en tiempo real: todo
corre en el navegador y lo que "pasa en clase" (equipos que se conectan, cierre de ronda) está simulado.

Este repositorio contiene el **Incremento 1** (Avance II, 16/10/2026) y es la base para completar las
pantallas de la presentación final. El porqué de cada decisión está en
[`docs/arquitectura.md`](docs/arquitectura.md) y en [`docs/adr/`](docs/adr).

## Estructura

```
terraexport/
├── packages/motor/        Reglas de negocio en TypeScript puro (RF-09, RF-10, RF-11) + pruebas
├── apps/web/              Prototipo navegable (Vite + TypeScript)
├── datos/muestra.json     Datos generados desde el Excel. No editar a mano.
├── hoja-calculo/          TerraExport_Modelo_Calculo.xlsx: datos verificados, 10 casos, backlog
├── scripts/               excel_a_datos.py: Excel → datos/muestra.json
├── docs/                  Arquitectura, ADR, estado de los datos, trazabilidad, diagramas, entregas
└── .github/               CI, publicación en GitHub Pages, plantillas de PR e historias
```

## Requisitos

- [Node.js 22](https://nodejs.org) (LTS). Verifique con `node --version`.
- [GitHub Desktop](https://desktop.github.com).
- Python 3 con `openpyxl`, solo para regenerar los datos desde el Excel (`pip install openpyxl`).
- Editor recomendado: VS Code. Al abrir la carpeta sugiere las extensiones del proyecto.

## Primeros pasos

```bash
npm install        # una sola vez, instala todo el monorepo
npm run dev        # abre la demo en http://localhost:5173
npm test           # 18 pruebas: los 10 casos del Excel + reglas de negocio
npm run check      # lo mismo que corre la integración continua
```

En la demo, "Iniciar sesión" lleva a tres opciones (docente, estudiante, mercados); como estudiante use el código `TRX 4821`. Para reproducir el ejemplo del
documento: Japón, café tostado, aéreo, 100 unidades, USD 210.

## Flujo cuando cambian datos o reglas

1. Editar `hoja-calculo/TerraExport_Modelo_Calculo.xlsx` y **guardar en Excel**.
2. `python scripts/excel_a_datos.py`
3. Si cambió una fórmula, cambiar la misma línea en `packages/motor/src/calculo.ts`.
4. `npm test` debe pasar. Si no pasa, el Excel y el motor no coinciden.
5. Hacer commit del Excel y de `datos/muestra.json` juntos.

El estado de cada dato (verificado, derivado, estimado o pendiente) está en
[`docs/datos.md`](docs/datos.md) y en las columnas Estado del Excel.

## Trabajo en equipo con GitHub Desktop

- **`main` siempre funciona.** Nadie hace commit directo en `main`.
- **Una rama por requerimiento.** Los nombres están en la hoja Backlog del Excel, por ejemplo
  `feature/rf-08-decision`. En GitHub Desktop: *Current Branch → New Branch*.
- **Commits pequeños y claros:** `RF-06: muestra la fecha de corte del arancel`.
- **Pull request para todo.** *Push origin → Create Pull Request*. La plantilla trae la Definición de
  Terminado. Otro integrante lo revisa y aprueba, y la integración continua debe salir en verde.
- **Excel y Word no se fusionan.** Avise al equipo antes de editarlos y haga *Fetch origin* primero.

Configuración recomendada en GitHub (*Settings → Branches → Add rule* para `main`): exigir pull
request, una aprobación y que el flujo **CI** pase.

## Publicación de la demo

Al unir cambios a `main`, el flujo `pages.yml` prueba, compila y publica en GitHub Pages.
Actívelo una vez en *Settings → Pages → Source: GitHub Actions*. En una cuenta gratuita el
repositorio debe ser público para usar Pages.

## Versiones por entrega

| Etiqueta | Entrega |
|---|---|
| `v0.1.0` | Avance I (02/10/2026) |
| `v0.2.0` | Avance II: Incremento 1 + Sprint Backlog 2 (16/10/2026) |
| `v1.0.0` | Presentación final (06 o 13/11/2026) |

## Equipo

| Rol | Integrante |
|---|---|
| Product Owner | Luciana Chacón Castillo |
| Scrum Master | Nahomy González Jiménez |
| Desarrolladores | Los cinco integrantes |
| Cliente | MBA. Ariela Moraga Marchena |
