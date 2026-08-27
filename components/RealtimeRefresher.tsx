'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Cuando uno de los dos sube, edita o borra una foto, el otro lo ve al momento:
 * escuchamos los cambios de la tabla `photos` por Realtime y refrescamos los
 * Server Components (que son quienes firman las URLs de las imágenes).
 *
 * Como red de seguridad, también refrescamos al volver a la app, por si el
 * websocket se cayó mientras el móvil estaba en segundo plano.
 */
export default function RealtimeRefresher() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('photos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'photos' },
        () => router.refresh()
      )
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [router]);

  return null;
}
