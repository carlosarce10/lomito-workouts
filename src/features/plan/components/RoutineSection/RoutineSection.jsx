import useTranslation from '@i18n/useTranslation';

import MuscleBadgeList from '../MuscleBadgeList/MuscleBadgeList';
import RoutineExerciseCard from '../RoutineExerciseCard/RoutineExerciseCard';

import './RoutineSection.scss';

/**
 * Una rutina completa: titulo con su dia, musculos que trabaja, notas y la lista
 * de tarjetas de ejercicio.
 *
 * @param {object} props
 * @param {object} props.routine Rutina resuelta del plan.
 */
export default function RoutineSection({ routine }) {
  const { t } = useTranslation('plan');

  return (
    <section className="c-routine-section">
      <header className="c-routine-section__header">
        <h2 className="c-routine-section__title">
          {t('routine.title', { n: routine.ordinal, name: routine.name })}
        </h2>
        <MuscleBadgeList muscleIds={routine.muscleIds} />
      </header>
      {routine.notes ? <p className="c-routine-section__notes">{routine.notes}</p> : null}
      <ol className="c-routine-section__list">
        {routine.exercises.map((item, index) => (
          <li key={item.exercise.id} className="c-routine-section__item">
            <RoutineExerciseCard item={item} ordinal={index + 1} />
          </li>
        ))}
      </ol>
    </section>
  );
}
