import { useCallback, useState } from 'react';

import { buildTrackingExport } from '@domain/model/trackingExport';
import { isoDay, saveBlob, slugifyFilename } from '@services/file/downloadFile';
import useTranslation from '@i18n/useTranslation';

/**
 * Descarga del plan en el formato que importa Lomito Train.
 *
 * Devuelve el estado para que la interfaz avise: no hay avisos flotantes en este
 * producto, asi que el resultado se muestra junto al boton.
 *
 * @param {object} plan Plan resuelto por resolvePlan.
 * @returns {{ exportar: () => Promise<void>, estado: 'idle'|'working'|'done'|'failed', archivo: string|null }}
 */
export default function useTrackingExport(plan) {
  const { t } = useTranslation('plan');
  const [estado, setEstado] = useState('idle');
  const [archivo, setArchivo] = useState(null);

  const exportar = useCallback(async () => {
    setEstado('working');
    const contenido = buildTrackingExport(plan, {
      title: t('profile.title', { name: plan.client.name }),
      routineName: (routine) => t('routine.title', { n: routine.ordinal, name: routine.name }),
    });
    const blob = new Blob([JSON.stringify(contenido, null, 2)], { type: 'application/json' });
    const nombre = `lomito-workouts_${slugifyFilename(plan.client.name, 'plan')}_${isoDay()}.json`;
    const resultado = await saveBlob(blob, nombre, { title: contenido.title });
    if (!resultado.ok) console.error('No se pudo entregar el archivo', resultado.error);
    setArchivo(resultado.ok ? resultado.filename : null);
    setEstado(resultado.ok ? 'done' : 'failed');
  }, [plan, t]);

  return { exportar, estado, archivo };
}
