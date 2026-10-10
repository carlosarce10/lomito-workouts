/**
 * Proveedores de imagenes (ejercicios y fotos de nutricion) y contrato de rutas.
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
  // Buscador de imagenes con licencia libre. No tiene baseUrl: la URL, el autor y la
  // licencia de cada foto se piden a su API al descargarla (npm run photos).
  {
    id: 'openverse',
    homepage: 'https://openverse.org',
    apiUrl: 'https://api.openverse.org/v1/images/',
    license: 'CC0, dominio publico o CC BY segun la foto',
  },
];

/**
 * Proveedores validos para las fotos de platos y suplementos. Una foto con `source`
 * vive en `public/nutrition/<id>.jpg`, igual que un ejercicio vive en su carpeta.
 */
export const NUTRITION_PHOTO_PROVIDER_IDS = ['openverse'];

const BY_ID = new Map(SOURCE_PROVIDERS.map((provider) => [provider.id, provider]));

/** Ids de proveedor validos. */
export const SOURCE_PROVIDER_IDS = SOURCE_PROVIDERS.map((provider) => provider.id);

/** Proveedor por id, o undefined si no existe. */
export const getSourceProvider = (id) => BY_ID.get(id);
