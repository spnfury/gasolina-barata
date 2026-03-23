import { MetadataRoute } from 'next';
import locationsData from '@/data/locations.json';
import blogPostsData from '@/data/blog-posts.json';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://gasolinabarata.org';

    const sitemapEntries: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/calculadora-ahorro`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];

    // Province & locality pages
    locationsData.locations.forEach((prov: any) => {
        sitemapEntries.push({
            url: `${baseUrl}/precio-gasolina/${prov.provincia}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        });

        prov.localidades.forEach((loc: any) => {
            sitemapEntries.push({
                url: `${baseUrl}/precio-gasolina/${prov.provincia}/${loc.slug}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.7,
            });
        });
    });

    // Blog posts
    (blogPostsData as any[]).forEach((post: any) => {
        if (post.slug) {
            sitemapEntries.push({
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.6,
            });
        }
    });

    return sitemapEntries;
}
