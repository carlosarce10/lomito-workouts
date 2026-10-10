import Icon from '@mdi/react';
import { NavLink } from 'react-router';

import './BottomNav.scss';

/**
 * Barra de navegacion inferior, la misma de Lomito Train.
 *
 * Recibe las pestanas como dato en lugar de declararlas dentro: shared no conoce
 * las rutas ni las features de la aplicacion. `end` marca la pestana activa solo en
 * su ruta exacta, para que la del indice no quede encendida en las demas.
 *
 * @param {object} props
 * @param {Array<{ to: string, label: string, icon: string, end?: boolean }>} props.tabs
 * @param {string} props.label Nombre de la navegacion para lectores de pantalla.
 */
export default function BottomNav({ tabs, label }) {
  return (
    <nav className="c-bottom-nav" aria-label={label}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `c-bottom-nav__tab${isActive ? ' is-active' : ''}`}
        >
          <span className="c-bottom-nav__icon">
            <Icon path={tab.icon} size={1} />
          </span>
          <span className="c-bottom-nav__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
