import { mdiArrowLeft } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect } from 'react';
import { Link, Outlet } from 'react-router';

import useTranslation from '@i18n/useTranslation';

import usePlan from '../../hooks/usePlan';

import './PlanPage.scss';

/**
 * Marco del plan de un cliente: titulo del documento, enlace a la portada y la
 * pestana activa (Rutina, Dieta o Informacion), que pinta su ruta hija.
 */
export default function PlanPage() {
  const plan = usePlan();
  const { t, tn } = useTranslation('plan');

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
      <Outlet />
    </div>
  );
}
