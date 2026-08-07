import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { useLang } from "../../lib/language";
import { CONTACT } from "../../lib/content";
import { counterpartPath, pathFor, type SitePath } from "../../lib/site";
import { accentProps, useAccent } from "../../lib/accent";
import { InkDivider } from "./visuals";
import { useBooking } from "./BookingModal";

function unusedBookHref(subject: string) {
  return `mailto:${CONTACT.EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function Nav() {
  const { lang, t } = useLang();
  const booking = useBooking();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Five items no longer fit beside the logo, language toggle and CTA below
  // ~1024px, so the full nav starts at lg and tablets get the same menu button
  // phones do.
  // Paths come from the route table so the nav always points at the current
  // language's URLs — the English nav links to /en/services, not /ydelser.
  const links: { to: SitePath; label: string }[] = [
    { to: pathFor("home", lang), label: t.nav.home },
    { to: pathFor("about", lang), label: t.nav.about },
    { to: pathFor("services", lang), label: t.nav.services },
    { to: pathFor("apps", lang), label: t.nav.apps },
    { to: pathFor("contact", lang), label: t.nav.contact },
  ];

  const isActive = (l: { to: string }) => pathname.replace(/(.)\/$/, "$1") === l.to;

  /**
   * Switching language is a navigation, not a state change.
   *
   * These are real links, so the counterpart URL is visible on hover, opens in
   * a new tab, and — the point of the whole exercise — is something a search
   * engine can follow to discover the other language.
   */
  const LangToggle = (
    <div className="flex items-center" aria-label="Language">
      <Link
        to={counterpartPath(pathname, "da")}
        className="lang-btn"
        data-on={lang === "da"}
        hrefLang="da"
        aria-current={lang === "da" ? "true" : undefined}
      >
        DA
      </Link>
      <span className="text-[0.7rem] text-navy/30">·</span>
      <Link
        to={counterpartPath(pathname, "en")}
        className="lang-btn"
        data-on={lang === "en"}
        hrefLang="en"
        aria-current={lang === "en" ? "true" : undefined}
      >
        EN
      </Link>
    </div>
  );

  return (
    <>
      <header className={`nav-shell ${scrolled ? "scrolled" : ""}`}>
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-5 md:px-8">
          <Link
            to={pathFor("home", lang)}
            className="flex items-baseline gap-3"
            aria-label="Virtus Nordic"
          >
            <span className="font-logo text-2xl font-semibold leading-none text-navy">VN</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex xl:gap-8" aria-label="Primary">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="nav-link" data-active={isActive(l)}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            {LangToggle}
            <button type="button" onClick={booking.open} className="btn btn-fill btn-sm">
              {t.nav.cta}
            </button>
          </div>

          <div className="flex items-center gap-4 lg:hidden">
            {LangToggle}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px]"
            >
              <span
                className={`block h-[1.5px] w-6 bg-navy transition-transform duration-300 ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
              />
              <span className={`block h-[1.5px] w-6 bg-navy transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
              <span
                className={`block h-[1.5px] w-6 bg-navy transition-transform duration-300 ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="mobile-menu lg:hidden">
          {links.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              className="nav-link"
              data-active={isActive(l)}
              onClick={() => setOpen(false)}
              style={{ "--d": `${0.08 + i * 0.07}s` } as CSSProperties}
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              booking.open();
            }}
            className="btn btn-fill"
            style={{ "--d": "0.4s" } as CSSProperties}
          >
            {t.nav.cta}
          </button>
        </div>
      )}
    </>
  );
}

export function Footer() {
  const { t } = useLang();
  // The footer closes the page it belongs to, so it takes that page's pigment
  // rather than a house colour of its own.
  const accent = useAccent();
  return (
    <footer className="relative mt-4" {...accentProps(accent)}>
      <InkDivider variant={2} />
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-2 md:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="font-display text-lg font-medium uppercase tracking-[0.35em] text-navy">
              Virtus Nordic
            </p>
            <p className="mt-3 max-w-xs text-sm text-navy/60">{t.footer.tagline}</p>
          </div>
          <div className="text-sm text-navy/70">
            <p>
              <a href={`mailto:${CONTACT.EMAIL}`} className="underline decoration-teal-2/50 underline-offset-4 hover:text-navy">
                {CONTACT.EMAIL}
              </a>
            </p>
            <p className="mt-1">
              <a href={CONTACT.PHONE_HREF} className="hover:text-navy">
                {CONTACT.PHONE}
              </a>
            </p>
            <p className="mt-1">Aalborg, Danmark</p>
          </div>
        </div>
        <hr className="hairline my-7" />
        <p className="text-xs tracking-[0.14em] text-navy/50">
          © {new Date().getFullYear()} Virtus Nordic · {t.footer.rights} ·{" "}
          {/* Licence obligation for the hero's device model — must stay visible.
              rel="noopener" because target="_blank" otherwise hands the opened
              page a reference back to this window. */}
          {t.footer.modelCredit}{" "}
          <a
            href="https://www.meshy.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-navy/25 underline-offset-4 hover:text-navy/80"
          >
            Meshy
          </a>
        </p>
      </div>
    </footer>
  );
}
