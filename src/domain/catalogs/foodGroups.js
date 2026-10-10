/**
 * Grupos de alimentos y su porcion de mano. Una porcion es una medida que el cliente
 * lleva siempre encima: la palma para la proteina, el puno para carbohidratos y
 * verdura, el pulgar para la grasa. `grams` es lo que aporta una porcion del macro
 * del grupo, y con eso se convierten los gramos del dia en porciones. La verdura no
 * se cuenta: es libre. Solo ids y numeros; etiquetas e iconos los pone la interfaz.
 */
export const FOOD_GROUPS = [
  { id: 'protein', macro: 'protein', grams: 25 },
  { id: 'carbs', macro: 'carbs', grams: 25 },
  { id: 'fat', macro: 'fat', grams: 10 },
  { id: 'vegetables', macro: null, grams: null },
];

export const FOOD_GROUP_IDS = FOOD_GROUPS.map((group) => group.id);

/** Grupos que se cuentan en porciones; la verdura queda fuera. */
export const COUNTED_FOOD_GROUPS = FOOD_GROUPS.filter((group) => group.macro);

/** Grupo por id, o null si no existe. */
export const getFoodGroup = (id) => FOOD_GROUPS.find((group) => group.id === id) ?? null;
