const http = require('http');
const fs = require('fs');
const data = JSON.stringify({ email: 'test@example.com', amount: 10, booking_id: 1, full_name: 'Test User', return_url: 'http://localhost:5173/payment-success' });
const req = http.request({ host: '127.0.0.1', port: 4001, path: '/api/payments/initialize', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    fs.writeFileSync('tmp-payment-response.json', JSON.stringify({ status: res.statusCode, body }, null, 2));
  });
});
req.on('error', (err) => {
  fs.writeFileSync('tmp-payment-response.json', JSON.stringify({ error: err.message }, null, 2));
});
req.write(data);
req.end();
