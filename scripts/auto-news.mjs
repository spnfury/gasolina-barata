/**
 * Auto-News Blog Generator — Groq + Google News
 * 
 * Fetches gasoline news from Google News RSS, scrapes article content,
 * rewrites with Groq (Llama 3.3 70B) as unique SEO content,
 * and saves as blog posts in src/data/blog-posts.json.
 * 
 * Usage:  GROQ_API_KEY=gsk_... node scripts/auto-news.mjs
 *   or:   node --env-file=.env.local scripts/auto-news.mjs
 */

import fs from 'fs';
import path from 'path';

// ── Config ──
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const BLOG_FILE = path.join(process.cwd(), 'src/data/blog-posts.json');
const MAX_NEW_POSTS = 5;
const GOOGLE_NEWS_RSS =
    'https://news.google.com/rss/search?q=precio+gasolina+Espa%C3%B1a+combustible&hl=es&gl=ES&ceid=ES:es';

// ── Helpers ──

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .substring(0, 80);
}

function extractBetween(xml, tag) {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const matches = [];
    let m;
    while ((m = regex.exec(xml)) !== null) {
        matches.push(m[1].trim());
    }
    return matches;
}

function extractCdata(text) {
    const m = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    return m ? m[1].trim() : text.replace(/<[^>]+>/g, '').trim();
}

function decodeHtmlEntities(text) {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
}

// ── Step 1: Fetch RSS ──

async function fetchRssItems(limit = 10) {
    console.log('📡 Fetching Google News RSS...');
    const res = await fetch(GOOGLE_NEWS_RSS);
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const xml = await res.text();

    const itemBlocks = xml.split('<item>').slice(1);
    const items = [];

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

    // Sort by date descending
    items.sort((a, b) => {
        const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return db - da;
    });

    console.log(`  ✓ Found ${items.length} news items`);
    return items;
}

// ── Step 2: Scrape article content ──

async function scrapeArticle(url) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            },
            redirect: 'follow',
        });
        clearTimeout(timeout);

        if (!res.ok) return { text: '', image: '' };

        const html = await res.text();

        // Extract og:image
        let image = '';
        const ogMatch =
            html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        if (ogMatch && ogMatch[1] && !ogMatch[1].includes('lh3.googleusercontent.com')) {
            image = ogMatch[1];
        }

        // Extract text from <p> tags
        const paragraphs = [];
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        let m;
        while ((m = pRegex.exec(html)) !== null) {
            const clean = m[1]
                .replace(/<[^>]+>/g, '') // strip inner HTML
                .replace(/&[a-z]+;/gi, ' ') // strip entities
                .replace(/\s+/g, ' ')
                .trim();
            if (clean.length > 40) {
                paragraphs.push(clean);
            }
        }

        const text = paragraphs.slice(0, 15).join('\n\n');
        return { text, image };
    } catch {
        return { text: '', image: '' };
    }
}

// ── Step 3: Rewrite with Groq ──

async function rewriteWithGroq(originalTitle, originalText, sourceName) {
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');

    const hasContent = originalText && originalText.length > 100;

    const systemPrompt = `Eres un periodista experto en energía y carburantes en España. 
Tu misión es crear artículos originales sobre precios de gasolina y diésel para un blog de consumo español.

REGLAS ESTRICTAS:
- Escribe SIEMPRE en español de España
- Crea contenido 100% ORIGINAL basado en el tema de la noticia
- Enfoque: cómo afecta al consumidor español, consejos prácticos para ahorrar
- Tono: informativo pero cercano, como un amigo experto
- Longitud: 400-600 palabras de contenido
- Formato: Markdown con ## para subtítulos (sin poner # para el título principal)
- Incluye datos reales actualizados sobre el mercado energético español cuando sea posible
- Incluye 1 CTA natural mencionando la app RadarGas como herramienta para encontrar gasolineras baratas
- Al final del contenido, añade esta nota EXACTA: "\n\n---\n\n📱 **¿Quieres encontrar la gasolinera más barata cerca de ti?** Descarga [RadarGas](https://radargas.com) gratis y empieza a ahorrar hoy."

Responde SOLO con un JSON válido con esta estructura:
{
  "title": "Título SEO optimizado (máx 65 chars)",
  "excerpt": "Resumen de 1-2 frases para meta description (máx 155 chars)",
  "content": "Contenido completo en Markdown",
  "category": "Precios|Tendencias|Ahorro|Análisis"
}`;

    let userPrompt;
    if (hasContent) {
        userPrompt = `Crea un artículo original inspirado en esta noticia. Fuente: ${sourceName}

TÍTULO DE LA NOTICIA: ${originalTitle}

CONTEXTO DEL ARTÍCULO ORIGINAL:
${originalText.substring(0, 3000)}`;
    } else {
        userPrompt = `Crea un artículo original sobre el siguiente tema de actualidad energética en España.
Básate en el titular para desarrollar el tema con profundidad y datos relevantes.

Fuente original: ${sourceName}
TITULAR: ${originalTitle}

Desarrolla este tema con contexto sobre el mercado energético español actual, impacto en el consumidor, y consejos prácticos.`;
    }

    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Groq API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('Empty Groq response');

    return JSON.parse(content);
}

