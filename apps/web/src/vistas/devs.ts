// "Conoce a los devs". Edite el arreglo EQUIPO con los nombres reales del grupo.
import { esc } from "../formato";

const EQUIPO: { nombre: string; rol: string; frase: string }[] = [
  {
    nombre: "Luciana Chacón Castillo",
    rol: "Product Owner",
    frase: "Organiza el sprint.",
  },
  {
    nombre: "Nahomy González Jiménez",
    rol: "Scrum Master",
    frase: "Mantiene al equipo enfocado en la meta.",
  },
  { nombre: "Anthony Piña Sandoval",
    rol: "Desarrollo", 
    frase: "Validar funcionalidades." 
  },
  { nombre: "Isaac Aburto Torres", 
    rol: "Desarrollo", 
    frase: "Encargado del apartado de diseño."
  },
  { nombre: "Jafeth Peña Espinoza", 
    rol: "Desarrollo", 
    frase: "Logica de negocio en el sistema."
  },
];

const iniciales = (n: string): string =>
  n
    .split(" ")
    .filter((p) => /^\p{Lu}/u.test(p))
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

export function devs(app: HTMLElement): void {
  app.innerHTML = `
    <h1>El equipo detrás de TerraExport</h1>
    <p class="lead">Cinco estudiantes de Ingeniería en Sistemas de Información que querían que aprender comercio internacional se sintiera como un juego.</p>
    <div class="devs">
      ${EQUIPO.map(
        (d) => `
        <article class="dev">
          <div class="avatar" aria-hidden="true">${esc(iniciales(d.nombre) || "?")}</div>
          <h3>${esc(d.nombre)}</h3>
          <div class="rol">${esc(d.rol)}</div>
          <p>${esc(d.frase)}</p>
        </article>`,
      ).join("")}
    </div>
    <div class="curso">
      <i class="bi bi-mortarboard" aria-hidden="true"></i>
      <p>EIF409 Aplicaciones Informáticas Globales,</p>
      <p>Universidad Nacional,Campus Liberia.</p>
      <p>Docente: MBA. Ariela Moraga Marchena.</p>
    </div>
    </div>
    <div class="acciones">
      <a class="btn" href="#/entrar"><i class="bi bi-play-fill" aria-hidden="true"></i>Iniciar sesión</a>
      <a class="btn claro" href="#/">Volver al inicio</a>
    </div>`;
}
