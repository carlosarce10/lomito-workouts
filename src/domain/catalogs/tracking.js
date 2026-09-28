/**
 * Todo lo que Lomito Workouts sabe de Lomito Train, que es donde se registra el
 * entrenamiento. Es el contrato del archivo de exportacion: si Lomito Train cambia
 * sus catalogos, este es el unico archivo que cambia aqui. Ver docs/tracking-export.md.
 */
export const TRACKING_URL = 'https://lomito-train.netlify.app/';

/**
 * Envoltorio del archivo. Lomito Train distingue por `app` un plan de una copia de
 * seguridad propia: un plan se fusiona con sus datos, una copia los sustituye. Una
 * version de Lomito Train que no conoce este formato lo rechaza sin tocar nada.
 */
export const TRACKING_FILE = { app: 'lomito-workouts', kind: 'plan', planVersion: 1 };

/** Longitud maxima de un nombre en Lomito Train. */
export const TRACKING_NAME_MAX = 60;

/** Colores de rutina de Lomito Train, en su orden. Cada dia toma el siguiente. */
export const TRACKING_ROUTINE_COLOR_IDS = ['lavender', 'mint', 'sky', 'peach', 'violet', 'pink'];

/**
 * Grupos musculares de Lomito Train para cada musculo de este catalogo. Lomito
 * Train agrupa en cinco: empuje, tiron, pierna, tren superior y tren inferior.
 * La lumbar va con el tren inferior: se trabaja el dia de cadena posterior.
 */
export const TRACKING_MUSCLE_GROUPS = {
  chest: ['push', 'upperbody'],
  'chest-upper': ['push', 'upperbody'],
  'shoulders-front': ['push', 'upperbody'],
  'shoulders-side': ['push', 'upperbody'],
  triceps: ['push', 'upperbody'],
  lats: ['pull', 'upperbody'],
  'back-upper': ['pull', 'upperbody'],
  'shoulders-rear': ['pull', 'upperbody'],
  biceps: ['pull', 'upperbody'],
  forearms: ['pull', 'upperbody'],
  'back-lower': ['lowerbody'],
  abs: ['upperbody'],
  quads: ['leg', 'lowerbody'],
  hamstrings: ['leg', 'lowerbody'],
  glutes: ['leg', 'lowerbody'],
  calves: ['leg', 'lowerbody'],
};

/** Maximo de grupos musculares por ejercicio en Lomito Train. */
export const TRACKING_GROUPS_MAX = 5;
