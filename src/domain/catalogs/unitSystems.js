/**
 * Sistema de unidades con el que un cliente lee su plan. Todo se guarda y se calcula
 * en metrico; `imperial` solo hace que la interfaz anada libras y onzas junto a los
 * kilos y litros. Sin etiqueta: no se muestra como tal.
 */
export const UNIT_SYSTEM_IDS = ['metric', 'imperial'];

export const DEFAULT_UNIT_SYSTEM_ID = 'metric';

/** Indica si un id pertenece al catalogo. */
export const isUnitSystemId = (id) => UNIT_SYSTEM_IDS.includes(id);
