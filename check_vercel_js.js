const https = require('https');

https.get('https://zeesha-mobile-1.vercel.app', (res) => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (!match) return console.log('Could not find main JS file in HTML');
    
    const jsUrl = 'https://zeesha-mobile-1.vercel.app' + match[1];
    console.log('Fetching:', jsUrl);
    
    https.get(jsUrl, (jsRes) => {
      let js = '';
      jsRes.on('data', d => js += d);
      jsRes.on('end', () => {
        const hasSettingsFetch = js.includes('/api/settings');
        const hasProductsFetch = js.includes('/api/products');
        console.log('Main JS contains /api/settings?', hasSettingsFetch);
        console.log('Main JS contains /api/products?', hasProductsFetch);
        
        // Let's count how many times it contains it
        const settingsCount = (js.match(/\/api\/settings/g) || []).length;
        console.log('Number of /api/settings occurrences:', settingsCount);
      });
    });
  });
});
