import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ModalProvider } from './context/ModalContext';
import { DEFAULT_LOCALE, isLocale, stripLocalePrefix, withLocalePath } from './i18n/routing';
import { useTranslation } from 'react-i18next';
import ScrollToTop from '../components/ScrollToTop';

// Home carrega direto (rota index)
import Home from './pages/Home';

// Páginas lazy para reduzir bundle inicial
const Demarrer = React.lazy(() => import('./pages/Demarrer'));
const Services = React.lazy(() => import('./pages/Services'));
const Projects = React.lazy(() => import('./pages/Projects'));
const Confidentialite = React.lazy(() => import('./pages/Confidentialite'));
const Impressum = React.lazy(() => import('./pages/Impressum'));
const DeveloppementWebGeneve = React.lazy(() => import('./pages/DeveloppementWebGeneve'));
const IntegrationOdooGeneve = React.lazy(() => import('./pages/IntegrationOdooGeneve'));
const ApplicationWebSecuriseeGeneve = React.lazy(() => import('./pages/ApplicationWebSecuriseeGeneve'));
const GoogleAnalytics = React.lazy(() => import('../components/GoogleAnalytics').then((mod) => ({ default: mod.GoogleAnalytics })));
const WhatsAppButton = React.lazy(() => import('../components/WhatsAppButton').then((mod) => ({ default: mod.WhatsAppButton })));

function PageSkeleton() {
    return (
        <div className="min-h-[60vh] bg-athana-black animate-pulse" aria-hidden="true" />
    );
}

function RedirectToDefaultLocale() {
    const location = useLocation();
    return <Navigate to={withLocalePath(DEFAULT_LOCALE, location.pathname)} replace />;
}

function LocaleLayout() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { i18n } = useTranslation();

    useEffect(() => {
        if (!isLocale(lang)) {
            const strippedPath = stripLocalePrefix(location.pathname);
            navigate(withLocalePath(DEFAULT_LOCALE, strippedPath), { replace: true });
            return;
        }

        if (i18n.language !== lang) {
            void i18n.changeLanguage(lang);
        }
    }, [i18n, lang, location.pathname, navigate]);

    return <Outlet />;
}

function App() {
    return (
        <Router>
            <Suspense fallback={null}>
                <GoogleAnalytics measurementId="G-FXDN2CW828" />
            </Suspense>
            <ScrollToTop />
            <ModalProvider>
                <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black antialiased">
                    <Navbar />
                    <Suspense fallback={<PageSkeleton />}>
                        <Routes>
                            <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}`} replace />} />
                            <Route path="/:lang" element={<LocaleLayout />}>
                                <Route index element={<Home />} />
                                <Route path="demarrer" element={<Demarrer />} />
                                <Route path="services" element={<Services />} />
                                <Route path="projets" element={<Projects />} />
                                <Route path="confidentialite" element={<Confidentialite />} />
                                <Route path="impressum" element={<Impressum />} />
                                <Route path="services/developpement-web-sur-mesure-geneve" element={<DeveloppementWebGeneve />} />
                                <Route path="services/integration-odoo-erp-geneve" element={<IntegrationOdooGeneve />} />
                                <Route path="services/application-web-securisee-suisse" element={<ApplicationWebSecuriseeGeneve />} />
                            </Route>
                            <Route path="*" element={<RedirectToDefaultLocale />} />
                        </Routes>
                    </Suspense>
                    <Suspense fallback={null}>
                        <WhatsAppButton />
                    </Suspense>
                    <Footer />
                </div>
            </ModalProvider>
        </Router>
    );
}

export default App;
