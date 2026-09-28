#!/usr/bin/env node
/**
 * Descarga los dos fotogramas de cada ejercicio con `source` a public/exercises/<id>/
 * y escribe la atribucion. Se ejecuta a mano cuando cambia la biblioteca; los
 * archivos se versionan para que el sitio nunca dependa del proveedor en tiempo de
 * ejecucion.
 *
 * Uso: npm run images              todos los ejercicios con source
 *      npm run images -- <id>...   solo esos ids
 *      npm run images -- --force   vuelve a descargar aunque el archivo exista
 *
 * En macOS, si existe sips, reduce cada imagen a 640 px de ancho con calidad 75:
 * las originales miden 850 px y en pantalla se muestran a menos de 200.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getSourceProvider, IMAGE_FRAMES, SOURCE_PROVIDERS } from '../src/domain/catalogs/index.js';

const BIBLIOTECA = join('src', 'content', 'exercises');
const DESTINO = join('public', 'exercises');
const ATRIBUCION = join(DESTINO, 'ATTRIBUTION.md');
const ANCHO = 640;
const CALIDAD = 75;
const CONCURRENCIA = 4;
const SIPS = '/usr/bin/sips';

const argumentos = process.argv.slice(2);
const forzar = argumentos.includes('--force');
const soloIds = argumentos.filter((a) => !a.startsWith('--'));
const tieneSips = process.platform === 'darwin' && existsSync(SIPS);

function recorrer(dir, salida = []) {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) recorrer(ruta, salida);
    else if (ruta.endsWith('.json')) salida.push(ruta);
  }
  return salida;
}

const biblioteca = recorrer(BIBLIOTECA)
  .sort()
  .map((archivo) => JSON.parse(readFileSync(archivo, 'utf8')))
  .filter((ejercicio) => ejercicio.source);

const pendientes = biblioteca.filter(
  (ejercicio) => soloIds.length === 0 || soloIds.includes(ejercicio.id),
);
const desconocidos = soloIds.filter((id) => !pendientes.some((e) => e.id === id));
if (desconocidos.length > 0) {
  console.error(`Sin source en la biblioteca: ${desconocidos.join(', ')}`);
  process.exit(1);
}

/** Descarga los fotogramas que falten de un ejercicio. Devuelve cuantos bajo. */
async function descargar(ejercicio) {
  const proveedor = getSourceProvider(ejercicio.source.provider);
  if (!proveedor?.baseUrl) return 0;

  const carpeta = join(DESTINO, ejercicio.id);
  mkdirSync(carpeta, { recursive: true });
  let descargadas = 0;

  for (const frame of IMAGE_FRAMES) {
    const destino = join(carpeta, frame);
    if (existsSync(destino) && !forzar) continue;

    const url = `${proveedor.baseUrl}${ejercicio.source.id}/${frame}`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} al pedir ${url}`);
    const bytes = new Uint8Array(await respuesta.arrayBuffer());
    // Un 200 con una pagina de error en lugar de la foto no puede colarse en public/.
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error(`${url} no es un JPEG`);
    writeFileSync(destino, bytes);

    if (tieneSips) {
      execFileSync(
        SIPS,
        [
          '--resampleWidth',
          String(ANCHO),
          '--setProperty',
          'formatOptions',
          String(CALIDAD),
          destino,
        ],
        { stdio: 'ignore' },
      );
    }
    descargadas += 1;
  }
  return descargadas;
}

/** Escribe ATTRIBUTION.md con todos los ejercicios que tienen source. */
function escribirAtribucion() {
  const lineas = [
    '# Atribucion de las imagenes',
    '',
    'Archivos descargados por `npm run images` (scripts/fetch-exercise-images.mjs).',
    'Ver la seccion Imagenes de docs/content.md.',
    '',
  ];
  for (const proveedor of SOURCE_PROVIDERS) {
    const propios = biblioteca.filter((e) => e.source.provider === proveedor.id);
    if (propios.length === 0) continue;
    lineas.push(
      `## ${proveedor.id}`,
      '',
      `Origen: ${proveedor.homepage}. Licencia: ${proveedor.license}.`,
      '',
      '| Ejercicio | Id en el proveedor | URL de origen |',
      '| --- | --- | --- |',
      ...propios.map(
        (e) => `| \`${e.id}\` | \`${e.source.id}\` | ${proveedor.baseUrl}${e.source.id}/ |`,
      ),
      '',
    );
  }
  writeFileSync(ATRIBUCION, `${lineas.join('\n')}\n`);
}

try {
  let total = 0;
  for (let i = 0; i < pendientes.length; i += CONCURRENCIA) {
    const lote = pendientes.slice(i, i + CONCURRENCIA);
    const resultados = await Promise.all(lote.map(descargar));
    total += resultados.reduce((suma, n) => suma + n, 0);
  }
  escribirAtribucion();
  console.log(
    `Imagenes: ${total} archivo(s) descargado(s) para ${pendientes.length} ejercicio(s)${tieneSips ? ', reducidas a 640 px' : ''}. Atribucion en ${ATRIBUCION}.`,
  );
} catch (error) {
  console.error(`\nImagenes: ${error.message}\n`);
  process.exit(1);
}
