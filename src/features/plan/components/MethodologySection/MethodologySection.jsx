import { METHODOLOGY } from '@services/content/methodology';
import Collapsible from '@shared/components/Collapsible/Collapsible';
import useTranslation from '@i18n/useTranslation';

import ProgressionExample from '../ProgressionExample/ProgressionExample';

import './MethodologySection.scss';

/**
 * Seccion educativa "Como entrenar": las secciones de la metodologia y el ejemplo
 * de progresion, plegadas en el plan y abiertas en la portada.
 *
 * @param {object} props
 * @param {boolean} [props.defaultOpen] Abierta al montar.
 */
export default function MethodologySection({ defaultOpen = false }) {
  const { t } = useTranslation('plan');

  return (
    <Collapsible
      className="c-methodology-section"
      title={t('methodology.title')}
      defaultOpen={defaultOpen}
    >
      {METHODOLOGY.sections.map((section) => (
        <article key={section.id} className="c-methodology-section__item">
          <h3 className="c-methodology-section__heading">{section.title}</h3>
          {section.body.map((parrafo) => (
            <p key={parrafo} className="c-methodology-section__text">
              {parrafo}
            </p>
          ))}
        </article>
      ))}
      <ProgressionExample example={METHODOLOGY.progressionExample} />
    </Collapsible>
  );
}
