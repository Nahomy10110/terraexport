# Contexto para Claude: proyecto TerraExport

> **Para el equipo:** este archivo es el contexto que hay que darle a Claude antes de pedirle código.
> - En **Claude Code** se lee solo (está en la raíz del repositorio).
> - En **claude.ai**, adjunte este archivo (o péguelo completo) al inicio del chat, junto con los
>   archivos que se van a tocar, y luego use la plantilla de pedido del final.

---

## 1. Qué es el proyecto

TerraExport es el proyecto final del curso EIF409 Aplicaciones Informáticas Globales (UNA, Campus Liberia,
II Ciclo 2026). Es una plataforma web de simulación de comercio internacional para colegios y
universidades: equipos de estudiantes manejan una exportadora costarricense virtual y en cada ronda
deciden producto, mercado, transporte, volumen y precio. Al cerrar la ronda ven su costo, sus ventas, su
utilidad y una explicación de por qué ganaron o perdieron.

## 2. Alcance: es una DEMO, no el juego

**No se está programando el juego real.** El entregable es una **demo interactiva** para la
presentación final: pantallas navegables que se ven y se sienten reales.

- Todo corre en el navegador. **No hay** servidor, API, base de datos, autenticación real, WebSocket
  ni almacenamiento persistente.
- Lo que en el producto real pasaría en el servidor (equipos que se conectan, cierre de ronda,
  eventos, ranking) **se simula** en la pantalla con datos de la muestra y estado en memoria.
- Cada simulación se indica con un párrafo `<p class="nota-proto">Prototipo: …</p>` para no engañar a
  la audiencia.
- Al recargar la página la demo puede volver al inicio. Eso es aceptable.
- **Sí** se calculan los montos de verdad con `@terraexport/motor`, porque deben coincidir con la hoja
  de cálculo verificada (requisito RNF-05).

Si un pedido parece requerir un servidor o base de datos, la respuesta correcta es **simularlo en el
navegador**, no agregar backend.

## 3. Tecnología (no cambiar sin acuerdo del equipo)

- TypeScript estricto (`strict`, `noUncheckedIndexedAccess`).
- Vite 5 para la web. **Sin frameworks de UI**: nada de React, Vue, Tailwind ni el CSS de Bootstrap.
  Las pantallas son funciones que escriben HTML en un contenedor.
- **Bootstrap Icons** (paquete `bootstrap-icons`, ya instalado e importado en `main.ts`) para todos los
  íconos: `<i class="bi bi-globe2" aria-hidden="true"></i>`. Catálogo: https://icons.getbootstrap.com
- Vitest para pruebas. Prettier para formato.
- Monorepo con npm workspaces. Node 22.
- **No agregar dependencias nuevas** sin aprobación del equipo.

## 4. Estructura

```
packages/motor/            Reglas de negocio puras (NO tocar salvo que cambie una fórmula en el Excel)
  src/calculo.ts           calcular(datos, decision) → resultado
  src/tipos.ts             Tipos: Muestra, Pais, Producto, Ruta, Arancel, Demanda, Decision, Resultado
  test/                    Pruebas: los 10 casos del Excel deben coincidir
apps/web/
  index.html               Barra superior, aviso de datos, <main id="app">, pie
  src/main.ts              Enrutador por hash (#/ruta) y registro de pantallas
  src/datos.ts             D (la muestra), pais(iso), producto(id), tieneDatos(iso, id), nombreFuente(id)
  src/estado.ts            Estado en memoria: partida, estudiante, reloj; EQUIPOS, CODIGO_DEMO
  src/dom.ts               $(id), campo(form, nombre), marcados(form, nombre), ir(ruta)
  src/formato.ts           usd(), num(), ent(), pct(), mmss(), esc()
  src/estilos.css          Todos los estilos (clases listadas abajo)
  src/vistas/              Un archivo por grupo de pantallas
    inicio.ts  docente.ts  estudiante.ts  ficha.ts  verificacion.ts
datos/muestra.json         GENERADO desde el Excel. Nunca editar a mano.
hoja-calculo/*.xlsx        Fuente de verdad de datos y fórmulas.
docs/                      arquitectura.md, adr/, datos.md, trazabilidad.md
```

## 5. Pantallas que ya existen

