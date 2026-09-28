import useTranslation from '@i18n/useTranslation';

import './ClientProfile.scss';

/**
 * Cabecera del plan: nombre del cliente, objetivo, nivel, frecuencia, fechas y
 * observaciones del entrenador.
 *
 * @param {object} props
 * @param {object} props.client Cliente ya resuelto.
 * @param {number} props.frequency Dias por semana, derivados de las rutinas.
 */
export default function ClientProfile({ client, frequency }) {
  const { t, tn, formatDate } = useTranslation('plan');

  return (
    <section className="c-client-profile">
      <h2 className="c-client-profile__name">{t('profile.title', { name: client.name })}</h2>
      <dl className="c-client-profile__stats">
        <div className="c-client-profile__stat">
          <dt className="c-client-profile__stat-label">{t('profile.goal')}</dt>
          <dd className="c-client-profile__stat-value">
            {tn('catalog', `goals.${client.goalId}`)}
          </dd>
        </div>
        <div className="c-client-profile__stat">
          <dt className="c-client-profile__stat-label">{t('profile.level')}</dt>
          <dd className="c-client-profile__stat-value">
            {tn('catalog', `levels.${client.levelId}`)}
          </dd>
        </div>
        <div className="c-client-profile__stat">
          <dt className="c-client-profile__stat-label">{t('profile.frequency')}</dt>
          <dd className="c-client-profile__stat-value">
            {t('profile.frequencyValue', { count: frequency })}
          </dd>
        </div>
      </dl>
      <p className="c-client-profile__dates">
        {t('profile.start', { date: formatDate(client.startDate, 'date') })}
        {client.reviewDate
          ? ` · ${t('profile.review', { date: formatDate(client.reviewDate, 'date') })}`
          : ''}
      </p>
      {client.notes ? <p className="c-client-profile__notes">{client.notes}</p> : null}
    </section>
  );
}
