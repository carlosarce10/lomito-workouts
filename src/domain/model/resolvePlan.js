/**
 * Hidrata el plan de un cliente: resuelve cada exerciseId contra la biblioteca,
 * aplica los valores por defecto de la metodologia y deriva lo que no se escribe
 * (el ordinal de cada rutina, la frecuencia y los musculos de cada rutina).
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
      exercises.push({
        exercise,
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
        startDate: client.startDate,
        reviewDate: client.reviewDate ?? null,
        notes: client.notes ?? null,
      },
      frequency: routines.length,
      routines,
    },
  };
}

/** Primer musculo de cada ejercicio, sin duplicados y en orden de aparicion. */
function primaryMuscles(exercises) {
  return [...new Set(exercises.map(({ exercise }) => exercise.muscleIds[0]))];
}
