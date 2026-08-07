import { createFileRoute } from "@tanstack/react-router";
import { content } from "../../lib/content";
import { APPLICATIONS } from "../../lib/applications";
import { Applications } from "../applikationer";

/** /en/applications — English edition of /applikationer, deep-link included. */
export const Route = createFileRoute("/en/applications")({
  validateSearch: (search: Record<string, unknown>): { app?: string } => {
    const id = typeof search.app === "string" ? search.app : undefined;
    return APPLICATIONS.some((a) => a.id === id) ? { app: id } : {};
  },
  head: () => ({
    meta: [
      { title: content.en.meta.apps.title },
      { name: "description", content: content.en.meta.apps.description },
    ],
  }),
  component: Applications,
});
