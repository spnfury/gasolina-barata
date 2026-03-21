import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/preview/',
      ],
    },
    sitemap: 'https://gasolinabarata.es/sitemap.xml',
  };
}
