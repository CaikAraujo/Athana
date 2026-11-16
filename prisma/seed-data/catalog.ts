/**
 * Bootstrap catalogue. Reference prices come from the owner's brief (landing 390, vitrine 790,
 * business 1 490, premium 2 490, e-commerce 1 990 CHF); every other figure is a starting value
 * to be reviewed in Admin → Catalogue. Nothing reads this file at runtime.
 */
export type T3 = { fr: string; 'pt-PT': string; 'pt-BR'?: string };
const t = (fr: string, pt: string, br?: string): T3 => ({ fr, 'pt-PT': pt, ...(br ? { 'pt-BR': br } : {}) });
/** CHF → price map. EUR mirrors the CHF figure; BRL uses a rounded commercial conversion (to be validated). */
export const p = (chf: number) => ({ CHF: chf * 100, EUR: chf * 100, BRL: (Math.round((chf * 6) / 100) * 100 - 10) * 100 });

export const CATEGORIES: { slug: string; name: T3 }[] = [
  { slug: 'business', name: t('Business', 'Negócios') },
  { slug: 'corporate', name: t('Corporate', 'Corporativo') },
  { slug: 'landing-pages', name: t('Landing pages', 'Landing pages') },
  { slug: 'e-commerce', name: t('E-commerce', 'Lojas online', 'Lojas virtuais') },
  { slug: 'restaurant', name: t('Restaurant', 'Restaurantes') },
  { slug: 'beauty-wellness', name: t('Beauté & bien-être', 'Beleza e bem-estar') },
  { slug: 'medical', name: t('Médical', 'Saúde') },
  { slug: 'real-estate', name: t('Immobilier', 'Imobiliário', 'Imobiliárias') },
  { slug: 'construction', name: t('Construction', 'Construção') },
  { slug: 'tourism', name: t('Tourisme', 'Turismo') },
  { slug: 'portfolio', name: t('Portfolio', 'Portfólio') },
  { slug: 'education', name: t('Éducation', 'Educação') },
  { slug: 'services', name: t('Services', 'Serviços') },
  { slug: 'blog', name: t('Blog', 'Blog') },
  { slug: 'booking', name: t('Réservation', 'Reservas') },
];

export const ADDONS: { slug: string; name: T3; description: T3; chf: number }[] = [
  { slug: 'extra-page', chf: 120, name: t('Page supplémentaire', 'Página adicional'), description: t('Une page de plus, intégrée au design du modèle.', 'Mais uma página, integrada no design do modelo.') },
  { slug: 'extra-language', chf: 290, name: t('Langue supplémentaire', 'Idioma adicional'), description: t('Structure multilingue et intégration de vos textes traduits.', 'Estrutura multilingue e integração dos seus textos traduzidos.') },
  { slug: 'seo-pack', chf: 350, name: t('Pack SEO de lancement', 'Pack SEO de lançamento'), description: t('Recherche de mots-clés, balises, données structurées et Search Console.', 'Pesquisa de palavras-chave, etiquetas, dados estruturados e Search Console.') },
  { slug: 'copywriting', chf: 390, name: t('Rédaction des textes', 'Redação dos textos'), description: t('Nous rédigeons les textes de votre site à partir de votre briefing.', 'Redigimos os textos do seu site a partir do seu briefing.') },
  { slug: 'logo', chf: 450, name: t('Création de logo', 'Criação de logótipo', 'Criação de logotipo'), description: t('Un logo simple et professionnel, livré en formats web et impression.', 'Um logótipo simples e profissional, entregue em formatos web e impressão.', 'Um logotipo simples e profissional, entregue em formatos web e impressão.') },
  { slug: 'booking-module', chf: 490, name: t('Module de réservation', 'Módulo de reservas'), description: t('Prise de rendez-vous ou réservation en ligne avec notifications.', 'Marcações ou reservas online com notificações.', 'Agendamentos ou reservas online com notificações.') },
  { slug: 'blog-module', chf: 290, name: t('Module blog', 'Módulo de blog'), description: t('Un blog administrable pour publier vos actualités.', 'Um blog administrável para publicar as suas novidades.', 'Um blog administrável para publicar suas novidades.') },
  { slug: 'express', chf: 300, name: t('Livraison express', 'Entrega expresso', 'Entrega expressa'), description: t('Votre projet passe en priorité dans notre planning de production.', 'O seu projeto passa a ter prioridade no nosso planeamento de produção.', 'Seu projeto passa a ter prioridade no nosso planejamento de produção.') },
  { slug: 'maintenance-12', chf: 480, name: t('Maintenance 12 mois', 'Manutenção 12 meses'), description: t('Mises à jour, sauvegardes, surveillance et petites modifications pendant un an.', 'Atualizações, cópias de segurança, monitorização e pequenas alterações durante um ano.', 'Atualizações, backups, monitoramento e pequenas alterações durante um ano.') },
];

