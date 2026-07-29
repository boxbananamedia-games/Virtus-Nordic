import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { findApplication } from "../../lib/applications";
import { OrbitCss, type OrbitKnobs } from "../../components/vn/apps/lab/OrbitCss";
import { OrbitGl } from "../../components/vn/apps/lab/OrbitGl";
import { ModelInspect } from "../../components/vn/apps/lab/ModelInspect";
import { SoloDevice, type SoloEnv } from "../../components/vn/apps/lab/SoloDevice";
import type { Finish } from "../../components/vn/apps/lab/PhoneModel";
import "../../styles/orbit-lab.css";

/**
 * PROTOTYPE ROUTE — Phase 0 orbit bake-off. Not linked from anywhere, not
 * indexed, deleted once the 3D-vs-CSS call is made.
 *
 * Both branches render the same five concepts at the same size on the same
 * path, with one set of knobs driving both, so the comparison is like for like.
 */
/** Search params exist so the capture harness can drive the lab reproducibly:
 *  `?freeze=120&bare=1` is the same image on every run. */
type Search = {
  freeze?: number;
  bare?: boolean;
  /** "a" = CSS 3D, "b" = WebGL. Both render the same concepts on the same path
   *  under the same knobs, so the captures are like for like. */
  branch?: string;
  radius?: number;
  tilt?: number;
  persp?: number;
  /** Render one concept's screen alone at native 390x844, nothing else on the
   *  page. The harness screenshots this to bake Branch B's screen textures. */
  screen?: string;
  /** Model inspection view: render the GLB alone at a given yaw. */
  yaw?: number;
  flattenZ?: number;
  /** Which candidate GLB to inspect, by filename stem under /lab-models/eval. */
  model?: string;
  speed?: number;
  rise?: number;
  dwell?: number;
  screenW?: number;
  screenH?: number;
  screenY?: number;
  showScreen?: number;
  /** "dusk" swaps page background and studio rig to the bottom-lit look. */
  theme?: string;
  /** Solo material-inspection view: one finish at one angle. */
  solo?: string;
  metal?: number;
  rawTex?: number;
  /** Matrix knobs for the solo bench: environment, post chain, texture set. */
  env?: string;
  bloom?: number;
  tone?: string;
  texset?: string;
  envi?: number;
  /** "dark" puts the bench on a neutral dark ground like the Meshy viewer, so
   *  comparisons against the reference screenshots are like for like. */
  bg?: string;
};

const num = (v: unknown) => (v === undefined || v === "" ? undefined : Number(v));

