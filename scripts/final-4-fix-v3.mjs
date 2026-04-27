/**
 * Final fix for the last 4 missing brands from Wikimedia
 * Run: node scripts/final-4-fix-v3.mjs
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../apps/web/public/brands')

const MISSING = [
  { key: 'skoda', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Skoda_logo_2022.svg/512px-Skoda_logo_2022.svg.png' },
  { key: 'dacia', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Dacia_Logo_2021.svg/512px-Dacia_Logo_2021.svg.png' },
  { key: 'cupra', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Cupra_logo.svg/512px-Cupra_logo.svg.png' },
  { key: 'tank',  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Tank_Motors_logo.svg/512px-Tank_Motors_logo.svg.png' }
]

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath)
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        download(res.headers.location, destPath).then(resolve).catch(reject)
        return
      }
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
