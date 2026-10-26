/**
 * Hero scene: "the decision field".
 *
 * A stream of visitors flows across floating interface panes, splits at an
 * experiment gate and converges on a conversion node. Built with three.js,
 * one-shot environment lighting, capped DPR and strict pause rules so it
 * never renders while off-screen or hidden.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const FORK_T = 0.62;

type Particle = {
  t: number;
  speed: number;
  branch: 0 | 1; // 0 = variant path, 1 = drop-off path
  pause: number;
};

function v(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

function makeTube(curve: THREE.Curve<THREE.Vector3>, color: number, opacity: number) {
  const geo = new THREE.TubeGeometry(curve, 96, 0.02, 8, false);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new THREE.Mesh(geo, mat);
}

function makeSlab(index: number, accent: string): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(1.72, 1.18, 0.07);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.52,
    roughness: 0.34,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.35,
    envMapIntensity: 0.7,
  });
  const body = new THREE.Mesh(geo, mat);
  group.add(body);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0x16161b, transparent: true, opacity: 0.16 })
  );
  group.add(edges);

  // Faux interface content: text bars + one accent block per pane.
  const barGeo = new THREE.PlaneGeometry(1, 1);
  const barMat = new THREE.MeshBasicMaterial({
    color: 0x16161b,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  const bars: Array<[number, number, number, number, number]> = [
    // [x, y, w, h, opacityScale]
    [-0.28, 0.34, 0.86, 0.1, 1],
    [-0.38, 0.12, 0.66, 0.07, 0.75],
    [-0.4, -0.04, 0.62, 0.07, 0.6],
  ];
  bars.forEach(([x, y, w, h, s]) => {
    const bar = new THREE.Mesh(barGeo, barMat.clone());
    (bar.material as THREE.MeshBasicMaterial).opacity = 0.3 * s;
    bar.scale.set(w, h, 1);
    bar.position.set(x, y, 0.04);
    group.add(bar);
  });

  const cta = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.16),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: index === 3 ? 0.95 : 0.5,
      depthWrite: false,
    })
  );
  cta.position.set(-0.28, -0.32, 0.04);
  group.add(cta);

  return group;
}

export function initHeroScene(container: HTMLElement, canvas: HTMLCanvasElement) {
  if (container.dataset.ready === 'true') return;
  container.dataset.ready = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    container.dataset.webgl = 'failed';
    return;
  }

  const isMobile = window.matchMedia('(max-width: 60rem)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  const baseZ = isMobile ? 9.4 : 7.6;
  camera.position.set(0, 0.85, baseZ);
  camera.lookAt(0, 0.2, 0);

  const key = new THREE.DirectionalLight(0xfff1e0, 1.6);
  key.position.set(3.5, 5, 4);
  const fill = new THREE.DirectionalLight(0xdfe6ff, 0.7);
  fill.position.set(-4, 1.5, 3);
  const amb = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(key, fill, amb);

  const world = new THREE.Group();
  scene.add(world);

  // --- Journey panes -------------------------------------------------------
  const slabAccent = ['#c77415', '#c77415', '#3e4ef5', '#3e4ef5', '#17835b'];
  const slabPositions: Array<[number, number, number]> = [
    [-3.15, -0.42, 0.7],
    [-1.58, -0.14, 0.25],
    [0, 0.12, 0],
    [1.58, 0.36, 0.25],
    [3.15, 0.6, 0.7],
  ];
  const slabs = slabPositions.map(([x, y, z], i) => {
    const slab = makeSlab(i, slabAccent[i]);
    slab.position.set(x, y, z);
    slab.rotation.set(-0.1, (i - 2) * -0.13, 0);
    world.add(slab);
    return slab;
  });

  // --- Flow paths ----------------------------------------------------------
  const mainCurve = new THREE.CatmullRomCurve3([
    v(-4.5, -0.9, 1.35),
    v(-3.15, -0.42, 0.75),
    v(-1.58, -0.14, 0.3),
    v(0, 0.12, 0.05),
    v(1.58, 0.36, 0.3),
    v(2.35, 0.5, 0.75),
  ]);
  const variantCurve = new THREE.CatmullRomCurve3([
    v(2.35, 0.5, 0.75),
    v(3.0, 0.72, 0.85),
    v(3.65, 1.0, 0.95),
    v(4.25, 1.42, 1.05),
  ]);
  const dropCurve = new THREE.CatmullRomCurve3([
    v(2.35, 0.5, 0.75),
    v(2.95, 0.18, 1.0),
    v(3.5, -0.35, 1.25),
    v(3.9, -1.05, 1.5),
  ]);

  world.add(makeTube(mainCurve, 0x3e4ef5, 0.55));
  world.add(makeTube(variantCurve, 0x3e4ef5, 0.85));
  world.add(makeTube(dropCurve, 0xc77415, 0.5));

  // Experiment gate: a slim arch at the fork.
  const gate = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.022, 10, 48, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x16161b, roughness: 0.4, metalness: 0.2 })
  );
  gate.position.copy(v(2.35, 0.5, 0.75));
  gate.rotation.z = Math.PI;
  world.add(gate);

  // --- Conversion node -----------------------------------------------------
  const nodeGroup = new THREE.Group();
  const node = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x3e4ef5,
      roughness: 0.25,
      metalness: 0.1,
      emissive: 0x3e4ef5,
      emissiveIntensity: 0.35,
    })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.014, 10, 64),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 })
  );
  ring.rotation.x = Math.PI / 2.4;
  nodeGroup.add(node, ring);
  nodeGroup.position.copy(v(4.25, 1.42, 1.05));
  world.add(nodeGroup);

  // --- Friction markers over pane two --------------------------------------
  const markerMat = new THREE.MeshStandardMaterial({
    color: 0xc77415,
    emissive: 0xc77415,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });
  const markers = [
    v(-1.95, 0.42, 0.5),
    v(-1.35, 0.18, 0.42),
    v(-1.05, -0.2, 0.5),
  ].map((p) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), markerMat);
    m.position.copy(p);
    world.add(m);
    return m;
  });

  // --- Atmosphere: drifting dust motes --------------------------------------
  const dustGeo = new THREE.BufferGeometry();
  const DUST = isMobile ? 140 : 260;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 11;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 4 + 0.6;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0x7c8cff,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    })
  );
  world.add(dust);

  // Conversion node: halo glow + orbiting satellites -------------------------
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 128;
  const gtx = glowCanvas.getContext('2d')!;
  const grad = gtx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(124,140,255,0.9)');
  grad.addColorStop(0.4, 'rgba(124,140,255,0.35)');
  grad.addColorStop(1, 'rgba(124,140,255,0)');
  gtx.fillStyle = grad;
  gtx.fillRect(0, 0, 128, 128);
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(glowCanvas),
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    })
  );
  glow.scale.setScalar(1.9);
  nodeGroup.add(glow);

  const orbits: Array<{ pivot: THREE.Group; speed: number }> = [];
  (
    [
      [0.46, 0.9, '#c77415'],
      [0.62, -0.6, '#3e4ef5'],
    ] as Array<[number, number, string]>
  ).forEach(([r, speed, col]) => {
    const pivot = new THREE.Group();
    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.008, 8, 72),
      new THREE.MeshBasicMaterial({ color: 0x16161b, transparent: true, opacity: 0.18 })
    );
    orbitRing.rotation.x = Math.PI / 2.2;
    const sat = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 14, 14),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(col) })
    );
    sat.position.set(r, 0, 0);
    pivot.add(orbitRing, sat);
    pivot.rotation.x = 0.5;
    nodeGroup.add(pivot);
    orbits.push({ pivot, speed });
  });

  // --- Visitors ------------------------------------------------------------
  const COUNT = isMobile ? 54 : 86;
  const pGeo = new THREE.SphereGeometry(0.042, 10, 10);
  const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const points = new THREE.InstancedMesh(pGeo, pMat, COUNT);
  points.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const colorIndigo = new THREE.Color('#3e4ef5');
  const colorAmber = new THREE.Color('#c77415');
  const colorInk = new THREE.Color('#16161b');
  points.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(COUNT * 3),
    3
  );

  const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => ({
    t: (i / COUNT) * 1.15,
    speed: 0.045 + Math.random() * 0.05,
    branch: Math.random() < 0.62 ? 0 : 1,
    pause: Math.random() * 1.6,
  }));
  world.add(points);

  // --- Render loop ---------------------------------------------------------
  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();
  let width = 0;
  let height = 0;
  let running = false;
  let raf = 0;
  let elapsed = 0;
  let last = performance.now();

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollP = 0;

  function resize() {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function updateParticles(dt: number) {
    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      if (p.pause > 0) {
        p.pause -= dt;
        dummy.position.set(0, -50, 0);
        dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        points.setMatrixAt(i, dummy.matrix);
        continue;
      }
      p.t += p.speed * dt;
      if (p.t > 1.15) {
        p.t = -Math.random() * 0.35;
        p.branch = Math.random() < 0.62 ? 0 : 1;
        p.pause = Math.random() * 1.2;
      }

      let pos: THREE.Vector3;
      let scale = 1;
      if (p.t < 0) {
        pos = mainCurve.getPoint(0);
        scale = 0.001;
      } else if (p.t < FORK_T) {
        pos = mainCurve.getPoint(p.t / FORK_T);
      } else {
        const u = (p.t - FORK_T) / (1 - FORK_T);
        if (p.branch === 0) {
          pos = variantCurve.getPoint(Math.min(u, 1));
          if (u > 0.82) scale = Math.max(0.001, (1 - u) / 0.18);
        } else {
          pos = dropCurve.getPoint(Math.min(u * 1.15, 1));
          scale = Math.max(0.001, 1 - u * 0.9);
        }
      }

      dummy.position.copy(pos);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      points.setMatrixAt(i, dummy.matrix);

      if (p.t < FORK_T) tmpColor.copy(colorInk).lerp(colorIndigo, Math.min(p.t / FORK_T, 1));
      else if (p.branch === 0) tmpColor.copy(colorIndigo);
      else tmpColor.copy(colorAmber);
      points.setColorAt(i, tmpColor);
    }
    points.instanceMatrix.needsUpdate = true;
    if (points.instanceColor) points.instanceColor.needsUpdate = true;
  }

  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;

    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    world.rotation.y = pointer.x * 0.16;
    world.rotation.x = pointer.y * 0.1;
    world.position.y = -scrollP * 0.5;
    camera.position.z = baseZ - scrollP * 0.55;
    camera.lookAt(0, 0.2 + scrollP * 0.1, 0);

    ring.rotation.z += dt * 0.6;
    dust.rotation.y += dt * 0.02;
    dust.position.y = Math.sin(elapsed * 0.3) * 0.08;
    orbits.forEach((o) => {
      o.pivot.rotation.y += dt * o.speed;
      o.pivot.rotation.x += dt * o.speed * 0.35;
    });
    camera.position.x = pointer.x * 0.3 + Math.sin(elapsed * 0.35) * 0.07;
    const pulse = 1 + Math.sin(elapsed * 2.2) * 0.06;
    nodeGroup.scale.setScalar(pulse);
    markers.forEach((m, i) => {
      const s = 1 + Math.sin(elapsed * 3 + i * 1.7) * 0.35;
      m.scale.setScalar(s);
    });
    slabs.forEach((s, i) => {
      s.position.y = slabPositions[i][1] + Math.sin(elapsed * 0.7 + i * 1.25) * 0.05;
      s.rotation.z = Math.sin(elapsed * 0.5 + i * 1.1) * 0.035;
      s.rotation.y = (i - 2) * -0.13 + Math.sin(elapsed * 0.35 + i) * 0.05;
    });

    updateParticles(dt);
    renderer.render(scene, camera);
  }

  function renderOnce() {
    updateParticles(0.016);
    renderer.render(scene, camera);
  }

  // Pointer response (fine pointers only).
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerleave', () => {
      pointer.tx = 0;
      pointer.ty = 0;
    });
  }

  const onScroll = () => {
    const rect = container.getBoundingClientRect();
    scrollP = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (visible && !reduced) {
        if (!running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      } else {
        running = false;
        cancelAnimationFrame(raf);
      }
    },
    { rootMargin: '80px' }
  );
  io.observe(canvas);

  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!reduced) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  const ro = new ResizeObserver(() => {
    resize();
    if (reduced) renderOnce();
  });
  ro.observe(container);

  resize();
  if (reduced) {
    renderOnce();
  } else {
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  // Teardown for full page navigations / bfcache.
  window.addEventListener(
    'pagehide',
    () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
    { once: true }
  );
}
