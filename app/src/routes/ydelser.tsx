import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "../lib/language";
import { CONTACT, content } from "../lib/content";
import { Reveal, WaveDivider, WaveMark } from "../components/vn/visuals";

export const Route = createFileRoute("/ydelser")({
  head: () => ({
    meta: [
      { title: content.da.meta.services.title },
      { name: "description", content: content.da.meta.services.description },
    ],
  }),
  component: Services,
});

function Services() {
  const { t } = useLang();
  const book = `mailto:${CONTACT.EMAIL}?subject=${encodeURIComponent(t.contact.mailSubject)}`;

  return (
    <div>
      <section className="mx-auto max-w-5xl px-5 pb-10 pt-36 md:px-8 md:pt-44">
        <Reveal>
          <span className="label-eyebrow">{t.services.label}</span>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-navy md:text-6xl">
            {t.services.headline}
          </h1>
        </Reveal>
      </section>

      <div className="mx-auto max-w-5xl px-5 md:px-8">
        {t.services.items.map((item, i) => (
          <div key={item.title}>
            <WaveDivider />
            <Reveal className="py-10 md:py-14">
              <article className={`grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-14 ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
                <div className="md:[direction:ltr]">
                  <div className="flex items-start gap-5">
                    <WaveMark className="h-12 w-12 shrink-0" />
                    <div>
                      <span className="font-display text-sm font-semibold tracking-[0.25em] text-teal-1">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
                        {item.title}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="md:[direction:ltr]">
                  {item.paras.map((p, j) => (
                    <p key={j} className={`leading-relaxed text-navy/80 ${j > 0 ? "mt-5" : ""}`}>
                      {p}
                    </p>
                  ))}
                </div>
              </article>
            </Reveal>
          </div>
        ))}
      </div>

      <WaveDivider />
      <section className="mx-auto max-w-3xl px-5 py-16 pb-24 text-center md:px-8 md:py-24">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
            {t.services.closing}
          </h2>
          <a href={book} className="btn btn-fill mt-8">
            {t.services.closingCta}
          </a>
        </Reveal>
      </section>
    </div>
  );
}
