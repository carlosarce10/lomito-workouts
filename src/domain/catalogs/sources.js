/**
 * Proveedores de imagenes de ejercicio y contrato de rutas.
 *
 * Un ejercicio con `source` tiene sus dos fotogramas en
 * `public/exercises/<id>/<frame>`, los descargue quien los descargue. Ese contrato
 * es lo que permite sustituir un proveedor por material propio sin tocar codigo:
 * se cambia `source` y se reemplazan los archivos.
 */
export const IMAGE_FRAMES = ['0.jpg', '1.jpg'];

export const SOURCE_PROVIDERS = [
  {
    id: 'free-exercise-db',
    homepage: 'https://github.com/yuhonas/free-exercise-db',
    baseUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/',
    license: 'Unlicense',
  },
];

const BY_ID = new Map(SOURCE_PROVIDERS.map((provider) => [provider.id, provider]));

/** Ids de proveedor validos. */
export const SOURCE_PROVIDER_IDS = SOURCE_PROVIDERS.map((provider) => provider.id);

/** Proveedor por id, o undefined si no existe. */
export const getSourceProvider = (id) => BY_ID.get(id);
