import type { ComponentType, ReactNode, SVGProps } from "react";
import ChevronRight from "@material-symbols/svg-400/outlined/chevron_right.svg?react";
import ArrowBack from "@material-symbols/svg-400/outlined/arrow_back_ios.svg?react";
import Search from "@material-symbols/svg-400/outlined/search.svg?react";

/**
 * iOS foundation kit.
 *
 * The shared furniture every concept screen is assembled from. It exists
 * because the previous screens drew their own approximations of iOS — icons as
 * bordered <span>s, a status bar with invented proportions, full-bleed
 * separators — and the sum of those small inaccuracies is what made them read
 * as sketches rather than as shipped product.
 *
 * Everything is authored in points on the 390 x 844 stage; PhoneFrame applies
 * one uniform scale afterwards, so these are the same numbers a real app would
 * use. Styles live in src/styles/ios-kit.css.
 *
 * All of it is aria-hidden at the device level: a screen is a picture of an
 * app, not an app, and exposing it to assistive tech would announce a wall of
 * fake controls. The real accessible name lives on the button in PhoneCard.
 */

export type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

/* ─────────────────────────────── status bar ────────────────────────────── */

export function StatusBar({ time = "9:41", battery = 0.78 }: { time?: string; battery?: number }) {
  return (
    <div className="ios-sb">
      {/* 9:41 is the time in every Apple product shot since 2007. Using it is a
          small signal to anyone who knows, and harmless to anyone who does not. */}
      <span className="ios-sb__time">{time}</span>
      <span className="ios-sb__right">
        <span className="ios-sb__cell">
          <i />
          <i />
          <i />
          <i />
        </span>
        <svg className="ios-sb__wifi" viewBox="0 0 16 11.5" fill="currentColor">
          <path d="M8 11.5 5.9 9.2a3.1 3.1 0 0 1 4.2 0L8 11.5Z" />
          <path
            d="M3.7 6.9a6.3 6.3 0 0 1 8.6 0l-1.2 1.3a4.6 4.6 0 0 0-6.2 0L3.7 6.9Z"
            opacity="0.98"
          />
          <path d="M1.4 4.5a9.6 9.6 0 0 1 13.2 0l-1.2 1.3a7.9 7.9 0 0 0-10.8 0L1.4 4.5Z" />
        </svg>
        <span className="ios-sb__batt" style={{ ["--level" as string]: battery }} />
      </span>
    </div>
  );
}

/* ──────────────────────────────── nav bar ──────────────────────────────── */

export function NavBar({
  title,
  large = true,
  back,
  trailing,
  sticky = false,
  eyebrow,
}: {
  title: string;
  /** Large-title style (a root screen) versus the compact bar of a pushed one. */
  large?: boolean;
  back?: string;
  trailing?: ReactNode;
  sticky?: boolean;
  eyebrow?: string;
}) {
  return (
    <div className={`ios-nav${sticky ? " ios-nav--sticky" : ""}`}>
      {(back || trailing || !large) && (
        <div className="ios-nav__bar">
          {back ? (
            <span className="ios-nav__action">
              <ArrowBack />
              {back}
            </span>
          ) : (
            <span />
          )}
          {!large && <span className="ios-headline">{title}</span>}
          {trailing ?? <span />}
        </div>
      )}
      {large && (
        <div className="ios-nav__large">
          {eyebrow && (
            <p className="ios-footnote" style={{ color: "var(--ios-label-2)" }}>
              {eyebrow}
            </p>
          )}
          <h3 className="ios-large-title">{title}</h3>
        </div>
      )}
    </div>
  );
}

/* ───────────────────── grouped inset table views ───────────────────────── */

export function Group({
  header,
  footer,
  children,
}: {
  header?: string;
  footer?: string;
  children: ReactNode;
}) {
  return (
    <section>
      {header && <p className="ios-group__header">{header}</p>}
      <div className="ios-group">{children}</div>
      {footer && <p className="ios-group__footer">{footer}</p>}
    </section>
  );
}

export function Row({
  icon: Icon,
  iconBg,
  title,
  sub,
  value,
  chevron = false,
  trailing,
  avatar,
}: {
  icon?: Glyph;
  /** Overrides the tile colour, so one list can carry per-row semantics. */
  iconBg?: string;
  title: ReactNode;
  sub?: ReactNode;
  value?: ReactNode;
  chevron?: boolean;
  trailing?: ReactNode;
  avatar?: ReactNode;
}) {
  const inset = avatar ? "avatar" : Icon ? "icon" : undefined;
  return (
    <div className="ios-row" data-inset={inset}>
      {avatar}
      {Icon && (
        <span className="ios-row__icon" style={iconBg ? { background: iconBg } : undefined}>
          <Icon />
        </span>
      )}
      <span className="ios-row__text">
        <span className="ios-row__title">{title}</span>
        {sub && <span className="ios-row__sub">{sub}</span>}
      </span>
      {value && <span className="ios-row__value">{value}</span>}
      {trailing}
      {chevron && <ChevronRight className="ios-row__chev" />}
    </div>
  );
}

/* ────────────────────────────── controls ───────────────────────────────── */

export function Segmented({ items, active = 0 }: { items: string[]; active?: number }) {
  return (
    <div className="ios-seg">
      {items.map((label, i) => (
        <span key={label} data-on={i === active ? "true" : "false"}>
          {label}
        </span>
      ))}
    </div>
  );
}

export function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <div className="ios-search">
      <Search />
      {placeholder}
    </div>
  );
}

export function Button({
  children,
  variant = "filled",
  trailing,
}: {
  children: ReactNode;
  variant?: "filled" | "tinted" | "plain";
  trailing?: ReactNode;
}) {
  return (
    <div className="ios-btn" data-variant={variant}>
      {children}
      {trailing}
    </div>
  );
}

export const Badge = ({ children }: { children: ReactNode }) => (
  <span className="ios-badge">{children}</span>
);

export const Pill = ({ children }: { children: ReactNode }) => (
  <span className="ios-pill">{children}</span>
);

/* ──────────────────── tab bar, home indicator, scroll ──────────────────── */

export function TabBar({
  items,
  active = 0,
}: {
  items: { label: string; icon: Glyph }[];
  active?: number;
}) {
  return (
    <nav className="ios-tabbar">
      {items.map(({ label, icon: Icon }, i) => (
        <span key={label} className="ios-tab" data-on={i === active ? "true" : "false"}>
          <Icon />
          <span>{label}</span>
        </span>
      ))}
    </nav>
  );
}

export const HomeIndicator = () => <span className="ios-home" />;

/** The scrolling region between the nav bar and the tab bar. Content is meant
 *  to be clipped by it — a screen whose content stops tidily above the chrome
 *  looks composed rather than captured. */
export const Scroll = ({ children }: { children: ReactNode }) => (
  <div className="ios-scroll">{children}</div>
);
