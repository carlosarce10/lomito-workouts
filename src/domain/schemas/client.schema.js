import { GOAL_IDS, LEVEL_IDS } from '../catalogs/index.js';
import { LIMITS } from '../validation/limits.js';
import * as r from '../validation/rules.js';

/**
 * Ejercicio prescrito dentro de una rutina. Solo `exerciseId` y `reps` son
 * obligatorios: el resto hereda de `methodology.defaults` cuando falta.
 */
export const routineExerciseSchema = {
  exerciseId: r.slug(),
  reps: r.range({ ...LIMITS.reps, integer: true }),
  sets: r.optional(r.number({ ...LIMITS.sets, integer: true })),
  rir: r.optional(r.range({ ...LIMITS.rir, integer: true })),
  restSeconds: r.optional(r.range({ ...LIMITS.restSeconds, integer: true })),
  warmupSets: r.optional(r.number({ ...LIMITS.warmupSets, integer: true })),
  notes: r.optional(r.text({ min: 1, max: LIMITS.text.max })),
};

/** Sesion de un dia. Su numero es la posicion en la lista; sus musculos se derivan. */
export const routineSchema = {
  name: r.text(LIMITS.name),
  notes: r.optional(r.text({ min: 1, max: LIMITS.notes.max })),
  exercises: {
    __each: routineExerciseSchema,
    __min: LIMITS.exercisesPerRoutine.min,
    __max: LIMITS.exercisesPerRoutine.max,
  },
};

/**
 * Forma de un cliente (`public/clients/<slug>.json`). El slug es el nombre del
 * archivo y lo comprueba lint:content. `name` es solo nombre de pila o apodo:
 * el sitio es publico.
 */
export const clientSchema = {
  name: r.text(LIMITS.name),
  goalId: r.oneOf(GOAL_IDS),
  levelId: r.oneOf(LEVEL_IDS),
  startDate: r.plainDate(),
  reviewDate: r.optional(r.plainDate()),
  notes: r.optional(r.text({ min: 1, max: LIMITS.notes.max })),
  routines: {
    __each: routineSchema,
    __min: LIMITS.routinesPerClient.min,
    __max: LIMITS.routinesPerClient.max,
  },
};
