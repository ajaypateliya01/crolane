import { initHeader } from './header';
import { initMotion } from './motion';

function boot() {
  initHeader();
  initMotion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
