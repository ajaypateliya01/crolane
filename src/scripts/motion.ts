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
  initReveals();
  initCounters();
  initDrawings();

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
    gsap.to(el, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.95,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        once: true,
      },
    });
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
