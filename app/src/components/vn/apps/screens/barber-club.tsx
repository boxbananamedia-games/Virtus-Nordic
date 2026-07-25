import type { CSSProperties } from "react";
import { HomeBar, StatusBar, TabBar } from "./parts";

/**
 * Barber Club — Appointments and memberships.
 *
 * Charcoal and deep brown with warm cream type and restrained copper hairlines.
 * The wordmark is typographic (Cormorant, wide tracking), the "cinematic
 * imagery" is a drawn gradient field, not a photograph.
 *
 * Play state: the membership card turns on its Y axis and the benefits plus the
 * open appointment slots take its place (.bc-* in src/styles/applications.css).
 */

const BENEFITS = ["Prioriteret booking", "15% på produkter", "Skægtrim hver måned"];
const SLOTS = ["tor 16:30", "fre 09:00", "lør 11:15"];

export function BarberClubScreen() {
  return (
    <div className="vn-scr bc">
      <StatusBar />

      <header className="bc-head">
        <p className="bc-brand">
          Barber
          <span>Club</span>
        </p>
        <span className="bc-est">Aalborg · Est. 2019</span>
      </header>

      <div className="bc-stage">
        <div className="bc-card">
          <span className="bc-card-sheen" />
          <p className="bc-card-tier">Medlem · Signature</p>
          <p className="bc-card-name">A. E. Magnussen</p>
          <div className="bc-card-foot">
            <span>
              <b>4</b> klip tilbage
            </span>
            <span>Fornyes 1. sep</span>
          </div>
        </div>
      </div>

      <div className="bc-swap">
        <section className="bc-rest">
          <span className="bc-label">Næste tid</span>
          <p className="bc-next">Torsdag 14. august · 16:30</p>
          <p className="bc-next-sub">Klip og skæg · Mikkel</p>
        </section>

        <section className="bc-play">
          <span className="bc-label">Dine fordele</span>
          <ul className="bc-benefits">
            {BENEFITS.map((b, i) => (
              <li key={b} style={{ "--i": i } as CSSProperties}>
                {b}
              </li>
            ))}
          </ul>
          <span className="bc-label">Ledige tider</span>
          <div className="bc-slots">
            {SLOTS.map((s, i) => (
              <span key={s} style={{ "--i": i } as CSSProperties}>
                {s}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="bc-cta">Book hos Mikkel</div>

      <TabBar items={["Book", "Klubben", "Barbere", "Konto"]} active={1} />
      <HomeBar />
    </div>
  );
}
