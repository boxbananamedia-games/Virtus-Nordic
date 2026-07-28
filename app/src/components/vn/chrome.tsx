import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { useLang } from "../../lib/language";
import { CONTACT } from "../../lib/content";
import { InkDivider, prefersReducedMotion } from "./visuals";
import { useBooking } from "./BookingModal";

function unusedBookHref(subject: string) {
  return `mailto:${CONTACT.EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function Nav() {
  const { lang, t, setLang } = useLang();
  const booking = useBooking();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });

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

  // Five items with "Applikationer" among them no longer fit beside the logo,
  // language toggle and CTA below ~1024px, so the full nav starts at lg and
  // tablets get the same menu button phones do.
  const links: { to: string; hash?: string; label: string }[] = [
    { to: "/", label: t.nav.home },
    { to: "/om", label: t.nav.about },
    { to: "/ydelser", label: t.nav.services },
    { to: "/", hash: "applikationer", label: t.nav.apps },
    { to: "/kontakt", label: t.nav.contact },
  ];

  // Applikationer is a section of the homepage, not a route. From another page
  // the Link navigates and the homepage's hash effect scrolls; when we are
  // already on "/" the location may not change at all, so scroll it ourselves.
  const onNavClick = (l: { to: string; hash?: string }, closeMenu = false) => () => {
    if (closeMenu) setOpen(false);
    if (!l.hash || pathname !== "/") return;
    // Wait a frame when coming from the mobile menu: the overlay has to unmount
    // and release the body scroll lock before anything can be scrolled.
    const run = () =>
      document
        .getElementById(l.hash as string)
        ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    if (closeMenu) window.setTimeout(run, 60);
    else run();
  };

  // The router reports the hash with or without its leading "#" depending on how
  // the location was set, so normalise before comparing.
  const currentHash = (hash ?? "").replace(/^#/, "");
  const isActive = (l: { to: string; hash?: string }) =>
    pathname === l.to && (l.hash ? currentHash === l.hash : !currentHash);

  const LangToggle = (
    <div className="flex items-center" aria-label="Language">
      <button type="button" className="lang-btn" data-on={lang === "da"} onClick={() => setLang("da")}>
        DA
      </button>
      <span className="text-[0.7rem] text-navy/30">·</span>
      <button type="button" className="lang-btn" data-on={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
    </div>
  );

  return (
    <>
      <header className={`nav-shell ${scrolled ? "scrolled" : ""}`}>
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-baseline gap-3" aria-label="Virtus Nordic">
            <span className="font-logo text-2xl font-semibold leading-none text-navy">VN</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex xl:gap-8" aria-label="Primary">
            {links.map((l) => (
              <Link
                key={`${l.to}#${l.hash ?? ""}`}
                to={l.to}
                hash={l.hash}
                className="nav-link"
                data-active={isActive(l)}
                onClick={onNavClick(l)}
              >
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
              key={`${l.to}#${l.hash ?? ""}`}
              to={l.to}
              hash={l.hash}
              className="nav-link"
              data-active={isActive(l)}
              onClick={onNavClick(l, true)}
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
  return (
    <footer className="relative mt-4">
      <InkDivider />
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
