/// <reference types="astro/client" />

import type Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
    __crolaneMotion?: boolean;
  }
}

export {};
