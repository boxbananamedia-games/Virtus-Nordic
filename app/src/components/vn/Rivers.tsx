import { useEffect, useRef } from "react";

/**
 * Rivers — two continuously flowing vertical rivers flanking the hero.
 *
 * First visit (per session, homepage only): an inline script in __root sets
 * `data-river-intro` on <html> BEFORE paint. While set, a cream veil hides the
 * page and `.enter` animations are paused; the rivers draw themselves from the
 * top of the viewport down to the bottom. When they land, the attribute is
 * removed: the veil fades, the hero staggers in.
 *
 * Waves: each river is layered sine ribbons drifting downward forever. Scroll
 * velocity pumps energy into the amplitudes; when scrolling stops, a damped
 * spring oscillator ("slosh") keeps the water clashing before it settles.
 * Fake physics, real feel.
 *
 * Performance: one shared rAF for both canvases, DPR capped, paused when the
 * hero leaves the viewport or the tab hides. Mobile renders slimmer rivers
 * with fewer ribbons. Reduced motion: a single static render, no intro.
 */

const SESSION_KEY = "vn-ri";
const INTRO_MS = 1500;

type Ribbon = {
  amp: number; // base amplitude px
  k: number; // spatial frequency
  omega: number; // temporal frequency
  phase: number;
  width: number;
  color: string;
  alpha: number;
  drift: number; // horizontal resting offset
  energyGain: number; // how much scroll energy affects this ribbon
};

const COLORS = ["#0E8B84", "#15706E", "#2FB3A5", "#5ED0BF", "#0A5754"];

function makeRibbons(n: number, seedShift: number): Ribbon[] {
  const out: Ribbon[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    out.push({
      amp: 10 + 16 * Math.sin(seedShift + i * 1.7) ** 2,
      k: 0.008 + 0.006 * ((i * 2.3 + seedShift) % 1),
      omega: 0.9 + 0.5 * ((i * 1.3 + seedShift * 0.7) % 1),
      phase: seedShift * 2 + i * 1.9,
      width: 8 + 20 * (1 - Math.abs(t - 0.5) * 2) + 6 * ((i + seedShift) % 1),
      color: COLORS[i % COLORS.length],
      alpha: 0.34 + 0.3 * (1 - Math.abs(t - 0.5) * 2),
      drift: (t - 0.5) * 34,
      energyGain: 0.7 + 0.8 * ((i * 3.1 + seedShift) % 1),
    });
  }
  return out;
}

export function Rivers() {
  const leftRef = useRef<HTMLCanvasElement | null>(null);
  const rightRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    const host = hostRef.current;
    if (!left || !right || !host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 1024;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
    const ribbonCount = mobile ? 3 : 5;

    const sides = [
      { canvas: left, ribbons: makeRibbons(ribbonCount, 0.3), dir: 1 },
      { canvas: right, ribbons: makeRibbons(ribbonCount, 2.1), dir: -1 },
    ];

    let W = 0;
    let H = 0;
    const size = () => {
      for (const s of sides) {
        const rect = s.canvas.getBoundingClientRect();
        W = Math.max(1, Math.round(rect.width));
        H = Math.max(1, Math.round(rect.height));
        s.canvas.width = Math.round(W * dpr);
        s.canvas.height = Math.round(H * dpr);
        const ctx = s.canvas.getContext("2d");
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    size();

    // ---- scroll energy + slosh oscillator ----
    let lastScroll = window.scrollY;
    let vel = 0; // smoothed px/frame
    let energy = 0;
    let slosh = 0; // spring displacement
    let sloshV = 0;
    let prevVel = 0;

    // ---- intro reveal ----
    const intro = document.documentElement.hasAttribute("data-river-intro") && !reduce;
    let introStart = 0;
    let reveal = intro ? 0 : 1;

    const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

    const drawSide = (s: (typeof sides)[number], t: number) => {
      const ctx = s.canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const revealY = reveal * (H + 60);
      for (const r of s.ribbons) {
        const A = r.amp * (1 + energy * r.energyGain);
        ctx.beginPath();
        let first = true;
        for (let y = -20; y <= Math.min(H + 20, revealY); y += 12) {
          const clash = slosh * 18 * Math.sin(0.012 * y + r.phase * 1.3) * r.energyGain;
          const x =
            cx +
            r.drift +
            A * Math.sin(r.k * y + s.dir * r.omega * t + r.phase) +
            0.4 * A * Math.sin(r.k * 2.3 * y - s.dir * r.omega * 1.7 * t + r.phase * 2) +
            clash;
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.alpha;
        ctx.lineWidth = r.width;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      // luminous head during intro
      if (reveal < 1) {
        const y = revealY - 30;
        const g = ctx.createRadialGradient(cx, y, 0, cx, y, 46);
        g.addColorStop(0, "rgba(94, 208, 191, 0.85)");
        g.addColorStop(1, "rgba(94, 208, 191, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.fillRect(cx - 50, y - 50, 100, 100);
      }
      ctx.globalAlpha = 1;
    };

    const staticDraw = () => {
      reveal = 1;
      energy = 0;
      slosh = 0;
      for (const s of sides) drawSide(s, 1.8);
    };

    if (reduce) {
      staticDraw();
      const onResize = () => {
        size();
        staticDraw();
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let raf = 0;
    let running = true;
    let visible = true;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!running || !visible) return;
      const t = now / 1000;

      // scroll velocity -> energy
      const sc = window.scrollY;
      const dv = sc - lastScroll;
      lastScroll = sc;
      vel = vel * 0.82 + dv * 0.18;
      const target = Math.min(1.7, Math.abs(vel) * 0.035);
      energy += (target - energy) * (target > energy ? 0.3 : 0.045);

      // slosh: impulse when velocity collapses or flips (the "clash")
      const dVel = vel - prevVel;
      if (Math.abs(prevVel) > 2 && Math.abs(vel) < Math.abs(prevVel) * 0.6) {
        sloshV += prevVel * 0.022;
      }
      sloshV += -0.16 * slosh - 0.055 * sloshV + dVel * 0.004;
      slosh += sloshV;
      prevVel = vel;

      if (reveal < 1) {
        if (!introStart) introStart = now;
        reveal = easeInOut(Math.min(1, (now - introStart) / INTRO_MS));
        if (reveal >= 1) {
          document.documentElement.removeAttribute("data-river-intro");
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* private mode */
          }
        }
      }
      for (const s of sides) drawSide(s, t);
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "80px" },
    );
    io.observe(host);
    const onVis = () => {
      running = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);
    const onResize = () => size();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      /* NOTE: do not remove data-river-intro here — completion removes it, and
         the inline-script failsafe in __root covers pathological cases. */
    };
  }, []);

  return (
    <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
      <canvas
        ref={leftRef}
        className="river-canvas absolute left-0 top-0 h-full w-16 sm:w-24 lg:w-44"
      />
      <canvas
        ref={rightRef}
        className="river-canvas absolute right-0 top-0 h-full w-16 sm:w-24 lg:w-44"
      />
    </div>
  );
}
