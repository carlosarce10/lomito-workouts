import { mdiCarrot, mdiFoodDrumstick, mdiPeanut, mdiRice } from '@mdi/js';
import Icon from '@mdi/react';

import './FoodGroupIcon.scss';

// El dominio solo guarda ids; el icono de cada grupo se decide aqui.
const ICONS = {
  protein: mdiFoodDrumstick,
  carbs: mdiRice,
  fat: mdiPeanut,
  vegetables: mdiCarrot,
};

/**
 * Icono de un grupo de alimentos dentro de un circulo con el color del grupo.
 * Decorativo: el texto de al lado ya dice que grupo es.
 *
 * @param {object} props
 * @param {'protein'|'carbs'|'fat'|'vegetables'} props.foodGroupId
 * @param {'sm'|'md'} [props.size]
 */
export default function FoodGroupIcon({ foodGroupId, size = 'md' }) {
  return (
    <span
      className={`c-food-group-icon c-food-group-icon--${foodGroupId} c-food-group-icon--${size}`}
      aria-hidden="true"
    >
      <Icon path={ICONS[foodGroupId]} size={size === 'sm' ? 0.65 : 0.9} />
    </span>
  );
}
