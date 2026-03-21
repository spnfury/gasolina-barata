// RadarGas Blog — Google News RSS Feed
// Fetches latest gasoline-related news from Google News (Spain)

export interface NewsItem {
    title: string;
    link: string;
    source: string;
    pubDate: string;
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

export async function fetchNews(limit = 8): Promise<NewsItem[]> {
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

        for (const block of itemBlocks.slice(0, limit)) {
            const titles = extractBetween(block, 'title');
            const links = extractBetween(block, 'link');
            const sources = extractBetween(block, 'source');
            const pubDates = extractBetween(block, 'pubDate');

            const title = titles[0] ? decodeHtmlEntities(extractCdata(titles[0])) : '';
            const link = links[0] || '';
            const source = sources[0] ? decodeHtmlEntities(extractCdata(sources[0])) : 'Google News';
            const pubDate = pubDates[0] || '';

            if (title && link) {
                items.push({ title, link, source, pubDate });
            }
        }

        return items;
    } catch (err) {
        console.error('[News] Failed to fetch news:', err);
        return [];
    }
}
