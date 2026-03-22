import React from 'react';
import type { NewsItem } from '@/lib/news';

function timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
}

export default function NewsSection({ news }: { news: NewsItem[] }) {
    if (!news || news.length === 0) return null;

    return (
        <section id="noticias" className="news-section">
            <div className="rg-container">
                <div className="rg-section-title">
                    <h2>📰 Últimas Noticias sobre Gasolina</h2>
                    <p>Lo más relevante del sector energético en España, actualizado cada hora.</p>
                </div>

                <div className="news-grid">
                    {news.map((item, i) => (
                        <a
                            key={i}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="news-card"
                        >
                            {item.imageUrl && (
                                <div className="news-card-image">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="news-card-body">
                                <div className="news-card-header">
                                    <span className="news-source">{item.source}</span>
                                    <span className="news-date">{timeAgo(item.pubDate)}</span>
                                </div>
                                <h3 className="news-title">{item.title}</h3>
                                <span className="news-read-more">
                                    Leer artículo →
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
