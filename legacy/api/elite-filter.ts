import { Resend } from 'resend';
import { getClientIp, isRateLimited } from './_utils/rateLimit.js';
import { escapeHtml } from './_utils/sanitize.js';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);
const eliteSchema = z.object({
  ambition: z.enum(['plateforme', 'refonte', 'automatisation', 'corporate']).optional(),
  stage: z.enum(['idee', 'maquette', 'remplacer']).optional(),
  budget: z.enum(['lt2k', '2k-5k', '5k+']).optional(),
  vision: z.string().max(3000).optional(),
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  company: z.string().min(1).max(160),
  phone: z.string().max(40).optional(),
  website: z.string().optional(),
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = getClientIp(req);
  if (isRateLimited(String(ip), 'elite-filter', { maxRequests: 6, windowMs: 60 * 60 * 1000 })) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const parsed = eliteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  // Honeypot check
  if (parsed.data.website) {
    return res.status(200).json({ success: true });
  }

  try {
    const { ambition, stage, budget, vision, name, email, company, phone } = parsed.data;
    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeCompany = escapeHtml(company.trim());
    const safePhone = escapeHtml((phone || 'Non renseigne').trim() || 'Non renseigne');
    const safeVision = escapeHtml((vision || 'Non renseigne').trim() || 'Non renseigne');
    const safeAmbition = escapeHtml((ambition || 'Non renseigne').toString());
    const safeStage = escapeHtml((stage || 'Non renseigne').toString());
    const safeBudget = escapeHtml((budget || 'Non renseigne').toString());

    const { data, error } = await resend.emails.send({
      from: 'Athana <contact@athana.ch>',
      to: [process.env.CONTACT_EMAIL || 'contact@athana.ch'],
      subject: `Nouvelle soumission Elite Filter: ${safeName} (${safeCompany})`,
      html: `
        <h2>Nouveau lead (Elite Filter)</h2>
        <p><strong>Nom:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Entreprise:</strong> ${safeCompany}</p>
        <p><strong>Telephone:</strong> ${safePhone}</p>
        <hr />
        <h3>Details du projet</h3>
        <p><strong>Ambition:</strong> ${safeAmbition}</p>
        <p><strong>Etape:</strong> ${safeStage}</p>
        <p><strong>Budget:</strong> ${safeBudget}</p>
        <p><strong>Vision:</strong></p>
        <p>${safeVision}</p>
      `,
    });

    if (error) {
      return res.status(400).json({ error: 'Failed to send email' });
    }

    res.status(200).json(data ?? { success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
}
