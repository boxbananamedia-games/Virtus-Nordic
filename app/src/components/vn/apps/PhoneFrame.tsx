import type { CSSProperties, ReactNode } from "react";

/**
 * The device chassis. Pure CSS: no image, no WebGL, nothing to download.
 *
 * Geometry is driven by one number — `screenWidth` — and everything else
 * (height, bezel, corner radius, and the uniform scale applied to the 390 x 844
 * screen stage) derives from it in CSS. The aspect ratio is therefore fixed at
 * every size, which is what keeps the hero free of layout shift.
 *
 * `theme` carries the app's --app-* custom properties. They are set here, on the
 * device, so an application's visual identity is scoped to the glass and can
 * never leak into the Virtus Nordic gallery around it.
 *
 * The frame is presentational (aria-hidden). Interaction lives on a sibling
 * button in PhoneCard, which keeps the markup valid and the semantics honest.
 */
export function PhoneFrame({
  screenWidth,
  theme,
  play = false,
  className = "",
  children,
}: {
  screenWidth: number;
  theme: CSSProperties;
  /** Runs the screen's short in-app animation. */
  play?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`vn-phone ${className}`}
      // --screen-n is the screen width as a UNITLESS number. It has to be
      // unitless because the frame derives the stage's scale() from it, and
      // calc() cannot divide a length by a length — only a length by a number.
      // A layout can override the size by setting --phone-n (the mobile rail
      // makes every device identical that way) or --phone-k (responsive scale).
      style={
        {
          "--screen-n": `var(--phone-n, ${screenWidth})`,
          ...theme,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className="vn-phone__glass">
        <div className="vn-screen" data-play={play ? "true" : "false"}>
          {children}
        </div>
        <span className="vn-phone__island" />
        <span className="vn-phone__gloss" />
      </div>
    </div>
  );
}