export const Route = createFileRoute("/lab/orbit")({
  head: () => ({ meta: [{ title: "Orbit bake-off" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (raw: Record<string, unknown>): Search => ({
    freeze: num(raw.freeze),
    // The router's search parser coerces "1" to the number 1, so accept both.
    bare: raw.bare === "1" || raw.bare === 1 || raw.bare === true,
    radius: num(raw.radius),
    tilt: num(raw.tilt),
    persp: num(raw.persp),
    screen: raw.screen === undefined ? undefined : String(raw.screen),
    branch: raw.branch === undefined ? "a" : String(raw.branch),
    yaw: num(raw.yaw),
    flattenZ: num(raw.flattenZ),
    model: raw.model === undefined ? undefined : String(raw.model),
    speed: num(raw.speed),
    rise: num(raw.rise),
    dwell: num(raw.dwell),
    screenW: num(raw.screenW),
    screenH: num(raw.screenH),
    screenY: num(raw.screenY),
    showScreen: num(raw.showScreen),
    // Dusk is the default look per Alex (2026-07-29). Reversible: pass
    // ?theme=day, or change this one fallback string.
    theme: raw.theme === undefined ? "dusk" : String(raw.theme),
    solo: raw.solo === undefined ? undefined : String(raw.solo),
    metal: num(raw.metal),
    rawTex: num(raw.rawTex),
    env: raw.env === undefined ? undefined : String(raw.env),
    bloom: num(raw.bloom),
    tone: raw.tone === undefined ? undefined : String(raw.tone),
    texset: raw.texset === undefined ? undefined : String(raw.texset),
    envi: num(raw.envi),
    bg: raw.bg === undefined ? undefined : String(raw.bg),
  }),
  component: OrbitLab,
});

const DEFAULTS: OrbitKnobs = {
  speed: 8,
  radius: 600,
  tilt: -14,
  persp: 1900,
  face: 0.82,
  rise: 0.34,
  dwell: 0.82,
  size: 190,
  dof: true,
  dofPx: 2.2,
  veil: false,
};

function OrbitLab() {
  const search = Route.useSearch();
  const [knobs, setKnobs] = useState<OrbitKnobs>({
    ...DEFAULTS,
    ...(search.radius !== undefined ? { radius: search.radius } : {}),
    ...(search.tilt !== undefined ? { tilt: search.tilt } : {}),
    ...(search.persp !== undefined ? { persp: search.persp } : {}),
    ...(search.speed !== undefined ? { speed: search.speed } : {}),
    ...(search.rise !== undefined ? { rise: search.rise } : {}),
    ...(search.dwell !== undefined ? { dwell: search.dwell } : {}),
  });
  // The fixed site nav lives outside this component, so the theme has to be
  // reflected on <html> for CSS to reach it. Cleaned up on unmount so the rest
  // of the site never sees it.
  useEffect(() => {
    if (search.theme) document.documentElement.setAttribute("data-lab-theme", search.theme);
    return () => document.documentElement.removeAttribute("data-lab-theme");
  }, [search.theme]);

  const [fps, setFps] = useState(0);
  const [support, setSupport] = useState<string>("checking");

  // cos() in CSS is what lets depth be a live function of angle instead of a
  // baked keyframe. If it is missing the whole branch is unviable, so the lab
  // reports it rather than silently degrading.
  useEffect(() => {
    setSupport(
      CSS.supports("width", "calc(cos(45deg) * 1px)") ? "cos() supported" : "cos() UNSUPPORTED",
    );
  }, []);

  // Frame counter fed by the orbit's own rAF: measures the loop that is actually
  // driving the scene, not a second one racing alongside it.
  const countRef = useRef(0);
  const onFrame = useCallback(() => {
    countRef.current += 1;
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      setFps(countRef.current);
      countRef.current = 0;
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const set = <K extends keyof OrbitKnobs>(key: K, value: OrbitKnobs[K]) =>
    setKnobs((k) => ({ ...k, [key]: value }));

  // Texture-baking view: one screen, native size, no chrome, no scaling — so
  // what the harness captures is exactly the 390x844 stage the screens are
  // authored on, at whatever deviceScaleFactor it runs with.
  if (search.screen) {
    const app = findApplication(search.screen);
    return (
      <div
        id="ol-screen-plate"
        style={{
          // Pinned above the site's fixed nav, which otherwise bakes its logo
          // and language switcher straight into the top of every texture.
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 99999,
          width: 390,
          height: 844,
          overflow: "hidden",
          // The --app-* theme normally rides on the phone chassis; with no
          // chassis here it has to be applied directly or the screen is unthemed.
          ...app.theme,
        }}
      >
        <app.Screen />
      </div>
    );
  }

  if (search.solo) {
    return (
      <main
        className="ol-lab"
        data-bare="true"
        style={search.bg === "dark" ? { background: "#232326" } : undefined}
      >
        <SoloDevice
          finish={search.solo as Finish}
          yaw={search.yaw ?? 0}
          envIntensity={search.envi}
          env={(search.env as SoloEnv) ?? "day"}
          bloom={search.bloom ?? 0}
          tone={search.tone === "agx" ? "agx" : "aces"}
        />
      </main>
    );
  }

  const isB = search.branch === "b";

  // Model inspection: one raw candidate export alone, no orbit. Requires an
  // explicit ?model= — the eval assets are generated on demand by
  // harness/eval-prep.mjs and are not kept in public/ between analyses.
  if (search.branch === "m" && search.model) {
    return (
      <main className="ol-lab" data-bare="true">
        <ModelInspect
          url={`/lab-models/eval/${search.model}.glb`}
          yaw={search.yaw ?? 0}
          flattenZ={search.flattenZ ?? 1}
          screenW={search.screenW ?? 0.9}
          screenH={search.screenH ?? 0.94}
          screenY={search.screenY ?? 0}
          showScreen={search.showScreen !== 0}
        />
      </main>
    );
  }

  if (search.bare) {
    return (
      <main className="ol-lab" data-bare="true" data-theme={search.theme}>
        {isB ? (
          <OrbitGl
            knobs={knobs}
            freeze={search.freeze}
            lighting={search.theme === "dusk" ? "dusk" : "day"}
          />
        ) : (
          <OrbitCss knobs={knobs} freeze={search.freeze} />
        )}
      </main>
    );
  }

  return (
    <main className="ol-lab" data-theme={search.theme}>
      <div className="ol-panel">
        <strong>Branch A · CSS 3D</strong>
        <Range label="speed" v={knobs.speed} min={0} max={40} step={1} on={(v) => set("speed", v)} />
        <Range
          label="radius"
          v={knobs.radius}
          min={200}
          max={700}
          step={10}
          on={(v) => set("radius", v)}
        />
        <Range label="tilt" v={knobs.tilt} min={-45} max={15} step={1} on={(v) => set("tilt", v)} />
        <Range
          label="persp"
          v={knobs.persp}
          min={600}
          max={3000}
          step={50}
          on={(v) => set("persp", v)}
        />
        <Range
          label="face"
          v={knobs.face}
          min={0}
          max={1}
          step={0.02}
          on={(v) => set("face", v)}
        />
        <Range label="rise" v={knobs.rise} min={0} max={0.8} step={0.02} on={(v) => set("rise", v)} />
        <Range
          label="dwell"
          v={knobs.dwell}
          min={0}
          max={0.95}
          step={0.05}
          on={(v) => set("dwell", v)}
        />
        <Range label="size" v={knobs.size} min={120} max={300} step={5} on={(v) => set("size", v)} />
        <label>
          <input
            type="checkbox"
            checked={knobs.dof}
            onChange={(e) => set("dof", e.target.checked)}
          />
          blur
        </label>
        <Range
          label="px"
          v={knobs.dofPx}
          min={0}
          max={6}
          step={0.2}
          on={(v) => set("dofPx", v)}
        />
        <label>
          <input
            type="checkbox"
            checked={knobs.veil}
            onChange={(e) => set("veil", e.target.checked)}
          />
          veil
        </label>
        <span className="ol-fps">
          {fps} fps · {support}
        </span>
      </div>

      <div className="ol-branch">
        <h2>
          {isB
            ? "Branch B — WebGL orbit, baked screen textures"
            : "Branch A — CSS 3D orbit, live DOM screens"}
        </h2>
        {isB ? (
          <OrbitGl
            knobs={knobs}
            onFrame={onFrame}
            freeze={search.freeze}
            lighting={search.theme === "dusk" ? "dusk" : "day"}
          />
        ) : (
          <OrbitCss knobs={knobs} onFrame={onFrame} freeze={search.freeze} />
        )}
      </div>
    </main>
  );
}

function Range({
  label,
  v,
  min,
  max,
  step,
  on,
}: {
  label: string;
  v: number;
  min: number;
  max: number;
  step: number;
  on: (v: number) => void;
}) {
  return (
    <label>
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => on(Number(e.target.value))}
      />
      <output>{v}</output>
    </label>
  );
}
