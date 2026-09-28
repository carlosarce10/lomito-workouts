import { EQUIPMENT_IDS, MUSCLE_IDS, SOURCE_PROVIDER_IDS } from '../catalogs/index.js';
import { LIMITS } from '../validation/limits.js';
import * as r from '../validation/rules.js';

/**
 * Forma de un ejercicio de la biblioteca (`src/content/exercises/<grupo>/<id>.json`).
 * Que el archivo se llame como el `id` y viva en la carpeta de `muscleIds[0]` lo
 * comprueba lint:content, que es quien conoce el sistema de archivos.
 */
export const exerciseSchema = {
  id: r.slug(),
  name: r.text(LIMITS.name),
  muscleIds: r.listOf({ valores: MUSCLE_IDS, ...LIMITS.musclesPerExercise }),
  equipmentId: r.oneOf(EQUIPMENT_IDS),
  instructions: r.listOfText({ ...LIMITS.instructions, itemMax: LIMITS.text.max }),
  commonMistakes: r.listOfText({ ...LIMITS.commonMistakes, itemMax: LIMITS.text.max }),
  source: r.optional(r.source(SOURCE_PROVIDER_IDS)),
};
