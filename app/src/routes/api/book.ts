import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../lib/bindings.server";

/**
 * POST /api/book — the booking pipeline.
 *
 * 1. Validate (types, required fields, honeypot).
 * 2. Insert into D1 `bookings` — capture is guaranteed even if email fails.
 * 3. If RESEND_API_KEY is configured, send a notification to NOTIFY_TO and
 *    mark the row emailed=1. Booking succeeds either way.
 */

const NOTIFY_TO = "alex@virtusnordic.com";
const FROM = "Virtus Nordic <onboarding@resend.dev>";
const TIMESLOTS = new Set(["morning", "afternoon"]);

type BookingInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
  preferredDate?: unknown;
  timeslot?: unknown;
  message?: unknown;
  lang?: unknown;
  website?: unknown; // honeypot — humans never fill this
};

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export const Route = createFileRoute("/api/book")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: BookingInput;
        try {
          raw = (await request.json()) as BookingInput;
        } catch {
          return Response.json({ ok: false, code: "bad_json" }, { status: 400 });
        }

        // Honeypot: pretend success so bots learn nothing.
        if (str(raw.website, 200)) return Response.json({ ok: true, emailed: false });

        const name = str(raw.name, 120);
        const email = str(raw.email, 200);
        const phone = str(raw.phone, 60);
        const company = str(raw.company, 160);
        const preferredDate = str(raw.preferredDate, 10);
        const timeslot = str(raw.timeslot, 20);
        const message = str(raw.message, 2000);
        const lang = str(raw.lang, 2) === "en" ? "en" : "da";

        if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json({ ok: false, code: "invalid_contact" }, { status: 400 });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || !TIMESLOTS.has(timeslot)) {
          return Response.json({ ok: false, code: "invalid_slot" }, { status: 400 });
        }

        const env = bindings();
        const db = env.DB;
        if (!db) {
          return Response.json({ ok: false, code: "db_unavailable" }, { status: 500 });
        }

        const id = crypto.randomUUID();
        await db
          .prepare(
            `INSERT INTO bookings (id, name, email, phone, company, preferred_date, timeslot, message, lang)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
          )
          .bind(id, name, email, phone || null, company || null, preferredDate, timeslot, message || null, lang)
          .run();

        let emailed = false;
        const key = env.RESEND_API_KEY;
        if (key) {
          const slotLabel = timeslot === "morning" ? "Formiddag (9–12)" : "Eftermiddag (12–16)";
          const lines = [
            `Navn: ${name}`,
            `E-mail: ${email}`,
            phone ? `Telefon: ${phone}` : null,
            company ? `Virksomhed: ${company}` : null,
            `Ønsket dato: ${preferredDate}`,
            `Tidsrum: ${slotLabel}`,
            message ? `\nBesked:\n${message}` : null,
            `\nSprog: ${lang.toUpperCase()} · Booking-id: ${id}`,
          ].filter(Boolean);
          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: FROM,
                to: [NOTIFY_TO],
                reply_to: email,
                subject: `Ny mødebooking — ${name} (${preferredDate})`,
                text: lines.join("\n"),
              }),
            });
            emailed = res.ok;
          } catch {
            emailed = false;
          }
          if (emailed) {
            await db.prepare(`UPDATE bookings SET emailed = 1 WHERE id = ?1`).bind(id).run();
          }
        }

        return Response.json({ ok: true, emailed });
      },
    },
  },
});
