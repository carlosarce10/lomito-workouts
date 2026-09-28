import { mdiArrowLeft } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router';

import useTranslation from '@i18n/useTranslation';

import ClientProfile from '../../components/ClientProfile/ClientProfile';
import MethodologySection from '../../components/MethodologySection/MethodologySection';
import RoutineSection from '../../components/RoutineSection/RoutineSection';
import RoutineTabs from '../../components/RoutineTabs/RoutineTabs';
import TrackingLink from '../../components/TrackingLink/TrackingLink';

import './PlanPage.scss';

/**
 * El plan de un cliente: perfil, metodologia plegada, pestanas de rutina, la
 * rutina visible y el enlace a Lomito Train. Los datos llegan del loader.
 */
export default function PlanPage() {
  const plan = useLoaderData();
  const { t, tn } = useTranslation('plan');
  const [activa, setActiva] = useState(0);
  const routine = plan.routines[activa] ?? plan.routines[0];

  useEffect(() => {
    document.title = t('page.title', { name: plan.client.name });
    return () => {
      document.title = tn('common', 'app.name');
    };
  }, [plan.client.name, t, tn]);

  return (
    <div className="c-plan-page">
      <Link className="c-plan-page__back" to="/">
        <Icon path={mdiArrowLeft} size={0.9} />
        {t('page.back')}
      </Link>
      <ClientProfile client={plan.client} frequency={plan.frequency} />
      <MethodologySection />
      <RoutineTabs routines={plan.routines} active={activa} onSelect={setActiva} />
      <RoutineSection routine={routine} />
      <TrackingLink plan={plan} />
    </div>
  );
}
