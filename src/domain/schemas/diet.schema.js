import { ACTIVITY_IDS, DIET_GOAL_IDS, SEX_IDS } from '../catalogs/index.js';
import { LIMITS } from '../validation/limits.js';
import * as r from '../validation/rules.js';

/**
 * Entradas de `computeDiet`. Se validan antes de calcular y nunca se escriben en un
 * JSON de contenido: lint:content prohibe estas claves. Peso en kg y estatura en cm,
 * ya convertidos; `activityIds` admite dos niveles cuando hay duda entre ambos.
 */
export const dietInputSchema = {
  sex: r.optional(r.oneOf(SEX_IDS)),
  age: r.number({ ...LIMITS.age, integer: true }),
  height: r.number({ ...LIMITS.height, decimals: 1 }),
  bodyMass: r.number({ ...LIMITS.bodyMass, decimals: 1 }),
  activityIds: r.listOf({ valores: ACTIVITY_IDS, min: 1, max: 2 }),
  dietGoalId: r.oneOf(DIET_GOAL_IDS),
  adjustmentPercent: r.optional(r.range({ ...LIMITS.adjustmentPercent, integer: true })),
  proteinPerKg: r.optional(r.range(LIMITS.proteinPerKg)),
  fatPercent: r.optional(r.range({ ...LIMITS.fatPercent, integer: true })),
  mealsPerDay: r.optional(r.number({ ...LIMITS.mealsPerDay, integer: true })),
  today: r.plainDate(),
};

/**
 * Forma de `src/content/diet.json`: consejos cortos que se leen de un vistazo y las
 * secciones que explican de donde salen los numeros, plegadas al final.
 */
export const dietContentSchema = {
  tips: r.listOfText(LIMITS.dietTips),
  sections: {
    __each: {
      id: r.slug(),
      title: r.text(LIMITS.name),
      body: r.listOfText(LIMITS.sectionBody),
    },
    __min: LIMITS.dietSections.min,
    __max: LIMITS.dietSections.max,
  },
};
