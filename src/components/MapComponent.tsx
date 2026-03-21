'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Station {
  rotulo: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  precio95: number | null;
  precioDiesel: number | null;
}

interface MapComponentProps {
  stations: Station[];
}

export default function MapComponent({ stations }: MapComponentProps) {
  // Filtrar estaciones que tengan lat/lon válido
  const validStations = stations.filter(s => s.latitud && s.longitud);

  if (validStations.length === 0) {
    return <p style={{ color: 'var(--rg-text-secondary)' }}>No hay coordenadas disponibles para mostrar en el mapa.</p>;
  }

  // Centrar el mapa en la primera estación
  const center: [number, number] = [validStations[0].latitud!, validStations[0].longitud!];

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--rg-border)', zIndex: 0 }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {validStations.map((station, idx) => (
          <Marker 
            key={idx} 
            position={[station.latitud!, station.longitud!]} 
            icon={customIcon}
          >
            <Popup>
              <div style={{ fontSize: '0.9rem', color: '#111827' }}>
                <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '4px', color: '#00E676' }}>{station.rotulo}</strong>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem' }}>{station.direccion}</p>
                {station.precio95 && <div style={{ fontWeight: 600 }}>Gasolina 95: {station.precio95}€</div>}
                {station.precioDiesel && <div style={{ fontWeight: 600 }}>Diésel: {station.precioDiesel}€</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
