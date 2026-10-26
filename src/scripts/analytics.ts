/**
 * Dashboard behaviour: pointer/keyboard chart readout, traffic bar entrance
 * and a one-shot event stream sequence. Numbers never randomise on their own;
 * every animation maps to a user action or a defined sequence step.
 */

type ChartPoint = { x: number; y: number; s: number; e: number; d: string };

function initChart(wrap: HTMLElement) {
  if (wrap.dataset.bound === 'true') return;
  wrap.dataset.bound = 'true';

  const raw = wrap.getAttribute('data-points');
  if (!raw) return;
  let points: ChartPoint[] = [];
  try {
    points = JSON.parse(raw) as ChartPoint[];
  } catch {
    return;
  }
  if (!points.length) return;

  const focus = wrap.querySelector<SVGGElement>('[data-chart-focus]');
  const readout = wrap.querySelector<HTMLElement>('[data-chart-readout]');
  const line = focus?.querySelector<SVGLineElement>('.focus-line');
  const dotS = focus?.querySelector<SVGCircleElement>('.focus-dot-s');
  const dotE = focus?.querySelector<SVGCircleElement>('.focus-dot-e');

  const crDay = readout?.querySelector<HTMLElement>('[data-cr-day]');
  const crS = readout?.querySelector<HTMLElement>('[data-cr-s]');
  const crE = readout?.querySelector<HTMLElement>('[data-cr-e]');
  if (!focus || !readout || !line || !dotS || !dotE) return;
  readout.style.display = 'none';
  focus.style.display = 'none';

  const focusG: SVGGElement = focus;
  const readoutEl: HTMLElement = readout;
  const lineEl: SVGLineElement = line;
  const dotSEl: SVGCircleElement = dotS;
  const dotEEl: SVGCircleElement = dotE;
  let index = -1;

  function show(i: number) {
    index = Math.max(0, Math.min(points.length - 1, i));
    const p = points[index];
    focusG.style.display = '';
    readoutEl.style.display = '';
    lineEl.setAttribute('x1', String(p.x));
    lineEl.setAttribute('x2', String(p.x));
    dotSEl.setAttribute('cx', String(p.x));
    dotSEl.setAttribute('cy', String(p.y));
    dotEEl.setAttribute('cx', String(p.x));
    dotEEl.setAttribute('cy', String(230 - 18 - (p.e / 3000) * (230 - 36)));
    if (crDay) crDay.textContent = p.d;
    if (crS) crS.textContent = p.s.toLocaleString('en-US');
    if (crE) crE.textContent = p.e.toLocaleString('en-US');
  }

  function hide() {
    focusG.style.display = 'none';
    readoutEl.style.display = 'none';
    index = -1;
  }

  wrap.addEventListener('pointermove', (e) => {
    const rect = wrap.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / Math.max(rect.width, 1);
    show(Math.round(frac * (points.length - 1)));
  });
  wrap.addEventListener('pointerleave', hide);

  wrap.addEventListener('focus', () => show(index < 0 ? points.length - 1 : index));
  wrap.addEventListener('blur', hide);
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(index + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      show(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      show(points.length - 1);
    } else if (e.key === 'Escape') {
      hide();
    }
  });

}

function initBars() {
  const bars = document.querySelector<HTMLElement>('[data-bars]');
  if (!bars || bars.dataset.bound === 'true') return;
  bars.dataset.bound = 'true';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bars.classList.add('play');
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((en) => en.isIntersecting)) {
        bars.classList.add('play');
        io.disconnect();
      }
    },
    { threshold: 0.4 }
  );
  io.observe(bars);
}

function initStream() {
  const stream = document.querySelector<HTMLElement>('[data-stream]');
  const status = document.querySelector<HTMLElement>('[data-stream-status]');
  if (!stream || stream.dataset.bound === 'true') return;
  stream.dataset.bound = 'true';

  const rows = Array.from(stream.querySelectorAll<HTMLElement>('.stream-row'));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (status) {
      status.textContent = '5 events captured';
      status.classList.remove('is-run');
      status.classList.add('is-done');
    }
    return;
  }

  rows.forEach((r) => r.classList.add('pending'));

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      io.disconnect();
      rows.forEach((row, i) => {
        window.setTimeout(() => {
          row.classList.remove('pending');
          if (i === rows.length - 1 && status) {
            status.textContent = '5 events captured';
            status.classList.remove('is-run');
            status.classList.add('is-done');
          }
        }, 450 + i * 700);
      });
    },
    { threshold: 0.35 }
  );
  io.observe(stream);
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-chart]').forEach(initChart);
  initBars();
  initStream();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
