// Página principal: qué es el prototipo, carrusel, motivos para jugar y las dos acciones.
import { D } from "../../nucleo/datos";
import { estado } from "../../simulacion/estado";

const DIAPOSITIVAS = [
  {
    img: "carrusel/1-mercados.svg",
    alt: "Barco cargado de contenedores que sale de las colinas de Costa Rica hacia otro puerto",
    titulo: "Elige mercado y producto",
    texto: `${D.paises.length} países y ${D.productos.length} productos costarricenses, con aranceles y tipos de cambio reales.`,
  },
  {
    img: "carrusel/2-costos.svg",
    alt: "Pila de contenedores de colores que representan FOB, flete, seguro y arancel junto a una etiqueta de precio",
    titulo: "Calcula lo que cuesta llegar",
    texto: "FOB, flete, seguro y arancel se suman como contenedores hasta el costo puesto en destino.",
  },
  {
    img: "carrusel/3-equipos.svg",
    alt: "Podio de tres niveles con carga encima y una estrella sobre el primer lugar",
    titulo: "Compite con otros equipos",
    texto: "Si varios equipos venden lo mismo en el mismo mercado, se reparten la demanda.",
  },
  {
    img: "carrusel/4-aprender.svg",
    alt: "Gráfico de utilidad que sube con un punto rojo de pérdida y un globo de texto con un bombillo",
    titulo: "Entiende por qué ganaste o perdiste",
    texto: "Cada resultado trae una explicación corta: precio, competencia, arancel o tipo de cambio.",
  },
];

const MOTIVOS = [
  [
    "bi-globe-americas",
    "Mercados de verdad",
    "Del banano a Estados Unidos al café en Japón: cada país trae su moneda, su arancel y su cultura.",
  ],
  [
    "bi-box-seam",
    "Productos ticos",
    "Piña, yuca, cacao o dispositivos médicos. Tú eliges qué vender y cuánto enviar.",
  ],
  [
    "bi-stopwatch",
    "Rondas contra reloj",
    "La docente abre la ronda y el tiempo corre. Pónganse de acuerdo antes de que cierre.",
  ],
  [
    "bi-calculator",
    "Números que cuadran",
    "Cada monto sale de una hoja de cálculo verificada caso por caso.",
  ],
  [
    "bi-lightbulb",
    "Aprende del error",
    "Si pierdes, sabrás si fue el precio, el flete o un arancel que se comió la ganancia.",
  ],
  [
    "bi-trophy",
    "Sube en el ranking",
    "Tu capital pasa a la siguiente ronda. Gana el equipo que mejor exporte.",
  ],
];

const PASOS = [
  ["bi-person-video3", "La docente crea la partida y comparte un código."],
  ["bi-people", "Los equipos entran con el código y un alias, sin crear cuenta."],
  ["bi-sliders", "Cada equipo decide producto, mercado, transporte, volumen y precio."],
  ["bi-graph-up-arrow", "Al cerrar la ronda ven su utilidad y por qué la obtuvieron."],
];

const PAISAJE = `
  <svg class="hero-paisaje" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <path d="M0 170 Q180 70 360 140 T720 130 T1080 120 T1440 150 V320 H0Z" fill="#6daf5f"/>
    <path d="M0 210 Q240 130 480 190 T960 185 T1440 200 V320 H0Z" fill="#03695e"/>
    <rect y="248" width="1440" height="72" fill="#1d7fa6"/>
    <g class="barco">
      <g transform="translate(740 214)">
        <rect x="18" y="0" width="34" height="22" rx="3" fill="#e7e9d8"/>
        <rect x="56" y="0" width="34" height="22" rx="3" fill="#6daf5f"/>
        <rect x="94" y="0" width="34" height="22" rx="3" fill="#239dca"/>
        <rect x="37" y="-24" width="34" height="22" rx="3" fill="#a5c6db"/>
        <rect x="75" y="-24" width="34" height="22" rx="3" fill="#e7e9d8"/>
        <rect x="136" y="-30" width="20" height="52" rx="4" fill="#ffffff"/>
        <path d="M0 26 H175 L158 62 H16 Z" fill="#12302b"/>
        <rect x="14" y="33" width="148" height="5" rx="2.5" fill="#6daf5f"/>
      </g>
    </g>
  </svg>`;

