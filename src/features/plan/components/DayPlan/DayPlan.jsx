import { mdiGestureSwipeHorizontal } from '@mdi/js';
import Icon from '@mdi/react';

import useTranslation from '@i18n/useTranslation';

import PlateCard from '../PlateCard/PlateCard';

import './DayPlan.scss';

/**
 * El dia en orden: desayuno, snacks entre comidas, comida y cena. Cada momento es un
 * carrusel con todas sus opciones ya ajustadas al cliente; la primera es la sugerida.
 * Al pie, lo que suma el dia con las sugeridas.
 *
 * @param {object} props
 * @param {Array<{ id: string, options: object[] }>} props.day Dia de buildNutritionPlan.
 * @param {object} props.totals Totales del dia con la opcion sugerida de cada momento.
 * @param {'metric'|'imperial'} props.unitSystemId
 */
export default function DayPlan({ day, totals, unitSystemId }) {
  const { t, formatNumber } = useTranslation('plan');

  return (
    <section className="c-day-plan">
      <h2 className="c-day-plan__title">{t('diet.dayTitle')}</h2>
      <p className="c-day-plan__lead">{t('diet.dayLead')}</p>
      <ol className="c-day-plan__slots">
        {day
          .filter((slot) => slot.options.length > 0)
          .map((slot, indice) => (
            <li key={`${slot.id}-${indice}`} className="c-day-plan__slot">
              <div className="c-day-plan__slot-header">
                <span className="c-day-plan__step">{indice + 1}</span>
                <h3 className="c-day-plan__slot-title">{t(`diet.slot.${slot.id}`)}</h3>
                {slot.options.length > 1 ? (
                  <span className="c-day-plan__swipe">
                    <Icon path={mdiGestureSwipeHorizontal} size={0.7} aria-hidden="true" />
                    {t('diet.options', { count: slot.options.length })}
                  </span>
                ) : null}
              </div>
              <div className="c-day-plan__carousel o-scroll-x">
                {slot.options.map((entry, opcion) => (
                  <PlateCard
                    key={entry.plate.id}
                    entry={entry}
                    unitSystemId={unitSystemId}
                    suggested={opcion === 0}
                    compact
                  />
                ))}
              </div>
            </li>
          ))}
      </ol>
      <p className="c-day-plan__total">
        {t('diet.dayTotals', {
          calories: formatNumber(totals.calories, 'integer'),
          protein: formatNumber(totals.protein, 'integer'),
          source: formatNumber(totals.sourceProtein, 'integer'),
          carbs: formatNumber(totals.carbs, 'integer'),
          fat: formatNumber(totals.fat, 'integer'),
        })}
      </p>
    </section>
  );
}
