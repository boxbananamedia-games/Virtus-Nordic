import { createFileRoute } from "@tanstack/react-router";
import { content } from "../../lib/content";
import { About } from "../om";

/** /en/about — English edition of /om. Same component, English metadata. */
export const Route = createFileRoute("/en/about")({
  head: () => ({
    meta: [
      { title: content.en.meta.about.title },
      { name: "description", content: content.en.meta.about.description },
    ],
  }),
  component: About,
});
