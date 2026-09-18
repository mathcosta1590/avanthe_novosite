import { site } from '../data/site.js';
import { services } from '../data/site.js';
import { projects } from '../data/projects.js';

/**
 * A landing de campanha fica fora do sitemap de propósito: ela existe para o
 * tráfego pago, não para busca orgânica, e indexá-la concorre com a página
 * institucional de reforma e retrofit.
 */
export function GET() {
  const routes = [
    { path: '/', priority: '1.0' },
    { path: '/sobre', priority: '0.8' },
    ...services.map((service) => ({ path: `/${service.slug}`, priority: '0.9' })),
    { path: '/portfolio', priority: '0.8' },
    ...projects
      .filter((project) => project.status === 'complete')
      .map((project) => ({ path: `/portfolio/${project.slug}`, priority: '0.7' })),
    { path: '/contato', priority: '0.9' },
    { path: '/recrutamento', priority: '0.4' },
    { path: '/fornecedores', priority: '0.4' },
  ];

  const today = new Date().toISOString().split('T')[0];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${site.url}${route.path === '/' ? '' : route.path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
