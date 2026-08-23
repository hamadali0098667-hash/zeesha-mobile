const https = require('https');

https.get('https://zeesha-mobile-1.vercel.app/assets/index-aSA365P2.js', res => {
  let js = '';
  res.on('data', d => js += d);
  res.on('end', () => {
    const matches = js.match(/https:\/\/[a-zA-Z0-9.-]+\/api\/settings/g);
    console.log('API settings URLs:', matches);
  });
});
