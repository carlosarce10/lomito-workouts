import catalogEs from './locales/es/catalog.json';
import commonEs from './locales/es/common.json';
import planEs from './locales/es/plan.json';

/**
 * Diccionarios de todos los idiomas.
 *
 * Se importan de forma estatica y no con import() diferido: pesan un par de kB
 * gzip, y cargarlos aparte produciria un primer render con las claves crudas a la
 * vista.
 */
export const CATALOGS = {
  es: {
    common: commonEs,
    plan: planEs,
    catalog: catalogEs,
  },
};
