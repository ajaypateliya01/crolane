/**
 * Journey playback: moves a simulated cursor through defined waypoints,
 * advances the timeline, fires click rings and reveals the friction
 * callout. Loop is pausable and freezes entirely under reduced motion.
 */

type Waypoint = { left: string; top: string; click?: boolean; scroll?: number };

const WAYPOINTS: Waypoint[] = [
  { left: '14%', top: '10%' },
  { left: '30%', top: '42%' },
  { left: '34%', top: '58%', click: true },
  { left: '56%', top: '74%', click: true, scroll: 62 },
  { left: '64%', top: '84%', click: true, scroll: 100 },
];

const STAGE_ORDER = ['enter', 'browse', 'engage', 'hesitate', 'act'];
const STAGE_DELAY = 2200;

function initTrack(stage: HTMLElement) {
  if (stage.dataset.bound === 'true') return;
  stage.dataset.bound = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cursor = stage.querySelector<HTMLElement>('[data-cursor]');
  const items = Array.from(stage.querySelectorAll<HTMLElement>('[data-stage]'));
  const annot = stage.querySelector<HTMLElement>('[data-track-annot]');
  const callout = stage.querySelector<HTMLElement>('[data-callout]');
  const scrollBar = stage.querySelector<HTMLElement>('[data-scroll-bar]');
  const heatBtn = stage.querySelector<HTMLButtonElement>('[data-heat-toggle]');
  const pauseBtn = stage.querySelector<HTMLButtonElement>('[data-track-pause]');
  const viewport = stage.querySelector<HTMLElement>('[data-viewport]');

  let index = -1;
  let timer = 0;
  let playing = false;
  let paused = false;
  let inView = false;

  function render(i: number, click = false, scroll = 0) {
    const id = STAGE_ORDER[i];
    stage.dataset.stageActive = id;

    items.forEach((li, liIndex) => {
      li.classList.toggle('active', liIndex === i);
      li.classList.toggle('done', liIndex < i);
    });

    if (cursor && WAYPOINTS[i]) {
      cursor.style.left = WAYPOINTS[i].left;
      cursor.style.top = WAYPOINTS[i].top;
      if (click) {
        cursor.classList.remove('clicking');
        void cursor.offsetWidth;
        cursor.classList.add('clicking');
      }
    }

    if (scrollBar) {
      const pct = scroll || (i / (STAGE_ORDER.length - 1)) * 100;
      scrollBar.style.transform = `scaleX(${Math.min(pct / 100, 1)})`;
    }

    annot?.classList.toggle('show', i >= 3);
    if (i >= 4) callout?.classList.add('show');
  }

  function step() {
    index = (index + 1) % STAGE_ORDER.length;
    const wp = WAYPOINTS[index] || {};
    render(index, Boolean(wp.click) && index > 0, wp.scroll);
    if (index === 0 && playing) {
      // fresh loop: clear previous callout state
      callout?.classList.remove('show');
      annot?.classList.remove('show');
    }
    timer = window.setTimeout(step, STAGE_DELAY);
  }

  function play() {
    if (playing || reduced) return;
    playing = true;
    paused = false;
    if (pauseBtn) {
      pauseBtn.textContent = 'Pause';
      pauseBtn.setAttribute('aria-pressed', 'false');
    }
    step();
  }

  function stop(resetLabel = true) {
    playing = false;
    window.clearTimeout(timer);
    if (resetLabel && pauseBtn && !reduced) {
      pauseBtn.textContent = 'Paused';
      pauseBtn.setAttribute('aria-pressed', 'true');
    }
  }

  if (reduced) {
    stage.dataset.reduced = 'true';
    // Static resolved state: everything visible, nothing moves.
    render(STAGE_ORDER.length - 1);
    items.forEach((li) => li.classList.add('done'));
    items.forEach((li) => li.classList.remove('active'));
    annot?.classList.add('show');
    callout?.classList.add('show');
    if (scrollBar) scrollBar.style.transform = 'scaleX(0.75)';
    if (pauseBtn) pauseBtn.hidden = true;
    if (cursor) cursor.style.display = 'none';
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView && !paused && !playing && index < 0) play();
        else if (inView && !paused && !playing) play();
        else if (!inView) stop(false);
      },
      { threshold: 0.35 }
    );
    io.observe(stage);
    void viewport;
  }

  heatBtn?.addEventListener('click', () => {
    const on = stage.dataset.heat !== 'true';
    stage.dataset.heat = String(on);
    heatBtn.setAttribute('aria-pressed', String(on));
    heatBtn.textContent = on ? 'Hide attention map' : 'Show attention map';
  });

  pauseBtn?.addEventListener('click', () => {
    if (paused) {
      paused = false;
      play();
    } else {
      paused = true;
      stop();
    }
  });
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-track]').forEach(initTrack);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
