import { Helmet } from 'react-helmet-async';


export default function ConfidentialitePage() {
    return (
        <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black">
            <Helmet>
                <title>Politique de Confidentialité | ATHANA</title>
                <meta name="description" content="Protection des données et conformité nLPD." />
            </Helmet>
            <main className="max-w-4xl mx-auto px-6 py-32 space-y-12">
                <div className="space-y-4">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Politique de Confidentialité</h1>
                    <p className="text-xl text-athana-muted">Conformité à la Nouvelle Loi sur la Protection des Données (nLPD)</p>
                </div>

                <div className="prose prose-invert max-w-none text-athana-text/80 space-y-8">
                    <section>
                        <p>
                            La protection de vos données personnelles est une priorité pour ATHANA. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations, conformément aux dispositions de la nouvelle Loi fédérale sur la Protection des Données (nLPD) en Suisse.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Responsable du Traitement</h2>
                        <p>
                            Le responsable du traitement des données est :<br />
                            <strong>ATHANA</strong><br />
                            Route de Challex 6<br />
                            1283 La Plaine<br />
                            Email : <a href="mailto:contact@athana.ch" className="text-athana-accent hover:underline">contact@athana.ch</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Données Collectées</h2>
                        <p>
                            Nous collectons uniquement les données strictement nécessaires au bon fonctionnement de nos services et à nos échanges commerciaux :
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Données de contact :</strong> Nom, prénom, adresse email, numéro de téléphone (via le formulaire de contact).</li>
                            <li><strong>Données techniques :</strong> Adresse IP, type de navigateur, logs de connexion (à des fins de sécurité et de statistiques anonymes).</li>
                            <li><strong>Données de projet :</strong> Informations fournies lors de la demande de devis ou dans le cadre d'un mandat.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Finalité du Traitement</h2>
                        <p>
                            Vos données sont traitées pour les raisons suivantes :
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Répondre à vos demandes de contact et de devis.</li>
                            <li>Exécution des contrats et suivi de projet.</li>
                            <li>Amélioration de notre site web et de nos services.</li>
                            <li>Obligations légales et sécurité.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Transmission à des Tiers</h2>
                        <p>
                            Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec des prestataires de services techniques (ex: hébergement, service de messagerie) uniquement dans la limite nécessaire à l'exécution de leurs missions. Nos prestataires sont tenus de respecter la confidentialité et la sécurité de vos données.
                        </p>
                        <p className="mt-2">
                            Si des données sont transférées à l'étranger (hors Suisse/UE), nous nous assurons que le pays destinataire offre un niveau de protection adéquat ou que des garanties appropriées (clauses contractuelles types) sont mises en place.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Durée de Conservation</h2>
                        <p>
                            Nous conservons vos données personnelles aussi longtemps que nécessaire pour atteindre les finalités pour lesquelles elles ont été collectées, ou pour respecter nos obligations légales (par exemple, conservation des documents comptables pendant 10 ans).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Vos Droits</h2>
                        <p>
                            Conformément à la nLPD, vous disposez des droits suivants :
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Droit d'accès :</strong> Savoir quelles données nous détenons sur vous.</li>
                            <li><strong>Droit de rectification :</strong> Corriger des données inexactes.</li>
                            <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données (sous réserve d'obligations légales de conservation).</li>
                            <li><strong>Droit à la limitation et opposition :</strong> Vous opposer au traitement de vos données.</li>
                        </ul>
                        <p className="mt-4">
                            Pour exercer ces droits, veuillez nous contacter à l'adresse : <a href="mailto:contact@athana.ch" className="text-athana-accent hover:underline">contact@athana.ch</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Cookies et Tracking</h2>
                        <p>
                            Ce site peut utiliser des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques d'audience anonymes. Vous pouvez contrôler l'acceptation des cookies via les paramètres de votre navigateur.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Mises à Jour</h2>
                        <p>
                            Cette politique de confidentialité peut être mise à jour à tout moment pour refléter les évolutions légales ou de nos services. La version en ligne prévaut.
                        </p>
                        <p className="text-sm text-athana-muted mt-4">Dernière mise à jour : Février 2026</p>
                    </section>
                </div>
            </main>
        </div>
    );
}
