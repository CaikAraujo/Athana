export default function StructuredData() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'ProfessionalService',
                '@id': 'https://athana.ch/#organization',
                name: 'ATHANA',
                url: 'https://athana.ch',
                logo: 'https://athana.ch/og-image.jpg',
                image: 'https://athana.ch/og-image.jpg',
                description: "Agence d'architecture digitale basée à Genève. Conception de monuments digitaux, sites web Next.js ultra-performants et solutions logicielles sur mesure pour le marché B2B suisse.",
                telephone: '+41 78 339 98 95',
                email: 'contact@athana.ch',
                foundingDate: '2024',

                address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Route de Challex 6',
                    addressLocality: 'La Plaine',
                    postalCode: '1283',
                    addressCountry: 'CH'
                },

                geo: {
                    '@type': 'GeoCoordinates',
                    latitude: 46.2044,
                    longitude: 6.1432
                },

                areaServed: [
                    { '@type': 'City', name: 'Genève' },
                    { '@type': 'City', name: 'Lausanne' },
                    { '@type': 'City', name: 'Zurich' },
                    { '@type': 'AdministrativeArea', name: 'Vaud' },
                    { '@type': 'AdministrativeArea', name: 'Romandie' },
                    { '@type': 'Country', name: 'Switzerland' }
                ],

                priceRange: 'CHF 2000 - CHF 50000',
                paymentAccepted: 'Cash, Credit Card, Invoice, TWINT',
                currenciesAccepted: 'CHF, EUR',

                openingHoursSpecification: {
                    '@type': 'OpeningHoursSpecification',
                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    opens: '09:00',
                    closes: '18:00'
                },

                knowsAbout: [
                    'Custom Software Development',
                    'Web Agency Services',
                    'Enterprise Systems Integration (ERP/CRM)',
                    'Swiss Data Privacy Compliant Hosting'
                ],

                service: [
                    {
                        '@type': 'Service',
                        name: 'Custom Software Development',
                        url: 'https://athana.ch/services/developpement-web-sur-mesure-geneve',
                        areaServed: { '@type': 'City', name: 'Genève' }
                    },
                    {
                        '@type': 'Service',
                        name: 'Web Agency Services',
                        url: 'https://athana.ch/services/developpement-web-sur-mesure-geneve',
                        areaServed: { '@type': 'City', name: 'Genève' }
                    },
                    {
                        '@type': 'Service',
                        name: 'Enterprise Systems Integration (ERP/CRM)',
                        url: 'https://athana.ch/services/integration-odoo-erp-geneve',
                        areaServed: { '@type': 'City', name: 'Genève' }
                    },
                    {
                        '@type': 'Service',
                        name: 'Swiss Data Privacy Compliant Hosting',
                        url: 'https://athana.ch/services/application-web-securisee-suisse',
                        areaServed: { '@type': 'Country', name: 'Switzerland' }
                    }
                ],

                sameAs: [
                    'https://instagram.com/athana.ch',
                    'https://linkedin.com/company/athana',
                    'https://github.com/athana-ch',
                    'https://twitter.com/athana_ch',
                    'https://www.moneyhouse.ch/en/company/athana-XXXXX',
                    'https://www.uid.admin.ch/Detail.aspx?uid=CHE-XXX.XXX.XXX'
                ],

                hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: 'Services de Développement Web',
                    itemListElement: [
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Service',
                                name: 'Création Site Web Next.js'
                            }
                        },
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Service',
                                name: 'Optimisation SEO Technique'
                            }
                        },
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Service',
                                name: 'Design UI/UX & Refonte'
                            }
                        },
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Service',
                                name: 'Développement E-commerce'
                            }
                        }
                    ]
                }
            },
            {
                '@type': 'WebSite',
                '@id': 'https://athana.ch/#website',
                url: 'https://athana.ch',
                name: 'ATHANA',
                publisher: {
                    '@id': 'https://athana.ch/#organization'
                },
                inLanguage: 'fr-CH'
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Accueil',
                        item: 'https://athana.ch'
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Services',
                        item: 'https://athana.ch/services'
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: 'Templates',
                        item: 'https://athana.ch/templates'
                    }
                ]
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
