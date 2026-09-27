import { CAPITULOS } from '#shared/biblioteca'
import { LEVELS } from '#shared/levels'

const SITE_URL = 'https://rust-quest-2d-one.vercel.app'

const STATIC_ROUTES: string[] = [
  '/',
  '/mapa',
  '/biblioteca',
  '/login',
  '/registro',
]

/** Páginas utilitárias de conta ficam fora do índice (noindex na meta). */
export default defineEventHandler((event) => {
  const urls = [
    ...STATIC_ROUTES,
    ...LEVELS.map(l => `/nivel/${l.id}`),
    ...CAPITULOS.map(c => `/biblioteca/${c.slug}`),
  ]

  const body = urls.map(path =>
    `  <url><loc>${SITE_URL}${path}</loc></url>`,
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})
