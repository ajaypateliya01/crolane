/**
 * Demo card animations. Each demo only runs while it is on screen,
 * so off-screen cards cost nothing.
 */
const TICK = '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

type Stop = () => void;
type Runner = (el: HTMLElement, q: (k: string) => HTMLElement | null) => Stop;

const loop = (fn: () => void, ms: number): Stop => { const id = setInterval(fn, ms); return () => clearInterval(id); };

const runners: Record<string, Runner> = {
  result(el, q) {
    let on = false;
    let auto = true;
    const buttons = el.closest('.hero-demo')?.querySelectorAll<HTMLButtonElement>('.toggle button');
    const set = (v: boolean) => {
      on = v;
      el.classList.toggle('v-on', on);
      q('big')!.textContent = on ? '+18%' : '+0%';
      q('bsub')!.textContent = on ? 'Add to carts on mobile, variant' : 'Add to carts on mobile, control';
      buttons?.forEach((b, i) => b.setAttribute('aria-pressed', String((i === 1) === on)));
    };
    buttons?.forEach((b, i) => { b.onclick = () => { auto = false; set(i === 1); }; });
    let v = 312;
    const a = loop(() => { if (auto) set(!on); }, 3200);
    const b = loop(() => { v = Math.max(240, v + Math.round(Math.random() * 24 - 11)); q('v')!.textContent = String(v); }, 1400);
    return () => { a(); b(); };
  },
  dash(_el, q) {
    let o = 284;
    return loop(() => { if (Math.random() > 0.5) q('o')!.textContent = String(++o); }, 1500);
  },
  ab(_el, q) {
    let ua = 4120, ub = 4098, ca = 128, cb = 150;
    return loop(() => {
      ua += Math.round(Math.random() * 9); ub += Math.round(Math.random() * 9);
      if (Math.random() > 0.55) ca++;
      if (Math.random() > 0.45) cb++;
      const ra = (ca / ua) * 100, rb = (cb / ub) * 100;
      q('ua')!.textContent = ua.toLocaleString('en-US');
      q('ub')!.textContent = ub.toLocaleString('en-US');
      q('ca')!.textContent = `${ra.toFixed(2)}%`;
      q('cb')!.textContent = `${rb.toFixed(2)}%`;
      q('ma')!.style.width = `${ra * 16}%`;
      q('mb')!.style.width = `${rb * 16}%`;
      q('l')!.textContent = `+${((rb / ra - 1) * 100).toFixed(1)}%`;
      q('p')!.textContent = `${Math.min(97, Math.round(80 + (rb / ra - 1) * 60))}%`;
    }, 1600);
  },
  funnel(el, q) {
    el.querySelectorAll<HTMLElement>('.bar b').forEach((b) => { b.style.width = `${b.dataset.w}%`; });
    const steps = el.querySelectorAll('.step');
    const notes = [
      '<b>Biggest leak:</b> 66% of visitors leave the product page without adding to cart.',
      '<b>Second leak:</b> 43% abandon the cart once shipping cost appears.',
      '<b>Mobile only:</b> checkout loads 3.8s slower than desktop.',
    ];
    let i = 0;
    const set = () => {
      steps.forEach((s) => s.classList.remove('leak'));
      steps[i + 1].classList.add('leak');
      q('note')!.innerHTML = notes[i];
      i = (i + 1) % 3;
    };
    set();
    return loop(set, 3200);
  },
  ga4(_el, q) {
    const ev = [
      ['page_view', '#2f5fd0', 'page_location: /products/linen-shirt'],
      ['view_item', '#2f5fd0', 'item_id: LS-204, value: 68.00'],
      ['add_to_cart', '#c77415', 'currency: USD, value: 68.00'],
      ['begin_checkout', '#c77415', 'items: 2, value: 124.00'],
      ['purchase', '#127a4b', 'transaction_id: 10482, value: 124.00'],
    ];
    let i = 0;
    const s = q('stream')!;
    const add = () => {
      const e = ev[i++ % ev.length];
      const d = document.createElement('div');
      d.className = 'evt';
      d.innerHTML = `<span class="dot" style="background:${e[1]}"></span><div><code>${e[0]}</code><div class="p">${e[2]}</div></div><span class="ok">${TICK}Sent</span>`;
      s.prepend(d);
      while (s.children.length > 5) s.lastChild!.remove();
    };
    if (!s.children.length) add();
    return loop(add, 1300);
  },
  tags(el) {
    const pills = el.querySelectorAll<HTMLElement>('.pill');
    let i = 1;
    return loop(() => {
      if (i < pills.length) { pills[i].className = 'pill on'; pills[i].textContent = 'Firing'; i++; return; }
      pills.forEach((p, j) => { if (j) { p.className = `pill ${j < 3 ? 'fix' : ''}`; p.textContent = j < 3 ? 'Duplicate' : 'Missing'; } });
      i = 1;
    }, 1500);
  },
  voice(_el, q) {
    const lines = [['c', 'Hi, can I book a cleaning this week?'], ['a', 'Of course. I have Tuesday at 4 pm or Thursday at 10 am. Which suits you?'], ['c', 'Tuesday works.'], ['a', 'Done. You will get a text confirmation in a minute.']];
    let timers: number[] = [];
    const play = () => {
      timers.forEach(clearTimeout);
      timers = [];
      q('chat')!.innerHTML = '';
      q('booked')!.classList.remove('on');
      lines.forEach((l, i) => timers.push(window.setTimeout(() => {
        const b = document.createElement('div');
        b.className = `bub ${l[0]}`;
        b.textContent = l[1];
        q('chat')!.append(b);
      }, 600 + i * 1500)));
      timers.push(window.setTimeout(() => q('booked')!.classList.add('on'), 600 + lines.length * 1500));
    };
    play();
    const stop = loop(play, 9500);
    return () => { stop(); timers.forEach(clearTimeout); };
  },
  flow(el, q) {
    const nodes = el.querySelectorAll('.node');
    const logs = ['Trigger: form submitted by jane@brand.co', 'AI score: 86/100, intent: CRO audit', 'HubSpot: contact created, deal stage set', 'Slack: posted to #new-leads'];
    let i = 0;
    return loop(() => {
      nodes.forEach((n) => n.classList.remove('act'));
      nodes[i].classList.add('act');
      q('log')!.innerHTML = `<b>OK</b> ${logs[i]}`;
      i = (i + 1) % 4;
    }, 1400);
  },
  cost(el) {
    el.querySelectorAll<HTMLElement>('.cost b').forEach((b) => { b.style.height = `${b.dataset.h}%`; });
    const li = el.querySelectorAll<HTMLElement>('.issues li');
    let i = 0;
    return loop(() => {
      if (i < li.length) { li[i].classList.add('done'); li[i].querySelector('.x')!.innerHTML = '&#10003;'; i++; return; }
      li.forEach((l) => { l.classList.remove('done'); l.querySelector('.x')!.textContent = '!'; });
      i = 0;
    }, 1200);
  },
};

export function initDemos() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll<HTMLElement>('[data-demo]').forEach((el) => {
    const run = runners[el.dataset.demo || ''];
    if (!run) return;
    const q = (k: string) => el.querySelector<HTMLElement>(`[data-k="${k}"]`);
    // Reduced motion: let one cycle play out, then hold still.
    if (reduce) { const stop = run(el, q); setTimeout(stop, 7000); return; }
    let stop: Stop | null = null;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !stop) stop = run(el, q);
      else if (!e.isIntersecting && stop) { stop(); stop = null; }
    }, { threshold: 0.15 }).observe(el);
  });
}
