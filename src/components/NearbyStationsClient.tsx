'use client';

import React, { useState } from 'react';
import MapWrapper from '@/components/MapWrapper';
import Link from 'next/link';

export default function NearbyStationsClient() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [stations, setStations] = useState<any[]>([]);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLocate = () => {
        if (!navigator.geolocation) {
            setStatus('error');
            setErrorMsg('La geolocalización no está soportada por tu navegador.');
            return;
        }

        setStatus('loading');
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`/api/nearby?lat=${latitude}&lon=${longitude}`);
                    if (!res.ok) throw new Error('Error al obtener datos');
                    
                    const data = await res.json();
                    setStations(data.stations || []);
                    setStatus('success');
                } catch (e: any) {
                    setStatus('error');
                    setErrorMsg('No pudimos cargar las gasolineras cercanas.');
                }
            },
            (error) => {
                setStatus('error');
                if (error.code === error.PERMISSION_DENIED) {
                    setErrorMsg('Por favor, permite el acceso a tu ubicación en el navegador para encontrar gasolineras cercanas.');
                } else {
                    setErrorMsg('Error al detectar tu ubicación exacta. Prueba de nuevo.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div>
            {status === 'idle' && (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--rg-surface)', borderRadius: 'var(--rg-radius)', border: '1px dashed var(--rg-primary)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📍</div>
                    <h2 style={{ marginBottom: '16px' }}>Encuentra el mejor precio a tu alrededor</h2>
                    <p style={{ color: 'var(--rg-text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.6' }}>
                        Utiliza el GPS de tu dispositivo para buscar instantáneamente y comparar los precios de las gasolineras en un radio de 20km.
                    </p>
                    <button 
                        onClick={handleLocate}
                        className="rg-btn primary"
                        style={{ padding: '16px 32px', fontSize: '1.1rem', boxShadow: '0 8px 24px rgba(46, 204, 113, 0.3)' }}
                    >
                        Buscar gasolineras cerca de mí ahora
                    </button>
                    <p style={{ fontSize: '0.8rem', color: 'var(--rg-text-secondary)', marginTop: '24px' }}>
                        * Privacidad garantizada: tu ubicación no se guarda ni se envía a terceros, solo se usa en este momento para calcular la distancia.
                    </p>
                </div>
            )}

            {status === 'loading' && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div className="rg-spinner" style={{ margin: '0 auto 24px', width: '48px', height: '48px', border: '4px solid var(--rg-border)', borderTopColor: 'var(--rg-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <style dangerouslySetInnerHTML={{__html: `@keyframes spin { to { transform: rotate(360deg); } }`}} />
                    <h3>Buscando los mejores precios...</h3>
                    <p style={{ color: 'var(--rg-text-secondary)', marginTop: '8px' }}>Calculando las rutas más cortas a tu ubicación actual.</p>
                </div>
            )}

            {status === 'error' && (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,50,50,0.05)', borderRadius: 'var(--rg-radius)', border: '1px solid rgba(255,50,50,0.2)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                    <h3 style={{ color: '#ff4d4d', marginBottom: '16px' }}>¡Ups! Hubo un problema</h3>
                    <p style={{ marginBottom: '24px', color: 'var(--rg-text)' }}>{errorMsg}</p>
                    <button onClick={() => setStatus('idle')} className="rg-btn secondary">Intentar de nuevo</button>
                </div>
            )}

            {status === 'success' && stations.length > 0 && (
                <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <h2 style={{ marginBottom: '24px' }}>🗺️ Top {stations.length} gasolineras destacadas cerca de ti</h2>
                    
                    <div style={{ marginBottom: '40px', borderRadius: 'var(--rg-radius)', overflow: 'hidden', border: '1px solid var(--rg-border)' }}>
                        <MapWrapper stations={stations} />
                    </div>

                    <div style={{ overflowX: 'auto', background: 'var(--rg-surface)', borderRadius: 'var(--rg-radius)', border: '1px solid var(--rg-border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--rg-border)', color: 'var(--rg-text-secondary)', fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '16px' }}>Distancia</th>
                                    <th style={{ padding: '16px' }}>Estación</th>
                                    <th style={{ padding: '16px' }}>Gasolina 95</th>
                                    <th style={{ padding: '16px' }}>Diésel</th>
                                    <th style={{ padding: '16px' }}>Ubicación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stations.map((st, i) => (
                                    <tr key={i} style={{ borderBottom: i === stations.length - 1 ? 'none' : '1px solid var(--rg-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--rg-text)' }}>
                                            {st.distance < 1 ? '< 1 km' : `${st.distance.toFixed(1)} km`}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 700, color: 'var(--rg-primary)' }}>
                                            {st.rotulo.replace('Nº', 'Nº ')}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 700, fontSize: '1.1rem' }}>
                                            {st.precio95 ? `${st.precio95}€` : '-'}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 700, fontSize: '1.1rem' }}>
                                            {st.precioDiesel ? `${st.precioDiesel}€` : '-'}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--rg-text-secondary)' }}>
                                            {st.direccion}<br/>
                                            <span style={{ color: 'var(--rg-text)' }}>{st.localidad}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <button onClick={handleLocate} className="rg-btn secondary">
                            🔄 Actualizar mi ubicación
                        </button>
                    </div>
                </div>
            )}

            {status === 'success' && stations.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--rg-surface)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏜️</div>
                    <h3 style={{ marginBottom: '16px' }}>No se encontraron gasolineras low-cost cerca.</h3>
                    <p style={{ color: 'var(--rg-text-secondary)', marginTop: '8px' }}>
                        Nuestro radar local no ha encontrado estaciones en un radio de 20km. 
                        Prueba a desplazarte o amplía tu búsqueda manualmente por provincias.
                    </p>
                    <Link href="/" className="rg-btn secondary" style={{ marginTop: '24px', display: 'inline-block' }}>
                        Volver al directorio
                    </Link>
                </div>
            )}
        </div>
    );
}
