import { getActivityFactor, getDietGoal } from '../catalogs/index.js';
import { dietInputSchema } from '../schemas/diet.schema.js';
import { validate } from '../validation/validate.js';

/**
 * Calcula la recomendacion nutrimental de un cliente con las reglas de docs/diet.md:
 * gasto en reposo por Mifflin-St Jeor, mantenimiento por factor de actividad, ajuste
 * por objetivo, proteina por kilo, y los anadidos de grasas, carbohidratos, fibra y
 * agua. Todo sale como rango y redondeado para no fingir precision.
 *
 * Redondeos, contrastados con los ejemplos de docs/diet.md: gasto en reposo a
 * 10 kcal; mantenimiento a 100 kcal, calculado sobre el gasto sin redondear; calorias
 * objetivo a 50 kcal, con las mitades exactas hacia el mantenimiento; proteina, grasas,
 * carbohidratos y fibra a 5 g; agua a 100 ml. Los carbohidratos salen de los puntos
 * medios de proteina y grasas para que su rango siga al de calorias y no sume extremos.
 *
 * Es una funcion pura: no lee la fecha ni escribe archivos. No corre en el navegador
 * porque sus entradas no entran en el repositorio; la ejecuta `npm run diet`.
 *
 * @param {object} input
 * @param {'female'|'male'|null} [input.sex] Sexo de la ecuacion; sin el, rango entre ambas constantes.
 * @param {number} input.age Edad en anos.
 * @param {number} input.height Estatura en cm.
 * @param {number} input.bodyMass Peso corporal en kg.
 * @param {string[]} input.activityIds Uno o dos ids de `ACTIVITY_LEVELS`; dos cuando hay duda.
 * @param {string} input.dietGoalId Id de `DIET_GOALS`.
 * @param {{min:number,max:number}} [input.adjustmentPercent] Ajuste sobre el mantenimiento; sin el, el del objetivo.
 * @param {{min:number,max:number}} [input.proteinPerKg] Gramos por kilo; sin el, los del objetivo.
 * @param {{min:number,max:number}} [input.fatPercent] Porcentaje de calorias en grasas; sin el, el del objetivo.
 * @param {number} [input.mealsPerDay] Comidas al dia, solo para repartir la proteina.
 * @param {string} input.today Fecha del calculo, YYYY-MM-DD.
 * @returns {{ ok: true, value: object } | { ok: false, issues: Array<{ path: string, code: string, params?: object }> }}
 */
export function computeDiet(input) {
  const { ok, issues } = validate(dietInputSchema, input);
  if (!ok) return { ok: false, issues };

  const { sex = null, age, height, bodyMass, activityIds, dietGoalId, mealsPerDay = null } = input;
  const goal = getDietGoal(dietGoalId);
  const adjustmentPercent = input.adjustmentPercent ?? goal.adjustmentPercent;
  const proteinPerKg = input.proteinPerKg ?? goal.proteinPerKg;
  const fatPercent = input.fatPercent ?? goal.fatPercent;

  const restingRaw = restingEnergy({ sex, age, height, bodyMass });
  const activityFactor = factorRange(activityIds);
  const maintenanceRaw = {
    min: restingRaw.min * activityFactor.min,
    max: restingRaw.max * activityFactor.max,
  };
  const maintenanceCalories = mapRange(maintenanceRaw, (v) => roundTo(v, 100));
  const targetCalories = targetRange(maintenanceCalories, adjustmentPercent);

  const protein = mapRange(proteinPerKg, (gPorKg) => roundTo(bodyMass * gPorKg, 5));
  const fat = fatRange(targetCalories, fatPercent, bodyMass);
  const carbs = carbsRange(targetCalories, protein, fat);
  if (carbs.min < CARBS_FLOOR) {
    return {
      ok: false,
      issues: [{ path: 'carbs', code: 'tooSmall', params: { min: CARBS_FLOOR } }],
    };
  }

  return {
    ok: true,
    value: {
      dietGoalId,
      activityFactor,
      adjustmentPercent,
      restingCalories: mapRange(restingRaw, (v) => roundTo(v, 10)),
      maintenanceCalories,
      targetCalories,
      proteinPerKg,
      protein,
      fatPercent,
      fat,
      carbs,
      fiber: mapRange(targetCalories, (kcal) => roundTo((FIBER_PER_1000_KCAL * kcal) / 1000, 5)),
      water: {
        min: roundTo(WATER_ML_PER_KG.min * bodyMass, 100),
        max: roundTo(WATER_ML_PER_KG.max * bodyMass, 100),
      },
      ...(mealsPerDay === null ? {} : { mealsPerDay }),
      calculatedAt: input.today,
    },
  };
}

