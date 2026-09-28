import { useRouteError } from 'react-router';

import Button from '@shared/components/Button/Button';
import useTranslation from '@i18n/useTranslation';

import './PlanError.scss';

/**
 * Lo que se ve cuando el loader falla: sin red, o un plan con un ejercicio que no
 * existe en la biblioteca. Reintentar recarga la pagina, que es lo que vuelve a
 * ejecutar el loader.
 */
export default function PlanError() {
  const error = useRouteError();
  const { t, tn } = useTranslation('plan');
  const motivo = error?.message === 'orphanExercise' ? 'orphan' : 'failed';

  return (
    <section className="c-plan-error" role="alert">
      <h2 className="c-plan-error__title">{t('status.errorTitle')}</h2>
      <p className="c-plan-error__message">{t(`status.${motivo}`)}</p>
      <Button variant="ghost" onClick={() => window.location.reload()}>
        {tn('common', 'action.retry')}
      </Button>
    </section>
  );
}
