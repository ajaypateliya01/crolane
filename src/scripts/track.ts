/**
 * Lightweight click tracking for GTM / GA4.
 * Any element with data-track="event_name" pushes that event to dataLayer.
 * Optional data-track-label and data-track-value add context.
 */
type DL = Record<string, unknown>[];

export function initTrack() {
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
    if (!el) return;
    const w = window as unknown as { dataLayer?: DL };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: el.dataset.track,
      track_label: el.dataset.trackLabel || el.textContent?.trim().slice(0, 80),
      track_value: el.dataset.trackValue ? Number(el.dataset.trackValue) : undefined,
      page_path: location.pathname,
    });
  });
}
