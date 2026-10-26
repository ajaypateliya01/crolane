/**
 * Funnel Fix Lab: stage tabs swap the finding and fix, "Apply the fix"
 * animates the after bar and counts the stage rate up. All figures are
 * fixed illustrative demo data; nothing randomises or claims a result.
 */

type Stage = {
  metric: string;
  finding: string;
  steps: string[];
  before: number;
  after: number;
};

const STAGES: Record<string, Stage> = {
  landing: {
    metric: 'Visitors who continue',
    finding:
      'The main promise sits below the fold on mobile, so first-time visitors scroll past the reason to stay.',
    steps: [
      'Lift the promise and primary action into the first screen',
      'Match the headline to the ad or link that sent them',
      'Put one proof point beside the action, not below it',
    ],
    before: 38,
    after: 57,
  },
  product: {
    metric: 'Shoppers who add to bag',
    finding:
      'Variant selection takes three taps, and the delivery timing hides below the product details where nobody reaches it.',
    steps: [
      'One-tap variant chips with the price always visible',
      'Delivery and returns timing next to the buy action',
      'A sticky add-to-bag bar while scrolling the details',
    ],
    before: 24,
    after: 36,
  },
  cart: {
    metric: 'Carts that reach checkout',
    finding:
      'Delivery charges appear for the first time inside checkout, and the cart never explains what happens after the button.',
    steps: [
      'Show the delivery cost, or free-delivery progress, inside the cart',
      'An order summary with charges estimated early',
      'Guest checkout offered before account creation',
    ],
    before: 52,
    after: 64,
  },
  checkout: {
    metric: 'Checkouts completed',
    finding:
      'The form asks for an account first and shows a wall of fields before payment, so people leave to finish later and do not come back.',
    steps: [
      'Guest checkout as the default path',
      'Fewer fields up front, the rest asked in steps',
      'Reassurance beside payment and errors in plain words',
    ],
    before: 41,
    after: 53,
  },
};

function initCroLab(root: HTMLElement) {
  if (root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-cl-tab]'));
  const finding = root.querySelector<HTMLElement>('[data-cl-finding]');
  const steps = root.querySelector<HTMLElement>('[data-cl-steps]');
  const metric = root.querySelector<HTMLElement>('[data-cl-metric]');
  const rate = root.querySelector<HTMLElement>('[data-cl-rate]');
  const barBefore = root.querySelector<HTMLElement>('[data-cl-bar-before]');
  const barAfter = root.querySelector<HTMLElement>('[data-cl-bar-after]');
  const valBefore = root.querySelector<HTMLElement>('[data-cl-val-before]');
  const valAfter = root.querySelector<HTMLElement>('[data-cl-val-after]');
  const delta = root.querySelector<HTMLElement>('[data-cl-delta]');
  const status = root.querySelector<HTMLElement>('[data-cl-status]');
  const apply = root.querySelector<HTMLButtonElement>('[data-cl-apply]');
  if (!finding || !steps || !metric || !rate || !barBefore || !barAfter || !valBefore || !valAfter || !delta || !status || !apply) return;

  const findingEl: HTMLElement = finding;
  const stepsEl: HTMLElement = steps;
  const metricEl: HTMLElement = metric;
  const rateEl: HTMLElement = rate;
  const barBeforeEl: HTMLElement = barBefore;
  const barAfterEl: HTMLElement = barAfter;
  const valBeforeEl: HTMLElement = valBefore;
  const valAfterEl: HTMLElement = valAfter;
  const deltaEl: HTMLElement = delta;
  const statusEl: HTMLElement = status;
  const applyBtn: HTMLButtonElement = apply;

  let current = STAGES.landing;
  let applied = false;
  let raf = 0;

  function setBars(beforeW: number, afterW: number) {
    barBeforeEl.style.width = `${beforeW}%`;
    barAfterEl.style.width = `${afterW}%`;
  }

  function countRate(from: number, to: number) {
    cancelAnimationFrame(raf);
    if (reduced || from === to) {
      rateEl.textContent = String(to);
      return;
    }
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      rateEl.textContent = String(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function select(id: string) {
    const stage = STAGES[id];
    if (!stage) return;
    current = stage;
    applied = false;
    root.classList.remove('applied');
    tabs.forEach((tab) => {
      const active = tab.dataset.clTab === id;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    metricEl.textContent = stage.metric;
    findingEl.textContent = stage.finding;
    stepsEl.innerHTML = '';
    stage.steps.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      stepsEl.appendChild(li);
    });
    cancelAnimationFrame(raf);
    rateEl.textContent = String(stage.before);
    setBars(stage.before, stage.before);
    valBeforeEl.textContent = `${stage.before}%`;
    valAfterEl.textContent = `${stage.before}%`;
    deltaEl.hidden = true;
    statusEl.textContent = 'Showing the current experience, before any fix.';
    applyBtn.disabled = false;
    applyBtn.textContent = 'Apply the fix';
  }

  function applyFix() {
    if (applied) return;
    applied = true;
    root.classList.add('applied');
    setBars(current.before, current.after);
    valAfterEl.textContent = `${current.after}%`;
    countRate(current.before, current.after);
    deltaEl.textContent = `+${current.after - current.before} pts after the fix`;
    deltaEl.hidden = false;
    statusEl.textContent = 'Fix applied. In a real engagement, this is the change an A/B test would validate next.';
    applyBtn.disabled = true;
    applyBtn.textContent = 'Fix applied';
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab.dataset.clTab || 'landing')));
  applyBtn.addEventListener('click', applyFix);

  // Initial paint: bars at the "before" state for the default stage.
  setBars(current.before, current.before);
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-cro-lab]').forEach((el) => initCroLab(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export {};
