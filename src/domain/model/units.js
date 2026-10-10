/**
 * Conversion de medidas escritas a metrico. Los clientes de Mexico dan kilos y
 * centimetros; los de Estados Unidos, libras y pies con pulgadas. Todo lo que entra
 * al calculo y a los JSON es metrico, asi que la conversion ocurre una sola vez aqui.
 */

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;
const CM_PER_FT = 30.48;
const ML_PER_FL_OZ = 29.5735295625;

const MASS_UNITS = { kg: 1, kgs: 1, lb: KG_PER_LB, lbs: KG_PER_LB };
const LENGTH_UNITS = { cm: 1, m: 100, in: CM_PER_IN, ft: CM_PER_FT };

/** Redondea a un decimal; las entradas no necesitan mas precision. */
const unDecimal = (value) => Math.round(value * 10) / 10;

/**
 * Interpreta un numero con unidad opcional ("172lb", "78 kg", "167cm", "66 in").
 *
 * @param {string|number} text Medida escrita; la coma decimal se admite.
 * @param {Record<string, number>} units Unidades aceptadas y su factor a la unidad base.
 * @param {string} defaultUnit Unidad cuando no se escribe ninguna.
 * @returns {number|null} Valor en la unidad base, o null si no se entiende.
 */
function parseWithUnits(text, units, defaultUnit) {
  const limpio = String(text).trim().toLowerCase().replace(',', '.');
  const match = /^(\d+(?:\.\d+)?)\s*([a-z]*)$/.exec(limpio);
  if (!match) return null;
  const unidad = match[2] || defaultUnit;
  if (!(unidad in units)) return null;
  return Number(match[1]) * units[unidad];
}

/**
 * Convierte un peso corporal escrito a kilogramos.
 *
 * @param {string|number} text "78", "78kg", "172lb", "172 lbs".
 * @returns {number|null} Kilogramos con un decimal, o null si no se entiende.
 */
export function toKilograms(text) {
  const kg = parseWithUnits(text, MASS_UNITS, 'kg');
  return kg === null ? null : unDecimal(kg);
}

/**
 * Convierte una estatura escrita a centimetros. Admite pies y pulgadas con comilla
 * (`5'9"`, `5'9`, `5 ft 9 in`) ademas de centimetros, metros y pulgadas sueltas.
 *
 * @param {string|number} text "167", "167cm", "1.67m", "66in", `5'6"`.
 * @returns {number|null} Centimetros con un decimal, o null si no se entiende.
 */
export function toCentimeters(text) {
  const limpio = String(text).trim().toLowerCase().replace(',', '.');
  const piesYPulgadas = /^(\d+)\s*(?:'|ft)\s*(\d+(?:\.\d+)?)?\s*(?:"|in)?$/.exec(limpio);
  if (piesYPulgadas) {
    const pies = Number(piesYPulgadas[1]);
    const pulgadas = Number(piesYPulgadas[2] ?? 0);
    return unDecimal(pies * CM_PER_FT + pulgadas * CM_PER_IN);
  }
  const cm = parseWithUnits(limpio, LENGTH_UNITS, 'cm');
  return cm === null ? null : unDecimal(cm);
}

/** Kilogramos a libras. */
export const toPounds = (kg) => kg / KG_PER_LB;

/** Un valor por kilo expresado por libra (1,6 g/kg son 0,73 g/lb). */
export const perKgToPerLb = (valuePerKg) => valuePerKg * KG_PER_LB;

/** Mililitros a onzas liquidas de Estados Unidos. */
export const toFluidOunces = (ml) => ml / ML_PER_FL_OZ;

const FRACCIONES = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

/**
 * Escribe una cantidad casera como numero mixto: 1.5 es "1½", 0.25 es "¼". Las
 * cantidades llegan redondeadas a cuartos; otra fraccion se deja con un decimal.
 *
 * @param {number} value Cantidad, positiva.
 * @returns {string}
 */
export function toMixedNumber(value) {
  const entero = Math.floor(value + 1e-9);
  const resto = Number((value - entero).toFixed(2));
  if (resto === 0) return String(entero);
  const fraccion = FRACCIONES[resto];
  if (!fraccion) return String(Number(value.toFixed(1)));
  return entero === 0 ? fraccion : `${entero}${fraccion}`;
}

/** Gramos a onzas de peso. */
export const gramsToOunces = (grams) => grams / 28.349523125;
