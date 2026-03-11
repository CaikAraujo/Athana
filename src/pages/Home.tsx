import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Hero } from '../../components/Hero';

// Lazy load components below the fold for better initial load performance
const Services = React.lazy(() => import('../../components/Services').then(mod => ({ default: mod.Services })));
const Testimonials = React.lazy(() => import('../../components/Testimonials').then(mod => ({ default: mod.Testimonials })));
const WhyChooseUs = React.lazy(() => import('../../components/WhyChooseUs').then(mod => ({ default: mod.WhyChooseUs })));
const Contact = React.lazy(() => import('../../components/Contact').then(mod => ({ default: mod.Contact })));

export default function Home() {
    return (
        <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black">
            <Helmet>
                <title>Agence de Développement & Design Premium | ATHANA</title>
                <meta name="description" content="Agence de développement web premium en Suisse. Experts React pour des sites ultra-rapides et des applications web sur mesure." />
            </Helmet>
            <main>
                <Hero />
                <Suspense fallback={<div>Loading...</div>}>
                    <Services />
                    <WhyChooseUs />
                    <Testimonials />
                    <Contact />
                </Suspense>
            </main>
        </div>
    );
}
