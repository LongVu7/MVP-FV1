const https = require('https');

https.get('https://mvp-fv1.onrender.com/api/source-data', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${data}`);
  });
}).on('error', err => {
  console.log(`Error: ${err.message}`);
});
