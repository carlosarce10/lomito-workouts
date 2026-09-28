import { useEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';

import Layout from '@shared/components/Layout/Layout';

/**
 * Sube el scroll al llegar a una vista nueva.
 *
 * Solo actua en navegaciones nuevas. En atras y adelante no toca nada, porque la
 * restauracion nativa del navegador ya devuelve la posicion que se tenia, y pisarla
 * con un scrollTo dejaria el boton atras siempre arriba.
 */
function ScrollReset() {
  const { pathname } = useLocation();
  const tipo = useNavigationType();

  useEffect(() => {
    if (tipo !== 'POP') window.scrollTo(0, 0);
  }, [pathname, tipo]);

  return null;
}

/**
 * Envoltura comun de todas las rutas: cabecera, contenido y pie.
 * El contenido lo pone el enrutador en el Outlet.
 */
export default function AppShell() {
  return (
    <Layout>
      <ScrollReset />
      <Outlet />
    </Layout>
  );
}
