#!/usr/bin/env node
/**
 * Comprueba el contenido: biblioteca de ejercicios, metodologia, nutricion (consejos,
 * alimentos, platos, suplementos y sus fotos), clientes e imagenes.
 *
 * No hay TypeScript ni validacion en tiempo de ejecucion: este script es la unica
 * puerta que cruza un JSON antes de entrar al build, y por eso corre dentro de
 * `npm run check`. Importa los esquemas y catalogos del dominio directamente, sin
 * Vite: de ahi que en src/domain los imports relativos lleven extension.
 *
 * Falla si encuentra:
 *  - un JSON que no cumple su esquema
 *  - un ejercicio cuyo archivo no se llama como su id, o que vive en la carpeta
 *    equivocada (la carpeta es el grupo de su primer musculo)
 *  - un id de ejercicio repetido
 *  - un cliente cuyo archivo no tiene forma de slug de cliente
 *  - un exerciseId que no existe en la biblioteca, o repetido dentro de una rutina
 *  - una alternativa que no existe, que es el mismo ejercicio, que ya esta en la rutina
 *    o que no comparte el musculo principal del ejercicio al que sustituye
 *  - dos rutinas con el mismo nombre en un cliente
 *  - un campo de seguimiento o una palabra prohibida del vocabulario
 *  - una imagen que falta para un ejercicio con source (aviso hasta la fase 3)
 * Avisa, sin fallar, de los ejercicios que ningun cliente usa.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import {
  COUNTRY_IDS,
  getMuscleGroup,
  GROUP_IDS,
  IMAGE_FRAMES,
  MEAL_IDS,
} from '../src/domain/catalogs/index.js';
import { isAvailableIn } from '../src/domain/model/nutritionPlan.js';
import { clientSchema } from '../src/domain/schemas/client.schema.js';
import { dietContentSchema } from '../src/domain/schemas/diet.schema.js';
import {
  foodsSchema,
  platesSchema,
  supplementsSchema,
} from '../src/domain/schemas/nutrition.schema.js';
import { exerciseSchema } from '../src/domain/schemas/exercise.schema.js';
import { methodologySchema } from '../src/domain/schemas/methodology.schema.js';
import { LIMITS } from '../src/domain/validation/limits.js';
import { isClientSlug } from '../src/domain/validation/slugs.js';
import { validate } from '../src/domain/validation/validate.js';

import { describir } from './messages.mjs';

const BIBLIOTECA = join('src', 'content', 'exercises');
const METODOLOGIA = join('src', 'content', 'methodology.json');
const NUTRICION = join('src', 'content', 'nutrition');
const DIETA = join(NUTRICION, 'diet.json');
const ALIMENTOS = join(NUTRICION, 'foods.json');
const PLATOS = join(NUTRICION, 'plates.json');
const SUPLEMENTOS = join(NUTRICION, 'supplements.json');
const FOTOS = join('public', 'nutrition');
const CLIENTES = join('public', 'clients');
const IMAGENES = join('public', 'exercises');

// Desde la fase 3 una imagen que falta es un error: npm run images la descarga.
const IMAGES_REQUIRED = true;

// Nada de seguimiento (eso es Lomito Train), ninguna palabra prohibida del vocabulario y
// ninguna entrada de la recomendacion nutrimental: en el JSON solo entran resultados metricos.
const PROHIBIDOS = [
  'weight',
  'record',
  'history',
  'session',
  'timer',
  'log',
  'day',
  'category',
  'program',
  'bodyMass',
  'height',
  'age',
  'sex',
  'activityId',
  'activityIds',
  'menu',
  'lb',
  'pounds',
  'oz',
];

const errores = [];
const avisos = [];

function recorrer(dir, ext, salida = []) {
  if (!existsSync(dir)) return salida;
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) recorrer(ruta, ext, salida);
    else if (ruta.endsWith(ext)) salida.push(ruta);
  }
  return salida;
}

/** Lee un JSON o registra el error de sintaxis. Devuelve null si no se pudo leer. */
function leer(archivo) {
  try {
    return JSON.parse(readFileSync(archivo, 'utf8'));
  } catch (error) {
    errores.push(`${archivo}: JSON invalido (${error.message})`);
    return null;
  }
}

