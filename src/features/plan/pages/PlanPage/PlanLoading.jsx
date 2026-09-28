import useTranslation from '@i18n/useTranslation';

import './PlanLoading.scss';

/** Lo que se ve mientras el loader descarga y resuelve el plan. */
export default function PlanLoading() {
  const { t } = useTranslation('plan');

  return (
    <p className="c-plan-loading" role="status" aria-live="polite">
      {t('status.loading')}
    </p>
  );
}
