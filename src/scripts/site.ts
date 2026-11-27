/**
 * Site-wide behaviour: header menus, scroll reveals, card tilt, carousels,
 * FAQ accordion, mobile sticky CTA and the offer countdown. Kept small on purpose.
 */
const helpers = {
  reduce: () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  canHover: () => matchMedia('(hover: hover)').matches,
};

function initHeader() {
  const dd = document.getElementById('dd');
  const ddb = document.getElementById('ddb');
  const burger = document.getElementById('burger');
  const mnav = document.getElementById('mnav');
  const hdr = document.getElementById('hdr');
  const mcta = document.getElementById('mcta');
  ddb?.addEventListener('click', () => {
    const open = dd!.classList.toggle('open');
    ddb.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (dd && !dd.contains(e.target as Node)) {
      dd.classList.remove('open');
      ddb?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    dd?.classList.remove('open');
    ddb?.setAttribute('aria-expanded', 'false');
    mnav?.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
  });
  burger?.addEventListener('click', () => {
    const open = mnav!.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  mnav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    mnav.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
  }));
  const onScroll = () => {
    hdr?.classList.toggle('scrolled', scrollY > 8);
    mcta?.classList.toggle('on', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initReveal() {
  const els = document.querySelectorAll('.rv');
  if (helpers.reduce() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));
}

function initTilt() {
  if (helpers.reduce() || !helpers.canHover()) return;
  document.querySelectorAll<HTMLElement>('.stage').forEach((stage) => {
    const t = stage.querySelector<HTMLElement>('.tilt');
    if (!t) return;
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      t.style.setProperty('--ry', `${x * 14}deg`);
      t.style.setProperty('--rx', `${-y * 10}deg`);
    });
    stage.addEventListener('pointerleave', () => {
      t.style.removeProperty('--ry');
      t.style.removeProperty('--rx');
    });
  });
}

function initCarousels() {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((car) => {
    const tr = car.querySelector<HTMLElement>('.track')!;
    const prev = car.querySelector<HTMLButtonElement>('.prev')!;
    const next = car.querySelector<HTMLButtonElement>('.next')!;
    const dots = car.querySelector<HTMLElement>('.cdots')!;
    const draw = () => {
      const w = tr.clientWidth || 1;
      const n = Math.max(1, Math.round(tr.scrollWidth / w));
      const cur = Math.min(n - 1, Math.round(tr.scrollLeft / w));
      dots.innerHTML = Array.from({ length: n }, (_, i) =>
        `<button type="button" aria-label="Go to page ${i + 1}" aria-current="${i === cur}"></button>`).join('');
      dots.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => tr.scrollTo({ left: i * w, behavior: 'smooth' })));
      prev.disabled = tr.scrollLeft < 8;
      next.disabled = tr.scrollLeft + w >= tr.scrollWidth - 8;
    };
    prev.addEventListener('click', () => tr.scrollBy({ left: -tr.clientWidth, behavior: 'smooth' }));
    next.addEventListener('click', () => tr.scrollBy({ left: tr.clientWidth, behavior: 'smooth' }));
    let t = 0;
    tr.addEventListener('scroll', () => { clearTimeout(t); t = window.setTimeout(draw, 80); }, { passive: true });
    addEventListener('resize', draw);
    draw();
  });
}

// Exclusive accordion for browsers without <details name> support.
function initFaq() {
  document.addEventListener('toggle', (e) => {
    const d = e.target as HTMLDetailsElement;
    if (d.tagName !== 'DETAILS' || !d.open || !d.getAttribute('name')) return;
    document.querySelectorAll<HTMLDetailsElement>(`details[name="${d.getAttribute('name')}"]`).forEach((x) => {
      if (x !== d) x.open = false;
    });
  }, true);
}

function initCountdown() {
  document.querySelectorAll<HTMLElement>('[data-countdown]').forEach((c) => {
    const end = Date.parse(c.dataset.countdown || '');
    if (!end) return;
    const tick = () => {
      const d = Math.max(0, end - Date.now()) / 1000;
      const v: Record<string, number> = { d: Math.floor(d / 86400), h: Math.floor((d % 86400) / 3600), m: Math.floor((d % 3600) / 60), s: Math.floor(d % 60) };
      for (const k in v) {
        const el = c.querySelector(`[data-c="${k}"]`);
        if (el) el.textContent = String(v[k]).padStart(2, '0');
      }
    };
    tick();
    setInterval(tick, 1000);
  });
}

// Demo tabs on the homepage swap which demo panel is visible.
function initTabs() {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    const tabs = root.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const panels = root.querySelectorAll<HTMLElement>('[role="tabpanel"]');
    tabs.forEach((tab, i) => tab.addEventListener('click', () => {
      tabs.forEach((t, j) => t.setAttribute('aria-selected', String(i === j)));
      panels.forEach((p, j) => { p.hidden = i !== j; });
    }));
  });
}

export function initSite() {
  initHeader();
  initReveal();
  initTilt();
  initCarousels();
  initFaq();
  initCountdown();
  initTabs();
}
