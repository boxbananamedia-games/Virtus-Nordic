/**
 * Shared device-screen furniture.
 *
 * Every screen is authored on a fixed 390 x 844 stage in real pixels, then
 * uniformly scaled by the phone frame (see PhoneFrame). That means type sizes,
 * paddings and radii inside a screen can be written exactly as they would be in
 * the real app, and they stay proportional at any device size on the page.
 */

/** iOS-style status bar. Drawn, not an image, so it inherits each app's ink. */
export function StatusBar({ time = "11:24" }: { time?: string }) {
  return (
    <div className="vn-sb" aria-hidden="true">
      <span className="vn-sb__time">{time}</span>
      <span className="vn-sb__right">
        <span className="vn-sb__signal">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="vn-sb__wifi" />
        <span className="vn-sb__batt" />
      </span>
    </div>
  );
}

/**
 * The app's bottom navigation. Labels are the app's own words; the glyphs are
 * simple drawn shapes that vary per slot, which at device scale reads as an
 * icon row without pretending to be somebody's icon set.
 */
export function TabBar({ items, active = 0 }: { items: string[]; active?: number }) {
  return (
    <nav className="vn-tabs" aria-hidden="true">
      {items.map((label, i) => (
        <span key={label} className="vn-tab" data-on={i === active ? "true" : "false"}>
          <span className="vn-tab-glyph" />
          {label}
        </span>
      ))}
    </nav>
  );
}

/** The home indicator pill at the bottom of the screen. */
export function HomeBar() {
  return <span className="vn-hb" aria-hidden="true" />;
}
