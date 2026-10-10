#!/usr/bin/env node
/**
 * Descarga la foto de cada plato y suplemento con `source` a public/nutrition/<id>.jpg
 * y escribe su atribucion. Se ejecuta a mano cuando cambian los platos; las fotos se
 * versionan para que el sitio nunca dependa de un host externo en tiempo de ejecucion.
 *
 * Uso: npm run photos              las que falten
 *      npm run photos -- <id>...   solo esos ids
 *      npm run photos -- --force   vuelve a descargar aunque exista
 *
 * Openverse no tiene una URL fija por foto: el script pide a su API la URL original,
 * el autor y la licencia, y con eso escribe ATTRIBUTION.md en cada ejecucion. Con sips
 * (macOS) convierte a JPEG y reduce a 640 px de ancho con calidad 75.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getSourceProvider } from '../src/domain/catalogs/index.js';

const CONTENIDO = join('src', 'content', 'nutrition');
const DESTINO = join('public', 'nutrition');
const ATRIBUCION = join(DESTINO, 'ATTRIBUTION.md');
const ANCHO = 640;
const CALIDAD = 75;
const SIPS = '/usr/bin/sips';

const argumentos = process.argv.slice(2);
const forzar = argumentos.includes('--force');
const soloIds = argumentos.filter((a) => !a.startsWith('--'));
const tieneSips = process.platform === 'darwin' && existsSync(SIPS);

const leer = (archivo) => JSON.parse(readFileSync(join(CONTENIDO, archivo), 'utf8'));
const conFoto = [...leer('plates.json'), ...leer('supplements.json')].filter((item) => item.source);
const pendientes = conFoto.filter((item) => soloIds.length === 0 || soloIds.includes(item.id));
const desconocidos = soloIds.filter((id) => !pendientes.some((item) => item.id === id));
if (desconocidos.length > 0) {
  console.error(`Sin source en platos ni suplementos: ${desconocidos.join(', ')}`);
  process.exit(1);
}

/** Pide a Openverse los datos de una foto: URL original, autor, licencia y pagina. */
async function metadatos(item) {
  const proveedor = getSourceProvider(item.source.provider);
  const respuesta = await fetch(`${proveedor.apiUrl}${item.source.id}/`, {
    headers: { 'User-Agent': 'lomito-workouts (npm run photos)' },
  });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} al pedir los datos de ${item.id}`);
  return respuesta.json();
}

/** Descarga y convierte una foto si falta. Devuelve true si la bajo. */
async function descargar(item, datos) {
  const destino = join(DESTINO, `${item.id}.jpg`);
  if (existsSync(destino) && !forzar) return false;

  const respuesta = await fetch(datos.url, { headers: { 'User-Agent': 'lomito-workouts' } });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} al bajar ${datos.url}`);
  writeFileSync(destino, new Uint8Array(await respuesta.arrayBuffer()));
  if (tieneSips) {
    execFileSync(
      SIPS,
      [
        '-s',
        'format',
        'jpeg',
        '-s',
        'formatOptions',
        String(CALIDAD),
        '--resampleWidth',
        String(ANCHO),
        destino,
      ],
      { stdio: 'ignore' },
    );
  }
  // Un 200 con una pagina de error en lugar de la foto no puede colarse en public/.
  const bytes = readFileSync(destino);
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error(`${datos.url} no es una imagen JPEG`);
  return true;
}

function escribirAtribucion(filas) {
  const lineas = [
    '# Atribucion de las fotos de nutricion',
    '',
    'Archivos descargados por `npm run photos` (scripts/fetch-nutrition-photos.mjs) desde',
    'Openverse. Cada foto conserva su licencia; las CC BY exigen citar al autor, y aqui se',
    'cita. Para usar una foto propia, se quita `source` del plato y se coloca el archivo.',
    '',
    '| Archivo | Titulo | Autor | Licencia | Origen |',
    '| --- | --- | --- | --- | --- |',
    ...filas.map(
      ({ item, datos }) =>
        `| \`${item.id}.jpg\` | ${limpiar(datos.title)} | ${limpiar(datos.creator ?? 'desconocido')} | ${datos.license.toUpperCase()} ${datos.license_version ?? ''} | ${datos.foreign_landing_url} |`,
    ),
    '',
  ];
  writeFileSync(ATRIBUCION, `${lineas.join('\n')}\n`);
}

const limpiar = (texto) =>
  String(texto ?? '')
    .replace(/\|/g, '/')
    .trim();

try {
  mkdirSync(DESTINO, { recursive: true });
  const filas = [];
  let bajadas = 0;
  for (const item of conFoto) {
    const datos = await metadatos(item);
    filas.push({ item, datos });
    if (pendientes.includes(item) && (await descargar(item, datos))) bajadas += 1;
  }
  escribirAtribucion(filas);
  console.log(
    `Fotos: ${bajadas} descargada(s) de ${conFoto.length}${tieneSips ? ', en JPEG de 640 px' : ''}. Atribucion en ${ATRIBUCION}.`,
  );
} catch (error) {
  console.error(`\nFotos: ${error.message}\n`);
  process.exit(1);
}
