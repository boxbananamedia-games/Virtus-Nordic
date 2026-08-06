import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../../components/vn/LegalPage";
import { PRIVACY_SECTIONS } from "../../lib/legal-content";

export const Route = createFileRoute("/unruled/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Unruled" },
      {
        name: "description",
        content: "Privacy Policy for Unruled, a focus and app-blocking app for iPhone.",
      },
    ],
  }),
  component: () => <LegalPage sections={PRIVACY_SECTIONS} />,
});
