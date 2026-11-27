/**
 * Lightweight click tracking for GA4 (gtag) and GTM (dataLayer).
 * Any element with data-track="event_name" sends that event.
 * Optional data-track-label and data-track-value add context.
 */
type W = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function sendEvent(name: string, params: Record<string, unknown> = {}) {
  const w = window as W;
  if (typeof w.gtag === 'function') w.gtag('event', name, params);
  (w.dataLayer = w.dataLayer || []).push({ event: name, ...params });
}

export function initTrack() {
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
    if (!el || !el.dataset.track) return;
    sendEvent(el.dataset.track, {
      track_label: el.dataset.trackLabel || el.textContent?.trim().slice(0, 80),
      value: el.dataset.trackValue ? Number(el.dataset.trackValue) : undefined,
      currency: el.dataset.trackValue ? 'USD' : undefined,
      page_path: location.pathname,
    });
  });
}
