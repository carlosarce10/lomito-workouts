import { useRef, useState } from 'react';

import useTranslation from '@i18n/useTranslation';

import ExerciseOption from '../ExerciseOption/ExerciseOption';
import PrescriptionGrid from '../PrescriptionGrid/PrescriptionGrid';

import './RoutineExerciseCard.scss';

/**
 * Tarjeta de un ejercicio dentro de una rutina. Si trae alternativa (por si el
 * gimnasio no tiene la maquina), el ejercicio y su sustituto son dos tarjetas
 * completas, cada una con su prescripcion, en un carrusel a todo el ancho: se
 * cambia de una a otra deslizando o con el selector de arriba.
 *
 * @param {object} props
 * @param {object} props.item Ejercicio de la rutina, salido de resolvePlan.
 * @param {number} props.ordinal Posicion dentro de la rutina, desde 1.
 */
export default function RoutineExerciseCard({ item, ordinal }) {
  const { t } = useTranslation('plan');
  const pista = useRef(null);
  const [activa, setActiva] = useState(0);
  const { exercise, alternative } = item;

  const principal = (
    <article className="c-routine-exercise-card__panel">
      <ExerciseOption exercise={exercise} ordinal={ordinal} />
      <PrescriptionGrid item={item} />
      {item.notes ? <p className="c-routine-exercise-card__notes">{item.notes}</p> : null}
    </article>
  );
  if (!alternative) return <div className="c-routine-exercise-card">{principal}</div>;

  /** Lleva el carrusel a la tarjeta indicada. */
  const ir = (indice) => {
    const destino = pista.current?.children[indice];
    if (!destino) return;
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pista.current.scrollTo({ left: destino.offsetLeft, behavior: suave ? 'smooth' : 'auto' });
  };
  /** La tarjeta visible es la mas cercana al borde izquierdo de la pista. */
  const alDeslizar = () => {
    const { scrollLeft, clientWidth } = pista.current;
    setActiva(Math.round(scrollLeft / clientWidth));
  };
  const opciones = [t('card.main'), t('card.alternative')];

  return (
    <div className="c-routine-exercise-card">
      <div className="c-routine-exercise-card__switch" role="group" aria-label={t('card.options')}>
        {opciones.map((etiqueta, indice) => (
          <button
            key={etiqueta}
            type="button"
            className={`c-routine-exercise-card__switch-button${activa === indice ? ' is-active' : ''}`}
            aria-pressed={activa === indice}
            onClick={() => ir(indice)}
          >
            {etiqueta}
          </button>
        ))}
      </div>
      <div className="c-routine-exercise-card__track" ref={pista} onScroll={alDeslizar}>
        {principal}
        <article className="c-routine-exercise-card__panel">
          <p className="c-routine-exercise-card__hint">
            {t('card.alternativeHint', { name: exercise.name })}
          </p>
          <ExerciseOption exercise={alternative} ordinal={ordinal} />
          <PrescriptionGrid item={item} />
        </article>
      </div>
    </div>
  );
}