/** Busca claves prohibidas en cualquier profundidad. */
function buscarProhibidos(archivo, valor, ruta = '') {
  if (Array.isArray(valor)) {
    valor.forEach((item, i) => buscarProhibidos(archivo, item, `${ruta}[${i}]`));
    return;
  }
  if (valor === null || typeof valor !== 'object') return;
  for (const [clave, hijo] of Object.entries(valor)) {
    const rutaHijo = ruta ? `${ruta}.${clave}` : clave;
    if (PROHIBIDOS.includes(clave)) {
      errores.push(`${archivo}: ${rutaHijo} es un campo prohibido (${clave})`);
    }
    buscarProhibidos(archivo, hijo, rutaHijo);
  }
}

// ── Biblioteca ──────────────────────────────────────────────────────────────
const biblioteca = new Map();
for (const archivo of recorrer(BIBLIOTECA, '.json').sort()) {
  const ejercicio = leer(archivo);
  if (!ejercicio) continue;

  const { ok, issues } = validate(exerciseSchema, ejercicio);
  if (!ok) issues.forEach((issue) => errores.push(describir(archivo, issue)));
  buscarProhibidos(archivo, ejercicio);

  const carpeta = basename(dirname(archivo));
  if (!GROUP_IDS.includes(carpeta)) {
    errores.push(`${archivo}: la carpeta "${carpeta}" no es un grupo muscular del catalogo`);
  } else if (ok && getMuscleGroup(ejercicio.muscleIds[0]) !== carpeta) {
    errores.push(
      `${archivo}: el primer musculo es "${ejercicio.muscleIds[0]}" y la carpeta deberia ser "${getMuscleGroup(ejercicio.muscleIds[0])}"`,
    );
  }
  if (basename(archivo, '.json') !== ejercicio.id) {
    errores.push(`${archivo}: el archivo no se llama como su id "${ejercicio.id}"`);
  }
  if (biblioteca.has(ejercicio.id)) {
    errores.push(
      `${archivo}: el id "${ejercicio.id}" ya existe en ${biblioteca.get(ejercicio.id).archivo}`,
    );
  }
  biblioteca.set(ejercicio.id, { ...ejercicio, archivo, usado: false });

  if (ejercicio.source) {
    for (const frame of IMAGE_FRAMES) {
      const imagen = join(IMAGENES, ejercicio.id, frame);
      if (!existsSync(imagen)) {
        (IMAGES_REQUIRED ? errores : avisos).push(`${archivo}: falta la imagen ${imagen}`);
      }
    }
  }
}

// ── Metodologia ─────────────────────────────────────────────────────────────
const metodologia = leer(METODOLOGIA);
if (metodologia) {
  const { ok, issues } = validate(methodologySchema, metodologia);
  if (!ok) issues.forEach((issue) => errores.push(describir(METODOLOGIA, issue)));
  buscarProhibidos(METODOLOGIA, metodologia);
}

// ── Nutricion: consejos, alimentos, platos, suplementos y sus fotos ─────────
/** Valida un archivo contra su esquema y devuelve su contenido, o null. */
function validarArchivo(archivo, schema) {
  const datos = leer(archivo);
  if (!datos) return null;
  const { ok, issues } = validate(schema, datos);
  if (!ok) issues.forEach((issue) => errores.push(describir(archivo, issue)));
  buscarProhibidos(archivo, datos);
  return ok ? datos : null;
}

validarArchivo(DIETA, dietContentSchema);
const alimentos = validarArchivo(ALIMENTOS, foodsSchema) ?? [];
const platos = validarArchivo(PLATOS, platesSchema) ?? [];
const suplementos = validarArchivo(SUPLEMENTOS, supplementsSchema) ?? [];

