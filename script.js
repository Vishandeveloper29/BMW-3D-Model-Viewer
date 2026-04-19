/*
══════════════════════════════════════════════════
  BMW 3D Viewer — fully fixed
  Fixes applied:
  1. Correct GLB filename: 'Untitled.glb'
  2. type="module" on script tag (in index.html)
  3. model.rotation.set(0,0,0) — no more tilt
  4. Model seated flush on ground (box3.min.y offset)
  5. HDR environment map — realistic PBR materials
  6. camera target set to car vertical centre
══════════════════════════════════════════════════
*/

import * as three        from 'three';
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader }   from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader }    from 'three/addons/loaders/RGBELoader.js';

/* ── 1. DOM refs ── */
const canvas      = document.getElementById('main-canvas');
const viewport    = document.getElementById('viewport');
const loader      = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const loaderPct   = document.getElementById('loader-pct');
const rotateBtn   = document.getElementById('rotate-btn');

/* ── 2. Renderer ── */
const renderer = new three.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
renderer.outputColorSpace    = three.SRGBColorSpace;
renderer.toneMapping         = three.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled   = true;
renderer.shadowMap.type      = three.PCFSoftShadowMap;
renderer.setClearColor(0x08090d, 1);

/* ── 3. Scene + fog ── */
const scene = new three.Scene();
scene.fog = new three.FogExp2(0x08090d, 0.022);

/* ── 4. Camera ── */
const camera = new three.PerspectiveCamera(
  45,
  viewport.clientWidth / viewport.clientHeight,
  0.01,
  500
);
camera.position.set(6, 3, 10);

/* ── 5. Orbit controls ── */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping   = true;
controls.dampingFactor   = 0.05;
controls.autoRotate      = true;
controls.autoRotateSpeed = 1.2;
controls.minDistance     = 1;
controls.maxDistance     = 40;
controls.maxPolarAngle   = Math.PI / 1.9;

/* ── 6. HDR environment map (FIX: removes flat/washed-out look) ── */
const rgbeloader = new RGBELoader();
rgbeloader.load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr',
  (hdr) => {
    hdr.mapping       = three.EquirectangularReflectionMapping;
    scene.environment = hdr; // powers all PBR metalness + roughness
    // scene.background intentionally NOT set — keep dark bg
  }
);

/* ── 7. Lighting rig ── */
const ambientlight = new three.AmbientLight(0xfff4e0, 0.5);
scene.add(ambientlight);

const keylight = new three.DirectionalLight(0xffeedd, 3);
keylight.position.set(8, 16, 10);
keylight.castShadow           = true;
keylight.shadow.mapSize.set(2048, 2048);
keylight.shadow.camera.near   = 0.1;
keylight.shadow.camera.far    = 80;
keylight.shadow.camera.left   = -20;
keylight.shadow.camera.right  = 20;
keylight.shadow.camera.top    = 20;
keylight.shadow.camera.bottom = -20;
keylight.shadow.bias          = -0.001;
scene.add(keylight);

const filllight = new three.DirectionalLight(0x7090c0, 0.6);
filllight.position.set(-12, 4, -8);
scene.add(filllight);

const rimlight = new three.DirectionalLight(0xc8a96e, 1.2);
rimlight.position.set(0, 3, -18);
scene.add(rimlight);

const underlight = new three.DirectionalLight(0x2040a0, 0.3);
underlight.position.set(0, -6, 0);
scene.add(underlight);

/* ── 8. Ground plane (shadow receiver) ── */
const groundgeo = new three.PlaneGeometry(200, 200);
const groundmat = new three.MeshStandardMaterial({
  color: 0x0a0b10, roughness: 0.85, metalness: 0.15
});
const ground = new three.Mesh(groundgeo, groundmat);
ground.rotation.x    = -Math.PI / 2;
ground.position.y    = 0;
ground.receiveShadow = true;
scene.add(ground);

/* ── 9. DRACO + GLTF loaders ── */
const draco = new DRACOLoader();
draco.setDecoderPath(
  'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/libs/draco/'
);
const gltfloader = new GLTFLoader();
gltfloader.setDRACOLoader(draco);

/* ── 10. Load GLB ── */
gltfloader.load(
  'Untitled.glb',                         // FIX #1: was 'city.glb'

  (gltf) => {
    const model = gltf.scene;

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true;
        child.receiveShadow = true;
      }
    });

    // FIX #2: zero out any baked rotation from the GLB (causes the tilt)
    model.rotation.set(0, 0, 0);

    // scale to 8 world units
    const box1   = new three.Box3().setFromObject(model);
    const size   = box1.getSize(new three.Vector3());
    const maxdim = Math.max(size.x, size.y, size.z);
    const scale  = 8 / maxdim;
    model.scale.setScalar(scale);

    // center horizontally on XZ after scale
    const box2   = new three.Box3().setFromObject(model);
    const center = box2.getCenter(new three.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;

    // FIX #3: drop model so its lowest point sits exactly at y=0
    const box3 = new three.Box3().setFromObject(model);
    model.position.y -= box3.min.y;

    scene.add(model);

    // frame camera to fit model
    const fov     = camera.fov * (Math.PI / 180);
    const fitdist = (maxdim * scale * 0.5) / Math.tan(fov / 2);
    camera.position.set(fitdist * 0.7, fitdist * 0.35, fitdist * 0.9);

    // look at the vertical centre of the car, not the floor
    const carHeight = box3.max.y - box3.min.y;
    controls.target.set(0, carHeight * 0.5, 0);
    controls.update();

    loader.classList.add('hide');
  },

  (xhr) => {
    if (xhr.total) {
      const pct = Math.round(xhr.loaded / xhr.total * 100);
      progressBar.style.width = pct + '%';
      loaderPct.textContent   = pct + '%';
    }
  },

  (err) => {
    console.error('GLB load failed:', err);
    loaderPct.textContent = 'Failed to load';
  }
);

/* ── 11. Toggle auto-rotate ── */
let autorotate = true;
rotateBtn.addEventListener('click', () => {
  autorotate = !autorotate;
  controls.autoRotate   = autorotate;
  rotateBtn.textContent = autorotate ? 'Auto Rotate ON' : 'Auto Rotate OFF';
  rotateBtn.classList.toggle('active', autorotate);
});

/* ── 12. Responsive resize ── */
window.addEventListener('resize', () => {
  const w = viewport.clientWidth;
  const h = viewport.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

/* ── 13. Render loop ── */
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});