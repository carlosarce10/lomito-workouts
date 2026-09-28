/**
 * Catalogo de objetivos del cliente. Solo ids; la etiqueta vive en `catalog.goals.*`.
 */
export const GOAL_IDS = ['hypertrophy', 'strength', 'general'];

/** Indica si un id pertenece al catalogo. */
export const isGoalId = (id) => GOAL_IDS.includes(id);
