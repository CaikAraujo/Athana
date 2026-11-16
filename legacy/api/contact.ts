import { Resend } from 'resend';
import { getClientIp, isRateLimited } from './_utils/rateLimit.js';
import { escapeHtml } from './_utils/sanitize.js';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);
const contactSchema = z.object({
  name: z.string().min(1).max(120),
  company: z.string().min(1).max(160),
  source: z.string().min(1).max(120),
  email: z.string().email().max(254),
  phone: z.string().max(40).optional(),
  message: z.string().min(1).max(4000),
  website: z.string().optional(),
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = getClientIp(req);
  if (isRateLimited(String(ip), 'contact', { maxRequests: 8, windowMs: 60 * 60 * 1000 })) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  // Honeypot check
  if (parsed.data.website) {
    return res.status(200).json({ success: true });
  }

  try {
    const { name, company, source, email, phone, message } = parsed.data;
    const safeName = escapeHtml(name.trim());
    const safeCompany = escapeHtml(company.trim());
    const safeSource = escapeHtml(source.trim());
    const safeEmail = escapeHtml(email.trim());
    const safePhone = escapeHtml((phone || 'Non renseigne').trim() || 'Non renseigne');
    const safeMessage = escapeHtml(message.trim());

    const { data, error } = await resend.emails.send({
      from: 'Athana <contact@athana.ch>',
      to: [process.env.CONTACT_EMAIL || 'contact@athana.ch'],
      subject: `Nouveau Contact: ${safeName} de ${safeCompany}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${safeName}</p>
        <p><strong>Entreprise:</strong> ${safeCompany}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Telephone:</strong> ${safePhone}</p>
        <p><strong>Source:</strong> ${safeSource}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
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
