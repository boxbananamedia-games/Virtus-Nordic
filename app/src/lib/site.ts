/**
 * The site's own address — the one URL every other host defers to.
 *
 * The app answers on more than one origin: its higgsfield.app deploy URL, and
 * virtusnordic.com. Left to self-canonicalise, each would claim to be the
 * original and split the ranking signal between them. Pinning the canonical
 * host here means every copy points at the same address no matter which one
 * served the request.
 *
 * This is deliberately NOT used for asset URLs. A canonical tag is a claim
 * about identity and is allowed to point somewhere that is not yet serving; an
 * og:image is a URL a scraper has to actually fetch, so it stays on the origin
 * that answered the request and is guaranteed to have the file.
 */
export const SITE_ORIGIN = "https://virtusnordic.com";

/** Absolute canonical URL for a path, e.g. "/ydelser". */
export function canonicalUrl(pathname: string): string {
  return SITE_ORIGIN + (pathname === "/" ? "/" : pathname.replace(/\/+$/, ""));
}
