import { toMixedNumber } from '@domain/model/units';
import useTranslation from '@i18n/useTranslation';

import FoodGroupIcon from '../FoodGroupIcon/FoodGroupIcon';

import './PortionGuide.scss';

const GRUPOS = ['protein', 'carbs', 'fat'];

/**
 * "Tu plato en cada comida": cuantas palmas de proteina, punos de carbohidratos y
 * pulgares de grasa lleva cada comida principal, mas la verdura libre y el snack.
 * Es la regla que el cliente puede seguir sin bascula.
 *
 * @param {object} props
 * @param {object} props.portions Porciones de buildNutritionPlan.
 */
export default function PortionGuide({ portions }) {
  const { t } = useTranslation('plan');
  // Media porcion se dice en singular ("1/2 pulgar"): para el plural cuenta como 1.
  const plural = (valor) => Math.max(1, valor);
  const porcion = (grupo, valor) =>
    t(`diet.portion.${grupo}`, { count: plural(valor), value: toMixedNumber(valor) });
  const snack = GRUPOS.filter((grupo) => portions.snack[grupo] > 0).map((grupo) =>
    porcion(grupo, portions.snack[grupo]),
  );
  const verdura = portions.perMeal.vegetables;

  return (
    <section className="c-portion-guide">
      <h2 className="c-portion-guide__title">{t('diet.plateTitle')}</h2>
      <p className="c-portion-guide__lead">{t('diet.plateLead', { count: portions.meals })}</p>
      <ul className="c-portion-guide__grid">
        {GRUPOS.map((grupo) => (
          <li key={grupo} className="c-portion-guide__tile">
            <FoodGroupIcon foodGroupId={grupo} />
            <span className="c-portion-guide__count">{toMixedNumber(portions.perMeal[grupo])}</span>
            <span className="c-portion-guide__label">
              {t(`diet.hand.${grupo}`, { count: plural(portions.perMeal[grupo]) })}
            </span>
          </li>
        ))}
        <li className="c-portion-guide__tile">
          <FoodGroupIcon foodGroupId="vegetables" />
          <span className="c-portion-guide__count">
            {t('card.range', { min: verdura.min, max: verdura.max })}
          </span>
          <span className="c-portion-guide__label">{t('diet.hand.vegetables')}</span>
        </li>
      </ul>
      {portions.breakfastProtein < portions.perMeal.protein ? (
        <p className="c-portion-guide__note">
          {t('diet.breakfastNote', {
            count: plural(portions.breakfastProtein),
            value: toMixedNumber(portions.breakfastProtein),
          })}
        </p>
      ) : null}
      {snack.length > 0 ? (
        <p className="c-portion-guide__snack">
          {t('diet.snackLine', { count: portions.snacks, items: snack.join(', ') })}
        </p>
      ) : null}
      <p className="c-portion-guide__hint">{t('diet.handHint')}</p>
    </section>
  );
}
