// Banderas de los países de la muestra (paquete flag-icons, licencia MIT).
// Se importan una por una para que la compilación incluya solo estas 10.
import be from "flag-icons/flags/4x3/be.svg";
import ca from "flag-icons/flags/4x3/ca.svg";
import cn from "flag-icons/flags/4x3/cn.svg";
import de from "flag-icons/flags/4x3/de.svg";
import es from "flag-icons/flags/4x3/es.svg";
import gb from "flag-icons/flags/4x3/gb.svg";
import jp from "flag-icons/flags/4x3/jp.svg";
import mx from "flag-icons/flags/4x3/mx.svg";
import nl from "flag-icons/flags/4x3/nl.svg";
import us from "flag-icons/flags/4x3/us.svg";

const BANDERAS: Record<string, string> = {
  USA: us,
  NLD: nl,
  BEL: be,
  DEU: de,
  ESP: es,
  GBR: gb,
  MEX: mx,
  CAN: ca,
  CHN: cn,
  JPN: jp,
};

/** Imagen de la bandera de un país (ISO alfa-3). Es decorativa: el nombre del país va siempre al lado. */
export function bandera(iso: string, grande = false): string {
  const src = BANDERAS[iso];
  return src ? `<img class="bandera${grande ? " grande" : ""}" src="${src}" alt="" aria-hidden="true">` : "";
}
