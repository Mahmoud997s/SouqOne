/**
 * Fix failed brand logos with alternative URLs
 * Run: node scripts/fix-failed-logos.mjs
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../apps/web/public/brands')

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Alternative URLs for the 14 failed brands
const FAILED_LOGOS = [
  {
    key: 'toyota',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Toyota.svg/512px-Toyota.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/512px-Toyota_carlogo.svg.png',
    ]
  },
  {
    key: 'nissan',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_2020_logo.svg/512px-Nissan_2020_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/2/20/Nissan_2020_logo.png',
    ]
  },
  {
    key: 'lexus',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Lexus_division_logo.svg/512px-Lexus_division_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/d/d1/Lexus_division_logo.svg',
    ]
  },
  {
    key: 'kia',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia-logo.png/640px-Kia-logo.png',
      'https://upload.wikimedia.org/wikipedia/commons/1/13/Kia-logo.png',
    ]
  },
  {
    key: 'byd',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/BYD_logo_2022.svg/512px-BYD_logo_2022.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/BYD_logo_2022.svg/256px-BYD_logo_2022.svg.png',
    ]
  },
  {
    key: 'jetour',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Jetour_logo.svg/512px-Jetour_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2023/04/Jetour-Logo.png',
    ]
  },
  {
    key: 'tank',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Tank_Motors_logo.svg/512px-Tank_Motors_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2023/04/Tank-Logo.png',
    ]
  },
  {
    key: 'peugeot',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Peugeot_Logo_2021.svg/512px-Peugeot_Logo_2021.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/a/a1/Peugeot_Logo_2021.svg',
    ]
  },
  {
    key: 'renault',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Renault_2021_logo.svg/512px-Renault_2021_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Renault_2009_logo.svg/512px-Renault_2009_logo.svg.png',
    ]
  },
  {
    key: 'citroen',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Citroen_logo_2022.svg/512px-Citroen_logo_2022.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Citroen_logo_2022.svg/256px-Citroen_logo_2022.svg.png',
    ]
  },
  {
    key: 'skoda',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Skoda_logo_2022.svg/512px-Skoda_logo_2022.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Skoda_logo_2022.svg/256px-Skoda_logo_2022.svg.png',
    ]
  },
  {
    key: 'dacia',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Dacia_Logo_2021.svg/512px-Dacia_Logo_2021.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Dacia_Logo_2021.svg/256px-Dacia_Logo_2021.svg.png',
    ]
  },
  {
    key: 'cupra',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Cupra_logo.svg/512px-Cupra_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Cupra_logo.svg/256px-Cupra_logo.svg.png',
    ]
  },
  {
    key: 'fuso',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mitsubishi_Fuso_logo.svg/512px-Mitsubishi_Fuso_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Fuso_trucks_logo.svg/512px-Fuso_trucks_logo.svg.png',
    ]
  },
]

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const file = createWriteStream(destPath)

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
        'Accept': 'image/png,image/svg+xml,image/*,*/*',
      },
      timeout: 15000
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

async function downloadWithFallback(key, urls) {
  const destPath = join(OUTPUT_DIR, `${key}.png`)
  for (const url of urls) {
    try {
      await download(url, destPath)
      return { success: true, url }
    } catch (err) {
      // try next URL
    }
    await new Promise(r => setTimeout(r, 200))
  }
  return { success: false }
}

async function main() {
  console.log(`\n🔧 Fixing ${FAILED_LOGOS.length} failed brand logos...\n`)
  const results = { success: [], failed: [] }

  for (const { key, urls } of FAILED_LOGOS) {
    const result = await downloadWithFallback(key, urls)
    if (result.success) {
      console.log(`  ✅ ${key}  ← ${result.url}`)
      results.success.push(key)
    } else {
      console.log(`  ❌ ${key} — all URLs failed`)
      results.failed.push(key)
    }
  }

  console.log(`\n📊 Results:`)
  console.log(`  ✅ Fixed:  ${results.success.length}`)
  console.log(`  ❌ Still failed: ${results.failed.length}`)
  if (results.failed.length > 0) {
    console.log(`  ⚠️  Still missing: ${results.failed.join(', ')}`)
  }
  console.log(`\n✨ Done! Run your dev server and all logos should appear correctly.`)
}

main().catch(console.error)
