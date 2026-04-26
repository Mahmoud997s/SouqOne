/**
 * Standalone seed script — uses Prisma directly (no NestJS/Redis)
 * Optimized: bulk inserts via createMany + transaction (~5 seconds vs minutes)
 * Usage: npx ts-node src/cars/seed-cars.ts
 */
import { PrismaClient } from '@prisma/client';
import { SEED_BRANDS } from './data/seed-brands-v2';

const prisma = new PrismaClient();

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log('🚗 Seeding car data (optimized)...\n');
  const start = Date.now();

  // ── Step 1: Clear old data in one transaction ──
  console.log('🗑️  Clearing existing data...');
  await prisma.$transaction([
    prisma.carYear.deleteMany(),
    prisma.carModel.deleteMany(),
    prisma.brand.deleteMany(),
  ]);
  console.log('   ✓ Old data cleared\n');

  let totalModels = 0;
  let totalYears = 0;

  // ── Step 2: Create brands one-by-one (42 only — fast) ──
  for (const seedBrand of SEED_BRANDS) {
    const brand = await prisma.brand.create({
      data: {
        name: seedBrand.name,
        nameAr: seedBrand.nameAr,
        slug: seedBrand.slug,
        isPopular: seedBrand.isPopular,
      },
    });

    // ── Step 3: Bulk-create all models for this brand ──
    await prisma.carModel.createMany({
      data: seedBrand.models.map((m) => ({
        name: m.name,
        nameAr: m.nameAr,
        slug: toSlug(m.name),
        brandId: brand.id,
      })),
    });
    totalModels += seedBrand.models.length;

    // ── Step 4: Fetch model IDs back, then bulk-create years ──
    const dbModels = await prisma.carModel.findMany({
      where: { brandId: brand.id },
      select: { id: true, name: true },
    });

    const modelIdMap = new Map(dbModels.map((m) => [m.name, m.id]));

    const yearRows: { year: number; modelId: string }[] = [];
    for (const seedModel of seedBrand.models) {
      const modelId = modelIdMap.get(seedModel.name);
      if (!modelId) continue;
      for (const yr of seedModel.years) {
        yearRows.push({ year: yr, modelId });
      }
    }

    // Batch years in chunks of 1000 to avoid query-size limits
    const CHUNK = 1000;
    for (let i = 0; i < yearRows.length; i += CHUNK) {
      await prisma.carYear.createMany({
        data: yearRows.slice(i, i + CHUNK),
      });
    }
    totalYears += yearRows.length;

    process.stdout.write(`  ✓ ${seedBrand.name} (${seedBrand.models.length} models, ${yearRows.length} years)\n`);
  }

  const duration = Date.now() - start;

  console.log('\n══════════════════════════════════════');
  console.log(`✅ Seed complete in ${(duration / 1000).toFixed(1)}s`);
  console.log(`   Brands: ${SEED_BRANDS.length}`);
  console.log(`   Models: ${totalModels}`);
  console.log(`   Years:  ${totalYears}`);
  console.log('══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
