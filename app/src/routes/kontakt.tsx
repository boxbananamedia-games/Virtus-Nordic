import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useLang } from "../lib/language";
import { CONTACT, content } from "../lib/content";
import { Reveal } from "../components/vn/visuals";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: content.da.meta.contact.title },
      { name: "description", content: content.da.meta.contact.description },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "" });

  const update = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const f = t.contact.form;
    const body = [
      `${f.name}: ${form.name}`,
      `${f.company}: ${form.company}`,
      `${f.email}: ${form.email}`,
      `${f.phone}: ${form.phone}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `mailto:${CONTACT.EMAIL}?subject=${encodeURIComponent(
      t.contact.mailSubject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-36 md:px-8 md:pt-44">
      <div className="grid gap-14 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-20">
        <div>
          <Reveal>
            <h1 className="font-display text-4xl font-semibold leading-tight text-navy md:text-6xl">
              {t.contact.headline}
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-navy/75">{t.contact.sub}</p>
          </Reveal>

          <Reveal delay={0.15} className="mt-10 space-y-5 text-navy/80">
            <div>
              <span className="label-eyebrow">{t.contact.emailLabel}</span>
              <p className="mt-1">
                <a
                  href={`mailto:${CONTACT.EMAIL}`}
                  className="font-display text-xl font-medium text-navy underline decoration-teal-2/50 underline-offset-4"
                >
                  {CONTACT.EMAIL}
                </a>
              </p>
            </div>
            <div>
              <span className="label-eyebrow">{t.contact.phoneLabel}</span>
              <p className="mt-1">
                <a href={CONTACT.PHONE_HREF} className="font-display text-xl font-medium text-navy">
                  {CONTACT.PHONE}
                </a>
              </p>
            </div>
            <div>
              <span className="label-eyebrow">{t.contact.basedLabel}</span>
              <p className="mt-1 font-display text-xl font-medium text-navy">{t.contact.based}</p>
            </div>
          </Reveal>

        </div>

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-navy/60">{t.contact.form.name}</span>
                <input required className="field" value={form.name} onChange={update("name")} autoComplete="name" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-navy/60">
                  {t.contact.form.company}
                </span>
                <input className="field" value={form.company} onChange={update("company")} autoComplete="organization" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-navy/60">{t.contact.form.email}</span>
                <input
                  type="email"
                  required
                  className="field"
                  value={form.email}
                  onChange={update("email")}
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-navy/60">{t.contact.form.phone}</span>
                <input type="tel" className="field" value={form.phone} onChange={update("phone")} autoComplete="tel" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-navy/60">{t.contact.form.message}</span>
              <textarea required rows={6} className="field resize-y" value={form.message} onChange={update("message")} />
            </label>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" className="btn btn-fill">
                {t.contact.form.send}
              </button>
              <p className="text-xs text-navy/50">{t.contact.form.note}</p>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
