import useTranslation from '@i18n/useTranslation';

import './PrescriptionGrid.scss';

/**
 * La prescripcion de un ejercicio: series de aproximacion, series efectivas,
 * repeticiones, RIR y descanso, ya resueltos contra la metodologia.
 *
 * @param {object} props
 * @param {object} props.item Ejercicio de la rutina, salido de resolvePlan.
 */
export default function PrescriptionGrid({ item }) {
  const { t, formatNumber } = useTranslation('plan');

  /** "8–12", o "10" cuando el rango es un solo valor. */
  const rango = ({ min, max }) =>
    min === max
      ? formatNumber(min, 'integer')
      : t('card.range', { min: formatNumber(min, 'integer'), max: formatNumber(max, 'integer') });

  // En minutos cuando los dos extremos son minutos enteros; si no, en segundos.
  const enMinutos = item.restSeconds.min % 60 === 0 && item.restSeconds.max % 60 === 0;
  const descanso = enMinutos
    ? t('card.minutes', {
        value: rango({ min: item.restSeconds.min / 60, max: item.restSeconds.max / 60 }),
      })
    : t('card.seconds', { value: rango(item.restSeconds) });

  const aproximacion =
    item.warmupSets === 0
      ? t('card.noWarmup')
      : t('card.warmup', { count: item.warmupSets, reps: rango(item.reps) });

  return (
    <section className="c-prescription-grid">
      <p className="c-prescription-grid__warmup">{aproximacion}</p>
      <dl className="c-prescription-grid__cells">
        <div className="c-prescription-grid__cell">
          <dt className="c-prescription-grid__label">{t('card.sets')}</dt>
          <dd className="c-prescription-grid__value">{formatNumber(item.sets, 'integer')}</dd>
        </div>
        <div className="c-prescription-grid__cell">
          <dt className="c-prescription-grid__label">{t('card.reps')}</dt>
          <dd className="c-prescription-grid__value">{rango(item.reps)}</dd>
        </div>
        <div className="c-prescription-grid__cell">
          <dt className="c-prescription-grid__label">{t('card.rir')}</dt>
          <dd className="c-prescription-grid__value">{rango(item.rir)}</dd>
        </div>
        <div className="c-prescription-grid__cell">
          <dt className="c-prescription-grid__label">{t('card.rest')}</dt>
          <dd className="c-prescription-grid__value">{descanso}</dd>
        </div>
      </dl>
    </section>
  );
}
