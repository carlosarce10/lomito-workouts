import MethodologySection from '../../components/MethodologySection/MethodologySection';
import TrackingLink from '../../components/TrackingLink/TrackingLink';
import usePlan from '../../hooks/usePlan';

import './PlanInfoPage.scss';

/**
 * Pestana Informacion: como registrar el entrenamiento en Lomito Train (con la
 * descarga del plan) y como entrenar.
 */
export default function PlanInfoPage() {
  const plan = usePlan();

  return (
    <div className="c-plan-info-page">
      <TrackingLink plan={plan} />
      <MethodologySection defaultOpen />
    </div>
  );
}
