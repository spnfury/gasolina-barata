import React from 'react';
import Link from 'next/link';

/**
 * Análisis de precios único por localidad (contenido no-plantilla para SEO/AdSense).
 * Todo computado de datos reales: tendencia semanal, comparativa provincial/nacional,
 * ahorro por depósito y localidades cercanas.
 */

interface HistPoint {
    date: string;
    precioGasolina95: number;
    precioDiesel: number;
}
interface Station {
    rotulo: string;
    precio95: number | null;
    precioDiesel: number | null;
}
interface Town {
    nombre: string;
    slug: string;
    precioGasolina95: number;
    precioDiesel: number;
    historico?: HistPoint[];
    top5?: Station[];
}
interface Prov {
    provincia: string;
    nombreProvincia: string;
    precioMedioGasolina95: number;
    precioMedioDiesel: number;
    localidades: { slug: string; nombre: string; precioGasolina95: number }[];
}

interface Props {
    town: Town;
    prov: Prov;
    nationalAvg95: number;
    nationalAvg98?: number;
}

const eur = (n: number) => n.toFixed(3).replace('.', ',');
const cent = (n: number) => Math.round(n * 100);
const tc = (s: string) =>
    s.toLowerCase().replace(/(^|[\s(/-])([a-záéíóúñ])/g, (_, p, c) => p + c.toUpperCase());

export default function LocalPriceAnalysis({ town, prov, nationalAvg95 }: Props) {
    const nombre = town.nombre;
    const provNombre = tc(prov.nombreProvincia);

    // Tendencia semanal (histórico guarda ~14 días)
    const hist = town.historico || [];
    let trendTxt: string | null = null;
    if (hist.length >= 2) {
        const last = hist[hist.length - 1];
        const ref = hist[Math.max(0, hist.length - 8)];
        if (ref.precioGasolina95 > 0) {
            const pct = ((last.precioGasolina95 - ref.precioGasolina95) / ref.precioGasolina95) * 100;
            const abs = Math.abs(pct);
            if (abs < 0.15) {
                trendTxt = `El precio de la gasolina 95 en ${nombre} se ha mantenido estable en la última semana.`;
            } else {
                trendTxt = `El precio de la gasolina 95 en ${nombre} ha ${
                    pct < 0 ? 'bajado' : 'subido'
                } un ${abs.toFixed(1).replace('.', ',')}% en la última semana.`;
            }
        }
    }

    // Comparativa provincial y nacional
    const vsProv = cent(town.precioGasolina95 - prov.precioMedioGasolina95);
    const vsNac = nationalAvg95 > 0 ? cent(town.precioGasolina95 - nationalAvg95) : null;

    const posTxt = (c: number, ref: string) =>
        c === 0
            ? `coincide con la media de ${ref}`
            : `está ${Math.abs(c)} céntimo${Math.abs(c) === 1 ? '' : 's'} por ${
                  c < 0 ? 'debajo' : 'encima'
              } de la media de ${ref}`;

    // Ahorro por depósito (más cara vs más barata del top5)
    const precios95 = (town.top5 || [])
        .map((s) => s.precio95)
        .filter((p): p is number => p != null && p > 0);
    let ahorroTxt: string | null = null;
    if (precios95.length >= 2) {
        const min = Math.min(...precios95);
        const max = Math.max(...precios95);
        const ahorro50 = (max - min) * 50;
        if (ahorro50 >= 0.5) {
            ahorroTxt = `Entre la gasolinera más barata (${eur(min)}€/L) y la más cara (${eur(
                max
            )}€/L) de ${nombre} hay una diferencia de ${ahorro50
                .toFixed(2)
                .replace('.', ',')}€ en un depósito de 50 litros.`;
        }
    }

    // Localidades cercanas (misma provincia, hasta 6, distintas)
    const cercanas = (prov.localidades || [])
        .filter((l) => l.slug !== town.slug && l.precioGasolina95 > 0)
        .sort((a, b) => a.precioGasolina95 - b.precioGasolina95)
        .slice(0, 6);

    return (
        <section
            style={{
                background: 'var(--rg-surface)',
                border: '1px solid var(--rg-border)',
                borderRadius: 'var(--rg-radius)',
                padding: '28px 24px',
                margin: '32px 0',
            }}
        >
            <h2 style={{ marginTop: 0 }}>Análisis del precio de la gasolina en {nombre}</h2>

            <p style={{ color: 'var(--rg-text-secondary)', lineHeight: 1.7 }}>
                {trendTxt ? `${trendTxt} ` : ''}
                Con la gasolina 95 a <strong>{eur(town.precioGasolina95)}€/L</strong>, {nombre}{' '}
                {posTxt(vsProv, `la provincia de ${provNombre}`)}
                {vsNac != null ? ` y ${posTxt(vsNac, 'España')}` : ''}. El diésel se sitúa en{' '}
                <strong>{eur(town.precioDiesel)}€/L</strong>.
                {ahorroTxt ? ` ${ahorroTxt}` : ''}
            </p>

            <div
                style={{
                    display: 'grid',
                    gap: 12,
                    gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
                    margin: '20px 0 8px',
                }}
            >
                <Stat label={`Gasolina 95 en ${nombre}`} value={`${eur(town.precioGasolina95)}€`} />
                <Stat label={`Media ${provNombre}`} value={`${eur(prov.precioMedioGasolina95)}€`} />
                {nationalAvg95 > 0 && <Stat label="Media España" value={`${eur(nationalAvg95)}€`} />}
                <Stat
                    label="Diferencia vs provincia"
                    value={`${vsProv > 0 ? '+' : ''}${vsProv} cént`}
                />
            </div>

            {cercanas.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <h3 style={{ marginBottom: 12 }}>Precios en localidades cercanas de {provNombre}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {cercanas.map((l) => (
                            <Link
                                key={l.slug}
                                href={`/precio-gasolina/${prov.provincia}/${l.slug}`}
                                className="rg-btn secondary"
                                style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                            >
                                {l.nombre}: {eur(l.precioGasolina95)}€
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                background: 'var(--rg-bg-alt)',
                border: '1px solid var(--rg-border)',
                borderRadius: 10,
                padding: '12px 14px',
            }}
        >
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--rg-text-secondary)' }}>{label}</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--rg-primary)' }}>{value}</span>
        </div>
    );
}
