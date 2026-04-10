import { execSync } from 'child_process';
import path from 'path';

async function globalSetup() {
  console.log('\n🌱 Running seed before E2E tests...');
  try {
    execSync('npx tsx prisma/seed.ts', {
      cwd: path.resolve(__dirname, '../../../apps/api'),
      stdio: 'inherit',
    });
    console.log('✅ Seed complete\n');
  } catch {
    console.warn('⚠️ Seed failed (may already exist), continuing...\n');
  }
}

export default globalSetup;
