/**
 * Fix remaining 6 brand logos using Wikimedia Special:FilePath API
 * Run: node scripts/fix-last-6-logos.mjs
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../apps/web/public/brands')

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

// Wikimedia Special:FilePath gives direct file redirect - very reliable
const LAST_6 = [
  {
    key: 'nissan',
    urls: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Nissan_2020_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/8/8c/Nissan_2020_logo.svg',
      'https://cdn.brandfetch.io/nissanusa.com/w/512/h/512/logo',
      'https://cdn.brandfetch.io/nissan-global.com/w/512/h/512/logo',
    ]
  },
  {
    key: 'jetour',
    urls: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Jetour_Auto_logo.svg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Jetour_logo.svg',
      'https://cdn.brandfetch.io/jetourmotor.com/w/512/h/512/logo',
      'https://cdn.brandfetch.io/jetour-auto.com/w/512/h/512/logo',
    ]
  },
  {
    key: 'tank',
    urls: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Tank_Motors_logo.svg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Tank_logo.svg',
      'https://cdn.brandfetch.io/tanksuv.com/w/512/h/512/logo',
      'https://cdn.brandfetch.io/tank-motor.com/w/512/h/512/logo',
    ]
  },
  {
    key: 'skoda',
    urls: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Skoda_logo_2022.svg',
      'https://upload.wikimedia.org/wikipedia/commons/b/b1/Skoda_logo_2022.svg',
      'https://cdn.brandfetch.io/skoda.com/w/512/h/512/logo',
      'https://cdn.brandfetch.io/skoda.cz/w/512/h/512/logo',
    ]
  },
  {
    key: 'dacia',
    urls: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Dacia_Logo_2021.svg',
      'https://upload.wikimedia.org/wikipedia/commons/f/f6/Dacia_Logo_2021.svg',
      'https://cdn.brandfetch.io/dacia.ro/w/512/h/512/logo',
      'https://cdn.brandfetch.io/dacia.co.uk/w/512/h/512/logo',
    ]
  },
  {
    key: 'cupra',
    urls: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Cupra_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/c/ca/Cupra_logo.svg',
      'https://cdn.brandfetch.io/cupraofficial.com/w/512/h/512/logo',
      'https://cdn.brandfetch.io/cupra.es/w/512/h/512/logo',
    ]
  },
]

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath)

    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/svg+xml,image/png,image/webp,image/*,*/*',
        'Referer': 'https://www.google.com/',
      },
      timeout: 15000
    }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        file.close()
        const loc = response.headers.location
        if (loc) {
          const absUrl = loc.startsWith('http') ? loc : `https://commons.wikimedia.org${loc}`
          download(absUrl, destPath).then(resolve).catch(reject)
        } else {
          reject(new Error('Redirect no location'))
        }
        return
      }
      if (response.statusCode !== 200) {
        file.close()
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      const ct = response.headers['content-type'] || ''
      if (ct.includes('text/html')) {
        file.close()
        reject(new Error(`Got HTML instead of image`))
        return
      }
      response.pipe(file)
      file.on('finish', () => { file.close(); resolve(ct) })
    })

    request.on('error', err => { file.close(); reject(err) })
    request.on('timeout', () => { request.destroy(); reject(new Error('Timeout')) })
  })
}

async function downloadWithFallback(key, urls) {
  for (const url of urls) {
    const isSvg = url.endsWith('.svg') || url.includes('FilePath') || url.includes('.svg')
    const ext = isSvg ? 'svg' : 'png'
    const destPath = join(OUTPUT_DIR, `${key}.${ext}`)

    try {
      const ct = await download(url, destPath)
      const finalExt = (ct.includes('svg')) ? 'svg' : ext
      return { success: true, url, ext: finalExt }
    } catch (err) {
      // try next
    }
    await new Promise(r => setTimeout(r, 400))
  }
  return { success: false }
}

async function main() {
  console.log('\n🔧 Fixing last 6 brand logos...\n')
  const results = { success: [], failed: [] }

  for (const { key, urls } of LAST_6) {
    const r = await downloadWithFallback(key, urls)
    if (r.success) {
      console.log(`  ✅ ${key}  (.${r.ext})  ← ${r.url}`)
      results.success.push({ key, ext: r.ext })
    } else {
      console.log(`  ❌ ${key} — all sources failed`)
      results.failed.push(key)
    }
  }

  console.log(`\n📊 Results: ✅ ${results.success.length}  ❌ ${results.failed.length}`)
  if (results.failed.length) {
    console.log(`⚠️  Still missing: ${results.failed.join(', ')}`)
  }
  console.log('\n✅ Done!')
}

main().catch(console.error)
