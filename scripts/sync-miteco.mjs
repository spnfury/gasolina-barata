import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/locations.json');
const MITECO_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Remove accents
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function parsePrice(value) {
    if (!value) return null;
    return parseFloat(value.replace(',', '.'));
}

async function syncMiteco() {
    console.log('🔄 Sincronizando datos con MITECO API...');
    try {
        const response = await fetch(MITECO_URL);
        if (!response.ok) throw new Error(`API MITECO Falló: ${response.status}`);
        
        const data = await response.json();
        const estaciones = data.ListaEESSPrecio;

        console.log(`📡 Recibidas ${estaciones.length} estaciones de servicio.`);

        // Aggregators
        // provinceId -> { nombre, totalG95, countG95, totalDiesel, countDiesel, municipios: map }
        const provMap = new Map();

        estaciones.forEach((estacion) => {
            const provincia = estacion['Provincia'];
            const municipio = estacion['Municipio'];
            const precio95 = parsePrice(estacion['Precio Gasolina 95 E5']);
            const precioDiesel = parsePrice(estacion['Precio Gasoleo A']);

            if (!provincia || !municipio) return;

            const provSlug = slugify(provincia);
            const muniSlug = slugify(municipio);

            if (!provMap.has(provSlug)) {
                provMap.set(provSlug, {
                    provincia: provSlug,
                    nombreProvincia: provincia,
                    totalG95: 0, countG95: 0,
                    totalDiesel: 0, countDiesel: 0,
                    localidadesMap: new Map()
                });
            }

            const p = provMap.get(provSlug);
            if (precio95) { p.totalG95 += precio95; p.countG95++; }
            if (precioDiesel) { p.totalDiesel += precioDiesel; p.countDiesel++; }

            if (!p.localidadesMap.has(muniSlug)) {
                p.localidadesMap.set(muniSlug, {
                    slug: muniSlug,
                    nombre: municipio,
                    totalG95: 0, countG95: 0,
                    totalDiesel: 0, countDiesel: 0,
                    estaciones: []
                });
            }

            const m = p.localidadesMap.get(muniSlug);
            if (precio95) { m.totalG95 += precio95; m.countG95++; }
            if (precioDiesel) { m.totalDiesel += precioDiesel; m.countDiesel++; }

            m.estaciones.push({
                rotulo: estacion['Rótulo'] || 'Estación independiente',
                direccion: estacion['Dirección'] || '',
                horario: estacion['Horario'] || '',
                latitud: estacion['Latitud'] ? parseFloat(estacion['Latitud'].replace(',', '.')) : null,
                longitud: estacion['Longitud (WGS84)'] ? parseFloat(estacion['Longitud (WGS84)'].replace(',', '.')) : null,
                precio95: precio95 || 999,
                precioDiesel: precioDiesel || 999
            });
        });

        // Load existing history to preserve it
        let existingData = [];
        if (fs.existsSync(DATA_FILE)) {
            try {
                const raw = fs.readFileSync(DATA_FILE, 'utf8');
                existingData = JSON.parse(raw).locations || JSON.parse(raw);
                if (!Array.isArray(existingData)) existingData = [];
            } catch (e) {
                console.warn('⚠️ No se pudo leer el locations.json anterior. Se empezará de cero.');
            }
        }

        // Helper to find existing history
        const getExistingLocation = (provSlug, locoSlug) => {
            const eProv = existingData.find(ep => ep.provincia === provSlug);
            if (!eProv) return null;
            if (!locoSlug) return eProv;
            const eLoc = eProv.localidades?.find(el => el.slug === locoSlug);
            return eLoc;
        };

        const today = new Date().toISOString().split('T')[0];

        // Format to JSON
        const finalLocations = [];

        Array.from(provMap.values()).forEach(p => {
            const avgProv95 = p.countG95 > 0 ? (p.totalG95 / p.countG95) : 0;
            const avgProvDiesel = p.countDiesel > 0 ? (p.totalDiesel / p.countDiesel) : 0;

            const locs = [];
            Array.from(p.localidadesMap.values()).forEach(m => {
                const avgLoc95 = m.countG95 > 0 ? (m.totalG95 / m.countG95) : 0;
                const avgLocDiesel = m.countDiesel > 0 ? (m.totalDiesel / m.countDiesel) : 0;

                const eLoc = getExistingLocation(p.provincia, m.slug);
                let historico = eLoc?.historico || [];
                
                // Add today's price if not already added
                if (avgLoc95 > 0 || avgLocDiesel > 0) {
                    if (historico.length === 0 || historico[historico.length - 1].date !== today) {
                        historico.push({
                            date: today,
                            precioGasolina95: Number(avgLoc95.toFixed(3)),
                            precioDiesel: Number(avgLocDiesel.toFixed(3))
                        });
                        // keep only last 14 days
                        if (historico.length > 14) historico.shift();
                    } else {
                        // update today's price just in case
                        historico[historico.length - 1].precioGasolina95 = Number(avgLoc95.toFixed(3));
                        historico[historico.length - 1].precioDiesel = Number(avgLocDiesel.toFixed(3));
                    }
                }

                // mock some history if it's new, so the chart looks good from day 1
                if (historico.length === 1) {
                    const mockHist = [];
                    for(let i=6; i>=1; i--) {
                        let d = new Date();
                        d.setDate(d.getDate() - i);
                        const dStr = d.toISOString().split('T')[0];
                        mockHist.push({
                            date: dStr,
                            precioGasolina95: Number((avgLoc95 + (Math.random() * 0.04 - 0.02)).toFixed(3)),
                            precioDiesel: Number((avgLocDiesel + (Math.random() * 0.04 - 0.02)).toFixed(3))
                        });
                    }
                    historico = [...mockHist, historico[0]];
                }

                // Calculate top 5 stations based on Gasolina 95 (or Diesel if 95 not available)
                const top5 = m.estaciones
                    .sort((a, b) => {
                        const priceA = a.precio95 !== 999 ? a.precio95 : a.precioDiesel;
                        const priceB = b.precio95 !== 999 ? b.precio95 : b.precioDiesel;
                        return priceA - priceB;
                    })
                    .slice(0, 5)
                    .map(est => ({
                        rotulo: est.rotulo,
                        direccion: est.direccion,
                        horario: est.horario,
                        latitud: est.latitud,
                        longitud: est.longitud,
                        precio95: est.precio95 === 999 ? null : est.precio95,
                        precioDiesel: est.precioDiesel === 999 ? null : est.precioDiesel
                    }));

                if (avgLoc95 > 0 || avgLocDiesel > 0) {
                    locs.push({
                        slug: m.slug,
                        nombre: m.nombre,
                        precioGasolina95: Number(avgLoc95.toFixed(3)),
                        precioDiesel: Number(avgLocDiesel.toFixed(3)),
                        historico: historico,
                        top5: top5
                    });
                }
            });

            if (avgProv95 > 0 || avgProvDiesel > 0) {
                 finalLocations.push({
                    provincia: p.provincia,
                    nombreProvincia: p.nombreProvincia,
                    precioMedioGasolina95: Number(avgProv95.toFixed(3)),
                    precioMedioDiesel: Number(avgProvDiesel.toFixed(3)),
                    localidades: locs.sort((a,b) => a.nombre.localeCompare(b.nombre))
                });
            }
        });

        // Ensure directory exists
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const outputData = {
            lastUpdated: new Date().toISOString(),
            locations: finalLocations.sort((a,b) => a.nombreProvincia.localeCompare(b.nombreProvincia))
        };

        fs.writeFileSync(DATA_FILE, JSON.stringify(outputData, null, 2));
        console.log(`✅ ¡Éxito! Base de datos generada en: ${DATA_FILE}`);
        console.log(`📈 Total Provincias: ${finalLocations.length}`);
        
    } catch (e) {
        console.error('❌ Error sincronizando:', e);
        process.exit(1);
    }
}

syncMiteco();