const idsDeAlimento = new Set();
alimentos.forEach((alimento, i) => {
  if (idsDeAlimento.has(alimento.id))
    errores.push(`${ALIMENTOS}: [${i}] repite el id "${alimento.id}"`);
  idsDeAlimento.add(alimento.id);
});
// Platos y suplementos comparten carpeta de fotos: sus ids no pueden chocar.
const idsConFoto = new Set();
for (const [archivo, lista] of [
  [PLATOS, platos],
  [SUPLEMENTOS, suplementos],
]) {
  lista.forEach((item, i) => {
    if (idsConFoto.has(item.id)) errores.push(`${archivo}: [${i}] repite el id "${item.id}"`);
    idsConFoto.add(item.id);
    if (item.source && !existsSync(join(FOTOS, `${item.id}.jpg`))) {
      errores.push(`${archivo}: falta la foto ${join(FOTOS, `${item.id}.jpg`)} (npm run photos)`);
    }
  });
}
platos.forEach((plato, i) => {
  if (plato.carrier && !plato.foodIds.includes(plato.carrier.foodId)) {
    errores.push(`${PLATOS}: [${i}].carrier "${plato.carrier.foodId}" no esta en sus foodIds`);
  }
  for (const foodId of plato.foodIds) {
    if (!idsDeAlimento.has(foodId)) {
      errores.push(`${PLATOS}: [${i}].foodIds "${foodId}" no existe en ${ALIMENTOS}`);
    }
  }
});

// Cada comida principal ofrece variedad propia en cada pais: un minimo de platos que
// se consiguen alli y como mucho unos pocos compartidos con otro momento del dia. El
// snack no cuenta como comida principal.
const alimentoPorId = new Map(alimentos.map((alimento) => [alimento.id, alimento]));
for (const countryId of COUNTRY_IDS) {
  const delPais = platos.filter((plato) =>
    plato.foodIds?.every(
      (id) => alimentoPorId.has(id) && isAvailableIn(alimentoPorId.get(id), countryId),
    ),
  );
  // La cena proteica no ofrece platos con envoltorio: tambien necesita sus 5 opciones.
  const cenasSinEnvoltorio = delPais.filter(
    (plato) => plato.mealIds?.includes('dinner') && !plato.carrier,
  );
  if (cenasSinEnvoltorio.length < LIMITS.mainMealPlates.min) {
    errores.push(
      `${PLATOS}: la cena tiene ${cenasSinEnvoltorio.length} platos sin tortilla ni pan como envoltorio en "${countryId}"; minimo ${LIMITS.mainMealPlates.min}`,
    );
  }
  for (const mealId of MEAL_IDS.filter((id) => id !== 'snack')) {
    const delMomento = delPais.filter((plato) => plato.mealIds?.includes(mealId));
    const compartidos = delMomento.filter((plato) => plato.mealIds.length > 1);
    if (delMomento.length < LIMITS.mainMealPlates.min) {
      errores.push(
        `${PLATOS}: "${mealId}" tiene ${delMomento.length} platos en "${countryId}"; minimo ${LIMITS.mainMealPlates.min}`,
      );
    }
    if (compartidos.length > LIMITS.sharedPlatesPerMeal.max) {
      errores.push(
        `${PLATOS}: "${mealId}" comparte ${compartidos.length} platos con otros momentos en "${countryId}"; maximo ${LIMITS.sharedPlatesPerMeal.max}`,
      );
    }
  }
}

// El snack es una toma de proteina: todo plato de snack lleva al menos un alimento
// proteico, para que el suelo de proteina del snack se pueda cumplir con cualquiera.
const grupoDe = new Map(alimentos.map((alimento) => [alimento.id, alimento.foodGroupId]));
platos.forEach((plato, i) => {
  if (!plato.mealIds?.includes('snack')) return;
  if (!plato.foodIds?.some((id) => grupoDe.get(id) === 'protein')) {
    errores.push(`${PLATOS}: [${i}] "${plato.id}" es snack y no lleva ningun alimento proteico`);
  }
});

