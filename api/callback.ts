import { Resend } from 'resend';
import { isRateLimited } from './_utils/rateLimit.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(String(ip))) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Numéro de téléphone requis' });
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone.length < 8) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Athana <contact@athana.ch>',
      to: [process.env.CONTACT_EMAIL || 'contact@athana.ch'],
      subject: `Rappel demandé - ${trimmedPhone}`,
      html: `
        <h2>Demande de rappel (Fast-Track)</h2>
        <p><strong>Numéro:</strong> ${trimmedPhone}</p>
        <p>Le client souhaite être rappelé dans les 2 heures.</p>
      `,
    });

    if (error) {
      return res.status(400).json({ error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error) });
    }

    return res.status(200).json(data ?? { success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
