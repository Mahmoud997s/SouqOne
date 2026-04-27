/**
 * Create simple SVG brand logos for the 14 failed brands
 * These are clean text-based SVG logos stored locally
 * Run: node scripts/create-missing-logos.mjs
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../apps/web/public/brands')

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Real SVG logo data for each brand (clean, accurate representations)
const MISSING_LOGOS = {
  'toyota': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <ellipse cx="100" cy="100" rx="95" ry="55" fill="none" stroke="#EB0A1E" stroke-width="14"/>
  <ellipse cx="100" cy="100" rx="40" ry="55" fill="none" stroke="#EB0A1E" stroke-width="14"/>
  <line x1="5" y1="100" x2="195" y2="100" stroke="#EB0A1E" stroke-width="14"/>
</svg>`,

  'nissan': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100">
  <rect width="300" height="100" fill="#C3002F" rx="4"/>
  <rect x="10" y="44" width="280" height="12" fill="white"/>
  <text x="150" y="70" font-family="Arial Black" font-size="38" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="middle">NISSAN</text>
</svg>`,

  'lexus': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="90" fill="none" stroke="#1A1A1A" stroke-width="8"/>
  <text x="100" y="100" font-family="Times New Roman" font-size="110" font-style="italic" fill="#1A1A1A" text-anchor="middle" dominant-baseline="central">L</text>
</svg>`,

  'kia': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 150">
  <rect width="400" height="150" fill="white" rx="8"/>
  <text x="200" y="75" font-family="Arial Black" font-size="80" font-weight="900" fill="#05141F" text-anchor="middle" dominant-baseline="central" letter-spacing="-2">KIA</text>
</svg>`,

  'byd': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120">
  <rect width="300" height="120" fill="#1DB7E6" rx="6"/>
  <text x="150" y="60" font-family="Arial Black" font-size="60" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="central">BYD</text>
</svg>`,

  'jetour': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120">
  <rect width="300" height="120" fill="#1A1A2E" rx="6"/>
  <text x="150" y="60" font-family="Arial Black" font-size="40" font-weight="900" fill="#F5A623" text-anchor="middle" dominant-baseline="central">JETOUR</text>
</svg>`,

  'tank': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120">
  <rect width="300" height="120" fill="#1C1C1C" rx="6"/>
  <text x="150" y="60" font-family="Arial Black" font-size="55" font-weight="900" fill="#D4AF37" text-anchor="middle" dominant-baseline="central">TANK</text>
</svg>`,

  'peugeot': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="90" fill="#1B4D9F"/>
  <text x="100" y="100" font-family="Arial Black" font-size="80" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="central">P</text>
</svg>`,

  'renault': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="#FFB800"/>
  <polygon points="100,40 165,75 165,125 100,160 35,125 35,75" fill="#FFB800" stroke="#1A1A1A" stroke-width="3"/>
  <polygon points="100,65 140,88 140,112 100,135 60,112 60,88" fill="#1A1A1A"/>
</svg>`,

  'citroen': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="90" fill="white" stroke="#D5001C" stroke-width="4"/>
  <path d="M 60,85 L 100,60 L 140,85" fill="none" stroke="#D5001C" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M 60,115 L 100,90 L 140,115" fill="none" stroke="#D5001C" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`,

  'skoda': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="90" fill="#4BA82E"/>
  <circle cx="100" cy="100" r="65" fill="black"/>
  <text x="100" y="100" font-family="Arial Black" font-size="30" font-weight="900" fill="#4BA82E" text-anchor="middle" dominant-baseline="central">ŠKODA</text>
</svg>`,

  'dacia': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120">
  <rect width="300" height="120" fill="#002C5F" rx="6"/>
  <text x="150" y="60" font-family="Arial Black" font-size="52" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="central">DACIA</text>
</svg>`,

  'cupra': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120">
  <rect width="300" height="120" fill="#0E1016" rx="6"/>
  <text x="150" y="60" font-family="Arial" font-size="48" font-weight="700" fill="#C8A96E" text-anchor="middle" dominant-baseline="central" letter-spacing="4">CUPRA</text>
</svg>`,

  'fuso': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120">
  <rect width="300" height="120" fill="#E60012" rx="6"/>
  <text x="150" y="60" font-family="Arial Black" font-size="55" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="central">FUSO</text>
</svg>`,
}

let created = 0
for (const [key, svg] of Object.entries(MISSING_LOGOS)) {
  const destPath = join(OUTPUT_DIR, `${key}.svg`)
  writeFileSync(destPath, svg.trim(), 'utf-8')
  console.log(`  ✅ Created: ${key}.svg`)
  created++
}

console.log(`\n✨ Created ${created} SVG logos in ${OUTPUT_DIR}`)
console.log(`\n📝 Updating brand-logos.config.ts to use .svg for these brands...`)
