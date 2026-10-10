import { COUNTED_FOOD_GROUPS, FOOD_GROUP_IDS } from '../catalogs/index.js';

// Parte de las porciones del dia que va a las comidas principales; el resto, a snacks.
const MAIN_SHARE = 0.8;
// Las porciones se redondean a media: "1 1/2 palmas" se entiende, "1,37" no.
const PORTION_STEP = 0.5;
// La verdura no se cuenta: de 1 a 2 punos por comida, libre; en el snack, opcional.
const VEGETABLES_PER_MEAL = { min: 1, max: 2 };
const VEGETABLES_IN_SNACK = { min: 0.5, max: 1 };
// Vueltas del ajuste de cada plato y tope de porciones de un grupo en un plato.
const FIT_ROUNDS = 25;
const MAX_PORTIONS = 8;
// Tope practico de una sola fuente de carbohidratos en un plato (2 1/2 punos: unos
// 1 1/4 tazas de arroz). Lo que no cabe en las comidas pasa a los snacks.
const MAX_CARB_PORTIONS_PER_FOOD = 2.5;
// Proteina de calidad por comida principal, en g por kg (0,4-0,55, Schoenfeld y Aragon
// 2018). Se prueba de mayor a menor y se queda el primero que no pasa del maximo del dia.
const SOURCE_PROTEIN_PER_KG = [0.55, 0.5, 0.45, 0.4];
// El desayuno puede ser mas ligero: 0,3 g/kg (unos 20-25 g en un adulto) ya estimula la
// sintesis muscular casi al maximo en una comida (Moore 2009, Witard 2014). Asi no hacen
// falta 3 huevos y claras para llegar a la cifra de la comida o la cena.
const BREAKFAST_SOURCE_PROTEIN_PER_KG = 0.3;
// Que comidas principales lleva un dia segun cuantas hace el cliente.
const MAIN_MEALS = {
  2: ['lunch', 'dinner'],
  3: ['breakfast', 'lunch', 'dinner'],
  4: ['breakfast', 'lunch', 'lunch', 'dinner'],
  5: ['breakfast', 'lunch', 'lunch', 'dinner', 'dinner'],
  6: ['breakfast', 'breakfast', 'lunch', 'lunch', 'dinner', 'dinner'],
};
// Por encima de estas calorias, lo que va a snacks se parte en dos: uno a media manana
// y otro por la tarde. Por debajo, un solo snack por la tarde, entre comida y cena.
const TWO_SNACKS_FROM_KCAL = 450;

/**
 * Convierte la recomendacion nutrimental de un cliente en algo que se puede comer:
 * cuantas porciones de mano lleva cada comida y cada snack, el dia ordenado (desayuno,
 * snacks entre comidas, comida y cena) con todas las opciones de plato de cada momento
 * ajustadas a sus gramos, lo que suma el dia con las opciones sugeridas y los
 * reemplazos de cada grupo. Es una funcion pura sobre el bloque `diet` (resultados, no
 * datos personales), asi que puede correr en el navegador.
 *
 * @param {object} input
 * @param {object} input.diet Bloque `diet` del cliente, ya resuelto.
 * @param {object[]} input.foods Alimentos de src/content/nutrition/foods.json.
 * @param {object[]} input.plates Platos de src/content/nutrition/plates.json.
 * @returns {{ ok: true, value: object } | { ok: false, error: 'orphanFood', foodId: string }}
 */
