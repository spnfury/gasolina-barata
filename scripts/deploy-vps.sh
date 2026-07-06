#!/usr/bin/env bash
set -euo pipefail

SRC=/var/www/gasolina-barata-src
DST=/var/www/gasolina-barata
ENV_FILE=/var/lib/jenkins/.gasolinabarata.env

echo "==> Cargando entorno"
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

cd "$SRC"

echo "==> git pull"
sudo -u jenkins git pull --ff-only origin master

echo "==> npm ci"
sudo -u jenkins npm ci --no-audit --no-fund

echo "==> sync MITECO"
sudo -u jenkins node scripts/sync-miteco.mjs

echo "==> auto-news / provincias / evergreen"
if [ -n "${GROQ_API_KEY:-}" ]; then
    sudo -u jenkins env GROQ_API_KEY="$GROQ_API_KEY" node scripts/auto-news.mjs || echo "auto-news falló, continuamos"
    sudo -u jenkins env GROQ_API_KEY="$GROQ_API_KEY" node scripts/auto-provincias.mjs || echo "auto-provincias falló, continuamos"
    sudo -u jenkins env GROQ_API_KEY="$GROQ_API_KEY" node scripts/auto-evergreen.mjs || echo "auto-evergreen falló, continuamos"
else
    echo "GROQ_API_KEY ausente, salto generación blog"
fi

echo "==> next build"
sudo -u jenkins env NEXT_PUBLIC_ADSENSE_CLIENT="${NEXT_PUBLIC_ADSENSE_CLIENT:-}" npm run build

echo "==> rsync standalone -> $DST"
mkdir -p "$DST/.next/static"
rsync -a --delete --exclude='.next/static' --exclude='public' --exclude='src/data/locations.json' --exclude='src/data/blog-posts.json' .next/standalone/ "$DST/"
rsync -a --delete .next/static/ "$DST/.next/static/"
rsync -a --delete public/ "$DST/public/"
mkdir -p "$DST/src/data"
rsync -a src/data/ "$DST/src/data/"

echo "==> pm2 reload"
pm2 reload gasolina-barata --update-env

echo "==> Google Search Console (sitemap + pull + inspect)"
GSC_KEY=/var/lib/jenkins/.gsc-sa.json
if [ -f "$GSC_KEY" ]; then
    sudo -u jenkins env GSC_SA_KEY="$GSC_KEY" node scripts/gsc.mjs sitemap || echo "gsc sitemap falló, continuamos"
    sudo -u jenkins env GSC_SA_KEY="$GSC_KEY" node scripts/gsc.mjs pull --days 28 || echo "gsc pull falló, continuamos"
    rsync -a src/data/gsc-performance.json "$DST/src/data/" 2>/dev/null || true

    # Monitor indexación: escribe gsc-inspect-problems.json solo si hay problemas
    rm -f src/data/gsc-inspect-problems.json
    sudo -u jenkins env GSC_SA_KEY="$GSC_KEY" node scripts/gsc.mjs inspect || true
    if [ -f src/data/gsc-inspect-problems.json ] && [ -n "${RESEND_API_KEY:-}" ]; then
        n=$(grep -c '"url"' src/data/gsc-inspect-problems.json || echo '?')
        curl -s -X POST https://api.resend.com/emails \
            -H "Authorization: Bearer $RESEND_API_KEY" -H "Content-Type: application/json" \
            -d "{\"from\":\"onboarding@resend.dev\",\"to\":\"thevega82@gmail.com\",\"subject\":\"[GSC] $n URLs con problemas de indexacion\",\"text\":\"Search Console detecto URLs no indexadas en gasolinabarata.org. Detalle: src/data/gsc-inspect-problems.json\"}" >/dev/null || true
    fi
else
    echo "GSC_SA_KEY ausente ($GSC_KEY), salto Search Console"
fi

echo "==> commit + push data"
cd "$SRC"
sudo -u jenkins git add src/data/locations.json src/data/blog-posts.json src/data/gsc-performance.json 2>/dev/null || true
if sudo -u jenkins git diff --staged --quiet; then
    echo "Sin cambios en data"
else
    sudo -u jenkins git commit -m "chore(data): sync diario MITECO $(date -u +%Y-%m-%d)"
    sudo -u jenkins git push origin master
fi

echo "==> Deploy OK"
