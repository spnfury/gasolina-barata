# gasolinabarata.org

Web SEO de precios de carburante en España (Next.js 16, App Router, TypeScript). Datos oficiales del MITECO sincronizados a diario. Existe para captar tráfico orgánico y convertirlo en instalaciones de la app RadarGas.

## Ecosistema RadarGas (mantener idéntico en ambos repos)

| Dominio | Repo | Rol |
|---|---|---|
| gasolinabarata.org | `spnfury/gasolina-barata` → `/var/www/gasolina-barata-src` | Captación SEO: precios por provincia/localidad/marca + blog. Su objetivo de negocio es **instalar la app**. |
| radargas.com | `spnfury/Gasgas` → `/var/www/radargas.com` | Web de marca de la app (landing en `/`) |
| app.radargas.com | mismo repo y mismo proceso que radargas.com | PWA; en web muestra la página de descarga |
| App Store / Google Play | `id6760366244` / `com.radargas.app` | Destino final del embudo |

Embudo buscado: búsqueda en Google → página de gasolinabarata → CTA → store → instalación.

Reglas mientras dure la unificación (ver informe de auditoría de 2026-10):
- No crear contenido SEO nuevo que duplique la intención de la otra web (precios por zona, blog de carburantes) sin decidir antes en cuál de las dos vive.
- Todo enlace a una store lleva parámetros de campaña (Play `referrer=utm_source%3D...`, App Store `ct=` y `pt=`), para poder atribuir instalaciones.
- Ningún secreto en el repo: van en ficheros `.env` fuera de git o en el entorno de Jenkins.

## Despliegue

- **Producción:** job de Jenkins `gasolinabarata-sync-build-deploy`, diario a las ~04:18 UTC. Ejecuta `scripts/deploy-vps.sh`: git pull, `npm ci`, sync MITECO, generadores de blog, `next build`, rsync del standalone a `/var/www/gasolina-barata`, `pm2 reload gasolina-barata` (cluster, puerto 3001), scripts de Search Console y commit/push de `src/data/*.json`.
- **Si construyes a mano**, carga antes `/var/lib/jenkins/.gasolinabarata.env` (`set -a; . <fichero>; set +a`) y pasa `NEXT_PUBLIC_ADSENSE_CLIENT` al build. Sin esa variable AdSense desaparece del HTML sin dar ningún error.
- Despliegue manual mínimo: el build y los cuatro `rsync` del bloque "rsync standalone" de `deploy-vps.sh`, y después `pm2 reload gasolina-barata --update-env`.
- nginx: `/etc/nginx/sites-available/gasolinabarata.org`, detrás de Cloudflare. `/_next/static/` lo sirve nginx directamente.

## Rutas y datos

- `src/data/locations.json`: 52 provincias y ~3.200 localidades. Lo regenera `scripts/sync-miteco.mjs`.
- Rutas dinámicas con `dynamicParams=false`: `precio-gasolina/[provincia]/[localidad]`, `precio-diesel/[provincia]/[localidad]` (solo localidades con 2 o más estaciones), `marca/[slug]/[provincia]` y `blog/[slug]`.
- Las localidades con 1 estación o menos llevan `noindex,follow`.
- Blog: `src/data/blog-posts.json`, leído por `src/lib/nocodb.ts`. El nombre engaña: es JSON local, no NocoDB. Lo alimentan `scripts/auto-news.mjs`, `auto-provincias.mjs` y `auto-evergreen.mjs` mediante la API de Groq.
- Todos los CTAs de descarga salen de `src/components/SmartDownloadButton.tsx` (y `AppDownloadCta.tsx`). `AffiliateCta.tsx` es de afiliados (seguros, tarjetas), no de la app.

## Search Console

- `scripts/gsc.mjs`, con los subcomandos `pull`, `sitemap`, `inspect` e `index`. Necesita `GSC_SA_KEY=/var/lib/jenkins/.gsc-sa.json` y ejecutarse como el usuario `jenkins`.
- El service account solo tiene `siteFullUser`. La Indexing API (`index`) exige Propietario.
- `inspect` devuelve el último estado conocido por Google, no un fetch en vivo: una ruta nueva puede seguir saliendo como 404 durante semanas.

## Trampas conocidas

- `nginx/conf.d/bot_blocking.conf` limita el user agent `curl/*` a 1 petición por minuto y responde 503. Para probar la web usa `-A` con un UA de navegador o de Googlebot.
- `*.bak-*` y `tsconfig.tsbuildinfo` no están en `.gitignore`: no los añadas a un commit.
- No anides `<Link>` dentro de otro `<Link>`: las tarjetas de provincia ya son enlaces.
- Varias sesiones editan este repo a la vez y suelen dejar cambios sin commitear. Antes de commitear, mira `git status` y añade solo tus ficheros.
