/**
 * Shopify journey demo: variant and bundle selection, quantity, cart
 * drawer, checkout steps, confirmation and reset. All state is local;
 * nothing is transmitted or stored.
 */

type Colour = 'sage' | 'clay' | 'ink';

const PRICES = { single: 24, pair: 42 };
const COLOUR_LABEL: Record<Colour, string> = { sage: 'Sage', clay: 'Clay', ink: 'Ink' };

function formatUSD(v: number): string {
  return `$${v.toLocaleString('en-US')}`;
}

function initShop(root: HTMLElement) {
  if (root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const drawer = root.querySelector<HTMLElement>('[data-drawer]');
  const rail = root.querySelector<HTMLElement>('[data-shop-rail]');
  const img = root.querySelector<HTMLImageElement>('[data-pdp-img]');
  const colourLabel = root.querySelector<HTMLElement>('[data-colour-label]');
  const priceEl = root.querySelector<HTMLElement>('[data-pdp-price]');
  const ctaPrice = root.querySelector<HTMLElement>('[data-cta-price]');
  const qtyVal = root.querySelector<HTMLElement>('[data-qty-val]');
  const titleEl = root.querySelector<HTMLElement>('[data-drawer-title]');

  const swatches = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-swatch]'));
  const bundles = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-bundle]'));
  const thumbs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-thumb]'));

  let colour: Colour = 'sage';
  let bundle: 'single' | 'pair' = 'single';
  let qty = 1;
  let stage: 'product' | 'bag' | 'checkout' | 'done' = 'product';

  const total = () => PRICES[bundle] * qty;

  function renderRail() {
    if (!rail) return;
    rail.dataset.shopStage = stage;
    const order: string[] = ['product', 'bag', 'checkout', 'done'];
    const idx = order.indexOf(stage);
    rail.querySelectorAll<HTMLElement>('[data-rail]').forEach((li) => {
      const i = order.indexOf(li.dataset.rail || '');
      li.classList.toggle('current', i === idx);
      li.classList.toggle('passed', i < idx);
    });
  }

  function renderPdp() {
    if (colourLabel) colourLabel.textContent = COLOUR_LABEL[colour];
    if (priceEl) priceEl.textContent = formatUSD(PRICES[bundle]);
    if (ctaPrice) ctaPrice.textContent = formatUSD(PRICES[bundle] * qty);
    if (qtyVal) qtyVal.textContent = String(qty);

    if (img) {
      const filters: Record<Colour, string> = {
        sage: 'none',
        clay: 'hue-rotate(-75deg) saturate(1.15)',
        ink: 'grayscale(0.9) brightness(0.55)',
      };
      img.style.filter = filters[colour];
    }

    swatches.forEach((b) => {
      const on = b.dataset.swatch === colour;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    bundles.forEach((b) => {
      const on = b.dataset.bundle === bundle;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function renderBag() {
    root.querySelectorAll<HTMLElement>('[data-bag-variant]').forEach((el) => {
      el.textContent = `${COLOUR_LABEL[colour]} · ${bundle === 'pair' ? '2-pack' : 'Single'} · Qty ${qty}`;
    });
    root.querySelectorAll<HTMLElement>('[data-bag-price], [data-bag-total], [data-co-price], [data-co-total]')
      .forEach((el) => {
        el.textContent = formatUSD(total());
      });
    root.querySelectorAll<HTMLElement>('[data-bag-img]').forEach((el) => {
      if (el instanceof HTMLImageElement && img) el.style.filter = img.style.filter;
    });
  }

  function setView(view: 'bag' | 'checkout' | 'done') {
    root.querySelectorAll<HTMLElement>('.drawer-view').forEach((v) => {
      v.hidden = v.dataset.view !== view;
    });
    if (titleEl) {
      titleEl.textContent =
        view === 'bag' ? 'Your bag' : view === 'checkout' ? 'Checkout' : 'Thank you';
    }
  }

  function setStage(next: typeof stage) {
    stage = next;
    renderRail();
  }

  function openDrawer() {
    root.classList.add('shop-stage-drawer-open');
    drawer?.setAttribute('aria-hidden', 'false');
    setView('bag');
    setStage('bag');
    window.setTimeout(() => titleEl?.focus(), 120);
  }

  function closeDrawer() {
    root.classList.remove('shop-stage-drawer-open');
    drawer?.setAttribute('aria-hidden', 'true');
    if (stage === 'bag') setStage('product');
  }

  function reset() {
    colour = 'sage';
    bundle = 'single';
    qty = 1;
    closeDrawer();
    setStage('product');
    setView('bag');
    renderPdp();
    renderBag();
    const addBtn = root.querySelector<HTMLButtonElement>('[data-add-cart]');
    if (addBtn) addBtn.focus({ preventScroll: true });
  }

  // Colour
  swatches.forEach((b) =>
    b.addEventListener('click', () => {
      colour = (b.dataset.swatch as Colour) || 'sage';
      renderPdp();
    })
  );

  // Bundle
  bundles.forEach((b) =>
    b.addEventListener('click', () => {
      bundle = b.dataset.bundle === 'pair' ? 'pair' : 'single';
      renderPdp();
      renderBag();
    })
  );

  // Gallery
  thumbs.forEach((t) =>
    t.addEventListener('click', () => {
      const which = t.dataset.thumb;
      thumbs.forEach((x) => {
        const on = x === t;
        x.classList.toggle('on', on);
        x.setAttribute('aria-pressed', String(on));
      });
      if (img) {
        img.src = which === 'detail' ? '/images/product-bottle-detail.jpg' : '/images/product-bottle.jpg';
        img.alt =
          which === 'detail'
            ? 'Fictional demo product: bottle with cap removed'
            : 'Fictional demo product: sage green insulated bottle on a warm white surface';
      }
    })
  );

  // Quantity
  root.querySelectorAll<HTMLButtonElement>('[data-qty]').forEach((b) =>
    b.addEventListener('click', () => {
      const delta = Number(b.dataset.qty) || 0;
      qty = Math.min(5, Math.max(1, qty + delta));
      renderPdp();
      renderBag();
    })
  );

  root.querySelector<HTMLButtonElement>('[data-add-cart]')?.addEventListener('click', () => {
    renderBag();
    openDrawer();
  });

  root.querySelector<HTMLButtonElement>('[data-drawer-close]')?.addEventListener('click', closeDrawer);

  root.querySelector<HTMLButtonElement>('[data-goto-checkout]')?.addEventListener('click', () => {
    setView('checkout');
    setStage('checkout');
    window.setTimeout(() => titleEl?.focus(), 80);
  });

  root.querySelector<HTMLButtonElement>('[data-place-order]')?.addEventListener('click', () => {
    setView('done');
    setStage('done');
    window.setTimeout(() => titleEl?.focus(), 80);
  });

  root.querySelectorAll<HTMLButtonElement>('[data-shop-reset], [data-shop-reset-2]').forEach((b) =>
    b.addEventListener('click', reset)
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('shop-stage-drawer-open')) closeDrawer();
  });

  renderPdp();
  renderBag();
  renderRail();
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-shop]').forEach(initShop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
