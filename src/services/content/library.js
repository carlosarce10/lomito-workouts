// Unico glob del proyecto. La biblioteca entra al bundle: son unas decenas de JSON
// pequenos y cada plan necesita casi todos. Los clientes no van por aqui a proposito:
// con import.meta.glob el mapa de chunks expondria todos los slugs en el JS principal.
const MODULES = import.meta.glob('../../content/exercises/*/*.json', {
  eager: true,
  import: 'default',
});

/**
 * Biblioteca de ejercicios indexada por id. Que el id coincida con el nombre del
 * archivo lo exige lint:content, asi que la clave del glob no hace falta aqui.
 */
export const LIBRARY = new Map(Object.values(MODULES).map((exercise) => [exercise.id, exercise]));
