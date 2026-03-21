'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Seo.module.css';

interface HistorialItem {
  date: string;
  precioGasolina95: number;
  precioDiesel: number;
}

interface PriceHistoryCardProps {
  currentPrice95: number;
  currentPriceDiesel: number;
  historico: HistorialItem[];
}

export default function PriceHistoryCard({
  currentPrice95,
  currentPriceDiesel,
  historico,
}: PriceHistoryCardProps) {
  
  if (!historico || historico.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.priceTitle}>📉 Evolución del Precio (Últimos 7 días)</h3>
        <p style={{ color: 'var(--rg-text-secondary)' }}>Aún no hay datos históricos suficientes.</p>
      </div>
    );
  }

  // Calculate generic last week stats for text context if possible
  const startPrice95 = historico[0].precioGasolina95;
  const startPriceDiesel = historico[0].precioDiesel;
  
  const diff95 = (currentPrice95 - startPrice95).toFixed(3);
  const diffDiesel = (currentPriceDiesel - startPriceDiesel).toFixed(3);

  const formatDate = (dateStr: any) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
      <h3 className={styles.priceTitle}>📈 Evolución del Precio en la Última Semana</h3>
      <p style={{ color: 'var(--rg-text-secondary)', marginBottom: '24px' }}>
        Descubre cómo ha variado el litro de carburante en los últimos días comparado con hoy.
      </p>
      
      <div style={{ width: '100%', height: 300, marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={historico}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorG95" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E676" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDiesel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="rgba(255,255,255,0.3)" tick={{fontSize: 12}} />
            <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.3)" tick={{fontSize: 12}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              labelFormatter={formatDate}
            />
            <Area type="monotone" name="Gasolina 95" dataKey="precioGasolina95" stroke="#00E676" strokeWidth={3} fillOpacity={1} fill="url(#colorG95)" />
            <Area type="monotone" name="Diésel" dataKey="precioDiesel" stroke="#EAB308" strokeWidth={3} fillOpacity={1} fill="url(#colorDiesel)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.priceGrid}>
        <div className={styles.priceItem}>
          <span className={styles.priceLabel}>Variación Gasolina 95 (7 días)</span>
          <span className={styles.priceValue} style={{ color: Number(diff95) <= 0 ? '#00E676' : '#EF4444' }}>
            {Number(diff95) > 0 ? '+' : ''}{diff95}€
          </span>
          <span style={{ fontSize: '0.85rem', display: 'block', marginTop: '8px', color: 'var(--rg-text-secondary)' }}>
            {Number(diff95) <= 0 ? '↓ Abaratamiento' : '↑ Encarecimiento'}
          </span>
        </div>
        <div className={styles.priceItem}>
          <span className={styles.priceLabel}>Variación Diésel (7 días)</span>
          <span className={styles.priceValue} style={{ color: Number(diffDiesel) <= 0 ? '#00E676' : '#EF4444' }}>
            {Number(diffDiesel) > 0 ? '+' : ''}{diffDiesel}€
          </span>
          <span style={{ fontSize: '0.85rem', display: 'block', marginTop: '8px', color: 'var(--rg-text-secondary)' }}>
            {Number(diffDiesel) <= 0 ? '↓ Abaratamiento' : '↑ Encarecimiento'}
          </span>
        </div>
      </div>
    </div>
  );
}
