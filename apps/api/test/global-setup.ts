/**
 * Jest Global Setup — runs ONCE before all test suites.
 * Ensures the test database schema is up-to-date via `prisma db push`.
 *
 * Prerequisites:
 *   1. Docker postgres is running (docker-compose up -d)
 *   2. Test database exists (create manually or via docker exec)
 *   3. .env.test has the correct DATABASE_URL pointing to carOne_test
 */
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load test env
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test'), override: true });

const DATABASE_URL = process.env.DATABASE_URL!;
const dbName = DATABASE_URL.substring(DATABASE_URL.lastIndexOf('/') + 1).split('?')[0];
const apiDir = path.resolve(__dirname, '..');
const envPath = path.join(apiDir, '.env');

export default async function globalSetup() {
  console.log(`\n🧪 Test Environment Setup`);
  console.log(`   Database: ${dbName}`);
  console.log(`   URL: ${DATABASE_URL.replace(/\/\/.*@/, '//***@')}`);

  // Prisma CLI auto-loads .env and overrides process.env DATABASE_URL.
  // Temporarily back up .env and write test DATABASE_URL so Prisma uses it.
  let envBackup: string | null = null;
  if (fs.existsSync(envPath)) {
    envBackup = fs.readFileSync(envPath, 'utf-8');
  }

  // Push schema to test database (fast if already in sync)
  try {
    fs.writeFileSync(envPath, `DATABASE_URL="${DATABASE_URL}"\n`);
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: apiDir,
      stdio: 'pipe',
    });
    console.log(`   ✔ Schema synced`);
  } catch (err: any) {
    const stderr = err.stderr?.toString() || '';
    // If the database doesn't exist, give a clear error
    if (stderr.includes('does not exist')) {
      console.error(`\n   ✖ Database "${dbName}" does not exist!`);
      console.error(`   Run: docker exec carone-postgres psql -U postgres -c "CREATE DATABASE ${dbName}"`);
      console.error(`   Then re-run tests.\n`);
    } else {
      console.error(`   ✖ Schema push failed:`, stderr || err.message);
    }
    throw err;
  } finally {
    // Restore original .env
    if (envBackup !== null) {
      fs.writeFileSync(envPath, envBackup);
    } else {
      // No original .env existed — remove the temp one
      if (fs.existsSync(envPath)) fs.unlinkSync(envPath);
    }
  }

  console.log(`   ✔ Test environment ready\n`);
}
