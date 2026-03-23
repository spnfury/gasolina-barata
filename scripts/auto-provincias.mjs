import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Env setup (for local testing, CI passes this via env)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const LOCATIONS_FILE = path.join(__dirname, '../src/data/locations.json');
const BLOG_FILE = path.join(__dirname, '../src/data/blog-posts.json');
const MAX_PROVINCES_PER_RUN = 5;

// Helper to wait to avoid rate limits
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getGroqContent(provinciaName, avg95, avgDiesel) {
    const systemPrompt = `Eres un redactor experto en SEO y motor en España para "Gasolina Barata". Hablas de forma directa y enfocada al ahorro. Respondes SIEMPRE en formato JSON válido.`;
    
    const userPrompt = `
Escribe una introducción y una conclusión para un artículo SEO sobre "Las 5 gasolineras más baratas en ${provinciaName}".
Datos actuales:
- Precio medio Gasolina 95: ${avg95}€/L
- Precio medio Diésel: ${avgDiesel}€/L

Instrucciones:
1. 'intro': Unos 2-3 párrafos animando al conductor de ${provinciaName} a ahorrar. Menciona los precios medios facilitados y la inflación.
2. 'outro': Un párrafo de cierre recordando que los precios cambian a diario y que descarguen la app gratis "RadarGas" para ver el mapa en tiempo real.
3. 'excerpt': Una meta-descripción corta de 150 caracteres.

Devuelve un JSON exacto: { "intro": "...", "outro": "...", "excerpt": "..." }
`;

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
            max_tokens: 1500,
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

function getTop5Provincia(prov) {
    let allStations = [];
    prov.localidades.forEach(loc => {
        if (loc.top5 && loc.top5.length > 0) {
            loc.top5.forEach(st => {
                allStations.push({ ...st, localidad: loc.nombre });
            });
        }
    });

    // Sort by precio95 primarily, then diesel
    const top5 = allStations
        .filter(st => st.precio95 !== null && st.precio95 > 0)
        .sort((a, b) => a.precio95 - b.precio95)
        .slice(0, 5);

    return top5;
}

function formatTable(top5) {
    let md = `| Rótulo | Localidad | Dirección | Gasolina 95 | Diésel |\n`;
    md += `|---|---|---|---|---|\n`;
    top5.forEach(st => {
        const p95 = st.precio95 ? `**${st.precio95}€**` : '-';
        const pd = st.precioDiesel ? `${st.precioDiesel}€` : '-';
        md += `| ${st.rotulo} | ${st.localidad} | ${st.direccion} | ${p95} | ${pd} |\n`;
    });
    return md;
}

async function main() {
    console.log('🚙 Auto-Provincias Blog Generator (Evergreen SEO)\n');

    if (!GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY not set. Pass it as env var or use --env-file=.env.local');
        // Do not fail hard, maybe someone runs it locally without Groq, just exit 0 so GH action doesn't crash if secret is missing
        process.exit(0);
    }

    // Load locations
    let locationsData;
    try {
        locationsData = JSON.parse(fs.readFileSync(LOCATIONS_FILE, 'utf8'));
    } catch {
        console.error('❌ No locations.json found! Run sync-miteco.mjs first.');
        process.exit(1);
    }

    // Load existing blog posts
    let blogPosts = [];
    if (fs.existsSync(BLOG_FILE)) {
        try {
            blogPosts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
        } catch {
            blogPosts = [];
        }
    }

    // Find the 5 "oldest" or uncreated provinces
    const allProvinces = locationsData.locations;
    
    // Create a map of last updated dates for provinces
    const provinceUpdatedMap = {};
    blogPosts.forEach(post => {
        if (post.slug.startsWith('gasolineras-baratas-')) {
            const provSlug = post.slug.replace('gasolineras-baratas-', '');
            provinceUpdatedMap[provSlug] = new Date(post.publishedAt || post.updatedAt).getTime();
        }
    });

    // Sort all provinces: those without posts go first, then by oldest updated date
    const sortedProvinces = [...allProvinces].sort((a, b) => {
        const timeA = provinceUpdatedMap[a.provincia] || 0;
        const timeB = provinceUpdatedMap[b.provincia] || 0;
        return timeA - timeB;
    });

    const toProcess = sortedProvinces.slice(0, MAX_PROVINCES_PER_RUN);

    for (const prov of toProcess) {
        console.log(`\n📍 Procesando provincia: ${prov.nombreProvincia} (${prov.provincia})`);
        
        const top5 = getTop5Provincia(prov);
        if (top5.length === 0) {
            console.log(`   ⏭️ Ignorada: No hay datos suficientes de gasolineras.`);
            continue;
        }

        try {
            console.log(`   🤖 Llamando a Groq para generar Intro/Outro...`);
            const groqData = await getGroqContent(prov.nombreProvincia, prov.precioMedioGasolina95, prov.precioMedioDiesel);
            
            const tableMd = formatTable(top5);
            
            // Build the full Markdown content
            const content = `${groqData.intro}\n\n## 🏆 El Top 5 de gasolineras más baratas en ${prov.nombreProvincia} hoy\n\nA continuación tienes la lista actualizada extraída en tiempo real del portal del Ministerio para la Transición Ecológica:\n\n${tableMd}\n\n${groqData.outro}\n\n> **Nota:** Los precios pueden haber variado desde la última actualización del ministerio.`;

            const slug = `gasolineras-baratas-${prov.provincia}`;
            const SEED = Math.floor(Math.random() * 10000);

            const postObj = {
                slug: slug,
                title: `Las 5 gasolineras más baratas de ${prov.nombreProvincia} esta semana`,
                excerpt: groqData.excerpt,
                content: content,
                category: 'Provincias',
                coverImage: `https://images.unsplash.com/photo-1621252178225-b04f7cd97bb8?w=1200&h=600&fit=crop&q=80&sig=${SEED}`, // Generic gas station pump or similar
                sourceUrl: `https://gasolinabarata.org/precio-gasolina/${prov.provincia}`,
                sourceName: 'RadarGas Data Team',
                publishedAt: new Date().toISOString()
            };

            // Check if post already exists to overwrite it
            const existingIndex = blogPosts.findIndex(p => p.slug === slug);
            if (existingIndex >= 0) {
                console.log(`   ✓ Actualizando post existente (Evergreen)`);
                // Keep the original publishedAt to retain SEO history, just update content and add an updatedAt field
                postObj.publishedAt = blogPosts[existingIndex].publishedAt;
                postObj.updatedAt = new Date().toISOString();
                blogPosts[existingIndex] = postObj;
            } else {
                console.log(`   ✨ Creando nuevo post SEO`);
                blogPosts.push(postObj);
            }

            // Wait 2s to respect Groq rate limits
            await wait(2000);
        } catch (e) {
            console.error(`   ❌ Fallo con ${prov.nombreProvincia}: ${e.message}`);
        }
    }

    // Save final JSON
    blogPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    fs.writeFileSync(BLOG_FILE, JSON.stringify(blogPosts, null, 2), 'utf8');
    
    console.log(`\n💾 Guardado en ${BLOG_FILE}`);
    console.log('✅ Finalizado');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
