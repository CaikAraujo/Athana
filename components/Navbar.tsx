'use client';

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES, withLocalePath } from '../src/i18n/routing';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { t, i18n } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const firstSegment = location.pathname.split('/').filter(Boolean)[0];
  const localeFromPath = isLocale(firstSegment) ? firstSegment : null;
  const localeFromI18n = (i18n.resolvedLanguage || i18n.language || DEFAULT_LOCALE).slice(0, 2);
  const currentLocale = localeFromPath ?? (isLocale(localeFromI18n) ? localeFromI18n : DEFAULT_LOCALE);

  const toLocalePath = (path: string) => withLocalePath(currentLocale, path);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const closeOnOutside = () => setIsLangOpen(false);
    window.addEventListener('click', closeOnOutside);
    return () => window.removeEventListener('click', closeOnOutside);
  }, []);

  const handleLanguageChange = (nextLocale: string) => {
    const cleanPath = location.pathname.split('/').filter(Boolean);
    const pathWithoutLocale = cleanPath.length > 0 && isLocale(cleanPath[0])
      ? `/${cleanPath.slice(1).join('/')}`
      : location.pathname;
    const localizedPath = withLocalePath(nextLocale, pathWithoutLocale === '' ? '/' : pathWithoutLocale);
    void i18n.changeLanguage(nextLocale);
    navigate(localizedPath + location.search + location.hash);
    setIsLangOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-athana-black/80 backdrop-blur-md border-b border-white/5 py-4'
        : 'bg-transparent py-6'
        }`}
    >
      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10 md:hidden animate-fade-in"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to={toLocalePath('/')} className="font-display font-bold text-2xl tracking-tighter text-white flex items-center gap-2" aria-label="ATHANA Home">
          <img src="/images/athana_logo.svg" alt="Athana Logo" className="h-14 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to={toLocalePath('/')}
            className="text-sm font-medium text-athana-text/80 hover:text-athana-accent transition-colors"
          >
            {t('nav.home')}
          </Link>
          <Link
            to={toLocalePath('/services')}
            className="text-sm font-medium text-athana-text/80 hover:text-athana-accent transition-colors"
          >
            {t('nav.services')}
          </Link>
          <Link
            to={toLocalePath('/projets')}
            className="text-sm font-medium text-athana-text/80 hover:text-athana-accent transition-colors"
          >
            {t('nav.projects')}
          </Link>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsLangOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:border-athana-accent/50 transition-colors cursor-pointer"
              aria-label={t('language.label')}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                <Globe className="h-3.5 w-3.5 text-white/90" />
              </span>
              <span>{currentLocale.toUpperCase()}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-white/70 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-athana-dark/95 backdrop-blur-md p-1.5 shadow-2xl z-50">
                {SUPPORTED_LOCALES.map((localeOption) => (
                  <button
                    key={localeOption}
                    type="button"
                    onClick={() => handleLanguageChange(localeOption)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                      localeOption === currentLocale
                        ? 'bg-athana-accent/15 text-athana-accent'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {localeOption.toUpperCase()} · {t(`language.${localeOption}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link
            to={toLocalePath('/demarrer')}
            className="bg-white text-black px-5 py-2.5 text-sm font-bold rounded hover:bg-athana-accent hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer"
          >
            {t('nav.startProject')}
            <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">_&gt;</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white hover:text-athana-accent"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-athana-dark border-b border-white/10 p-6 flex flex-col gap-6 animate-fade-in shadow-2xl max-h-[80vh] overflow-y-auto">
          {/* Static Links */}
          <Link
            to={toLocalePath('/')}
            className="text-lg font-medium text-white hover:text-athana-accent"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.home')}
          </Link>
          <Link
            to={toLocalePath('/services')}
            className="text-lg font-medium text-white hover:text-athana-accent"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.services')}
          </Link>

          {/* Dynamic Links */}
          <Link
            to={toLocalePath('/projets')}
            className="text-lg font-medium text-white hover:text-athana-accent"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.projects')}
          </Link>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-athana-muted">{t('language.label')}</p>
            <div className="flex gap-2">
              {SUPPORTED_LOCALES.map((localeOption) => (
                <button
                  key={localeOption}
                  type="button"
                  onClick={() => {
                    handleLanguageChange(localeOption);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded border text-xs uppercase tracking-wider ${localeOption === currentLocale ? 'border-athana-accent text-athana-accent' : 'border-white/15 text-white/80'}`}
                >
                  {localeOption}
                </button>
              ))}
            </div>
          </div>
          <Link
            to={toLocalePath('/demarrer')}
            onClick={() => setIsOpen(false)}
            className="bg-athana-accent text-black text-center py-3 rounded font-bold uppercase tracking-wider cursor-pointer"
          >
            {t('nav.startProject')}
          </Link>
        </div>
      )}
    </nav>
  );
};