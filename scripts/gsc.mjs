/**
 * Google Search Console — Toolkit API (sin dependencias)
 *
 * Auth: Service Account (JWT RS256 firmado con node:crypto → OAuth2 token).
 * NO usa googleapis. Solo fetch nativo + crypto.
 *
 * Propiedad = DOMINIO → siteUrl = "sc-domain:gasolinabarata.org"
 *
 * ── Setup (una vez) ──
 *   1. Google Cloud → habilitar "Google Search Console API" (+ "Indexing API" si usas index)
 *   2. Crear Service Account → clave JSON
 *   3. GSC → Ajustes → Usuarios → añadir <sa>@<proj>.iam.gserviceaccount.com
 *        · Lectura basta para: pull / inspect
 *        · sitemap: rol Completo
 *        · index (Indexing API): rol Propietario
 *   4. Guardar la clave JSON y apuntar GSC_SA_KEY a su ruta (o pegar el JSON en GSC_SA_JSON)
 *
 * ── Env ──
 *   GSC_SA_KEY      Ruta al JSON del service account   (ó)
 *   GSC_SA_JSON     Contenido JSON del service account (string)
 *   GSC_SITE        siteUrl. Default: sc-domain:gasolinabarata.org
 *
 * ── Uso ──
 *   node --env-file=.env.local scripts/gsc.mjs pull    [--days 28] [--dim query,page] [--rows 5000]
 *   node --env-file=.env.local scripts/gsc.mjs sitemap [https://gasolinabarata.org/sitemap.xml]
 *   node --env-file=.env.local scripts/gsc.mjs inspect [url1 url2 ...]   (ó lee sitemap si vacío)
 *   node --env-file=.env.local scripts/gsc.mjs index   <url1> [url2 ...] [--delete]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ── Config ──
const SITE = process.env.GSC_SITE || 'sc-domain:gasolinabarata.org';
const SITE_ENC = encodeURIComponent(SITE);
const ORIGIN = 'https://gasolinabarata.org';
const DATA_DIR = path.join(process.cwd(), 'src/data');
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ── Auth (JWT service account → access_token) ──
function loadSA() {
    if (process.env.GSC_SA_JSON) return JSON.parse(process.env.GSC_SA_JSON);
    const keyPath = process.env.GSC_SA_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!keyPath) throw new Error('Falta GSC_SA_KEY (ruta) o GSC_SA_JSON (contenido) del service account');
    if (!fs.existsSync(keyPath)) throw new Error(`No existe la clave del service account: ${keyPath}`);
    return JSON.parse(fs.readFileSync(keyPath, 'utf8'));
}

const b64url = (buf) =>
    Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

let _token = null;
async function getToken(scopes) {
    if (_token && _token.exp > Date.now() / 1000 + 60 && _token.scopes === scopes) return _token.value;
    const sa = loadSA();
    const now = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claim = b64url(
        JSON.stringify({
            iss: sa.client_email,
            scope: scopes,
            aud: TOKEN_URL,
            iat: now,
            exp: now + 3600,
        })
    );
    const signature = b64url(
        crypto.sign('RSA-SHA256', Buffer.from(`${header}.${claim}`), sa.private_key)
    );
    const assertion = `${header}.${claim}.${signature}`;

    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion,
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`OAuth falló: ${res.status} ${JSON.stringify(data)}`);
    _token = { value: data.access_token, exp: now + data.expires_in, scopes };
    return data.access_token;
}

async function api(url, { method = 'GET', body, scopes } = {}) {
    const token = await getToken(scopes || 'https://www.googleapis.com/auth/webmasters');
    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(`${method} ${url} → ${res.status} ${text}`);
    return data;
}

// ── Helpers ──
const argFlag = (args, name, def) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const iso = (d) => d.toISOString().split('T')[0];

async function sitemapUrls() {
    const res = await fetch(`${ORIGIN}/sitemap.xml`);
    const xml = await res.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

// ── Comando: pull (Search Analytics) ──
async function cmdPull(args) {
    const days = parseInt(argFlag(args, 'days', '28'), 10);
    const rowLimit = parseInt(argFlag(args, 'rows', '5000'), 10);
    const dimensions = argFlag(args, 'dim', 'query,page').split(',').map((s) => s.trim());

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    console.log(`📊 Search Analytics · ${SITE} · ${iso(start)} → ${iso(end)} · dim=[${dimensions}]`);
    const data = await api(
        `https://www.googleapis.com/webmasters/v3/sites/${SITE_ENC}/searchAnalytics/query`,
        {
            method: 'POST',
            body: {
                startDate: iso(start),
                endDate: iso(end),
                dimensions,
                rowLimit,
                dataState: 'all',
            },
        }
    );

    const rows = data.rows || [];
    const totals = rows.reduce(
        (a, r) => ({ clicks: a.clicks + r.clicks, impressions: a.impressions + r.impressions }),
        { clicks: 0, impressions: 0 }
    );
    const out = {
        site: SITE,
        range: { start: iso(start), end: iso(end), days },
        dimensions,
        generatedAt: new Date().toISOString(),
        totals: {
            clicks: totals.clicks,
            impressions: totals.impressions,
            ctr: totals.impressions ? +(totals.clicks / totals.impressions).toFixed(4) : 0,
        },
        rows: rows.map((r) => ({
            keys: r.keys,
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: +(r.ctr).toFixed(4),
            position: +(r.position).toFixed(2),
        })),
    };

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const file = path.join(DATA_DIR, 'gsc-performance.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2));
    console.log(`✅ ${rows.length} filas · clicks=${totals.clicks} impresiones=${totals.impressions}`);
    console.log(`💾 ${file}`);

    console.log('\n🔝 Top 10 por clicks:');
    out.rows
        .slice()
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10)
        .forEach((r, i) =>
            console.log(`  ${i + 1}. [${r.clicks}c ${r.impressions}i p${r.position}] ${r.keys.join(' · ')}`)
        );
}

// ── Comando: sitemap (enviar) ──
async function cmdSitemap(args) {
    const sitemap = args[0] || `${ORIGIN}/sitemap.xml`;
    console.log(`🗺️  Enviando sitemap → ${sitemap}`);
    await api(
        `https://www.googleapis.com/webmasters/v3/sites/${SITE_ENC}/sitemaps/${encodeURIComponent(sitemap)}`,
        { method: 'PUT' }
    );
    // Leer estado tras enviar
    const info = await api(
        `https://www.googleapis.com/webmasters/v3/sites/${SITE_ENC}/sitemaps/${encodeURIComponent(sitemap)}`
    );
    console.log(`✅ Enviado. Última descarga: ${info.lastDownloaded || '—'} · errores: ${info.errors || 0} · avisos: ${info.warnings || 0}`);
}

// ── Comando: inspect (URL Inspection) ──
async function cmdInspect(args) {
    let urls = args.filter((a) => a.startsWith('http'));
    if (!urls.length) {
        console.log('🔎 Sin URLs → tomo primeras 20 del sitemap.xml');
        urls = (await sitemapUrls()).slice(0, 20);
    }
    console.log(`🔎 Inspeccionando ${urls.length} URLs...`);
    const problems = [];
    for (const url of urls) {
        try {
            const data = await api(
                'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
                {
                    method: 'POST',
                    body: { inspectionUrl: url, siteUrl: SITE, languageCode: 'es-ES' },
                }
            );
            const r = data.inspectionResult?.indexStatusResult || {};
            const verdict = r.verdict || '?';
            const coverage = r.coverageState || '?';
            const ok = verdict === 'PASS';
            console.log(`  ${ok ? '✅' : '⚠️ '} [${verdict}] ${coverage} · ${url}`);
            if (!ok) problems.push({ url, verdict, coverage, robots: r.robotsTxtState, indexing: r.indexingState });
        } catch (e) {
            console.log(`  ❌ ${url} → ${e.message.slice(0, 120)}`);
            problems.push({ url, error: e.message.slice(0, 200) });
        }
    }
    console.log(`\n📋 ${problems.length}/${urls.length} con problemas.`);
    if (problems.length) {
        const file = path.join(DATA_DIR, 'gsc-inspect-problems.json');
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(file, JSON.stringify({ generatedAt: new Date().toISOString(), problems }, null, 2));
        console.log(`💾 ${file}`);
        process.exitCode = 2; // señal para cron/alertas
    }
}

// ── Comando: index (Indexing API) ──
async function cmdIndex(args) {
    const del = args.includes('--delete');
    const urls = args.filter((a) => a.startsWith('http'));
    if (!urls.length) throw new Error('index requiere al menos una URL');
    const type = del ? 'URL_DELETED' : 'URL_UPDATED';
    console.log(`📤 Indexing API · ${type} · ${urls.length} URLs`);
    console.log('   ⚠️  Oficialmente solo JobPosting/BroadcastEvent. Uso general = best-effort.');
    for (const url of urls) {
        try {
            await api('https://indexing.googleapis.com/v3/urlNotifications:publish', {
                method: 'POST',
                scopes: 'https://www.googleapis.com/auth/indexing',
                body: { url, type },
            });
            console.log(`  ✅ ${url}`);
        } catch (e) {
            console.log(`  ❌ ${url} → ${e.message.slice(0, 140)}`);
        }
    }
}

// ── Router ──
const [cmd, ...rest] = process.argv.slice(2);
const commands = { pull: cmdPull, sitemap: cmdSitemap, inspect: cmdInspect, index: cmdIndex };

if (!commands[cmd]) {
    console.log('Uso: node scripts/gsc.mjs <pull|sitemap|inspect|index> [opciones]');
    process.exit(cmd ? 1 : 0);
}

commands[cmd](rest).catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
});
