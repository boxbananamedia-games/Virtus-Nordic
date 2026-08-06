import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "../../components/vn/visuals";

// TODO: replace with the real support address before submitting to App
// Review — this is the one placeholder left on this page. It also appears in
// Marketing/privacy-policy.md and terms-of-service.md in the Unruled repo;
// update all three together, then regenerate src/lib/legal-content.ts.
const SUPPORT_EMAIL = "[YOUR SUPPORT EMAIL]";

export const Route = createFileRoute("/unruled/")({
  head: () => ({
    meta: [
      { title: "Unruled — Support" },
      {
        name: "description",
        content: "Support, Privacy Policy and Terms of Service for Unruled, a focus app for iPhone.",
      },
    ],
  }),
  component: UnruledSupport,
});

function UnruledSupport() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 md:px-8 md:pt-44">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold leading-tight text-navy md:text-5xl">
          Unruled
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy/80">
          A focus app for iPhone. Block the apps and websites that eat your day, so the hours
          you meant to use are still there when you look for them.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        <span className="label-eyebrow">Support</span>
        <p className="mt-3 max-w-xl leading-relaxed text-navy/80">
          Questions, bug reports, or a request about your data:
        </p>
        <p className="mt-2">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-display text-xl font-medium text-navy underline decoration-teal-2/50 underline-offset-4"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </Reveal>

      <Reveal delay={0.2} className="mt-12">
        <span className="label-eyebrow">Legal</span>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link to="/unruled/privacy" className="btn btn-outline">
            Privacy Policy
          </Link>
          <Link to="/unruled/terms" className="btn btn-outline">
            Terms of Service
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.3} className="mt-16 border-t border-navy/10 pt-8">
        <p className="text-sm text-navy/50">
          Unruled is made by{" "}
          <Link to="/" className="underline decoration-teal-2/50 underline-offset-4">
            Virtus Nordic
          </Link>
          .
        </p>
      </Reveal>
    </div>
  );
}
