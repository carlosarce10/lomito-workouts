/**
 * Catalogo de repartos de la dieta entre las comidas principales. `even` reparte por
 * igual (el de siempre). `protein-dinner` es para quien cena fuerte: la cena lleva la
 * proteina de calidad mas alta (0,55 g/kg, unos 40 g en un adulto, como la toma antes
 * de dormir de Res 2012 y Snijders 2015), una fraccion de los carbohidratos y la grasa
 * de una comida pareja y mas verdura para que siga siendo una cena abundante. Lo que
 * deja la cena pasa al desayuno y la comida, y la cena no ofrece tacos, tostadas ni
 * sandwiches (platos con `carrier`). Solo ids y numeros; sin etiqueta en la interfaz.
 */
export const MEAL_SPLITS = [
  { id: 'even', dinner: null },
  {
    id: 'protein-dinner',
    dinner: {
      sourceProteinPerKg: 0.55,
      carbsShare: 0.3,
      fatShare: 0.5,
      vegetables: { min: 2, max: 3 },
    },
  },
];

export const MEAL_SPLIT_IDS = MEAL_SPLITS.map((split) => split.id);

export const DEFAULT_MEAL_SPLIT_ID = 'even';

/** Reparto por id; el parejo si el id no esta en el catalogo. */
export const getMealSplit = (id) =>
  MEAL_SPLITS.find((split) => split.id === id) ??
  MEAL_SPLITS.find((split) => split.id === DEFAULT_MEAL_SPLIT_ID);

/** Indica si un id pertenece al catalogo. */
export const isMealSplitId = (id) => MEAL_SPLIT_IDS.includes(id);
