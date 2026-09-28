import Button from '@shared/components/Button/Button';
import useTranslation from '@i18n/useTranslation';

import './ErrorScreen.scss';

/**
 * Pantalla de rescate minima: un error de render muestra esto en lugar de dejar la
 * pantalla en blanco. No hay datos del usuario que salvar, asi que solo ofrece
 * recargar.
 */
export default function ErrorScreen() {
  const { t } = useTranslation('common');

  return (
    <main className="c-error-screen">
      <h1 className="c-error-screen__title">{t('error.title')}</h1>
      <p className="c-error-screen__message">{t('error.render')}</p>
      <Button variant="ghost" onClick={() => window.location.reload()}>
        {t('action.reload')}
      </Button>
    </main>
  );
}
