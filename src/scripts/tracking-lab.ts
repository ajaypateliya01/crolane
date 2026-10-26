/**
 * Journey Signal Lab for the Conversion Tracking service page.
 * Rests mapped but silent. Play flows 1,000 fixed demo visitors
 * through five stages; the sharpest drop is flagged at the end.
 */

type Stage = { id: string; visitors: number; dropFromPrevious?: number };

const STAGES: Stage[] = [
  { id: 'visit', visitors: 1000 },
  { id: 'product', visitors: 640, dropFromPrevious: 360 },
  { id: 'cart', visitors: 190, dropFromPrevious: 450 },
  { id: 'checkout', visitors: 122, dropFromPrevious: 68 },
  { id: 'purchase', visitors: 86, dropFromPrevious: 36 },
];

const RUN_MS = 6000;

function initTrackingLab(root: HTMLElement) {
  if (root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const playBtn = root.querySelector<HTMLButtonElement>('[data-tr-play]');
  const playLabel = root.querySelector<HTMLElement>('[data-tr-play-label]');
  const status = root.querySelector<HTMLElement>('[data-tr-status]');
  const insightTitle = root.querySelector<HTMLElement>('[data-tr-insight-title]');
  const insightText = root.querySelector<HTMLElement>('[data-tr-insight-text]');
  const log = root.querySelector<HTMLOListElement>('[data-tr-log]');
  const rows = new Map(
    Array.from(root.querySelectorAll<HTMLElement>('[data-tr-row]')).map((row) => [
      row.dataset.trRow || '',
      {
        row,
        count: row.querySelector<HTMLElement>('[data-tr-count]'),
        pct: row.querySelector<HTMLElement>('[data-tr-pct]'),
        bar: row.querySelector<HTMLElement>('[data-tr-bar]'),
        drop: row.querySelector<HTMLElement>('[data-tr-drop]'),
      },
    ])
  );
  if (!playBtn || !playLabel || !status || !insightTitle || !insightText || !log) return;

  const els = { playBtn, playLabel, status, insightTitle, insightText, log };
  let raf = 0;
  let running = false;
  const logged = new Set<string>();

  function addLog(tag: string, text: string, key: string) {
    if (logged.has(key)) return;
    logged.add(key);
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = tag;
    li.append(label, document.createTextNode(text));
    els.log.appendChild(li);
  }

  function render(progress: number) {
    STAGES.forEach((stage, i) => {
      const parts = rows.get(stage.id);
      if (!parts || !parts.count || !parts.pct || !parts.bar || !parts.drop) return;
      // Each stage starts flowing slightly after the one before it.
      const local = Math.max(0, Math.min(1, progress * 1.35 - i * 0.09));
      const visitors = Math.round(stage.visitors * local);
      const pctOfStart = (visitors / 10).toFixed(visitors % 10 === 0 ? 0 : 1);
      parts.count.textContent = visitors.toLocaleString('en-US');
      parts.pct.textContent = `${pctOfStart}%`;
      parts.bar.style.width = `${Math.max(3, (visitors / 1000) * 100)}%`;

      if (stage.dropFromPrevious && local > 0.92) {
        parts.drop.hidden = false;
        parts.drop.textContent = `${stage.dropFromPrevious} fewer than the stage above`;
      }
    });

    if (progress > 0.25) {
      els.status.textContent = 'Visitors are moving. The early stages always look healthier than the middle.';
      addLog('flow', 'Traffic entered the funnel and reached product pages.', 'flow');
    }
    if (progress > 0.6) {
      els.status.textContent = 'The middle of the funnel is where this demo journey starts leaking.';
      addLog('signal', 'The product-to-cart step is losing far more people than its neighbours.', 'signal');
    }
  }

  function reset() {
    cancelAnimationFrame(raf);
    running = false;
    logged.clear();
    root.dataset.state = 'idle';
    els.status.textContent = 'Ready when you are. Press Play demo to send visitors through.';
    els.insightTitle.textContent = 'No leak found yet';
    els.insightText.textContent =
      'The sharpest drop appears here once visitors have flowed through the funnel.';
    els.log.innerHTML = '';
    addLog('setup', 'Funnel mapped across five stages. Waiting for traffic.', 'setup');
    STAGES.forEach((stage) => {
      const parts = rows.get(stage.id);
      if (!parts) return;
      parts.row.classList.remove('is-leak');
      if (parts.count) parts.count.textContent = '0';
      if (parts.pct) parts.pct.textContent = '0%';
      if (parts.bar) parts.bar.style.width = '8%';
      if (parts.drop) parts.drop.hidden = true;
    });
    els.playBtn.disabled = false;
    els.playBtn.classList.add('attn');
    els.playLabel.textContent = 'Play demo';
  }

  function finish() {
    running = false;
    root.dataset.state = 'done';
    render(1);
    const cart = rows.get('cart');
    cart?.row.classList.add('is-leak');
    els.status.textContent = 'Demo complete. One step is doing most of the damage.';
    els.insightTitle.textContent = 'Biggest drop: Product view to Add to cart';
    els.insightText.textContent =
      'In this demo, 450 of every 1,000 visitors leave between viewing a product and adding it. That is where recordings, heatmaps and friction fixes would look first.';
    addLog('leak', 'Sharpest drop flagged between Product view and Add to cart.', 'leak');
    addLog('next', 'A real review would pair this with recordings and device splits before recommending a fix.', 'next');
    els.playBtn.disabled = false;
    els.playLabel.textContent = 'Replay demo';
  }

  function play() {
    if (running) return;
    reset();
    els.playBtn.classList.remove('attn');

    if (reduced) {
      finish();
      return;
    }

    running = true;
    root.dataset.state = 'running';
    els.playBtn.disabled = true;
    els.playLabel.textContent = 'Running demo';
    els.status.textContent = 'Sending 1,000 demo visitors into the funnel.';
    addLog('launch', 'Demo traffic started. Counts are fixed for this illustration.', 'launch');

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / RUN_MS);
      render(progress);
      if (progress < 1 && running) {
        raf = requestAnimationFrame(tick);
      } else if (running) {
        finish();
      }
    };
    raf = requestAnimationFrame(tick);
  }

  els.playBtn.addEventListener('click', play);
  reset();
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-tracking-lab]').forEach(initTrackingLab);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