| Ruta | Archivo | RF |
|---|---|---|
| `#/` | `vistas/inicio.ts`: hero, qué es, carrusel, tarjetas con íconos, llamado final | — |
| `#/entrar` | `vistas/entrar.ts`: "Iniciar sesión" → tres tarjetas animadas (docente, estudiante, mercados) | RF-01, RF-16 |
| `#/devs` | `vistas/devs.ts`: "Conoce a los devs" (editar el arreglo `EQUIPO` con los nombres) | — |
| `#/docente/crear` | `vistas/docente.ts` → `crearPartida` | RF-03 |
| `#/docente/codigo` | `vistas/docente.ts` → `codigoPartida` | RF-03 |
| `#/docente/panel` | `vistas/docente.ts` → `panelDocente` | RF-05 |
| `#/estudiante` | `vistas/estudiante.ts` → `ingresoEstudiante` | RF-02 |
| `#/estudiante/espera` | `vistas/estudiante.ts` → `salaEspera` | RF-02 |
| `#/estudiante/decision` | `vistas/estudiante.ts` → `decision` | RF-06, RF-08 |
| `#/estudiante/resultados` | `vistas/estudiante.ts` → `resultados` | RF-09, RF-10, RF-11 |
| `#/pais/<ISO>` | `vistas/ficha.ts` → `fichaPais` | RF-06 |
| `#/verificacion` | `vistas/verificacion.ts` | RNF-05 |

## 6. Cómo se hace una pantalla nueva (patrón obligatorio)

1. Crear o ampliar un archivo en `apps/web/src/vistas/`. Una pantalla es una función
   `(app: HTMLElement, partes: string[]) => void` que asigna `app.innerHTML` y luego conecta eventos.
2. Registrarla en `rutas` dentro de `apps/web/src/main.ts`.
3. Si la ruta lleva parámetro (`#/producto/P04`), agregar su primera parte a `RUTAS_CON_PARAMETRO`
   en `main.ts` y leer el parámetro con `partes[1]`.
4. Enlazarla desde alguna pantalla existente (Definición de Terminado: "la pantalla está enlazada").

Ejemplo mínimo:

```ts
// apps/web/src/vistas/ranking.ts
import { calcular } from "@terraexport/motor";
import { D } from "../datos";
import { partidaActual } from "../estado";
import { esc, usd } from "../formato";

export function ranking(app: HTMLElement): void {
  const p = partidaActual();
  const filas = p.equipos
    .map((equipo, i) => {
      const caso = D.casos[i % D.casos.length];
      const r = caso ? calcular(D, caso.decision) : null;
      return { equipo, capital: r && r.ok ? r.capitalFinal : p.capital };
    })
    .sort((a, b) => b.capital - a.capital);

  app.innerHTML = `
    <h1>Ranking de la ronda ${p.ronda}</h1>
    <div class="panel tabla-scroll"><table>
      <thead><tr><th>Posición</th><th>Equipo</th><th class="num">Capital</th></tr></thead>
      <tbody>${filas.map((f, i) => `<tr><td>${i + 1}</td><td>Equipo ${esc(f.equipo)}</td><td class="num">${usd(f.capital)}</td></tr>`).join("")}</tbody>
    </table></div>
    <p class="nota-proto">Prototipo: los resultados de cada equipo salen de los casos de la hoja de cálculo.</p>`;
}
```

### Reglas de código

- **Siempre** pasar por `esc()` cualquier texto que venga de un usuario o de los datos antes de
  ponerlo en HTML.
- **Nunca** escribir números a mano en pantalla: todo monto sale de `D` o de `calcular()`.
- Usar los helpers existentes (`$`, `campo`, `ir`, `usd`, `pct`…) en vez de duplicarlos.
- Formularios con `novalidate`, validación propia y errores en `<p class="error" role="alert">`.
- Cada campo con `<label for>`. Botones con texto que diga la acción ("Cerrar ronda", no "Aceptar").
- Si una pantalla usa `setInterval`, guardar el id en `estado.reloj` (el enrutador lo detiene al
  cambiar de pantalla).
- Sin `any`, sin `// @ts-ignore`, sin `localStorage`.
- Comentarios y nombres en español, igual que el resto del código.

### Textos

- Pantallas del **estudiante**: tuteo ("Elige un producto", "Tu precio").
- Pantallas del **docente**: usted ("Elija al menos 2 países").
- Frases cortas, en minúscula inicial salvo nombres propios, sin signos de exclamación.

