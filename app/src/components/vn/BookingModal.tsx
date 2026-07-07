import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useLang } from "../../lib/language";

/**
 * Booking flow. `useBooking().open()` from any CTA; the modal posts to
 * /api/book which stores the request in D1 and emails a notification.
 */

const BookingContext = createContext<{ open: () => void }>({ open: () => {} });
export const useBooking = () => useContext(BookingContext);

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  company: "",
  preferredDate: "",
  timeslot: "morning",
  message: "",
  website: "", // honeypot
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  return (
    <BookingContext.Provider value={{ open }}>
      {children}
      {isOpen ? <BookingModal onClose={() => setOpen(false)} /> : null}
    </BookingContext.Provider>
  );
}

function BookingModal({ onClose }: { onClose: () => void }) {
  const { t, lang } = useLang();
  const b = t.booking;
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cardRef.current?.querySelector("input")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const update =
    (key: keyof typeof EMPTY) =>
    (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const today = new Date().toISOString().slice(0, 10);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lang }),
      });
      const data = (await res.json()) as { ok?: boolean };
      setState(res.ok && data.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="modal-veil" onClick={onClose} role="presentation">
      <div
        ref={cardRef}
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={b.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label={b.close}>
          ×
        </button>

        {state === "done" ? (
          <div className="py-10 text-center">
            <h3 className="font-display text-3xl font-semibold text-navy">{b.successTitle}</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm text-navy/70">{b.successBody}</p>
            <button type="button" className="btn btn-outline mt-8" onClick={onClose}>
              {b.close}
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-3xl font-semibold text-navy">{b.title}</h3>
            <p className="mt-2 text-sm text-navy/70">{b.intro}</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="form-label">{b.name} *</span>
                  <input required className="field" value={form.name} onChange={update("name")} autoComplete="name" />
                </label>
                <label className="block">
                  <span className="form-label">{b.email} *</span>
                  <input
                    required
                    type="email"
                    className="field"
                    value={form.email}
                    onChange={update("email")}
                    autoComplete="email"
                  />
                </label>
                <label className="block">
                  <span className="form-label">{b.phone}</span>
                  <input className="field" value={form.phone} onChange={update("phone")} autoComplete="tel" />
                </label>
                <label className="block">
                  <span className="form-label">{b.company}</span>
                  <input className="field" value={form.company} onChange={update("company")} autoComplete="organization" />
                </label>
                <label className="block">
                  <span className="form-label">{b.date} *</span>
                  <input
                    required
                    type="date"
                    min={today}
                    className="field"
                    value={form.preferredDate}
                    onChange={update("preferredDate")}
                  />
                </label>
                <label className="block">
                  <span className="form-label">{b.timeslot}</span>
                  <select className="field" value={form.timeslot} onChange={update("timeslot")}>
                    <option value="morning">{b.slots.morning}</option>
                    <option value="afternoon">{b.slots.afternoon}</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="form-label">{b.message}</span>
                <textarea rows={4} className="field" value={form.message} onChange={update("message")} />
              </label>
              {/* Honeypot — visually hidden, bots fill it, humans never see it */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={update("website")}
                className="hp-field"
                aria-hidden="true"
              />

              {state === "error" ? <p className="text-sm text-red-800/80">{b.error}</p> : null}

              <button type="submit" className="btn btn-fill w-full sm:w-auto" disabled={state === "sending"}>
                {state === "sending" ? b.sending : b.submit}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
