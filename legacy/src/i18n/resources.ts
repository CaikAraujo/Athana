import {
    demarrerPageContent,
    eliteFlowContent,
    projectsPageContent,
    servicesPageContent,
    whyChooseUsContent,
} from './extendedResources';

export const resources = {
    fr: {
        common: {
            nav: {
                home: 'Accueil',
                services: 'Services',
                projects: 'Projets',
                startProject: 'Démarrer un Projet',
            },
            footer: {
                rightsReserved: 'Tous les droits réservés.',
                legal: 'MENTIONS LÉGALES',
                privacy: 'POLITIQUE DE CONFIDENTIALITÉ',
            },
            language: {
                label: 'Langue',
                fr: 'Français',
                en: 'English',
                de: 'Deutsch',
                it: 'Italiano',
            },
        },
        home: {
            metaTitle: 'Agence de Développement & Design Premium | ATHANA',
            metaDescription: 'Agence de développement web premium en Suisse. Experts React pour des sites ultra-rapides et des applications web sur mesure.',
            hero: {
                badge: 'Architecture Digitale',
                titleLine1: 'BÂTISSEZ VOTRE',
                titleLine2: 'MONUMENT DIGITAL.',
                description: "Votre agence genevoise pour des solutions digitales robustes et pérennes. Alliez performance technique et fiabilité suisse pour propulser votre entreprise.",
                ctaPrimary: 'Démarrer un Projet _>',
                ctaSecondary: 'Voir le Portfolio',
            },
            credo: {
                badge: 'LE CREDO ATHANA',
                items: [
                    {
                        number: '01',
                        title: 'LA VITESSE EST REINE.',
                        paragraph: "Si l'écran charge en plus d'une seconde, votre client est déjà chez la concurrence.",
                    },
                    {
                        number: '02',
                        title: "LES DONNÉES L'EMPORTENT SUR L'EGO.",
                        paragraph: 'Nous ne dessinons pas pour être « joli », nous concevons des algorithmes visuels pour facturer.',
                    },
                    {
                        number: '03',
                        title: "L'AUTOMATISATION EST INÉVITABLE.",
                        paragraph: "Ce qui peut être résolu par du code ne doit pas gaspiller le temps de votre équipe.",
                    },
                ],
            },
            process: {
                badge: 'LE SYSTÈME ATHANA',
                title: "L'Anatomie d'un Monument Digital.",
                subtitle: 'Nous ne laissons rien au hasard. Voici le processus chirurgical en 4 étapes que nous utilisons pour transformer votre expertise en une autorité indiscutable sur le marché genevois.',
                cta: 'Voulez-vous bâtir votre monument ?',
                steps: [
                    {
                        number: '01',
                        title: 'Stratégie & Diagnostic',
                        heading: 'Poser les fondations du monument',
                        benefits: [
                            'Audit précis du marché local, des concurrents et de vos actifs numériques.',
                            'Plan de croissance clair pour transformer la vision en avantage mesurable.',
                        ],
                    },
                    {
                        number: '02',
                        title: 'Engineering de Haute Performance',
                        heading: "Construire une architecture qui encaisse l'ambition",
                        benefits: [
                            'Stack Next.js optimisée pour des performances réelles dès la première visite.',
                            'Base technique robuste, scalable et prête pour vos futurs leviers business.',
                        ],
                    },
                    {
                        number: '03',
                        title: 'Optimisation & Conversion',
                        heading: 'Transformer le trafic en revenus',
                        benefits: [
                            "Parcours et interfaces conçus pour guider l'action sans friction.",
                            'Ajustements continus pilotés par la donnée pour augmenter le taux de conversion.',
                        ],
                    },
                    {
                        number: '04',
                        title: 'Le Baptême Numérique & Lancement',
                        heading: 'Déployer une présence qui impose le respect',
                        benefits: [
                            'Mise en ligne sécurisée, monitoring et contrôle qualité de chaque détail.',
                            'Activation commerciale immédiate pour accélérer la traction dès le jour un.',
                        ],
                    },
                ],
            },
            testimonials: {
                titleLine1: 'Avis',
                titleLine2: 'Clients.',
                items: [
                    {
                        id: '1',
                        name: 'Ricardo Almeida',
                        role: 'CTO',
                        company: 'Nexus Tech',
                        content: 'ATHANA a élevé notre standard de qualité. Le code livré est propre, moderne et la performance du site a triplé nos conversions.',
                        image: 'https://picsum.photos/100/100?random=1',
                    },
                    {
                        id: '2',
                        name: 'Fernanda Costa',
                        role: 'Product Owner',
                        company: 'Studio Aura',
                        content: "Ils parlent la langue des développeurs et comprennent les besoins de l'entreprise. Athana n'est pas juste une agence, c'est un partenaire technique.",
                        image: 'https://picsum.photos/100/100?random=2',
                    },
                    {
                        id: '3',
                        name: 'Carlos Mendes',
                        role: 'Founder',
                        company: 'Finance Pro',
                        content: 'Impressionnant par la vitesse de livraison et la robustesse de la solution. La refonte de notre plateforme a été un tournant.',
                        image: 'https://picsum.photos/100/100?random=3',
                    },
                ],
            },
            contact: {
                titleLine1: 'CONSTRUISONS',
                titleLine2: "L'IMPOSSIBLE.",
                subtitle: "Vous avez un défi technique complexe ou une idée disruptive ? Notre équipe d'ingénieurs est prête.",
            },
            whyChooseUs: whyChooseUsContent.fr,
        },
        servicesPage: {
            metaTitle: 'Services & Tarifs | ATHANA',
            metaDescription: 'Audit stratégique, sites premium, Google Ads & Meta, performance et maintenance pour les entreprises suisses qui veulent croître avec prévisibilité.',
            headerBadge: 'CAPABILITÉS',
            headerTitleBefore: 'Nos Domaines',
            headerTitleAccent: "d'Expertise.",
            headerSubtitle: 'Une approche claire pour transformer votre présence en ligne en croissance réelle, avec des décisions orientées résultat.',
            content: servicesPageContent.fr,
        },
        projectsPage: projectsPageContent.fr,
        demarrerPage: demarrerPageContent.fr,
        eliteFlow: eliteFlowContent.fr,
    },
    en: {
        common: {
            nav: {
                home: 'Home',
                services: 'Services',
                projects: 'Projects',
                startProject: 'Start a Project',
            },
            footer: {
                rightsReserved: 'All rights reserved.',
                legal: 'LEGAL NOTICE',
                privacy: 'PRIVACY POLICY',
            },
            language: {
                label: 'Language',
                fr: 'Français',
                en: 'English',
                de: 'Deutsch',
                it: 'Italiano',
            },
        },
        home: {
            metaTitle: 'Premium Development & Design Agency | ATHANA',
            metaDescription: 'Premium web development agency in Switzerland. React experts building ultra-fast websites and custom web applications.',
            hero: {
                badge: 'Digital Architecture',
                titleLine1: 'BUILD YOUR',
                titleLine2: 'DIGITAL MONUMENT.',
                description: 'Your Geneva-based agency for robust, long-lasting digital solutions. Combine technical performance with Swiss reliability to grow your business.',
                ctaPrimary: 'Start a Project _>',
                ctaSecondary: 'View Portfolio',
            },
            credo: {
                badge: 'THE ATHANA CREDO',
                items: [
                    { number: '01', title: 'SPEED RULES.', paragraph: 'If your screen takes more than one second to load, your client is already with a competitor.' },
                    { number: '02', title: 'DATA BEATS EGO.', paragraph: 'We do not design to look pretty; we craft visual systems built to drive revenue.' },
                    { number: '03', title: 'AUTOMATION IS INEVITABLE.', paragraph: 'Whatever can be solved by code should not consume your team’s time.' },
                ],
            },
            process: {
                badge: 'THE ATHANA SYSTEM',
                title: 'The Anatomy of a Digital Monument.',
                subtitle: 'We leave nothing to chance. Here is the 4-step process we use to turn your expertise into undeniable market authority.',
                cta: 'Do you want to build your monument?',
                steps: [
                    {
                        number: '01',
                        title: 'Strategy & Diagnosis',
                        heading: 'Lay the monument foundations',
                        benefits: [
                            'Clear review of your market, competitors, and digital assets.',
                            'A practical growth plan focused on measurable gains.',
                        ],
                    },
                    {
                        number: '02',
                        title: 'High-Performance Engineering',
                        heading: 'Build an architecture that supports ambition',
                        benefits: [
                            'Fast and reliable technical setup from day one.',
                            'A scalable base ready for your next business goals.',
                        ],
                    },
                    {
                        number: '03',
                        title: 'Optimization & Conversion',
                        heading: 'Turn traffic into revenue',
                        benefits: [
                            'User journeys designed to remove friction and improve action.',
                            'Continuous improvements based on real performance data.',
                        ],
                    },
                    {
                        number: '04',
                        title: 'Launch & Activation',
                        heading: 'Deploy a presence that earns immediate trust',
                        benefits: [
                            'Controlled go-live with quality checks and secure setup.',
                            'Fast business activation to generate traction immediately.',
                        ],
                    },
                ],
            },
            testimonials: {
                titleLine1: 'Client',
                titleLine2: 'Reviews.',
                items: [
                    {
                        id: '1',
                        name: 'Ricardo Almeida',
                        role: 'CTO',
                        company: 'Nexus Tech',
                        content: 'ATHANA raised our quality benchmark. The delivered code is clean, modern, and site performance tripled our conversions.',
                        image: 'https://picsum.photos/100/100?random=1',
                    },
                    {
                        id: '2',
                        name: 'Fernanda Costa',
                        role: 'Product Owner',
                        company: 'Studio Aura',
                        content: "They speak the developers' language and understand business constraints. Athana is not just an agency, it's a true technical partner.",
                        image: 'https://picsum.photos/100/100?random=2',
                    },
                    {
                        id: '3',
                        name: 'Carlos Mendes',
                        role: 'Founder',
                        company: 'Finance Pro',
                        content: 'Impressive delivery speed and a robust solution. The platform redesign was a turning point for us.',
                        image: 'https://picsum.photos/100/100?random=3',
                    },
                ],
            },
            contact: {
                titleLine1: "LET'S BUILD",
                titleLine2: 'THE IMPOSSIBLE.',
                subtitle: 'Do you have a complex technical challenge or a disruptive idea? Our engineering team is ready.',
            },
            whyChooseUs: whyChooseUsContent.en,
        },
        servicesPage: {
            metaTitle: 'Services & Pricing | ATHANA',
            metaDescription: 'Strategic audit, premium websites, Google Ads & Meta, performance and maintenance for Swiss businesses that want predictable growth.',
            headerBadge: 'CAPABILITIES',
            headerTitleBefore: 'Our Areas of',
            headerTitleAccent: 'Expertise.',
            headerSubtitle: 'A clear approach to transform your online presence into real growth, with decisions focused on outcomes.',
            content: servicesPageContent.en,
        },
        projectsPage: projectsPageContent.en,
        demarrerPage: demarrerPageContent.en,
        eliteFlow: eliteFlowContent.en,
    },
    de: {
        common: {
            nav: {
                home: 'Startseite',
                services: 'Leistungen',
                projects: 'Projekte',
                startProject: 'Projekt starten',
            },
            footer: {
                rightsReserved: 'Alle Rechte vorbehalten.',
                legal: 'IMPRESSUM',
                privacy: 'DATENSCHUTZ',
            },
            language: {
                label: 'Sprache',
                fr: 'Français',
                en: 'English',
                de: 'Deutsch',
                it: 'Italiano',
            },
        },
        home: {
            metaTitle: 'Premium Agentur für Entwicklung & Design | ATHANA',
            metaDescription: 'Premium Webagentur in der Schweiz. React-Experten für ultraschnelle Websites und maßgeschneiderte Webanwendungen.',
            hero: {
                badge: 'Digitale Architektur',
                titleLine1: 'BAUEN SIE IHR',
                titleLine2: 'DIGITALES MONUMENT.',
                description: 'Ihre Genfer Agentur für robuste und nachhaltige digitale Lösungen. Kombinieren Sie technische Performance mit Schweizer Zuverlässigkeit.',
                ctaPrimary: 'Projekt starten _>',
                ctaSecondary: 'Portfolio ansehen',
            },
            credo: {
                badge: 'DAS ATHANA CREDO',
                items: [
                    { number: '01', title: 'GESCHWINDIGKEIT REGIERT.', paragraph: 'Wenn Ihre Seite länger als eine Sekunde lädt, ist der Kunde bereits bei der Konkurrenz.' },
                    { number: '02', title: 'DATEN SCHLAGEN EGO.', paragraph: 'Wir gestalten nicht für „schön“, sondern für messbare Ergebnisse und Umsatz.' },
                    { number: '03', title: 'AUTOMATISIERUNG IST UNVERMEIDLICH.', paragraph: 'Was durch Code lösbar ist, sollte nicht die Zeit Ihres Teams verschwenden.' },
                ],
            },
            process: {
                badge: 'DAS ATHANA SYSTEM',
                title: 'Die Anatomie eines digitalen Monuments.',
                subtitle: 'Wir überlassen nichts dem Zufall. Das ist unser 4-Stufen-Prozess für klare Marktführerschaft.',
                cta: 'Möchten Sie Ihr Monument bauen?',
                steps: [
                    {
                        number: '01',
                        title: 'Strategie & Diagnose',
                        heading: 'Das Fundament des Monuments legen',
                        benefits: [
                            'Klare Analyse von Markt, Wettbewerb und digitalen Assets.',
                            'Ein konkreter Wachstumsplan mit messbarem Fokus.',
                        ],
                    },
                    {
                        number: '02',
                        title: 'High-Performance Engineering',
                        heading: 'Architektur für echte Skalierung',
                        benefits: [
                            'Zuverlässige technische Basis ab dem ersten Tag.',
                            'Skalierbar für Ihre nächsten Geschäftsziele.',
                        ],
                    },
                    {
                        number: '03',
                        title: 'Optimierung & Conversion',
                        heading: 'Traffic in Umsatz verwandeln',
                        benefits: [
                            'Nutzerwege ohne Reibung für mehr Anfragen und Verkäufe.',
                            'Kontinuierliche Verbesserungen auf Basis echter Daten.',
                        ],
                    },
                    {
                        number: '04',
                        title: 'Launch & Aktivierung',
                        heading: 'Mit Präsenz und Vertrauen live gehen',
                        benefits: [
                            'Kontrollierter Go-live mit Qualitäts- und Sicherheitsfokus.',
                            'Schnelle Aktivierung für frühe Marktwirkung.',
                        ],
                    },
                ],
            },
            testimonials: {
                titleLine1: 'Kunden',
                titleLine2: 'Stimmen.',
                items: [
                    {
                        id: '1',
                        name: 'Ricardo Almeida',
                        role: 'CTO',
                        company: 'Nexus Tech',
                        content: 'ATHANA hat unseren Qualitätsstandard deutlich angehoben. Der Code ist sauber, modern und die Performance hat unsere Conversions verdreifacht.',
                        image: 'https://picsum.photos/100/100?random=1',
                    },
                    {
                        id: '2',
                        name: 'Fernanda Costa',
                        role: 'Product Owner',
                        company: 'Studio Aura',
                        content: 'Sie sprechen die Sprache der Entwickler und verstehen zugleich die Business-Ziele. Athana ist ein echter Technikpartner.',
                        image: 'https://picsum.photos/100/100?random=2',
                    },
                    {
                        id: '3',
                        name: 'Carlos Mendes',
                        role: 'Founder',
                        company: 'Finance Pro',
                        content: 'Beeindruckende Liefergeschwindigkeit und robuste Umsetzung. Das Redesign war ein echter Wendepunkt.',
                        image: 'https://picsum.photos/100/100?random=3',
                    },
                ],
            },
            contact: {
                titleLine1: 'WIR BAUEN',
                titleLine2: 'DAS UNMÖGLICHE.',
                subtitle: 'Sie haben eine komplexe technische Herausforderung oder eine disruptive Idee? Unser Team ist bereit.',
            },
            whyChooseUs: whyChooseUsContent.de,
        },
        servicesPage: {
            metaTitle: 'Leistungen & Preise | ATHANA',
            metaDescription: 'Strategische Analyse, Premium-Websites, Google Ads & Meta, Performance und Wartung für Schweizer Unternehmen.',
            headerBadge: 'KOMPETENZEN',
            headerTitleBefore: 'Unsere',
            headerTitleAccent: 'Expertise.',
            headerSubtitle: 'Ein klarer Ansatz, um Ihre Online-Präsenz in messbares Wachstum zu verwandeln.',
            content: servicesPageContent.de,
        },
        projectsPage: projectsPageContent.de,
        demarrerPage: demarrerPageContent.de,
        eliteFlow: eliteFlowContent.de,
    },
    it: {
        common: {
            nav: {
                home: 'Home',
                services: 'Servizi',
                projects: 'Progetti',
                startProject: 'Avvia un progetto',
            },
            footer: {
                rightsReserved: 'Tutti i diritti riservati.',
                legal: 'NOTE LEGALI',
                privacy: 'PRIVACY',
            },
            language: {
                label: 'Lingua',
                fr: 'Français',
                en: 'English',
                de: 'Deutsch',
                it: 'Italiano',
            },
        },
        home: {
            metaTitle: 'Agenzia Premium di Sviluppo & Design | ATHANA',
            metaDescription: 'Agenzia web premium in Svizzera. Esperti React per siti ultra-rapidi e applicazioni web su misura.',
            hero: {
                badge: 'Architettura Digitale',
                titleLine1: 'COSTRUISCI IL TUO',
                titleLine2: 'MONUMENTO DIGITALE.',
                description: 'La tua agenzia di Ginevra per soluzioni digitali solide e durature. Uniamo performance tecnica e affidabilità svizzera.',
                ctaPrimary: 'Avvia un progetto _>',
                ctaSecondary: 'Vedi Portfolio',
            },
            credo: {
                badge: 'IL CREDO ATHANA',
                items: [
                    { number: '01', title: 'LA VELOCITÀ È REGINA.', paragraph: 'Se il sito carica in più di un secondo, il cliente è già dalla concorrenza.' },
                    { number: '02', title: 'I DATI VINCONO SULL’EGO.', paragraph: 'Non progettiamo per essere “belli”, ma per generare risultati concreti.' },
                    { number: '03', title: 'L’AUTOMAZIONE È INEVITABILE.', paragraph: 'Ciò che può essere risolto con il codice non deve consumare il tempo del team.' },
                ],
            },
            process: {
                badge: 'IL SISTEMA ATHANA',
                title: 'L’anatomia di un monumento digitale.',
                subtitle: 'Non lasciamo nulla al caso. Ecco il processo in 4 fasi che usiamo per costruire autorevolezza reale.',
                cta: 'Vuoi costruire il tuo monumento?',
                steps: [
                    {
                        number: '01',
                        title: 'Strategia & Diagnosi',
                        heading: 'Posare le fondamenta del monumento',
                        benefits: [
                            'Analisi chiara di mercato, concorrenti e asset digitali.',
                            'Piano di crescita concreto con obiettivi misurabili.',
                        ],
                    },
                    {
                        number: '02',
                        title: 'Engineering ad Alte Prestazioni',
                        heading: 'Costruire un’architettura che regge la crescita',
                        benefits: [
                            'Base tecnica solida e veloce fin dal primo giorno.',
                            'Struttura scalabile per i prossimi obiettivi business.',
                        ],
                    },
                    {
                        number: '03',
                        title: 'Ottimizzazione & Conversione',
                        heading: 'Trasformare il traffico in ricavi',
                        benefits: [
                            'Percorsi utente più fluidi per aumentare le azioni utili.',
                            'Miglioramenti continui guidati dai dati reali.',
                        ],
                    },
                    {
                        number: '04',
                        title: 'Lancio & Attivazione',
                        heading: 'Mettere online una presenza che convince subito',
                        benefits: [
                            'Go-live controllato con verifiche qualità e sicurezza.',
                            'Attivazione commerciale rapida fin dal giorno uno.',
                        ],
                    },
                ],
            },
            testimonials: {
                titleLine1: 'Recensioni',
                titleLine2: 'Clienti.',
                items: [
                    {
                        id: '1',
                        name: 'Ricardo Almeida',
                        role: 'CTO',
                        company: 'Nexus Tech',
                        content: 'ATHANA ha alzato il nostro standard qualitativo. Il codice consegnato è pulito, moderno e le conversioni sono triplicate.',
                        image: 'https://picsum.photos/100/100?random=1',
                    },
                    {
                        id: '2',
                        name: 'Fernanda Costa',
                        role: 'Product Owner',
                        company: 'Studio Aura',
                        content: 'Parlano la lingua degli sviluppatori e capiscono il business. Athana non è solo un’agenzia, è un partner tecnico.',
                        image: 'https://picsum.photos/100/100?random=2',
                    },
                    {
                        id: '3',
                        name: 'Carlos Mendes',
                        role: 'Founder',
                        company: 'Finance Pro',
                        content: 'Velocità di consegna impressionante e soluzione solida. Il redesign della piattaforma è stato un punto di svolta.',
                        image: 'https://picsum.photos/100/100?random=3',
                    },
                ],
            },
            contact: {
                titleLine1: 'COSTRUIAMO',
                titleLine2: "L'IMPOSSIBILE.",
                subtitle: 'Hai una sfida tecnica complessa o un’idea dirompente? Il nostro team è pronto.',
            },
            whyChooseUs: whyChooseUsContent.it,
        },
        servicesPage: {
            metaTitle: 'Servizi & Prezzi | ATHANA',
            metaDescription: 'Audit strategico, siti premium, Google Ads & Meta, performance e manutenzione per aziende svizzere.',
            headerBadge: 'COMPETENZE',
            headerTitleBefore: 'I nostri ambiti di',
            headerTitleAccent: 'competenza.',
            headerSubtitle: 'Un approccio chiaro per trasformare la tua presenza online in crescita reale.',
            content: servicesPageContent.it,
        },
        projectsPage: projectsPageContent.it,
        demarrerPage: demarrerPageContent.it,
        eliteFlow: eliteFlowContent.it,
    },
} as const;
