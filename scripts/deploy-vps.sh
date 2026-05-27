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

echo "==> auto-news"
if [ -n "${GROQ_API_KEY:-}" ]; then
    sudo -u jenkins env GROQ_API_KEY="$GROQ_API_KEY" node scripts/auto-news.mjs || echo "auto-news falló, continuamos"
    sudo -u jenkins env GROQ_API_KEY="$GROQ_API_KEY" node scripts/auto-provincias.mjs || echo "auto-provincias falló, continuamos"
else
    echo "GROQ_API_KEY ausente, salto generación blog"
fi

echo "==> next build"
sudo -u jenkins npm run build

echo "==> rsync standalone -> $DST"
mkdir -p "$DST/.next/static"
rsync -a --delete --exclude='.next/static' --exclude='public' --exclude='src/data/locations.json' --exclude='src/data/blog-posts.json' .next/standalone/ "$DST/"
rsync -a --delete .next/static/ "$DST/.next/static/"
rsync -a --delete public/ "$DST/public/"
mkdir -p "$DST/src/data"
rsync -a src/data/ "$DST/src/data/"

echo "==> pm2 reload"
pm2 reload gasolina-barata --update-env

echo "==> commit + push data"
cd "$SRC"
sudo -u jenkins git add src/data/locations.json src/data/blog-posts.json 2>/dev/null || true
if sudo -u jenkins git diff --staged --quiet; then
    echo "Sin cambios en data"
else
    sudo -u jenkins git commit -m "chore(data): sync diario MITECO $(date -u +%Y-%m-%d)"
    sudo -u jenkins git push origin master
fi

echo "==> Deploy OK"
