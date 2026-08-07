import { useEffect, useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { content } from "../lib/content";
import { APPLICATIONS } from "../lib/applications";
import { ApplicationsSection } from "../components/vn/apps/ApplicationsSection";

/**
 * /applikationer — the concept showcase.
 *
 * Lives on its own page rather than as a homepage section: the five concepts
 * carry more copy than any other block on the site, and the hero's device
 * carousel is a better entry point to them than a scroll target.
 *
 * `?app=<id>` deep-links a concept, which is how a hero device hands off.
 */
export const Route = createFileRoute("/applikationer")({
  // Only ids that exist survive validation, so a hand-edited URL falls back to
  // the first concept instead of rendering an empty panel.
  validateSearch: (search: Record<string, unknown>): { app?: string } => {
    const id = typeof search.app === "string" ? search.app : undefined;
    return APPLICATIONS.some((a) => a.id === id) ? { app: id } : {};
  },
  head: () => ({
    meta: [
      { title: content.da.meta.apps.title },
      { name: "description", content: content.da.meta.apps.description },
    ],
  }),
  component: Applications,
});

export function Applications() {
  // Not Route.useSearch(): this component also serves /en/applications, which
  // is a different route and would not match a lookup bound to this one.
  const { app } = useSearch({ strict: false }) as { app?: string };
  const [selectedId, setSelectedId] = useState(app ?? APPLICATIONS[0].id);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Arriving from a hero device while already on this page (or using the back
  // button) changes the search param without remounting, so follow it.
  useEffect(() => {
    if (app) setSelectedId(app);
  }, [app]);

  return (
    <ApplicationsSection
      selectedId={selectedId}
      onSelect={setSelectedId}
      detailsOpen={detailsOpen}
      onDetailsToggle={() => setDetailsOpen((v) => !v)}
    />
  );
}
