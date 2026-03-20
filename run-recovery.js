const https = require('https');

function postRequest(urlStr, data, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  const apiUrl = 'https://aivote.up.railway.app/api';
  console.log('Logging in to:', apiUrl);

  try {
    const loginRes = await postRequest(`${apiUrl}/auth/login`, JSON.stringify({
      email: 'admin@aivoting.com',
      password: 'TriadIA@2026!'
    }));

    if (loginRes.status !== 200 || !loginRes.data.token) {
      console.error('Login failed:', loginRes.status, loginRes.data);
      return;
    }

    const token = loginRes.data.token;
    console.log('Got token. Running fix-stats...');

    const fixRes = await postRequest(`${apiUrl}/admin/fix-stats`, JSON.stringify({}), token);
    console.log('Fix stats response:', fixRes.status, fixRes.data);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