// ── Clientes ────────────────────────────────────────────────────────────────
const clientes = recorrer(CLIENTES, '.json').sort();
for (const archivo of clientes) {
  const cliente = leer(archivo);
  if (!cliente) continue;

  const slug = basename(archivo, '.json');
  if (!isClientSlug(slug)) {
    errores.push(`${archivo}: el archivo no tiene forma de slug de cliente (nombre-xxxx)`);
  }

  const { ok, issues } = validate(clientSchema, cliente);
  if (!ok) issues.forEach((issue) => errores.push(describir(archivo, issue)));
  buscarProhibidos(archivo, cliente);
  if (!ok || !Array.isArray(cliente.routines)) continue;

  const nombresDeRutina = new Set();
  cliente.routines.forEach((rutina, i) => {
    if (nombresDeRutina.has(rutina.name)) {
      errores.push(`${archivo}: routines[${i}] repite el nombre "${rutina.name}"`);
    }
    nombresDeRutina.add(rutina.name);

    const vistos = new Set();
    rutina.exercises.forEach((item, j) => {
      const ruta = `routines[${i}].exercises[${j}].exerciseId`;
      if (!biblioteca.has(item.exerciseId)) {
        errores.push(`${archivo}: ${ruta} "${item.exerciseId}" no existe en la biblioteca`);
      } else {
        biblioteca.get(item.exerciseId).usado = true;
      }
      if (vistos.has(item.exerciseId)) {
        errores.push(`${archivo}: ${ruta} "${item.exerciseId}" se repite en la misma rutina`);
      }
      vistos.add(item.exerciseId);

      // La alternativa sustituye al ejercicio: existe, es otro, no esta ya en la rutina
      // (si no, el cliente haria lo mismo dos veces) y comparte el musculo principal: el
      // primero de uno lo trabaja el otro. Asi una bisagra de cadera (lumbares) puede
      // sustituirse por otra (pull through) aunque su primer musculo sea distinto.
      if (!item.alternativeId) return;
      const rutaAlt = `routines[${i}].exercises[${j}].alternativeId`;
      const alternativa = biblioteca.get(item.alternativeId);
      const principal = biblioteca.get(item.exerciseId);
      if (!alternativa) {
        errores.push(`${archivo}: ${rutaAlt} "${item.alternativeId}" no existe en la biblioteca`);
        return;
      }
      alternativa.usado = true;
      if (item.alternativeId === item.exerciseId) {
        errores.push(`${archivo}: ${rutaAlt} es el mismo ejercicio que exerciseId`);
      }
      if (rutina.exercises.some((otro) => otro.exerciseId === item.alternativeId)) {
        errores.push(`${archivo}: ${rutaAlt} "${item.alternativeId}" ya esta en la rutina`);
      }
      const comparten =
        principal &&
        (alternativa.muscleIds.includes(principal.muscleIds[0]) ||
          principal.muscleIds.includes(alternativa.muscleIds[0]));
      if (principal && !comparten) {
        errores.push(
          `${archivo}: ${rutaAlt} "${item.alternativeId}" no trabaja el musculo principal de "${item.exerciseId}"`,
        );
      }
    });
  });
}

for (const ejercicio of biblioteca.values()) {
  if (!ejercicio.usado) avisos.push(`${ejercicio.archivo}: ningun cliente usa "${ejercicio.id}"`);
}

// ── Resultado ───────────────────────────────────────────────────────────────
for (const aviso of avisos) console.warn(`  aviso: ${aviso}`);

if (errores.length > 0) {
  console.error(`\nContenido: ${errores.length} problema(s)\n`);
  for (const e of errores) console.error(`  ${e}`);
  console.error('');
  process.exit(1);
}
console.log(
  `Contenido correcto: ${biblioteca.size} ejercicios, ${clientes.length} cliente(s), ${metodologia?.sections.length ?? 0} secciones de metodologia, ${alimentos.length} alimentos, ${platos.length} platos, ${suplementos.length} suplementos.`,
);
