/**
 * CLI command to import car data
 * Usage: npm run import:cars
 */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CarImporterService } from './car-importer.service';

async function bootstrap() {
  console.log('🔧 Bootstrapping NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const importer = app.get(CarImporterService);
  const result = await importer.importAll();

  console.log('\n══════════════════════════════════════');
  console.log('📊 Import Result:');
  console.log(`   Source:   ${result.source}`);
  console.log(`   Brands:   ${result.brands}`);
  console.log(`   Models:   ${result.models}`);
  console.log(`   Years:    ${result.years}`);
  console.log(`   Duration: ${result.durationMs}ms`);
  if (result.errors.length > 0) {
    console.log(`   Errors:   ${result.errors.length}`);
    result.errors.slice(0, 10).forEach((e) => console.log(`     - ${e}`));
  }
  console.log('══════════════════════════════════════\n');

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
