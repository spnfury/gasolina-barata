import React from 'react';
import styles from './Seo.module.css';

interface AppDownloadCtaProps {
  locationName: string;
}

export default function AppDownloadCta({ locationName }: AppDownloadCtaProps) {
  return (
    <div className={styles.ctaContainer}>
      <h3 className={styles.ctaTitle}>💰 ¡Ahorra en cada depósito en {locationName}!</h3>
      <p className={styles.ctaSubtitle}>
        Descarga RadarGas ahora y descubre en tiempo real el mapa con las gasolineras más baratas cerca de ti. Cientos de conductores ya ahorran dinero cada mes.
      </p>
      <a href="https://app.radargas.com" className="rg-btn primary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
        🚀 Descargar RadarGas Gratis
      </a>
    </div>
  );
}
