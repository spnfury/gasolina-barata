import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import locationsData from '@/data/locations.json';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import AffiliateCta from '@/components/AffiliateCta';

export const dynamicParams = false;

const eur = (n: number) => (n > 0 ? n.toFixed(3).replace('.', ',') : '-');
const tc = (s: string) =>
    s.toLowerCase().replace(/(^|[\s(/-])([a-záéíóúñ])/g, (_, p, c) => p + c.toUpperCase());

export async function generateMetadata({ params }: { params: Promise<{ provincia: string }> }): Promise<Metadata> {
    const { provincia } = await params;
    const loc = (locationsData as any).locations.find((l: any) => l.provincia === provincia);
    if (!loc) return { title: 'No encontrado' };
    const prov = tc(loc.nombreProvincia);
    const d = eur(loc.precioMedioDiesel);
    const title = loc.precioMedioDiesel > 0 ? `Diésel barato en ${prov}: gasóleo A a ${d}€/L hoy` : `Diésel barato en ${prov} hoy`;
    const description = `Precio del diésel (gasóleo A) en ${prov}: media de ${d}€/L actualizada hoy. Encuentra las gasolineras con el gasóleo más barato por localidad y ahorra.`;
    return {
        title,
        description,
        alternates: { canonical: `https://gasolinabarata.org/precio-diesel/${provincia}` },
        openGraph: { title, description, type: 'website', locale: 'es_ES', url: `https://gasolinabarata.org/precio-diesel/${provincia}`, siteName: 'Gasolina Barata' },
    };
}

export async function generateStaticParams() {
    return (locationsData as any).locations.map((loc: any) => ({ provincia: loc.provincia }));
}

export default async function DieselProvinciaPage({ params }: { params: Promise<{ provincia: string }> }) {
    const { provincia } = await params;
    const data = locationsData as any;
    const location = data.locations.find((l: any) => l.provincia === provincia);
    if (!location) notFound();

    const prov = tc(location.nombreProvincia);
    const conPrecio = (location.localidades || []).filter((l: any) => l.precioDiesel > 0);
    const barata = conPrecio.length ? conPrecio.reduce((m: any, l: any) => (l.precioDiesel < m.precioDiesel ? l : m), conPrecio[0]) : null;
    const cara = conPrecio.length ? conPrecio.reduce((m: any, l: any) => (l.precioDiesel > m.precioDiesel ? l : m), conPrecio[0]) : null;
    const spread = barata && cara ? Math.round((cara.precioDiesel - barata.precioDiesel) * 100) : 0;
    const natHist = (data.historicoNacional || []) as any[];
    const natD = natHist.length ? natHist[natHist.length - 1].precioDiesel : 0;
    const vsNac = natD > 0 ? Math.round((location.precioMedioDiesel - natD) * 100) : null;

    // Solo localidades con página diésel generada (>=2 estaciones)
    const locsByDiesel = conPrecio
        .filter((l: any) => l.top5 && l.top5.length > 1)
        .sort((a: any, b: any) => a.precioDiesel - b.precioDiesel);

    return (
        <div className="rg-landing">
            <Navbar />
            <header className="blog-hero" style={{ paddingBottom: '32px' }}>
                <div className="rg-container">
                    <Breadcrumbs items={[
                        { name: 'Inicio', url: 'https://gasolinabarata.org' },
                        { name: `Diésel en ${prov}`, url: `https://gasolinabarata.org/precio-diesel/${provincia}` },
                    ]} />
                    <h1>Diésel barato en <span className="green">{prov}</span>: precio del gasóleo A</h1>
                    <p className="blog-hero-sub">
                        Localidades y gasolineras con el diésel más barato de {prov} hoy. Datos oficiales del MITECO.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', maxWidth: 900, margin: '0 auto' }}>
                <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', marginBottom: 40 }}>
                    <div style={{ background: 'var(--rg-surface)', border: '1px solid var(--rg-border)', borderRadius: 'var(--rg-radius)', padding: 24, textAlign: 'center' }}>
                        <span style={{ display: 'block', color: 'var(--rg-text-secondary)', marginBottom: 8 }}>Diésel medio en {prov}</span>
                        <span style={{ fontSize: '2rem', fontWeight: 800 }}>{eur(location.precioMedioDiesel)}€/L</span>
                    </div>
                    <div style={{ background: 'var(--rg-surface)', border: '1px solid var(--rg-border)', borderRadius: 'var(--rg-radius)', padding: 24, textAlign: 'center' }}>
                        <span style={{ display: 'block', color: 'var(--rg-text-secondary)', marginBottom: 8 }}>Gasolina 95 media</span>
                        <span style={{ fontSize: '2rem', fontWeight: 800 }}>{eur(location.precioMedioGasolina95)}€/L</span>
                    </div>
                </div>

                {barata && cara && (
                    <p style={{ color: 'var(--rg-text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
                        La localidad más barata para repostar diésel en {prov} es <strong>{barata.nombre}</strong> ({eur(barata.precioDiesel)}€/L),
                        frente a <strong>{cara.nombre}</strong> ({eur(cara.precioDiesel)}€/L): {spread} céntimos de diferencia, hasta{' '}
                        {((cara.precioDiesel - barata.precioDiesel) * 50).toFixed(2).replace('.', ',')}€ de ahorro por depósito de 50 litros.
                        {vsNac != null ? ` La media provincial está ${Math.abs(vsNac)} céntimo${Math.abs(vsNac) === 1 ? '' : 's'} por ${vsNac < 0 ? 'debajo' : 'encima'} de la media nacional.` : ''}
                        {' '}¿Buscas gasolina? Ve al <Link href={`/precio-gasolina/${provincia}`}>precio de la gasolina 95 en {prov}</Link>.
                    </p>
                )}

                <AffiliateCta place={prov} />

                <h2>Localidades de {prov} por precio del diésel</h2>
                <div className="blog-grid" style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {locsByDiesel.map((l: any) => (
                        <Link key={l.slug} href={`/precio-diesel/${provincia}/${l.slug}`} className="rg-btn secondary" style={{ padding: '8px 14px', fontSize: '.88rem' }}>
                            {l.nombre}: {eur(l.precioDiesel)}€
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