### Identidad visual: divertida y limpia

- **Paleta** (variables en `:root` de `estilos.css`): jade `--jade #03695e` (marca, botones, títulos de
  cifras), hierba `--hierba #6daf5f` (utilidad, acentos), aqua `--aqua #239dca` (cielo, resaltados),
  celeste `--celeste #a5c6db`, lino `--lino #e7e9d8` (fondos de sección), `--perdida #c0453a`.
  Texto blanco solo sobre jade; sobre aqua y hierba el texto va oscuro (contraste).
- **Tipografías:** Fredoka (`--titulo`) para títulos y cifras grandes; Figtree (`--texto`) para todo lo demás.
- **Formas:** botones en píldora, tarjetas con esquinas de 14 px, tarjetas grandes de 22 a 28 px. Sin sombras.
- **Movimiento:** solo el barco del hero (una vez al cargar), la entrada de las tres tarjetas de
  `#/entrar` y animaciones al pasar el mouse. No agregar animaciones de entrada a cada sección.
- Logo: `apps/web/public/logo.svg` (provisional hasta tener el definitivo).
- Carrusel: imágenes en `apps/web/public/carrusel/` (1200×700). Se pueden reemplazar por capturas
  reales con el mismo nombre y tamaño.

### Clases disponibles (usar estas; no agregar CSS sin necesidad)

| Clase | Uso |
|---|---|
| `panel` | Caja blanca con borde |
| `dos-col` | Dos columnas que se apilan en celular |
| `fila` | Campos en línea que se acomodan solos |
| `campo`, `ayuda`, `error` | Formularios |
| `chips` + `chip` | Botones de selección (radio o checkbox) |
| `btn`, `btn claro`, `btn peligro`, `btn chico`, `acciones` | Botones píldora y su contenedor |
| `seccion`, `seccion lino` | Bloques de página de ancho completo (la vista debe agregar `app.classList.add("ancho-completo")`) |
| `motivos` + `motivo` | Tarjetas con ícono de Bootstrap Icons, título y texto corto |
| `caminos` + `camino docente / estudiante / mercados` | Tarjetas grandes de color con animación |
| `llamado` | Bloque jade de cierre con botones |
| `devs` + `dev` + `avatar`, `curso` | Página del equipo |
| `lista-equipos` | Lista de filas con dos extremos |
| `tabla-scroll` + `table`, `num`, `total` | Tablas con números alineados a la derecha |
| `ok` / `mal` | Texto verde (utilidad) / rojo (pérdida) |
| `datos-clave` + `dato` (`n`, `l`, `fuente`) | Cifra grande con etiqueta y fuente |
| `codigo` | Tarjeta del código de partida (franja verde; solo ahí) |
| `reloj` | Temporizador grande |
| `nota-proto` | Aviso de que algo está simulado |
| `explicacion` | Texto explicativo destacado |

Colores, si hace falta CSS nuevo: usar las variables de `:root` en `estilos.css`. No inventar colores.

## 7. Datos y fórmulas

- La hoja `hoja-calculo/TerraExport_Modelo_Calculo.xlsx` es la **fuente de verdad**.
- `datos/muestra.json` se genera con `python scripts/excel_a_datos.py`. No editarlo a mano.
- Hay 10 países y 15 productos, pero aranceles y demanda **solo para las 10 combinaciones** de los
  casos. Las demás aparecen como "sin datos verificados aún" y no se pueden elegir. No inventar
  aranceles para completarlas.
- Si se necesita cambiar una fórmula: primero en el Excel, luego la misma línea en
  `packages/motor/src/calculo.ts`, y `npm test` debe pasar.
- Eventos de mercado (RF-13): el motor ya los soporta con `decision.variacion`
  (0.04 = la moneda del destino pierde 4 %). No hace falta tocar el motor para simularlos.

## 8. Lo que falta para la presentación final (Sprint 2)

Todas son pantallas demo, simuladas en el navegador.

