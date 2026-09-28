/**
 * Formateo de numeros y fechas con el idioma activo.
 *
 * Es el unico sitio del proyecto donde se instancia Intl: nunca se escribe un
 * locale a mano en un componente.
 *
 * Los formateadores se cachean porque construir un Intl.NumberFormat es caro y
 * estos se llaman en cada tarjeta de cada rutina.
 */
const cache = new Map();

const obtener = (clave, fabrica) => {
  if (!cache.has(clave)) cache.set(clave, fabrica());
  return cache.get(clave);
};

/** Presets cerrados. No se pasan opciones sueltas desde los componentes. */
const NUMEROS = {
  integer: { maximumFractionDigits: 0 },
};

const FECHAS = {
  date: { day: 'numeric', month: 'short', year: 'numeric' },
};

/**
 * Formatea un numero con un preset.
 *
 * @param {number} value Valor.
 * @param {'integer'} preset Preset.
 * @param {string} language Idioma activo.
 * @returns {string}
 */
export function formatNumber(value, preset, language) {
  if (!Number.isFinite(value)) return '';
  return obtener(
    `n:${preset}:${language}`,
    () => new Intl.NumberFormat(language, NUMEROS[preset] ?? NUMEROS.integer),
  ).format(value);
}

/**
 * Formatea una fecha ISO con un preset. Devuelve cadena vacia si no es valida,
 * nunca "Invalid Date".
 *
 * @param {string} iso Fecha ISO.
 * @param {'date'} preset Preset.
 * @param {string} language Idioma activo.
 * @returns {string}
 */
export function formatDate(iso, preset, language) {
  // Una fecha de calendario sin hora se parsea como medianoche UTC, y en America
  // se mostraria el dia anterior. Se construye en hora local a proposito.
  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const fecha = soloFecha
    ? new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]))
    : new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return obtener(
    `d:${preset}:${language}`,
    () => new Intl.DateTimeFormat(language, FECHAS[preset] ?? FECHAS.date),
  ).format(fecha);
}

/**
 * Categoria de plural de un numero segun el idioma.
 *
 * Se usa Intl.PluralRules y no un ternario: el espanol declara "one", "many" y
 * "other", y un ternario solo acertaria por casualidad.
 *
 * @param {number} count Cantidad.
 * @param {string} language Idioma activo.
 * @returns {string} 'one', 'other', y las que el idioma tenga.
 */
export function pluralCategory(count, language) {
  return obtener(`p:${language}`, () => new Intl.PluralRules(language)).select(count);
}
