import { DIET } from '@services/content/nutrition';
import Collapsible from '@shared/components/Collapsible/Collapsible';
import useTranslation from '@i18n/useTranslation';

import useFoodFormat from '../../hooks/useFoodFormat';

import './DietBasis.scss';

/**
 * De donde salen los numeros, plegado al final: gasto en reposo, factor de actividad,
 * mantenimiento y ajuste, y las secciones que explican como usar la guia.
 *
 * @param {object} props
 * @param {object} props.diet Recomendacion resuelta.
 */
export default function DietBasis({ diet }) {
  const { t, formatNumber } = useTranslation('plan');
  const { range } = useFoodFormat('metric');
  const { min, max } = diet.adjustmentPercent;
  const ajuste =
    min === max
      ? t('diet.percent', { value: formatNumber(min, 'signed') })
      : t('diet.percentRange', {
          min: formatNumber(min, 'signed'),
          max: formatNumber(max, 'signed'),
        });
  const filas = [
    { id: 'resting', value: t('diet.kcal', { value: range(diet.restingCalories) }) },
    { id: 'factor', value: range(diet.activityFactor, 'decimal') },
    { id: 'maintenance', value: t('diet.kcal', { value: range(diet.maintenanceCalories) }) },
    { id: 'adjustment', value: ajuste },
    { id: 'target', value: t('diet.kcal', { value: range(diet.targetCalories) }) },
  ];

  return (
    <Collapsible className="c-diet-basis" title={t('diet.basis')}>
      <dl className="c-diet-basis__rows">
        {filas.map((fila) => (
          <div key={fila.id} className="c-diet-basis__row">
            <dt className="c-diet-basis__label">{t(`diet.basisRow.${fila.id}`)}</dt>
            <dd className="c-diet-basis__value">{fila.value}</dd>
          </div>
        ))}
      </dl>
      {DIET.sections.map((section) => (
        <article key={section.id} className="c-diet-basis__item">
          <h3 className="c-diet-basis__heading">{section.title}</h3>
          {section.body.map((parrafo) => (
            <p key={parrafo} className="c-diet-basis__text">
              {parrafo}
            </p>
          ))}
        </article>
      ))}
    </Collapsible>
  );
}
