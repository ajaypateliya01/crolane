import { initHeader } from './header';
import { initMotion } from './motion';
import { initTrack } from './track';

function boot() {
  initHeader();
  initMotion();
  initTrack();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
