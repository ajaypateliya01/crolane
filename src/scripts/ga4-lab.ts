/**
 * Measurement Check Lab for the GA4 service page.
 * Rests in a loaded, waiting state. Play runs a fixed validation pass:
 * each event checks, one naming issue is caught and fixed, then a
 * cautious verdict appears. All data is illustrative demo content.
 */

const ORDER = ['page_view', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase'];

function initGa4Lab(root: HTMLElement) {
  if (root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const playBtn = root.querySelector<HTMLButtonElement>('[data-ga4-play]');
  const playLabel = root.querySelector<HTMLElement>('[data-ga4-play-label]');
  const status = root.querySelector<HTMLElement>('[data-ga4-status]');
  const log = root.querySelector<HTMLOListElement>('[data-ga4-log]');
  const validatedEl = root.querySelector<HTMLElement>('[data-ga4-validated]');
  const issuesEl = root.querySelector<HTMLElement>('[data-ga4-issues]');
  const fixedEl = root.querySelector<HTMLElement>('[data-ga4-fixed]');
  const verdict = root.querySelector<HTMLElement>('[data-ga4-verdict]');
  const rows = new Map(
    Array.from(root.querySelectorAll<HTMLElement>('[data-ga4-row]')).map((row) => [
      row.dataset.ga4Row || '',
      row,
    ])
  );
  if (!playBtn || !playLabel || !status || !log || !validatedEl || !issuesEl || !fixedEl || !verdict) return;

  const els = { playBtn, playLabel, status, log, validatedEl, issuesEl, fixedEl, verdict };
  let timers: number[] = [];
  let validated = 0;
  let running = false;

  function later(fn: () => void, ms: number) {
    timers.push(window.setTimeout(fn, ms));
  }

  function setRow(id: string, state: string, chip: string, icon: string) {
    const row = rows.get(id);
    if (!row) return;
    row.dataset.state = state;
    const chipEl = row.querySelector<HTMLElement>('[data-ga4-chip]');
    if (chipEl) chipEl.textContent = chip;
    const iconEl = row.querySelector<HTMLElement>('.g-row-icon');
    if (iconEl) iconEl.textContent = icon;
  }

  function addLog(tag: string, text: string, issue = false) {
    const li = document.createElement('li');
    if (issue) li.className = 'is-issue';
    const label = document.createElement('span');
    label.textContent = tag;
    li.append(label, document.createTextNode(text));
    els.log.appendChild(li);
  }

  function bumpValidated() {
    validated += 1;
    els.validatedEl.textContent = String(validated);
  }

  function reset() {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    validated = 0;
    running = false;
    root.dataset.state = 'idle';
    ORDER.forEach((id) => setRow(id, 'waiting', 'Waiting', ''));
    els.validatedEl.textContent = '0';
    els.issuesEl.textContent = '0';
    els.fixedEl.textContent = '0';
    els.verdict.textContent = 'No verdict yet. Run the demo to validate the plan.';
    els.status.textContent = 'Ready when you are. Press Play demo to run the validation.';
    els.log.innerHTML = '';
    addLog('setup', 'Measurement plan loaded. Waiting for the first event.');
    els.playBtn.disabled = false;
    els.playBtn.classList.add('attn');
    els.playLabel.textContent = 'Play demo';
  }

  function finish() {
    running = false;
    root.dataset.state = 'done';
    els.status.textContent = 'Demo complete. Every event on the plan fired with the expected name and details.';
    els.verdict.textContent =
      'All five events validated in this demo run. One naming issue was caught and fixed along the way.';
    addLog('verdict', 'Plan validated for this demo. Real setups also check consent mode and live DebugView data.');
    els.playBtn.disabled = false;
    els.playLabel.textContent = 'Replay demo';
  }

  function passEvent(id: string, message: string) {
    setRow(id, 'passed', 'Passed', '✓');
    bumpValidated();
    addLog('event', message);
  }

  function play() {
    if (running) return;
    reset();
    els.playBtn.classList.remove('attn');
    running = true;
    root.dataset.state = 'running';
    els.playBtn.disabled = true;
    els.playLabel.textContent = 'Running demo';
    els.status.textContent = 'Validation running. Events fire one by one, exactly as a shopper would trigger them.';

    if (reduced) {
      ORDER.forEach((id) => setRow(id, 'passed', 'Passed', '✓'));
      els.validatedEl.textContent = '5';
      els.issuesEl.textContent = '1';
      els.fixedEl.textContent = '1';
      addLog('event', 'page_view, view_item, begin_checkout and purchase fired with the expected details.');
      addLog('issue', 'addToCart fired with a camelCase name. GA4 expects add_to_cart.', true);
      addLog('fix', 'Renamed to add_to_cart and retested. Firing correctly.');
      finish();
      return;
    }

    ORDER.forEach((id, i) => {
      const start = 500 + i * 1150;
      later(() => {
        setRow(id, 'checking', 'Checking', '');
        els.status.textContent = `Checking ${id}. Watching name, trigger and parameters.`;
      }, start);

      if (id === 'add_to_cart') {
        later(() => {
          setRow(id, 'issue', 'Name issue', '!');
          els.issuesEl.textContent = '1';
          addLog('issue', 'addToCart fired with a camelCase name. GA4 expects add_to_cart.', true);
          els.status.textContent = 'One issue caught: the add-to-cart event name does not match the plan.';
        }, start + 600);
        later(() => {
          setRow(id, 'passed', 'Fixed · Passed', '✓');
          els.fixedEl.textContent = '1';
          bumpValidated();
          addLog('fix', 'Renamed to add_to_cart, published the tag and retested. Firing correctly.');
          els.status.textContent = 'Issue fixed and retested. Continuing with the remaining events.';
        }, start + 1700);
      } else {
        later(() => {
          const messages: Record<string, string> = {
            page_view: 'page_view fired on load with page_location and page_title.',
            view_item: 'view_item fired with item_id, item_name and price attached.',
            begin_checkout: 'begin_checkout fired with items, value and currency.',
            purchase: 'purchase fired once, with a unique transaction_id. No duplicates.',
          };
          passEvent(id, messages[id] || `${id} fired as planned.`);
        }, start + 650);
      }
    });

    later(finish, 500 + ORDER.length * 1150 + 1400);
  }

  els.playBtn.addEventListener('click', play);
  reset();
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-ga4-lab]').forEach(initGa4Lab);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
