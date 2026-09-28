import useTranslation from '@i18n/useTranslation';
import logoMark from '@/assets/logo-mark.png';

import './Layout.scss';

/**
 * Estructura comun de la aplicacion: cabecera con la marca, contenido y pie con la
 * firma. No hay barra de navegacion: la unica pantalla con navegacion interna es
 * el plan, y esa vive dentro de la propia pagina.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido de la ruta activa.
 */
export default function Layout({ children }) {
  const { t } = useTranslation('common');

  return (
    <div className="c-layout">
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
    </div>
  );
}
