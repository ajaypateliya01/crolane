/**
 * Workflow demo: step-by-step run of the illustrative enquiry pipeline,
 * node selection for the detail panel, and honest completion state.
 */

type NodeMeta = {
  id: string;
  title: string;
  desc: string;
  detail: string;
  payload: string;
};

const RUN_ORDER = ['n1', 'n2', 'n3', 'n4', 'n5b', 'n6', 'n7'];
const RUN_DELAY = 850;

function initWorkflow(root: HTMLElement) {
  if (root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const runBtn = root.querySelector<HTMLButtonElement>('[data-wf-run]');
  const summary = root.querySelector<HTMLElement>('[data-wf-summary]');
  const titleEl = root.querySelector<HTMLElement>('[data-wf-title]');
  const descEl = root.querySelector<HTMLElement>('[data-wf-desc]');
  const detailEl = root.querySelector<HTMLElement>('[data-wf-detail]');
  const payloadEl = root.querySelector<HTMLElement>('[data-wf-payload]');

  const btns = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-node-btn]'));
  const metas = new Map<string, NodeMeta>();

  btns.forEach((btn) => {
    const id = btn.dataset.nodeBtn || '';
    metas.set(id, {
      id,
      title: btn.dataset.title || '',
      desc: btn.dataset.desc || '',
      detail: btn.dataset.detail || '',
      payload: btn.dataset.payload || '',
    });
    btn.addEventListener('click', () => select(id));
  });

  const statusEl = (id: string) => root.querySelector<HTMLElement>(`[data-node-status='${id}']`);
  const nodeEl = (id: string) => root.querySelector<HTMLElement>(`[data-node='${id}']`);

  function setStatus(id: string, label: string, cls: string) {
    const el = statusEl(id);
    if (!el) return;
    el.textContent = label;
    el.classList.remove('is-run', 'is-done', 'is-wait');
    if (cls) el.classList.add(cls);
  }

  function select(id: string) {
    const meta = metas.get(id);
    if (!meta) return;
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.nodeBtn === id)));
    if (titleEl) titleEl.textContent = meta.title;
    if (descEl) descEl.textContent = meta.desc;
    if (detailEl) detailEl.textContent = meta.detail;
    if (payloadEl) payloadEl.innerHTML = `<pre></pre>`;
    if (payloadEl) {
      const pre = payloadEl.querySelector('pre');
      if (pre) pre.textContent = meta.payload;
    }
  }

  function clearRun() {
    RUN_ORDER.forEach((id) => {
      setStatus(id, 'idle', '');
      nodeEl(id)?.classList.remove('flow-run', 'flow-done');
    });
    summary?.setAttribute('hidden', '');
    runBtn && (runBtn.textContent = 'Run the demo');
  }

  let running = false;
  let timers: number[] = [];

  function finish() {
    running = false;
    summary?.removeAttribute('hidden');
    if (runBtn) runBtn.textContent = 'Run again';
  }

  function run() {
    if (running) return;
    clearRun();
    running = true;

    if (reduced) {
      RUN_ORDER.forEach((id) => {
        setStatus(id, 'done', 'is-done');
        nodeEl(id)?.classList.add('flow-done');
      });
      select('n7');
      finish();
      return;
    }

    if (runBtn) runBtn.textContent = 'Running…';
    RUN_ORDER.forEach((id, i) => {
      const startAt = window.setTimeout(() => {
        if (i > 0) {
          const prev = RUN_ORDER[i - 1];
          setStatus(prev, 'done', 'is-done');
          const prevNode = nodeEl(prev);
          prevNode?.classList.remove('flow-run');
          prevNode?.classList.add('flow-done');
        }
        setStatus(id, 'running', 'is-run');
        nodeEl(id)?.classList.add('flow-run');
        select(id);
      }, i * RUN_DELAY);
      timers.push(startAt);
    });

    const endAt = window.setTimeout(() => {
      const last = RUN_ORDER[RUN_ORDER.length - 1];
      setStatus(last, 'done', 'is-done');
      const lastNode = nodeEl(last);
      lastNode?.classList.remove('flow-run');
      lastNode?.classList.add('flow-done');
      select(last);
      finish();
    }, RUN_ORDER.length * RUN_DELAY);
    timers.push(endAt);
  }

  runBtn?.addEventListener('click', () => {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    running = false;
    run();
  });
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-workflow]').forEach(initWorkflow);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
