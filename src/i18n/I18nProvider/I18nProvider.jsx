import { useMemo } from 'react';

import { CATALOGS } from '../catalogs';
import { LANGUAGE } from '../config';
import { formatDate, formatNumber, pluralCategory } from '../format';
import { I18nContext } from '../I18nContext';

/**
 * Provee el idioma activo y la funcion de traduccion a todo el arbol.
 *
 * No hay seleccion de idioma ni preferencia guardada: el idioma es una constante y
 * el atributo lang del documento ya lo fija index.html.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
export default function I18nProvider({ children }) {
  const language = LANGUAGE;

  const valor = useMemo(() => {
    /** Resuelve una clave con notacion de puntos dentro de un namespace. */
    const resolver = (namespace, clave) => buscar(CATALOGS[language]?.[namespace], clave);

    /**
     * Traduce una clave. Con `count` elige la forma plural via Intl.PluralRules.
     * Interpola {{variables}}.
     */
    const t = (namespace, clave, params = {}) => {
      let plantilla = null;

      if (typeof params.count === 'number') {
        const categoria = pluralCategory(params.count, language);
        plantilla = resolver(namespace, `${clave}_${categoria}`) ?? resolver(namespace, clave);
      } else {
        plantilla = resolver(namespace, clave);
      }

      // Devolver la clave y no una cadena vacia es deliberado: una traduccion que
      // falta tiene que verse, no desaparecer de la pantalla.
      if (plantilla === null) return `${namespace}.${clave}`;

      return plantilla.replace(/\{\{(\w+)\}\}/g, (_, nombre) =>
        nombre in params ? String(params[nombre]) : `{{${nombre}}}`,
      );
    };

    return {
      language,
      t,
      formatNumber: (valorNumerico, preset) => formatNumber(valorNumerico, preset, language),
      formatDate: (iso, preset) => formatDate(iso, preset, language),
    };
  }, [language]);

  return <I18nContext.Provider value={valor}>{children}</I18nContext.Provider>;
}

/** Recorre un objeto con una clave separada por puntos. */
function buscar(objeto, clave) {
  if (!objeto) return null;
  let actual = objeto;
  for (const parte of clave.split('.')) {
    if (actual === null || typeof actual !== 'object' || !(parte in actual)) return null;
    actual = actual[parte];
  }
  return typeof actual === 'string' ? actual : null;
}
