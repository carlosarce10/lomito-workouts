/**
 * Catalogo de niveles del cliente. Solo ids; la etiqueta vive en `catalog.levels.*`.
 */
export const LEVEL_IDS = ['beginner', 'intermediate', 'advanced'];

/** Indica si un id pertenece al catalogo. */
export const isLevelId = (id) => LEVEL_IDS.includes(id);
