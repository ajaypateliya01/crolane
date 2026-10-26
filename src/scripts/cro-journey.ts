/**
 * CRO journey: scroll-scrubbed progression along the station rail,
 * timed annotation reveals and the priorities panel resolution.
 * No pinning: everything is driven by the section's own scroll range.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initCroJourney(root: HTMLElement) {
  if (root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = root.querySelector<HTMLElement>('[data-cj-progress]');
  const stations = Array.from(root.querySelectorAll<HTMLElement>('[data-cj-station]'));
  const notes = Array.from(root.querySelectorAll<HTMLElement>('[data-cj-note]'));
  const priorities = root.querySelector<HTMLElement>('[data-cj-priorities]');

  // Stations that get flagged when friction appears near them.
  const flaggedStations = new Set(['landing', 'product', 'checkout']);

  function apply(p: number) {
    if (progress) progress.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`;

    const stationCount = stations.length;
    stations.forEach((li, i) => {
      const threshold = i / (stationCount - 1);
      const lit = p >= threshold - 0.08;
      li.classList.toggle('lit', lit);
      const id = li.dataset.cjStation || '';
      li.classList.toggle('flagged', lit && flaggedStations.has(id) && p >= threshold - 0.06);
    });

    notes.forEach((note) => {
      const at = parseFloat(note.dataset.at || '0');
      note.classList.toggle('lit', p >= at);
    });

    priorities?.classList.toggle('lit', p >= 0.88);
  }

  if (reduced) {
    apply(1);
    return;
  }

  ScrollTrigger.create({
    trigger: root,
    start: 'top 70%',
    end: 'bottom 65%',
    scrub: 0.5,
    onUpdate: (self) => apply(self.progress),
  });

  apply(0);
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-cro-journey]').forEach(initCroJourney);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