| RF | Ruta sugerida | Criterios de aceptación |
|---|---|---|
| RF-01 | Ya cubierto por `#/entrar` | En la demo "Iniciar sesión" no pide credenciales: lleva a las tres tarjetas y de ahí al flujo normal. No crear pantalla de login. |
| RF-04 | `#/docente/equipos` | Entre el código de acceso y el panel. Muestra los alias conectados y los reparte en equipos con un botón "Repartir automáticamente" y la opción de moverlos manualmente con un `<select>` por alias. Botón "Confirmar equipos" lleva al panel. |
| RF-07 | `#/producto/<id>` | Ficha con nombre, código SA, unidad, peso, costo FOB, fuente y estado del dato. Lista de mercados donde ese producto tiene datos. Enlazada desde el formulario de decisión y desde la ficha de país. |
| RF-12 | `#/ranking` | Tabla ordenada por capital final (ver ejemplo de la sección 6). Accesible desde el panel del docente al cerrar la ronda y desde los resultados del estudiante. Resalta el equipo del estudiante si hay sesión. |
| RF-13 | En `#/docente/panel` y `#/estudiante/decision` | El docente elige un evento ("El yen se devalúa 4 %", "Sube el flete aéreo"…) antes de iniciar la ronda. El estudiante lo ve como aviso en su decisión, y el cálculo usa `variacion`. Si el evento es de flete, documentar en la nota que es simulado. |
| RF-14 | `#/estudiante/choque` | Aparece después de registrar la decisión si el mercado tiene un escenario. Pregunta de opción múltiple sobre una dimensión de Hofstede del país (usar `pais(iso).hofstede`), con retroalimentación al responder. Banco de 3 a 5 escenarios en un arreglo dentro del archivo. |
| RF-15 | `#/docente/reporte` | Historial de rondas jugadas en la sesión y resultados por equipo. Botón "Imprimir reporte" que usa `window.print()`; agregar estilos `@media print` mínimos. |
| RF-16 | `#/demo` (opcional) | Recorrido guiado para la presentación: pasos con botón "Siguiente" por crear partida → panel → decisión → resultados → ranking, prellenando el caso C04 (Japón, café tostado, aéreo, 100 unidades). Enlace desde `#/entrar`. |

## 9. Definición de Terminado

Un pedido está terminado cuando:

1. La pantalla está enlazada desde otra pantalla del prototipo.
2. Los montos salen de la muestra o del motor.
3. Funciona en celular (390 px) y en computadora, y se navega con teclado.
4. `npm run check` pasa (formato, tipos, pruebas y compilación).
5. Otro integrante revisó y aprobó el pull request.

## 10. Comandos

```bash
npm install          # una vez
npm run dev          # demo en http://localhost:5173 (estudiante: código TRX 4821)
npm test             # 18 pruebas del motor contra el Excel
npm run format       # aplica Prettier
npm run check        # lo mismo que corre la integración continua
```

## 11. Git

- Rama por requerimiento: `feature/rf-xx-nombre` (nombres en la hoja Backlog del Excel).
- Commits cortos con el RF: `RF-12: pantalla demo de ranking`.
- Nada directo a `main`; siempre pull request con la plantilla.

## 12. Qué NO hacer

- No agregar servidor, base de datos, API, login real ni frameworks.
- No modificar `packages/motor` ni `datos/muestra.json` para "hacer que algo funcione".
- No inventar datos (aranceles, precios, países). Si falta un dato, mostrar el estado vacío.
- No reescribir pantallas que ya funcionan si el pedido no lo pide.
- No cambiar la identidad visual (paleta, tipografías, formas) sin acuerdo del equipo.
- No usar el CSS ni el JavaScript de Bootstrap; solo sus íconos.

---

## Plantilla para pedirle una tarea a Claude

```
Lee el contexto de CLAUDE.md. Trabajo en la rama feature/rf-XX-nombre.

Tarea: [RF-XX] [nombre de la pantalla], según la fila de la sección 8.
Archivos que puedes tocar: apps/web/src/vistas/[archivo].ts, apps/web/src/main.ts
[y el archivo desde donde se enlaza].

Entrégame:
1. El código completo de cada archivo nuevo y solo los cambios exactos en los existentes.
2. Cómo probarlo paso a paso en npm run dev.
3. Confirmación de que respeta la Definición de Terminado (sección 9).

No agregues dependencias ni toques packages/motor ni datos/.
```

En claude.ai, adjunte junto con este archivo: `apps/web/src/main.ts`, `datos.ts`, `estado.ts`,
`dom.ts`, `formato.ts`, `estilos.css` y la vista que se va a modificar. Si es una pantalla nueva,
adjunte también una vista parecida como ejemplo (por ejemplo `vistas/entrar.ts`).
