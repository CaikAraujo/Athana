import type { Prisma } from '@prisma/client';

/**
 * Initial SaaS catalogue. These are bootstrap values only: once seeded, plans, prices,
 * limits and trial length are edited in Admin → Logiciels & plans (nothing reads this file at runtime).
 */
type PlanSeed = Omit<Prisma.PlanCreateManyInput, 'saasProductKey'>;
type T3 = { fr: string; 'pt-PT': string; 'pt-BR': string };

export const SAAS_PRODUCTS: { key: string; name: string; status: 'ACTIVE' | 'COMING_SOON'; sortOrder: number; tagline: T3; description: T3; plans: PlanSeed[] }[] = [
  {
    key: 'crm', name: 'ATHANA CRM', status: 'ACTIVE', sortOrder: 1,
    tagline: { fr: 'Le CRM simple pour les PME qui veulent vendre plus.', 'pt-PT': 'O CRM simples para PME que querem vender mais.', 'pt-BR': 'O CRM simples para PMEs que querem vender mais.' },
    description: {
      fr: 'Contacts, entreprises, pipeline de vente, tâches et propositions commerciales dans un seul outil, hébergé pour vous.',
      'pt-PT': 'Contactos, empresas, funil de vendas, tarefas e propostas comerciais numa única ferramenta, alojada por nós.',
      'pt-BR': 'Contatos, empresas, funil de vendas, tarefas e propostas comerciais em uma única ferramenta, hospedada para você.',
    },
    plans: [
      { key: 'STARTER', name: 'Starter', sortOrder: 1, prices: { EUR: 1900, CHF: 1900, BRL: 9900 }, limits: { users: 2, contacts: 500, companies: 200, storageMb: 500 }, features: ['pipeline', 'tasks'], highlights: [{ fr: '2 utilisateurs', 'pt-PT': '2 utilizadores', 'pt-BR': '2 usuários' }, { fr: '500 contacts', 'pt-PT': '500 contactos', 'pt-BR': '500 contatos' }, { fr: '1 pipeline de vente', 'pt-PT': '1 funil de vendas', 'pt-BR': '1 funil de vendas' }, { fr: 'Tâches et calendrier', 'pt-PT': 'Tarefas e calendário', 'pt-BR': 'Tarefas e calendário' }] },
      { key: 'BUSINESS', name: 'Business', sortOrder: 2, prices: { EUR: 4900, CHF: 4900, BRL: 24900 }, limits: { users: 10, contacts: 5000, companies: 2000, storageMb: 5000 }, features: ['pipeline', 'tasks', 'multiPipelines', 'proposals', 'export'], highlights: [{ fr: '10 utilisateurs', 'pt-PT': '10 utilizadores', 'pt-BR': '10 usuários' }, { fr: '5 000 contacts', 'pt-PT': '5 000 contactos', 'pt-BR': '5.000 contatos' }, { fr: 'Pipelines multiples', 'pt-PT': 'Múltiplos funis', 'pt-BR': 'Múltiplos funis' }, { fr: 'Propositions commerciales', 'pt-PT': 'Propostas comerciais', 'pt-BR': 'Propostas comerciais' }, { fr: 'Export CSV', 'pt-PT': 'Exportação CSV', 'pt-BR': 'Exportação CSV' }] },
      { key: 'PRO', name: 'Pro', sortOrder: 3, prices: { EUR: 9900, CHF: 9900, BRL: 49900 }, limits: { storageMb: 20000 }, features: ['pipeline', 'tasks', 'multiPipelines', 'proposals', 'export', 'reports'], highlights: [{ fr: 'Utilisateurs illimités', 'pt-PT': 'Utilizadores ilimitados', 'pt-BR': 'Usuários ilimitados' }, { fr: 'Contacts illimités', 'pt-PT': 'Contactos ilimitados', 'pt-BR': 'Contatos ilimitados' }, { fr: 'Rapports avancés', 'pt-PT': 'Relatórios avançados', 'pt-BR': 'Relatórios avançados' }, { fr: 'Support prioritaire', 'pt-PT': 'Suporte prioritário', 'pt-BR': 'Suporte prioritário' }] },
    ],
  },
  {
    key: 'pointage', name: 'ATHANA Pointage', status: 'ACTIVE', sortOrder: 2,
    tagline: { fr: 'Le pointage et la gestion des horaires, sans paperasse.', 'pt-PT': 'Registo de ponto e gestão de horários, sem papelada.', 'pt-BR': 'Ponto eletrônico e gestão de horários, sem papelada.' },
    description: {
      fr: 'Entrées, sorties, pauses, heures supplémentaires, absences et rapports exportables. Sur ordinateur et sur mobile.',
      'pt-PT': 'Entradas, saídas, pausas, horas extraordinárias, ausências e relatórios exportáveis. No computador e no telemóvel.',
      'pt-BR': 'Entradas, saídas, pausas, horas extras, ausências e relatórios exportáveis. No computador e no celular.',
    },
    plans: [
      { key: 'STARTER', name: 'Starter', sortOrder: 1, prices: { EUR: 2900, CHF: 2900, BRL: 14900 }, includedSeats: 10, seatPrices: { EUR: 300, CHF: 300, BRL: 1500 }, limits: { employees: 15 }, features: ['clock', 'absences'], highlights: [{ fr: '10 employés inclus', 'pt-PT': '10 funcionários incluídos', 'pt-BR': '10 funcionários incluídos' }, { fr: 'Pointage web et mobile', 'pt-PT': 'Registo web e móvel', 'pt-BR': 'Registro web e mobile' }, { fr: 'Absences et vacances', 'pt-PT': 'Ausências e férias', 'pt-BR': 'Ausências e férias' }] },
      { key: 'BUSINESS', name: 'Business', sortOrder: 2, prices: { EUR: 5900, CHF: 5900, BRL: 29900 }, includedSeats: 30, seatPrices: { EUR: 250, CHF: 250, BRL: 1200 }, limits: { employees: 60 }, features: ['clock', 'absences', 'departments', 'export', 'reports'], highlights: [{ fr: '30 employés inclus', 'pt-PT': '30 funcionários incluídos', 'pt-BR': '30 funcionários incluídos' }, { fr: 'Départements et responsables', 'pt-PT': 'Departamentos e gestores', 'pt-BR': 'Departamentos e gestores' }, { fr: 'Rapports et exports CSV / PDF', 'pt-PT': 'Relatórios e exportação CSV / PDF', 'pt-BR': 'Relatórios e exportação CSV / PDF' }] },
      { key: 'PRO', name: 'Pro', sortOrder: 3, prices: { EUR: 11900, CHF: 11900, BRL: 59900 }, includedSeats: 75, seatPrices: { EUR: 200, CHF: 200, BRL: 1000 }, limits: {}, features: ['clock', 'absences', 'departments', 'export', 'reports', 'audit'], highlights: [{ fr: '75 employés inclus', 'pt-PT': '75 funcionários incluídos', 'pt-BR': '75 funcionários incluídos' }, { fr: 'Employés supplémentaires à l’unité', 'pt-PT': 'Funcionários adicionais à unidade', 'pt-BR': 'Funcionários adicionais por unidade' }, { fr: 'Journal d’audit complet', 'pt-PT': 'Registo de auditoria completo', 'pt-BR': 'Registro de auditoria completo' }] },
    ],
  },
  ...(['pos', 'stock', 'booking', 'projects'] as const).map((key, i) => ({
    key, status: 'COMING_SOON' as const, sortOrder: 10 + i,
    name: { pos: 'ATHANA POS', stock: 'ATHANA Stock', booking: 'ATHANA Booking', projects: 'ATHANA Projects' }[key],
    tagline: {
      pos: { fr: 'Point de vente pour commerces et restaurants.', 'pt-PT': 'Ponto de venda para lojas e restaurantes.', 'pt-BR': 'Ponto de venda para lojas e restaurantes.' },
      stock: { fr: 'Gestion de stock et d’inventaire.', 'pt-PT': 'Gestão de stock e inventário.', 'pt-BR': 'Gestão de estoque e inventário.' },
      booking: { fr: 'Réservations et rendez-vous en ligne.', 'pt-PT': 'Reservas e marcações online.', 'pt-BR': 'Reservas e agendamentos online.' },
      projects: { fr: 'Gestion de projets et de tâches.', 'pt-PT': 'Gestão de projetos e tarefas.', 'pt-BR': 'Gestão de projetos e tarefas.' },
    }[key],
    description: { fr: 'En préparation.', 'pt-PT': 'Em preparação.', 'pt-BR': 'Em preparação.' },
    plans: [],
  })),
];

export async function seedSaas(db: { saasProduct: Prisma.SaasProductDelegate; plan: Prisma.PlanDelegate }) {
  for (const { plans, ...product } of SAAS_PRODUCTS) {
    await db.saasProduct.upsert({ where: { key: product.key }, create: product, update: {} });
    for (const plan of plans) {
      await db.plan.upsert({
        where: { saasProductKey_key: { saasProductKey: product.key, key: plan.key } },
        create: { ...plan, saasProductKey: product.key }, update: {},
      });
    }
  }
}
