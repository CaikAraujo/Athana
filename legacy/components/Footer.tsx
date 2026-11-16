'use client';

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, isLocale, withLocalePath } from '../src/i18n/routing';

export const Footer: React.FC = () => {
    const { t } = useTranslation('common');
    const { lang } = useParams();
    const currentLocale = isLocale(lang) ? lang : DEFAULT_LOCALE;
    const toLocalePath = (path: string) => withLocalePath(currentLocale, path);

    return (
        <footer className="bg-athana-black text-athana-muted py-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-sm">
                    <p>&copy; {new Date().getFullYear()} ATHANA. {t('footer.rightsReserved')}</p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 font-mono text-sm">
                    <Link to={toLocalePath('/impressum')} className="hover:text-athana-accent transition-colors">
                        {t('footer.legal')}
                    </Link>
                    <Link to={toLocalePath('/confidentialite')} className="hover:text-athana-accent transition-colors">
                        {t('footer.privacy')}
                    </Link>
                </div>

                <div className="flex gap-6 font-mono text-sm">
                    <a href="https://www.linkedin.com/company/athana-geneve/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="hover:text-athana-accent transition-colors">LINKEDIN</a>
                </div>
            </div>
        </footer>
    );
};