type Tier = { chf: number; days: number; pages: number; revisions: number };
type Pricing = { BASIC: Tier; BUSINESS: Tier; PREMIUM: Tier };
const LANDING: Pricing = { BASIC: { chf: 390, days: 5, pages: 1, revisions: 1 }, BUSINESS: { chf: 790, days: 8, pages: 3, revisions: 2 }, PREMIUM: { chf: 1490, days: 12, pages: 5, revisions: 3 } };
const SITE: Pricing = { BASIC: { chf: 790, days: 8, pages: 5, revisions: 1 }, BUSINESS: { chf: 1490, days: 14, pages: 10, revisions: 2 }, PREMIUM: { chf: 2490, days: 21, pages: 20, revisions: 3 } };
const SHOP: Pricing = { BASIC: { chf: 1990, days: 15, pages: 8, revisions: 1 }, BUSINESS: { chf: 2990, days: 21, pages: 12, revisions: 2 }, PREMIUM: { chf: 4490, days: 30, pages: 20, revisions: 3 } };

export const PACKAGE_COPY: Record<'BASIC' | 'BUSINESS' | 'PREMIUM', { name: T3; description: T3; features: T3[] }> = {
  BASIC: {
    name: t('Basic', 'Basic'),
    description: t('Le modèle choisi, adapté à votre marque et mis en ligne.', 'O modelo escolhido, adaptado à sua marca e colocado online.'),
    features: [t('Modèle choisi', 'Modelo escolhido'), t('Personnalisation de base (logo, couleurs, polices)', 'Personalização básica (logótipo, cores, tipos de letra)', 'Personalização básica (logotipo, cores, fontes)'), t('Intégration de vos textes et images', 'Integração dos seus textos e imagens', 'Integração de seus textos e imagens'), t('Configuration initiale et mise en ligne', 'Configuração inicial e publicação')],
  },
  BUSINESS: {
    name: t('Business', 'Business'),
    description: t('Plus de pages, une personnalisation poussée et les intégrations essentielles.', 'Mais páginas, personalização avançada e as integrações essenciais.'),
    features: [t('Tout le pack Basic', 'Todo o pack Basic', 'Todo o pacote Basic'), t('Plus de pages', 'Mais páginas'), t('Personnalisation avancée des sections', 'Personalização avançada das secções', 'Personalização avançada das seções'), t('Intégrations de base (formulaires, carte, statistiques)', 'Integrações básicas (formulários, mapa, estatísticas)'), t('Optimisation SEO initiale', 'Otimização SEO inicial')],
  },
  PREMIUM: {
    name: t('Premium', 'Premium'),
    description: t('Le niveau le plus complet : fonctionnalités étendues, intégrations et support prioritaire.', 'O nível mais completo: funcionalidades alargadas, integrações e suporte prioritário.', 'O nível mais completo: funcionalidades ampliadas, integrações e suporte prioritário.'),
    features: [t('Tout le pack Business', 'Todo o pack Business', 'Todo o pacote Business'), t('Personnalisation avancée du design', 'Personalização avançada do design'), t('Fonctionnalités supplémentaires', 'Funcionalidades adicionais'), t('Intégrations avec vos outils', 'Integrações com as suas ferramentas', 'Integrações com suas ferramentas'), t('Support prioritaire', 'Suporte prioritário'), t('Configurations additionnelles', 'Configurações adicionais')],
  },
};

