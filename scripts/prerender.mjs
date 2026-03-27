import fs from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');
const siteUrl = (process.env.VITE_SITE_URL || 'https://elmowared.com').replace(/\/$/, '');

const routes = [
  {
    route: '/',
    title: 'Elmowared | بوابة التوريد الذكية',
    description: 'بوابة التوريد الذكية للوصول إلى شبكة معتمدة من المصانع والموزعين ومقارنة أفضل العروض في منصة واحدة.'
  },
  {
    route: '/about-us',
    title: 'ماذا عنا | Elmowared',
    description: 'تعرّف على منصة Elmowared، وكيف تربط المشترين بالموردين وتبسط التوريد وإدارة طلبات العروض.'
  },
  {
    route: '/contact-us',
    title: 'تواصل معنا | Elmowared',
    description: 'تواصل مع فريق Elmowared للحصول على الدعم أو الاستفسارات التجارية ومتابعة فرص التوريد.'
  },
  {
    route: '/products',
    title: 'المنتجات | Elmowared',
    description: 'استكشف المنتجات المعتمدة على منصة Elmowared وقارن الأسعار والحد الأدنى للطلب وابدأ الاستفسار مباشرة.'
  },
  {
    route: '/rfq',
    title: 'طلبات العروض | Elmowared',
    description: 'تابع طلبات العروض المفتوحة على Elmowared واكتشف فرص الشراء والتوريد في منصة واحدة.'
  }
];

const toAbsolute = (route) => `${siteUrl}${route}`;

const injectSeo = (html, { route, title, description }) => {
  const canonical = toAbsolute(route);
  const seoTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
  `;

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, seoTags)
    .replace(/<meta\s+name="description"[\s\S]*?>/i, '');
};

const ensureRouteHtml = async (html, config) => {
  const targetDir = config.route === '/' ? distDir : path.join(distDir, config.route.replace(/^\//, ''));
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, 'index.html'), injectSeo(html, config), 'utf8');
};

const main = async () => {
  const baseHtml = await fs.readFile(indexPath, 'utf8');
  await Promise.all(routes.map((config) => ensureRouteHtml(baseHtml, config)));
};

main().catch((error) => {
  console.error('[prerender]', error);
  process.exit(1);
});
