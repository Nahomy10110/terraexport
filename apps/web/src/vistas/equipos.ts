// RF-04 conformar equipos: automático o moviendo cada alias con un selector.
import { $, ir } from "../dom";
import { ALIAS_DEMO, EQUIPOS, partidaActual } from "../estado";
import { esc } from "../formato";

export function conformarEquipos(app: HTMLElement): void {
    const p = partidaActual();
    if (!Object.keys(p.integrantes).length) for (const a of ALIAS_DEMO.slice(0, 8)) p.integrantes[a] = "";
    let cantidad = Math.min(4, Math.max(2, Math.ceil(Object.keys(p.integrantes).length / 3)));
    const nombres = (): string[] => EQUIPOS.slice(0, cantidad);

    const repartir = (): void => {
        const alias = Object.keys(p.integrantes).sort(() => Math.random() - 0.5);
        alias.forEach((a, i) => (p.integrantes[a] = nombres()[i % cantidad] ?? ""));
    };
    if (Object.values(p.integrantes).some((e) => !e || !nombres().includes(e))) repartir();

    const pintar = (): void => {
        const alias = Object.keys(p.integrantes);
        const sinEquipo = alias.filter((a) => !p.integrantes[a]);
        app.innerHTML = `
        <h1>Conformar equipos</h1>
        <p class="lead">${alias.length} estudiantes conectados. Repártalos automáticamente o mueva a cada uno con su selector.</p>
        <div class="panel">
            <div class="fila" style="align-items:end">
                <div class="campo"><label for="cantidad">Número de equipos</label>
            <select id="cantidad">${[2, 3, 4, 5, 6]
                .map((n) => `<option value="${n}"${n === cantidad ? " selected" : ""}>${n} equipos</option>`)
                .join("")}</select></div>
            <div class="campo"><button class="btn claro" id="repartir" type="button"><i class="bi bi-shuffle" aria-hidden="true"></i>Repartir automáticamente</button></div>
        </div>
        <div class="equipos-grid">
          ${nombres()
                .map((eq) => {
                    const miembros = alias.filter((a) => p.integrantes[a] === eq);
                    return `<section class="equipo-caja">
                <h3><i class="bi bi-people-fill" aria-hidden="true"></i> Equipo ${esc(eq)} <span class="fuente">(${miembros.length})</span></h3>
                <ul>${miembros
                            .map(
                                (a) => `<li><label for="m-${esc(a)}">${esc(a)}</label>
                      <select id="m-${esc(a)}" data-alias="${esc(a)}">${nombres()
                                        .map((n) => `<option value="${esc(n)}"${n === eq ? " selected" : ""}>${esc(n)}</option>`)
                                        .join("")}</select></li>`,
                            )
                            .join("")}</ul>
              </section>`;
                })
                .join("")}
        </div>
        <p class="error" id="err" role="alert">${sinEquipo.length ? `Faltan ${sinEquipo.length} estudiantes por asignar.` : ""}</p>
        <div class="acciones"><button class="btn" id="confirmar">Confirmar equipos</button></div>
      </div>
      <p class="nota-proto" style="margin-top:1rem">Prototipo: los alias son simulados. En el producto real llegarían desde los celulares de la clase.</p>`;

        $<HTMLSelectElement>("cantidad").addEventListener("change", (e) => {
            cantidad = Number((e.target as HTMLSelectElement).value);
            repartir();
            pintar();
        });
        $("repartir").addEventListener("click", () => {
            repartir();
            pintar();
        });
        app.querySelectorAll<HTMLSelectElement>("select[data-alias]").forEach((sel) =>
            sel.addEventListener("change", () => {
                p.integrantes[sel.dataset.alias ?? ""] = sel.value;
                pintar();
                document.getElementById(`m-${sel.dataset.alias ?? ""}`)?.focus();
            }),
        );
        $("confirmar").addEventListener("click", () => {
            const vacios = nombres().filter((eq) => !Object.values(p.integrantes).includes(eq));
            if (vacios.length) {
                $("err").textContent = `El equipo ${vacios[0]} no tiene integrantes. Mueva a alguien o reduzca el número de equipos.`;
                return;
            }
            p.equipos = nombres();
            p.capitales = Object.fromEntries(p.equipos.map((e) => [e, p.capital]));
            p.rondaEstado = "espera";
            ir("docente/panel");
        });
    };
    pintar();
}