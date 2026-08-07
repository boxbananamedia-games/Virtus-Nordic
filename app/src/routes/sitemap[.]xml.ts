import { createFileRoute } from '@tanstack/react-router'
import { PAGES, absoluteUrl } from '../lib/site'

/** Rough relative importance, matching the old hand-written priorities. */
const PRIORITY: Record<string, string> = {
  home: '1.0',
  services: '0.9',
  apps: '0.9',
  about: '0.8',
  contact: '0.8',
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split('T')[0]

        // Every page is listed once per language, and each entry declares BOTH
        // languages as alternates — including itself, which the spec requires.
        // Listing the URLs without the alternates would leave the two editions
        // looking like duplicates of each other rather than translations.
        const urls = PAGES.flatMap((page) =>
          (['da', 'en'] as const).map((lang) =>
            [
              '  <url>',
              `    <loc>${absoluteUrl(page[lang])}</loc>`,
              `    <xhtml:link rel="alternate" hreflang="da" href="${absoluteUrl(page.da)}"/>`,
              `    <xhtml:link rel="alternate" hreflang="en" href="${absoluteUrl(page.en)}"/>`,
              `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(page.da)}"/>`,
              `    <lastmod>${today}</lastmod>`,
              '    <changefreq>weekly</changefreq>',
              `    <priority>${PRIORITY[page.key] ?? '0.7'}</priority>`,
              '  </url>',
            ].join('\n'),
          ),
        )

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
          '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...urls,
          '</urlset>',
        ].join('\n')

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
