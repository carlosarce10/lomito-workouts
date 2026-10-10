import { nutritionPhotoUrl } from '@services/content/images';
import useTranslation from '@i18n/useTranslation';

import useFoodFormat from '../../hooks/useFoodFormat';
import FoodGroupIcon from '../FoodGroupIcon/FoodGroupIcon';

import './PlateCard.scss';

/**
 * Un plato sugerido con su foto, ya ajustado al cliente: cada alimento con su medida
 * casera y su peso, y lo que suma el plato. La opcion sugerida de cada momento del
 * dia lleva una insignia; en los carruseles va compacto.
 *
 * @param {object} props
 * @param {object} props.entry Plato escalado de buildNutritionPlan ({ plate, items, totals }).
 * @param {'metric'|'imperial'} props.unitSystemId
 * @param {boolean} [props.suggested] Es la opcion sugerida de su momento del dia.
 * @param {boolean} [props.compact] Variante estrecha para el carrusel.
 */
export default function PlateCard({ entry, unitSystemId, suggested = false, compact = false }) {
  const { t, formatNumber } = useTranslation('plan');
  const { measure, weight } = useFoodFormat(unitSystemId);
  const { plate, items, totals } = entry;

  return (
    <article className={`c-plate-card${compact ? ' c-plate-card--compact' : ''}`}>
      {plate.source ? (
        <img
          className="c-plate-card__photo"
          src={nutritionPhotoUrl(plate.id)}
          alt={plate.name}
          loading="lazy"
          width="640"
          height="480"
        />
      ) : null}
      <div className="c-plate-card__body">
        {suggested ? <p className="c-plate-card__badge">{t('diet.suggested')}</p> : null}
        <h3 className="c-plate-card__name">{plate.name}</h3>
        <ul className="c-plate-card__items">
          {items.map((item) => (
            <li key={item.food.id} className="c-plate-card__item">
              <FoodGroupIcon foodGroupId={item.food.foodGroupId} size="sm" />
              <span className="c-plate-card__food">{item.food.name}</span>
              <span className="c-plate-card__amount">
                {item.free
                  ? t('diet.free', { value: measure(item.food, item.quantity) })
                  : measure(item.food, item.quantity)}
                {!item.free && item.food.measure.unit !== 'g' ? (
                  <span className="c-plate-card__grams">{weight(item.grams)}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        <p className="c-plate-card__totals">
          {t('diet.plateTotals', {
            calories: formatNumber(totals.calories, 'integer'),
            protein: formatNumber(totals.protein, 'integer'),
            carbs: formatNumber(totals.carbs, 'integer'),
            fat: formatNumber(totals.fat, 'integer'),
          })}
        </p>
      </div>
    </article>
  );
}
