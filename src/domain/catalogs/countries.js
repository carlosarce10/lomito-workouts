/**
 * Paises de los clientes. Deciden que platos ve cada uno: un alimento con `countryIds`
 * solo entra en la dieta de esos paises, porque en los demas cuesta encontrarlo (los
 * nopales en Estados Unidos). Sin etiqueta en la interfaz.
 */
export const COUNTRY_IDS = ['mx', 'us'];

export const DEFAULT_COUNTRY_ID = 'mx';

/** Indica si un id pertenece al catalogo. */
export const isCountryId = (id) => COUNTRY_IDS.includes(id);
