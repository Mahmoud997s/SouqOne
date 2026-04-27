/**
 * Final fix for the last 4 missing brands using Clearbit/Brandfetch fallbacks
 * Run: node scripts/final-fix-v2.mjs
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../apps/web/public/brands')

const MISSING = [
  { key: 'skoda', url: 'https://logo.clearbit.com/skoda-auto.com' },
  { key: 'dacia', url: 'https://logo.clearbit.com/dacia.com' },
  { key: 'cupra', url: 'https://logo.clearbit.com/cupra.com' },
  { key: 'tank',  url: 'https://img.logo.dev/tank300.com?token=pk_R2dJ79mJQaKnpPauPuSJ9A&size=512' },
  { key: 'nissan', url: 'https://www.pngmart.com/files/22/Cars-Logo-Brands-PNG-Isolated-Free-Download.png' }
]

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath)
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }
    https.get(url, options, (res) => {
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
