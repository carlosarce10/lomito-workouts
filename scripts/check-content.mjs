#!/usr/bin/env node
/**
 * Comprueba el contenido: biblioteca de ejercicios, metodologia, clientes e imagenes.
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
 *  - dos rutinas con el mismo nombre en un cliente
 *  - un campo de seguimiento o una palabra prohibida del vocabulario
 *  - una imagen que falta para un ejercicio con source (aviso hasta la fase 3)
 * Avisa, sin fallar, de los ejercicios que ningun cliente usa.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { getMuscleGroup, GROUP_IDS, IMAGE_FRAMES } from '../src/domain/catalogs/index.js';
import { clientSchema } from '../src/domain/schemas/client.schema.js';
import { exerciseSchema } from '../src/domain/schemas/exercise.schema.js';
import { methodologySchema } from '../src/domain/schemas/methodology.schema.js';
import { isClientSlug } from '../src/domain/validation/slugs.js';
import { validate } from '../src/domain/validation/validate.js';

const BIBLIOTECA = join('src', 'content', 'exercises');
const METODOLOGIA = join('src', 'content', 'methodology.json');
const CLIENTES = join('public', 'clients');
const IMAGENES = join('public', 'exercises');

// Desde la fase 3 una imagen que falta es un error: npm run images la descarga.
const IMAGES_REQUIRED = true;

// Nada de seguimiento (eso es Lomito Train) y ninguna palabra prohibida del vocabulario.
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
];

const MENSAJES = {
  required: 'es obligatorio',
  tooShort: 'es demasiado corto (minimo {min})',
  tooLong: 'es demasiado largo (maximo {max})',
  notANumber: 'no es un numero',
  notInteger: 'no es un entero',
  tooSmall: 'es menor que {min}',
  tooLarge: 'es mayor que {max}',
  tooPrecise: 'tiene mas de {decimals} decimales',
  notInCatalog: 'no esta en el catalogo',
  notAList: 'no es una lista',
  tooFewItems: 'tiene menos de {min} elementos',
  tooManyItems: 'tiene mas de {max} elementos',
  duplicateItems: 'tiene elementos repetidos',
  notAnObject: 'no es un objeto',
  notARange: 'no es un rango { min, max }',
  invalidRange: 'tiene min mayor que max',
  invalidSlug: 'no es un identificador en kebab-case',
  invalidDate: 'no es una fecha YYYY-MM-DD',
  invalidSourceId: 'no es un id de proveedor valido',
};

const errores = [];
const avisos = [];

/** Convierte un problema del dominio en una linea legible. */
const describir = (archivo, { path, code, params = {} }) => {
  const mensaje = (MENSAJES[code] ?? code).replace(/\{(\w+)\}/g, (_, k) => params[k]);
  return `${archivo}: ${path || '(raiz)'} ${mensaje}`;
};

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
  `Contenido correcto: ${biblioteca.size} ejercicios, ${clientes.length} cliente(s), ${metodologia?.sections.length ?? 0} secciones de metodologia.`,
);
