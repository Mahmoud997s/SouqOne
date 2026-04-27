/**
 * Download REAL logos for the 14 failed brands using Brandfetch CDN
 * Run: node scripts/fix-real-logos.mjs
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../apps/web/public/brands')

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Real logo sources for each failed brand - multiple fallback URLs
const FAILED_BRANDS = [
  {
    key: 'toyota',
    urls: [
      'https://cdn.brandfetch.io/toyota.com/w/512/h/512/logo?c=1idCVr0EWL7Y8EDnDlW',
      'https://logo.uplead.com/toyota.com',
      'https://img.logo.dev/toyota.com?token=pk_R2dJ79mJQaKnpPauPuSJ9A&size=512&format=png',
    ]
  },
  {
    key: 'nissan',
    urls: [
      'https://cdn.brandfetch.io/nissan.com/w/512/h/512/logo',
      'https://logo.uplead.com/nissan.com',
      'https://img.logo.dev/nissan.com?token=pk_R2dJ79mJQaKnpPauPuSJ9A&size=512&format=png',
    ]
  },
  {
    key: 'lexus',
    urls: [
      'https://cdn.brandfetch.io/lexus.com/w/512/h/512/logo',
      'https://logo.uplead.com/lexus.com',
    ]
  },
  {
    key: 'kia',
    urls: [
      'https://cdn.brandfetch.io/kia.com/w/512/h/512/logo',
      'https://logo.uplead.com/kia.com',
    ]
  },
  {
    key: 'byd',
    urls: [
      'https://cdn.brandfetch.io/byd.com/w/512/h/512/logo',
      'https://logo.uplead.com/byd.com',
      'https://cdn.brandfetch.io/bydauto.com/w/512/h/512/logo',
    ]
  },
  {
    key: 'jetour',
    urls: [
      'https://cdn.brandfetch.io/jetour.com/w/512/h/512/logo',
      'https://logo.uplead.com/jetour.com',
    ]
  },
  {
    key: 'tank',
    urls: [
      'https://cdn.brandfetch.io/tank300.com/w/512/h/512/logo',
      'https://logo.uplead.com/tank300.com',
    ]
  },
  {
    key: 'peugeot',
    urls: [
      'https://cdn.brandfetch.io/peugeot.com/w/512/h/512/logo',
      'https://logo.uplead.com/peugeot.com',
    ]
  },
  {
    key: 'renault',
    urls: [
      'https://cdn.brandfetch.io/renault.com/w/512/h/512/logo',
      'https://logo.uplead.com/renault.com',
    ]
  },
  {
    key: 'citroen',
    urls: [
      'https://cdn.brandfetch.io/citroen.com/w/512/h/512/logo',
      'https://logo.uplead.com/citroen.com',
    ]
  },
  {
    key: 'skoda',
    urls: [
      'https://cdn.brandfetch.io/skoda-auto.com/w/512/h/512/logo',
      'https://logo.uplead.com/skoda-auto.com',
      'https://cdn.brandfetch.io/skoda.com/w/512/h/512/logo',
    ]
  },
  {
    key: 'dacia',
    urls: [
      'https://cdn.brandfetch.io/dacia.com/w/512/h/512/logo',
      'https://logo.uplead.com/dacia.com',
    ]
  },
  {
    key: 'cupra',
    urls: [
      'https://cdn.brandfetch.io/cupraofficial.com/w/512/h/512/logo',
      'https://logo.uplead.com/cupraofficial.com',
      'https://cdn.brandfetch.io/cupra.com/w/512/h/512/logo',
    ]
  },
  {
    key: 'fuso',
    urls: [
      'https://cdn.brandfetch.io/mitsubishi-fuso.com/w/512/h/512/logo',
      'https://logo.uplead.com/mitsubishi-fuso.com',
    ]
  },
]

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath)

    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/png,image/webp,image/svg+xml,image/*,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'sec-fetch-dest': 'image',
        'sec-fetch-mode': 'no-cors',
      },
      timeout: 15000
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close()
        const redirect = response.headers.location
        if (redirect) {
          download(redirect, destPath).then(resolve).catch(reject)
        } else {
          reject(new Error('Redirect with no location'))
        }
        return
      }

      const contentType = response.headers['content-type'] || ''
      if (response.statusCode !== 200) {
        file.close()
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }

      // Check if it's actually an image
      if (contentType.includes('text/html') || contentType.includes('application/json')) {
        file.close()
        reject(new Error(`Not an image: ${contentType}`))
        return
      }

      response.pipe(file)
      file.on('finish', () => { file.close(); resolve({ contentType }) })
    })

    request.on('error', (err) => { file.close(); reject(err) })
    request.on('timeout', () => { request.destroy(); reject(new Error('Timeout')) })
  })
}

async function downloadWithFallback(key, urls) {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    // Determine extension from URL
    const ext = url.includes('.svg') ? 'svg' : 'png'
    const destPath = join(OUTPUT_DIR, `${key}.${ext}`)

    try {
      const result = await download(url, destPath)
      return { success: true, url, ext }
    } catch (err) {
      // try next
    }
    await new Promise(r => setTimeout(r, 300))
  }
  return { success: false }
}

async function main() {
  console.log(`\n🔧 Downloading REAL logos for ${FAILED_BRANDS.length} brands...\n`)

  const results = { success: [], failed: [] }

  for (const { key, urls } of FAILED_BRANDS) {
    const result = await downloadWithFallback(key, urls)
    if (result.success) {
      console.log(`  ✅ ${key}  (.${result.ext})`)
      results.success.push(key)
    } else {
      console.log(`  ❌ ${key} — all sources failed`)
      results.failed.push(key)
    }
  }

  console.log(`\n📊 Results:`)
  console.log(`  ✅ Downloaded: ${results.success.length}`)
  console.log(`  ❌ Failed: ${results.failed.length}`)
  if (results.failed.length) {
    console.log(`  ⚠️  Still missing: ${results.failed.join(', ')}`)
  }
  console.log('\n✅ Done!')
}

main().catch(console.error)