export type ProductSeed = {
  slug: string; name: string; category: string; pricing: Pricing; featured?: boolean; languages: string[];
  tagline: T3; description: T3; features: T3[]; technologies: string[]; related: string[];
};

const TECH = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'];

export const PRODUCTS: ProductSeed[] = [
  {
    slug: 'atelier', name: 'Atelier', category: 'landing-pages', pricing: LANDING, featured: true, languages: ['fr', 'pt', 'en'], technologies: TECH, related: ['cabinet-meridien', 'portfolio-lena'],
    tagline: t('Landing page de conversion pour produits et services B2B.', 'Landing page de conversão para produtos e serviços B2B.'),
    description: t('Atelier concentre votre offre sur une page claire : promesse, bénéfices, tarifs, questions fréquentes et formulaire de contact. Idéal pour lancer un produit, une campagne publicitaire ou une offre de service.', 'O Atelier concentra a sua oferta numa página clara: promessa, benefícios, preços, perguntas frequentes e formulário de contacto. Ideal para lançar um produto, uma campanha publicitária ou um serviço.', 'O Atelier concentra sua oferta em uma página clara: promessa, benefícios, preços, perguntas frequentes e formulário de contato. Ideal para lançar um produto, uma campanha de anúncios ou um serviço.'),
    features: [t('Sections orientées conversion', 'Secções orientadas para a conversão', 'Seções orientadas para conversão'), t('Grille de fonctionnalités et tarifs', 'Grelha de funcionalidades e preços', 'Grade de funcionalidades e preços'), t('FAQ en accordéon', 'FAQ em acordeão', 'FAQ em acordeão'), t('Formulaire de capture de leads', 'Formulário de captação de leads'), t('Prêt pour le suivi des campagnes', 'Pronto para o acompanhamento de campanhas')],
  },
  {
    slug: 'maison-lumiere', name: 'Maison Lumière', category: 'restaurant', pricing: SITE, featured: true, languages: ['fr', 'pt', 'en'], technologies: TECH, related: ['studio-eclat', 'alpina-voyages'],
    tagline: t('Site élégant pour restaurants, bistrots et traiteurs.', 'Site elegante para restaurantes, bistrôs e catering.', 'Site elegante para restaurantes, bistrôs e buffets.'),
    description: t('Maison Lumière met en scène votre établissement : carte filtrable par catégorie, demande de réservation, histoire de la maison et informations pratiques. Une ambiance chaleureuse qui donne envie de réserver.', 'O Maison Lumière dá palco ao seu estabelecimento: carta filtrável por categoria, pedido de reserva, história da casa e informações práticas. Um ambiente acolhedor que dá vontade de reservar.', 'O Maison Lumière valoriza seu estabelecimento: cardápio filtrável por categoria, pedido de reserva, história da casa e informações práticas. Um ambiente acolhedor que dá vontade de reservar.'),
    features: [t('Carte avec filtres par catégorie', 'Carta com filtros por categoria', 'Cardápio com filtros por categoria'), t('Formulaire de réservation', 'Formulário de reserva'), t('Horaires et accès', 'Horários e localização'), t('Page histoire et équipe', 'Página de história e equipa', 'Página de história e equipe'), t('Design adapté au mobile', 'Design adaptado a telemóvel', 'Design adaptado ao celular')],
  },
  {
    slug: 'clinique-alba', name: 'Clinique Alba', category: 'medical', pricing: SITE, languages: ['fr', 'pt', 'en'], technologies: TECH, related: ['studio-eclat', 'cabinet-meridien'],
    tagline: t('Site rassurant pour cabinets médicaux et cliniques.', 'Site tranquilizador para consultórios e clínicas.'),
    description: t('Clinique Alba présente vos spécialités, votre équipe et vos informations pratiques avec clarté. Les patients trouvent rapidement comment demander un rendez-vous.', 'O Clinique Alba apresenta as suas especialidades, a sua equipa e as informações práticas com clareza. Os pacientes encontram rapidamente como pedir uma consulta.', 'O Clinique Alba apresenta suas especialidades, sua equipe e as informações práticas com clareza. Os pacientes encontram rapidamente como agendar uma consulta.'),
    features: [t('Présentation des spécialités', 'Apresentação das especialidades'), t('Profils des praticiens', 'Perfis dos profissionais'), t('Demande de rendez-vous', 'Pedido de consulta', 'Solicitação de consulta'), t('Horaires et informations pratiques', 'Horários e informações práticas'), t('Contrastes et lisibilité soignés', 'Contrastes e legibilidade cuidados', 'Contrastes e legibilidade bem cuidados')],
  },
  {
    slug: 'helvetia-immo', name: 'Helvetia Immo', category: 'real-estate', pricing: SITE, featured: true, languages: ['fr', 'pt', 'en'], technologies: TECH, related: ['batipro', 'cabinet-meridien'],
    tagline: t('Site d’agence immobilière avec catalogue de biens filtrable.', 'Site de agência imobiliária com catálogo de imóveis filtrável.', 'Site de imobiliária com catálogo de imóveis filtrável.'),
    description: t('Helvetia Immo valorise vos biens : grille d’annonces avec filtres par type, prix et nombre de pièces, page vendeur avec demande d’estimation et présentation de l’agence.', 'O Helvetia Immo valoriza os seus imóveis: grelha de anúncios com filtros por tipo, preço e número de divisões, página para vendedores com pedido de avaliação e apresentação da agência.', 'O Helvetia Immo valoriza seus imóveis: grade de anúncios com filtros por tipo, preço e número de cômodos, página para vendedores com pedido de avaliação e apresentação da imobiliária.'),
    features: [t('Catalogue de biens avec filtres', 'Catálogo de imóveis com filtros'), t('Fiches de biens', 'Fichas de imóveis'), t('Demande d’estimation', 'Pedido de avaliação'), t('Présentation de l’agence', 'Apresentação da agência', 'Apresentação da imobiliária'), t('Formulaire de contact', 'Formulário de contacto', 'Formulário de contato')],
  },
  {
    slug: 'studio-eclat', name: 'Studio Éclat', category: 'beauty-wellness', pricing: SITE, languages: ['fr', 'pt', 'en'], technologies: TECH, related: ['maison-lumiere', 'clinique-alba'],
    tagline: t('Site éditorial pour salons de beauté, spas et instituts.', 'Site editorial para salões de beleza, spas e institutos.'),
    description: t('Studio Éclat présente vos soins et vos tarifs dans une mise en page douce et soignée, avec une demande de réservation par soin, date et horaire.', 'O Studio Éclat apresenta os seus tratamentos e preços num layout suave e cuidado, com pedido de marcação por tratamento, data e hora.', 'O Studio Éclat apresenta seus tratamentos e preços em um layout suave e bem cuidado, com pedido de agendamento por tratamento, data e horário.'),
    features: [t('Liste des soins et tarifs', 'Lista de tratamentos e preços'), t('Demande de réservation', 'Pedido de marcação', 'Pedido de agendamento'), t('Présentation du salon', 'Apresentação do salão'), t('Design éditorial', 'Design editorial'), t('Liens vers vos réseaux sociaux', 'Ligações para as suas redes sociais', 'Links para suas redes sociais')],
  },
  {
    slug: 'batipro', name: 'BatiPro', category: 'construction', pricing: SITE, languages: ['fr', 'pt', 'en'], technologies: TECH, related: ['helvetia-immo', 'cabinet-meridien'],
    tagline: t('Site robuste pour entreprises de construction et de rénovation.', 'Site robusto para empresas de construção e renovação.', 'Site robusto para empresas de construção e reforma.'),
    description: t('BatiPro présente vos services, vos réalisations filtrables par catégorie et un formulaire de devis détaillé pour qualifier chaque demande.', 'O BatiPro apresenta os seus serviços, as suas obras filtráveis por categoria e um formulário de orçamento detalhado para qualificar cada pedido.', 'O BatiPro apresenta seus serviços, suas obras filtráveis por categoria e um formulário de orçamento detalhado para qualificar cada pedido.'),
    features: [t('Présentation des services', 'Apresentação dos serviços'), t('Galerie de réalisations filtrable', 'Galeria de obras filtrável'), t('Formulaire de demande de devis', 'Formulário de pedido de orçamento'), t('Page entreprise', 'Página da empresa'), t('Appels à l’action visibles', 'Chamadas à ação visíveis', 'Chamadas para ação visíveis')],
  },
  {
    slug: 'alpina-voyages', name: 'Alpina Voyages', category: 'tourism', pricing: SITE, languages: ['fr', 'pt', 'en'], technologies: TECH, related: ['maison-lumiere', 'portfolio-lena'],
    tagline: t('Site immersif pour agences de voyage et acteurs du tourisme.', 'Site imersivo para agências de viagens e empresas de turismo.'),
    description: t('Alpina Voyages fait voyager dès la première page : destinations filtrables, présentation des séjours et demande d’information avec dates et nombre de voyageurs.', 'O Alpina Voyages faz viajar desde a primeira página: destinos filtráveis, apresentação das estadias e pedido de informações com datas e número de viajantes.', 'O Alpina Voyages faz viajar desde a primeira página: destinos filtráveis, apresentação dos pacotes e pedido de informações com datas e número de viajantes.'),
    features: [t('Destinations avec filtres', 'Destinos com filtros'), t('Présentation des séjours', 'Apresentação das estadias', 'Apresentação dos pacotes'), t('Demande d’information détaillée', 'Pedido de informações detalhado'), t('Présentation de l’agence', 'Apresentação da agência'), t('Univers visuel immersif', 'Universo visual imersivo')],
  },
  {
    slug: 'boutique-nord', name: 'Boutique Nord', category: 'e-commerce', pricing: SHOP, featured: true, languages: ['fr', 'pt', 'en'], technologies: [...TECH, 'Stripe'], related: ['atelier', 'studio-eclat'],
    tagline: t('Boutique en ligne épurée pour marques et créateurs.', 'Loja online depurada para marcas e criadores.', 'Loja virtual clean para marcas e criadores.'),
    description: t('Boutique Nord réunit l’essentiel d’une boutique en ligne : catalogue avec filtres et tri, fiche produit avec variantes, panier et tunnel de commande. Le paiement en ligne est configuré avec votre propre compte lors de la réalisation.', 'O Boutique Nord reúne o essencial de uma loja online: catálogo com filtros e ordenação, ficha de produto com variantes, carrinho e processo de encomenda. O pagamento online é configurado com a sua própria conta durante a realização.', 'O Boutique Nord reúne o essencial de uma loja virtual: catálogo com filtros e ordenação, página de produto com variações, carrinho e fluxo de pedido. O pagamento online é configurado com a sua própria conta durante a realização.'),
    features: [t('Catalogue avec filtres et tri', 'Catálogo com filtros e ordenação'), t('Fiche produit avec variantes', 'Ficha de produto com variantes', 'Página de produto com variações'), t('Panier', 'Carrinho'), t('Tunnel de commande', 'Processo de encomenda', 'Fluxo de pedido'), t('Paiement en ligne configuré avec votre compte', 'Pagamento online configurado com a sua conta')],
  },
  {
    slug: 'cabinet-meridien', name: 'Cabinet Méridien', category: 'corporate', pricing: SITE, languages: ['fr', 'pt', 'en'], technologies: TECH, related: ['atelier', 'helvetia-immo'],
    tagline: t('Site institutionnel pour cabinets, fiduciaires et sociétés de conseil.', 'Site institucional para escritórios, contabilistas e consultoras.', 'Site institucional para escritórios, contabilidades e consultorias.'),
    description: t('Cabinet Méridien installe la confiance : domaines d’expertise, méthode de travail, équipe, publications et prise de contact. Un design sobre pour les métiers du conseil.', 'O Cabinet Méridien transmite confiança: áreas de especialização, método de trabalho, equipa, publicações e contacto. Um design sóbrio para as profissões de consultoria.', 'O Cabinet Méridien transmite confiança: áreas de atuação, método de trabalho, equipe, publicações e contato. Um design sóbrio para as profissões de consultoria.'),
    features: [t('Domaines d’expertise', 'Áreas de especialização', 'Áreas de atuação'), t('Méthode et processus', 'Método e processo'), t('Présentation de l’équipe', 'Apresentação da equipa', 'Apresentação da equipe'), t('Publications et actualités', 'Publicações e notícias'), t('Formulaire de contact', 'Formulário de contacto', 'Formulário de contato')],
  },
  {
    slug: 'portfolio-lena', name: 'Lena Moreau', category: 'portfolio', pricing: SITE, languages: ['pt', 'fr', 'en'], technologies: TECH, related: ['atelier', 'alpina-voyages'],
    tagline: t('Portfolio éditorial pour créatifs, designers et photographes.', 'Portfólio editorial para criativos, designers e fotógrafos.'),
    description: t('Lena Moreau met vos projets au premier plan : études de cas, filtre par type de projet, page à propos et prise de contact. Une typographie affirmée pour un univers créatif.', 'O Lena Moreau coloca os seus projetos em primeiro plano: casos de estudo, filtro por tipo de projeto, página sobre e contacto. Uma tipografia marcante para um universo criativo.', 'O Lena Moreau coloca seus projetos em primeiro plano: estudos de caso, filtro por tipo de projeto, página sobre e contato. Uma tipografia marcante para um universo criativo.'),
    features: [t('Études de cas', 'Casos de estudo', 'Estudos de caso'), t('Filtre par type de projet', 'Filtro por tipo de projeto'), t('Page à propos', 'Página sobre'), t('Typographie éditoriale', 'Tipografia editorial'), t('Formulaire de contact', 'Formulário de contacto', 'Formulário de contato')],
  },
];

