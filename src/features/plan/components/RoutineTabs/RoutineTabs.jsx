import useTranslation from '@i18n/useTranslation';

import './RoutineTabs.scss';

/**
 * Fila de pildoras para elegir la rutina visible. Son botones con aria-pressed,
 * el mismo patron que el filtro de grupos musculares de Lomito Train.
 *
 * @param {object} props
 * @param {Array} props.routines Rutinas resueltas del plan.
 * @param {number} props.active Indice de la rutina visible.
 * @param {(index: number) => void} props.onSelect Cambio de rutina.
 */
export default function RoutineTabs({ routines, active, onSelect }) {
  const { t } = useTranslation('plan');

  return (
    <div className="c-routine-tabs o-scroll-x" role="group" aria-label={t('routine.tabsLabel')}>
      {routines.map((routine, index) => (
        <button
          key={routine.ordinal}
          type="button"
          className={`c-routine-tabs__tab${index === active ? ' is-active' : ''}`}
          aria-pressed={index === active}
          onClick={() => onSelect(index)}
        >
          <span className="c-routine-tabs__ordinal">
            {t('routine.ordinal', { n: routine.ordinal })}
          </span>{' '}
          <span className="c-routine-tabs__name">{routine.name}</span>
        </button>
      ))}
    </div>
  );
}
