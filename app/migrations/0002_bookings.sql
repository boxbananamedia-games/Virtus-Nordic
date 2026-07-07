-- Booking requests from the "Book et møde" flow. Additive only — this DB is
-- shared with production. Every booking is captured here regardless of whether
-- the notification email succeeded (see `emailed`).
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  preferred_date TEXT NOT NULL,
  timeslot TEXT NOT NULL,
  message TEXT,
  lang TEXT NOT NULL DEFAULT 'da',
  emailed INTEGER NOT NULL DEFAULT 0
);
