import { normalizeText } from './normalize.js';
import { parseDecimal, parseInteger } from './parseDecimal.js';
import { SLUG_PATTERN } from './slugs.js';

/**
 * Cada regla recibe un valor y devuelve `null` si es valido, o un objeto
 * `{ code, params }` si no lo es. El `code` es la clave del mensaje: la capa de
 * presentacion lo traduce, la de dominio nunca escribe texto para el usuario.
 */

/** Texto obligatorio, con longitud entre min y max tras normalizar. */
export const text =
  ({ min = 1, max = Infinity } = {}) =>
  (value) => {
    const limpio = normalizeText(value);
    if (limpio.length === 0) return { code: 'required' };
    if (limpio.length < min) return { code: 'tooShort', params: { min } };
    if (limpio.length > max) return { code: 'tooLong', params: { max } };
    return null;
  };

/** Numero dentro de un rango, opcionalmente multiplo de un paso. */
export const number =
  ({ min = -Infinity, max = Infinity, decimals = null, integer = false } = {}) =>
  (value) => {
    const n = integer ? parseInteger(value) : parseDecimal(value);
    if (n === null) return { code: integer ? 'notInteger' : 'notANumber' };
    if (n < min) return { code: 'tooSmall', params: { min } };
    if (n > max) return { code: 'tooLarge', params: { max } };
    // Se compara con tolerancia porque 0.1 + 0.2 no es 0.3 en coma flotante.
    if (decimals !== null) {
      const factor = 10 ** decimals;
      if (Math.abs(Math.round(n * factor) / factor - n) > 1e-9) {
        return { code: 'tooPrecise', params: { decimals } };
      }
    }
    return null;
  };

/** El valor debe pertenecer a un conjunto cerrado. */
export const oneOf = (valores) => (value) =>
  valores.includes(value) ? null : { code: 'notInCatalog' };

/** Lista cuyos elementos pertenecen a un conjunto cerrado, sin duplicados. */
export const listOf =
  ({ valores, min = 0, max = Infinity }) =>
  (value) => {
    if (!Array.isArray(value)) return { code: 'notAList' };
    if (value.length < min) return { code: 'tooFewItems', params: { min } };
    if (value.length > max) return { code: 'tooManyItems', params: { max } };
    if (new Set(value).size !== value.length) return { code: 'duplicateItems' };
    if (value.some((item) => !valores.includes(item))) return { code: 'notInCatalog' };
    return null;
  };

/** Marca de tiempo ISO valida. */
export const isoDate = () => (value) =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? null : { code: 'invalidDate' };

/** Hace opcional cualquier regla: null y undefined pasan. */
export const optional = (regla) => (value) =>
  value === null || value === undefined ? null : regla(value);

/** Identificador en kebab-case. */
export const slug = () => (value) =>
  typeof value === 'string' && SLUG_PATTERN.test(value) ? null : { code: 'invalidSlug' };

/** Fecha de calendario en formato YYYY-MM-DD, sin hora. */
export const plainDate = () => (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
    ? null
    : { code: 'invalidDate' };

/**
 * Rango `{ min, max }` con los dos extremos dentro de los limites y `min <= max`.
 * Es la forma de reps, rir y restSeconds: un objeto y no "8-12", para que nadie
 * tenga que parsear guiones y para que la interfaz decida como pintarlo.
 */
export const range =
  ({ min = -Infinity, max = Infinity, integer = false } = {}) =>
  (value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return { code: 'notARange' };
    }
    const comprobar = number({ min, max, integer });
    const problemaMin = comprobar(value.min);
    if (problemaMin) return problemaMin;
    const problemaMax = comprobar(value.max);
    if (problemaMax) return problemaMax;
    if (value.min > value.max) return { code: 'invalidRange' };
    return null;
  };

/** Lista de textos con longitud acotada; cada elemento es un texto no vacio. */
export const listOfText =
  ({ min = 0, max = Infinity, itemMax = Infinity }) =>
  (value) => {
    if (!Array.isArray(value)) return { code: 'notAList' };
    if (value.length < min) return { code: 'tooFewItems', params: { min } };
    if (value.length > max) return { code: 'tooManyItems', params: { max } };
    const comprobar = text({ min: 1, max: itemMax });
    for (const item of value) {
      const problema = comprobar(item);
      if (problema) return problema;
    }
    return null;
  };

/** Origen de las imagenes: `{ provider, id }` con el proveedor en el catalogo. */
export const source = (providerIds) => (value) => {
  if (value === null || typeof value !== 'object') return { code: 'notAnObject' };
  if (!providerIds.includes(value.provider)) return { code: 'notInCatalog' };
  if (typeof value.id !== 'string' || !/^[^\s/]+$/.test(value.id)) {
    return { code: 'invalidSourceId' };
  }
  return null;
};
