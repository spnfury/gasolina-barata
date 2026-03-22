// RadarGas Blog — Google News RSS Feed
// Fetches latest gasoline-related news from Google News (Spain)

export interface NewsItem {
    title: string;
    link: string;
    source: string;
    pubDate: string;
    imageUrl: string;
}

const GOOGLE_NEWS_RSS =
    'https://news.google.com/rss/search?q=precio+gasolina+Espa%C3%B1a+combustible&hl=es&gl=ES&ceid=ES:es';

function extractBetween(xml: string, tag: string): string[] {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const matches: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(xml)) !== null) {
        matches.push(m[1].trim());
    }
    return matches;
}

function extractCdata(text: string): string {
    const m = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    return m ? m[1].trim() : text.replace(/<[^>]+>/g, '').trim();
}

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
}

/**
 * Try to extract og:image from an article URL.
 * For Google News links, follows the redirect to the actual article.
 * Returns the image URL or empty string on failure.
 */
async function fetchOgImage(url: string): Promise<string> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        // For Google News redirect links, follow to the actual article
        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            redirect: 'follow',
        });
        clearTimeout(timeout);

        if (!res.ok) return '';

        const html = await res.text();

        // Try og:image meta tag
        const ogMatch =
            html.match(
                /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
            ) ||
            html.match(
                /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
            );

        if (ogMatch && ogMatch[1]) {
            const img = ogMatch[1];
            // Skip Google's own generic images
            if (!img.includes('lh3.googleusercontent.com')) {
                return img;
            }
        }

        // Fallback: twitter:image
        const twMatch =
            html.match(
                /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
            ) ||
            html.match(
                /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i
            );

        if (twMatch && twMatch[1]) {
            const img = twMatch[1];
            if (!img.includes('lh3.googleusercontent.com')) {
                return img;
            }
        }

        return '';
    } catch {
        return '';
    }
}

export async function fetchNews(limit = 6): Promise<NewsItem[]> {
    try {
        const res = await fetch(GOOGLE_NEWS_RSS, {
            next: { revalidate: 3600 },
        } as RequestInit);

        if (!res.ok) {
            console.warn(`[News] Google News RSS error: ${res.status}`);
            return [];
        }

        const xml = await res.text();

        // Split by <item> blocks
        const itemBlocks = xml.split('<item>').slice(1); // skip preamble

        const items: NewsItem[] = [];

        for (const block of itemBlocks.slice(0, limit * 2)) {
            const titles = extractBetween(block, 'title');
            const links = extractBetween(block, 'link');
            const sources = extractBetween(block, 'source');
            const pubDates = extractBetween(block, 'pubDate');

            const title = titles[0] ? decodeHtmlEntities(extractCdata(titles[0])) : '';
            const link = links[0] || '';
            const source = sources[0] ? decodeHtmlEntities(extractCdata(sources[0])) : 'Google News';
            const pubDate = pubDates[0] || '';

            if (title && link) {
                items.push({ title, link, source, pubDate, imageUrl: '' });
            }
        }

        // Sort by date descending (most recent first)
        items.sort((a, b) => {
            const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
            const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
            return db - da;
        });

        // Take only the top `limit` items
        const sorted = items.slice(0, limit);

        // Fetch OG images in parallel (with fallback)
        const withImages = await Promise.all(
            sorted.map(async (item) => {
                const imageUrl = await fetchOgImage(item.link);
                return { ...item, imageUrl };
            })
        );

        return withImages;
    } catch (err) {
        console.error('[News] Failed to fetch news:', err);
        return [];
    }
}
