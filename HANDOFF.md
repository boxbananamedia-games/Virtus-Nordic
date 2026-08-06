# Handoff — floating application worlds

Branch `claude/floating-apps-showcase-qt56cx`. Nothing pushed; no PR.
Written 2026-07-29 when the working session ran out of context, revised the
same day after Alex's second review.

## Open bugs

None known. The three listed in the first revision of this file were all one
thing: the hero rendered its pre-hydration state for about a second on a cold
load, and both screenshots caught it. The copy was not missing and the CSS
field was not rendering alongside the orbit — the shot was taken before the
`.enter` animations and the `canRunOrbit()` verdict had run. Both are now
resolved ahead of first paint; see "Hero, second pass" below.

## Hero, second pass

- **Dusk theme lands pre-paint.** An inline script in `__root.tsx` sets
  `data-hero-theme` on `<html>` for `/` before the body is parsed. The route
  effect still runs, for client-side navigation.
- **The CSS fallback field no longer flashes.** `data-orbit` is a three-state
  (`pending` | `true` | `false`) resolved in a layout effect, and
  `.js .vn-hero-devices[data-orbit="pending"] .vn-app-field` is hidden. The
  `.js` guard is load-bearing: with JavaScript off the class is never added,
  so the field stays visible. The matrix is verified in all four states.
- **Devices are 43% larger** (front of the orbit: 0.45vh, was 0.315vh) and the
  hero runs to `114svh` with a matching `padding-bottom`, so nothing is sliced
  off by its own bottom edge. `justify-content: flex-start` plus a `15svh`
  top pad replaced the `-7vh` translate, which put the copy in a different
  place at every viewport height.
- **The hero gradient now lands exactly on `var(--color-cream)`** before 100%,
  and the warm pool is contained well inside. The ruled line where the hero
  met the next section is gone by construction, not by eye.
- **Hover stages a device.** It leaves the ring, turns a full revolution and
  squares up to the camera at `STAGE`; releasing returns it to the position its
  own lap has meanwhile reached. The ring never pauses.
- **Release is immediate, and the berth is why it can be.** A staged device
  carries its control to centre stage, out from under the pointer — release it
  on that and the device comes home, lands under the pointer, and oscillates.
  So each device also owns a `.vn-orbit-berth`: an invisible span pinned to the
  slot it left, live only while it is away, ranked below every control. Hover
  is held by the device OR its berth and by nothing else, so stepping off both
  releases at once. A first attempt widened the catchment to the whole hero
  instead; that stopped the oscillation but left devices stuck out until the
  pointer left the hero entirely, which is what Alex reported. The berth also
  keeps orbiting, so a resting pointer falls out of it and releases on its own.
- **The nav is cream on the homepage,** not white.
- **Applications moved to `/applikationer`,** with `?app=<id>` for the hero
  hand-off. It is a route now, so the nav's hash-scroll machinery is gone.

Framing numbers in `HeroOrbit.tsx` are derived against a `114svh` hero — if
that changes, re-derive `cameraZ` / `centreY` / `STAGE` rather than nudging.

## One pigment per page

`src/lib/accent.ts` is the single source of truth: a five-entry table mapping
route to a four-stop pigment ramp. It feeds both the SVG filters and the
`--vn-accent` custom property, so there is no colour defined twice.

- **The wash is recoloured, not hue-rotated.** `InkFilters` reads the scan's
  density off its luminance and maps it onto the ramp with a four-stop
  `feComponentTransfer`. Two stops would have been a plain duotone and would
  have desaturated the midtones to grey — and the midtones *are* the wash: 90%
  of the scan sits above luminance 0.9 and its character lives in the 0.6–0.9
  band. Measured chroma there is 41–81 per accent, against 8–26 at the pale
  tail. `color-interpolation-filters="sRGB"` is load-bearing; filters default
  to linearRGB and the ramp lands several shades off without it.
- **Shape variation is applied, not drawn.** `INK_VARIANTS` pairs a seeded
  `feTurbulence`/`feDisplacementMap` with a varied radial mask and transform.
  The mask does most of the visible work; the displacement is the organic
  layer. Four gestures, spread across the call sites so no page repeats one.
- **The accent owns the page, not just the stroke** — eyebrows, focus rings,
  filled-button hover, selection, and the `.vn-app-*` chrome all read
  `var(--vn-accent)`. A recoloured divider on an otherwise teal page reads as a
  colour picker; a coloured page reads as identity.
- **The nav is deliberately excluded.** It keeps the `:root` teal. Holding the
  persistent chrome still is what makes the shift between pages legible.
- **The homepage renders the original scan untouched** — teal ships zero filter
  defs and sets no custom properties on the stroke. Verified.
- Applied from the route during render, so the pigment is in the server HTML
  and never repaints a beat late. All five clear 4.5:1 on cream (4.93–7.46).
- The divider under the hero devices is gone: the hero resolves into the page
  background now, and a stroke across that join reinstates the very rule the
  gradient work removed.

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
- **Caveat on the second pass:** the review environment could not composite
  frames, so `requestAnimationFrame` never fired and the orbit could not be
  watched. Layout, routing, the fallback matrix and hit-testing were verified
  live in the DOM; the camera framing was verified by replaying the projection
  arithmetic at 1280×800, 1440×900, 2000×1000 and 2560×1080. The hover
  choreography itself has not been seen running.
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
