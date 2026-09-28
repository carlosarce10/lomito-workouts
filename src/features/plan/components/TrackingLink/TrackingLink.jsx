import { mdiOpenInNew } from '@mdi/js';
import Icon from '@mdi/react';

import { TRACKING_URL } from '@domain/catalogs';
import Button from '@shared/components/Button/Button';
import useTranslation from '@i18n/useTranslation';

import './TrackingLink.scss';

/**
 * Enlace a Lomito Train, donde se registra el entrenamiento. Es la ultima
 * tarjeta del plan: el paso que sigue a leerlo.
 */
export default function TrackingLink() {
  const { t } = useTranslation('plan');

  return (
    <aside className="c-tracking-link">
      <h2 className="c-tracking-link__title">{t('tracking.title')}</h2>
      <p className="c-tracking-link__hint">{t('tracking.hint')}</p>
      <Button
        as="a"
        variant="primary"
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