// ── Main ──

async function main() {
    console.log('🤖 Auto-News Blog Generator (Groq + Google News)\n');

    if (!GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY not set. Pass it as env var or use --env-file=.env.local');
        process.exit(1);
    }

    // Load existing posts
    let existingPosts = [];
    if (fs.existsSync(BLOG_FILE)) {
        try {
            existingPosts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
            if (!Array.isArray(existingPosts)) existingPosts = [];
        } catch {
            existingPosts = [];
        }
    }

    const existingUrls = new Set(existingPosts.map(p => p.sourceUrl));
    console.log(`📚 ${existingPosts.length} existing posts loaded\n`);

    // Fetch RSS
    const rssItems = await fetchRssItems(MAX_NEW_POSTS * 2);

    // Filter out already-processed items
    const newItems = rssItems.filter(item => !existingUrls.has(item.link));
    console.log(`🆕 ${newItems.length} new articles to process\n`);

    if (newItems.length === 0) {
        console.log('✅ No new articles. Done!');
        return;
    }

    const toProcess = newItems.slice(0, MAX_NEW_POSTS);
    let generated = 0;

    for (const item of toProcess) {
        try {
            console.log(`\n📰 Processing: "${item.title.substring(0, 60)}..."`);

            // Scrape (best-effort — falls back to headline-only if scraping fails)
            console.log('   🔍 Scraping article...');
            const { text, image } = await scrapeArticle(item.link);

            if (text.length < 100) {
                console.log('   ℹ️  Limited scrape — will generate from headline');
            } else {
                console.log(`   ✓ Scraped ${text.length} chars`);
            }

            // Rewrite with Groq
            console.log('   🤖 Rewriting with Groq (Llama 3.3)...');
            const rewritten = await rewriteWithGroq(item.title, text, item.source);

            // Build post object
            const slug = slugify(rewritten.title) + '-' + Date.now().toString(36);
            const post = {
                slug,
                title: rewritten.title,
                excerpt: rewritten.excerpt,
                content: rewritten.content,
                category: rewritten.category || 'Precios',
                coverImage: image || '',
                sourceUrl: item.link,
                sourceName: item.source,
                publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                generatedAt: new Date().toISOString(),
            };

            existingPosts.unshift(post); // newest first
            generated++;
            console.log(`   ✅ Generated: "${rewritten.title}"`);

            // Small delay to respect Groq rate limits
            await new Promise(r => setTimeout(r, 1000));

        } catch (err) {
            console.error(`   ❌ Error processing "${item.title.substring(0, 40)}...":`, err.message);
        }
    }

    // Keep only the last 50 posts (to prevent unlimited growth)
    if (existingPosts.length > 50) {
        existingPosts = existingPosts.slice(0, 50);
    }

    // Save
    const dir = path.dirname(BLOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BLOG_FILE, JSON.stringify(existingPosts, null, 2));

    console.log(`\n✅ Done! Generated ${generated} new posts. Total: ${existingPosts.length} posts.`);
    console.log(`📁 Saved to: ${BLOG_FILE}`);
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
