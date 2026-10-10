#!/usr/bin/env node
/**
 * Calcula la recomendacion nutrimental de un cliente e imprime el bloque `diet` listo
 * para pegar en public/clients/<slug>.json. Las entradas (peso, estatura, edad, sexo,
 * actividad) no se escriben en ningun archivo: solo viven en esta llamada.
 *
 * Uso: npm run diet -- --age 30 --height 170cm --body-mass 154lb --activity moderate --diet-goal deficit
 *      [--sex male|female] [--activity light:moderate] [--adjustment -15 | -20:-10]
 *      [--protein-per-kg 1.6:2] [--fat-percent 25:30] [--meals 3] [--date 2026-10-10]
 *
 * Peso en kg o lb (172lb, 78kg, 78); estatura en cm, m, in o pies y pulgadas (167cm,
 * 1.67m, 66in, 5'6"). Un rango se escribe min:max. Por stdout sale el JSON; por stderr,
 * las entradas en metrico y una lectura en texto. Sale con 1 si una entrada no vale.
 */
import { computeDiet } from '../src/domain/model/computeDiet.js';
import { toCentimeters, toKilograms, toPounds } from '../src/domain/model/units.js';
import { parseInteger } from '../src/domain/validation/parseDecimal.js';

import { describir } from './messages.mjs';

const USO = `Uso: npm run diet -- --age <anos> --height <estatura> --body-mass <peso> --activity <nivel> --diet-goal <deficit|maintenance|surplus>
  opcionales: --sex male|female  --activity <nivel:nivel>  --adjustment <%|%:%>  --protein-per-kg <g:g>  --fat-percent <%:%>  --meals <n>  --date YYYY-MM-DD`;

const argumentos = process.argv.slice(2);
if (argumentos.length === 0 || argumentos.includes('--help')) {
  console.error(USO);
  process.exit(argumentos.length === 0 ? 1 : 0);
}

/** Lee `--clave valor` y `--clave=valor` en un objeto plano. */
function leerOpciones(args) {
  const opciones = {};
  for (let i = 0; i < args.length; i += 1) {
    if (!args[i].startsWith('--')) fallar(`Argumento inesperado: ${args[i]}\n${USO}`);
    const [clave, enLinea] = args[i].slice(2).split('=');
    const valor = enLinea ?? args[i + 1];
    if (valor === undefined || valor.startsWith('--')) fallar(`Falta el valor de --${clave}`);
    if (enLinea === undefined) i += 1;
    opciones[clave] = valor;
  }
  return opciones;
}

function fallar(mensaje) {
  console.error(mensaje);
  process.exit(1);
}

/** "a:b" o "a" como rango numerico; devuelve null si no se entiende. */
function rango(texto) {
  if (texto === undefined) return undefined;
  const partes = texto.split(':').map((parte) => Number(parte.replace(',', '.')));
  if (partes.length > 2 || partes.some((n) => Number.isNaN(n))) return null;
  return { min: partes[0], max: partes[partes.length - 1] };
}

/** Fecha local de hoy como YYYY-MM-DD. */
function hoy() {
  const fecha = new Date();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

const opciones = leerOpciones(argumentos);
const requeridas = ['age', 'height', 'body-mass', 'activity', 'diet-goal'];
const faltan = requeridas.filter((clave) => !(clave in opciones));
if (faltan.length > 0) fallar(`Faltan: ${faltan.map((c) => `--${c}`).join(', ')}\n${USO}`);

const height = toCentimeters(opciones.height);
const bodyMass = toKilograms(opciones['body-mass']);
if (height === null)
  fallar(`No entiendo la estatura "${opciones.height}" (167cm, 1.67m, 66in, 5'6")`);
if (bodyMass === null) fallar(`No entiendo el peso "${opciones['body-mass']}" (78kg, 172lb)`);

const entrada = {
  sex: opciones.sex ?? null,
  age: parseInteger(opciones.age),
  height,
  bodyMass,
  activityIds: opciones.activity.split(':'),
  dietGoalId: opciones['diet-goal'],
  adjustmentPercent: rango(opciones.adjustment),
  proteinPerKg: rango(opciones['protein-per-kg']),
  fatPercent: rango(opciones['fat-percent']),
  mealsPerDay: opciones.meals === undefined ? undefined : parseInteger(opciones.meals),
  today: opciones.date ?? hoy(),
};
for (const [clave, valor] of Object.entries(entrada)) {
  if (valor === null && clave !== 'sex') fallar(`No entiendo --${clave}: ${opciones[clave]}`);
}

const resultado = computeDiet(entrada);
if (!resultado.ok) {
  console.error('Entradas no validas:');
  for (const issue of resultado.issues) console.error(`  ${describir('diet', issue)}`);
  process.exit(1);
}

const diet = resultado.value;
const r = ({ min, max }, unidad = '') =>
  min === max ? `${min}${unidad}` : `${min} a ${max}${unidad}`;

console.error(
  `Entradas (no se guardan): ${entrada.sex ?? 'sexo no indicado'}, ${entrada.age} anos, ${bodyMass} kg (${Math.round(toPounds(bodyMass))} lb), ${height} cm, actividad ${entrada.activityIds.join(' o ')}, objetivo ${diet.dietGoalId}`,
);
console.error(`  Gasto en reposo: ${r(diet.restingCalories, ' kcal')}`);
console.error(
  `  Mantenimiento: ${r(diet.maintenanceCalories, ' kcal')} (factor ${r(diet.activityFactor)})`,
);
console.error(
  `  Calorias objetivo: ${r(diet.targetCalories, ' kcal')} (${r(diet.adjustmentPercent, ' %')})`,
);
console.error(`  Proteina: ${r(diet.protein, ' g')} (${r(diet.proteinPerKg, ' g/kg')})`);
console.error(`  Grasas: ${r(diet.fat, ' g')} (${r(diet.fatPercent, ' % de las calorias')})`);
console.error(`  Carbohidratos: ${r(diet.carbs, ' g')}`);
console.error(`  Fibra: ${r(diet.fiber, ' g')}; agua: ${r(diet.water, ' ml')}`);
if (diet.mealsPerDay) {
  const porComida = {
    min: Math.round(diet.protein.min / diet.mealsPerDay / 5) * 5,
    max: Math.round(diet.protein.max / diet.mealsPerDay / 5) * 5,
  };
  console.error(`  Proteina por comida (${diet.mealsPerDay} comidas): ${r(porComida, ' g')}`);
}
console.error('');

console.log(JSON.stringify({ diet }, null, 2));
