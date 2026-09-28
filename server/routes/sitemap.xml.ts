import { CAPITULOS } from '#shared/biblioteca'
import { LEVELS } from '#shared/levels'

const SITE_URL = 'https://rust-quest-2d-one.vercel.app'

/**
 * Última data em que o conteúdo indexável mudou (capítulos, descrições, níveis).
 * O `<lastmod>` é o que dá ao Google um motivo para re-crawl — atualizar a cada
 * entrega de conteúdo.
 */
const ATUALIZADO_EM = '2026-09-28'

/**
 * Só páginas de conteúdo entram aqui. `/login` e `/registro` ficam de fora
 * de propósito: são páginas de utilidade com `noindex` (ver `app/pages/`),
 * e uma URL com `noindex` dentro do sitemap é sinal contraditório.
 */
const STATIC_ROUTES: string[] = [
  '/',
  '/mapa',
  '/biblioteca',
]

export default defineEventHandler((event) => {
  const urls = [
    ...STATIC_ROUTES,
    ...LEVELS.map(l => `/nivel/${l.id}`),
    ...CAPITULOS.map(c => `/biblioteca/${c.slug}`),
  ]

  const body = urls.map(path =>
    `  <url><loc>${SITE_URL}${path}</loc><lastmod>${ATUALIZADO_EM}</lastmod></url>`,
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})