export function inicio(app: HTMLElement): void {
  app.classList.add("ancho-completo");
  app.innerHTML = `
    <section class="hero">
      <div class="hero-texto">
        <h1>Aprende a exportar jugando</h1>
        <p>Un simulador para el aula donde cada equipo dirige una exportadora costarricense y compite en mercados reales.</p>
        <div class="acciones">
          <a class="btn claro" href="#/devs"><i class="bi bi-emoji-smile" aria-hidden="true"></i>Conoce a los devs</a>
          <a class="btn" href="#/entrar"><i class="bi bi-play-fill" aria-hidden="true"></i>Iniciar sesión</a>
        </div>
      </div>
      ${PAISAJE}
    </section>

    <section class="seccion lino">
      <div class="que-es">
        <div>
          <h2>¿Qué es este prototipo?</h2>
          <p>TerraExport es el proyecto final del curso EIF409 de la UNA. Esta demo muestra cómo funcionaría la plataforma:
            las pantallas se pueden recorrer y los montos se calculan con una hoja de cálculo verificada.
            Las partidas, los equipos y el reloj están simulados.</p>
        </div>
        <ul class="lista-pasos">
          ${PASOS.map(([i, t]) => `<li><i class="bi ${i}" aria-hidden="true"></i><span>${t}</span></li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="seccion">
      <h2>Así se ve una ronda</h2>
      <div class="carrusel" aria-roledescription="carrusel" aria-label="Pasos de una ronda de TerraExport">
        <div class="carrusel-pista" id="pista" aria-live="polite">
          ${DIAPOSITIVAS.map(
            (d, i) => `
            <figure class="slide" aria-roledescription="diapositiva" aria-label="${i + 1} de ${DIAPOSITIVAS.length}">
              <img src="${d.img}" alt="${d.alt}" width="1200" height="700" ${i ? 'loading="lazy"' : ""}>
              <figcaption><h3>${d.titulo}</h3><p>${d.texto}</p></figcaption>
            </figure>`,
          ).join("")}
        </div>
      </div>
      <div class="carrusel-controles">
        <button class="carrusel-flecha" id="anterior" aria-label="Diapositiva anterior"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
        <div class="puntos" id="puntos">
          ${DIAPOSITIVAS.map((_, i) => `<button aria-label="Ir a la diapositiva ${i + 1}" data-i="${i}"></button>`).join("")}
        </div>
        <button class="carrusel-flecha" id="siguiente" aria-label="Diapositiva siguiente"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
      </div>
    </section>

    <section class="seccion">
      <h2>Lo que te espera en cada partida</h2>
      <div class="motivos">
        ${MOTIVOS.map(
          ([i, t, p]) =>
            `<article class="motivo"><i class="bi ${i}" aria-hidden="true"></i><h3>${t}</h3><p>${p}</p></article>`,
        ).join("")}
      </div>
    </section>

    <section class="seccion">
      <div class="llamado">
        <h2>¿Listo para tu primera exportación?</h2>
        <p>Entra como docente, como estudiante o explora los mercados antes de jugar.</p>
        <div class="acciones">
          <a class="btn claro" href="#/devs"><i class="bi bi-emoji-smile" aria-hidden="true"></i>Conoce a los devs</a>
          <a class="btn" href="#/entrar"><i class="bi bi-play-fill" aria-hidden="true"></i>Iniciar sesión</a>
        </div>
      </div>
    </section>`;

  iniciarCarrusel(app);
}

function iniciarCarrusel(app: HTMLElement): void {
  const pista = app.querySelector<HTMLElement>("#pista");
  const puntos = Array.from(app.querySelectorAll<HTMLButtonElement>("#puntos button"));
  const slides = Array.from(app.querySelectorAll<HTMLElement>(".slide"));
  const carrusel = app.querySelector<HTMLElement>(".carrusel");
  if (!pista || !carrusel) return;
  let actual = 0;
  let pausado = false;

  const mostrar = (i: number): void => {
    actual = (i + slides.length) % slides.length;
    pista.style.transform = `translateX(-${actual * 100}%)`;
    slides.forEach((s, k) => s.setAttribute("aria-hidden", String(k !== actual)));
    puntos.forEach((p, k) => p.setAttribute("aria-current", String(k === actual)));
  };

  app.querySelector("#anterior")?.addEventListener("click", () => mostrar(actual - 1));
  app.querySelector("#siguiente")?.addEventListener("click", () => mostrar(actual + 1));
  puntos.forEach((p) => p.addEventListener("click", () => mostrar(Number(p.dataset.i))));
  for (const el of [carrusel, ...puntos]) {
    el.addEventListener("mouseenter", () => (pausado = true));
    el.addEventListener("mouseleave", () => (pausado = false));
  }
  carrusel.addEventListener("focusin", () => (pausado = true));
  carrusel.addEventListener("focusout", () => (pausado = false));
  mostrar(0);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    estado.reloj = window.setInterval(() => {
      if (!pausado && !document.hidden) mostrar(actual + 1);
    }, 6000);
  }
}
