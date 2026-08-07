import { createFileRoute } from "@tanstack/react-router";
import { content } from "../../lib/content";
import { Contact } from "../kontakt";

/** /en/contact — English edition of /kontakt. */
export const Route = createFileRoute("/en/contact")({
  head: () => ({
    meta: [
      { title: content.en.meta.contact.title },
      { name: "description", content: content.en.meta.contact.description },
    ],
  }),
  component: Contact,
});
