import { mdiChevronDown } from '@mdi/js';
import Icon from '@mdi/react';

import './Collapsible.scss';

/**
 * Bloque plegable sobre details y summary nativos: se abre con teclado, lo anuncia
 * el lector de pantalla y no necesita estado. El resumen mide 44 px de alto.
 *
 * @param {object} props
 * @param {string} props.title Texto del resumen.
 * @param {import('react').ReactNode} props.children Contenido plegado.
 * @param {boolean} [props.defaultOpen] Abierto al montar.
 * @param {string} [props.className] Clase extra del bloque que lo usa.
 */
export default function Collapsible({ title, children, defaultOpen = false, className = '' }) {
  const clases = ['c-collapsible', className].filter(Boolean).join(' ');

  return (
    <details className={clases} open={defaultOpen || undefined}>
      <summary className="c-collapsible__summary">
        <span className="c-collapsible__title">{title}</span>
        <Icon className="c-collapsible__chevron" path={mdiChevronDown} size={1} />
      </summary>
      <div className="c-collapsible__body">{children}</div>
    </details>
  );
}
