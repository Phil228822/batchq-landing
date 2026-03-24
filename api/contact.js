export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { first, last, email, category, message } = req.body || {};

  if (!first || !email) {
    return res.status(400).json({ ok: false, error: 'Missing required fields.' });
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BatchQ <noreply@batchq.app>',
      to:   'mophcrypto@gmail.com',
      reply_to: email,
      subject: `BatchQ Access Request: ${first} ${last || ''}`.trim(),
      text: [
        `Name: ${first} ${last || ''}`.trim(),
        `Email: ${email}`,
        `Category: ${category || 'Not specified'}`,
        '',
        message || '(no additional message)',
      ].join('\n'),
    }),
  });

  if (r.ok) return res.status(200).json({ ok: true });

  const err = await r.json().catch(() => ({}));
  return res.status(500).json({ ok: false, error: err.message || 'Failed to send.' });
}