export function buildNutritionPlan({ diet, foods, plates }) {
  const foodById = new Map(foods.map((food) => [food.id, food]));
  for (const plate of plates) {
    const huerfano = plate.foodIds.find((id) => !foodById.has(id));
    if (huerfano) return { ok: false, error: 'orphanFood', foodId: huerfano };
  }

  const meals = diet.mealsPerDay ?? 3;
  const portions = dailyPortions(diet, meals);
  const mid = ({ min, max }) => (min + max) / 2;
  const bodyMass = mid(diet.protein) / mid(diet.proteinPerKg);

  // Cada momento ofrece todos los platos que le corresponden. La primera opcion es la
  // sugerida y se elige distinta en cada momento cuando se puede, para que el dia de
  // ejemplo no repita plato.
  const usados = new Set();
  const momentos = daySlots(meals, portions.snacks).map((slot) => {
    const candidatos = plates.filter((p) => p.mealIds.includes(slot.mealId));
    const sugerido = candidatos.find((p) => !usados.has(p.id)) ?? candidatos[0];
    if (sugerido) usados.add(sugerido.id);
    const ordenados = sugerido ? [sugerido, ...candidatos.filter((p) => p !== sugerido)] : [];
    return { ...slot, plates: ordenados };
  });

  // La proteina de cada comida sale de su fuente proteica (carne, pescado, huevo,
  // lacteo): la que traen arroz, frijoles o tortilla suma al dia pero no achica la
  // carne. Lo que falta para la mitad de cada rango del dia lo cubren los snacks.
  let resultado = null;
  for (const gramosPorKg of SOURCE_PROTEIN_PER_KG) {
    const objetivoComida = { ...portions.mealTargets, protein: gramosPorKg * bodyMass };
    const objetivoDesayuno = {
      ...portions.mealTargets,
      protein: Math.min(gramosPorKg, BREAKFAST_SOURCE_PROTEIN_PER_KG) * bodyMass,
    };
    const comidaDe = (mealId) => (plate) =>
      scalePlate(
        plate,
        mealId === 'breakfast' ? objetivoDesayuno : objetivoComida,
        VEGETABLES_PER_MEAL,
        foodById,
      );
    const principales = momentos
      .filter((slot) => slot.mealId !== 'snack' && slot.plates.length > 0)
      .map((slot) => comidaDe(slot.mealId)(slot.plates[0]).totals);
    const enComidas = sumMacros(principales);
    const objetivoSnack = {};
    for (const macro of ['protein', 'carbs', 'fat']) {
      objetivoSnack[macro] = Math.max(0, mid(diet[macro]) - enComidas[macro]) / portions.snacks;
    }
    // El snack sugerido tambien trae proteina de su avena o su granola: se descuenta de
    // la que tiene que poner su alimento proteico.
    const snackSugerido = momentos.find((slot) => slot.mealId === 'snack')?.plates[0];
    if (snackSugerido) {
      const prueba = scalePlate(snackSugerido, objetivoSnack, null, foodById).totals;
      objetivoSnack.protein = Math.max(
        0,
        objetivoSnack.protein - (prueba.protein - prueba.sourceProtein),
      );
    }
    const snack = (plate) => scalePlate(plate, objetivoSnack, null, foodById);
    const day = momentos.map(({ plates: opciones, ...slot }) => ({
      ...slot,
      options: opciones.map(slot.mealId === 'snack' ? snack : comidaDe(slot.mealId)),
    }));
    const sugeridos = day.filter((slot) => slot.options.length > 0).map((slot) => slot.options[0]);
    const dayTotals = sumTotals(sugeridos.map((entry) => entry.totals));
    dayTotals.sourceProtein = sugeridos.reduce(
      (suma, entry) => suma + entry.totals.sourceProtein,
      0,
    );
    resultado = { day, dayTotals, objetivoComida, objetivoDesayuno, objetivoSnack };
    if (dayTotals.protein <= diet.protein.max) break;
  }

  // La guia de porciones de mano refleja los gramos con los que se armo el dia.
  for (const group of COUNTED_FOOD_GROUPS) {
    portions.perMeal[group.id] = Math.max(
      PORTION_STEP,
      roundTo(resultado.objetivoComida[group.macro] / group.grams, PORTION_STEP),
    );
    portions.snack[group.id] = roundTo(
      resultado.objetivoSnack[group.macro] / group.grams,
      PORTION_STEP,
    );
  }
  // En el desayuno basta con menos proteina: la guia lo dice aparte.
  const palma = COUNTED_FOOD_GROUPS.find((group) => group.id === 'protein').grams;
  portions.breakfastProtein = Math.max(
    PORTION_STEP,
    roundTo(resultado.objetivoDesayuno.protein / palma, PORTION_STEP),
  );
  const { day, dayTotals } = resultado;

  return {
    ok: true,
    value: {
      portions,
      day,
      dayTotals,
      swaps: FOOD_GROUP_IDS.map((foodGroupId) => ({
        foodGroupId,
        foods: foods.filter((food) => food.foodGroupId === foodGroupId),
      })),
    },
  };
}

/**
 * Gramos que le tocan a cada comida principal y a cada snack, y su traduccion a
 * porciones de mano para la guia visual. Las comidas se llevan MAIN_SHARE del dia a
 * partes iguales; el resto va a uno o dos snacks segun cuantas calorias sume.
 */
function dailyPortions(diet, meals) {
  const daily = {};
  const perMeal = { vegetables: VEGETABLES_PER_MEAL };
  const snack = { vegetables: null };
  const mealTargets = {};
  const snackTargets = {};
  for (const group of COUNTED_FOOD_GROUPS) {
    const gramos = (diet[group.macro].min + diet[group.macro].max) / 2;
    mealTargets[group.macro] = (gramos * MAIN_SHARE) / meals;
    snackTargets[group.macro] = gramos * (1 - MAIN_SHARE);
    daily[group.id] = roundTo(gramos / group.grams, PORTION_STEP);
    perMeal[group.id] = Math.max(
      PORTION_STEP,
      roundTo(mealTargets[group.macro] / group.grams, PORTION_STEP),
    );
  }
  const kcalSnacks = snackTargets.protein * 4 + snackTargets.carbs * 4 + snackTargets.fat * 9;
  const snacks = kcalSnacks > TWO_SNACKS_FROM_KCAL ? 2 : 1;
  for (const group of COUNTED_FOOD_GROUPS) {
    snackTargets[group.macro] /= snacks;
    snack[group.id] = roundTo(snackTargets[group.macro] / group.grams, PORTION_STEP);
  }
  return { meals, snacks, daily, perMeal, snack, mealTargets, snackTargets };
}

