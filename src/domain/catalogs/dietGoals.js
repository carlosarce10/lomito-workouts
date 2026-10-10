/**
 * Catalogo de objetivos de la recomendacion nutrimental. Es distinto del objetivo del
 * plan (`goalId`): un cliente de hipertrofia puede estar en deficit. Los porcentajes
 * de ajuste y los gramos de proteina por kilo salen de docs/diet.md; el porcentaje de
 * grasas es el anadido documentado alli. La etiqueta vive en `catalog.dietGoals.*`.
 */
export const DIET_GOALS = [
  {
    id: 'deficit',
    adjustmentPercent: { min: -20, max: -10 },
    proteinPerKg: { min: 1.8, max: 2.2 },
    fatPercent: { min: 20, max: 25 },
  },
  {
    id: 'maintenance',
    adjustmentPercent: { min: -5, max: 5 },
    proteinPerKg: { min: 1.6, max: 2 },
    fatPercent: { min: 25, max: 30 },
  },
  // Recomponer (ganar musculo sin subir de peso) pide mas proteina que mantener: 1,8 a
  // 2,2 g/kg, la mitad alta del rango eficaz (Morton 2018: la ganancia se estabiliza
  // hacia 1,6 g/kg, con limite superior de 2,2). Deja que la carne de cada comida llegue
  // a 110-120 g aunque arroz, tortilla o frijoles ya traigan proteina.
  {
    id: 'recomposition',
    adjustmentPercent: { min: -5, max: 5 },
    proteinPerKg: { min: 1.8, max: 2.2 },
    fatPercent: { min: 25, max: 30 },
  },
  {
    id: 'surplus',
    adjustmentPercent: { min: 5, max: 10 },
    proteinPerKg: { min: 1.6, max: 2 },
    fatPercent: { min: 25, max: 30 },
  },
];

export const DIET_GOAL_IDS = DIET_GOALS.map((goal) => goal.id);

/** Devuelve el objetivo de dieta con ese id, o null si no existe. */
export const getDietGoal = (id) => DIET_GOALS.find((goal) => goal.id === id) ?? null;

/** Indica si un id pertenece al catalogo. */
export const isDietGoalId = (id) => DIET_GOAL_IDS.includes(id);
