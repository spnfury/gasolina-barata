// Enlaces a las stores con atribución de campaña.
//
// radargas.com tiene una copia de este fichero (src/lib/stores.ts) con
// otro SITE_SOURCE: si cambias la forma de los parámetros, cambia las dos.
//
// - Google Play atribuye la instalación con `referrer` (UTM URL-encoded) y la
//   muestra en Play Console → Adquisición de usuarios.
// - App Store la atribuye con `pt` (provider token de App Store Connect) +
//   `ct` (campaña, máx. 40 caracteres) y la muestra en App Analytics →
//   Campañas. Sin `pt` Apple ignora `ct`, así que el token va por entorno.

export type Store = 'ios' | 'android';

const SITE_SOURCE = 'gasolinabarata';

export const APP_STORE_BASE =
  'https://apps.apple.com/es/app/radargas-gasolina-barata/id6760366244';
export const PLAY_STORE_BASE =
  'https://play.google.com/store/apps/details?id=com.radargas.app';

const APP_STORE_PROVIDER_TOKEN = process.env.NEXT_PUBLIC_APPSTORE_PT || '';

/** URL de la store con la campaña `placement` (dónde está el botón). */
export function storeUrl(store: Store, placement: string): string {
  if (store === 'android') {
    const referrer = new URLSearchParams({
      utm_source: SITE_SOURCE,
      utm_medium: 'web',
      utm_campaign: placement,
    }).toString();
    return `${PLAY_STORE_BASE}&referrer=${encodeURIComponent(referrer)}`;
  }

  const params = new URLSearchParams({ ct: `${SITE_SOURCE}-${placement}`.slice(0, 40) });
  if (APP_STORE_PROVIDER_TOKEN) params.set('pt', APP_STORE_PROVIDER_TOKEN);
  return `${APP_STORE_BASE}?${params.toString()}`;
}

/**
 * Clases que el script "tagged-events" de Plausible convierte en el evento
 * "Descarga" con las propiedades store y placement al hacer clic.
 */
export function downloadEventClass(store: Store, placement: string): string {
  return `plausible-event-name=Descarga plausible-event-store=${store} plausible-event-placement=${placement}`;
}
