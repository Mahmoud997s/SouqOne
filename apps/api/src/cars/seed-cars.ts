/**
 * Standalone seed script — uses Prisma directly (no NestJS/Redis)
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
  console.log('🚗 Seeding car data...\n');
  const start = Date.now();

  let brandCount = 0;
  let modelCount = 0;
  let yearCount = 0;

  for (const seedBrand of SEED_BRANDS) {
    const brand = await prisma.brand.upsert({
      where: { slug: seedBrand.slug },
      create: { name: seedBrand.name, nameAr: seedBrand.nameAr, slug: seedBrand.slug, isPopular: seedBrand.isPopular },
      update: { name: seedBrand.name, nameAr: seedBrand.nameAr, isPopular: seedBrand.isPopular },
    });
    brandCount++;

    for (const seedModel of seedBrand.models) {
      const slug = toSlug(seedModel.name);
      const carModel = await prisma.carModel.upsert({
        where: { name_brandId: { name: seedModel.name, brandId: brand.id } },
        create: { name: seedModel.name, nameAr: seedModel.nameAr, slug, brandId: brand.id },
        update: { nameAr: seedModel.nameAr, slug },
      });
      modelCount++;

      for (const year of seedModel.years) {
        await prisma.carYear.upsert({
          where: { year_modelId: { year, modelId: carModel.id } },
          create: { year, modelId: carModel.id },
          update: {},
        });
        yearCount++;
      }
    }

    process.stdout.write(`  ✓ ${seedBrand.name} (${seedBrand.models.length} models)\n`);
  }

  const duration = Date.now() - start;

  console.log('\n══════════════════════════════════════');
  console.log(`✅ Seed complete in ${duration}ms`);
  console.log(`   Brands: ${brandCount}`);
  console.log(`   Models: ${modelCount}`);
  console.log(`   Years:  ${yearCount}`);
  console.log('══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
