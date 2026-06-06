// Vercel Serverless Function — /api/send-otp
// Keeps Fonnte token secret on server side
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, otp } = req.body || {};
  if (!phone || !otp) return res.status(400).json({ error: 'phone and otp required' });

  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  if (!FONNTE_TOKEN) return res.status(500).json({ error: 'FONNTE_TOKEN not configured' });

  const message = `🚗 *Sowmiya Travels*\n\nYour OTP: *${otp}*\n\nValid 10 minutes. Do not share.\n_Your Journey, Our Joy_ 🌟`;

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ target: phone, message, countryCode: '91' })
    });

    const data = await response.json();
    console.log('Fonnte response:', data);

    if (data.status === true) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, reason: data.reason || 'Fonnte rejected' });
    }
  } catch (err) {
    console.error('Fonnte error:', err.message);
    return res.status(200).json({ success: false, reason: err.message });
  }
}

// Note: This file also handles booking WhatsApp confirmations
// POST body can contain { phone, otp } for OTP or { phone, message } for confirmations
