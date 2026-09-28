/**
 * Catalogo de musculos y de sus grupos.
 *
 * Un grupo es la carpeta de la biblioteca (`src/content/exercises/<grupo>/`) y el
 * color del chip. Guarda solo ids y colores: la etiqueta vive en i18n
 * (`catalog.muscles.*`), porque un catalogo describe datos y una etiqueta legible
 * es presentacion. Los colores son dato, no tema: no cambian con el esquema.
 */
export const GROUPS = [
  { id: 'chest', color: '#f472b6' },
  { id: 'back', color: '#38bdf8' },
  { id: 'shoulders', color: '#fb923c' },
  { id: 'biceps', color: '#c084fc' },
  { id: 'triceps', color: '#818cf8' },
  { id: 'forearms', color: '#a3e635' },
  { id: 'core', color: '#facc15' },
  { id: 'quads', color: '#34d399' },
  { id: 'hamstrings', color: '#2dd4bf' },
  { id: 'glutes', color: '#fb7185' },
  { id: 'adductors', color: '#e879f9' },
  { id: 'calves', color: '#94a3b8' },
];

export const MUSCLES = [
  { id: 'chest', group: 'chest' },
  { id: 'chest-upper', group: 'chest' },
  { id: 'lats', group: 'back' },
  { id: 'back-upper', group: 'back' },
  { id: 'back-lower', group: 'back' },
  { id: 'shoulders-front', group: 'shoulders' },
  { id: 'shoulders-side', group: 'shoulders' },
  { id: 'shoulders-rear', group: 'shoulders' },
  { id: 'biceps', group: 'biceps' },
  { id: 'triceps', group: 'triceps' },
  { id: 'forearms', group: 'forearms' },
  { id: 'abs', group: 'core' },
  { id: 'quads', group: 'quads' },
  { id: 'hamstrings', group: 'hamstrings' },
  { id: 'glutes', group: 'glutes' },
  { id: 'adductors', group: 'adductors' },
  { id: 'calves', group: 'calves' },
];

const GROUPS_BY_ID = new Map(GROUPS.map((group) => [group.id, group]));
const MUSCLES_BY_ID = new Map(MUSCLES.map((muscle) => [muscle.id, muscle]));

/** Ids de grupo validos, en orden de declaracion. Son las carpetas de la biblioteca. */
export const GROUP_IDS = GROUPS.map((group) => group.id);

/** Ids de musculo validos, en orden de declaracion. */
export const MUSCLE_IDS = MUSCLES.map((muscle) => muscle.id);

/** Indica si un id pertenece al catalogo de musculos. */
export const isMuscleId = (id) => MUSCLES_BY_ID.has(id);

/** Grupo de un musculo, o cadena vacia si el id no esta en el catalogo. */
export const getMuscleGroup = (id) => MUSCLES_BY_ID.get(id)?.group ?? '';

/** Color del grupo de un musculo, o el color de respaldo si no esta en el catalogo. */
export const getMuscleColor = (id) => GROUPS_BY_ID.get(getMuscleGroup(id))?.color ?? '#94a3b8';
