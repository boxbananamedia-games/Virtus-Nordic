import type { CSSProperties } from "react";
import { HomeBar, StatusBar, TabBar } from "./parts";

/**
 * Aalborg Fysioterapi — Treatment and client progress.
 *
 * Warm ivory, pale blue and natural green, with a larger and calmer type scale
 * than the other four screens: this is the one an 80-year-old holds. Gentle
 * human movement, soft progress graphics.
 *
 * Deliberately non-clinical: the plan is set by the therapist, the numbers are
 * the client's own check-ins. No diagnosis, no medical claims, no automatic
 * assessment (.fy-* in src/styles/applications.css).
 */

const PROGRAM = [
  { name: "Skulderrotation", dose: "2 × 12", done: true },
  { name: "Skulderblad-glid", dose: "3 × 10", done: true },
  { name: "Væg-glid", dose: "2 × 15", done: true },
  { name: "Udfald med støtte", dose: "3 × 8", done: false },
];

export function FysioterapiScreen() {
  return (
    <div className="vn-scr fy">
      <StatusBar />

      <header className="fy-head">
        <p className="fy-brand">Aalborg Fysioterapi</p>
        <h3 className="fy-h1">Dagens program</h3>
        <p className="fy-sub">3 af 4 øvelser gennemført</p>
      </header>

      <div className="fy-stack">
        <section className="fy-panel fy-panel--1">
          <ul className="fy-list">
            {PROGRAM.map((ex, i) => (
              <li key={ex.name} data-done={ex.done} style={{ "--i": i } as CSSProperties}>
                <span className="fy-check" />
                <span className="fy-ex">
                  <b>{ex.name}</b>
                  <i>{ex.dose}</i>
                </span>
              </li>
            ))}
          </ul>
          <div className="fy-week">
            <span className="fy-label">Denne uge</span>
            <div className="fy-days">
              {["M", "T", "O", "T", "F", "L", "S"].map((day, i) => (
                <span
                  key={i}
                  data-done={i < 4 ? "true" : "false"}
                  data-today={i === 4 ? "true" : "false"}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div className="fy-next">
            <span className="fy-label">Næste tid</span>
            <p className="fy-next-when">Mandag 18. august · 10:00</p>
            <p className="fy-next-sub">Holdtræning · Sal 2</p>
          </div>
        </section>

        <section className="fy-panel fy-panel--2">
          <p className="fy-title">Udfald med støtte · 3 × 8</p>
          <div className="fy-player">
            <svg viewBox="0 0 200 150" className="fy-figure" aria-hidden="true">
              {/* Abstract, gentle human movement. Original line drawing. */}
              <path className="fy-floor" d="M18 132 H182" />
              <g className="fy-body">
                <circle className="fy-head-dot" cx="100" cy="34" r="11" />
                <path className="fy-spine" d="M100 45 V88" />
                <path className="fy-arm" d="M100 58 L74 74" />
                <path className="fy-leg fy-leg--front" d="M100 88 L128 130" />
                <path className="fy-leg fy-leg--back" d="M100 88 L72 130" />
              </g>
            </svg>
            <span className="fy-tempo">
              <i />
            </span>
          </div>
          <p className="fy-count">
            Gentagelse <b>4</b> af 8
          </p>
        </section>

        <section className="fy-panel fy-panel--3">
          <p className="fy-title">Din fremgang · 6 uger</p>
          <svg viewBox="0 0 260 120" className="fy-curve" aria-hidden="true">
            <path className="fy-grid-line" d="M8 96 H252" />
            <path className="fy-grid-line" d="M8 62 H252" />
            <path className="fy-grid-line" d="M8 28 H252" />
            <path
              className="fy-curve-line"
              d="M14 94 C56 90 74 74 104 66 S158 52 188 36 214 24 246 18"
              pathLength={1}
            />
            <circle className="fy-curve-dot" cx="246" cy="18" r="5" />
          </svg>
          <div className="fy-scale">
            <span>Uge 1</span>
            <span>Uge 6</span>
          </div>
          <p className="fy-note">
            Selvregistreret af dig. Din behandler sætter og justerer planen.
          </p>
        </section>
      </div>

      <TabBar items={["Program", "Fremgang", "Tider", "Beskeder"]} active={0} />
      <HomeBar />
    </div>
  );
}
