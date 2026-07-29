# Handoff — floating application worlds

Branch `claude/floating-apps-showcase-qt56cx`. Nothing pushed; no PR.
Written 2026-07-29 when the working session ran out of context.

## Open bugs, highest priority first

Seen in Alex's own browser at roughly 2:1 aspect (ultrawide, short). All three
were missed because every automated check ran at 1440×900 — **reproduce at
~2560×1080 before trusting any fix.**

1. **Hero copy is invisible.** Headline, tagline and both CTAs do not render on
   the dusk hero. They are present and correct at 1440×900, so this is
   viewport- or animation-dependent, not a missing element. First suspects: the
   `.enter` entrance animation leaving `opacity: 0`, or the `-7vh`
   `.vn-hero-copy` lift interacting badly with a short viewport. Verify by
   reading computed opacity/transform on `.vn-hero-copy` children, not by eye.

2. **Both device systems appear to render at once.** The CSS field's hint text
   ("Peg på en telefon…") is visible, and it lives *inside* `.vn-app-field` —
   so `.vn-hero-devices[data-orbit="true"] .vn-app-field { display: none }` is
   not taking effect. Yet 3D models with Apple logos and camera bumps are also
   on screen, which only the orbit can produce. Read `data-orbit` and the
   field's computed `display` directly; do not infer from the render.

3. **Ultrawide composition is wrong.** `fov` is vertical, so horizontal spread
   scales with aspect: at 2:1 the devices fling to the far edges and leave a
   dead centre. The orbit needs an aspect-aware radius or fov, and devices also
   appear to spill past the hero into the intro section.

## What is done and verified

- **Orbit is live in the homepage hero** (`987ad4c`). Interaction contract is
  real: five DOM buttons over the canvas, tracked per frame to each device's
  projected screen position. Accessible names, keyboard focus, Enter-to-select,
  reduced-motion static fallback, mobile rail, hero CTAs reachable through the
  overlay — all verified at 1440×900. 3.3 ms median frame, zero long frames.
- **Device models ship as Meshy delivered them** (`9c95059`), materials
  untouched. See "Hard-won facts" — this was reverted from an optimisation that
  corrupted them.
- **Dusk look is the default.** Page gradient plus matching 3D rig.
- **iOS foundation kit** exists (`components/vn/apps/ios`) and Guf & Kugler is
  rebuilt on it. The other four screens still use the old `screens/parts.tsx`.
- **Disclaimer reworded** (`eca6d93`): permission granted, no ongoing
  engagement, both languages.

## Blocked on Alex

- **Screens (the biggest remaining piece).** Needs logos, brand assets and
  sketches, plus Higgsfield access for generated imagery. Fifteen screens
  planned: hero + two supporting per concept.
- **Device models.** Alex is trying other AI 3D generators. Any replacement
  drops into `art-source/optimise-all.mjs` → `public/lab-models/opt/`; the hero
  is model-agnostic.

## Hard-won facts — do not rediscover these

- **Never split the device GLBs into shared geometry + loose textures.** It
  renders camera lenses in body colour. Proven by A/B: identical bytes are
  correct embedded via GLTFLoader, wrong as loose files through TextureLoader.
  `build-shared.mjs` was deleted so the layout cannot be regenerated. The lens
  test is the regression gate for any future size optimisation.
- **Do not override `metalness` or `roughness` on these models.** Both are
  multipliers against the maps, not absolutes. `roughness = 0.42` drove silver
  to ~0.05 (a mirror, which rendered black); `metalness = 0.3` turned saturated
  finishes into flat plastic. The maps as authored are correct.
- **`<Environment>` needs `frames={1}`.** Without it drei re-renders all six
  cubemap faces every frame: 12.1 ms/frame versus 3.3 ms.
- **An env map cannot put a gradient across a flat surface** — one normal means
  one uniform value. Only lights with distance falloff can do bright-below.
- **Metal has no diffuse term.** A sparse environment therefore renders it
  black. The enclosing dome in `device/Studio.tsx` is load-bearing.
- **`<Environment>` suspends** while an `.hdr` decodes and must sit inside a
  Suspense boundary or the whole route goes white.
- Loose textures need `flipY = false` to match glTF, and materials must be
  **cloned per device** or the last finish mounted wins for all five.

## Tooling

`art-source/` holds the asset pipeline (not served): `optimise-all.mjs` raw →
shipped GLBs, `eval-prep.mjs` to inspect new candidate models, `bake.mjs` for
screen plates, `img-resize.mjs` (Chrome-backed; sharp will not load on this
machine and jpeg-js cannot decode 8K).

`/lab/orbit` is the prototype bench, URL-addressable:
`?solo=<finish>&yaw=&env=studio-hdr|room-hdr|room|dusk|day&bloom=&bg=dark` for
material questions, `?branch=b&bare=1&freeze=<deg>` for orbit captures.
Delete the route, `components/vn/apps/lab/`, `styles/orbit-lab.css` and the
HDRIs before production.

## Reversibility

Hero: drop `HeroDevices` for a plain `<PhoneField>` and remove the
`data-hero-theme` effect in `routes/index.tsx`. Dusk in the lab: `?theme=day`.
Otherwise each commit above is a clean `git revert` target.

## Known debt

- `public/lab-textures/` is 4.7 MB of PNG screen plates; fold WebP conversion
  into `bake.mjs` when the screens are rebuilt rather than converting throwaways.
- `public/lab-models/hdri/` is 3 MB serving only the lab bench.
- `npm` is being used against a `bun.lock` repo; `package-lock.json` is
  gitignored. Install with `--legacy-peer-deps`.
- `packages/quanta` has one pre-existing `tsc` error from duplicate
  `@types/react` under npm hoisting. The bar is **zero errors in `src/`**.
