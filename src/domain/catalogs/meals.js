/**
 * Momentos del dia en que se sugiere un plato. Solo ids; la etiqueta vive en
 * `catalog.meals.*`. `snack` es el tentempie que completa lo que no cubren las comidas.
 */
export const MEAL_IDS = ['breakfast', 'lunch', 'dinner', 'snack'];

/** Indica si un id pertenece al catalogo. */
export const isMealId = (id) => MEAL_IDS.includes(id);
