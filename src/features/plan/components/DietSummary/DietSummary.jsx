import { mdiFire, mdiWater } from '@mdi/js';
import Icon from '@mdi/react';

import { toFluidOunces } from '@domain/model/units';
import useTranslation from '@i18n/useTranslation';

import useFoodFormat from '../../hooks/useFoodFormat';
import FoodGroupIcon from '../FoodGroupIcon/FoodGroupIcon';

import './DietSummary.scss';

/**
 * La meta del dia de un vistazo: calorias destacadas, los tres macronutrientes con su
 * icono, y fibra y agua en una linea. Lo que el cliente necesita recordar.
 *
 * @param {object} props
 * @param {object} props.diet Recomendacion resuelta.
 * @param {'metric'|'imperial'} props.unitSystemId
 */
export default function DietSummary({ diet, unitSystemId }) {
  const { t, tn, formatDate } = useTranslation('plan');
  const { range } = useFoodFormat(unitSystemId);
  const imperial = unitSystemId === 'imperial';

  const litros = range({ min: diet.water?.min / 1000, max: diet.water?.max / 1000 }, 'decimal');
  const onzas = diet.water
    ? range({
        min: Math.round(toFluidOunces(diet.water.min)),
        max: Math.round(toFluidOunces(diet.water.max)),
      })
    : null;
  const macros = [
    { id: 'protein', value: diet.protein },
    { id: 'carbs', value: diet.carbs },
    { id: 'fat', value: diet.fat },
  ];

  return (
    <section className="c-diet-summary">
      <p className="c-diet-summary__eyebrow">
        {t('diet.goal', { goal: tn('catalog', `dietGoals.${diet.dietGoalId}`) })}
      </p>
      <div className="c-diet-summary__calories">
        <Icon className="c-diet-summary__fire" path={mdiFire} size={1.1} aria-hidden="true" />
        <div>
          <p className="c-diet-summary__calories-value">
            {t('diet.kcal', { value: range(diet.targetCalories) })}
          </p>
          <p className="c-diet-summary__calories-label">{t('diet.daily')}</p>
        </div>
      </div>
      <dl className="c-diet-summary__macros">
        {macros.map((macro) => (
          <div key={macro.id} className="c-diet-summary__macro">
            <FoodGroupIcon foodGroupId={macro.id} />
            <dd className="c-diet-summary__macro-value">
              {t('diet.grams', { value: range(macro.value) })}
            </dd>
            <dt className="c-diet-summary__macro-label">
              {tn('catalog', `foodGroups.${macro.id}`)}
            </dt>
          </div>
        ))}
      </dl>
      <p className="c-diet-summary__extras">
        <span>{t('diet.fiber', { value: range(diet.fiber) })}</span>
        {diet.water ? (
          <span className="c-diet-summary__water">
            <Icon path={mdiWater} size={0.7} aria-hidden="true" />
            {imperial
              ? t('diet.waterImperial', { liters: litros, ounces: onzas })
              : t('diet.water', { liters: litros })}
          </span>
        ) : null}
      </p>
      {diet.notes ? <p className="c-diet-summary__notes">{diet.notes}</p> : null}
      <p className="c-diet-summary__hint">
        {t('diet.calculatedAt', { date: formatDate(diet.calculatedAt, 'date') })}
      </p>
    </section>
  );
}
