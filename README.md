# BMW — 3D Model Viewer

A sleek, browser-based 3D viewer for GLB/GLTF models built with Three.js. Features a dark automotive aesthetic with gold accents, physically-based rendering, and smooth orbit controls.

---

## Preview

> Dark-themed viewer with HDR lighting, ACES filmic tone mapping, and auto-rotating model display.

---

## Features

- **GLB model loading** with Draco compression support
- **HDR environment map** for realistic PBR metalness and reflections
- **ACES Filmic tone mapping** for cinematic color grading
- **Auto-rotate** toggle with damped orbit controls
- **Shadow casting** with a PCF soft shadow map
- **Cinematic lighting rig** — key, fill, rim, and under lights
- **Animated progress loader** with percentage display
- **Fully responsive** — resizes with the browser window
- **Fog** for depth atmosphere

---

## File Structure

```
├── index.html      # App shell, import map, UI elements
├── script.js       # Three.js scene, loader, controls, render loop
├── style.css       # Dark UI theme with CSS variables
└── Untitled.glb    # 3D model asset
```

---

## Getting Started

Because the app loads a local `.glb` file, it must be served over HTTP — opening `index.html` directly via `file://` will fail due to browser CORS restrictions.

### Option 1 — VS Code Live Server

Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html`, and choose **Open with Live Server**.

### Option 2 — Python

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

### Option 3 — Node.js

```bash
npx serve .
```

---

## Controls

| Input | Action |
|---|---|
| Left drag | Rotate |
| Scroll wheel | Zoom in / out |
| Right drag | Pan |
| **Auto Rotate** button | Toggle auto-spin |

---

## Dependencies (CDN — no install required)

| Library | Version | Purpose |
|---|---|---|
| [Three.js](https://threejs.org/) | 0.160.1 | 3D rendering engine |
| GLTFLoader | bundled | Load `.glb` / `.gltf` files |
| DRACOLoader | bundled | Decompress Draco-compressed meshes |
| RGBELoader | bundled | Load `.hdr` environment maps |
| OrbitControls | bundled | Mouse / touch camera controls |
| [Poly Haven HDR](https://polyhaven.com/) | — | Studio HDR environment map |
| Bebas Neue / DM Mono | Google Fonts | UI typography |

All Three.js modules are loaded via an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) pointing to jsDelivr — no build step or `npm install` needed.

---

## Swapping the Model

Replace `Untitled.glb` with any GLB file of your choice, then update the filename in `script.js`:

```js
gltfloader.load(
  'YourModel.glb',   // ← change this
  ...
)
```

The viewer auto-scales the model to fit the scene and seats it flush on the ground plane regardless of the original model dimensions.

---

## Customisation

All UI colors are defined as CSS variables in `style.css`:

```css
:root {
  --bg: #08090d;       /* page background */
  --gold: #c8a96e;     /* accent color */
  --text: #d4cfc6;     /* body text */
  --muted: #4a4740;    /* secondary text / hints */
}
```

Lighting intensity and camera distance can be tweaked in `script.js` within the lighting rig section (step 7) and the post-load camera framing block (step 10).

---

## Browser Support

Requires a browser with **WebGL 2** and **ES Modules** support. All modern browsers (Chrome, Firefox, Edge, Safari 15.4+) qualify.
