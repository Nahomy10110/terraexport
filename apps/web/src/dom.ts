/** Obtiene un elemento por id y falla con un mensaje claro si no existe. */
export function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`No existe el elemento #${id}`);
  return el as T;
}

export function campo(form: HTMLFormElement, nombre: string): HTMLInputElement & HTMLSelectElement {
  const el = form.elements.namedItem(nombre);
  if (!el) throw new Error(`El formulario no tiene el campo ${nombre}`);
  return el as HTMLInputElement & HTMLSelectElement;
}

export function marcados(form: HTMLFormElement, nombre: string): string[] {
  return Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${nombre}"]:checked`)).map(
    (i) => i.value,
  );
}

export function ir(ruta: string): void {
  location.hash = `#/${ruta}`;
}
