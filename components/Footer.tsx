'use client';

import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-athana-black text-athana-muted py-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-sm">
                    <p>&copy; {new Date().getFullYear()} ATHANA. Tous les droits réservés.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 font-mono text-sm">
                    <Link to="/impressum" className="hover:text-athana-accent transition-colors">
                        MENTIONS LÉGALES
                    </Link>
                    <Link to="/confidentialite" className="hover:text-athana-accent transition-colors">
                        POLITIQUE DE CONFIDENTIALITÉ
                    </Link>
                </div>

                <div className="flex gap-6 font-mono text-sm">
                    <a href="https://www.linkedin.com/company/athana-geneve/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="hover:text-athana-accent transition-colors">LINKEDIN</a>
                </div>
            </div>
        </footer>
    );
};
