import { mdiDumbbell, mdiInformationOutline, mdiSilverwareForkKnife } from '@mdi/js';
import { useEffect } from 'react';
import { Outlet, useLocation, useMatches, useNavigationType } from 'react-router';

import Layout from '@shared/components/Layout/Layout';
import useTranslation from '@i18n/useTranslation';

// Pestanas del plan de un cliente. Viven aqui y no en shared: la barra no conoce las
// rutas. `diet` solo aparece si el plan trae recomendacion nutrimental.
const PLAN_TABS = [
  { id: 'routines', path: '', icon: mdiDumbbell, end: true },
  { id: 'diet', path: '/diet', icon: mdiSilverwareForkKnife, end: false },
  { id: 'info', path: '/info', icon: mdiInformationOutline, end: false },
];

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
 * Envoltura comun de todas las rutas: cabecera, contenido, pie y, dentro del plan de
 * un cliente, la barra inferior con Rutina, Dieta e Informacion. El contenido lo pone
 * el enrutador en el Outlet; los datos del plan los lee del loader de la ruta `plan`.
 */
export default function AppShell() {
  const { tn } = useTranslation('common');
  const plan = useMatches().find((match) => match.id === 'plan');
  const slug = plan?.params.clientSlug;
  const tabs =
    slug && plan.loaderData
      ? PLAN_TABS.filter((tab) => tab.id !== 'diet' || plan.loaderData.diet).map((tab) => ({
          to: `/${slug}${tab.path}`,
          icon: tab.icon,
          end: tab.end,
          label: tn('plan', `nav.${tab.id}`),
        }))
      : null;

  return (
    <Layout tabs={tabs} navLabel={tn('plan', 'nav.label')}>
      <ScrollReset />
      <Outlet />
    </Layout>
  );
}
