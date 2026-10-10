import { useState } from 'react';

import ClientProfile from '../../components/ClientProfile/ClientProfile';
import RoutineSection from '../../components/RoutineSection/RoutineSection';
import RoutineTabs from '../../components/RoutineTabs/RoutineTabs';
import usePlan from '../../hooks/usePlan';

import './PlanRoutinesPage.scss';

/** Pestana Rutina: el perfil del cliente, las pestanas de dia y la rutina elegida. */
export default function PlanRoutinesPage() {
  const plan = usePlan();
  const [activa, setActiva] = useState(0);
  const routine = plan.routines[activa] ?? plan.routines[0];

  return (
    <div className="c-plan-routines-page">
      <ClientProfile client={plan.client} frequency={plan.frequency} />
      <RoutineTabs routines={plan.routines} active={activa} onSelect={setActiva} />
      <RoutineSection routine={routine} />
    </div>
  );
}
