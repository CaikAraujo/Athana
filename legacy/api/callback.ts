import { Resend } from 'resend';
import { getClientIp, isRateLimited } from './_utils/rateLimit.js';
import { escapeHtml } from './_utils/sanitize.js';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);
const callbackSchema = z.object({
  phone: z.string().min(8).max(40),
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = getClientIp(req);
  if (isRateLimited(String(ip), 'callback', { maxRequests: 10, windowMs: 60 * 60 * 1000 })) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const parsed = callbackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }
    const trimmedPhone = parsed.data.phone.trim();
    const safePhone = escapeHtml(trimmedPhone);

    const { data, error } = await resend.emails.send({
      from: 'Athana <contact@athana.ch>',
      to: [process.env.CONTACT_EMAIL || 'contact@athana.ch'],
      subject: `Rappel demande - ${safePhone}`,
      html: `
        <h2>Demande de rappel (Fast-Track)</h2>
        <p><strong>Numero:</strong> ${safePhone}</p>
        <p>Le client souhaite être rappelé dans les 2 heures.</p>
      `,
    });

    if (error) {
      return res.status(400).json({ error: 'Failed to send email' });
    }

    return res.status(200).json(data ?? { success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
