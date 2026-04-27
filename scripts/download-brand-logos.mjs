/**
 * سكريبت تحميل شعارات الماركات محلياً
 * Download Brand Logos Locally - Permanent Fix
 * Run: node scripts/download-brand-logos.mjs
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../apps/web/public/brands')

// Create output directory if it doesn't exist
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  console.log(`✅ Created directory: ${OUTPUT_DIR}`)
}

// Logo sources - multiple fallbacks per brand
const LOGOS = [
  { key: 'toyota',        url: 'https://www.carlogos.org/car-logos/toyota-logo-2020-640x480.png' },
  { key: 'nissan',        url: 'https://www.carlogos.org/logo/Nissan-logo-2020-640x480.png' },
  { key: 'lexus',         url: 'https://www.carlogos.org/car-logos/lexus-logo-2022.png' },
  { key: 'honda',         url: 'https://www.carlogos.org/car-logos/honda-logo.png' },
  { key: 'hyundai',       url: 'https://www.carlogos.org/car-logos/hyundai-logo.png' },
  { key: 'kia',           url: 'https://www.carlogos.org/car-logos/kia-logo-2021.png' },
  { key: 'ford',          url: 'https://www.carlogos.org/car-logos/ford-logo.png' },
  { key: 'chevrolet',     url: 'https://www.carlogos.org/car-logos/chevrolet-logo.png' },
  { key: 'gmc',           url: 'https://www.carlogos.org/car-logos/gmc-logo.png' },
  { key: 'mercedes-benz', url: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
  { key: 'bmw',           url: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { key: 'audi',          url: 'https://www.carlogos.org/car-logos/audi-logo.png' },
  { key: 'porsche',       url: 'https://www.carlogos.org/car-logos/porsche-logo.png' },
  { key: 'mitsubishi',    url: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png' },
  { key: 'volkswagen',    url: 'https://www.carlogos.org/car-logos/volkswagen-logo.png' },
  { key: 'mazda',         url: 'https://www.carlogos.org/car-logos/mazda-logo.png' },
  { key: 'jeep',          url: 'https://www.carlogos.org/car-logos/jeep-logo.png' },
  { key: 'dodge',         url: 'https://www.carlogos.org/car-logos/dodge-logo.png' },
  { key: 'suzuki',        url: 'https://www.carlogos.org/car-logos/suzuki-logo.png' },
  { key: 'land-rover',    url: 'https://www.carlogos.org/car-logos/land-rover-logo.png' },
  { key: 'changan',       url: 'https://www.carlogos.org/car-logos/changan-logo.png' },
  { key: 'chery',         url: 'https://www.carlogos.org/car-logos/chery-logo.png' },
  { key: 'geely',         url: 'https://www.carlogos.org/car-logos/geely-logo.png' },
  { key: 'haval',         url: 'https://www.carlogos.org/car-logos/haval-logo.png' },
  { key: 'mg',            url: 'https://www.carlogos.org/car-logos/mg-logo.png' },
  { key: 'byd',           url: 'https://www.carlogos.org/car-logos/byd-logo-2022.png' },
  { key: 'gac',           url: 'https://www.carlogos.org/car-logos/gac-logo.png' },
  { key: 'great-wall',    url: 'https://www.carlogos.org/car-logos/great-wall-logo.png' },
  { key: 'jetour',        url: 'https://www.carlogos.org/car-logos/jetour-logo.png' },
  { key: 'tank',          url: 'https://www.carlogos.org/car-logos/tank-logo.png' },
  { key: 'baic',          url: 'https://www.carlogos.org/car-logos/baic-logo.png' },
  { key: 'hongqi',        url: 'https://www.carlogos.org/car-logos/hongqi-logo.png' },
  { key: 'bestune',       url: 'https://www.carlogos.org/car-logos/bestune-logo.png' },
  { key: 'maxus',         url: 'https://www.carlogos.org/car-logos/maxus-logo.png' },
  { key: 'exeed',         url: 'https://www.carlogos.org/car-logos/exeed-logo.png' },
  { key: 'volvo',         url: 'https://www.carlogos.org/car-logos/volvo-logo.png' },
  { key: 'jaguar',        url: 'https://www.carlogos.org/car-logos/jaguar-logo.png' },
  { key: 'maserati',      url: 'https://www.carlogos.org/car-logos/maserati-logo.png' },
  { key: 'ferrari',       url: 'https://www.carlogos.org/car-logos/ferrari-logo.png' },
  { key: 'lamborghini',   url: 'https://www.carlogos.org/car-logos/lamborghini-logo.png' },
  { key: 'bentley',       url: 'https://www.carlogos.org/car-logos/bentley-logo.png' },
  { key: 'rolls-royce',   url: 'https://www.carlogos.org/car-logos/rolls-royce-logo.png' },
  { key: 'aston-martin',  url: 'https://www.carlogos.org/car-logos/aston-martin-logo.png' },
  { key: 'mclaren',       url: 'https://www.carlogos.org/car-logos/mclaren-logo.png' },
  { key: 'genesis',       url: 'https://www.carlogos.org/car-logos/genesis-logo.png' },
  { key: 'peugeot',       url: 'https://www.carlogos.org/car-logos/peugeot-logo-2021.png' },
  { key: 'renault',       url: 'https://www.carlogos.org/car-logos/renault-logo-2021.png' },
  { key: 'citroen',       url: 'https://www.carlogos.org/car-logos/citroen-logo-2022.png' },
  { key: 'skoda',         url: 'https://www.carlogos.org/car-logos/skoda-logo-2022.png' },
  { key: 'mini',          url: 'https://www.carlogos.org/car-logos/mini-logo.png' },
  { key: 'fiat',          url: 'https://www.carlogos.org/car-logos/fiat-logo.png' },
  { key: 'alfa-romeo',    url: 'https://www.carlogos.org/car-logos/alfa-romeo-logo.png' },
  { key: 'tesla',         url: 'https://www.carlogos.org/car-logos/tesla-logo.png' },
  { key: 'subaru',        url: 'https://www.carlogos.org/car-logos/subaru-logo.png' },
  { key: 'cadillac',      url: 'https://www.carlogos.org/car-logos/cadillac-logo.png' },
  { key: 'lincoln',       url: 'https://www.carlogos.org/car-logos/lincoln-logo.png' },
  { key: 'infiniti',      url: 'https://www.carlogos.org/car-logos/infiniti-logo.png' },
  { key: 'acura',         url: 'https://www.carlogos.org/car-logos/acura-logo.png' },
  { key: 'opel',          url: 'https://www.carlogos.org/car-logos/opel-logo.png' },
  { key: 'ram',           url: 'https://www.carlogos.org/car-logos/ram-logo.png' },
  { key: 'isuzu',         url: 'https://www.carlogos.org/car-logos/isuzu-logo.png' },
  { key: 'daihatsu',      url: 'https://www.carlogos.org/car-logos/daihatsu-logo.png' },
  { key: 'proton',        url: 'https://www.carlogos.org/car-logos/proton-logo.png' },
  { key: 'dacia',         url: 'https://www.carlogos.org/car-logos/dacia-logo-2021.png' },
  { key: 'smart',         url: 'https://www.carlogos.org/car-logos/smart-logo.png' },
  { key: 'ssangyong',     url: 'https://www.carlogos.org/car-logos/ssangyong-logo.png' },
  { key: 'lotus',         url: 'https://www.carlogos.org/car-logos/lotus-logo.png' },
  { key: 'cupra',         url: 'https://www.carlogos.org/car-logos/cupra-logo.png' },
  { key: 'polestar',      url: 'https://www.carlogos.org/car-logos/polestar-logo.png' },
  { key: 'lucid',         url: 'https://www.carlogos.org/car-logos/lucid-logo.png' },
  { key: 'rivian',        url: 'https://www.carlogos.org/car-logos/rivian-logo.png' },
  { key: 'vinfast',       url: 'https://www.carlogos.org/car-logos/vinfast-logo.png' },
  { key: 'mahindra',      url: 'https://www.carlogos.org/car-logos/mahindra-logo.png' },
  { key: 'tata',          url: 'https://www.carlogos.org/car-logos/tata-logo.png' },
  { key: 'hummer',        url: 'https://www.carlogos.org/car-logos/hummer-logo.png' },
  { key: 'pontiac',       url: 'https://www.carlogos.org/car-logos/pontiac-logo.png' },
  { key: 'saab',          url: 'https://www.carlogos.org/car-logos/saab-logo.png' },
  { key: 'lancia',        url: 'https://www.carlogos.org/car-logos/lancia-logo.png' },
  { key: 'seat',          url: 'https://www.carlogos.org/car-logos/seat-logo.png' },
  { key: 'maybach',       url: 'https://www.carlogos.org/car-logos/maybach-logo.png' },
  { key: 'bugatti',       url: 'https://www.carlogos.org/car-logos/bugatti-logo.png' },
  { key: 'pagani',        url: 'https://www.carlogos.org/car-logos/pagani-logo.png' },
  { key: 'koenigsegg',    url: 'https://www.carlogos.org/car-logos/koenigsegg-logo.png' },
  { key: 'alpine',        url: 'https://www.carlogos.org/car-logos/alpine-logo.png' },
  { key: 'iveco',         url: 'https://www.carlogos.org/car-logos/iveco-logo.png' },
  { key: 'man',           url: 'https://www.carlogos.org/car-logos/man-logo.png' },
  { key: 'scania',        url: 'https://www.carlogos.org/car-logos/scania-logo.png' },
  { key: 'hino',          url: 'https://www.carlogos.org/car-logos/hino-logo.png' },
  { key: 'fuso',          url: 'https://www.carlogos.org/car-logos/fuso-logo.png' },
]

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const file = createWriteStream(destPath)

    const request = protocol.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.carlogos.org/'
      },
      timeout: 10000
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close()
        download(response.headers.location, destPath).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) {
        file.close()
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      response.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    })

    request.on('error', (err) => { file.close(); reject(err) })
    request.on('timeout', () => { request.destroy(); reject(new Error('Timeout')) })
  })
}

async function main() {
  console.log(`\n🚀 Downloading ${LOGOS.length} brand logos...\n`)

  const results = { success: [], failed: [] }

  for (const { key, url } of LOGOS) {
    const destPath = join(OUTPUT_DIR, `${key}.png`)
    try {
      await download(url, destPath)
      console.log(`  ✅ ${key}`)
      results.success.push(key)
    } catch (err) {
      console.log(`  ❌ ${key} — ${err.message}`)
      results.failed.push(key)
    }
    // Small delay to be polite to servers
    await new Promise(r => setTimeout(r, 150))
  }

  console.log(`\n📊 Results:`)
  console.log(`  ✅ Success: ${results.success.length}`)
  console.log(`  ❌ Failed:  ${results.failed.length}`)

  if (results.failed.length > 0) {
    console.log(`\n⚠️  Failed brands: ${results.failed.join(', ')}`)
  }

  console.log(`\n✨ Done! Logos saved to: ${OUTPUT_DIR}`)
  console.log(`\n📝 Now update brand-logos.config.ts to use local paths like /brands/{key}.png`)
}

main().catch(console.error)
