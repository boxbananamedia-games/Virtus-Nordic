-- Page views, recorded by the site itself.
--
-- Additive only — this DB is shared with production (see 0001_init.sql).
--
-- Deliberately stores NOTHING that identifies a person: no IP address, no user
-- agent string, no cookie, no session or visitor id. There is no way to link
-- two rows to the same person, which is the point — it answers "which pages are
-- read, and where do people arrive from" without collecting personal data, so
-- it needs no consent banner and no third party sees your visitors.
--
-- `referrer_host` is a HOSTNAME only, never a full URL: a full referrer can
-- carry query strings from the other site, which is exactly the kind of
-- incidental personal data worth not storing.
CREATE TABLE IF NOT EXISTS pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  path TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'da',
  -- 'mobile' | 'tablet' | 'desktop', bucketed on the client. Coarse on purpose.
  device TEXT NOT NULL DEFAULT 'desktop',
  -- Hostname of the referring site, or NULL for direct / unknown.
  referrer_host TEXT
);

CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON pageviews (created_at);
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON pageviews (path);
