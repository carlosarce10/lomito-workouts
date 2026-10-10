import { FOOD_GROUP_IDS, MEAL_IDS, NUTRITION_PHOTO_PROVIDER_IDS } from '../catalogs/index.js';
import { LIMITS } from '../validation/limits.js';
import * as r from '../validation/rules.js';

const macro = () => r.number({ ...LIMITS.foodMacro, decimals: 1 });

/**
 * Un alimento (`src/content/nutrition/foods.json`) descrito por UNA porcion de mano
 * de su grupo: cuanto pesa, como se mide en casa y que aporta. `measure` es la medida
 * casera de esa porcion ("1/2 taza", "2 piezas", "100 g") y `step` el redondeo al
 * escalarla, para no pedir 1,37 tortillas.
 */
export const foodSchema = {
  id: r.slug(),
  name: r.text(LIMITS.name),
  foodGroupId: r.oneOf(FOOD_GROUP_IDS),
  grams: r.number({ ...LIMITS.foodGrams, integer: true }),
  measure: {
    amount: r.number({ ...LIMITS.measureAmount, decimals: 2 }),
    unit: r.text(LIMITS.unit),
    unitPlural: r.text(LIMITS.unit),
    step: r.number({ ...LIMITS.measureStep, decimals: 2 }),
  },
  macros: { protein: macro(), carbs: macro(), fat: macro() },
};

/**
 * Un plato o snack sugerido (`plates.json`). Lista los alimentos sin cantidades: las
 * pone cada cliente, repartiendo sus porciones de cada grupo entre los alimentos del
 * plato de ese grupo.
 */
export const plateSchema = {
  id: r.slug(),
  name: r.text(LIMITS.name),
  mealIds: r.listOf({ valores: MEAL_IDS, ...LIMITS.plateMeals }),
  foodIds: r.slugList(LIMITS.plateItems),
  source: r.optional(r.source(NUTRITION_PHOTO_PROVIDER_IDS)),
};

/** Un suplemento recomendado (`supplements.json`), con su dosis y su explicacion. */
export const supplementSchema = {
  id: r.slug(),
  name: r.text(LIMITS.name),
  dose: r.text({ min: 1, max: LIMITS.text.max }),
  body: r.listOfText(LIMITS.supplementBody),
  source: r.optional(r.source(NUTRITION_PHOTO_PROVIDER_IDS)),
};

/** Forma de los tres archivos: una lista no vacia de su esquema. */
export const foodsSchema = { __each: foodSchema, __min: 1, __max: 80 };
export const platesSchema = { __each: plateSchema, __min: 1, __max: 40 };
export const supplementsSchema = { __each: supplementSchema, __min: 1, __max: 6 };
