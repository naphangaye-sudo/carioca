const https = require('https');

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) { res.status(500).json({ error: 'API key not configured' }); return; }

  const payload = JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: req.body.max_tokens || 1000,
    system: req.body.system || "",
    messages: req.body.messages || [],
  });

  return new Promise((resolve) => {
    const request = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload),
      }
    }, (response) => {
      let data = '';
      response.on('data', c => data += c);
      response.on('end', () => {
        res.status(200).json(JSON.parse(data));
        resolve();
      });
    });
    request.on('error', (e) => { res.status(500).json({ error: e.message }); resolve(); });
    request.write(payload);
    request.end();
  });
};
