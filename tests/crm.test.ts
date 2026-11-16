import { beforeAll, describe, expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import { addMember, createTenant, db } from './helpers';
import { assertSubscription, loadTenantCtx, type TenantCtx } from '@/modules/tenancy/context';
import * as crm from '@/modules/crm/service';
import { zonedToUtc } from '@/modules/crm/dates';

const uid = () => randomBytes(4).toString('hex');
type Tenant = Awaited<ReturnType<typeof createTenant>>;

async function setup(plan: 'STARTER' | 'BUSINESS' | 'PRO' = 'BUSINESS') {
  const tenant = await createTenant('crm', plan);
  await crm.ensureOnboarded(tenant.ctx);
  return tenant;
}

/** Points the tenant's subscription to a dedicated plan so limits can be tested with small numbers. */
async function withCustomPlan(tenant: Tenant, limits: Record<string, number>, features: string[] = ['pipeline', 'tasks']): Promise<TenantCtx> {
  const plan = await db.plan.create({ data: { saasProductKey: 'crm', key: `TEST_${uid()}`, name: 'Test plan', prices: { EUR: 100 }, limits, features, active: false } });
  await db.subscription.update({ where: { organizationId_saasProductKey: { organizationId: tenant.org.id, saasProductKey: 'crm' } }, data: { planId: plan.id } });
  return loadTenantCtx(tenant.user.id, tenant.org.id, 'crm');
}

const code = (c: string) => expect.objectContaining({ code: c });

describe('CRM — onboarding', () => {
  it('creates one default pipeline with stages, once, and stamps onboardedAt', async () => {
    const t = await createTenant('crm', 'STARTER');
    const [a, b] = await Promise.all([crm.ensureOnboarded(t.ctx), crm.ensureOnboarded(t.ctx)]);
    expect([a.created, b.created].filter(Boolean)).toHaveLength(1);
    await crm.ensureOnboarded(t.ctx);
    const pipelines = await crm.listPipelines(t.ctx);
    expect(pipelines).toHaveLength(1);
    expect(pipelines[0].isDefault).toBe(true);
    expect(pipelines[0].stages.map((s) => s.name)).toEqual(['Nouveau', 'Qualifié', 'Proposition', 'Négociation', 'Gagné']);
    expect(pipelines[0].stages.at(-1)!.probability).toBe(100);
    expect((await db.organization.findUniqueOrThrow({ where: { id: t.org.id } })).onboardedAt).toBeInstanceOf(Date);
  });

  it('computes the checklist from data', async () => {
    const t = await setup();
    let list = await crm.onboardingChecklist(t.ctx);
    expect(list.completed).toBe(false);
    expect(list.doneCount).toBe(0);
    const contact = await crm.createContact(t.ctx, { firstName: 'Ada' });
    await crm.createCompany(t.ctx, { name: 'ACME' });
    await crm.createDeal(t.ctx, { title: 'Deal', contactId: contact.id });
    await crm.createTask(t.ctx, { title: 'Rappeler' });
    await addMember(t.org.id, 'MEMBER', 'crm');
    list = await crm.onboardingChecklist(t.ctx);
    expect(list.completed).toBe(true);
  });
});

describe('CRM — tenant isolation', () => {
  let A: Tenant, B: Tenant;
  let a: { company: { id: string }; contact: { id: string }; deal: { id: string }; stageIds: string[]; task: { id: string }; activity: { id: string }; proposal: { id: string } };
  let b: typeof a;
  const tag = `iso${uid()}`;

  async function seed(t: Tenant, label: string) {
    const company = await crm.createCompany(t.ctx, { name: `${tag} ${label} SA`, email: `info-${label}@${tag}.test` });
    const contact = await crm.createContact(t.ctx, { firstName: `${tag}`, lastName: `Person${label}`, email: `p-${label}@${tag}.test`, phone: '+41 79 000 00 00', companyId: company.id });
    const deal = await crm.createDeal(t.ctx, { title: `${tag} deal ${label}`, value: 100000, contactId: contact.id });
    const stageIds = (await crm.getDefaultPipeline(t.ctx)).stages.map((s) => s.id);
    const task = await crm.createTask(t.ctx, { title: `${tag} task ${label}`, contactId: contact.id });
    const activity = await crm.logActivity(t.ctx, { type: 'call', body: `${tag} call ${label}`, dealId: deal.id });
    const proposal = await crm.createProposal(t.ctx, { title: `${tag} proposal ${label}`, dealId: deal.id, lines: [{ description: 'Service', quantity: 1, unitAmount: 1000 }] });
    return { company, contact, deal, stageIds, task, activity, proposal };
  }

  beforeAll(async () => {
    A = await setup('BUSINESS');
    B = await setup('BUSINESS');
    a = await seed(A, 'A');
    b = await seed(B, 'B');
  });

  it('lists only the tenant’s own records', async () => {
    const [ca, cb] = [await crm.listContacts(A.ctx), await crm.listContacts(B.ctx)];
    expect(ca.items.map((c) => c.id)).toEqual([a.contact.id]);
    expect(cb.items.map((c) => c.id)).toEqual([b.contact.id]);
    expect((await crm.listCompanies(A.ctx)).items.map((c) => c.id)).toEqual([a.company.id]);
    expect((await crm.listDeals(A.ctx)).items.map((d) => d.id)).toEqual([a.deal.id]);
    expect((await crm.listTasks(A.ctx, { filter: 'all' })).items.map((x) => x.id)).toEqual([a.task.id]);
    expect((await crm.listTimeline(A.ctx)).map((x) => x.id)).toEqual([a.activity.id]);
    expect((await crm.listProposals(A.ctx)).items.map((x) => x.id)).toEqual([a.proposal.id]);
    expect((await crm.getBoard(A.ctx)).stages.flatMap((s) => s.deals.map((d) => d.id))).toEqual([a.deal.id]);
    // a foreign id used as a filter returns nothing
    expect((await crm.listContacts(A.ctx, { companyId: b.company.id })).total).toBe(0);
    expect(await crm.listTimeline(A.ctx, { dealId: b.deal.id })).toEqual([]);
  });

  it('get by id rejects foreign ids', async () => {
    await expect(crm.getContact(A.ctx, b.contact.id)).rejects.toMatchObject({ code: 'not_found' });
    await expect(crm.getCompany(A.ctx, b.company.id)).rejects.toMatchObject({ code: 'not_found' });
    await expect(crm.getDeal(A.ctx, b.deal.id)).rejects.toMatchObject({ code: 'not_found' });
    await expect(crm.getProposal(A.ctx, b.proposal.id)).rejects.toMatchObject({ code: 'not_found' });
    await expect(crm.getBoard(A.ctx, (await crm.getDefaultPipeline(B.ctx)).id)).rejects.toMatchObject({ code: 'not_found' });
    await expect(crm.listAttachments(A.ctx, 'contact', b.contact.id)).rejects.toMatchObject({ code: 'not_found' });
    expect((await crm.getContact(A.ctx, a.contact.id)).id).toBe(a.contact.id);
  });

  it('search never crosses tenants', async () => {
    const ra = await crm.globalSearch(A.ctx, tag);
    expect(ra.contacts.map((c) => c.id)).toEqual([a.contact.id]);
    expect(ra.companies.map((c) => c.id)).toEqual([a.company.id]);
    expect(ra.deals.map((d) => d.id)).toEqual([a.deal.id]);
    expect((await crm.globalSearch(A.ctx, 'PersonB')).total).toBe(0);
    expect((await crm.listContacts(A.ctx, { q: 'PersonB' })).total).toBe(0);
    expect((await crm.listContacts(A.ctx, { q: `${tag} persona` })).total).toBe(1); // multi-word, case-insensitive
    expect((await crm.listContacts(A.ctx, { q: `p-a@${tag}` })).total).toBe(1); // e-mail
    expect((await crm.listContacts(A.ctx, { q: '000 00' })).total).toBe(1); // phone
  });

  it('exports only the tenant’s rows', async () => {
    for (const type of ['contacts', 'companies', 'deals'] as const) {
      const out = await crm.exportCsv(A.ctx, type);
      expect(out.csv).toContain(tag);
      expect(out.rows).toBe(1);
      expect(out.csv).not.toMatch(/PersonB|B SA|deal B/);
    }
    expect((await crm.exportCsv(A.ctx, 'contacts')).csv).toContain('PersonA');
  });

  it('every mutation rejects a foreign-tenant id', async () => {
    const nf = { code: 'not_found' };
    await expect(crm.updateContact(A.ctx, b.contact.id, { firstName: 'Hack' })).rejects.toMatchObject(nf);
    await expect(crm.deleteContact(A.ctx, b.contact.id)).rejects.toMatchObject(nf);
    await expect(crm.convertLead(A.ctx, b.contact.id)).rejects.toMatchObject(nf);
    await expect(crm.updateCompany(A.ctx, b.company.id, { name: 'Hack' })).rejects.toMatchObject(nf);
    await expect(crm.deleteCompany(A.ctx, b.company.id)).rejects.toMatchObject(nf);
    // attach own contact to another tenant's company
    await expect(crm.updateContact(A.ctx, a.contact.id, { companyId: b.company.id })).rejects.toMatchObject(nf);
    await expect(crm.createContact(A.ctx, { firstName: 'X', companyId: b.company.id })).rejects.toMatchObject(nf);
    // owner must be a member of the tenant
    await expect(crm.createContact(A.ctx, { firstName: 'X', ownerId: B.user.id })).rejects.toMatchObject({ code: 'invalid' });
    await expect(crm.updateDeal(A.ctx, a.deal.id, { ownerId: B.user.id })).rejects.toMatchObject({ code: 'invalid' });
    await expect(crm.createTask(A.ctx, { title: 'X', assigneeId: B.user.id })).rejects.toMatchObject({ code: 'invalid' });
    // deals
    await expect(crm.moveDeal(A.ctx, a.deal.id, b.stageIds[1])).rejects.toMatchObject(nf);
    await expect(crm.moveDeal(A.ctx, b.deal.id, a.stageIds[1])).rejects.toMatchObject(nf);
    await expect(crm.createDeal(A.ctx, { title: 'X', stageId: b.stageIds[0] })).rejects.toMatchObject(nf);
    await expect(crm.createDeal(A.ctx, { title: 'X', contactId: b.contact.id })).rejects.toMatchObject(nf);
    await expect(crm.createDeal(A.ctx, { title: 'X', companyId: b.company.id })).rejects.toMatchObject(nf);
    await expect(crm.updateDeal(A.ctx, b.deal.id, { title: 'Hack' })).rejects.toMatchObject(nf);
    await expect(crm.markDealWon(A.ctx, b.deal.id)).rejects.toMatchObject(nf);
    await expect(crm.markDealLost(A.ctx, b.deal.id, 'x')).rejects.toMatchObject(nf);
    await expect(crm.deleteDeal(A.ctx, b.deal.id)).rejects.toMatchObject(nf);
    // activities & tasks
    await expect(crm.logActivity(A.ctx, { type: 'note', body: 'x', dealId: b.deal.id })).rejects.toMatchObject(nf);
    await expect(crm.logActivity(A.ctx, { type: 'note', body: 'x', contactId: b.contact.id })).rejects.toMatchObject(nf);
    await expect(crm.logActivity(A.ctx, { type: 'note', body: 'x', companyId: b.company.id })).rejects.toMatchObject(nf);
    await expect(crm.deleteActivity(A.ctx, b.activity.id)).rejects.toMatchObject(nf);
    await expect(crm.createTask(A.ctx, { title: 'X', dealId: b.deal.id })).rejects.toMatchObject(nf);
    await expect(crm.completeTask(A.ctx, b.task.id)).rejects.toMatchObject(nf);
    await expect(crm.updateTask(A.ctx, b.task.id, { title: 'Hack' })).rejects.toMatchObject(nf);
    await expect(crm.deleteTask(A.ctx, b.task.id)).rejects.toMatchObject(nf);
    // proposals
    await expect(crm.updateProposal(A.ctx, b.proposal.id, { title: 'Hack' })).rejects.toMatchObject(nf);
    await expect(crm.setProposalStatus(A.ctx, b.proposal.id, 'sent')).rejects.toMatchObject(nf);
    await expect(crm.deleteProposal(A.ctx, b.proposal.id)).rejects.toMatchObject(nf);
    await expect(crm.createProposal(A.ctx, { title: 'X', dealId: b.deal.id })).rejects.toMatchObject(nf);
    // pipeline configuration
    const pb = await crm.getDefaultPipeline(B.ctx);
    await expect(crm.renamePipeline(A.ctx, pb.id, 'Hack')).rejects.toMatchObject(nf);
    await expect(crm.addStage(A.ctx, pb.id, { name: 'Hack' })).rejects.toMatchObject(nf);
    await expect(crm.updateStage(A.ctx, b.stageIds[0], { name: 'Hack' })).rejects.toMatchObject(nf);
    await expect(crm.deleteStage(A.ctx, b.stageIds[4])).rejects.toMatchObject(nf);
    await expect(crm.reorderStages(A.ctx, pb.id, [...b.stageIds].reverse())).rejects.toMatchObject(nf);
    await expect(crm.deletePipeline(A.ctx, pb.id)).rejects.toMatchObject(nf);
    // attachments & team
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' });
    await expect(crm.uploadAttachment(A.ctx, { entityType: 'contact', entityId: b.contact.id, file })).rejects.toMatchObject(nf);
    await expect(crm.changeMemberRole(A.ctx, B.user.id, 'ADMIN')).rejects.toMatchObject(nf);
    await expect(crm.removeTeamMember(A.ctx, B.user.id)).rejects.toMatchObject(nf);

    // nothing changed on B's side
    const contact = await crm.getContact(B.ctx, b.contact.id);
    expect(contact.firstName).toBe(tag);
    expect((await crm.getDeal(B.ctx, b.deal.id)).stageId).toBe(b.stageIds[0]);
    expect((await crm.getDefaultPipeline(B.ctx)).stages.map((s) => s.id)).toEqual(b.stageIds);
    expect((await crm.getProposal(B.ctx, b.proposal.id)).status).toBe('draft');
  });
});

describe('CRM — plan limits and feature gating', () => {
  it('enforces the contacts and companies limits of the plan', async () => {
    const t = await setup('STARTER');
    expect(t.ctx.subscription!.plan.limits).toMatchObject({ contacts: 500 });
    const ctx = await withCustomPlan(t, { contacts: 3, companies: 1 });
    for (let i = 0; i < 3; i++) await crm.createContact(ctx, { firstName: `C${i}` });
    await expect(crm.createContact(ctx, { firstName: 'C4' })).rejects.toMatchObject({ code: 'limit' });
    await expect(crm.createLead(ctx, { firstName: 'L' })).rejects.toMatchObject({ code: 'limit' });
    await crm.createCompany(ctx, { name: 'One' });
    await expect(crm.createCompany(ctx, { name: 'Two' })).rejects.toMatchObject({ code: 'limit' });
    expect((await crm.listContacts(ctx)).total).toBe(3);
    const usage = await crm.planUsage(ctx);
    expect(usage.usage.find((u) => u.key === 'contacts')).toMatchObject({ used: 3, limit: 3 });
  });

  it('enforces the users limit before inviting', async () => {
    const t = await setup('STARTER'); // 2 users
    await crm.inviteTeamMember(t.ctx, { email: `inv-${uid()}@example.test`, name: 'Second' });
    await expect(crm.inviteTeamMember(t.ctx, { email: `inv-${uid()}@example.test`, name: 'Third' })).rejects.toMatchObject({ code: 'limit' });
    expect(await crm.listMembers(t.ctx)).toHaveLength(2);
  });

  it('enforces the storage limit and manages attachments', async () => {
    const t = await setup('BUSINESS');
    const contact = await crm.createContact(t.ctx, { firstName: 'Files' });
    const file = new File(['hello world'], 'memo.txt', { type: 'text/plain' });
    const asset = await crm.uploadAttachment(t.ctx, { entityType: 'contact', entityId: contact.id, file });
    expect(asset).toMatchObject({ organizationId: t.org.id, entityType: 'contact', entityId: contact.id, ownerId: t.user.id, size: 11 });
    const list = await crm.listAttachments(t.ctx, 'contact', contact.id);
    expect(list).toHaveLength(1);
    expect(list[0].url).toBe(`/api/files/${asset.id}`);
    await expect(crm.uploadAttachment(t.ctx, { entityType: 'invoice', entityId: contact.id, file })).rejects.toMatchObject({ code: 'invalid' });
    const tight = await withCustomPlan(t, { storageMb: 0 });
    await expect(crm.uploadAttachment(tight, { entityType: 'contact', entityId: contact.id, file })).rejects.toMatchObject({ code: 'limit' });
    await crm.deleteAttachment(t.ctx, asset.id);
    expect(await crm.listAttachments(t.ctx, 'contact', contact.id)).toHaveLength(0);
  });

  it('gates proposals, export, multiPipelines and reports by plan', async () => {
    const starter = await setup('STARTER');
    await expect(crm.createProposal(starter.ctx, { title: 'P' })).rejects.toMatchObject({ code: 'limit' });
    await expect(crm.listProposals(starter.ctx)).rejects.toMatchObject({ code: 'limit' });
    await expect(crm.exportCsv(starter.ctx, 'contacts')).rejects.toMatchObject({ code: 'limit' });
    await expect(crm.createPipeline(starter.ctx, { name: 'Second' })).rejects.toMatchObject({ code: 'limit' });
    await expect(crm.reports(starter.ctx)).rejects.toMatchObject({ code: 'limit' });
    expect(await crm.listPipelines(starter.ctx)).toHaveLength(1);

    const business = await setup('BUSINESS');
    expect((await crm.createProposal(business.ctx, { title: 'P' })).number).toBe('P-0001');
    expect((await crm.exportCsv(business.ctx, 'contacts')).csv.charCodeAt(0)).toBe(0xfeff);
    const second = await crm.createPipeline(business.ctx, { name: 'Partenaires' });
    expect(second.isDefault).toBe(false);
    expect(second.stages).toHaveLength(5);
    await expect(crm.reports(business.ctx)).rejects.toMatchObject({ code: 'limit' });

    const pro = await setup('PRO');
    const r = await crm.reports(pro.ctx);
    expect(r.wonLostByMonth).toHaveLength(6);
    expect(r.pipelineByStage).toHaveLength(5);
  });
});

describe('CRM — roles', () => {
  it('MEMBER can create and edit but not delete, export or configure; MANAGER can delete and export; ADMIN configures', async () => {
    const t = await setup('BUSINESS');
    const member = (await addMember(t.org.id, 'MEMBER', 'crm')).ctx;
    const manager = (await addMember(t.org.id, 'MANAGER', 'crm')).ctx;
    const admin = (await addMember(t.org.id, 'ADMIN', 'crm')).ctx;
    const fb = { code: 'forbidden' };

    const contact = await crm.createContact(member, { firstName: 'Mem', lastName: 'Ber' });
    expect(contact.ownerId).toBe(member.userId);
    await crm.updateContact(member, contact.id, { phone: '022 000 00 00' });
    const company = await crm.createCompany(member, { name: 'Member Co' });
    const deal = await crm.createDeal(member, { title: 'Member deal', value: 5000 });
    const pipeline = await crm.getDefaultPipeline(member);
    await crm.moveDeal(member, deal.id, pipeline.stages[1].id);
    const proposal = await crm.createProposal(member, { title: 'Offre' });

    await expect(crm.deleteContact(member, contact.id)).rejects.toMatchObject(fb);
    await expect(crm.deleteCompany(member, company.id)).rejects.toMatchObject(fb);
    await expect(crm.deleteDeal(member, deal.id)).rejects.toMatchObject(fb);
    await expect(crm.deleteProposal(member, proposal.id)).rejects.toMatchObject(fb);
    await expect(crm.exportCsv(member, 'contacts')).rejects.toMatchObject(fb);
    await expect(crm.createPipeline(member, { name: 'X' })).rejects.toMatchObject(fb);
    await expect(crm.renamePipeline(member, pipeline.id, 'X')).rejects.toMatchObject(fb);
    await expect(crm.addStage(member, pipeline.id, { name: 'X' })).rejects.toMatchObject(fb);
    await expect(crm.updateStage(member, pipeline.stages[0].id, { name: 'X' })).rejects.toMatchObject(fb);
    await expect(crm.deleteStage(member, pipeline.stages[4].id)).rejects.toMatchObject(fb);
    await expect(crm.inviteTeamMember(member, { email: `x-${uid()}@example.test`, name: 'X' })).rejects.toMatchObject(fb);
    await expect(crm.changeMemberRole(member, manager.userId, 'MEMBER')).rejects.toMatchObject(fb);
    await expect(crm.removeTeamMember(member, manager.userId)).rejects.toMatchObject(fb);

    // MANAGER: delete + export, but no configuration
    await expect(crm.createPipeline(manager, { name: 'X' })).rejects.toMatchObject(fb);
    await expect(crm.inviteTeamMember(manager, { email: `x-${uid()}@example.test`, name: 'X' })).rejects.toMatchObject(fb);
    expect((await crm.exportCsv(manager, 'contacts')).rows).toBe(1);
    await crm.deleteProposal(manager, proposal.id);
    await crm.deleteDeal(manager, deal.id);
    await crm.deleteContact(manager, contact.id);
    await crm.deleteCompany(manager, company.id);

    // a member may only delete their own activities / tasks
    const c2 = await crm.createContact(manager, { firstName: 'Two' });
    const note = await crm.logActivity(manager, { type: 'note', body: 'By manager', contactId: c2.id });
    await expect(crm.deleteActivity(member, note.id)).rejects.toMatchObject(fb);
    const task = await crm.createTask(manager, { title: 'Manager task' });
    await expect(crm.deleteTask(member, task.id)).rejects.toMatchObject(fb);

    // ADMIN: configuration and team
    const stage = await crm.addStage(admin, pipeline.id, { name: 'Signature', probability: 90 });
    expect(stage.position).toBe(5);
    await crm.changeMemberRole(admin, member.userId, 'MANAGER');
    await crm.removeTeamMember(admin, member.userId);
    expect((await crm.listMembers(admin)).some((x) => x.userId === member.userId)).toBe(false);
    await expect(crm.removeTeamMember(admin, t.user.id)).rejects.toMatchObject({ code: 'invalid' }); // owner
    await expect(crm.removeTeamMember(admin, admin.userId)).rejects.toMatchObject({ code: 'conflict' });

    const actions = (await db.auditLog.findMany({ where: { organizationId: t.org.id } })).map((l) => l.action);
    for (const a of ['crm.contact.deleted', 'crm.company.deleted', 'crm.deal.deleted', 'crm.proposal.deleted', 'crm.export', 'crm.stage.created', 'member.role_changed', 'member.removed']) expect(actions).toContain(a);
  });
});

describe('CRM — pipelines and stages', () => {
  it('configures stages, keeps exactly one default pipeline and protects stages with deals', async () => {
    const t = await setup('BUSINESS');
    const p1 = await crm.getDefaultPipeline(t.ctx);
    const ids = p1.stages.map((s) => s.id);
    await crm.updateStage(t.ctx, ids[0], { name: 'Entrant', probability: 5 });
    await expect(crm.updateStage(t.ctx, ids[0], { probability: 150 })).rejects.toThrow();
    await crm.moveStage(t.ctx, ids[0], 'down');
    let stages = (await crm.getDefaultPipeline(t.ctx)).stages;
    expect(stages.map((s) => s.id)).toEqual([ids[1], ids[0], ids[2], ids[3], ids[4]]);
    expect(stages.map((s) => s.position)).toEqual([0, 1, 2, 3, 4]);
    await expect(crm.reorderStages(t.ctx, p1.id, [ids[0], ids[1]])).rejects.toMatchObject({ code: 'invalid' });
    await crm.reorderStages(t.ctx, p1.id, ids);

    const deal = await crm.createDeal(t.ctx, { title: 'Blocker', stageId: ids[2] });
    await expect(crm.deleteStage(t.ctx, ids[2])).rejects.toMatchObject({ code: 'conflict' });
    await crm.deleteStage(t.ctx, ids[3]);
    stages = (await crm.getDefaultPipeline(t.ctx)).stages;
    expect(stages.map((s) => s.position)).toEqual([0, 1, 2, 3]);

    const p2 = await crm.createPipeline(t.ctx, { name: 'Second', stages: [{ name: 'A', probability: 20 }, { name: 'B', probability: 100 }] });
    await expect(crm.moveDeal(t.ctx, deal.id, p2.stages[0].id)).rejects.toMatchObject({ code: 'invalid' }); // other pipeline
    await crm.setDefaultPipeline(t.ctx, p2.id);
    let all = await crm.listPipelines(t.ctx);
    expect(all.filter((p) => p.isDefault).map((p) => p.id)).toEqual([p2.id]);
    await expect(crm.deletePipeline(t.ctx, p1.id)).rejects.toMatchObject({ code: 'conflict' }); // still has a deal
    await crm.deletePipeline(t.ctx, p2.id);
    all = await crm.listPipelines(t.ctx);
    expect(all.map((p) => [p.id, p.isDefault])).toEqual([[p1.id, true]]);
    await crm.deleteDeal(t.ctx, deal.id);
    await expect(crm.deletePipeline(t.ctx, p1.id)).rejects.toMatchObject({ code: 'conflict' }); // last pipeline
  });
});

describe('CRM — deals', () => {
  it('moves, wins, loses, reopens and computes the weighted forecast', async () => {
    const t = await setup('BUSINESS');
    const stages = (await crm.getDefaultPipeline(t.ctx)).stages; // 10 / 30 / 60 / 80 / 100
    const contact = await crm.createContact(t.ctx, { firstName: 'Lead', lastName: 'One' });
    const d1 = await crm.createDeal(t.ctx, { title: 'D1', value: 100000, contactId: contact.id });
    const d2 = await crm.createDeal(t.ctx, { title: 'D2', value: 50050, stageId: stages[2].id });
    const d3 = await crm.createDeal(t.ctx, { title: 'D3', value: 20000 });
    expect(d1).toMatchObject({ stageId: stages[0].id, status: 'OPEN', currency: 'EUR', ownerId: t.user.id });

    let board = await crm.getBoard(t.ctx);
    expect(board.stages[0]).toMatchObject({ count: 2, total: 120000, weighted: 12000 });
    expect(board.stages[2]).toMatchObject({ count: 1, total: 50050, weighted: 30030 });
    expect(board.totals).toEqual({ count: 3, value: 170050, weighted: 42030 });

    await crm.moveDeal(t.ctx, d1.id, stages[3].id);
    board = await crm.getBoard(t.ctx);
    expect(board.totals.weighted).toBe(2000 + 30030 + 80000);
    let kpis = await crm.dashboardKpis(t.ctx);
    expect(kpis).toMatchObject({ openValue: 170050, openCount: 3, forecast: 112030, wonThisMonth: 0, conversionRate: null });

    // win
    const won = await crm.markDealWon(t.ctx, d1.id);
    expect(won.status).toBe('WON');
    expect(won.closedAt).toBeInstanceOf(Date);
    expect(won.stageId).toBe(stages[4].id);
    expect((await crm.getContact(t.ctx, contact.id)).lifecycle).toBe('CUSTOMER');
    await expect(crm.moveDeal(t.ctx, d1.id, stages[1].id)).rejects.toMatchObject({ code: 'conflict' });

    // lose
    const lost = await crm.markDealLost(t.ctx, d3.id, '  Trop cher ');
    expect(lost).toMatchObject({ status: 'LOST', lostReason: 'Trop cher' });
    expect(lost.closedAt).toBeInstanceOf(Date);

    board = await crm.getBoard(t.ctx);
    expect(board.totals).toEqual({ count: 1, value: 50050, weighted: 30030 }); // closed deals are out of the forecast
    expect(board.stages[4].deals.map((d) => d.id)).toEqual([d1.id]); // recently won deals stay visible
    expect(board.stages.flatMap((s) => s.deals.map((d) => d.id))).not.toContain(d3.id);
    kpis = await crm.dashboardKpis(t.ctx);
    expect(kpis).toMatchObject({ openValue: 50050, forecast: 30030, wonThisMonth: 100000, wonThisMonthCount: 1, conversionRate: 50 });

    // reopen
    const reopened = await crm.reopenDeal(t.ctx, d3.id);
    expect(reopened).toMatchObject({ status: 'OPEN', closedAt: null, lostReason: null });
    await crm.moveDeal(t.ctx, d3.id, stages[1].id);
    expect((await crm.getBoard(t.ctx)).totals).toEqual({ count: 2, value: 70050, weighted: 36030 });
    expect((await crm.getDeal(t.ctx, d3.id)).weighted).toBe(6000);
    expect((await crm.listDeals(t.ctx, { status: 'WON' })).items.map((d) => d.id)).toEqual([d1.id]);
    void d2;
  });

  it('validates input', async () => {
    const t = await setup('BUSINESS');
    await expect(crm.createDeal(t.ctx, { title: '' })).rejects.toThrow();
    await expect(crm.createDeal(t.ctx, { title: 'X', value: -5 })).rejects.toThrow();
    await expect(crm.createContact(t.ctx, { firstName: 'X', email: 'not-an-email' })).rejects.toThrow();
    await expect(crm.createContact(t.ctx, { firstName: '  ' })).rejects.toThrow();
  });
});

describe('CRM — contacts, leads, activities, tasks', () => {
  it('filters, sorts, paginates and converts leads', async () => {
    const t = await setup('BUSINESS');
    const company = await crm.createCompany(t.ctx, { name: 'Filtre SA' });
    const names = ['Alice', 'Bruno', 'Chloé', 'David', 'Emma'];
    for (const [i, firstName] of names.entries()) {
      await crm.createContact(t.ctx, { firstName, lastName: `Z${9 - i}`, lifecycle: i < 3 ? 'LEAD' : 'CUSTOMER', companyId: i % 2 ? company.id : '', source: i < 2 ? 'Salon' : '' });
    }
    const page1 = await crm.listContacts(t.ctx, { pageSize: 2, sort: 'name', dir: 'asc' });
    expect(page1).toMatchObject({ total: 5, pages: 3, page: 1 });
    expect(page1.items.map((c) => c.firstName)).toEqual(['Emma', 'David']);
    const page3 = await crm.listContacts(t.ctx, { pageSize: 2, page: 3 });
    expect(page3.items.map((c) => c.firstName)).toEqual(['Alice']);
    expect((await crm.listContacts(t.ctx, { lifecycle: 'CUSTOMER' })).total).toBe(2);
    expect((await crm.listContacts(t.ctx, { companyId: company.id })).items.map((c) => c.firstName).sort()).toEqual(['Bruno', 'David']);
    expect((await crm.listContacts(t.ctx, { ownerId: t.user.id })).total).toBe(5);
    expect((await crm.listContacts(t.ctx, { q: 'filtre' })).total).toBe(2); // company name

    const leads = await crm.listLeads(t.ctx);
    expect(leads.total).toBe(3);
    const lead = leads.items.find((l) => l.firstName === 'Alice')!;
    expect((await crm.convertLead(t.ctx, lead.id)).lifecycle).toBe('PROSPECT');
    expect((await crm.listLeads(t.ctx)).total).toBe(2);
    expect((await crm.convertLead(t.ctx, lead.id)).lifecycle).toBe('CUSTOMER');
    await expect(crm.convertLead(t.ctx, lead.id)).rejects.toMatchObject({ code: 'conflict' });
    const direct = leads.items.find((l) => l.firstName === 'Bruno')!;
    expect((await crm.convertLead(t.ctx, direct.id, 'CUSTOMER')).lifecycle).toBe('CUSTOMER');
    expect(await crm.leadSourceOptions(t.ctx)).toEqual(['Salon']);

    // clearing optional fields
    const updated = await crm.updateContact(t.ctx, direct.id, { companyId: '', source: '' });
    expect(updated).toMatchObject({ companyId: null, source: null, firstName: 'Bruno' });
  });

  it('keeps a communication history per contact, company and deal', async () => {
    const t = await setup('BUSINESS');
    const company = await crm.createCompany(t.ctx, { name: 'Histoire SA' });
    const contact = await crm.createContact(t.ctx, { firstName: 'Hist', companyId: company.id });
    const deal = await crm.createDeal(t.ctx, { title: 'Deal', contactId: contact.id });
    expect(deal.companyId).toBe(company.id);
    await crm.logActivity(t.ctx, { type: 'note', body: 'Note contact', contactId: contact.id, occurredAt: '2026-01-10T09:00:00Z' });
    await crm.logActivity(t.ctx, { type: 'meeting', body: 'Démo', dealId: deal.id, occurredAt: '2026-01-12T14:00:00Z' });
    await crm.logActivity(t.ctx, { type: 'email', body: 'Mail entreprise', companyId: company.id, occurredAt: '2026-01-11T09:00:00Z' });
    await expect(crm.logActivity(t.ctx, { type: 'sms' as 'note', body: 'x', contactId: contact.id })).rejects.toThrow();
    await expect(crm.logActivity(t.ctx, { type: 'note', body: 'orphan' })).rejects.toMatchObject({ code: 'invalid' });
    expect((await crm.listTimeline(t.ctx, { contactId: contact.id })).map((a) => a.body)).toEqual(['Démo', 'Note contact']);
    expect((await crm.listTimeline(t.ctx, { companyId: company.id })).map((a) => a.body)).toEqual(['Démo', 'Mail entreprise', 'Note contact']);
    expect((await crm.listTimeline(t.ctx, { dealId: deal.id })).map((a) => a.type)).toEqual(['meeting']);
    const [first] = await crm.listTimeline(t.ctx, { dealId: deal.id });
    expect(first.userName).toBeTruthy();
    await crm.deleteActivity(t.ctx, first.id);
    expect(await crm.listTimeline(t.ctx, { dealId: deal.id })).toHaveLength(0);
  });

  it('manages tasks: assignment, my tasks, overdue, done and calendar', async () => {
    const t = await setup('BUSINESS');
    const mate = await addMember(t.org.id, 'MEMBER', 'crm');
    const contact = await crm.createContact(t.ctx, { firstName: 'Cal' });
    const past = await crm.createTask(t.ctx, { title: 'En retard', dueAt: '2020-03-10' });
    const future = await crm.createTask(t.ctx, { title: 'Plus tard', dueAt: '2099-03-15', contactId: contact.id });
    const theirs = await crm.createTask(t.ctx, { title: 'Pour le collègue', assigneeId: mate.user.id, dueAt: '2099-03-15' });
    expect(past.dueAt!.toISOString()).toBe('2020-03-10T12:00:00.000Z');
    expect(theirs.assigneeId).toBe(mate.user.id);

    expect((await crm.listTasks(t.ctx, { filter: 'mine' })).items.map((x) => x.id)).toEqual([past.id, future.id]);
    expect((await crm.listTasks(mate.ctx, { filter: 'mine' })).items.map((x) => x.id)).toEqual([theirs.id]);
    expect((await crm.listTasks(t.ctx, { filter: 'all' })).total).toBe(3);
    const overdue = await crm.listTasks(t.ctx, { filter: 'overdue' });
    expect(overdue.items.map((x) => x.id)).toEqual([past.id]);
    expect(overdue.items[0].overdue).toBe(true);
    expect((await crm.dashboardKpis(t.ctx)).tasksDue).toBe(1);

    await crm.completeTask(t.ctx, past.id);
    expect((await crm.listTasks(t.ctx, { filter: 'overdue' })).total).toBe(0);
    expect((await crm.listTasks(t.ctx, { filter: 'done' })).items.map((x) => x.id)).toEqual([past.id]);
    await crm.reopenTask(t.ctx, past.id);
    expect((await crm.listTasks(t.ctx, { filter: 'done' })).total).toBe(0);
    await crm.assignTask(t.ctx, past.id, mate.user.id);
    expect((await crm.listTasks(mate.ctx, { filter: 'mine' })).total).toBe(2);

    // calendar: tasks by due date + meetings by local day
    await crm.logActivity(t.ctx, { type: 'meeting', body: 'Réunion tardive', contactId: contact.id, occurredAt: zonedToUtc('2099-03-31T23:30', 'Europe/Zurich')! });
    await crm.logActivity(t.ctx, { type: 'call', body: 'Pas dans le calendrier', contactId: contact.id, occurredAt: '2099-03-20T10:00:00Z' });
    const march = await crm.calendarMonth(t.ctx, 2099, 3, 'Europe/Zurich');
    expect(march.daysInMonth).toBe(31);
    expect(march.firstWeekday).toBe(6); // 1 March 2099 is a Sunday
    expect(march.days['2099-03-15'].map((e) => e.title).sort()).toEqual(['Plus tard', 'Pour le collègue']);
    expect(march.days['2099-03-31'].map((e) => [e.kind, e.title])).toEqual([['meeting', 'Réunion tardive']]);
    expect(march.days['2099-03-20']).toBeUndefined();
    const april = await crm.calendarMonth(t.ctx, 2099, 4, 'Europe/Zurich');
    expect(Object.keys(april.days)).toEqual([]);
    expect((await crm.calendarMonth(t.ctx, 2099, 4, 'UTC')).days['2099-04-01']).toBeUndefined(); // 21:30 UTC is still 31 March
  });
});

describe('CRM — proposals', () => {
  it('numbers per tenant, computes totals and follows the status flow', async () => {
    const A = await setup('BUSINESS');
    const B = await setup('BUSINESS');
    const p1 = await crm.createProposal(A.ctx, { title: 'Site web', recipient: 'ACME SA', validUntil: '2099-12-31', lines: [{ description: 'Design', quantity: 2, unitAmount: 150000 }, { description: 'Heures', quantity: 1.5, unitAmount: 9990 }] });
    expect(p1).toMatchObject({ number: 'P-0001', total: 300000 + 14985, status: 'draft', currency: 'EUR' });
    const more = await Promise.all([1, 2, 3].map((i) => crm.createProposal(A.ctx, { title: `Parallèle ${i}` })));
    expect(more.map((p) => p.number).sort()).toEqual(['P-0002', 'P-0003', 'P-0004']);
    expect((await crm.createProposal(B.ctx, { title: 'Autre tenant' })).number).toBe('P-0001');
    await crm.deleteProposal(A.ctx, more.find((p) => p.number === 'P-0003')!.id);
    expect((await crm.createProposal(A.ctx, { title: 'Suivante' })).number).toBe('P-0005'); // numbers are never reused below the max

    const updated = await crm.updateProposal(A.ctx, p1.id, { lines: [{ description: 'Forfait', quantity: 3, unitAmount: 33333 }] });
    expect(updated.total).toBe(99999);
    expect((await crm.updateProposal(A.ctx, p1.id, { title: 'Nouveau titre' })).total).toBe(99999); // lines untouched
    await expect(crm.updateProposal(A.ctx, p1.id, { lines: [{ description: 'X', quantity: 0, unitAmount: 100 }] })).rejects.toThrow();
    await expect(crm.updateProposal(A.ctx, p1.id, { lines: [{ description: 'X', quantity: 1, unitAmount: -1 }] })).rejects.toThrow();

    const empty = more[0];
    await expect(crm.setProposalStatus(A.ctx, empty.id, 'sent')).rejects.toMatchObject({ code: 'invalid' }); // no line
    await expect(crm.setProposalStatus(A.ctx, p1.id, 'accepted')).rejects.toMatchObject({ code: 'conflict' }); // draft → accepted
    expect((await crm.setProposalStatus(A.ctx, p1.id, 'sent')).status).toBe('sent');
    await expect(crm.updateProposal(A.ctx, p1.id, { title: 'Verrouillée' })).rejects.toMatchObject({ code: 'conflict' });
    expect((await crm.setProposalStatus(A.ctx, p1.id, 'accepted')).status).toBe('accepted');
    await expect(crm.setProposalStatus(A.ctx, p1.id, 'rejected')).rejects.toMatchObject({ code: 'conflict' });
    await expect(crm.setProposalStatus(A.ctx, p1.id, 'paid')).rejects.toThrow();

    const got = await crm.getProposal(A.ctx, p1.id);
    expect(got.lines).toEqual([{ description: 'Forfait', quantity: 3, unitAmount: 33333 }]);
    expect(got.validUntil!.toISOString().slice(0, 10)).toBe('2099-12-31');
  });
});

describe('CRM — CSV export', () => {
  it('escapes cells and neutralises formulas', () => {
    expect(crm.csvCell('simple')).toBe('simple');
    expect(crm.csvCell(null)).toBe('');
    expect(crm.csvCell('a;b')).toBe('"a;b"');
    expect(crm.csvCell('a,b')).toBe('"a,b"');
    expect(crm.csvCell('dit "bonjour"')).toBe('"dit ""bonjour"""');
    expect(crm.csvCell('ligne 1\nligne 2')).toBe('"ligne 1\nligne 2"');
    expect(crm.csvCell('=SUM(A1:A9)')).toBe("'=SUM(A1:A9)");
    expect(crm.csvCell('+41 79 123 45 67')).toBe("'+41 79 123 45 67");
    expect(crm.csvCell('-2+3')).toBe("'-2+3");
    expect(crm.csvCell('@cmd')).toBe("'@cmd");
    expect(crm.csvCell('=1;"x"')).toBe('"\'=1;""x"""');
    expect(crm.csvCell('a=b')).toBe('a=b');
    expect(crm.toCsv(['A', 'B'], [[1, 'é']])).toBe('﻿A;B\r\n1;é\r\n');
  });

  it('exports real data safely', async () => {
    const t = await setup('BUSINESS');
    const company = await crm.createCompany(t.ctx, { name: 'Dupont; Fils & "Cie"' });
    await crm.createContact(t.ctx, { firstName: '=HYPERLINK("http://evil.test")', lastName: 'Ünïcode', phone: '+41 22 000', notes: 'Ligne 1\nLigne 2', companyId: company.id, lifecycle: 'CUSTOMER' });
    await crm.createDeal(t.ctx, { title: '@risque', value: 123450, companyId: company.id });
    const contacts = await crm.exportCsv(t.ctx, 'contacts');
    expect(contacts.filename).toMatch(/^crm-contacts-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(contacts.csv.startsWith('﻿Prénom;Nom;E-mail;')).toBe(true);
    expect(contacts.csv).toContain('"\'=HYPERLINK(""http://evil.test"")";Ünïcode;;\'+41 22 000;;Client;;"Dupont; Fils & ""Cie""";"Ligne 1\nLigne 2";');
    expect(contacts.csv).not.toMatch(/(^|;|\n)=/);
    const deals = await crm.exportCsv(t.ctx, 'deals', (s) => (s === 'Titre' ? 'Título' : s));
    expect(deals.csv).toContain('Título;Montant;');
    expect(deals.csv).toContain("'@risque;1234.50;EUR;En cours;");
    expect((await crm.exportCsv(t.ctx, 'companies')).csv).toContain('"Dupont; Fils & ""Cie"""');
    await expect(crm.exportCsv(t.ctx, 'users')).rejects.toMatchObject({ code: 'not_found' });
  });
});

describe('CRM — subscription state', () => {
  it('rejects tenants whose subscription is expired, cancelled past its period, incomplete or missing', async () => {
    const t = await setup('BUSINESS');
    const sub = { organizationId_saasProductKey: { organizationId: t.org.id, saasProductKey: 'crm' } };
    const reload = () => loadTenantCtx(t.user.id, t.org.id, 'crm');
    expect(() => assertSubscription(t.ctx)).not.toThrow();

    await db.subscription.update({ where: sub, data: { status: 'CANCELED', currentPeriodEnd: new Date(Date.now() + 86400_000) } });
    const stillPaid = await reload();
    expect(() => assertSubscription(stillPaid)).not.toThrow(); // usable until the end of the paid period

    await db.subscription.update({ where: sub, data: { status: 'CANCELED', currentPeriodEnd: new Date(Date.now() - 86400_000) } });
    const cancelled = await reload();
    expect(() => assertSubscription(cancelled)).toThrow(code('forbidden'));

    await db.subscription.update({ where: sub, data: { status: 'TRIALING', currentPeriodEnd: new Date(Date.now() - 1000) } });
    const expiredTrial = await reload();
    expect(() => assertSubscription(expiredTrial)).toThrow(code('forbidden'));

    await db.subscription.update({ where: sub, data: { status: 'INCOMPLETE', currentPeriodEnd: new Date(Date.now() + 86400_000) } });
    const incomplete = await reload();
    expect(() => assertSubscription(incomplete)).toThrow(code('forbidden'));

    const none = await createTenant(undefined);
    const noSub = await loadTenantCtx(none.user.id, none.org.id, 'crm');
    expect(noSub.subscription).toBeNull();
    expect(() => assertSubscription(noSub)).toThrow(code('forbidden'));
  });
});
