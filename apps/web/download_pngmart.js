const https = require('https');
const fs = require('fs');
const path = require('path');

const brands = ['Audi', 'BMW', 'BYD', 'Chery', 'Jeep', 'Chevrolet', 'Citroen', 'Fiat', 'Hyundai', 'Mercedes-Benz'];
const dir = path.join('c:/Users/DELL/Desktop/m/apps/web/public', 'makes');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function getUrl(brand) {
  return new Promise((resolve) => {
    https.get('https://www.pngmart.com/search/' + brand + '+Logo', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/href=\"(https:\/\/www\.pngmart\.com\/image\/[0-9]+)\"/);
        if (match) {
          https.get(match[1], { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
              const match2 = data2.match(/href=\"(https:\/\/www\.pngmart\.com\/files\/[^\"]+\.png)\"/);
              if (match2) {
                resolve(match2[1]);
              } else {
                resolve(null);
              }
            });
          });
        } else {
          resolve(null);
        }
      });
    });
  });
}

async function download() {
  for (const brand of brands) {
    const url = await getUrl(brand);
    if (url) {
      https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        res.pipe(fs.createWriteStream(path.join(dir, brand.toLowerCase() + '.png')));
        console.log('Downloaded ' + brand + ' from ' + url);
      });
    } else {
      console.log('Failed to find PNGMart URL for ' + brand);
    }
  }
}
download();
