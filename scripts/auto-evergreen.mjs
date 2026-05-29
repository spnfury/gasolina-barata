/**
 * Auto-Evergreen Blog Generator — Groq
 *
 * Genera posts SEO evergreen sobre topics de alta intención comercial
 * relacionados con gasolina/diésel en España. Dedupe por slug.
 *
 * Uso: GROQ_API_KEY=gsk_... node scripts/auto-evergreen.mjs
 */

import fs from 'fs';
import path from 'path';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_EVERGREEN_MODEL || 'llama-3.1-8b-instant';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const BLOG_FILE = path.join(process.cwd(), 'src/data/blog-posts.json');
const MAX_NEW_POSTS = parseInt(process.env.MAX_EVERGREEN_POSTS || '3', 10);

const TOPICS = [
    { slug: 'como-ahorrar-300-euros-al-ano-en-gasolina', title: 'Cómo ahorrar 300 € al año en gasolina: guía definitiva', keyword: 'cómo ahorrar gasolina', category: 'Ahorro' },
    { slug: 'diesel-vs-gasolina-95-cual-conviene', title: 'Diésel vs gasolina 95: cuál te conviene en 2026', keyword: 'diésel o gasolina', category: 'Comparativa' },
    { slug: 'gasolineras-low-cost-espana-son-seguras', title: 'Gasolineras low cost en España: ¿son seguras y de calidad?', keyword: 'gasolineras low cost', category: 'Análisis' },
    { slug: 'mejor-momento-del-dia-para-repostar', title: 'El mejor momento del día y de la semana para repostar gasolina', keyword: 'cuándo repostar más barato', category: 'Trucos' },
    { slug: 'como-calcular-consumo-real-coche', title: 'Cómo calcular el consumo real de tu coche en 5 pasos', keyword: 'calcular consumo coche', category: 'Guía' },
    { slug: 'glp-autogas-cuanto-ahorra', title: 'Qué es el GLP autogas y cuánto ahorra realmente al año', keyword: 'GLP autogas', category: 'Análisis' },
    { slug: 'trucos-conducir-gastar-menos-gasolina', title: '10 trucos para conducir y gastar menos gasolina', keyword: 'conducir ahorrar gasolina', category: 'Trucos' },
    { slug: 'diferencia-gasolina-95-98-premium', title: 'Diferencia entre gasolina 95, 98 y Premium: cuál conviene', keyword: 'gasolina 95 vs 98', category: 'Guía' },
    { slug: 'diesel-b7-b10-explicacion', title: '¿Qué es el Diésel B7 y B10? Guía completa 2026', keyword: 'diésel B7 B10', category: 'Guía' },
    { slug: 'repsol-vs-cepsa-vs-bp-precios', title: 'Repsol vs Cepsa vs BP: comparativa de precios 2026', keyword: 'comparativa marcas gasolineras', category: 'Comparativa' },
    { slug: 'plenoil-ballenoil-petroprix-ranking', title: 'Plenoil, Ballenoil y Petroprix: ranking de gasolineras low cost', keyword: 'plenoil vs ballenoil', category: 'Comparativa' },
    { slug: 'por-que-gasolina-sube-en-verano', title: 'Por qué la gasolina sube en verano: explicación con datos', keyword: 'precio gasolina verano', category: 'Análisis' },
    { slug: 'impuestos-carburante-espana-desglose', title: 'Impuestos al carburante en España: desglose completo 2026', keyword: 'impuestos gasolina España', category: 'Análisis' },
    { slug: 'como-afecta-brent-precio-gasolina', title: 'Cómo afecta el precio del Brent al precio de la gasolina en España', keyword: 'brent gasolina', category: 'Análisis' },
    { slug: 'electrico-vs-combustion-coste-100km', title: 'Coche eléctrico vs combustión: comparativa coste por 100 km', keyword: 'eléctrico vs gasolina coste', category: 'Comparativa' },
    { slug: 'provincias-mas-caras-mas-baratas-gasolina', title: 'Provincias más caras y más baratas para repostar en España', keyword: 'provincia gasolina barata', category: 'Análisis' },
    { slug: 'gasolineras-24-horas-donde-encontrar', title: 'Gasolineras 24 horas en España: dónde encontrar las abiertas hoy', keyword: 'gasolineras 24 horas', category: 'Guía' },
    { slug: 'tarjetas-descuento-gasolinera-comparativa', title: 'Tarjetas de descuento de gasolinera: comparativa y cuál te ahorra más', keyword: 'tarjeta descuento gasolinera', category: 'Comparativa' },
    { slug: 'precio-gasolina-autopista-vs-pueblo', title: 'Por qué cuesta más la gasolina en autopista que en pueblo', keyword: 'gasolina autopista pueblo', category: 'Análisis' },
    { slug: 'bonificacion-gasolina-ayudas-vigentes', title: 'Bonificación de gasolina: ayudas y subvenciones vigentes en España', keyword: 'bonificación gasolina', category: 'Guía' },
    { slug: 'repostar-andorra-ahorras-o-no', title: 'Repostar en Andorra: ¿ahorras realmente cruzando la frontera?', keyword: 'gasolina Andorra', category: 'Análisis' },
    { slug: 'gasolina-barata-portugal-frontera', title: 'Gasolina barata en Portugal: comparativa frontera y rutas', keyword: 'gasolina Portugal', category: 'Comparativa' },
    { slug: 'tipos-de-gasolinera-cooperativa-hipermercado', title: 'Tipos de gasolinera: cooperativa, hipermercado y marca blanca', keyword: 'tipos de gasolinera', category: 'Guía' },
    { slug: 'mantenimiento-coche-reducir-consumo', title: 'Mantenimiento del coche para reducir el consumo de gasolina', keyword: 'mantenimiento ahorrar gasolina', category: 'Trucos' },
    { slug: 'apps-ahorrar-gasolina-comparativa', title: 'Apps para ahorrar en gasolina: comparativa de las mejores en España', keyword: 'app gasolina barata', category: 'Comparativa' },
    { slug: 'dia-semana-mas-barato-repostar', title: 'Qué día de la semana es más barato repostar gasolina en España', keyword: 'día barato gasolina', category: 'Trucos' },
    { slug: 'estaciones-sin-atendente-como-funcionan', title: 'Gasolineras desatendidas: cómo funcionan y son más baratas', keyword: 'gasolinera desatendida', category: 'Guía' },
    { slug: 'previsiones-precio-gasolina-2026', title: 'Previsiones del precio de la gasolina y diésel en 2026', keyword: 'precio gasolina 2026', category: 'Análisis' },
    { slug: 'consumo-cilindrada-marca-coche', title: 'Cuánto gasta cada marca de coche: ranking por cilindrada', keyword: 'consumo coche por marca', category: 'Comparativa' },
    { slug: 'aire-acondicionado-vs-ventanilla-consumo', title: 'Aire acondicionado vs ventanilla bajada: qué gasta menos gasolina', keyword: 'aire acondicionado consumo', category: 'Trucos' },
];

