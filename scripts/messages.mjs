/**
 * Traduce los codigos de validacion del dominio a texto en espanol. Lo comparten
 * check-content.mjs y compute-diet.mjs: el dominio devuelve codigos, los scripts
 * los imprimen.
 */
export const MENSAJES = {
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

/** Convierte un problema del dominio en una linea legible, con el archivo delante. */
export const describir = (archivo, { path, code, params = {} }) => {
  const mensaje = (MENSAJES[code] ?? code).replace(/\{(\w+)\}/g, (_, k) => params[k]);
  return `${archivo}: ${path || '(raiz)'} ${mensaje}`;
};
