// Gasolina Barata — Article Page (Precios)
import type { Metadata } from 'next';
import Link from 'next/link';
import SmartDownloadButton from '@/components/SmartDownloadButton';
import { getAllSlugs, getPostBySlug } from '@/lib/nocodb';
import { notFound } from 'next/navigation';

function markdownToHtml(md: string): string {
    let html = md
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/(<li>.*?<\/li>)(\s*<li>)/g, '$1$2');
    html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');
    html = `<p>${html}</p>`;
    html = html
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/<p>\s*(<h[1-3]>)/g, '$1')
        .replace(/(<\/h[1-3]>)\s*<\/p>/g, '$1')
        .replace(/<p>\s*(<ul>)/g, '$1')
        .replace(/(<\/ul>)\s*<\/p>/g, '$1');
    return html;
}

export async function generateStaticParams() {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { slug } = await props.params;
    const post = await getPostBySlug(slug);
    if (!post) return { title: 'Artículo no encontrado' };
    return {
        title: post.Title,
        description: post.Excerpt,
        alternates: { canonical: `https://gasolinabarata.es/blog/${post.Slug}` },
        openGraph: {
            title: post.Title, description: post.Excerpt, type: 'article',
            siteName: 'Gasolina Barata', locale: 'es_ES',
            publishedTime: post.PublishedAt,
            images: post.CoverImage ? [{ url: post.CoverImage }] : [],
        },
    };
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

const CATEGORY_EMOJIS: Record<string, string> = { Precios: '💰', Tendencias: '📈', Ahorro: '🐷', Análisis: '🔬' };

export default async function ArticlePage(props: PageProps) {
    const { slug } = await props.params;
    const post = await getPostBySlug(slug);
    if (!post) notFound();
    const contentHtml = markdownToHtml(post.Content);

    return (
        <div className="rg-landing">
            <nav className="rg-navbar">
                <div className="rg-navbar-inner">
                    <Link href="/" className="rg-nav-logo">💰 <span>Gasolina</span>Barata</Link>
                    <div className="rg-nav-links">
                        <Link href="/">Blog</Link>
                        <SmartDownloadButton variant="nav" className="rg-nav-cta" label="Mapa de Precios →" />
                    </div>
                </div>
            </nav>

            <section className="blog-article-header">
                <div className="rg-container">
                    <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
                        <Link href="/">Inicio</Link>
                        <span className="blog-breadcrumb-sep">/</span>
                        <span>{post.Category}</span>
                    </nav>
                    <div className="blog-article-meta">
                        <span className="blog-card-category">{CATEGORY_EMOJIS[post.Category] || '📰'} {post.Category}</span>
                        <span className="blog-card-date">{formatDate(post.PublishedAt)}</span>
                    </div>
                    <h1 className="blog-article-title">{post.Title}</h1>
                    <p className="blog-article-excerpt">{post.Excerpt}</p>
                </div>
            </section>

            {post.CoverImage && (
                <div className="blog-article-cover"><div className="rg-container"><img src={post.CoverImage} alt={post.Title} /></div></div>
            )}

            <article className="blog-article-content">
                <div className="rg-container">
                    <div className="blog-prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                </div>
            </article>

            {/* ---- Ad ---- */}
            <div className="rg-container">

            </div>

            <section className="blog-cta">
                <div className="rg-container">
                    <h2>Compara precios en tu zona</h2>
                    <p>Usa RadarGas para ver el mapa de precios en tiempo real.</p>
                    <div className="rg-hero-buttons">
                        <SmartDownloadButton variant="primary" label="🚀 Ver Precios" />
                        <Link href="/" className="rg-btn secondary">← Volver al blog</Link>
                    </div>
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
                        '@context': 'https://schema.org', '@type': 'NewsArticle',
                        headline: post.Title, description: post.Excerpt,
                        datePublished: post.PublishedAt, image: post.CoverImage || undefined,
                        author: { '@type': 'Organization', name: 'Gasolina Barata' },
                        publisher: { '@type': 'Organization', name: 'Gasolina Barata' },
                        articleSection: post.Category,
                    }),
                }}
            />
        </div>
    );
}
