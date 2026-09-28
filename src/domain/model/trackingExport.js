import {
  TRACKING_FILE,
  TRACKING_GROUPS_MAX,
  TRACKING_MUSCLE_GROUPS,
  TRACKING_NAME_MAX,
  TRACKING_ROUTINE_COLOR_IDS,
} from '../catalogs/tracking.js';

/**
 * Construye el archivo que Lomito Train importa: los ejercicios del plan una sola
 * vez, con sus grupos musculares ya traducidos al catalogo de Lomito Train, y una
 * rutina por dia que los referencia por clave.
 *
 * No lleva pesos ni repeticiones hechas: eso lo registra el cliente. Si lleva cuantas
 * series efectivas tiene cada ejercicio, para que Lomito Train cree las filas vacias.
 * Detalle del formato en docs/tracking-export.md.
 *
 * @param {object} plan Plan resuelto por resolvePlan.
 * @param {object} opciones
 * @param {string} opciones.title Nombre del plan tal como se muestra al importarlo.
 * @param {(routine: object) => string} opciones.routineName Nombre de cada rutina.
 * @param {Date} [opciones.now] Momento de la exportacion.
 * @returns {object} Contenido del archivo, listo para JSON.stringify.
 */
export function buildTrackingExport(plan, { title, routineName, now = new Date() }) {
  const exercises = new Map();

  for (const routine of plan.routines) {
    for (const item of routine.exercises) {
      const previo = exercises.get(item.exercise.id);
      // Un mismo ejercicio en dos rutinas es un solo ejercicio en Lomito Train; se
      // queda con el mayor numero de series que pida cualquiera de ellas.
      if (previo) {
        previo.setCount = Math.max(previo.setCount, item.sets);
        continue;
      }
      exercises.set(item.exercise.id, {
        key: item.exercise.id,
        name: recortar(item.exercise.name),
        muscleGroupIds: trackingGroups(item.exercise.muscleIds),
        equipmentId: item.exercise.equipmentId,
        setCount: item.sets,
      });
    }
  }

  return {
    ...TRACKING_FILE,
    exportedAt: now.toISOString(),
    title: recortar(title),
    data: {
      exercises: [...exercises.values()],
      routines: plan.routines.map((routine, indice) => ({
        name: recortar(routineName(routine)),
        colorId: TRACKING_ROUTINE_COLOR_IDS[indice % TRACKING_ROUTINE_COLOR_IDS.length],
        exerciseKeys: routine.exercises.map((item) => item.exercise.id),
      })),
    },
  };
}

/**
 * Grupos musculares de Lomito Train para una lista de musculos: los del musculo
 * principal primero, sin duplicados y dentro del maximo de Lomito Train.
 *
 * @param {string[]} muscleIds Musculos del catalogo de Lomito Workouts.
 * @returns {string[]}
 */
export function trackingGroups(muscleIds) {
  const grupos = muscleIds.flatMap((id) => TRACKING_MUSCLE_GROUPS[id] ?? []);
  return [...new Set(grupos)].slice(0, TRACKING_GROUPS_MAX);
}

/** Recorta un texto al maximo de Lomito Train, que rechaza los nombres mas largos. */
function recortar(texto) {
  return texto.length > TRACKING_NAME_MAX ? texto.slice(0, TRACKING_NAME_MAX).trimEnd() : texto;
}