// Constantes de Mifflin-St Jeor (docs/diet.md, seccion 2).
const SEX_CONSTANT = { male: 5, female: -161 };
// Anadidos documentados en docs/diet.md: suelo de grasas, fibra y agua.
const FAT_FLOOR_G_PER_KG = 0.6;
const CARBS_FLOOR = 50;
const FIBER_PER_1000_KCAL = 14;
const WATER_ML_PER_KG = { min: 30, max: 35 };
// Banda que abre un objetivo puntual (docs/diet.md: 2040 kcal se muestra como 2000-2100).
const POINT_BAND = 0.025;

/** Gasto en reposo sin redondear; sin sexo, el rango entre la constante femenina y la masculina. */
function restingEnergy({ sex, age, height, bodyMass }) {
  const base = 10 * bodyMass + 6.25 * height - 5 * age;
  if (sex) return { min: base + SEX_CONSTANT[sex], max: base + SEX_CONSTANT[sex] };
  return { min: base + SEX_CONSTANT.female, max: base + SEX_CONSTANT.male };
}

/** Factor de actividad como rango: un id es un punto, dos ids son sus extremos. */
function factorRange(activityIds) {
  const factores = activityIds.map(getActivityFactor).sort((a, b) => a - b);
  return { min: factores[0], max: factores[factores.length - 1] };
}

/** Calorias objetivo: mantenimiento ajustado, con banda si queda en un punto. */
function targetRange(maintenance, adjustment) {
  const anchor = (maintenance.min + maintenance.max) / 2;
  let min = maintenance.min * (1 + adjustment.min / 100);
  let max = maintenance.max * (1 + adjustment.max / 100);
  if (min === max) {
    min *= 1 - POINT_BAND;
    max *= 1 + POINT_BAND;
  }
  return { min: roundToward(min, 50, anchor), max: roundToward(max, 50, anchor) };
}

/** Grasas por porcentaje de calorias, nunca por debajo del suelo por kilo. */
function fatRange(target, percent, bodyMass) {
  const suelo = roundTo(FAT_FLOOR_G_PER_KG * bodyMass, 5);
  const min = roundTo((target.min * percent.min) / 100 / 9, 5);
  const max = roundTo((target.max * percent.max) / 100 / 9, 5);
  return { min: Math.max(min, suelo), max: Math.max(max, suelo) };
}

/** Carbohidratos: lo que queda de las calorias tras proteina y grasas medias. */
function carbsRange(target, protein, fat) {
  const proteinaMedia = (protein.min + protein.max) / 2;
  const grasaMedia = (fat.min + fat.max) / 2;
  const resto = (kcal) => (kcal - proteinaMedia * 4 - grasaMedia * 9) / 4;
  return { min: roundTo(resto(target.min), 5), max: roundTo(resto(target.max), 5) };
}

/** Aplica una funcion a los dos extremos de un rango. */
const mapRange = ({ min, max }, fn) => ({ min: fn(min), max: fn(max) });

/** Redondea al multiplo mas cercano de `step`; la mitad exacta sube. */
function roundTo(value, step) {
  return Math.round(value / step + 1e-9) * step;
}

/** Redondea al multiplo mas cercano de `step`; la mitad exacta va hacia `anchor`. */
function roundToward(value, step, anchor) {
  const lower = Math.floor(value / step + 1e-9) * step;
  const upper = lower + step;
  const half = lower + step / 2;
  if (Math.abs(value - half) < 1e-9) {
    return Math.abs(lower - anchor) <= Math.abs(upper - anchor) ? lower : upper;
  }
  return value - lower < upper - value ? lower : upper;
}
