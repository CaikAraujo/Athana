import { ServiceItem, PricingTier, Testimonial, Project, WorkflowStep, WhyChooseUsItem } from './types';

export const NAV_LINKS = [
  { label: 'Projets', href: '/projets' },
];

export const SERVICES: ServiceItem[] = [
  {
    id: '1',
    title: 'Développement Full-Stack',
    description: 'Applications web robustes, évolutives et sécurisées. Du backend complexe au frontend pixel-perfect.',
    icon: 'code',
  },
  {
    id: '2',
    title: 'Design UI/UX',
    description: "Interfaces qui n'impressionnent pas seulement, mais guident l'utilisateur intuitivement vers la conversion.",
    icon: 'palette',
  },
  {
    id: '3',
    title: 'Optimisation de Performance',
    description: 'Votre site chargé en millisecondes. Core Web Vitals optimisés pour un classement maximal sur Google.',
    icon: 'rocket',
  },
  {
    id: '4',
    title: 'Data Analytics',
    description: 'Mise en œuvre de gestionnaires de balises et tableaux de bord personnalisés pour suivre chaque étape de votre client.',
    icon: 'chart',
  },
];

export const PRICING: PricingTier[] = [
  {
    id: 'mvp',
    name: 'MVP',
    price: 'CHF 2.900',
    description: 'Pour les startups et entreprises ayant besoin de valider des idées rapidement.',
    highlight: false,
    features: [
      { text: 'Landing Page Haute Performance', included: true },
      { text: 'Design System Basique', included: true },
      { text: 'Optimisation Mobile First', included: true },
      { text: 'SEO Technique', included: true },
      { text: 'Panneau Administratif', included: false },
      { text: 'Intégrations Avancées', included: false },
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 'CHF 4.500',
    description: 'Le choix définitif pour les entreprises en croissance.',
    highlight: true,
    features: [
      { text: 'Site Institutionnel ou Blog', included: true },
      { text: 'Design UI/UX Premium', included: true },
      { text: 'CMS Headless Intégré', included: true },
      { text: 'Analytics Avancé', included: true },
      { text: 'Intégration CRM & Leads', included: true },
      { text: 'Support Dev Dédié', included: true },
    ],
  },
  {
    id: 'athana',
    name: 'Athana',
    price: 'Sur Mesure',
    description: 'Solutions de génie logiciel sur mesure.',
    highlight: false,
    features: [
      { text: 'Plateforme SaaS / E-commerce', included: true },
      { text: 'Architecture Microservices', included: true },
      { text: 'App iOS et Android', included: true },
      { text: 'Pipeline DevOps & CI/CD', included: true },
      { text: 'Conseil en Architecture', included: true },
      { text: 'SLA Haute Disponibilité', included: true },
    ],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Ricardo Almeida',
    role: 'CTO',
    company: 'Nexus Tech',
    content: "ATHANA a élevé notre standard de qualité. Le code livré est propre, moderne et la performance du site a triplé nos conversions.",
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
    content: "Impressionnant par la vitesse de livraison et la robustesse de la solution. La refonte de notre plateforme a été un tournant.",
    image: 'https://picsum.photos/100/100?random=3',
  },
];

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Chez Energie',
    category: 'AI & Web App',
    description: 'Plateforme innovante d\'économie d\'énergie propulsée par l\'IA (Gemini). Analyse intelligente et recommandations personnalisées pour l\'habitat.',
    image: '/images/chez-energie.jpg',
    technologies: ['Next.js 14', 'Tailwind CSS', 'Vercel AI SDK', 'Gemini API'],
    link: 'https://github.com/CaikAraujo/chez-energie'
  },
  {
    id: '2',
    title: 'Fridge Telemetry',
    category: 'IoT & Industrial',
    description: 'Système IoT de surveillance thermique critique. Rapports PDF automatisés et alertes en temps réel pour garantir la chaîne du froid.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    technologies: ['Java 21', 'Spring Boot 3', 'MySQL', 'Docker', 'OpenPDF'],
    link: 'https://github.com/CaikAraujo/Fridge-Telemetry-System'
  },
  {
    id: '3',
    title: 'Scheduler API',
    category: 'Backend Architecture',
    description: 'API de gestion de plannings haute performance. Architecture robuste, transactions atomiques, sécurité bancaire et scalabilité horizontale.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    technologies: ['Java 21', 'Spring Boot', 'PostgreSQL', 'Spring Security'],
    link: 'https://github.com/CaikAraujo/Scheduler-API'
  },
  {
    id: '4',
    title: 'VF Froid',
    category: 'Corporate Website',
    description: 'Site vitrine ultra-moderne pour expert en réfrigération. Design sombre élégant, animations fluides et présentation premium des services.',
    image: '/images/vf-froid.png',
    technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript'],
    link: 'https://vffroid.ch'
  }
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: '01',
    title: 'Découverte',
    description: 'Immersion totale dans votre entreprise pour comprendre les douleurs, les objectifs et le public cible.',
    icon: 'search',
  },
  {
    id: '02',
    title: 'Architecture',
    description: 'Conception de la solution technique, choix de la stack et planification de l\'évolutivité.',
    icon: 'cpu',
  },
  {
    id: '03',
    title: 'Développement',
    description: 'Code propre, tests automatisés et sprints agiles pour une livraison continue.',
    icon: 'terminal',
  },
  {
    id: '04',
    title: 'Optimisation',
    description: 'Suivi de la performance, SEO technique et ajustements pour une conversion maximale.',
    icon: 'zap',
  },
];

export const WHY_CHOOSE_US: WhyChooseUsItem[] = [
  {
    id: '1',
    title: 'Expertise Suisse',
    description: 'Basés à La Plaine (Genève), nous comprenons les exigences de qualité et de précision du marché suisse.',
    icon: 'shield',
  },
  {
    id: '2',
    title: 'Design Futuriste',
    description: 'Nous créons des interfaces qui ne ressemblent à rien de ce que vos concurrents possèdent.',
    icon: 'rocket',
  },
  {
    id: '3',
    title: 'Performance Absolue',
    description: 'Sites ultra-rapides optimisés pour le référencement (SEO) et la conversion instantanée.',
    icon: 'clock',
  },
  {
    id: '4',
    title: 'Support Dédié',
    description: 'Une équipe réactive qui parle votre langue et vous accompagne à chaque étape.',
    icon: 'globe',
  },
];