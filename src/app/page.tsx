// Gasolina Barata — Blog Listing (Precios)
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/nocodb';

export const metadata: Metadata = {
    title: 'Gasolina Barata — Precios de Combustible Hoy en España',
    description:
        'Análisis diario del precio de la gasolina y diésel en España. Tendencias, comparativas por comunidad autónoma y previsiones.',
    alternates: { canonical: 'https://gasolinabarata.es' },
    openGraph: {
        title: 'Gasolina Barata — Precios de Combustible Hoy',
        description: 'Análisis diario del precio de la gasolina y diésel en España.',
        type: 'website',
        siteName: 'Gasolina Barata',
        locale: 'es_ES',
    },
};

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

const CATEGORY_EMOJIS: Record<string, string> = {
    Precios: '💰',
    Tendencias: '📈',
    Ahorro: '🐷',
    Análisis: '🔬',
};

export default async function BlogPage() {
    const posts = await getAllPosts();

    return (
        <div className="rg-landing">
            <nav className="rg-navbar">
                <div className="rg-navbar-inner">
                    <Link href="/" className="rg-nav-logo">
                        💰 <span>Gasolina</span>Barata
                    </Link>
                    <div className="rg-nav-links">
                        <Link href="/">Inicio</Link>
                        <a href="https://app.radargas.com" className="rg-nav-cta">
                            Mapa de Precios →
                        </a>
                    </div>
                </div>
            </nav>

            <section className="blog-hero">
                <div className="rg-container">
                    <div className="rg-hero-badge">
                        <span className="dot" />
                        Precios actualizados diariamente
                    </div>
                    <h1>
                        Precio <span className="green">Gasolina</span> Hoy
                    </h1>
                    <p className="blog-hero-sub">
                        Análisis diario del precio de la gasolina y diésel en España.
                        Tendencias, comparativas y previsiones para ahorrar.
                    </p>
                </div>
            </section>

            <section className="blog-grid-section">
                <div className="rg-container">
                    {posts.length === 0 ? (
                        <div className="blog-empty">
                            <p>No hay artículos publicados todavía. ¡Vuelve pronto!</p>
                        </div>
                    ) : (
                        <div className="blog-grid">
                            {posts.map((post) => (
                                <Link key={post.Slug} href={`/blog/${post.Slug}`} className="blog-card">
                                    {post.CoverImage && (
                                        <div className="blog-card-img">
                                            <img src={post.CoverImage} alt={post.Title} loading="lazy" />
                                        </div>
                                    )}
                                    <div className="blog-card-body">
                                        <div className="blog-card-meta">
                                            <span className="blog-card-category">
                                                {CATEGORY_EMOJIS[post.Category] || '📰'} {post.Category}
                                            </span>
                                            <span className="blog-card-date">{formatDate(post.PublishedAt)}</span>
                                        </div>
                                        <h2 className="blog-card-title">{post.Title}</h2>
                                        <p className="blog-card-excerpt">{post.Excerpt}</p>
                                        <span className="blog-card-link">Leer más →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="blog-cta">
                <div className="rg-container">
                    <h2>Compara precios en tu zona</h2>
                    <p>Usa RadarGas para ver el mapa de precios en tiempo real.</p>
                    <a href="https://app.radargas.com" className="rg-btn primary">🚀 Ver Mapa de Precios</a>
                </div>
            </section>

            <footer className="rg-footer">
                <div className="rg-footer-inner">
                    <div className="rg-footer-bottom">
                        <span>© {new Date().getFullYear()} Gasolina Barata — Datos MITECO</span>
                        <span>Precios orientativos</span>
                    </div>
                </div>
            </footer>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Blog',
                        name: 'Gasolina Barata',
                        description: 'Análisis diario del precio de la gasolina y diésel en España.',
                        publisher: { '@type': 'Organization', name: 'Gasolina Barata' },
                        blogPost: posts.map((p) => ({
                            '@type': 'BlogPosting',
                            headline: p.Title,
                            url: `/blog/${p.Slug}`,
                            datePublished: p.PublishedAt,
                            description: p.Excerpt,
                        })),
                    }),
                }}
            />
        </div>
    );
}
