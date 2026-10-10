import { DEFAULT_UNIT_SYSTEM_ID } from '../catalogs/index.js';

/**
 * Hidrata el plan de un cliente: resuelve cada exerciseId y su alternativa contra la biblioteca,
 * aplica los valores por defecto de la metodologia y deriva lo que no se escribe
 * (el ordinal de cada rutina, la frecuencia, los musculos de cada rutina y la
 * proteina por comida de la recomendacion nutrimental).
 *
 * No valida la forma: eso lo hace lint:content antes de cada build. Lo unico que
 * puede fallar en tiempo de ejecucion es una referencia rota, y no lanza: devuelve
 * el resultado para que la interfaz avise.
 *
 * @param {object} entrada
 * @param {object} entrada.client Cliente tal como esta en public/clients/<slug>.json.
 * @param {Map<string, object>} entrada.library Biblioteca de ejercicios indexada por id.
 * @param {object} entrada.methodology Metodologia, con sus valores por defecto.
 * @returns {{ ok: true, value: object } | { ok: false, error: 'orphanExercise', exerciseId: string }}
 */
export function resolvePlan({ client, library, methodology }) {
  const { defaults } = methodology;
  const routines = [];

  for (const [indice, routine] of client.routines.entries()) {
    const exercises = [];
    for (const item of routine.exercises) {
      const exercise = library.get(item.exerciseId);
      if (!exercise) return { ok: false, error: 'orphanExercise', exerciseId: item.exerciseId };
      const alternative = item.alternativeId ? library.get(item.alternativeId) : null;
      if (alternative === undefined) {
        return { ok: false, error: 'orphanExercise', exerciseId: item.alternativeId };
      }
      exercises.push({
        exercise,
        alternative,
        sets: item.sets ?? defaults.sets,
        reps: item.reps,
        rir: item.rir ?? defaults.rir,
        restSeconds: item.restSeconds ?? defaults.restSeconds,
        warmupSets: item.warmupSets ?? defaults.warmupSets,
        notes: item.notes ?? null,
      });
    }
    routines.push({
      ordinal: indice + 1,
      name: routine.name,
      notes: routine.notes ?? null,
      cardioMinutes: routine.cardioMinutes ?? defaults.cardioMinutes,
      muscleIds: primaryMuscles(exercises),
      exercises,
    });
  }

  return {
    ok: true,
    value: {
      client: {
        name: client.name,
        goalId: client.goalId,
        levelId: client.levelId,
        unitSystemId: client.unitSystemId ?? DEFAULT_UNIT_SYSTEM_ID,
        startDate: client.startDate,
        reviewDate: client.reviewDate ?? null,
        notes: client.notes ?? null,
      },
      frequency: routines.length,
      diet: client.diet ? resolveDiet(client.diet) : null,
      routines,
    },
  };
}

/** Primer musculo de cada ejercicio, sin duplicados y en orden de aparicion. */
function primaryMuscles(exercises) {
  return [...new Set(exercises.map(({ exercise }) => exercise.muscleIds[0]))];
}

/**
 * Recomendacion nutrimental lista para pintar: los campos tal cual y la proteina por
 * comida, a 5 g como el resto de gramos, cuando se conocen las comidas del dia.
 */
function resolveDiet(diet) {
  const comidas = diet.mealsPerDay ?? null;
  const porComida = (gramos) => Math.round(gramos / comidas / 5) * 5;
  return {
    ...diet,
    water: diet.water ?? null,
    mealsPerDay: comidas,
    proteinPerMeal: comidas
      ? { min: porComida(diet.protein.min), max: porComida(diet.protein.max) }
      : null,
    notes: diet.notes ?? null,
  };
}
