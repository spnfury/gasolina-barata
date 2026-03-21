import { MetadataRoute } from 'next';
import locationsData from '@/data/locations.json';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://gasolinabarata.es';

    const sitemapEntries: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ];

    locationsData.locations.forEach((prov: any) => {
        // Province page
        sitemapEntries.push({
            url: `${baseUrl}/precio-gasolina/${prov.provincia}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        });

        // Locality pages
        prov.localidades.forEach((loc: any) => {
            sitemapEntries.push({
                url: `${baseUrl}/precio-gasolina/${prov.provincia}/${loc.slug}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.7,
            });
        });
    });

    return sitemapEntries;
}
