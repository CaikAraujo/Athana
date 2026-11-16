import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

const publicWhere: Prisma.ProductWhereInput = { status: 'PUBLISHED', deletedAt: null, category: { published: true, deletedAt: null } };

export const listCategories = cache(async () =>
  db.category.findMany({ where: { published: true, deletedAt: null, products: { some: publicWhere } }, orderBy: { sortOrder: 'asc' } }),
);

export async function listProducts(opts: { category?: string; q?: string; featured?: boolean; take?: number } = {}) {
  const q = opts.q?.trim().slice(0, 80);
  return db.product.findMany({
    where: {
      ...publicWhere,
      ...(opts.category ? { category: { slug: opts.category, published: true, deletedAt: null } } : {}),
      ...(opts.featured ? { featured: true } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q.toLowerCase() } }, { technologies: { has: q } }] } : {}),
    },
    include: { category: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: opts.take,
  });
}

export const getProduct = cache(async (slug: string) =>
  db.product.findFirst({
    where: { slug, ...publicWhere },
    include: {
      category: true,
      packages: { where: { active: true }, orderBy: { tier: 'asc' } },
      addons: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
      related: { where: publicWhere, include: { category: true }, take: 3 },
    },
  }),
);

export const listGlobalAddons = cache(async () => db.addon.findMany({ where: { active: true, global: true }, orderBy: { sortOrder: 'asc' } }));
