/**
 * One scroll frame, read-all then write-all.
 *
 * The homepage had two independent rAF scroll callbacks — the scroll film's
 * edge fade and the process section's progress — and they interleaved badly.
 * The film read `getBoundingClientRect()` and then wrote custom properties;
 * the progress hook then read `getBoundingClientRect()` again, which had to
 * flush the style invalidation the film had just queued. A forced synchronous
 * layout, every frame, for the whole length of the section.
 *
 * Separating the phases fixes it without either caller knowing about the
 * other: every `measure` runs before any `mutate`, so there is exactly one
 * layout per frame no matter how many things are tracking scroll.
 *
 * `measure` must only read. `mutate` must only write.
 */
export type ScrollJob = {
  measure: () => void;
  mutate: () => void;
};

const jobs = new Set<ScrollJob>();
let raf = 0;
let listening = false;

function flush() {
  raf = 0;
  for (const job of jobs) job.measure();
  for (const job of jobs) job.mutate();
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(flush);
}

function listen() {
  if (listening) return;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  listening = true;
}

function unlisten() {
  if (!listening) return;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  listening = false;
}

/** Register a job and run it once immediately. Returns an unsubscribe. */
export function onScrollFrame(job: ScrollJob) {
  jobs.add(job);
  listen();
  schedule();
  return () => {
    jobs.delete(job);
    if (jobs.size === 0) {
      unlisten();
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
  };
}
