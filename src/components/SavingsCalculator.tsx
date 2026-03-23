'use client';

import React, { useState, useMemo } from 'react';

const FUEL_TYPES = [
    { id: 'gasolina95', label: 'Gasolina 95', icon: '⛽' },
    { id: 'diesel', label: 'Diésel', icon: '🛢️' },
];

function formatEuro(n: number) {
    return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function SavingsCalculator() {
    const [kmPerWeek, setKmPerWeek] = useState(300);
    const [consumption, setConsumption] = useState(7);
    const [fuelType, setFuelType] = useState('gasolina95');
    const [priceDiff, setPriceDiff] = useState(8); // cents
    const [animating, setAnimating] = useState(false);

    const results = useMemo(() => {
        const litrosWeek = (kmPerWeek * consumption) / 100;
        const litrosMonth = litrosWeek * 4.33;
        const litrosYear = litrosMonth * 12;
        const savingsMonth = (litrosMonth * priceDiff) / 100;
        const savingsYear = (litrosYear * priceDiff) / 100;
        const fullTanks = Math.round(savingsYear / 55); // avg 55€ per tank

        return { litrosMonth: Math.round(litrosMonth), litrosYear: Math.round(litrosYear), savingsMonth, savingsYear, fullTanks };
    }, [kmPerWeek, consumption, priceDiff]);

    const handleChange = (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(Number(e.target.value));
        setAnimating(true);
        setTimeout(() => setAnimating(false), 400);
    };

    return (
        <div className="calc-container">
            <div className="calc-inputs">
                <h2 className="calc-section-title">📊 Tus datos de conducción</h2>

                <div className="calc-field">
                    <label className="calc-label">
                        <span>Kilómetros semanales</span>
                        <span className="calc-value-badge">{kmPerWeek} km</span>
                    </label>
                    <input
                        type="range" min="50" max="1500" step="10"
                        value={kmPerWeek}
                        onChange={handleChange(setKmPerWeek)}
                        className="calc-slider"
                    />
                    <div className="calc-range-labels">
                        <span>50 km</span><span>1.500 km</span>
                    </div>
                </div>

                <div className="calc-field">
                    <label className="calc-label">
                        <span>Consumo medio</span>
                        <span className="calc-value-badge">{consumption} L/100km</span>
                    </label>
                    <input
                        type="range" min="3" max="18" step="0.5"
                        value={consumption}
                        onChange={handleChange(setConsumption)}
                        className="calc-slider"
                    />
                    <div className="calc-range-labels">
                        <span>3 L/100km</span><span>18 L/100km</span>
                    </div>
                </div>

                <div className="calc-field">
                    <label className="calc-label">
                        <span>Tipo de combustible</span>
                    </label>
                    <div className="calc-fuel-toggle">
                        {FUEL_TYPES.map(ft => (
                            <button
                                key={ft.id}
                                className={`calc-fuel-btn ${fuelType === ft.id ? 'active' : ''}`}
                                onClick={() => setFuelType(ft.id)}
                            >
                                {ft.icon} {ft.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="calc-field">
                    <label className="calc-label">
                        <span>Diferencia de precio por litro</span>
                        <span className="calc-value-badge">{priceDiff} céntimos</span>
                    </label>
                    <input
                        type="range" min="2" max="20" step="1"
                        value={priceDiff}
                        onChange={handleChange(setPriceDiff)}
                        className="calc-slider"
                    />
                    <div className="calc-range-labels">
                        <span>2 cént.</span><span>20 cént.</span>
                    </div>
                    <p className="calc-hint">
                        La diferencia media entre la gasolinera más cara y la más barata en una misma zona es de 8-12 céntimos.
                    </p>
                </div>
            </div>

            <div className={`calc-results ${animating ? 'pulse' : ''}`}>
                <h2 className="calc-section-title">💰 Tu ahorro estimado</h2>

                <div className="calc-result-card highlight">
                    <span className="calc-result-label">Ahorro anual</span>
                    <span className="calc-result-value big">{formatEuro(results.savingsYear)}</span>
                </div>

                <div className="calc-result-row">
                    <div className="calc-result-card">
                        <span className="calc-result-label">Ahorro mensual</span>
                        <span className="calc-result-value">{formatEuro(results.savingsMonth)}</span>
                    </div>
                    <div className="calc-result-card">
                        <span className="calc-result-label">Depósitos gratis al año</span>
                        <span className="calc-result-value">{results.fullTanks}</span>
                    </div>
                </div>

                <div className="calc-result-row">
                    <div className="calc-result-card">
                        <span className="calc-result-label">Litros al mes</span>
                        <span className="calc-result-value">{results.litrosMonth} L</span>
                    </div>
                    <div className="calc-result-card">
                        <span className="calc-result-label">Litros al año</span>
                        <span className="calc-result-value">{results.litrosYear} L</span>
                    </div>
                </div>

                <div className="calc-cta-box">
                    <p>
                        🚀 Con <strong>RadarGas</strong> encuentras la gasolinera más barata en segundos. 
                        Empieza a ahorrar <strong>{formatEuro(results.savingsYear)}</strong> al año.
                    </p>
                </div>
            </div>
        </div>
    );
}
