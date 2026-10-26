/**
 * Hero dashboard: a self-contained illustrative demo. Counters for purchases,
 * add-to-cart, checkouts and revenue tick up every second or so, the A/B
 * chart rolls forward and the activity bars breathe. All data is fictional
 * and generated in the browser; pauses off-screen, when the tab is hidden,
 * and stays completely static under prefers-reduced-motion.
 */
export function initHeroDash(root: HTMLElement) {
  if (root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);

  const elPurchases = q<HTMLElement>('[data-kpi="purchases"]');
  const elCarts = q<HTMLElement>('[data-kpi="carts"]');
  const elRate = q<HTMLElement>('[data-kpi="rate"]');
  const elRevenue = q<HTMLElement>('[data-kpi="revenue"]');
  const area = q<SVGPathElement>('[data-chart-area]');
  const lineA = q<SVGPathElement>('[data-chart-a]');
  const lineB = q<SVGPathElement>('[data-chart-b]');
  const dot = q<SVGCircleElement>('[data-chart-dot]');
  const barsBox = q<HTMLElement>('[data-bars]');
  const toast = document.querySelector<HTMLElement>('[data-toast]');
  if (!elPurchases || !elCarts || !elRate || !elRevenue || !area || !lineA || !lineB) return;

  const state = {
    purchases: 1284,
    carts: 3912,
    checkout: 986,
    revenue: 1248300,
    rate: 3.42,
  };

  const N = 26;
  const seriesA: number[] = Array.from({ length: N }, (_, i) => 70 + Math.sin(i * 0.55) * 22 + i * 1.1);
  const seriesB: number[] = seriesA.map((v, i) => v * 1.07 + 7 + Math.sin(i * 0.4) * 5);

  const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');
  const W = 560;
  const H = 190;

  function smoothPath(data: number[]): string {
    const step = (W - 16) / (data.length - 1);
    const pts = data.map((v, i) => [8 + i * step, H - 18 - Math.max(8, Math.min(165, v))] as const);
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const mx = (x0 + x1) / 2;
      d += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }
    return d;
  }

  function draw() {
    const dA = smoothPath(seriesA);
    const dB = smoothPath(seriesB);
    lineA!.setAttribute('d', dA);
    lineB!.setAttribute('d', dB);
    area!.setAttribute('d', `${dA} L ${W - 8},${H - 4} L 8,${H - 4} Z`);
    if (dot) {
      const last = seriesA[seriesA.length - 1];
      dot.setAttribute('cx', String(W - 8));
      dot.setAttribute('cy', String(H - 18 - Math.max(8, Math.min(165, last))));
    }
  }

  function pop(el: HTMLElement | null) {
    if (!el) return;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }

  function render(flash = false) {
    elPurchases!.textContent = fmt(state.purchases);
    elCarts!.textContent = fmt(state.carts);
    elRate!.textContent = `${state.rate.toFixed(2)}%`;
    elRevenue!.textContent = fmt(state.revenue);
    root.querySelectorAll<HTMLElement>('[data-evt]').forEach((el) => {
      const key = el.dataset.evt as keyof typeof state;
      if (key in state) el.textContent = fmt(state[key] as number);
    });
    if (flash) {
      pop(elPurchases);
      pop(elCarts);
      pop(elRevenue!.parentElement);
    }
    draw();
  }

  const toasts = [
    'Purchase · ₹1,890 · just now',
    'Add to cart · Field Bottle · now',
    'Checkout started · ₹3,390 · now',
    'Purchase · ₹2,450 · just now',
  ];
  let toastIdx = 0;

  function tick() {
    const cartsInc = 2 + Math.floor(Math.random() * 6);
    const buyInc = Math.random() < 0.72 ? 1 + Math.floor(Math.random() * 3) : 0;
    const checkoutInc = Math.random() < 0.6 ? 1 + Math.floor(Math.random() * 3) : 0;
    state.carts += cartsInc;
    state.purchases += buyInc;
    state.checkout += checkoutInc;
    state.revenue += buyInc * (1150 + Math.random() * 950) + cartsInc * 35;
    state.rate = Math.max(3.08, Math.min(3.86, state.rate + (Math.random() - 0.46) * 0.07));

    const nextA = seriesA[seriesA.length - 1] + (Math.random() - 0.42) * 11 + 0.7;
    seriesA.push(Math.max(26, Math.min(158, nextA)));
    seriesA.shift();
    const nextB = seriesB[seriesB.length - 1] + (Math.random() - 0.4) * 11 + 0.9;
    seriesB.push(Math.max(30, Math.min(166, nextB)));
    seriesB.shift();

    if (barsBox) {
      Array.from(barsBox.children).forEach((bar) => {
        (bar as HTMLElement).style.height = `${22 + Math.random() * 76}%`;
      });
    }
    if (toast && Math.random() < 0.55) {
      toastIdx = (toastIdx + 1) % toasts.length;
      toast.textContent = toasts[toastIdx];
    }
    render(true);
  }

  render(false);
  if (reduced) return;

  let timer: number | undefined;
  const start = () => {
    if (timer !== undefined) return;
    timer = window.setInterval(tick, 1400);
  };
  const stop = () => {
    window.clearInterval(timer);
    timer = undefined;
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (visible && !document.hidden) start();
      else stop();
    },
    { rootMargin: '60px' }
  );
  io.observe(root);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
  window.addEventListener('pagehide', () => {
    stop();
    io.disconnect();
  }, { once: true });
}
