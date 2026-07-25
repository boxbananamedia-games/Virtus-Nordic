import type { CSSProperties } from "react";
import { HomeBar, StatusBar, TabBar } from "./parts";

/**
 * Aalborg El-service — Field service operations.
 *
 * White and cool grey, electric blue, safety orange used sparingly on the one
 * thing that is genuinely urgent. Monospace for technical labels, fast and
 * purposeful motion.
 *
 * Play state: a photo and voice report is turned into a structured service
 * request. Deliberate wording throughout: the app SUGGESTS fields for the
 * electrician to confirm. It does not diagnose, and it makes no statement about
 * electrical safety (.es-* in src/styles/applications.css).
 */

const TIMELINE = [
  { label: "Modtaget", time: "08:12" },
  { label: "Planlagt", time: "08:20" },
  { label: "På vej", time: "09:41" },
  { label: "Udført", time: "" },
];

const WAVE = [7, 15, 26, 12, 32, 20, 9, 24, 14, 30, 18, 8];

export function ElServiceScreen() {
  return (
    <div className="vn-scr es">
      <StatusBar />

      <header className="es-head">
        <p className="es-brand">
          Aalborg
          <b>El-service</b>
        </p>
        <span className="es-case">SAG 4821</span>
      </header>

      <div className="es-stack">
        <section className="es-panel es-panel--1">
          <div className="es-eta">
            <span className="es-pulse" />
            <span className="es-eta-text">
              <b>Elektriker på vej</b>
              <i>Jonas · vogn 3</i>
            </span>
            <span className="es-eta-val">
              14 <i>min</i>
            </span>
          </div>

          <ol className="es-timeline">
            {TIMELINE.map((s, i) => (
              <li
                key={s.label}
                data-done={i < 2}
                data-now={i === 2}
                style={{ "--i": i } as CSSProperties}
              >
                <span className="es-dot" />
                <span className="es-step">{s.label}</span>
                <span className="es-time">{s.time || "–"}</span>
              </li>
            ))}
          </ol>

          <p className="es-addr">
            <b>Vesterbro 44, 2. sal</b>
            Gruppe slår ud ved opvaskemaskine
          </p>

          <p className="es-title es-title--mt">Dokumentation</p>
          <ul className="es-docs">
            <li>
              <span>Tilbud 4821-A</span>
              <span className="es-ok">Godkendt</span>
            </li>
            <li>
              <span>Fotos fra kunden</span>
              <span>2 filer</span>
            </li>
            <li>
              <span>Servicerapport</span>
              <span>Afventer</span>
            </li>
          </ul>

          <div className="es-route">
            <svg viewBox="0 0 300 96" aria-hidden="true">
              <path className="es-route-line" d="M26 74 C74 74 78 30 122 30 S196 66 246 26" />
              <circle className="es-route-van" cx="26" cy="74" r="6.5" />
              <rect className="es-route-dest" x="240" y="20" width="12" height="12" rx="2" />
            </svg>
            <span>Rute · 4,2 km</span>
          </div>
        </section>

        <section className="es-panel es-panel--2">
          <p className="es-title">Fejlmelding fra kunden</p>
          <div className="es-shot">
            <span className="es-shot-frame" />
            <span className="es-shot-tag">FOTO · 2</span>
          </div>
          <div className="es-rec">
            <span className="es-wave">
              {WAVE.map((h, i) => (
                <i key={i} style={{ "--h": `${h}px`, "--i": i } as CSSProperties} />
              ))}
            </span>
            <span className="es-rec-time">0:06</span>
          </div>
          <p className="es-quote">
            „Der er noget galt i køkkenet. Gruppen slår ud hver gang vi tænder opvaskeren.”
          </p>
        </section>

        <section className="es-panel es-panel--3">
          <p className="es-title">Forslag til sag</p>
          <dl className="es-fields">
            <div>
              <dt>Kategori</dt>
              <dd>Gruppe slår ud</dd>
            </div>
            <div>
              <dt>Sted</dt>
              <dd>Vesterbro 44, 2. sal · køkken</dd>
            </div>
            <div>
              <dt>Hastegrad</dt>
              <dd className="es-urgent">Akut</dd>
            </div>
          </dl>
          <p className="es-note">
            Forslag ud fra kundens beskrivelse. Elektrikeren vurderer og godkender på stedet.
          </p>
          <div className="es-actions">
            <span className="es-btn">Godkend</span>
            <span className="es-btn es-btn--ghost">Ret</span>
          </div>
        </section>
      </div>

      <TabBar items={["Sager", "Meld fejl", "Ejendom", "Konto"]} active={0} />
      <HomeBar />
    </div>
  );
}