export const PRODUCT_FAQ: { q: T3; a: T3 }[] = [
  { q: t('Que se passe-t-il après l’achat ?', 'O que acontece depois da compra?'), a: t('Vous recevez une confirmation et un lien vers le briefing. Dès que le briefing est envoyé, votre projet entre en production et vous suivez chaque étape depuis votre espace client.', 'Recebe uma confirmação e uma ligação para o briefing. Assim que o briefing é enviado, o seu projeto entra em produção e acompanha cada etapa na sua área de cliente.', 'Você recebe uma confirmação e um link para o briefing. Assim que o briefing é enviado, seu projeto entra em produção e você acompanha cada etapa na sua área do cliente.') },
  { q: t('Le modèle est-il personnalisé à mon entreprise ?', 'O modelo é personalizado para a minha empresa?'), a: t('Oui. Le modèle est la base : nous l’adaptons à votre logo, vos couleurs, vos textes et vos images. Le niveau de personnalisation dépend du pack choisi.', 'Sim. O modelo é a base: adaptamo-lo ao seu logótipo, cores, textos e imagens. O nível de personalização depende do pack escolhido.', 'Sim. O modelo é a base: nós o adaptamos ao seu logotipo, cores, textos e imagens. O nível de personalização depende do pacote escolhido.') },
  { q: t('Le délai indiqué est-il garanti ?', 'O prazo indicado é garantido?'), a: t('Le délai est une estimation en jours ouvrés à partir de la réception d’un briefing complet. Il peut varier selon les contenus fournis et les options ajoutées.', 'O prazo é uma estimativa em dias úteis a partir da receção de um briefing completo. Pode variar consoante os conteúdos fornecidos e as opções adicionadas.', 'O prazo é uma estimativa em dias úteis a partir do recebimento de um briefing completo. Pode variar conforme os conteúdos fornecidos e os opcionais adicionados.') },
  { q: t('Le nom de domaine et l’hébergement sont-ils inclus ?', 'O domínio e o alojamento estão incluídos?', 'O domínio e a hospedagem estão incluídos?'), a: t('Ils ne sont pas inclus dans le prix du modèle. Nous vous accompagnons pour la configuration sur votre hébergement ou vous proposons une solution adaptée lors de la mise en ligne.', 'Não estão incluídos no preço do modelo. Acompanhamo-lo na configuração no seu alojamento ou propomos uma solução adequada na publicação.', 'Não estão incluídos no preço do modelo. Acompanhamos você na configuração na sua hospedagem ou propomos uma solução adequada na publicação.') },
];

