import { gramsToOunces, toMixedNumber } from '@domain/model/units';
import useTranslation from '@i18n/useTranslation';

/**
 * Formateadores de cantidades de comida para un sistema de unidades: la medida casera
 * ("1¾ tazas"), el peso ("280 g", con onzas si el cliente lee en imperial) y un rango.
 * Devuelve `{ measure, weight, range }`.
 *
 * @param {'metric'|'imperial'} unitSystemId
 */
export default function useFoodFormat(unitSystemId) {
  const { t, formatNumber } = useTranslation('plan');
  const imperial = unitSystemId === 'imperial';

  /** "2400–2600", o "35" si el rango es un punto. */
  const range = ({ min, max }, preset = 'integer') =>
    min === max
      ? formatNumber(min, preset)
      : t('card.range', { min: formatNumber(min, preset), max: formatNumber(max, preset) });

  /** "280 g", o "280 g · 10 oz" en imperial. */
  const weight = (grams) => {
    const gramos = t('diet.grams', { value: formatNumber(grams, 'integer') });
    if (!imperial) return gramos;
    // Por debajo de 2 oz, con un decimal: 10 g no son "0 oz".
    const onzas = gramsToOunces(grams);
    const valor = formatNumber(onzas, onzas < 2 ? 'decimal' : 'integer');
    return `${gramos} · ${t('diet.ounces', { value: valor })}`;
  };

  /**
   * Medida casera de un alimento: cantidad en numero mixto y unidad en singular o
   * plural. Si la unidad son gramos, devuelve el peso.
   */
  const measure = (food, quantity) => {
    const { unit, unitPlural } = food.measure;
    if (unit === 'g') {
      return quantity.min === quantity.max
        ? weight(quantity.min)
        : t('diet.grams', { value: range(quantity) });
    }
    const texto =
      quantity.min === quantity.max
        ? toMixedNumber(quantity.min)
        : t('card.range', { min: toMixedNumber(quantity.min), max: toMixedNumber(quantity.max) });
    return `${texto} ${quantity.max > 1 ? unitPlural : unit}`;
  };

  return { measure, weight, range };
}
