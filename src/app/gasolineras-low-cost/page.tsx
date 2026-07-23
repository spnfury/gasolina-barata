import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import locationsData from '@/data/locations.json';
import { SUPPORTED_BRANDS } from '@/lib/brands';

const eur = (n: number) => (n > 0 ? n.toFixed(3).replace('.', ',') : '-');
const tc = (s: string) =>
    s.toLowerCase().replace(/(^|[\s(/-])([a-záéíóúñ])/g, (_, p, c) => p + c.toUpperCase());

// Cadenas low cost / desatendidas conocidas en España
const LOWCOST_SLUGS = [
    'plenoil', 'ballenoil', 'petroprix', 'esclatoil', 'gasexpress', 'easygas',
    'autonetoil', 'petrocat', 'meroil', 'beroil', 'agla', 'gmoil', 'iberdoex', 'tamoil',
];

export const metadata: Metadata = {
    title: 'Gasolineras low cost en España: las cadenas y estaciones más baratas',
    description:
        'Guía de gasolineras low cost en España: Plenoil, Ballenoil, Petroprix y más. Descubre las cadenas desatendidas más baratas y las estaciones con el precio más bajo hoy.',
    alternates: { canonical: 'https://gasolinabarata.org/gasolineras-low-cost' },
    robots: { index: true, follow: true },
};

export default function LowCostPage() {
    const data = locationsData as any;
    const lowcostBrands = SUPPORTED_BRANDS.filter((b) => LOWCOST_SLUGS.includes(b.slug));
    const aliases = new Set(lowcostBrands.flatMap((b) => b.aliases));

    const stations: any[] = [];
    data.locations.forEach((prov: any) => {
        prov.localidades.forEach((loc: any) => {
            (loc.top5 || []).forEach((st: any) => {
                const rot = (st.rotulo || '').toUpperCase();
                if ([...aliases].some((a) => rot.includes(a)) && st.precio95 > 0) {
                    stations.push({ ...st, localidad: loc.nombre, provincia: prov.nombreProvincia, provSlug: prov.provincia, locSlug: loc.slug });
                }
            });
        });
    });
    stations.sort((a, b) => a.precio95 - b.precio95);
    const top = stations.slice(0, 25);

    return (
        <div className="rg-landing">
            <Navbar />
            <header className="blog-hero" style={{ paddingBottom: '32px' }}>
                <div className="rg-container">
                    <Breadcrumbs
                        items={[
                            { name: 'Inicio', url: 'https://gasolinabarata.org' },
                            { name: 'Gasolineras low cost', url: 'https://gasolinabarata.org/gasolineras-low-cost' },
                        ]}
                    />
                    <h1>Gasolineras <span className="green">low cost</span> en España</h1>
                    <p className="blog-hero-sub">
                        Las cadenas desatendidas y low cost ofrecen la gasolina más barata sin renunciar a la
                        calidad del combustible. Aquí tienes las marcas y las estaciones más económicas hoy.
                    </p>
                </div>
            </header>

            <main className="rg-container" style={{ paddingBottom: '80px', maxWidth: 900, margin: '0 auto' }}>
                <p style={{ color: 'var(--rg-text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
                    Las gasolineras low cost venden el mismo combustible que las grandes marcas (procede de las
                    mismas refinerías y cumple la normativa europea), pero ahorran en personal e imagen, trasladando
                    ese ahorro al precio. Suelen estar en polígonos y muchas abren 24 horas.
                </p>

                <h2>Principales cadenas low cost</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '16px 0 40px' }}>
                    {lowcostBrands.map((b) => (
                        <Link key={b.slug} href={`/marca/${b.slug}`} className="rg-btn secondary" style={{ padding: '8px 16px' }}>
                            {b.name}
                        </Link>
                    ))}
                </div>

                <h2>Las 25 gasolineras low cost más baratas de España hoy</h2>
                <div style={{ overflowX: 'auto', background: 'var(--rg-surface)', borderRadius: 'var(--rg-radius)', border: '1px solid var(--rg-border)', marginTop: 16 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 560 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--rg-border)', color: 'var(--rg-text-secondary)', fontSize: '.9rem' }}>
                                <th style={{ padding: 14 }}>#</th>
                                <th style={{ padding: 14 }}>Gasolinera</th>
                                <th style={{ padding: 14 }}>Ubicación</th>
                                <th style={{ padding: 14 }}>95</th>
                                <th style={{ padding: 14 }}>Diésel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top.map((st, i) => (
                                <tr key={i} style={{ borderBottom: i === top.length - 1 ? 'none' : '1px solid var(--rg-border)' }}>
                                    <td style={{ padding: 14, color: 'var(--rg-text-secondary)' }}>{i + 1}</td>
                                    <td style={{ padding: 14, fontWeight: 700 }}>{st.rotulo}</td>
                                    <td style={{ padding: 14, fontSize: '.85rem' }}>
                                        <Link href={`/precio-gasolina/${st.provSlug}/${st.locSlug}`}>
                                            {st.localidad} ({tc(st.provincia)})
                                        </Link>
                                    </td>
                                    <td style={{ padding: 14, fontWeight: 800, color: 'var(--rg-primary)' }}>{eur(st.precio95)}€</td>
                                    <td style={{ padding: 14, fontWeight: 800 }}>{st.precioDiesel > 0 ? `${eur(st.precioDiesel)}€` : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