export const HOME_FAQ: { q: T3; a: T3 }[] = [
  { q: t('Comment se déroule l’achat d’un site ?', 'Como funciona a compra de um site?'), a: t('Vous choisissez un modèle et un pack, vous payez en ligne, puis vous remplissez un briefing. Nous réalisons votre site à partir de ce briefing et vous le validez avant la mise en ligne.', 'Escolhe um modelo e um pack, paga online e depois preenche um briefing. Realizamos o seu site a partir desse briefing e valida-o antes da publicação.', 'Você escolhe um modelo e um pacote, paga online e depois preenche um briefing. Realizamos seu site a partir desse briefing e você o valida antes da publicação.') },
  { q: t('Puis-je demander un site entièrement sur mesure ?', 'Posso pedir um site totalmente à medida?', 'Posso pedir um site totalmente sob medida?'), a: t('Oui. Pour un projet spécifique, une application ou une intégration, demandez un devis : nous revenons vers vous avec une proposition adaptée.', 'Sim. Para um projeto específico, uma aplicação ou uma integração, peça um orçamento: respondemos com uma proposta adequada.', 'Sim. Para um projeto específico, um aplicativo ou uma integração, peça um orçamento: respondemos com uma proposta adequada.') },
  { q: t('Quels moyens de paiement acceptez-vous ?', 'Que meios de pagamento aceitam?', 'Quais meios de pagamento vocês aceitam?'), a: t('Le paiement s’effectue en ligne sur une page sécurisée. Les moyens disponibles dépendent de votre pays et sont affichés au moment du paiement.', 'O pagamento é efetuado online numa página segura. Os meios disponíveis dependem do seu país e são apresentados no momento do pagamento.', 'O pagamento é feito online em uma página segura. Os meios disponíveis dependem do seu país e são exibidos no momento do pagamento.') },
  { q: t('Proposez-vous des logiciels en abonnement ?', 'Têm software por subscrição?', 'Vocês oferecem software por assinatura?'), a: t('Oui. ATHANA CRM et ATHANA Pointage sont disponibles en abonnement mensuel, avec une période d’essai. Vous pouvez résilier depuis votre espace client.', 'Sim. O ATHANA CRM e o ATHANA Pointage estão disponíveis por subscrição mensal, com período de teste. Pode cancelar na sua área de cliente.', 'Sim. O ATHANA CRM e o ATHANA Pointage estão disponíveis por assinatura mensal, com período de teste. Você pode cancelar na sua área do cliente.') },
  { q: t('Mes données sont-elles protégées ?', 'Os meus dados estão protegidos?', 'Meus dados estão protegidos?'), a: t('Nous ne stockons aucune donnée de carte bancaire et nous limitons les données collectées au nécessaire. Vous pouvez demander l’export ou la suppression de vos données depuis votre espace client.', 'Não guardamos quaisquer dados de cartões bancários e limitamos os dados recolhidos ao necessário. Pode pedir a exportação ou a eliminação dos seus dados na sua área de cliente.', 'Não armazenamos nenhum dado de cartão e limitamos os dados coletados ao necessário. Você pode pedir a exportação ou a exclusão dos seus dados na sua área do cliente.') },
];
