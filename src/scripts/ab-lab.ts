/**
 * A/B lab interactions: difference annotations and hypothesis selection.
 * Pure DOM state; visual transitions are handled in CSS.
 */

function initLab(lab: HTMLElement) {
  if (lab.dataset.bound === 'true') return;
  lab.dataset.bound = 'true';

  const diffsBtn = lab.querySelector<HTMLButtonElement>('[data-diffs-toggle]');
  const hypBtns = Array.from(lab.querySelectorAll<HTMLButtonElement>('[data-hyp-btn]'));
  const questionEl = lab.querySelector<HTMLElement>('[data-hyp-question]');
  const annots = Array.from(lab.querySelectorAll<HTMLElement>('[data-annot]'));

  const questions = new Map(
    hypBtns.map((b) => [b.dataset.hypBtn || '', b.dataset.question || ''])
  );

  let diffsOn = false;
  let activeHyp = hypBtns[0]?.dataset.hypBtn || 'h1';

  function applyAnnotations() {
    annots.forEach((a) => {
      a.classList.toggle('show', diffsOn);
      a.classList.toggle('match', diffsOn && a.dataset.hyp === activeHyp);
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
    if (!diffsOn) setDiffs(true);
    else applyAnnotations();
  }

  diffsBtn?.addEventListener('click', () => setDiffs(!diffsOn));
  hypBtns.forEach((btn) => {
    btn.addEventListener('click', () => setHyp(btn.dataset.hypBtn || 'h1'));
  });

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
