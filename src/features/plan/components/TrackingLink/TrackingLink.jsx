import { mdiDownload, mdiOpenInNew } from '@mdi/js';
import Icon from '@mdi/react';

import { TRACKING_URL } from '@domain/catalogs';
import Button from '@shared/components/Button/Button';
import useTranslation from '@i18n/useTranslation';

import useTrackingExport from '../../hooks/useTrackingExport';

import './TrackingLink.scss';

/**
 * Paso a Lomito Train, donde se registra el entrenamiento. Con un plan, ofrece
 * ademas descargarlo en el formato que Lomito Train importa, con los pasos para
 * hacerlo; en la portada, sin plan, solo enlaza.
 *
 * @param {object} props
 * @param {object} [props.plan] Plan resuelto. Sin el no hay nada que exportar.
 */
export default function TrackingLink({ plan }) {
  const { t } = useTranslation('plan');

  return (
    <aside className="c-tracking-link">
      <h2 className="c-tracking-link__title">{t('tracking.title')}</h2>
      {plan ? (
        <PlanExport plan={plan} />
      ) : (
        <p className="c-tracking-link__hint">{t('tracking.hint')}</p>
      )}
      <Button
        as="a"
        variant={plan ? 'ghost' : 'primary'}
        className="c-tracking-link__action"
        href={TRACKING_URL}
        target="_blank"
        rel="noreferrer"
      >
        {t('tracking.action')}
        <Icon path={mdiOpenInNew} size={0.8} />
      </Button>
    </aside>
  );
}

/** Boton de descarga del plan, el resultado y los pasos para importarlo. */
function PlanExport({ plan }) {
  const { t } = useTranslation('plan');
  const { exportar, estado, archivo } = useTrackingExport(plan);

  return (
    <>
      <p className="c-tracking-link__hint">{t('tracking.exportHint')}</p>
      <Button
        variant="primary"
        className="c-tracking-link__action"
        onClick={exportar}
        busy={estado === 'working'}
      >
        <Icon path={mdiDownload} size={0.8} />
        {estado === 'working' ? t('tracking.exporting') : t('tracking.export')}
      </Button>
      <p className="c-tracking-link__status" role="status" aria-live="polite">
        {estado === 'done' ? t('tracking.exported', { name: archivo }) : null}
        {estado === 'failed' ? t('tracking.exportFailed') : null}
      </p>
      <ol className="c-tracking-link__steps">
        <li className="c-tracking-link__step">{t('tracking.step1')}</li>
        <li className="c-tracking-link__step">{t('tracking.step2')}</li>
        <li className="c-tracking-link__step">{t('tracking.step3')}</li>
      </ol>
    </>
  );
}
