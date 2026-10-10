import { nutritionPhotoUrl } from '@services/content/images';

import './SupplementCard.scss';

/**
 * Un suplemento recomendado: foto, nombre, dosis destacada y por que tomarlo.
 *
 * @param {object} props
 * @param {object} props.supplement Entrada de src/content/nutrition/supplements.json.
 */
export default function SupplementCard({ supplement }) {
  return (
    <article className="c-supplement-card">
      {supplement.source ? (
        <img
          className="c-supplement-card__photo"
          src={nutritionPhotoUrl(supplement.id)}
          alt={supplement.name}
          loading="lazy"
          width="96"
          height="96"
        />
      ) : null}
      <div className="c-supplement-card__body">
        <h3 className="c-supplement-card__name">{supplement.name}</h3>
        <p className="c-supplement-card__dose">{supplement.dose}</p>
        {supplement.body.map((parrafo) => (
          <p key={parrafo} className="c-supplement-card__text">
            {parrafo}
          </p>
        ))}
      </div>
    </article>
  );
}
