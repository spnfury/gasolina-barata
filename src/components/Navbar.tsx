'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SmartDownloadButton from '@/components/SmartDownloadButton';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="rg-navbar">
            <div className="rg-navbar-inner">
                <Link href="/" className="rg-nav-logo">
                    ⛽ <span>Gasolina</span>Barata
                </Link>

                {/* Desktop nav */}
                <div className="rg-nav-links">
                    <Link href="/">Inicio</Link>
                    <Link href="/blog">Blog</Link>
                    <a href="/#provincias">Provincias</a>
                    <SmartDownloadButton variant="nav" className="rg-nav-cta" />
                </div>

                {/* Hamburger button */}
                <button
                    className="rg-hamburger"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menú"
                >
                    <span className={`rg-hamburger-line ${menuOpen ? 'open' : ''}`} />
                    <span className={`rg-hamburger-line ${menuOpen ? 'open' : ''}`} />
                    <span className={`rg-hamburger-line ${menuOpen ? 'open' : ''}`} />
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="rg-mobile-menu" onClick={() => setMenuOpen(false)}>
                    <div className="rg-mobile-menu-inner" onClick={(e) => e.stopPropagation()}>
                        <Link href="/" onClick={() => setMenuOpen(false)}>🏠 Inicio</Link>
                        <Link href="/blog" onClick={() => setMenuOpen(false)}>📰 Blog</Link>
                        <a href="/#provincias" onClick={() => setMenuOpen(false)}>⛽ Provincias</a>
                        <SmartDownloadButton
                            variant="nav"
                            className="rg-nav-cta"
                            style={{ textAlign: 'center', marginTop: '8px' }}
                        />
                    </div>
                </div>
            )}
        </nav>
    );
}
