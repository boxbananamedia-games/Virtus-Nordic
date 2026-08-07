import { createFileRoute } from '@tanstack/react-router'
import { SITE_ORIGIN } from '../lib/site'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        // Point every host at the one sitemap on the canonical domain.
        const origin = SITE_ORIGIN
        const body = [
          'User-agent: *',
          'Allow: /',
          '',
          `Sitemap: ${origin}/sitemap.xml`,
        ].join('\n')
        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})
