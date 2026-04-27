import fs from 'fs';
import path from 'path';

// List of all 80 brands in the platform
const BRANDS = [
  'Toyota', 'Nissan', 'Lexus', 'Honda', 'Hyundai', 'Kia', 'Ford', 'Chevrolet', 'GMC', 
  'Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Mitsubishi', 'Volkswagen', 'Mazda', 'Jeep', 
  'Dodge', 'Suzuki', 'Subaru', 'Land Rover', 'Cadillac', 'Lincoln', 'Infiniti', 'Acura', 
  'Volvo', 'Jaguar', 'Maserati', 'Ferrari', 'Lamborghini', 'Bentley', 'Rolls-Royce', 
  'Aston Martin', 'McLaren', 'Genesis', 'Daihatsu', 'Isuzu', 'Peugeot', 'Renault', 
  'Citroen', 'Skoda', 'MINI', 'Fiat', 'Alfa Romeo', 'Chrysler', 'Opel', 'Tesla', 'Changan', 
  'Chery', 'Geely', 'Haval', 'MG', 'BYD', 'GAC', 'Great Wall', 'Jetour', 'Tank', 'BAIC', 
  'Hongqi', 'Bestune', 'Maxus', 'Proton', 'Dacia', 'EXEED', 'OMODA', 'JAECOO', 'Zeekr', 
  'Lynk & Co', 'Forthing', 'JAC', 'Cupra', 'Polestar', 'Lotus', 'Smart', 'NIO', 'XPeng', 
  'Li Auto', 'Mahindra', 'SsangYong', 'RAM'
];

const OUTPUT_FILE = path.join(process.cwd(), 'apps/api/src/cars/data/seed-brands-v2.ts');

async function fetchModelsForMake(make) {
  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${make}?format=json`);
    const data = await res.json();
    if (data && data.Results) {
      // Filter out duplicate names
      const models = [...new Set(data.Results.map(r => r.Model_Name))];
      return models;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching models for ${make}:`, error);
    return [];
  }
}

async function generateSeedFile() {
  console.log('🚗 Starting massive data fetch from NHTSA API (Primary Source)...');
  
  let fileContent = `/**
 * تم التوليد التلقائي عبر NHTSA vPIC API (المصدر الأساسي)
 * Auto-generated via NHTSA vPIC API
 */

const y = (from: number, to = 2026) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const DEFAULT_YEARS = y(1980); // Defaulting to 1980-2026 for comprehensive coverage

export const SEED_BRANDS = [
`;

  for (const brand of BRANDS) {
    console.log(`Fetching models for: ${brand}...`);
    const models = await fetchModelsForMake(brand);
    
    fileContent += `  {
    name: '${brand}',
    nameAr: '${brand}', // Note: Manual Arabic mapping needed for new obscure models
    slug: '${brand.toLowerCase().replace(/\s+/g, '-')}',
    isPopular: false,
    models: [\n`;

    if (models.length === 0) {
      console.log(`⚠️ No models found in NHTSA for ${brand}.`);
    } else {
      for (const model of models) {
        // Escaping single quotes in model names
        const safeModelName = model.replace(/'/g, "\\'");
        fileContent += `      { name: '${safeModelName}', nameAr: '${safeModelName}', years: DEFAULT_YEARS },\n`;
      }
    }
    
    fileContent += `    ]
  },\n`;
    
    // Add a small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300)); 
  }

  fileContent += `];\n`;

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
  console.log(`✅ Successfully generated massive seed file at ${OUTPUT_FILE}`);
}

generateSeedFile();
