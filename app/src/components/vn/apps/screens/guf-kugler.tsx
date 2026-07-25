import { HomeBar, StatusBar, TabBar } from "./parts";

/**
 * Guf & Kugler — Food and takeaway commerce.
 *
 * Cream ground, berry/pistachio/lemon accents, generous radii. Playful but
 * premium: the scoops are drawn with layered radial gradients, never photos.
 *
 * Play state: two scoops drop into the cup while the total and the loyalty
 * points tick up (see .gk-* rules in src/styles/applications.css).
 */

const FLAVOURS = [
  { name: "Hindbær og lakrids", note: "Nyrørt i dag", price: "28", tone: "berry" },
  { name: "Pistacie", note: "Sicilianske nødder", price: "30", tone: "pistachio" },
  { name: "Citron og basilikum", note: "Sorbet, vegansk", price: "26", tone: "lemon" },
];

export function GufKuglerScreen() {
  return (
    <div className="vn-scr gk">
      <StatusBar />

      <header className="gk-head">
        <p className="gk-brand">
          Guf <span className="gk-amp">&amp;</span> Kugler
        </p>
        <h3 className="gk-h1">Dagens kugler i Aalborg</h3>
      </header>

      <ul className="gk-list">
        {FLAVOURS.map((f) => (
          <li key={f.name} className="gk-flav">
            <span className={`gk-scoop gk-scoop--${f.tone}`} />
            <span className="gk-flav-text">
              <b>{f.name}</b>
              <i>{f.note}</i>
            </span>
            <span className="gk-flav-price">{f.price} kr</span>
          </li>
        ))}
      </ul>

      <div className="gk-loyal">
        <div className="gk-loyal-top">
          <span className="gk-loyal-label">Guf-klub</span>
          <span className="gk-pts">
            <b className="gk-swap-a">120</b>
            <b className="gk-swap-b">128</b>
            <i>point</i>
          </span>
        </div>
        <span className="gk-bar">
          <i />
        </span>
        <p className="gk-loyal-note">2 kugler til en gratis is</p>
      </div>

      <div className="gk-build">
        {/* Cup first, scoops after: later siblings paint on top, so a scoop that
            lands in the cup stays visible instead of hiding behind it. */}
        <span className="gk-cup-wrap">
          <span className="gk-cup">
            <span className="gk-cup-fill" />
          </span>
          <span className="gk-drop gk-drop--1" />
          <span className="gk-drop gk-drop--2" />
        </span>
        <span className="gk-build-text">
          <b>Byg din is</b>
          <i>2 kugler, vaffel, drys</i>
          <span className="gk-pickup">Klar til afhentning 12:15</span>
        </span>
      </div>

      <div className="gk-cta">
        <span>Til kassen</span>
        <span className="gk-total">
          <b className="gk-swap-a">42 kr</b>
          <b className="gk-swap-b">56 kr</b>
        </span>
      </div>

      <TabBar items={["I dag", "Byg", "Klub", "Mig"]} active={0} />
      <HomeBar />
    </div>
  );
}
