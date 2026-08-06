import type { ReactNode } from "react";
import type { LegalSection } from "../../lib/legal-content";

/**
 * Renders `**bold**`, `` `code` `` and `[text](url)` from the generated legal
 * content — the same inline markup Marketing/build-site.sh's converter
 * produces for the standalone GitHub Pages copy of these documents, so the two
 * never drift into different formatting rules.
 */
function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-medium text-navy">
          {m[1]}
        </strong>,
      );
    } else if (m[2] !== undefined) {
      nodes.push(
        <code key={key++} className="rounded bg-navy/5 px-1.5 py-0.5 text-[0.9em]">
          {m[2]}
        </code>,
      );
    } else {
      nodes.push(
        <a
          key={key++}
          href={m[4]}
          className="text-teal-1 underline decoration-teal-2/50 underline-offset-4"
        >
          {m[3]}
        </a>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * Renders a legal document (Privacy Policy / Terms of Service) generated from
 * Marketing/*.md in the Unruled repo, in Virtus Nordic's own type system rather
 * than a foreign-looking embed.
 *
 * English only, deliberately — unlike the rest of this bilingual site. Legal
 * text should not be casually machine-translated, and Apple review reads
 * English regardless of the audience the app itself serves.
 */
export function LegalPage({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 md:px-8 md:pt-44">
      {sections.map((s, i) => {
        switch (s.type) {
          case "h1":
            return (
              <h1
                key={i}
                className="font-display text-4xl font-semibold leading-tight text-navy md:text-5xl"
              >
                {s.text}
              </h1>
            );
          case "updated":
            return (
              <p key={i} className="mt-3 font-display italic text-navy/60">
                {s.text}
              </p>
            );
          case "h2":
            return (
              <h2
                key={i}
                className="mt-14 font-display text-2xl font-semibold leading-snug text-navy"
              >
                {s.text}
              </h2>
            );
          case "p":
            return (
              <p key={i} className="mt-4 leading-relaxed text-navy/80">
                {inline(s.text)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-navy/80">
                {s.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}
