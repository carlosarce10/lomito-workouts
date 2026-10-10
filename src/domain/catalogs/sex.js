/**
 * Sexo que usa la ecuacion de Mifflin-St Jeor (constantes distintas). Solo es entrada
 * del calculo: no se guarda ni se muestra. Ausente significa "prefiere no decirlo" y
 * el resultado se da como rango entre las dos constantes.
 */
export const SEX_IDS = ['female', 'male'];

/** Indica si un id pertenece al catalogo. */
export const isSexId = (id) => SEX_IDS.includes(id);
