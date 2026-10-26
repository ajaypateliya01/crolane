/**
 * A/B lab interactions: difference annotations, per-case element highlights,
 * a plain-language difference summary, auto-cycling through every hypothesis
 * until the visitor takes over, and an animated sample bar. Pure DOM state;
 * transitions live in CSS. Everything calms down under reduced motion.
 */

const DIFFS: Record<string, { control: string; variant: string }> = {
  h1: {
    control: 'Quiet outline button, low on the page and easy to scroll past.',
    variant: 'Full-width primary action with the price inside the button.',
  },
  h2: {
    control: 'Delivery estimate appears in small text after the buying decision.',
    variant: 'Exact arrival timing shown before the click, while deciding.',
  },
  h3: {
    control: 'Rating, price and title are scattered down the page.',
    variant: 'Rating pill and price sit together at the top, next to the title.',
  },
};

function initLab(lab: HTMLElement) {
  if (lab.dataset.bound === 'true') return;
  lab.dataset.bound = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // SMIL lane dots cannot be paused by CSS, so remove them for reduced motion.
  if (reduced) {
    lab.querySelectorAll('animateMotion').forEach((m) => m.remove());
  }

  const diffsBtn = lab.querySelector<HTMLButtonElement>('[data-diffs-toggle]');
  const hypBtns = Array.from(lab.querySelectorAll<HTMLButtonElement>('[data-hyp-btn]'));
  const questionEl = lab.querySelector<HTMLElement>('[data-hyp-question]');
  const annots = Array.from(lab.querySelectorAll<HTMLElement>('[data-annot]'));
  const hlEls = Array.from(lab.querySelectorAll<HTMLElement>('[data-hyp]')).filter(
    (el) => !el.hasAttribute('data-annot')
  );
  const compare = lab.querySelector<HTMLElement>('[data-compare]');
  const diffControl = lab.querySelector<HTMLElement>('[data-diff-control]');
  const diffVariant = lab.querySelector<HTMLElement>('[data-diff-variant]');
  const sampleFill = lab.querySelector<HTMLElement>('.sample-bar span');

  const questions = new Map(
    hypBtns.map((b) => [b.dataset.hypBtn || '', b.dataset.question || ''])
  );
  const order = hypBtns.map((b) => b.dataset.hypBtn || 'h1').filter(Boolean);

  let diffsOn = false;
  let activeHyp = order[0] || 'h1';
  let cycleTimer: number | undefined;
  let interacted = false;

  function applyAnnotations() {
    annots.forEach((a) => {
      a.classList.toggle('show', diffsOn);
      a.classList.toggle('match', diffsOn && a.dataset.hyp === activeHyp);
    });
    hlEls.forEach((el) => {
      el.classList.toggle('hl', diffsOn && el.dataset.hyp === activeHyp);
    });
  }

  function setDiffs(on: boolean) {
    diffsOn = on;
    lab.dataset.diffs = String(on);
    if (diffsBtn) {
      diffsBtn.setAttribute('aria-pressed', String(on));
      diffsBtn.textContent = on ? 'Hide differences' : 'Show differences';
    }
    applyAnnotations();
  }

  function setCompare(id: string) {
    const diff = DIFFS[id];
    if (!diff || !diffControl || !diffVariant || !compare) return;
    if (diffControl.textContent === diff.control) return;
    compare.classList.add('swap');
    window.setTimeout(() => {
      diffControl.textContent = diff.control;
      diffVariant.textContent = diff.variant;
      compare.classList.remove('swap');
    }, 170);
  }

  function setHyp(id: string) {
    activeHyp = id;
    hypBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.hypBtn === id)));

    const text = questions.get(id) || '';
    if (questionEl && questionEl.textContent?.trim() !== text) {
      questionEl.classList.add('swap');
      window.setTimeout(() => {
        questionEl.textContent = text;
        questionEl.classList.remove('swap');
      }, 160);
    }
    setCompare(id);
    if (!diffsOn) setDiffs(true);
    else applyAnnotations();
  }

  function stopCycle() {
    window.clearInterval(cycleTimer);
    cycleTimer = undefined;
  }

  function startCycle() {
    if (reduced || interacted || cycleTimer !== undefined || order.length < 2) return;
    cycleTimer = window.setInterval(() => {
      const next = order[(order.indexOf(activeHyp) + 1) % order.length];
      setHyp(next);
    }, 4600);
  }

  diffsBtn?.addEventListener('click', () => {
    interacted = true;
    stopCycle();
    setDiffs(!diffsOn);
  });
  hypBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      interacted = true;
      stopCycle();
      setHyp(btn.dataset.hypBtn || 'h1');
    });
  });
  lab.addEventListener('pointerdown', () => {
    interacted = true;
    stopCycle();
  });

  // Sample bar fills when the lab scrolls into view.
  if (sampleFill) {
    if (reduced) {
      sampleFill.style.width = '64%';
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            sampleFill.style.width = '64%';
            io.disconnect();
          }
        },
        { rootMargin: '80px' }
      );
      io.observe(sampleFill);
    }
  }

  // Auto-showcase every case while the lab is on screen.
  if (!reduced) {
    const vis = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible && !document.hidden) startCycle();
        else stopCycle();
      },
      { rootMargin: '100px' }
    );
    vis.observe(lab);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopCycle();
    });
    window.addEventListener('pagehide', stopCycle, { once: true });
  }

  // Land in a clear state: differences visible, first case highlighted.
  setHyp(activeHyp);
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-ab-lab]').forEach(initLab);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
