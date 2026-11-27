import bfcm from '../content/settings/bfcm.json';

/** True while the BFCM offer is switched on in the admin panel. */
export const offerLive = bfcm.enabled;

/** Where "see prices" buttons should point right now. */
export const pricesHref = offerLive ? '/bfcm/' : '/pricing/';

/**
 * Links saved in the admin as /bfcm/ fall back to /pricing/ once the offer
 * is switched off, so no button ever lands on an expired sale page.
 */
export const offerSafeHref = (href: string) =>
  !offerLive && href.startsWith('/bfcm') ? '/pricing/' : href;
