import Collapsible from '@shared/components/Collapsible/Collapsible';
import useTranslation from '@i18n/useTranslation';

import useFoodFormat from '../../hooks/useFoodFormat';
import FoodGroupIcon from '../FoodGroupIcon/FoodGroupIcon';

import './SwapList.scss';

/**
 * Reemplazos: por cada grupo, todo lo que vale una porcion de mano. Con esto el
 * cliente cambia el pollo por atun o el arroz por tortillas sin descuadrar el dia.
 *
 * @param {object} props
 * @param {Array<{ foodGroupId: string, foods: object[] }>} props.swaps
 * @param {'metric'|'imperial'} props.unitSystemId
 */
export default function SwapList({ swaps, unitSystemId }) {
  const { t } = useTranslation('plan');
  const { measure, weight } = useFoodFormat(unitSystemId);
  const unaPorcion = (food) => ({ min: food.measure.amount, max: food.measure.amount });

  return (
    <section className="c-swap-list">
      <h2 className="c-swap-list__title">{t('diet.swapsTitle')}</h2>
      <p className="c-swap-list__lead">{t('diet.swapsLead')}</p>
      {swaps.map((grupo) => (
        <Collapsible key={grupo.foodGroupId} title={t(`diet.swap.${grupo.foodGroupId}`)}>
          <ul className="c-swap-list__foods">
            {grupo.foods.map((food) => (
              <li key={food.id} className="c-swap-list__food">
                <FoodGroupIcon foodGroupId={food.foodGroupId} size="sm" />
                <span className="c-swap-list__name">{food.name}</span>
                <span className="c-swap-list__amount">
                  {measure(food, unaPorcion(food))}
                  {food.measure.unit !== 'g' ? (
                    <span className="c-swap-list__grams">{weight(food.grams)}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </Collapsible>
      ))}
    </section>
  );
}
