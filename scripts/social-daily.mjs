/**
 * Social Daily — Publicador automático de dato del día
 *
 * Lee locations.json, calcula el dato del día (precio medio nacional,
 * provincia más barata/cara) y publica en Twitter/X y/o Bluesky.
 *
 * Env opcionales:
 *   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET  → publica en X
 *   BSKY_HANDLE, BSKY_APP_PASSWORD                            → publica en Bluesky
 *
 * Si faltan creds de una red, simplemente no publica en esa.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const LOCATIONS_FILE = path.join(process.cwd(), 'src/data/locations.json');
const SITE_URL = 'https://gasolinabarata.org';

function buildSnapshot() {
    const d = JSON.parse(fs.readFileSync(LOCATIONS_FILE, 'utf-8'));
    const locs = d.locations || [];
    if (!locs.length) throw new Error('locations.json vacío');

    const validG95 = locs.filter((l) => l.precioMedioGasolina95 > 0);
    const validDiesel = locs.filter((l) => l.precioMedioDiesel > 0);

    const cheapestG95 = [...validG95].sort((a, b) => a.precioMedioGasolina95 - b.precioMedioGasolina95)[0];
    const dearestG95 = [...validG95].sort((a, b) => b.precioMedioGasolina95 - a.precioMedioGasolina95)[0];
    const cheapestDiesel = [...validDiesel].sort((a, b) => a.precioMedioDiesel - b.precioMedioDiesel)[0];

    const avgG95 = validG95.reduce((s, l) => s + l.precioMedioGasolina95, 0) / validG95.length;
    const avgDiesel = validDiesel.reduce((s, l) => s + l.precioMedioDiesel, 0) / validDiesel.length;

    const dateLabel = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

    return {
        text:
            `⛽ Precio gasolina HOY (${dateLabel}) en España\n\n` +
            `Media nacional:\n` +
            `· Gasolina 95: ${avgG95.toFixed(3)} €/L\n` +
            `· Diésel: ${avgDiesel.toFixed(3)} €/L\n\n` +
            `🟢 Más barata Gasolina 95: ${cheapestG95.nombreProvincia} (${cheapestG95.precioMedioGasolina95.toFixed(3)} €/L)\n` +
            `🔴 Más cara: ${dearestG95.nombreProvincia} (${dearestG95.precioMedioGasolina95.toFixed(3)} €/L)\n\n` +
            `Compara tu zona: ${SITE_URL}/precio-gasolina/${cheapestG95.provincia}`,
        url: `${SITE_URL}/precio-gasolina/${cheapestG95.provincia}`,
    };
}

// ── Twitter / X ──
async function postX(text) {
    const k = process.env.X_API_KEY;
    const ks = process.env.X_API_SECRET;
    const t = process.env.X_ACCESS_TOKEN;
    const ts = process.env.X_ACCESS_SECRET;
    if (!k || !ks || !t || !ts) {
        console.log('X creds ausentes, salto');
        return;
    }
    const url = 'https://api.x.com/2/tweets';
    const method = 'POST';

    const oauth = {
        oauth_consumer_key: k,
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_token: t,
        oauth_version: '1.0',
    };

    const paramStr = Object.keys(oauth).sort().map((p) => `${encodeURIComponent(p)}=${encodeURIComponent(oauth[p])}`).join('&');
    const baseStr = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramStr)}`;
    const signingKey = `${encodeURIComponent(ks)}&${encodeURIComponent(ts)}`;
    oauth.oauth_signature = crypto.createHmac('sha1', signingKey).update(baseStr).digest('base64');

    const authHeader = 'OAuth ' + Object.keys(oauth).sort().map((p) => `${encodeURIComponent(p)}="${encodeURIComponent(oauth[p])}"`).join(', ');

    const res = await fetch(url, {
        method,
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`X ${res.status}: ${body}`);
    console.log('✅ X publicado:', body.slice(0, 100));
}

// ── Bluesky ──
async function postBluesky(text) {
    const handle = process.env.BSKY_HANDLE;
    const password = process.env.BSKY_APP_PASSWORD;
    if (!handle || !password) {
        console.log('Bluesky creds ausentes, salto');
        return;
    }
    const sess = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: handle, password }),
    }).then((r) => r.json());
    if (!sess.accessJwt) throw new Error('Bluesky sesión fail: ' + JSON.stringify(sess));

    const res = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.accessJwt}` },
        body: JSON.stringify({
            repo: sess.did,
            collection: 'app.bsky.feed.post',
            record: {
                $type: 'app.bsky.feed.post',
                text,
                createdAt: new Date().toISOString(),
                langs: ['es'],
            },
        }),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`Bluesky ${res.status}: ${body}`);
    console.log('✅ Bluesky publicado');
}

async function main() {
    const snap = buildSnapshot();
    console.log('Texto a publicar:\n' + snap.text + '\n');

    const results = await Promise.allSettled([postX(snap.text), postBluesky(snap.text)]);
    results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`  ✘ ${['X', 'Bluesky'][i]} falló:`, r.reason?.message || r.reason);
    });
}

main().catch((e) => {
    console.error('❌ social-daily falló:', e);
    process.exit(1);
});
