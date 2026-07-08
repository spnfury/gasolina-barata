import { MetadataRoute } from 'next';
import locationsData from '@/data/locations.json';
import blogPostsData from '@/data/blog-posts.json';
import { SUPPORTED_BRANDS, brandProvinces } from '@/lib/brands';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://gasolinabarata.org';

    const dataLastModified = (locationsData as any).lastUpdated
        ? new Date((locationsData as any).lastUpdated)
        : new Date();

    const sitemapEntries: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: dataLastModified,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/precio-gasolina-hoy`,
            lastModified: dataLastModified,
            changeFrequency: 'daily',
            priority: 0.95,
        },
        {
            url: `${baseUrl}/mapa-precios-espana`,
            lastModified: dataLastModified,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/gasolineras-low-cost`,
            lastModified: dataLastModified,
            changeFrequency: 'daily',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/gasolineras-24-horas`,
            lastModified: dataLastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/cerca-de-mi`,
            lastModified: dataLastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: dataLastModified,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/calculadora-ahorro`,
            lastModified: new Date('2026-04-12'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/aviso-legal`,
            lastModified: new Date('2026-05-28'),
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${baseUrl}/politica-privacidad`,
            lastModified: new Date('2026-05-28'),
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${baseUrl}/politica-cookies`,
            lastModified: new Date('2026-05-28'),
            changeFrequency: 'yearly',
            priority: 0.2,
        },
    ];

    const BRAND_SLUGS = [
        'repsol', 'cepsa', 'galp', 'bp', 'plenoil', 'ballenoil', 'shell', 'petroprix',
        'petronor', 'avia', 'bonarea', 'esclatoil', 'q8', 'carrefour', 'campsa', 'alcampo',
        'valcarce', 'eroski', 'meroil', 'beroil', 'tamoil', 'disa', 'gasexpress', 'eni',
        'ham', 'agla', 'petromiralles', 'iberdoex', 'easygas', 'autonetoil', 'gmoil', 'petrocat',
    ];
    BRAND_SLUGS.forEach((slug) => {
        sitemapEntries.push({
            url: `${baseUrl}/marca/${slug}`,
            lastModified: dataLastModified,
            changeFrequency: 'weekly',
            priority: 0.6,
        });
    });

    // Páginas marca×provincia (solo combos reales, >= 2 estaciones)
    SUPPORTED_BRANDS.forEach((brand) => {
        brandProvinces(locationsData as any, brand, 2).forEach((p) => {
            sitemapEntries.push({
                url: `${baseUrl}/marca/${brand.slug}/${p.slug}`,
                lastModified: dataLastModified,
                changeFrequency: 'weekly',
                priority: 0.55,
            });
        });
    });

    locationsData.locations.forEach((prov: any) => {
        sitemapEntries.push({
            url: `${baseUrl}/precio-gasolina/${prov.provincia}`,
            lastModified: dataLastModified,
            changeFrequency: 'daily',
            priority: 0.7,
        });

        prov.localidades.forEach((loc: any) => {
            sitemapEntries.push({
                url: `${baseUrl}/precio-gasolina/${prov.provincia}/${loc.slug}`,
                lastModified: dataLastModified,
                changeFrequency: 'daily',
                priority: 0.5,
            });
        });
    });

    (blogPostsData as any[]).forEach((post: any) => {
        if (post.slug) {
            sitemapEntries.push({
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: post.publishedAt ? new Date(post.publishedAt) : dataLastModified,
                changeFrequency: 'monthly',
                priority: 0.6,
            });
        }
    });

    return sitemapEntries;
}
