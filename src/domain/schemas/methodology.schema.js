import { LIMITS } from '../validation/limits.js';
import * as r from '../validation/rules.js';

/**
 * Forma de `src/content/methodology.json`: los valores por defecto que hereda
 * todo ejercicio prescrito, las secciones educativas y el ejemplo de progresion.
 */
export const methodologySchema = {
  defaults: {
    sets: r.number({ ...LIMITS.sets, integer: true }),
    warmupSets: r.number({ ...LIMITS.warmupSets, integer: true }),
    rir: r.range({ ...LIMITS.rir, integer: true }),
    restSeconds: r.range({ ...LIMITS.restSeconds, integer: true }),
    cardioMinutes: r.number({ ...LIMITS.cardioMinutes, integer: true }),
  },
  sections: {
    __each: {
      id: r.slug(),
      title: r.text(LIMITS.name),
      body: r.listOfText(LIMITS.methodologyBody),
    },
    __min: LIMITS.methodologySections.min,
    __max: LIMITS.methodologySections.max,
  },
  progressionExample: {
    title: r.text(LIMITS.name),
    steps: r.listOfText({ ...LIMITS.progressionSteps, itemMax: LIMITS.text.max }),
  },
};
