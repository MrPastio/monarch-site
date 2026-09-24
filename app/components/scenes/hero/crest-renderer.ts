/**
 * The Monarch crest, rendered live. Geometry: ./crest-geometry.ts
 * (owner-approved 1:1 model of the official artwork, refined).
 *
 * Motion contract:
 * - the crest assembles once, each part arriving from where it physically
 *   comes from: the core from depth, the enamel shield onto it, the circuit
 *   trunk drawn upward from its root node, the crown lowered from above;
 * - afterwards it only answers the visitor — pointer tilt on a critically
 *   damped spring, and scroll. No idle spin, no pulsing light;
 * - the render loop sleeps whenever nothing moves.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildCrestGeometry } from "./crest-geometry";

export type CrestOptions = {
  container: HTMLElement;
  reducedMotion: boolean;
  /** Horizontal placement of the crest, in fractions of the view width. */
  anchorX: () => number;
  /** Fraction of the view height the crest occupies. */
  fill: () => number;
  /** Skip the assembly and show the finished crest. */
  assembled?: boolean;
  onReady?: () => void;
};

export type CrestHandle = {
  setProgress: (progress: number) => void;
  dispose: () => void;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A heavy object lowered into place: accelerates in, settles with a small give. */
function landing(t: number): number {
  if (t < 0.64) {
    const p = t / 0.64;
    return p * p * (3 - 2 * p) * 0.5 + p * p * 0.5;
  }
  const p = (t - 0.64) / 0.36;
  return 1 + Math.sin(p * Math.PI) * 0.028 * (1 - p);
}

function shadowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(0,0,0,0.85)");
  gradient.addColorStop(0.45, "rgba(0,0,0,0.35)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export async function mountCrest(options: CrestOptions): Promise<CrestHandle> {
  const { container, reducedMotion } = options;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.85;

  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 80);

  // Studio: warm key from the upper right, soft fill left, cool rim behind.
  const hemi = new THREE.HemisphereLight(0xf4ead8, 0x1a1712, 0);
  const key = new THREE.DirectionalLight(0xfff3e2, 0);
  key.position.set(3.4, 4.8, 5.2);
  const fill = new THREE.DirectionalLight(0xf3efe6, 0);
  fill.position.set(-4.2, 2.2, 2.8);
  const rim = new THREE.DirectionalLight(0xb7c9d6, 0);
  rim.position.set(-3.6, 1.2, -3.2);
  scene.add(hemi, key, fill, rim);
  const lightTargets = { hemi: 0.4, key: 1.6, fill: 0.6, rim: 1.5 };

  const geometry = buildCrestGeometry();

  const drawPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
  const materials = {
    enamel: new THREE.MeshPhysicalMaterial({
      color: 0xf7f4ec,
      metalness: 0.03,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
    trunk: new THREE.MeshPhysicalMaterial({
      color: 0xf7f4ec,
      metalness: 0.03,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      clippingPlanes: [drawPlane],
    }),
    crown: new THREE.MeshPhysicalMaterial({
      color: 0xe2ad3c,
      metalness: 1,
      roughness: 0.27,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.2,
    }),
    core: new THREE.MeshPhysicalMaterial({
      color: 0x0b0b0c,
      metalness: 0.35,
      roughness: 0.55,
      envMapIntensity: 0.35,
    }),
  };

  const rig = new THREE.Group(); // placement + scroll
  const tilt = new THREE.Group(); // pointer response
  const crest = new THREE.Group();
  rig.add(tilt);
  tilt.add(crest);
  scene.add(rig);

  const core = new THREE.Mesh(geometry.core, materials.core);
  const shield = new THREE.Mesh(geometry.shield, materials.enamel);
  const trunk = new THREE.Mesh(geometry.trunk, materials.trunk);
  const crown = new THREE.Mesh(geometry.crown, materials.crown);
  // Centre the crest's thickness on z = 0.
  const depthOffset = -0.12;
  const home = {
    core: new THREE.Vector3(0, 0, depthOffset),
    shield: new THREE.Vector3(0, 0, depthOffset + 0.02),
    trunk: new THREE.Vector3(0, 0, depthOffset + 0.02),
    crown: new THREE.Vector3(0, 0, depthOffset + 0.01),
  };
  core.position.copy(home.core);
  shield.position.copy(home.shield);
  trunk.position.copy(home.trunk);
  crown.position.copy(home.crown);
  crest.add(core, shield, trunk, crown);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.1),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -geometry.height / 2 - 0.12;
  rig.add(shadow);

  // ---- layout --------------------------------------------------------------
  let width = 1;
  let height = 1;
  const resize = () => {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    wake();
  };

  const halfTan = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  /** Distance at which the crest fills `fraction` of the view (height or width). */
  const fitDistance = (fraction: number) =>
    Math.max(geometry.height / fraction / (2 * halfTan()), geometry.width / 0.86 / (2 * halfTan() * camera.aspect));

  // ---- state ---------------------------------------------------------------
  const skipAssembly = reducedMotion || options.assembled === true;
  const start = performance.now() + 120;
  const assemblyMs = skipAssembly ? 0 : 2800;
  let progress = 0;
  const pointer = { x: 0, y: 0 };
  const spring = { x: 0, y: 0, vx: 0, vy: 0 };
  let running = false;
  let lastFrame = performance.now();
  let visible = true;

  function applyAssembly(t: number) {
    const light = easeOutCubic(seg(t, 0, 0.32));
    hemi.intensity = lightTargets.hemi * light;
    key.intensity = lightTargets.key * light;
    fill.intensity = lightTargets.fill * light;
    rim.intensity = lightTargets.rim * light;

    const coreIn = easeOutExpo(seg(t, 0.04, 0.4));
    core.position.set(home.core.x, home.core.y - (1 - coreIn) * 0.25, home.core.z - (1 - coreIn) * 3.4);

    const shieldIn = easeOutExpo(seg(t, 0.16, 0.54));
    shield.position.set(home.shield.x, home.shield.y, home.shield.z + (1 - shieldIn) * 2.4);
    shield.rotation.x = (1 - shieldIn) * -0.32;

    // The trunk is drawn upward from its root node by a moving clip plane.
    const draw = easeInOutCubic(seg(t, 0.46, 0.76));
    const [low, high] = geometry.trunkSpan;
    const front = lerp(low - 0.02, high + 0.02, draw);
    drawPlane.constant = draw >= 1 ? 100 : front + rig.position.y;

    const crownIn = seg(t, 0.6, 0.93);
    const drop = crownIn <= 0 ? 1 : 1 - landing(crownIn);
    crown.position.set(home.crown.x, home.crown.y + Math.max(-0.04, drop) * 2.2, home.crown.z);

    (shadow.material as THREE.MeshBasicMaterial).opacity = 0.55 * easeOutCubic(seg(t, 0.2, 0.7));
  }

  function applyLayout() {
    const p = easeInOutCubic(clamp(progress / 0.55));
    const dive = easeInOutCubic(seg(progress, 0.55, 1));
    const distance = fitDistance(options.fill());
    const viewWidth = 2 * halfTan() * distance * camera.aspect;

    rig.position.x = lerp(options.anchorX() * viewWidth, 0, p);
    rig.rotation.y = lerp(-0.3, 0, p);
    rig.rotation.x = lerp(0.03, 0, p);

    // Scroll dives the camera into the top circuit node — the core of Monarch.
    const [, top] = geometry.trunkSpan;
    const nodeY = top - 0.075;
    const d = lerp(distance, distance * 0.66, p);
    camera.position.set(0, lerp(0.05, nodeY, dive), lerp(d, 0.42, dive));
    camera.lookAt(0, lerp(0, nodeY, dive), lerp(0, 0.1, dive));
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    const t = assemblyMs === 0 ? 1 : clamp((now - start) / assemblyMs);
    applyLayout();
    applyAssembly(t);

    const omega = 6.5;
    const targetX = reducedMotion ? 0 : pointer.y * 0.09 * (1 - progress);
    const targetY = reducedMotion ? 0 : pointer.x * 0.2 * (1 - progress);
    const ax = -2 * omega * spring.vx - omega * omega * (spring.x - targetX);
    const ay = -2 * omega * spring.vy - omega * omega * (spring.y - targetY);
    spring.vx += ax * dt;
    spring.vy += ay * dt;
    spring.x += spring.vx * dt;
    spring.y += spring.vy * dt;
    tilt.rotation.x = spring.x;
    tilt.rotation.y = spring.y;

    renderer.render(scene, camera);

    const settled =
      t >= 1 &&
      Math.abs(spring.x - targetX) < 1e-4 &&
      Math.abs(spring.y - targetY) < 1e-4 &&
      Math.abs(spring.vx) < 1e-4 &&
      Math.abs(spring.vy) < 1e-4;
    if (settled || !visible) sleep();
  }

  function wake() {
    if (running || !visible) return;
    running = true;
    lastFrame = performance.now();
    renderer.setAnimationLoop(frame);
  }

  function sleep() {
    running = false;
    renderer.setAnimationLoop(null);
  }

  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    wake();
  };

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) wake();
  });
  visibility.observe(container);
  if (!reducedMotion) window.addEventListener("pointermove", onPointer, { passive: true });

  resize();
  applyLayout();
  applyAssembly(assemblyMs === 0 ? 1 : 0);
  renderer.render(scene, camera);
  options.onReady?.();
  wake();

  return {
    setProgress(value: number) {
      const next = clamp(value);
      if (Math.abs(next - progress) < 1e-5) return;
      progress = next;
      wake();
    },
    dispose() {
      sleep();
      observer.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onPointer);
      Object.values(geometry).forEach((value) => {
        if (value instanceof THREE.BufferGeometry) value.dispose();
      });
      Object.values(materials).forEach((material) => material.dispose());
      shadow.geometry.dispose();
      const shadowMaterial = shadow.material as THREE.MeshBasicMaterial;
      shadowMaterial.map?.dispose();
      shadowMaterial.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
