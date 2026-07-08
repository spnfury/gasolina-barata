// Marcas de gasolineras + helpers de agregación. Compartido por /marca/[slug]
// y /marca/[slug]/[provincia].

export interface Brand {
    slug: string;
    name: string;
    aliases: string[];
}

export const SUPPORTED_BRANDS: Brand[] = [
    { slug: 'repsol', name: 'Repsol', aliases: ['REPSOL'] },
    { slug: 'cepsa', name: 'Cepsa', aliases: ['CEPSA', 'MOEVE'] },
    { slug: 'galp', name: 'Galp', aliases: ['GALP'] },
    { slug: 'bp', name: 'BP', aliases: ['BP'] },
    { slug: 'plenoil', name: 'Plenoil', aliases: ['PLENOIL', 'PLENERGY'] },
    { slug: 'ballenoil', name: 'Ballenoil', aliases: ['BALLENOIL'] },
    { slug: 'shell', name: 'Shell', aliases: ['SHELL'] },
    { slug: 'petroprix', name: 'Petroprix', aliases: ['PETROPRIX'] },
    { slug: 'petronor', name: 'Petronor', aliases: ['PETRONOR'] },
    { slug: 'avia', name: 'Avia', aliases: ['AVIA'] },
    { slug: 'bonarea', name: 'BonÀrea', aliases: ['BONAREA', 'BON AREA'] },
    { slug: 'esclatoil', name: 'Esclatoil', aliases: ['ESCLATOIL'] },
    { slug: 'q8', name: 'Q8', aliases: ['Q8'] },
    { slug: 'carrefour', name: 'Carrefour', aliases: ['CARREFOUR'] },
    { slug: 'campsa', name: 'Campsa', aliases: ['CAMPSA'] },
    { slug: 'alcampo', name: 'Alcampo', aliases: ['ALCAMPO'] },
    { slug: 'valcarce', name: 'Valcarce', aliases: ['VALCARCE'] },
    { slug: 'eroski', name: 'Eroski', aliases: ['EROSKI'] },
    { slug: 'meroil', name: 'Meroil', aliases: ['MEROIL'] },
    { slug: 'beroil', name: 'Beroil', aliases: ['BEROIL'] },
    { slug: 'tamoil', name: 'Tamoil', aliases: ['TAMOIL'] },
    { slug: 'disa', name: 'Disa', aliases: ['DISA'] },
    { slug: 'gasexpress', name: 'GasExpress', aliases: ['GASEXPRESS', 'GAS EXPRESS'] },
    { slug: 'eni', name: 'Eni', aliases: ['ENI'] },
    { slug: 'ham', name: 'HAM', aliases: ['HAM'] },
    { slug: 'agla', name: 'AGLA', aliases: ['AGLA'] },
    { slug: 'petromiralles', name: 'Petromiralles', aliases: ['PETROMIRALLES'] },
    { slug: 'iberdoex', name: 'Iberdoex', aliases: ['IBERDOEX'] },
    { slug: 'easygas', name: 'EasyGas', aliases: ['EASYGAS', 'EASY GAS'] },
    { slug: 'autonetoil', name: 'AutoNetOil', aliases: ['AUTONETOIL'] },
    { slug: 'gmoil', name: 'GM Oil', aliases: ['GMOIL', 'GM OIL'] },
    { slug: 'petrocat', name: 'Petrocat', aliases: ['PETROCAT'] },
];

export function getBrand(slug: string): Brand | undefined {
    return SUPPORTED_BRANDS.find((b) => b.slug === slug);
}

const matchesBrand = (rotulo: string, brand: Brand) => {
    const r = (rotulo || '').toUpperCase();
    return brand.aliases.some((a) => r.includes(a));
};

export interface BrandStation {
    rotulo: string;
    direccion: string;
    precio95: number | null;
    precioDiesel: number | null;
    localidad: string;
    provincia: string;
    provSlug: string;
    locSlug: string;
}

/** Estaciones de una marca (opcionalmente de una provincia), deduplicadas. */
export function collectBrandStations(data: any, brand: Brand, provSlug?: string): BrandStation[] {
    const out: BrandStation[] = [];
    data.locations.forEach((prov: any) => {
        if (provSlug && prov.provincia !== provSlug) return;
        prov.localidades.forEach((loc: any) => {
            (loc.top5 || []).forEach((st: any) => {
                if (matchesBrand(st.rotulo, brand)) {
                    out.push({
                        rotulo: st.rotulo,
                        direccion: st.direccion,
                        precio95: st.precio95,
                        precioDiesel: st.precioDiesel,
                        localidad: loc.nombre,
                        provincia: prov.nombreProvincia,
                        provSlug: prov.provincia,
                        locSlug: loc.slug,
                    });
                }
            });
        });
    });
    const m = new Map<string, BrandStation>();
    for (const st of out) {
        const k = `${st.rotulo}-${st.localidad}`;
        if (!m.has(k)) m.set(k, st);
    }
    return Array.from(m.values());
}

export interface BrandProvince {
    slug: string;
    nombre: string;
    count: number;
}

/** Provincias donde la marca tiene >= min estaciones (para rutas/sitemap sin thin content). */
export function brandProvinces(data: any, brand: Brand, min = 2): BrandProvince[] {
    const res: BrandProvince[] = [];
    data.locations.forEach((prov: any) => {
        const count = collectBrandStations(data, brand, prov.provincia).length;
        if (count >= min) res.push({ slug: prov.provincia, nombre: prov.nombreProvincia, count });
    });
    return res.sort((a, b) => b.count - a.count);
}
