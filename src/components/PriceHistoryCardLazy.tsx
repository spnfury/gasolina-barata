'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PriceHistoryCard = dynamic(() => import('@/components/PriceHistoryCard'), {
    ssr: false,
    loading: () => (
        <div style={{
            minHeight: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--rg-text-secondary)',
        }}>
            Cargando histórico…
        </div>
    ),
});

interface Props {
    currentPrice95: number;
    currentPriceDiesel: number;
    historico: any[];
}

export default function PriceHistoryCardLazy(props: Props) {
    return <PriceHistoryCard {...props} />;
}
