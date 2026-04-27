/**
 * Targeted download for the user's provided PNGMart links
 * Run: node scripts/pngmart-fix.mjs
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../apps/web/public/brands')

const BRANDS = [
  { key: 'nissan',     url: 'https://www.pngmart.com/files/22/Cars-Logo-Brands-PNG-Isolated-Free-Download.png' },
  { key: 'kia',        url: 'https://www.pngmart.com/files/22/Cars-Logo-Brands-Transparent-Background.png' },
  { key: 'volkswagen', url: 'https://www.pngmart.com/files/22/Cars-Logo-Brands-PNG-Photo.png' },
  { key: 'lexus',      url: 'https://www.pngmart.com/files/22/Cars-Logo-Brands-PNG-Isolated-File.png' }
]

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath)
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.pngmart.com/'
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
  for (const { key, url } of BRANDS) {
    try {
      await download(url, join(OUTPUT_DIR, `${key}.png`))
      console.log(`✅ Fixed: ${key}`)
    } catch (e) {
      console.log(`❌ Failed: ${key} (${e.message})`)
    }
  }
}
main()
