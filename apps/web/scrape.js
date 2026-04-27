const https = require('https');
const fs = require('fs');

https.get('https://www.pngmart.com/image/tag/cars-logo-brands', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const regex = /src=\"(https:\/\/www\.pngmart\.com\/files\/[^\"]+)\"/g;
    const matches = [];
    let match;
    while ((match = regex.exec(data)) !== null) {
      matches.push(match[1]);
    }
    const unique = [...new Set(matches)];
    console.log('Found ' + unique.length + ' image URLs.');
    fs.writeFileSync('urls.json', JSON.stringify(unique, null, 2));
  });
});
