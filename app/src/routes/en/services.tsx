import { createFileRoute } from "@tanstack/react-router";
import { content } from "../../lib/content";
import { Services } from "../ydelser";

/** /en/services — English edition of /ydelser. */
export const Route = createFileRoute("/en/services")({
  head: () => ({
    meta: [
      { title: content.en.meta.services.title },
      { name: "description", content: content.en.meta.services.description },
    ],
  }),
  component: Services,
});
