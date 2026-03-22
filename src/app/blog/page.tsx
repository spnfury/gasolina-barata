// Gasolina Barata — Blog Listing Page
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/nocodb';
import SmartDownloadButton from '@/components/SmartDownloadButton';

export const metadata: Metadata = {
    title: 'Blog — Noticias sobre Gasolina y Diésel en España',
    description:
        'Artículos actualizados sobre precios de gasolina, tendencias del mercado energético y consejos para ahorrar en combustible en España.',
    alternates: { canonical: 'https://gasolinabarata.org/blog' },
};

const CATEGORY_EMOJIS: Record<string, string> = {
    Precios: '💰',
    Tendencias: '📈',
    Ahorro: '🐷',
    Análisis: '🔬',
};

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return '';
    }
}

export default async function BlogPage() {
    const posts = await getAllPosts();

    return (
        <div className="rg-landing">
            <nav className="rg-navbar">
                <div className="rg-navbar-inner">
                    <Link href="/" className="rg-nav-logo">
                        ⛽ <span>Gasolina</span>Barata
                    </Link>
                    <div className="rg-nav-links">
                        <Link href="/">Inicio</Link>
                        <Link href="/blog">Blog</Link>
                        <SmartDownloadButton variant="nav" className="rg-nav-cta" />
                    </div>
                </div>
            </nav>

            <section className="blog-hero">
                <div className="rg-container">
                    <div className="rg-hero-badge">
                        <span className="dot" />
                        Contenido actualizado a diario
                    </div>
                    <h1>
                        Blog <span className="green">Gasolina Barata</span>
                    </h1>
                    <p className="blog-hero-sub">
                        Noticias, análisis y consejos sobre precios de combustible en España.
                        Todo lo que necesitas saber para ahorrar en cada repostaje.
                    </p>
                </div>
            </section>

            <section className="blog-grid-section">
                <div className="rg-container">
                    {posts.length === 0 ? (
                        <div className="blog-empty">
                            <p>Aún no hay artículos publicados. ¡Vuelve pronto!</p>
                        </div>
                    ) : (
                        <div className="blog-grid">
                            {posts.map((post) => (
                                <Link
                                    href={`/blog/${post.Slug}`}
                                    key={post.Slug}
                                    className="blog-card"
                                >
                                    {post.CoverImage && (
                                        <div className="blog-card-img">
                                            <img
                                                src={post.CoverImage}
                                                alt={post.Title}
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    <div className="blog-card-body">
                                        <div className="blog-card-meta">
                                            <span className="blog-card-category">
                                                {CATEGORY_EMOJIS[post.Category] || '📰'}{' '}
                                                {post.Category}
                                            </span>
                                            <span className="blog-card-date">
                                                {formatDate(post.PublishedAt)}
                                            </span>
                                        </div>
                                        <h2 className="blog-card-title">{post.Title}</h2>
                                        <p className="blog-card-excerpt">{post.Excerpt}</p>
                                        <span className="blog-card-link">
                                            Leer artículo →
                                        </span>
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
                    <p>
                        Usa RadarGas para ver el mapa de precios en tiempo real y ahorrar
                        en cada repostaje.
                    </p>
                    <div className="rg-hero-buttons">
                        <SmartDownloadButton variant="primary" label="🚀 Descargar RadarGas" />
                        <Link href="/" className="rg-btn secondary">
                            ← Volver al inicio
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="rg-footer">
                <div className="rg-footer-inner">
                    <div className="rg-footer-bottom">
                        <span>
                            © {new Date().getFullYear()} Gasolina Barata (Marca RadarGas) —
                            Datos MITECO
                        </span>
                        <span>Precios orientativos.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
