import type { CSSProperties } from "react";
import { HomeBar, StatusBar, TabBar } from "./parts";

/**
 * AalborgBox — Bookable capacity and logistics.
 *
 * Strong blue on white and graphite, architectural grid, precise status
 * indicators. Everything is drawn: the floor plan is a CSS grid, the access
 * pass code is a fixed decorative block pattern (not a scannable code).
 *
 * Play state: recommendation -> floor plan -> digital access pass, three panels
 * cross-fading in sequence (.ab-* in src/styles/applications.css).
 */

/** Hall B, 4 x 6 bays. 0 = let, 1 = free, 2 = the recommended unit. */
const PLAN = [0, 1, 0, 0, 1, 0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1];

/** Decorative block pattern for the access pass. Not a real scannable code. */
const PASS = [
  1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1,
  0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
];

export function AalborgBoxScreen() {
  return (
    <div className="vn-scr ab">
      <StatusBar />

      <header className="ab-head">
        <p className="ab-brand">
          Aalborg<b>Box</b>
        </p>
        <p className="ab-loc">Aalborg SV · Gugvej 12</p>
      </header>

      <div className="ab-stack">
        <section className="ab-panel ab-panel--1">
          <article className="ab-unit">
            <div className="ab-unit-top">
              <span className="ab-unit-id">Boks 214</span>
              <span className="ab-badge">
                <i />
                Ledigt nu
              </span>
            </div>
            <p className="ab-unit-size">
              6 <span>m²</span>
            </p>
            <dl className="ab-meta">
              <div>
                <dt>Hal</dt>
                <dd>B · stueplan</dd>
              </div>
              <div>
                <dt>Adgang</dt>
                <dd>Døgnåbent</dd>
              </div>
              <div>
                <dt>Højde</dt>
                <dd>2,4 m</dd>
              </div>
            </dl>
            <p className="ab-price">
              749 kr<span>/md</span>
            </p>
          </article>
          <p className="ab-rec">
            <b>Anbefalet størrelse</b> ud fra dine fire svar: 6 m²
          </p>

          <p className="ab-title ab-title--mt">Andre ledige størrelser</p>
          <ul className="ab-sizes">
            {[
              { size: "3 m²", note: "Depotrum · 12 ledige", price: "449" },
              { size: "9 m²", note: "Hal A · 4 ledige", price: "1.049" },
              { size: "18 m²", note: "Hal C · 2 ledige", price: "1.799" },
            ].map((s) => (
              <li key={s.size}>
                <span className="ab-sizes-size">{s.size}</span>
                <span className="ab-sizes-note">{s.note}</span>
                <span className="ab-sizes-price">{s.price} kr</span>
              </li>
            ))}
          </ul>

          <div className="ab-map">
            <i />
            <i />
            <i />
            <i />
            <b />
            <span>Gugvej 12</span>
          </div>
        </section>

        <section className="ab-panel ab-panel--2">
          <p className="ab-title">Plantegning · Hal B</p>
          <div className="ab-plan">
            {PLAN.map((state, i) => (
              <span key={i} data-state={state} />
            ))}
          </div>
          <ul className="ab-legend">
            <li data-state="2">Din boks</li>
            <li data-state="1">Ledig</li>
            <li data-state="0">Udlejet</li>
          </ul>

          <dl className="ab-meta ab-meta--wide">
            <div>
              <dt>Rute</dt>
              <dd>Port 2, gang 4</dd>
            </div>
            <div>
              <dt>Afstand fra port</dt>
              <dd>28 m</dd>
            </div>
          </dl>
          <p className="ab-hint">Kørsel med varevogn helt til døren.</p>
        </section>

        <section className="ab-panel ab-panel--3">
          <p className="ab-title">Adgangsbevis</p>
          <div className="ab-pass">
            <div className="ab-code">
              {PASS.map((on, i) => (
                <span key={i} data-on={on} style={{ "--i": i } as CSSProperties} />
              ))}
            </div>
            <p className="ab-pass-unit">Port 2 · Boks 214</p>
            <p className="ab-pass-live">
              <i />
              Adgang aktiv
            </p>
          </div>

          <p className="ab-title ab-title--mt">Seneste adgang</p>
          <ul className="ab-log">
            <li>
              <span>I dag · 09:14</span>
              <span>Port 2</span>
            </li>
            <li>
              <span>12. aug · 17:40</span>
              <span>Port 2</span>
            </li>
            <li>
              <span>4. aug · 11:02</span>
              <span>Port 1</span>
            </li>
          </ul>
        </section>
      </div>

      <TabBar items={["Søg", "Plan", "Adgang", "Konto"]} active={2} />
      <HomeBar />
    </div>
  );
}
