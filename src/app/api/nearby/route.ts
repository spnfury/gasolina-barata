import { NextResponse } from 'next/server';
import locationsData from '@/data/locations.json';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const latStr = searchParams.get('lat');
        const lonStr = searchParams.get('lon');

        if (!latStr || !lonStr) {
            return NextResponse.json({ error: 'Faltan coordenadas lat y lon' }, { status: 400 });
        }

        const userLat = parseFloat(latStr);
        const userLon = parseFloat(lonStr);

        if (isNaN(userLat) || isNaN(userLon)) {
            return NextResponse.json({ error: 'Coordenadas inválidas' }, { status: 400 });
        }

        const data = locationsData as any;
        const dedupedMap = new Map();

        // Extraer todas las estaciones de los top5
        // Se hace un flattened de la base de datos local
        data.locations.forEach((prov: any) => {
            prov.localidades.forEach((loc: any) => {
                if (loc.top5) {
                    loc.top5.forEach((st: any) => {
                        if (st.latitud && st.longitud) {
                            const dist = getDistance(userLat, userLon, st.latitud, st.longitud);
                            // Filtro inicial: solo a menos de 20km
                            if (dist <= 20) {
                                const key = `${st.latitud}-${st.longitud}`;
                                if (!dedupedMap.has(key)) {
                                    dedupedMap.set(key, {
                                        ...st,
                                        distance: dist,
                                        localidad: loc.nombre,
                                        provincia: prov.nombreProvincia
                                    });
                                }
                            }
                        }
                    });
                }
            });
        });

        const nearby = Array.from(dedupedMap.values());
        
        // Ordenamos por distancia (las más cercanas primero)
        nearby.sort((a, b) => a.distance - b.distance);

        // Devolvemos el Top 15 más cercano
        return NextResponse.json({ stations: nearby.slice(0, 15) }, {
            headers: {
                'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
            }
        });

    } catch (e) {
        console.error('Error calculando ubicaciones cercanas:', e);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
