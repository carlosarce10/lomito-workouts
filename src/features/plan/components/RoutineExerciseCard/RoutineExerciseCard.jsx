import {
  mdiDumbbell,
  mdiHelpCircle,
  mdiHook,
  mdiImageOff,
  mdiRun,
  mdiWeight,
  mdiWeightLifter,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import { getEquipmentIcon, IMAGE_FRAMES } from '@domain/catalogs';
import { exerciseImageUrl } from '@services/content/images';
import Collapsible from '@shared/components/Collapsible/Collapsible';
import useTranslation from '@i18n/useTranslation';

import MuscleBadgeList from '../MuscleBadgeList/MuscleBadgeList';
import PrescriptionGrid from '../PrescriptionGrid/PrescriptionGrid';

import './RoutineExerciseCard.scss';

// El catalogo guarda el nombre del icono; la ruta SVG es cosa de la presentacion.
const ICONS = {
  'weight-lifter': mdiWeightLifter,
  dumbbell: mdiDumbbell,
  hook: mdiHook,
  weight: mdiWeight,
  run: mdiRun,
  'help-circle': mdiHelpCircle,
};

/**
 * Tarjeta de un ejercicio dentro de una rutina: nombre, equipamiento, los dos
 * fotogramas, musculos, prescripcion, notas del entrenador y, plegados, los pasos
 * y los errores comunes.
 *
 * @param {object} props
 * @param {object} props.item Ejercicio de la rutina, salido de resolvePlan.
 * @param {number} props.ordinal Posicion dentro de la rutina, desde 1.
 */
export default function RoutineExerciseCard({ item, ordinal }) {
  const { t, tn, formatNumber } = useTranslation('plan');
  const [sinImagen, setSinImagen] = useState(false);
  const { exercise } = item;
  const equipamiento = tn('catalog', `equipment.${exercise.equipmentId}`);
  const conImagen = Boolean(exercise.source) && !sinImagen;

  return (
    <article className="c-routine-exercise-card">
      <header className="c-routine-exercise-card__header">
        <span className="c-routine-exercise-card__ordinal" aria-hidden="true">
          {formatNumber(ordinal, 'integer')}
        </span>
        <h3 className="c-routine-exercise-card__name">{exercise.name}</h3>
        <span
          className="c-routine-exercise-card__equipment"
          role="img"
          aria-label={equipamiento}
          title={equipamiento}
        >
          <Icon path={ICONS[getEquipmentIcon(exercise.equipmentId)] ?? mdiHelpCircle} size={0.8} />
        </span>
      </header>

      {conImagen ? (
        <div className="c-routine-exercise-card__frames">
          {IMAGE_FRAMES.map((frame, index) => (
            <img
              key={frame}
              className="c-routine-exercise-card__frame"
              src={exerciseImageUrl(exercise.id, frame)}
              alt={
                index === 0
                  ? t('card.imageStart', { name: exercise.name })
                  : t('card.imageEnd', { name: exercise.name })
              }
              width="850"
              height="567"
              loading="lazy"
              decoding="async"
              onError={() => setSinImagen(true)}
            />
          ))}
        </div>
      ) : (
        <div
          className="c-routine-exercise-card__placeholder"
          role="img"
          aria-label={t('card.noImage')}
        >
          <Icon path={mdiImageOff} size={1.5} />
        </div>
      )}

      <MuscleBadgeList muscleIds={exercise.muscleIds} />
      <PrescriptionGrid item={item} />

      {item.notes ? <p className="c-routine-exercise-card__notes">{item.notes}</p> : null}

      <Collapsible className="c-routine-exercise-card__details" title={t('card.instructions')}>
        <ol className="c-routine-exercise-card__steps">
          {exercise.instructions.map((paso) => (
            <li key={paso} className="c-routine-exercise-card__step">
              {paso}
            </li>
          ))}
        </ol>
      </Collapsible>

      {exercise.commonMistakes.length > 0 ? (
        <Collapsible className="c-routine-exercise-card__details" title={t('card.mistakes')}>
          <ul className="c-routine-exercise-card__steps c-routine-exercise-card__steps--mistakes">
            {exercise.commonMistakes.map((error) => (
              <li key={error} className="c-routine-exercise-card__step">
                {error}
              </li>
            ))}
          </ul>
        </Collapsible>
      ) : null}
    </article>
  );
}
