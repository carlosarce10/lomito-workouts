import { getMuscleColor } from '@domain/catalogs';
import Chip from '@shared/components/Chip/Chip';
import useTranslation from '@i18n/useTranslation';

import './MuscleBadgeList.scss';

/**
 * Lista de chips de musculos con la barra de color de su grupo.
 *
 * @param {object} props
 * @param {string[]} props.muscleIds Ids del catalogo de musculos.
 */
export default function MuscleBadgeList({ muscleIds }) {
  const { t, tn } = useTranslation('plan');

  return (
    <ul className="c-muscle-badge-list" aria-label={t('card.muscles')}>
      {muscleIds.map((id) => (
        <li key={id} className="c-muscle-badge-list__item">
          <Chip color={getMuscleColor(id)}>{tn('catalog', `muscles.${id}`)}</Chip>
        </li>
      ))}
    </ul>
  );
}
