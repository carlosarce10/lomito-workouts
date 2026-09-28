/** Identificador en kebab-case: ids de ejercicio, de seccion, de catalogo. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Slug de cliente: kebab-case terminado en un sufijo de cuatro caracteres al azar.
 * El sitio es publico y no tiene login, asi que la URL de un plan no puede ser el
 * nombre de la persona a secas.
 */
export const CLIENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-z0-9]{4}$/;

/** Indica si un valor es un slug valido. */
export const isSlug = (value) => typeof value === 'string' && SLUG_PATTERN.test(value);

/** Indica si un valor es un slug de cliente valido. */
export const isClientSlug = (value) => typeof value === 'string' && CLIENT_SLUG_PATTERN.test(value);
