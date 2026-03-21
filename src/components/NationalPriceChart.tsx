'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface HistorialItem {
    date: string;
    precioGasolina95: number;
    precioDiesel: number;
}

interface NationalPriceChartProps {
    historico: HistorialItem[];
}

export default function NationalPriceChart({ historico }: NationalPriceChartProps) {
    if (!historico || historico.length === 0) {
        return (
            <div className="national-chart-card">
                <h3 className="national-chart-title">📈 Evolución del Precio Medio en España</h3>
                <p style={{ color: 'var(--rg-text-secondary)' }}>
                    Aún no hay datos históricos suficientes. Ejecuta la sincronización con MITECO para comenzar a acumular datos.
                </p>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    };

    // Calculate trend
    const latest = historico[historico.length - 1];
    const first = historico[0];
    const diff95 = (latest.precioGasolina95 - first.precioGasolina95).toFixed(3);
    const diffDiesel = (latest.precioDiesel - first.precioDiesel).toFixed(3);

    return (
        <div className="national-chart-card">
            <h3 className="national-chart-title">📈 Evolución del Precio Medio en España</h3>
            <p className="national-chart-subtitle">
                Precio medio nacional de Gasolina 95 y Diésel en los últimos días, según datos oficiales del MITECO.
            </p>

            <div style={{ width: '100%', height: 340, margin: '32px 0' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={historico}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="natG95" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00E676" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="natDiesel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(v: number) => `${v.toFixed(2)}€`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#111827',
                                borderColor: 'rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                            }}
                            labelFormatter={(label: any) => formatDate(String(label))}
                            formatter={(value: any, name: any) => [`${Number(value).toFixed(3)} €/L`, name]}
                        />
                        <Legend
                            wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}
                        />
                        <Area
                            type="monotone"
                            name="Gasolina 95"
                            dataKey="precioGasolina95"
                            stroke="#00E676"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#natG95)"
                        />
                        <Area
                            type="monotone"
                            name="Diésel"
                            dataKey="precioDiesel"
                            stroke="#EAB308"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#natDiesel)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="national-chart-stats">
                <div className="national-chart-stat">
                    <span className="national-chart-stat-label">Gasolina 95 hoy</span>
                    <span className="national-chart-stat-value">
                        {latest.precioGasolina95.toFixed(3)} €/L
                    </span>
                    <span
                        className="national-chart-stat-diff"
                        style={{ color: Number(diff95) <= 0 ? '#00E676' : '#EF4444' }}
                    >
                        {Number(diff95) > 0 ? '+' : ''}
                        {diff95}€ vs {historico.length} días atrás
                    </span>
                </div>
                <div className="national-chart-stat">
                    <span className="national-chart-stat-label">Diésel hoy</span>
                    <span className="national-chart-stat-value">
                        {latest.precioDiesel.toFixed(3)} €/L
                    </span>
                    <span
                        className="national-chart-stat-diff"
                        style={{ color: Number(diffDiesel) <= 0 ? '#00E676' : '#EF4444' }}
                    >
                        {Number(diffDiesel) > 0 ? '+' : ''}
                        {diffDiesel}€ vs {historico.length} días atrás
                    </span>
                </div>
            </div>
        </div>
    );
}
