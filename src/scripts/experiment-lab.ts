/**
 * Experiment Flight Deck for the A/B Testing service page.
 * The demo rests in a ready state. Pressing Play runs one fixed,
 * illustrative simulation: traffic splits 50/50, counters build,
 * dots stream through both lanes and a cautious readout appears.
 */

type Scenario = {
  hypothesis: string;
  decision: string;
  controlCta: string;
  variantCta: string;
  controlNote: string;
  variantNote: string;
  controlVisitors: number;
  controlConversions: number;
  variantVisitors: number;
  variantConversions: number;
  sampleTarget: number;
  verdict: string;
  verdictText: string;
};

const SCENARIOS: Record<string, Scenario> = {
  cta: {
    hypothesis:
      'If the main action is impossible to miss, more visitors will add the bottle to their bag.',
    decision:
      'Consider shipping only if the variant improves add-to-bag rate without hurting checkout starts.',
    controlCta: 'Add to bag',
    variantCta: 'Add to bag · $24',
    controlNote: 'The action sits quietly lower on the page.',
    variantNote: 'Price joins the action, so the next step is obvious.',
    controlVisitors: 2400,
    controlConversions: 77,
    variantVisitors: 2400,
    variantConversions: 96,
    sampleTarget: 84,
    verdict: 'Ready for a decision review',
    verdictText:
      'The variant is ahead in this made-up run. A real team would still check key segments and guardrails before shipping.',
  },
  delivery: {
    hypothesis:
      'If delivery timing is clear before the click, fewer shoppers will hesitate at the bag and checkout.',
    decision:
      'Consider shipping only if checkout starts rise without increasing delivery-related support questions.',
    controlCta: 'Add to bag',
    variantCta: 'Add to bag',
    controlNote: 'Delivery timing appears later, after the decision.',
    variantNote: 'Arrival timing is visible before the shopper commits.',
    controlVisitors: 1860,
    controlConversions: 63,
    variantVisitors: 1860,
    variantConversions: 79,
    sampleTarget: 76,
    verdict: 'Keep collecting',
    verdictText:
      'The direction is encouraging, but this demo run has not reached its sample target, so the honest answer is to continue.',
  },
  proof: {
    hypothesis:
      'If rating, price and returns sit together, shoppers will need less hunting before they trust the offer.',
    decision:
      'Consider shipping only if add-to-bag improves and product-page exits do not rise on mobile.',
    controlCta: 'Add to bag',
    variantCta: 'Add to bag',
    controlNote: 'Price and social proof are separated by other details.',
    variantNote: 'Rating, price and free returns answer the doubts together.',
    controlVisitors: 2240,
    controlConversions: 74,
    variantVisitors: 2240,
    variantConversions: 88,
    sampleTarget: 69,
    verdict: 'Not enough evidence yet',
    verdictText:
      'A visible gap is not proof. The sample is short of target, so a careful readout waits instead of declaring a winner.',
  },
};

const RUN_MS = 6800;