/**
 * Orden del dia: las comidas principales y los snacks entre ellas. Con un snack, va
 * entre la comida y la cena; con dos, uno a media manana y otro por la tarde.
 */
function daySlots(meals, snacks) {
  const dia = (MAIN_MEALS[meals] ?? MAIN_MEALS[3]).map((mealId) => ({ id: mealId, mealId }));
  dia.splice(dia.length - 1, 0, { id: 'afternoonSnack', mealId: 'snack' });
  if (snacks === 2) dia.splice(1, 0, { id: 'morningSnack', mealId: 'snack' });
  return dia;
}

/**
 * Escala un plato a los gramos de proteina, carbohidratos y grasa de una comida. Las
 * cantidades se ajustan por iteracion proporcional: cada grupo se multiplica por
 * objetivo / total de su macro hasta que el plato cuadra. La proteina cuenta solo la
 * de los alimentos proteicos, para que la guarnicion no achique la carne; carbohidratos
 * y grasa cuentan todo (el huevo trae grasa). Ninguna fuente de carbohidratos pasa de
 * 2 1/2 porciones. Despues se redondea cada cantidad a su medida casera.
 */
function scalePlate(plate, targets, vegetables, foodById) {
  const alimentos = plate.foodIds.map((id) => foodById.get(id));
  const contados = COUNTED_FOOD_GROUPS.filter((g) => alimentos.some((f) => f.foodGroupId === g.id));
  const porGrupo = new Map();
  for (const food of alimentos)
    porGrupo.set(food.foodGroupId, (porGrupo.get(food.foodGroupId) ?? 0) + 1);

  const verdura = vegetables ?? VEGETABLES_IN_SNACK;
  const porcionesVerdura = (verdura.min + verdura.max) / 2;
  const factor = Object.fromEntries(contados.map((g) => [g.id, targets[g.macro] / g.grams]));
  const porciones = (food) =>
    food.foodGroupId === 'vegetables'
      ? porcionesVerdura
      : (factor[food.foodGroupId] ?? 0) / porGrupo.get(food.foodGroupId);

  // El tope del grupo: de carbohidratos, 2 1/2 porciones por alimento; del resto, 8.
  const tope = (group) =>
    group.id === 'carbs' ? MAX_CARB_PORTIONS_PER_FOOD * porGrupo.get('carbs') : MAX_PORTIONS;
  // La proteina se ajusta solo con lo que aportan los alimentos proteicos.
  const deFuente = (food) => food.foodGroupId === 'protein';

  for (let vuelta = 0; vuelta < FIT_ROUNDS; vuelta += 1) {
    const total = sumMacros(alimentos.map((food) => scaleMacros(food.macros, porciones(food))));
    total.protein = sumMacros(
      alimentos.filter(deFuente).map((food) => scaleMacros(food.macros, porciones(food))),
    ).protein;
    for (const group of contados) {
      if (total[group.macro] > 0) {
        factor[group.id] = Math.min(
          tope(group),
          factor[group.id] * (targets[group.macro] / total[group.macro]),
        );
      }
    }
  }

  const items = alimentos.map((food) => {
    const { amount, step } = food.measure;
    if (food.foodGroupId === 'vegetables') {
      return {
        food,
        free: true,
        quantity: { min: verdura.min * amount, max: verdura.max * amount },
        grams: null,
        macros: scaleMacros(food.macros, porcionesVerdura),
      };
    }
    const cantidad = Math.max(step, roundTo(porciones(food) * amount, step));
    const reales = cantidad / amount;
    return {
      food,
      free: false,
      quantity: { min: cantidad, max: cantidad },
      grams: roundTo(reales * food.grams, 5),
      macros: scaleMacros(food.macros, reales),
    };
  });

  const totals = sumTotals(items.map((item) => item.macros));
  totals.sourceProtein = Math.round(
    sumMacros(items.filter((item) => deFuente(item.food)).map((item) => item.macros)).protein,
  );
  return { plate, items, totals };
}

const scaleMacros = ({ protein, carbs, fat }, factor) => ({
  protein: protein * factor,
  carbs: carbs * factor,
  fat: fat * factor,
});

const sumMacros = (lista) =>
  lista.reduce(
    (acc, m) => ({
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 },
  );

/** Suma macros y anade las calorias (4, 4 y 9 kcal por gramo), todo redondeado. */
function sumTotals(lista) {
  const suma = sumMacros(lista);
  return {
    protein: Math.round(suma.protein),
    carbs: Math.round(suma.carbs),
    fat: Math.round(suma.fat),
    calories: roundTo(suma.protein * 4 + suma.carbs * 4 + suma.fat * 9, 10),
  };
}

/** Redondea al multiplo mas cercano de `step`, sin arrastrar error de coma flotante. */
function roundTo(value, step) {
  return Number((Math.round(value / step + 1e-9) * step).toFixed(2));
}
