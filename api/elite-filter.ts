import { Resend } from 'resend';
import { isRateLimited } from './_utils/rateLimit';

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

  // Honeypot check
  if (req.body.website) {
    return res.status(200).json({ success: true });
  }

  try {
    const { ambition, stage, budget, vision, name, email, company, phone } = req.body;

    const { data, error } = await resend.emails.send({
      from: 'Athana <contact@athana.ch>',
      to: [process.env.CONTACT_EMAIL || 'contact@athana.ch'],
      subject: `Nouvelle soumission Elite Filter: ${name} (${company})`,
      html: `
        <h2>Nouveau lead (Elite Filter)</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Entreprise:</strong> ${company}</p>
        <p><strong>Téléphone:</strong> ${phone || 'Non renseigné'}</p>
        <hr />
        <h3>Détails du projet</h3>
        <p><strong>Ambition:</strong> ${ambition}</p>
        <p><strong>Étape:</strong> ${stage}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Vision:</strong></p>
        <p>${vision}</p>
      `,
    });

    if (error) {
      return res.status(400).json(error);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
}