function initExperimentLab(root: HTMLElement) {
  if (root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenarioBtns = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-ex-scenario]'));
  const playBtn = root.querySelector<HTMLButtonElement>('[data-ex-play]');
  const playLabel = root.querySelector<HTMLElement>('[data-ex-play-label]');
  const hypothesis = root.querySelector<HTMLElement>('[data-ex-hypothesis]');
  const decision = root.querySelector<HTMLElement>('[data-ex-decision]');
  const stage = root.querySelector<HTMLElement>('[data-ex-stage]');
  const status = root.querySelector<HTMLElement>('[data-ex-status]');
  const clock = root.querySelector<HTMLElement>('[data-ex-clock]');
  const controlCta = root.querySelector<HTMLElement>('[data-ex-control-cta]');
  const variantCta = root.querySelector<HTMLElement>('[data-ex-variant-cta]');
  const controlNote = root.querySelector<HTMLElement>('[data-ex-control-note]');
  const variantNote = root.querySelector<HTMLElement>('[data-ex-variant-note]');
  const streamControl = root.querySelector<HTMLElement>('[data-ex-stream-control]');
  const streamVariant = root.querySelector<HTMLElement>('[data-ex-stream-variant]');
  const visitorsControl = root.querySelector<HTMLElement>('[data-ex-visitors-control]');
  const visitorsVariant = root.querySelector<HTMLElement>('[data-ex-visitors-variant]');
  const conversionsControl = root.querySelector<HTMLElement>('[data-ex-conversions-control]');
  const conversionsVariant = root.querySelector<HTMLElement>('[data-ex-conversions-variant]');
  const rateControl = root.querySelector<HTMLElement>('[data-ex-rate-control]');
  const rateVariant = root.querySelector<HTMLElement>('[data-ex-rate-variant]');
  const barControl = root.querySelector<HTMLElement>('[data-ex-bar-control]');
  const barVariant = root.querySelector<HTMLElement>('[data-ex-bar-variant]');
  const sampleValue = root.querySelector<HTMLElement>('[data-ex-sample-value]');
  const sampleFill = root.querySelector<HTMLElement>('[data-ex-sample-fill]');
  const sampleText = root.querySelector<HTMLElement>('[data-ex-sample-text]');
  const difference = root.querySelector<HTMLElement>('[data-ex-difference]');
  const differenceText = root.querySelector<HTMLElement>('[data-ex-difference-text]');
  const verdict = root.querySelector<HTMLElement>('[data-ex-verdict]');
  const verdictText = root.querySelector<HTMLElement>('[data-ex-verdict-text]');
  const log = root.querySelector<HTMLOListElement>('[data-ex-log]');

  if (
    !playBtn || !playLabel || !hypothesis || !decision || !stage || !status || !clock ||
    !controlCta || !variantCta || !controlNote || !variantNote || !streamControl ||
    !streamVariant || !visitorsControl || !visitorsVariant || !conversionsControl ||
    !conversionsVariant || !rateControl || !rateVariant || !barControl || !barVariant ||
    !sampleValue || !sampleFill || !sampleText || !difference || !differenceText ||
    !verdict || !verdictText || !log
  ) {
    return;
  }

  const els = {
    playBtn,
    playLabel,
    hypothesis,
    decision,
    stage,
    status,
    clock,
    controlCta,
    variantCta,
    controlNote,
    variantNote,
    streamControl,
    streamVariant,
    visitorsControl,
    visitorsVariant,
    conversionsControl,
    conversionsVariant,
    rateControl,
    rateVariant,
    barControl,
    barVariant,
    sampleValue,
    sampleFill,
    sampleText,
    difference,
    differenceText,
    verdict,
    verdictText,
    log,
  };

  let scenario = SCENARIOS.cta;
  let running = false;
  let raf = 0;
  let dotTimer = 0;
  let dotIndex = 0;
  const logged = new Set<string>();

  function formatNumber(value: number) {
    return Math.floor(value).toLocaleString('en-US');
  }

  function formatClock(ms: number) {
    const total = Math.floor(ms / 1000);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  function addLog(tag: string, text: string, key: string) {
    if (logged.has(key)) return;
    logged.add(key);
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = tag;
    li.append(label, document.createTextNode(text));
    els.log.appendChild(li);
  }

  function clearStream(stream: HTMLElement) {
    stream.querySelectorAll('.ex-dot').forEach((dot) => dot.remove());
  }

  function spawnDot(stream: HTMLElement, converted: boolean) {
    if (stream.querySelectorAll('.ex-dot').length > 34) return;
    const dot = document.createElement('span');
    dot.className = converted ? 'ex-dot is-converted' : 'ex-dot';
    dot.style.top = `${28 + (dotIndex % 4) * 6}px`;
    stream.appendChild(dot);
    window.setTimeout(() => dot.remove(), 1550);
  }

  function spawnDots() {
    dotIndex += 1;
    spawnDot(els.streamControl, dotIndex % 31 === 0);
    spawnDot(els.streamVariant, dotIndex % 23 === 0);
  }

  function setMetricValues(progress: number) {
    const cv = scenario.controlVisitors * progress;
    const vv = scenario.variantVisitors * progress;
    const cc = scenario.controlConversions * Math.pow(progress, 1.04);
    const vc = scenario.variantConversions * Math.pow(progress, 1.04);
    const cr = cv > 0 ? (cc / cv) * 100 : 0;
    const vr = vv > 0 ? (vc / vv) * 100 : 0;

    els.visitorsControl.textContent = formatNumber(cv);
    els.visitorsVariant.textContent = formatNumber(vv);
    els.conversionsControl.textContent = formatNumber(cc);
    els.conversionsVariant.textContent = formatNumber(vc);
    els.rateControl.textContent = `${cr.toFixed(2)}%`;
    els.rateVariant.textContent = `${vr.toFixed(2)}%`;
    els.barControl.style.width = `${Math.min(100, (cr / 5) * 100)}%`;
    els.barVariant.style.width = `${Math.min(100, (vr / 5) * 100)}%`;

    const sample = Math.min(scenario.sampleTarget, scenario.sampleTarget * progress);
    els.sampleValue.textContent = `${Math.round(sample)}%`;
    els.sampleFill.style.width = `${sample}%`;
    els.sampleText.textContent =
      progress <= 0
        ? 'Waiting to start.'
        : progress < 1
          ? 'Collecting the agreed sample. Early reads can wobble.'
          : 'Demo sample target reached. Guardrails still need a real check.';

    if (progress > 0.18 && cv >= 100) {
      const diff = vr - cr;
      els.difference.textContent = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} pts`;
      els.differenceText.textContent =
        progress < 1
          ? 'Observed so far. It is not a conclusion yet.'
          : 'Observed across this fixed demo run.';
    } else {
      els.difference.textContent = '—';
      els.differenceText.textContent = 'The gap appears only after visitors arrive.';
    }
  }

  function applyScenario() {
    els.hypothesis.textContent = scenario.hypothesis;
    els.decision.textContent = scenario.decision;
    els.controlCta.textContent = scenario.controlCta;
    els.variantCta.textContent = scenario.variantCta;
    els.controlNote.textContent = scenario.controlNote;
    els.variantNote.textContent = scenario.variantNote;
  }

  function reset() {
    running = false;
    cancelAnimationFrame(raf);
    window.clearInterval(dotTimer);
    logged.clear();
    els.stage.dataset.state = 'idle';
    els.clock.textContent = '00:00';
    els.status.textContent = 'Ready when you are. Press Play demo to send the first visitors through.';
    els.verdict.textContent = 'No decision yet';
    els.verdictText.textContent = 'A result is read after the agreed sample and guardrails are checked.';
    els.log.innerHTML = '';
    addLog('Setup', 'Brief agreed, split set to 50 / 50, traffic still at zero.', 'setup');
    clearStream(els.streamControl);
    clearStream(els.streamVariant);
    setMetricValues(0);
    els.playBtn.disabled = false;
    els.playBtn.classList.add('attn');
    els.playLabel.textContent = 'Play demo';
    applyScenario();
  }

  function finish() {
    running = false;
    window.clearInterval(dotTimer);
    els.stage.dataset.state = 'done';
    els.status.textContent = 'Demo complete. The readout is cautious on purpose: evidence first, decision second.';
    els.verdict.textContent = scenario.verdict;
    els.verdictText.textContent = scenario.verdictText;
    addLog('Readout', scenario.verdictText, 'readout');
    els.playBtn.disabled = false;
    els.playLabel.textContent = 'Replay demo';
  }

  function update(progress: number, elapsed: number) {
    els.clock.textContent = formatClock(elapsed);
    setMetricValues(progress);

    if (progress > 0.08) {
      els.status.textContent = 'Visitors are entering and splitting evenly between both experiences.';
      addLog('Traffic', 'Visitors split 50 / 50. Neither side gets a head start.', 'traffic');
    }
    if (progress > 0.38) {
      els.status.textContent = 'Early numbers are moving. A good experimenter does not call the result yet.';
      addLog('Patience', 'Early reads wobble, so nobody declares a winner from the first bump.', 'patience');
    }
    if (progress > 0.68) {
      els.status.textContent = 'The sample is building. Difference, rate and progress are now worth watching together.';
      addLog('Sample', 'The agreed sample is in sight; the decision rule has not changed mid-run.', 'sample');
    }
    if (progress > 0.9) {
      addLog('Guardrail', 'Before any ship decision, checkout starts and support signals would be checked.', 'guardrail');
    }
  }

  function play() {
    if (running) return;
    reset();
    els.playBtn.classList.remove('attn');

    if (reduced) {
      els.clock.textContent = formatClock(RUN_MS);
      setMetricValues(1);
      addLog('Traffic', 'Visitors split 50 / 50. Neither side gets a head start.', 'traffic');
      addLog('Sample', 'The agreed sample is in sight; the decision rule has not changed mid-run.', 'sample');
      addLog('Guardrail', 'Before any ship decision, checkout starts and support signals would be checked.', 'guardrail');
      finish();
      return;
    }

    running = true;
    els.stage.dataset.state = 'running';
    els.playBtn.disabled = true;
    els.playLabel.textContent = 'Running demo';
    els.status.textContent = 'Sending the first visitors through the split.';
    addLog('Launch', 'Demo traffic starts now. The setup does not change while the run is live.', 'launch');

    dotTimer = window.setInterval(spawnDots, 170);
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / RUN_MS);
      update(progress, elapsed);
      if (progress < 1 && running) {
        raf = requestAnimationFrame(tick);
      } else if (running) {
        finish();
      }
    };
    raf = requestAnimationFrame(tick);
  }

  scenarioBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = SCENARIOS[btn.dataset.exScenario || 'cta'];
      if (!next) return;
      scenario = next;
      scenarioBtns.forEach((item) => {
        const active = item === btn;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      reset();
    });
  });

  els.playBtn.addEventListener('click', play);
  reset();
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-experiment-lab]').forEach(initExperimentLab);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
