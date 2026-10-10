import useTranslation from '@i18n/useTranslation';
import logoMark from '@/assets/logo-mark.png';

import BottomNav from '../BottomNav/BottomNav';

import './Layout.scss';

/**
 * Estructura comun de la aplicacion: cabecera con la marca, contenido, pie con la
 * firma y, si hay pestanas, la barra de navegacion inferior. Solo el plan de un
 * cliente las tiene; la portada no.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido de la ruta activa.
 * @param {Array} [props.tabs] Pestanas de la barra inferior.
 * @param {string} [props.navLabel] Nombre accesible de la barra.
 */
export default function Layout({ children, tabs = null, navLabel = '' }) {
  const { t } = useTranslation('common');
  const conBarra = Boolean(tabs?.length);

  return (
    <div className={`c-layout${conBarra ? ' c-layout--with-nav' : ''}`}>
      <header className="c-layout__header">
        <img className="c-layout__logo-mark" src={logoMark} alt="" width="32" height="32" />
        <div className="c-layout__brand">
          <h1 className="c-layout__logo">{t('app.name')}</h1>
          <p className="c-layout__tagline">{t('app.tagline')}</p>
        </div>
      </header>
      <main className="c-layout__content">{children}</main>
      <footer className="c-layout__footer">
        <img className="c-layout__footer-mark" src={logoMark} alt="" width="20" height="20" />
        <span className="c-layout__signature">{t('app.signature')}</span>
      </footer>
      {conBarra ? <BottomNav tabs={tabs} label={navLabel} /> : null}
    </div>
  );
}
