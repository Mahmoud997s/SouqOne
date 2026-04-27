const fs = require('fs');
const path = require('path');

const SEED_FILE_PATH = path.join(process.cwd(), 'apps/api/src/cars/data/seed-brands-v2.ts');
const OVERRIDES_PATH = path.join(process.cwd(), 'scripts/gulf-car-data.json');

function mergeData() {
  console.log('🔄 Merging NHTSA Global Data with Gulf/Chinese Regional Overrides...');

  // Read the files
  let seedContent = fs.readFileSync(SEED_FILE_PATH, 'utf-8');
  const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8'));

  let totalInjected = 0;

  // Loop through overrides and inject them into the empty arrays of the TS file
  for (const [brand, models] of Object.entries(overrides)) {
    
    // Construct the replacement string
    let replacementModels = '';
    for (const model of models) {
      // Create exact year array for the injected models
      replacementModels += `      { name: '${model.name}', nameAr: '${model.nameAr}', years: y(${model.years[0]}, ${model.years[1]}) },\n`;
      totalInjected++;
    }

    // Regex to find the empty models array for the specific brand
    // Looking for: name: 'Brand', ... models: [\n    ]
    const regex = new RegExp(`name:\\s*'${brand}'[\\s\\S]*?models:\\s*\\[\\s*\\]`, 'g');
    
    const match = seedContent.match(regex);
    if (match) {
      // Replace the empty brackets with the new models
      const updatedBlock = match[0].replace(/models:\s*\[\s*\]/, `models: [\n${replacementModels}    ]`);
      seedContent = seedContent.replace(match[0], updatedBlock);
      console.log(`✅ Injected ${models.length} models for ${brand}`);
    } else {
      console.log(`⚠️ Could not find empty models block for ${brand}. It might already have data.`);
    }
  }

  // Write the final merged content back to the file
  fs.writeFileSync(SEED_FILE_PATH, seedContent, 'utf-8');
  console.log(`\n🎉 Success! Merged ${totalInjected} regional models into the global database.`);
}

mergeData();
