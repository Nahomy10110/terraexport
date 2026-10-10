// "Iniciar sesión": no hay login real (es una demo). Se elige cómo entrar.
export function entrar(app: HTMLElement): void {
  app.innerHTML = `
    <section class="entrar">
      <h1>¿Cómo quieres entrar?</h1>
      <p>Elige un camino. En esta demo no hace falta crear una cuenta.</p>
      <div class="caminos">
        <a class="camino docente" href="#/docente/crear">
          <i class="bi bi-person-video3" aria-hidden="true"></i>
          <strong>Soy docente</strong>
          <span>Crea la partida, comparte el código y controla las rondas con el reloj.</span>
          <span class="ir">Crear partida <i class="bi bi-arrow-right-short" aria-hidden="true"></i></span>
        </a>
        <a class="camino estudiante" href="#/estudiante">
          <i class="bi bi-controller" aria-hidden="true"></i>
          <strong>Soy estudiante</strong>
          <span>Entra con el código de tu clase y un alias, y toma decisiones con tu equipo.</span>
          <span class="ir">Unirme a una partida <i class="bi bi-arrow-right-short" aria-hidden="true"></i></span>
        </a>
        <a class="camino mercados" href="#/pais/USA">
          <i class="bi bi-globe2" aria-hidden="true"></i>
          <strong>Explorar mercados</strong>
          <span>Revisa moneda, aranceles, fletes y cultura de los países antes de jugar.</span>
          <span class="ir">Ver mercados <i class="bi bi-arrow-right-short" aria-hidden="true"></i></span>
        </a>
      </div>
      <p class="secundario">¿Quieres revisar los números? <a href="#/verificacion">Compara la demo con la hoja de cálculo</a>.</p>
    </section>`;
}
