import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../../components/vn/LegalPage";
import { TERMS_SECTIONS } from "../../lib/legal-content";

export const Route = createFileRoute("/unruled/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Unruled" },
      {
        name: "description",
        content: "Terms of Service for Unruled, a focus and app-blocking app for iPhone.",
      },
    ],
  }),
  component: () => <LegalPage sections={TERMS_SECTIONS} />,
});
