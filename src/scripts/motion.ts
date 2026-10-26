/**
 * Motion foundation: smooth scrolling (Lenis), scroll progress, reveal
 * choreography and number count-ups built on GSAP + ScrollTrigger.
 * Everything degrades to static content under prefers-reduced-motion.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion() {
  if (window.__crolaneMotion) {
    ScrollTrigger.refresh();
    return;
  }
  window.__crolaneMotion = true;

  initSmoothScroll();
  initProgress();
  initAmbient();
  initSpotlight();
  initMagnetic();
  initTilt();
  initStageZoom();
  initReveals();
  initRevealGroups();
  initParallax();
  initCounters();
  initDrawings();
  initFloaters();

  // Recalculate after fonts and images settle.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

function initSmoothScroll() {
  if (reduced()) return;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  });
  window.__lenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // In-page anchors route through Lenis for smooth jumps.
  document.addEventListener('click', (e) => {
    const anchor = e.target as HTMLElement;
    const link = anchor.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target as HTMLElement, { offset: -72 });
    history.pushState(null, '', id);
  });
}

function initProgress() {
  const bar = document.querySelector<HTMLElement>('.scroll-progress');
  if (!bar) return;
  if (reduced()) {
    bar.style.display = 'none';
    return;
  }
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      bar.style.transform = `scaleX(${self.progress})`;
    },
  });
}

function initReveals() {
  const elements = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (!elements.length) return;

  if (reduced()) {
    elements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  elements.forEach((el) => {
    const delay = parseFloat(el.dataset.revealDelay || '0');
    const type = el.dataset.reveal || '';
    gsap.fromTo(
      el,
      {
        opacity: 0,
        x: type === 'left' ? -42 : type === 'right' ? 42 : 0,
        y: type === 'fade' ? 14 : 34,
        scale: type === 'scale' ? 0.92 : 1,
        rotate: type === 'scale' ? -0.6 : 0,
        filter: 'blur(6px)',
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        filter: 'blur(0px)',
        duration: 1.1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
      }
    );
  });
}

function parseCountValue(raw: string): { target: number; decimals: number } {
  const cleaned = raw.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  const decimals = cleaned.includes('.') ? cleaned.split('.')[1].length : 0;
  return { target: isNaN(num) ? 0 : num, decimals };
}

function formatCount(value: number, decimals: number, template: string): string {
  const fixed = value.toFixed(decimals);
  const withSeparators = decimals === 0
    ? Number(fixed).toLocaleString('en-US')
    : fixed;
  if (template.includes('{v}')) return template.replace('{v}', withSeparators);
  return template.replace(/[-−]?[\d.,]+/, withSeparators);
}

function initCounters() {
  const nodes = gsap.utils.toArray<HTMLElement>('[data-count]');
  if (!nodes.length) return;

  nodes.forEach((el) => {
    const template = el.dataset.count || el.textContent || '0';
    const { target, decimals } = parseCountValue(template);

    if (reduced()) {
      el.textContent = formatCount(target, decimals, template);
      return;
    }

    const state = { v: 0 };
    el.textContent = formatCount(0, decimals, template);
    gsap.to(state, {
      v: target,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = formatCount(state.v, decimals, template);
      },
      onComplete: () => {
        el.textContent = formatCount(target, decimals, template);
      },
    });
  });
}

/** SVG paths marked with data-draw get a stroke-dash draw-in on scroll. */
function initDrawings() {
  const paths = gsap.utils.toArray<SVGPathElement>('[data-draw]');
  if (!paths.length) return;

  paths.forEach((path) => {
    const length = path.getTotalLength?.();
    if (!length) return;
    if (reduced()) return;
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: path.closest('[data-draw-trigger]') || path,
        start: 'top 85%',
        end: 'bottom 55%',
        scrub: 0.6,
      },
    });
  });
}

/**
 * Ambient scroll theme: as each top-level section crosses the middle of the
 * viewport, the fixed ambient colour fields behind the page drift to a new
 * pairing from the site palette. Same colours, evolving mood.
 */
const TONES: Array<[string, string]> = [
  ['#dfe3ff', '#f7ead6'],
  ['#f7ead6', '#d6e6fb'],
  ['#d6e6fb', '#e4dbff'],
  ['#e4dbff', '#f8dbe4'],
  ['#f8dbe4', '#d3ecdf'],
  ['#d3ecdf', '#f7ead6'],
  ['#f7ead6', '#dfe3ff'],
];

function initAmbient() {
  const main = document.querySelector('main');
  if (!main) return;
  const sections = Array.from(main.querySelectorAll<HTMLElement>(':scope > section'));
  if (!sections.length) return;

  const root = document.documentElement;
  const apply = (i: number) => {
    const [a, b] = TONES[Math.abs(i) % TONES.length];
    root.style.setProperty('--amb-a', a);
    root.style.setProperty('--amb-b', b);
  };
  apply(0);
  if (reduced()) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) apply(sections.indexOf(entry.target as HTMLElement));
      });
    },
    { rootMargin: '-38% 0px -38% 0px' }
  );
  sections.forEach((sec) => io.observe(sec));
}

/** Children of [data-reveal-group] cascade in with a stagger on scroll. */
function initRevealGroups() {
  const groups = gsap.utils.toArray<HTMLElement>('[data-reveal-group]');
  if (!groups.length || reduced()) return;

  groups.forEach((group) => {
    const kids = Array.from(group.children) as HTMLElement[];
    if (!kids.length) return;
    gsap.fromTo(
      kids,
      { opacity: 0, y: 48, rotateX: 5, transformPerspective: 900 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1.05,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 86%', once: true },
      }
    );
  });
}

/** [data-parallax] elements drift against the scroll for depth. */
function initParallax() {
  if (reduced()) return;
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax || '24');
    gsap.fromTo(
      el,
      { y: amt },
      {
        y: -amt,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.9,
        },
      }
    );
  });
}

/** Soft spotlight that trails the pointer across the whole page. */
function initFloaters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-float]').forEach((el, i) => {
    gsap.to(el, {
      y: -9,
      duration: 2.4 + (i % 3) * 0.55,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: i * 0.35,
    });
  });
}

function initSpotlight() {
  if (reduced() || !window.matchMedia('(pointer: fine)').matches) return;
  const glow = document.querySelector<HTMLElement>('.cursor-glow');
  if (!glow) return;
  glow.style.opacity = '1';
  const xTo = gsap.quickTo(glow, 'x', { duration: 0.9, ease: 'power3.out' });
  const yTo = gsap.quickTo(glow, 'y', { duration: 0.9, ease: 'power3.out' });
  window.addEventListener(
    'pointermove',
    (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    },
    { passive: true }
  );
}

/** Buttons lean gently toward the cursor and settle back on leave. */
function initMagnetic() {
  if (reduced() || !window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('.btn').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.22);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    btn.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

/** [data-tilt] surfaces tip in 3D toward the pointer. */
function initTilt() {
  if (reduced() || !window.matchMedia('(pointer: fine)').matches) return;
  gsap.utils.toArray<HTMLElement>('[data-tilt]').forEach((el) => {
    const max = parseFloat(el.dataset.tilt || '5');
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * max * 2);
      rx(-py * max * 2);
    });
    el.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });
}

/** Demo stages scale and rise as they travel into the viewport. */
function initStageZoom() {
  if (reduced()) return;
  gsap.utils.toArray<HTMLElement>('.viz-stage').forEach((el) => {
    gsap.fromTo(
      el,
      { scale: 0.93, y: 56, opacity: 0.35 },
      {
        scale: 1,
        y: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 48%', scrub: 0.7 },
      }
    );
  });
}
