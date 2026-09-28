import useTranslation from '@i18n/useTranslation';

import MethodologySection from '../../components/MethodologySection/MethodologySection';
import TrackingLink from '../../components/TrackingLink/TrackingLink';

import './HomePage.scss';

/**
 * Portada generica: que es Lomito Workouts, como entrenar y donde registrar.
 * No lista clientes a proposito: cada plan es un enlace privado.
 */
export default function HomePage() {
  const { t } = useTranslation('plan');

  return (
    <div className="c-home-page">
      <section className="c-home-page__intro">
        <p className="c-home-page__text">{t('home.intro')}</p>
        <p className="c-home-page__hint">{t('home.hint')}</p>
      </section>
      <MethodologySection defaultOpen />
      <TrackingLink />
    </div>
  );
}
