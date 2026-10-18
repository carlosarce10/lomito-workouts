import {
  COUNTED_FOOD_GROUPS,
  DEFAULT_COUNTRY_ID,
  FOOD_GROUP_IDS,
  getMealSplit,
} from '../catalogs/index.js';

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
// Un envoltorio (tortilla, pan) lleva como poco esta parte de su relleno maximo por
// pieza: un taco de 40 g no baja de 20 g.
const MIN_FILLING_SHARE = 0.5;
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
// Suelos de proteina de calidad, en gramos. En una persona ligera, 0,3 g/kg se queda en
// 13-16 g (1 huevo y un poco de clara): 20 g aportan los 2-3 g de leucina que estimulan
// la sintesis casi al maximo (Moore 2009, Witard 2014). El snack es una toma de
// proteina mas, no un resto: 15 g evitan que quede en una rebanada de pavo.
const MIN_BREAKFAST_SOURCE_PROTEIN = 20;
const MIN_SNACK_SOURCE_PROTEIN = 15;
// Que comidas principales lleva un dia segun cuantas hace el cliente.
const MAIN_MEALS = {
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
 * @param {string} [input.countryId] Pais del cliente: solo entran los platos y
 *   reemplazos cuyos alimentos son faciles de conseguir alli.
 * @returns {{ ok: true, value: object } | { ok: false, error: 'orphanFood', foodId: string }}
 */
export function buildNutritionPlan({ diet, foods, plates, countryId = DEFAULT_COUNTRY_ID }) {
  const foodById = new Map(foods.map((food) => [food.id, food]));
  for (const plate of plates) {
    const huerfano = plate.foodIds.find((id) => !foodById.has(id));
    if (huerfano) return { ok: false, error: 'orphanFood', foodId: huerfano };
  }
  const delPais = foods.filter((food) => isAvailableIn(food, countryId));
  const platosDelPais = plates.filter((plate) =>
    plate.foodIds.every((id) => isAvailableIn(foodById.get(id), countryId)),
  );

  const meals = diet.mealsPerDay ?? 3;
  const portions = dailyPortions(diet, meals);
  const reparto = getMealSplit(diet.mealSplitId).dinner;
  const mid = ({ min, max }) => (min + max) / 2;
  const bodyMass = mid(diet.protein) / mid(diet.proteinPerKg);

  // Cada momento ofrece todos los platos que le corresponden. La primera opcion es la
  // sugerida y se elige distinta en cada momento cuando se puede, para que el dia de
  // ejemplo no repita plato.
  const usados = new Set();
  const momentos = daySlots(meals, portions.snacks).map((slot) => {
    // Una cena baja en carbohidratos no se arma con tortilla o pan como base: unos tacos
    // logicos llevarian 4 tortillas y unos de 1 tortilla no son tacos.
    const sinEnvoltorio = reparto && slot.mealId === 'dinner';
    const candidatos = platosDelPais.filter(
      (p) => p.mealIds.includes(slot.mealId) && !(sinEnvoltorio && p.carrier),
    );
    const sugerido = candidatos.find((p) => !usados.has(p.id)) ?? candidatos[0];
    if (sugerido) usados.add(sugerido.id);
    const ordenados = sugerido ? [sugerido, ...candidatos.filter((p) => p !== sugerido)] : [];
    return { ...slot, plates: ordenados };
  });

  // La proteina de cada comida sale de su fuente proteica (carne, pescado, huevo,
  // lacteo): la que traen arroz, frijoles o tortilla suma al dia pero no achica la
  // carne. Lo que falta para la mitad de cada rango del dia lo cubren los snacks.
  let resultado = null;
  for (const { gramosPorKg, cenaPorKg } of proteinSteps(reparto)) {
    const { resto, cena } = splitTargets(portions.mealTargets, reparto, meals);
    const objetivoComida = { ...resto, protein: gramosPorKg * bodyMass };
    const objetivoDesayuno = {
      ...resto,
      protein: Math.max(
        MIN_BREAKFAST_SOURCE_PROTEIN,
        Math.min(gramosPorKg, BREAKFAST_SOURCE_PROTEIN_PER_KG) * bodyMass,
      ),
    };
    const objetivoCena = cena ? { ...cena, protein: cenaPorKg * bodyMass } : objetivoComida;
    const objetivoDe = { breakfast: objetivoDesayuno, lunch: objetivoComida, dinner: objetivoCena };
    const verduraDe = (mealId) =>
      mealId === 'dinner' && reparto ? reparto.vegetables : VEGETABLES_PER_MEAL;
    const comidaDe = (mealId) => (plate) =>
      scalePlate(plate, objetivoDe[mealId], verduraDe(mealId), foodById);
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
    objetivoSnack.protein = Math.max(MIN_SNACK_SOURCE_PROTEIN, objetivoSnack.protein);
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
    resultado = { day, dayTotals, objetivoComida, objetivoDesayuno, objetivoCena, objetivoSnack };
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
  // Con un reparto que cambia la cena, la guia la cuenta aparte; si no, es null.
  portions.dinner = reparto
    ? {
        ...Object.fromEntries(
          COUNTED_FOOD_GROUPS.map((group) => [
            group.id,
            Math.max(
              PORTION_STEP,
              roundTo(resultado.objetivoCena[group.macro] / group.grams, PORTION_STEP),
            ),
          ]),
        ),
        vegetables: reparto.vegetables,
      }
    : null;
  const { day, dayTotals } = resultado;

  return {
    ok: true,
    value: {
      portions,
      day,
      dayTotals,
      swaps: FOOD_GROUP_IDS.map((foodGroupId) => ({
        foodGroupId,
        foods: delPais.filter((food) => food.foodGroupId === foodGroupId),
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
 * Indica si un alimento entra en la dieta de un pais: sin `countryIds`, en todos.
 *
 * @param {object} food Alimento de foods.json.
 * @param {string} countryId Id del catalogo de paises.
 * @returns {boolean}
 */
export const isAvailableIn = (food, countryId) =>
  !food.countryIds || food.countryIds.includes(countryId);

/**
 * Pasos de proteina de calidad por comida que se prueban hasta que el dia no pasa del
 * maximo. Sin reparto de cena, la cena va como la comida. Con el, la cena se queda en
 * su valor alto mientras bajan las demas comidas, y solo despues baja ella.
 */
function proteinSteps(reparto) {
  const pasos = SOURCE_PROTEIN_PER_KG.map((gramosPorKg) => ({
    gramosPorKg,
    cenaPorKg: reparto ? Math.max(gramosPorKg, reparto.sourceProteinPerKg) : gramosPorKg,
  }));
  if (!reparto) return pasos;
  const minimo = SOURCE_PROTEIN_PER_KG.at(-1);
  const cena = SOURCE_PROTEIN_PER_KG.filter((g) => g < reparto.sourceProteinPerKg);
  return [...pasos, ...cena.map((cenaPorKg) => ({ gramosPorKg: minimo, cenaPorKg }))];
}

/**
 * Gramos de carbohidratos y grasa de cada comida principal segun el reparto. Sin
 * reparto de cena, todas iguales. Con el, la cena se queda con su fraccion y lo que
 * suelta se suma a partes iguales a las demas comidas principales; lo que sus platos no
 * puedan llevar acaba en los snacks, que cubren lo que falta del dia.
 */
function splitTargets(mealTargets, reparto, meals) {
  if (!reparto) return { resto: mealTargets, cena: null };
  const dia = MAIN_MEALS[meals] ?? MAIN_MEALS[3];
  const cenas = dia.filter((mealId) => mealId === 'dinner').length;
  const otras = dia.length - cenas;
  const resto = { ...mealTargets };
  const cena = { ...mealTargets };
  for (const [macro, share] of [
    ['carbs', reparto.carbsShare],
    ['fat', reparto.fatShare],
  ]) {
    cena[macro] = mealTargets[macro] * share;
    resto[macro] = mealTargets[macro] + ((mealTargets[macro] - cena[macro]) * cenas) / otras;
  }
  return { resto, cena };
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
 * 2 1/2 porciones. Despues se redondea cada cantidad a su medida casera, y el envoltorio
 * (tortilla, pan) lleva las piezas que necesita su relleno aunque pase de su objetivo.
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

  // Cantidad de cada alimento en su medida casera, redondeada a su paso.
  const cantidades = new Map(
    alimentos
      .filter((food) => food.foodGroupId !== 'vegetables')
      .map((food) => {
        const { amount, step } = food.measure;
        return [food, Math.max(step, roundTo(porciones(food) * amount, step))];
      }),
  );
  if (plate.carrier) ajustarEnvoltorio(plate.carrier, alimentos, cantidades);

  const items = alimentos.map((food) => {
    const { amount } = food.measure;
    if (food.foodGroupId === 'vegetables') {
      return {
        food,
        free: true,
        quantity: { min: verdura.min * amount, max: verdura.max * amount },
        grams: null,
        macros: scaleMacros(food.macros, porcionesVerdura),
      };
    }
    const cantidad = cantidades.get(food);
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

/**
 * Deja el envoltorio (tortilla, pan) con las piezas que pide su relleno: cada pieza
 * lleva como mucho `fillingGrams` de alimento proteico y como poco la mitad. Un taco
 * va de 20 a 40 g: ni 130 g de pescado en 1 tortilla ni 70 g de pollo en 4. Si sobran
 * piezas, sus carbohidratos pasan al otro carbohidrato del plato (los frijoles de la
 * tinga, la papa de la hamburguesa) hasta su tope; lo que no cabe lo cubre el snack.
 * Cambia `cantidades` en su sitio.
 */
function ajustarEnvoltorio(carrier, alimentos, cantidades) {
  const envoltorio = alimentos.find((food) => food.id === carrier.foodId);
  const relleno = alimentos
    .filter((food) => food.foodGroupId === 'protein')
    .reduce((suma, food) => suma + (cantidades.get(food) / food.measure.amount) * food.grams, 0);
  const { amount } = envoltorio.measure;
  // Un sandwich o una hamburguesa van de dos en dos rebanadas: `carrier.step` lo dice.
  const step = carrier.step ?? envoltorio.measure.step;
  const minimo = Math.max(step, Math.ceil(relleno / carrier.fillingGrams / step) * step);
  const maximo = Math.max(
    minimo,
    Math.floor(relleno / (carrier.fillingGrams * MIN_FILLING_SHARE) / step) * step,
  );
  const antes = cantidades.get(envoltorio);
  const ahora = Math.min(maximo, Math.max(minimo, Math.round(antes / step) * step));
  cantidades.set(envoltorio, ahora);
  if (ahora >= antes) return;

  const sobran = ((antes - ahora) / amount) * envoltorio.macros.carbs;
  const otros = alimentos.filter(
    (food) => food.foodGroupId === 'carbs' && food !== envoltorio && cantidades.has(food),
  );
  for (const food of otros) {
    const medida = food.measure;
    const extra = (sobran / otros.length / food.macros.carbs) * medida.amount;
    const tope = MAX_CARB_PORTIONS_PER_FOOD * medida.amount;
    const nueva = Math.min(tope, roundTo(cantidades.get(food) + extra, medida.step));
    cantidades.set(food, Math.max(cantidades.get(food), nueva));
  }
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
