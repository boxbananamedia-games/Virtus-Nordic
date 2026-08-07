import { createFileRoute } from "@tanstack/react-router";
import { content } from "../../lib/content";
import { Index, LOOKS, DEFAULT_LOOK, type Look } from "../index";

/**
 * /en — the English edition of the front page.
 *
 * The component is the Danish route's, unchanged: language is read from the
 * URL by LanguageProvider, so one component renders either edition and the two
 * cannot drift apart. Only the route shell differs — English metadata, and its
 * own address so the page can be linked, shared and indexed.
 */
export const Route = createFileRoute("/en/")({
  validateSearch: (search: Record<string, unknown>): { look?: Look } => {
    const look = LOOKS.find((l) => l === search.look);
    return look && look !== DEFAULT_LOOK ? { look } : {};
  },
  head: () => ({
    meta: [
      { title: content.en.meta.home.title },
      { name: "description", content: content.en.meta.home.description },
    ],
  }),
  component: Index,
});
