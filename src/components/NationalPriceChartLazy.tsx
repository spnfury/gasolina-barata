'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const NationalPriceChart = dynamic(() => import('@/components/NationalPriceChart'), {
    ssr: false,
    loading: () => (
        <div style={{
            minHeight: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--rg-text-secondary)',
        }}>
            Cargando gráfica…
        </div>
    ),
});

export default function NationalPriceChartLazy({ historico }: { historico: any[] }) {
    return <NationalPriceChart historico={historico} />;
}
