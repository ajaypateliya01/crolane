import { initSite } from './site';
import { initDemos } from './demos';
import { initTrack } from './track';

function boot() {
  initSite();
  initDemos();
  initTrack();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
