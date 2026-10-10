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
  // Descanso minimo de 2 minutos entre series, en cualquier ejercicio (Lomito Dev).
  restSeconds: { min: 120, max: 600 },
  cardioMinutes: { min: 0, max: 120 },
  methodologySections: { min: 1, max: 8 },
  sectionBody: { min: 1, max: 4, itemMax: 400 },
  progressionSteps: { min: 2, max: 8 },

  // Recomendacion nutrimental: resultados que si se guardan en el cliente.
  restingCalories: { min: 800, max: 3500 },
  maintenanceCalories: { min: 1000, max: 6000 },
  targetCalories: { min: 1000, max: 6000 },
  activityFactor: { min: 1.2, max: 1.9 },
  adjustmentPercent: { min: -30, max: 30 },
  proteinPerKg: { min: 1, max: 2.5 },
  protein: { min: 40, max: 300 },
  fatPercent: { min: 15, max: 40 },
  fat: { min: 20, max: 200 },
  carbs: { min: 50, max: 800 },
  fiber: { min: 15, max: 80 },
  water: { min: 1000, max: 6000 },
  mealsPerDay: { min: 2, max: 6 },
  dietSections: { min: 1, max: 8 },
  dietTips: { min: 1, max: 6, itemMax: 160 },

  // Alimentos, platos y suplementos de src/content/nutrition/.
  foodGrams: { min: 1, max: 500 },
  foodMacro: { min: 0, max: 100 },
  measureAmount: { min: 0.25, max: 500 },
  measureStep: { min: 0.25, max: 50 },
  unit: { min: 1, max: 20 },
  plateItems: { min: 2, max: 6 },
  plateMeals: { min: 1, max: 4 },
  supplementBody: { min: 1, max: 3, itemMax: 240 },

  // Entradas del calculo. Solo adultos (docs/diet.md); nunca se escriben en un JSON.
  age: { min: 18, max: 90 },
  height: { min: 120, max: 230 },
  bodyMass: { min: 35, max: 250 },
};
