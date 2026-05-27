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
        '/blog/*.env*',
        '/blog/*.php*',
        '/*.env*',
        '/*.php*',
      ],
    },
    sitemap: 'https://gasolinabarata.org/sitemap.xml',
  };
}
