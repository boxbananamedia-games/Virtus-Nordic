import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "../lib/language";
import { content } from "../lib/content";
import { Reveal, RibbonWave, WaveDivider } from "../components/vn/visuals";

export const Route = createFileRoute("/om")({
  head: () => ({
    meta: [
      { title: content.da.meta.about.title },
      { name: "description", content: content.da.meta.about.description },
    ],
  }),
  component: About,
});

function About() {
  const { t } = useLang();
  return (
    <div className="relative overflow-hidden">
      <RibbonWave
        side="right"
        className="pointer-events-none absolute -right-4 top-40 hidden h-[70vh] w-14 opacity-70 lg:block"
      />

      <section className="mx-auto max-w-4xl px-5 pb-14 pt-36 md:px-8 md:pt-44">
        <Reveal>
          <span className="label-eyebrow">{t.about.label}</span>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-navy md:text-6xl">
            {t.about.headline}
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-navy/80">{t.about.p1}</p>
        </Reveal>
        <Reveal delay={0.25}>
          <p className="mt-5 max-w-2xl leading-relaxed text-navy/75">{t.about.p2}</p>
        </Reveal>
      </section>

      <WaveDivider />

      <section className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
        <Reveal>
          <span className="label-eyebrow">{t.about.philosophyLabel}</span>
          <blockquote className="mt-6 border-l-2 border-teal-1/60 pl-6 font-display text-2xl font-medium italic leading-snug text-navy md:text-3xl">
            {t.about.quote}
          </blockquote>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 max-w-2xl leading-relaxed text-navy/75">{t.about.p3}</p>
        </Reveal>
      </section>

      <WaveDivider />

      <section className="mx-auto max-w-4xl px-5 py-14 pb-24 md:px-8 md:py-20">
        <Reveal>
          <span className="label-eyebrow">{t.about.localLabel}</span>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy/80">{t.about.p4}</p>
        </Reveal>
      </section>
    </div>
  );
}
