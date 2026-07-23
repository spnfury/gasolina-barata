import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import locationsData from '@/data/locations.json';
import AffiliateCta from '@/components/AffiliateCta';
import AppDownloadCta from '@/components/AppDownloadCta';
import FaqAccordion from '@/components/FaqAccordion';
import Breadcrumbs from '@/components/Breadcrumbs';
import styles from '@/components/Seo.module.css';
import Navbar from '@/components/Navbar';

export const dynamicParams = false;

interface PageProps {
    params: Promise<{ provincia: string; localidad: string }>;
}

const eur = (n: number | null | undefined) => (n && n > 0 ? n.toFixed(3).replace('.', ',') : null);
const tc = (s: string) =>
    s.toLowerCase().replace(/(^|[\s(/-])([a-záéíóúñ])/g, (_, p, c) => p + c.toUpperCase());

// Estaciones ordenadas por precio de DIÉSEL (distinto del ranking de 95)
function dieselStations(town: any) {
    return (town.top5 || [])
        .filter((s: any) => s.precioDiesel && s.precioDiesel > 0)
        .sort((a: any, b: any) => a.precioDiesel - b.precioDiesel);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { provincia, localidad } = await params;
    const data = locationsData as any;
    const loc = data.locations.find((l: any) => l.provincia === provincia);
    const town = loc?.localidades.find((t: any) => t.slug === localidad);
    if (!town || !loc) return { title: 'No encontrado' };

    const ds = dieselStations(town);
    const cheap = eur(ds[0]?.precioDiesel) || eur(town.precioDiesel);
    const isThin = !town.top5 || town.top5.length <= 1;

    const title = cheap
        ? `Diésel barato en ${town.nombre}: ${cheap}€/L hoy | Gasóleo A`
        : `Diésel barato en ${town.nombre} hoy | Precio gasóleo A`;
    const description = cheap
        ? `Gasolinera con el diésel más barato en ${town.nombre} (${tc(loc.nombreProvincia)})${ds[0]?.rotulo ? `: ${ds[0].rotulo}` : ''} a ${cheap}€/L. Precio del gasóleo A actualizado hoy. Compara y ahorra.`
        : `Precio del diésel (gasóleo A) en ${town.nombre}. Compara las gasolineras más baratas hoy y ahorra en cada repostaje.`;

    return {
        title,
        description,
        ...(isThin ? { robots: { index: false, follow: true } } : {}),
        alternates: { canonical: `https://gasolinabarata.org/precio-diesel/${provincia}/${localidad}` },
        openGraph: { title, description, type: 'article', locale: 'es_ES', url: `https://gasolinabarata.org/precio-diesel/${provincia}/${localidad}`, siteName: 'Gasolina Barata' },
    };
}

export async function generateStaticParams() {
    // Solo localidades con comparación real (>=2 estaciones). Las thin no aportan
    // en diésel (irían noindex) y evitamos duplicar el árbol completo en el build.
    const params: { provincia: string; localidad: string }[] = [];
    (locationsData as any).locations.forEach((prov: any) => {
        prov.localidades.forEach((loc: any) => {
            if (loc.top5 && loc.top5.length > 1) params.push({ provincia: prov.provincia, localidad: loc.slug });
        });
    });
    return params;
}

export default async function DieselLocalidadPage({ params }: PageProps) {
    const { provincia, localidad } = await params;
    const data = locationsData as any;
    const prov = data.locations.find((l: any) => l.provincia === provincia);
    const town = prov?.localidades.find((t: any) => t.slug === localidad);
    if (!prov || !town) notFound();

    const provNombre = tc(prov.nombreProvincia);
    const natHist = (data.historicoNacional || []) as any[];
    const natDiesel = natHist.length ? natHist[natHist.length - 1].precioDiesel : 0;
    const ds = dieselStations(town);
    const cheapest = ds[0];

    // Tendencia diésel (histórico ~14 días)
    const hist = town.historico || [];
    let trend: string | null = null;
    if (hist.length >= 2) {
        const last = hist[hist.length - 1];
        const ref = hist[Math.max(0, hist.length - 8)];
        if (ref.precioDiesel > 0) {
            const pct = ((last.precioDiesel - ref.precioDiesel) / ref.precioDiesel) * 100;
            trend = Math.abs(pct) < 0.15
                ? `El precio del diésel en ${town.nombre} se ha mantenido estable esta semana.`
                : `El diésel en ${town.nombre} ha ${pct < 0 ? 'bajado' : 'subido'} un ${Math.abs(pct).toFixed(1).replace('.', ',')}% en la última semana.`;
        }
    }
    const vsProv = Math.round((town.precioDiesel - prov.precioMedioDiesel) * 100);
    const vsNac = natDiesel > 0 ? Math.round((town.precioDiesel - natDiesel) * 100) : null;
    const pos = (c: number, r: string) => (c === 0 ? `coincide con la media de ${r}` : `${Math.abs(c)} céntimo${Math.abs(c) === 1 ? '' : 's'} por ${c < 0 ? 'debajo' : 'encima'} de la media de ${r}`);

    const faqs = [
        { question: `¿Dónde está el diésel más barato en ${town.nombre}?`, answer: cheapest ? `Hoy, el gasóleo A más barato en ${town.nombre} está en ${cheapest.rotulo} a ${eur(cheapest.precioDiesel)}€/L, según los datos oficiales del MITECO.` : `Consulta la tabla con las gasolineras de ${town.nombre} ordenadas por precio del diésel.` },
        { question: `¿Cuál es la diferencia entre el diésel y la gasolina 95 en ${town.nombre}?`, answer: `El diésel (gasóleo A) está a ${eur(town.precioDiesel)}€/L y la gasolina 95 a ${eur(town.precioGasolina95)}€/L de media en ${town.nombre}. Consulta también el precio de la gasolina 95.` },
        { question: `¿Cómo se compara el diésel de ${town.nombre} con la media?`, answer: `El diésel en ${town.nombre} ${pos(vsProv, provNombre)}${vsNac != null ? ` y ${pos(vsNac, 'España')}` : ''}.` },
    ];

    return (
        <div className="rg-landing">
            <Navbar />
            <header className="blog-hero" style={{ paddingBottom: '40px' }}>
                <div className="rg-container">
                    <Breadcrumbs items={[
                        { name: 'Inicio', url: 'https://gasolinabarata.org' },
                        { name: provNombre, url: `https://gasolinabarata.org/precio-gasolina/${provincia}` },
                        { name: `Diésel en ${town.nombre}`, url: `https://gasolinabarata.org/precio-diesel/${provincia}/${localidad}` },
                    ]} />
                    <h1>Diésel barato en <span className="green">{town.nombre}</span>: precio del gasóleo A hoy</h1>
                    <p className="blog-hero-sub">
                        Las gasolineras con el <strong>diésel más barato</strong> de {town.nombre}, con precios
                        oficiales actualizados hoy. Encuentra el gasóleo A al mejor precio en tu ruta.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', maxWidth: 800, margin: '0 auto' }}>
                <div className={styles.card}>
                    <h2 className={styles.priceTitle}>Precio del diésel hoy en {town.nombre}</h2>
                    <div className={styles.priceGrid}>
                        <div className={styles.priceItem}>
                            <span className={styles.priceLabel}>Diésel (gasóleo A)</span>
                            <span className={styles.priceValue}>{eur(town.precioDiesel) || '-'}€</span>
                        </div>
                        <div className={styles.priceItem}>
                            <span className={styles.priceLabel}>Gasolina 95</span>
                            <span className={styles.priceValue}>{eur(town.precioGasolina95) || '-'}€</span>
                        </div>
                    </div>
                </div>

                <section style={{ background: 'var(--rg-surface)', border: '1px solid var(--rg-border)', borderRadius: 'var(--rg-radius)', padding: '28px 24px', margin: '32px 0' }}>
                    <h2 style={{ marginTop: 0 }}>Análisis del precio del diésel en {town.nombre}</h2>
                    <p style={{ color: 'var(--rg-text-secondary)', lineHeight: 1.7 }}>
                        {trend ? `${trend} ` : ''}
                        Con el gasóleo A a <strong>{eur(town.precioDiesel)}€/L</strong>, {town.nombre} {pos(vsProv, provNombre)}
                        {vsNac != null ? ` y ${pos(vsNac, 'España')}` : ''}.
                        {cheapest ? ` La opción más económica hoy es ${cheapest.rotulo}, con el diésel a ${eur(cheapest.precioDiesel)}€/L.` : ''}
                    </p>
                    <p style={{ color: 'var(--rg-text-secondary)', marginTop: 12 }}>
                        ¿Tu coche es de gasolina? Consulta el <Link href={`/precio-gasolina/${provincia}/${localidad}`}>precio de la gasolina 95 en {town.nombre}</Link>.
                    </p>
                </section>

                <AffiliateCta place={town.nombre} />

                {ds.length > 0 && (
                    <>
                        <h2>Gasolineras con el diésel más barato en {town.nombre}</h2>
                        <div style={{ overflowX: 'auto', background: 'var(--rg-surface)', borderRadius: 'var(--rg-radius)', border: '1px solid var(--rg-border)', margin: '16px 0 40px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 480 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--rg-border)', color: 'var(--rg-text-secondary)', fontSize: '.9rem' }}>
                                        <th style={{ padding: 14 }}>#</th>
                                        <th style={{ padding: 14 }}>Gasolinera</th>
                                        <th style={{ padding: 14 }}>Dirección</th>
                                        <th style={{ padding: 14 }}>Diésel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ds.map((st: any, i: number) => (
                                        <tr key={i} style={{ borderBottom: i === ds.length - 1 ? 'none' : '1px solid var(--rg-border)' }}>
                                            <td style={{ padding: 14, color: 'var(--rg-text-secondary)' }}>{i + 1}</td>
                                            <td style={{ padding: 14, fontWeight: 700 }}>{st.rotulo}</td>
                                            <td style={{ padding: 14, fontSize: '.85rem', color: 'var(--rg-text-secondary)' }}>{st.direccion}</td>
                                            <td style={{ padding: 14, fontWeight: 800, color: 'var(--rg-primary)' }}>{eur(st.precioDiesel)}€</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                <AppDownloadCta locationName={town.nombre} />
                <FaqAccordion faqs={faqs} />
            </main>
        </div>
    );
}
