import { Helmet } from 'react-helmet-async';


export default function ImpressumPage() {
    return (
        <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black">
            <Helmet>
                <title>Mentions Légales (Impressum) | ATHANA</title>
                <meta name="description" content="Mentions légales et informations de contact pour ATHANA." />
            </Helmet>
            <main className="max-w-4xl mx-auto px-6 py-32 space-y-12">
                <div className="space-y-4">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Mentions Légales</h1>
                    <p className="text-xl text-athana-muted">Impressum</p>
                </div>

                <div className="prose prose-invert max-w-none text-athana-text/80 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Éditeur du Site</h2>
                        <p>
                            <strong>ATHANA</strong><br />
                            Route de Challex 6<br />
                            1283 La Plaine<br />
                            Suisse
                        </p>
                        <p className="mt-4">
                            <strong>Contact :</strong><br />
                            Email : <a href="mailto:contact@athana.ch" className="text-athana-accent hover:underline">contact@athana.ch</a><br />
                            Téléphone : <a href="tel:+41783399895" className="text-athana-accent hover:underline">+41 78 339 98 95</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Représentants Légaux</h2>
                        <p>
                            L'agence ATHANA est représentée par sa direction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Hébergement</h2>
                        <p>
                            Ce site est hébergé sur une infrastructure cloud sécurisée.<br />
                            Fournisseur : Vercel Inc.<br />
                            Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, USA
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Propriété Intellectuelle</h2>
                        <p>
                            L'ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) est la propriété exclusive de ATHANA ou de ses partenaires. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Responsabilité</h2>
                        <p>
                            ATHANA ne peut être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site internet. De plus, nous déclinons toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur ce site.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
