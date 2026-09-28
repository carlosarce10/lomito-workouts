/**
 * Limites de todo lo que se escribe en los JSON de contenido. Fuente unica: no se
 * repiten en el JSX ni en los scripts. Ver docs/content.md.
 */
export const LIMITS = {
  name: { min: 1, max: 60 },
  text: { max: 200 },
  notes: { max: 300 },
  musclesPerExercise: { min: 1, max: 4 },
  instructions: { min: 1, max: 8 },
  commonMistakes: { min: 0, max: 6 },
  routinesPerClient: { min: 1, max: 7 },
  exercisesPerRoutine: { min: 1, max: 12 },
  sets: { min: 1, max: 6 },
  warmupSets: { min: 0, max: 3 },
  reps: { min: 1, max: 50 },
  rir: { min: 0, max: 5 },
  restSeconds: { min: 15, max: 600 },
  methodologySections: { min: 1, max: 8 },
  methodologyBody: { min: 1, max: 4, itemMax: 400 },
  progressionSteps: { min: 2, max: 8 },
};
