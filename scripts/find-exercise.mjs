#!/usr/bin/env node
/**
 * Busca ejercicios en free-exercise-db por texto y muestra el id que va en
 * `source.id`, el equipamiento, los musculos y cuantas imagenes tiene.
 *
 * Uso: node scripts/find-exercise.mjs lateral raise
 */
import { getSourceProvider } from '../src/domain/catalogs/index.js';

const texto = process.argv.slice(2).join(' ').trim().toLowerCase();
if (!texto) {
  console.error('Uso: node scripts/find-exercise.mjs <texto a buscar>');
  process.exit(1);
}

const proveedor = getSourceProvider('free-exercise-db');
const INDICE = `${proveedor.homepage.replace('github.com', 'raw.githubusercontent.com')}/main/dist/exercises.json`;

try {
  const respuesta = await fetch(INDICE);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} al pedir ${INDICE}`);
  const ejercicios = await respuesta.json();
  const encontrados = ejercicios.filter((e) => e.name.toLowerCase().includes(texto));
  if (encontrados.length === 0) {
    console.log(`Nada en free-exercise-db para "${texto}".`);
    process.exit(0);
  }
  for (const e of encontrados.slice(0, 25)) {
    console.log(
      `${e.id}\n  ${e.name} | ${e.equipment ?? 'sin equipamiento'} | ${e.primaryMuscles.join(', ')} | ${e.level} | ${e.images.length} imagen(es)`,
    );
  }
  if (encontrados.length > 25)
    console.log(`... y ${encontrados.length - 25} mas. Afina la busqueda.`);
} catch (error) {
  console.error(`\nBusqueda: ${error.message}\n`);
  process.exit(1);
}
