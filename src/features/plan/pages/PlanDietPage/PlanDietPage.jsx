import { mdiCheckCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Navigate } from 'react-router';

import { DIET, SUPPLEMENTS } from '@services/content/nutrition';
import useTranslation from '@i18n/useTranslation';

import DayPlan from '../../components/DayPlan/DayPlan';
import DietBasis from '../../components/DietBasis/DietBasis';
import DietSummary from '../../components/DietSummary/DietSummary';
import PortionGuide from '../../components/PortionGuide/PortionGuide';
import SupplementCard from '../../components/SupplementCard/SupplementCard';
import SwapList from '../../components/SwapList/SwapList';
import usePlan from '../../hooks/usePlan';

import './PlanDietPage.scss';

/**
 * Pestana Dieta: la meta del dia, el plato de cada comida en porciones de mano, el dia
 * en orden con un carrusel de opciones con foto por momento, reemplazos, suplementos
 * y, plegado, de donde salen los numeros. Un plan sin recomendacion
 * nutrimental no tiene esta pestana y vuelve a la rutina.
 */
export default function PlanDietPage() {
  const plan = usePlan();
  const { t } = useTranslation('plan');
  if (!plan.diet || !plan.nutrition) return <Navigate to=".." replace />;

  const { diet, nutrition } = plan;
  const { unitSystemId } = plan.client;

  return (
    <div className="c-plan-diet-page">
      <header className="c-plan-diet-page__header">
        <h2 className="c-plan-diet-page__title">{t('diet.title')}</h2>
        <p className="c-plan-diet-page__lead">{t('diet.intro')}</p>
      </header>

      <DietSummary diet={diet} unitSystemId={unitSystemId} />
      <PortionGuide portions={nutrition.portions} />

      <section className="c-plan-diet-page__section">
        <h2 className="c-plan-diet-page__section-title">{t('diet.tipsTitle')}</h2>
        <ul className="c-plan-diet-page__tips">
          {DIET.tips.map((tip) => (
            <li key={tip} className="c-plan-diet-page__tip">
              <Icon
                className="c-plan-diet-page__tip-icon"
                path={mdiCheckCircleOutline}
                size={0.8}
                aria-hidden="true"
              />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <DayPlan day={nutrition.day} totals={nutrition.dayTotals} unitSystemId={unitSystemId} />

      <SwapList swaps={nutrition.swaps} unitSystemId={unitSystemId} />

      <section className="c-plan-diet-page__section">
        <h2 className="c-plan-diet-page__section-title">{t('diet.supplementsTitle')}</h2>
        {SUPPLEMENTS.map((supplement) => (
          <SupplementCard key={supplement.id} supplement={supplement} />
        ))}
      </section>

      <DietBasis diet={diet} />
    </div>
  );
}