const NEWS_FALLBACK_IMG = 'https://images.unsplash.com/photo-1611431386239-37e389735c52?w=1200&h=600&fit=crop&q=80';

function slugify(text) {
    return text.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

async function generatePost(topic) {
    const system = `Eres un redactor SEO experto en gasolina, diésel y movilidad en España. Escribes en español neutro, claro y útil. Datos reales y verificables. Tono cercano pero serio. NO usas emojis. NO empiezas con "En este artículo".`;

    const user = `Escribe un artículo SEO completo titulado "${topic.title}" para el blog gasolinabarata.org.

Requisitos:
- Keyword principal: "${topic.keyword}"
- Longitud: 800-1100 palabras
- Formato Markdown
- Estructura: introducción (sin H1, parte directo en párrafo), 4-6 secciones H2 con título descriptivo, opcionalmente H3 dentro
- Incluye al menos 1 lista bullet o numerada
- Incluye al menos 1 tabla Markdown con datos comparativos cuando aplique
- Cierra con sección H2 "Conclusión" + CTA mencionando la app RadarGas
- 2-3 enlaces internos a: [/calculadora-ahorro](/calculadora-ahorro), [/cerca-de-mi](/cerca-de-mi), o /precio-gasolina/{provincia} (ej: madrid, barcelona)
- Sin claims falsos. Si no hay dato exacto, usa rangos razonables.

Devuelve SOLO JSON válido con esta estructura:
{
  "excerpt": "Resumen de 140-160 caracteres, gancho claro",
  "content": "Markdown completo del post"
}`;

    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: GROQ_MODEL,
            response_format: { type: 'json_object' },
            messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
            temperature: 0.7,
            max_tokens: 4000,
        }),
    });
    if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const json = JSON.parse(data.choices[0].message.content);
    if (!json.excerpt || !json.content) throw new Error('Respuesta Groq sin excerpt/content');
    return json;
}

async function main() {
    if (!GROQ_API_KEY) {
        console.log('⚠ GROQ_API_KEY ausente, salto evergreen');
        return;
    }

    let blog = [];
    try {
        blog = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf-8'));
    } catch (_) {
        blog = [];
    }

    const existingSlugs = new Set(blog.map((p) => p.slug));
    const pending = TOPICS.filter((t) => !existingSlugs.has(t.slug));

    if (pending.length === 0) {
        console.log('✅ Todos los topics evergreen ya generados');
        return;
    }

    const toGenerate = pending.slice(0, MAX_NEW_POSTS);
    console.log(`✍ Generando ${toGenerate.length} posts evergreen (quedan ${pending.length - toGenerate.length} tras este run)`);

    const now = new Date().toISOString();
    let created = 0;

    for (const topic of toGenerate) {
        try {
            console.log(`  → ${topic.title}`);
            const { excerpt, content } = await generatePost(topic);
            blog.push({
                slug: topic.slug,
                title: topic.title,
                excerpt,
                content,
                category: topic.category,
                coverImage: NEWS_FALLBACK_IMG,
                sourceUrl: '',
                sourceName: 'Gasolina Barata',
                publishedAt: now,
                generatedAt: now,
            });
            created++;
            // Espacio para evitar rate limit Groq
            await new Promise((r) => setTimeout(r, 1500));
        } catch (e) {
            console.error(`  ✘ Falló ${topic.slug}:`, e.message);
        }
    }

    if (created > 0) {
        fs.writeFileSync(BLOG_FILE, JSON.stringify(blog, null, 2));
        console.log(`✅ ${created} posts evergreen añadidos. Total blog: ${blog.length}`);
    }
}

main().catch((e) => {
    console.error('❌ auto-evergreen falló:', e);
    process.exit(1);
});
