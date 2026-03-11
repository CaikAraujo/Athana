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
                description: 'Agence de développement web premium à Genève. Spécialistes Next.js, SEO et Design UI/UX.',
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

                sameAs: [
                    'https://instagram.com/athana.ch',
                    'https://linkedin.com/company/athana-ch',
                    'https://github.com/athana-ch',
                    'https://twitter.com/athana_ch'
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
