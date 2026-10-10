import { DIET_GOAL_IDS, GOAL_IDS, LEVEL_IDS, UNIT_SYSTEM_IDS } from '../catalogs/index.js';
import { LIMITS } from '../validation/limits.js';
import * as r from '../validation/rules.js';

/**
 * Ejercicio prescrito dentro de una rutina. Solo `exerciseId` y `reps` son
 * obligatorios: el resto hereda de `methodology.defaults` cuando falta.
 * `alternativeId` es el ejercicio que lo sustituye si el gimnasio no tiene la maquina:
 * mismo movimiento y mismo enfasis muscular, con la misma prescripcion.
 */
export const routineExerciseSchema = {
  exerciseId: r.slug(),
  alternativeId: r.optional(r.slug()),
  reps: r.range({ ...LIMITS.reps, integer: true }),
  sets: r.optional(r.number({ ...LIMITS.sets, integer: true })),
  rir: r.optional(r.range({ ...LIMITS.rir, integer: true })),
  restSeconds: r.optional(r.range({ ...LIMITS.restSeconds, integer: true })),
  warmupSets: r.optional(r.number({ ...LIMITS.warmupSets, integer: true })),
  notes: r.optional(r.text({ min: 1, max: LIMITS.text.max })),
};

/**
 * Sesion de un dia. Su numero es la posicion en la lista; sus musculos se derivan.
 * `cardioMinutes` es el cardio al terminar; sin el, el de la metodologia, y 0 lo quita.
 */
export const routineSchema = {
  name: r.text(LIMITS.name),
  notes: r.optional(r.text({ min: 1, max: LIMITS.notes.max })),
  cardioMinutes: r.optional(r.number({ ...LIMITS.cardioMinutes, integer: true })),
  exercises: {
    __each: routineExerciseSchema,
    __min: LIMITS.exercisesPerRoutine.min,
    __max: LIMITS.exercisesPerRoutine.max,
  },
};

/**
 * Recomendacion nutrimental de un cliente: solo resultados y supuestos, todos como
 * rangos y en metrico. La escribe `npm run diet` a partir de datos (peso, estatura,
 * edad, sexo) que no entran en el repositorio. Ver docs/diet.md.
 */
export const dietSchema = {
  dietGoalId: r.oneOf(DIET_GOAL_IDS),
  activityFactor: r.range(LIMITS.activityFactor),
  adjustmentPercent: r.range({ ...LIMITS.adjustmentPercent, integer: true }),
  restingCalories: r.range({ ...LIMITS.restingCalories, integer: true }),
  maintenanceCalories: r.range({ ...LIMITS.maintenanceCalories, integer: true }),
  targetCalories: r.range({ ...LIMITS.targetCalories, integer: true }),
  proteinPerKg: r.range(LIMITS.proteinPerKg),
  protein: r.range({ ...LIMITS.protein, integer: true }),
  fatPercent: r.range({ ...LIMITS.fatPercent, integer: true }),
  fat: r.range({ ...LIMITS.fat, integer: true }),
  carbs: r.range({ ...LIMITS.carbs, integer: true }),
  fiber: r.range({ ...LIMITS.fiber, integer: true }),
  water: r.optional(r.range({ ...LIMITS.water, integer: true })),
  mealsPerDay: r.optional(r.number({ ...LIMITS.mealsPerDay, integer: true })),
  calculatedAt: r.plainDate(),
  notes: r.optional(r.text({ min: 1, max: LIMITS.notes.max })),
};

/**
 * Forma de un cliente (`public/clients/<slug>.json`). El slug es el nombre del
 * archivo y lo comprueba lint:content. `name` lleva nombre y apellido. `unitSystemId`
 * y `diet` son opcionales: sin ellos el plan se ve en metrico y sin recomendacion.
 */
export const clientSchema = {
  name: r.text(LIMITS.name),
  goalId: r.oneOf(GOAL_IDS),
  levelId: r.oneOf(LEVEL_IDS),
  unitSystemId: r.optional(r.oneOf(UNIT_SYSTEM_IDS)),
  startDate: r.plainDate(),
  reviewDate: r.optional(r.plainDate()),
  notes: r.optional(r.text({ min: 1, max: LIMITS.notes.max })),
  diet: { ...dietSchema, __optional: true },
  routines: {
    __each: routineSchema,
    __min: LIMITS.routinesPerClient.min,
    __max: LIMITS.routinesPerClient.max,
  },
};
