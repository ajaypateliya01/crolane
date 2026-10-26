/**
 * Header behaviour: sticky state, services dropdown, mobile drawer with
 * focus management. Safe to run multiple times (guard per element).
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function initDropdown(header: HTMLElement) {
  const wrap = header.querySelector<HTMLElement>('[data-services-menu]');
  const trigger = header.querySelector<HTMLButtonElement>('[data-menu-trigger]');
  if (!wrap || !trigger) return;

  let closeTimer: number | undefined;

  const open = () => {
    window.clearTimeout(closeTimer);
    wrap.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    header.classList.add('menu-open');
  };

  const close = (immediate = false) => {
    window.clearTimeout(closeTimer);
    const run = () => {
      wrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      if (!header.querySelector('[data-mobile-toggle][aria-expanded="true"]')) {
        header.classList.remove('menu-open');
      }
    };
    if (immediate) run();
    else closeTimer = window.setTimeout(run, 140);
  };

  trigger.addEventListener('click', () => {
    wrap.classList.contains('open') ? close(true) : open();
  });

  wrap.addEventListener('pointerenter', (e) => {
    if ((e as PointerEvent).pointerType === 'mouse') open();
  });
  wrap.addEventListener('pointerleave', (e) => {
    if ((e as PointerEvent).pointerType === 'mouse') close();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      open();
      const first = wrap.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }
  });

  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
      trigger.focus();
    }
  });

  document.addEventListener('pointerdown', (e) => {
    if (!wrap.contains(e.target as Node) && !trigger.contains(e.target as Node)) close(true);
  });
}

function initMobile(header: HTMLElement) {
  const toggle = header.querySelector<HTMLButtonElement>('[data-mobile-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-mobile-panel]');
  const label = header.querySelector<HTMLElement>('[data-menu-label]');
  if (!toggle || !panel) return;

  let open = false;
  let lastFocus: HTMLElement | null = null;

  const setOpen = (next: boolean) => {
    open = next;
    toggle.setAttribute('aria-expanded', String(next));
    if (label) label.textContent = next ? 'Close menu' : 'Open menu';
    if (next) {
      lastFocus = document.activeElement as HTMLElement;
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('open'));
      header.classList.add('menu-open');
      document.documentElement.style.overflow = 'hidden';
      window.__lenis?.stop();
      window.setTimeout(() => {
        panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();
      }, 60);
    } else {
      panel.classList.remove('open');
      header.classList.remove('menu-open');
      document.documentElement.style.overflow = '';
      window.__lenis?.start();
      window.setTimeout(() => {
        if (!panel.classList.contains('open')) panel.hidden = true;
      }, 560);
      lastFocus?.focus();
    }
  };

  toggle.addEventListener('click', () => setOpen(!open));

  panel.addEventListener('click', (e) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (anchor) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === 'Tab') {
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (open && window.innerWidth > 960) setOpen(false);
  });
}

export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header || header.dataset.bound === 'true') return;
  header.dataset.bound = 'true';

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  initDropdown(header);
  initMobile(header);
}
