/**
 * A/B lab interactions: difference annotations, per-case element highlights,
 * a plain-language difference summary and an animated sample bar. The lab
 * rests in its normal state until the visitor opens the differences. Pure DOM state;
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

  function applyAnnotations() {
    annots.forEach((a) => {
      a.classList.toggle('show', diffsOn);
      a.classList.toggle('match', diffsOn && a.dataset.hyp === activeHyp);
    });
    hlEls.forEach((el) => {
      el.classList.toggle('hl', diffsOn && el.dataset.hyp === activeHyp);
    });
  }

  // Pins are measured onto the actual changed elements, so every label
  // sits right beside the change it describes, on every screen size.
  function positionAnnots() {
    if (!diffsOn) return;
    annots.forEach((annot) => {
      const panel = annot.closest<HTMLElement>('.ab-panel');
      if (!panel) return;
      const id = annot.dataset.hyp || '';
      const candidates = Array.from(
        panel.querySelectorAll<HTMLElement>(`[data-hyp="${id}"]`)
      ).filter((el) => !el.hasAttribute('data-annot'));
      if (!candidates.length) return;
      const target =
        candidates.find((el) => (el.textContent || '').includes('$')) || candidates[0];
      const pRect = panel.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      const pinHalf = (annot.querySelector<HTMLElement>('.pin')?.offsetWidth || 12) / 2;
      const pointX = Math.max(2, tRect.left - pRect.left - pinHalf);
      const pointY = Math.min(
        pRect.height - 16,
        Math.max(16, tRect.top - pRect.top + tRect.height / 2)
      );
      // Label extends right by default; flip it inward only if it would
      // spill past the panel edge.
      const flip = pointX + annot.offsetWidth > pRect.width - 4;
      annot.classList.toggle('flip', flip);
      annot.style.right = 'auto';
      annot.style.bottom = 'auto';
      annot.style.left = `${pointX}px`;
      annot.style.top = `${pointY}px`;
    });
  }

  // Until the visitor opens the differences once, the toggle glows gently
  // so it is obvious where to click. This is the resting state of the lab.
  diffsBtn?.classList.add('attn');

  function setDiffs(on: boolean) {
    diffsOn = on;
    if (on) diffsBtn?.classList.remove('attn');
    lab.dataset.diffs = String(on);
    if (diffsBtn) {
      diffsBtn.setAttribute('aria-pressed', String(on));
      diffsBtn.textContent = on ? 'Hide differences' : 'Show differences';
    }
    applyAnnotations();
    if (on) requestAnimationFrame(positionAnnots);
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
    applyAnnotations();
    if (diffsOn) requestAnimationFrame(positionAnnots);
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(positionAnnots, 120);
  });
  window.addEventListener('load', positionAnnots);

  diffsBtn?.addEventListener('click', () => setDiffs(!diffsOn));
  hypBtns.forEach((btn) => {
    btn.addEventListener('click', () => setHyp(btn.dataset.hypBtn || 'h1'));
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

  // Resting state: normal panels, no highlights, first case selected.
  applyAnnotations();
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
