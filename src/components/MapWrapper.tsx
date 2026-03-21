'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Next.js App Router requires `ssr: false` dynamic imports to be inside a Client Component.
const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function MapWrapper({ stations }: { stations: any[] }) {
    return <MapComponent stations={stations} />;
}
