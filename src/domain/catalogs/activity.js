/**
 * Catalogo de actividad diaria fuera del entrenamiento, con el factor que multiplica
 * al gasto en reposo (docs/diet.md, seccion 3). Solo es entrada del calculo: no se
 * guarda en ningun JSON ni tiene etiqueta en la interfaz.
 */
export const ACTIVITY_LEVELS = [
  { id: 'sedentary', factor: 1.2 },
  { id: 'light', factor: 1.35 },
  { id: 'moderate', factor: 1.5 },
  { id: 'high', factor: 1.7 },
  { id: 'very-high', factor: 1.9 },
];

export const ACTIVITY_IDS = ACTIVITY_LEVELS.map((level) => level.id);

/** Factor de actividad de un id, o null si no esta en el catalogo. */
export const getActivityFactor = (id) =>
  ACTIVITY_LEVELS.find((level) => level.id === id)?.factor ?? null;

/** Indica si un id pertenece al catalogo. */
export const isActivityId = (id) => ACTIVITY_IDS.includes(id);
