/**
 * Final fix for the last 4 missing brands (Skoda, Tank, Dacia, Cupra)
 * Using carlogos.org with proper headers
 * Run: node scripts/final-4-fix.mjs
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../apps/web/public/brands')

const MISSING = [
  { key: 'skoda', url: 'https://www.carlogos.org/car-logos/skoda-logo-2022.png' },
  { key: 'tank',  url: 'https://www.carlogos.org/car-logos/tank-logo.png' },
  { key: 'dacia', url: 'https://www.carlogos.org/car-logos/dacia-logo-2021.png' },
  { key: 'cupra', url: 'https://www.carlogos.org/car-logos/cupra-logo.png' },
]

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath)
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.carlogos.org/'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        file.close()
        reject(new Error(`Status: ${res.statusCode}`))
        return
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', (err) => { file.close(); reject(err) })
  })
}

async function main() {
  for (const { key, url } of MISSING) {
    try {
      await download(url, join(OUTPUT_DIR, `${key}.png`))
      console.log(`✅ Fixed: ${key}`)
    } catch (e) {
      console.log(`❌ Failed: ${key} (${e.message})`)
    }
  }
}
main()
